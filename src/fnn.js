class FastNeuralNetwork {

    constructor(nodes) {
        this.__gpu = new GPU();
        this.LearningRate = 0.001;
        this.layers = [];
        this.bias = [];
        this.nodes = nodes;
        this.layeroutputs = [];

        for (var i = 0; i < nodes.length - 1; i++) {
            var w = new Matrix(nodes[i + 1], nodes[i]);
            w.randomize();
            this.layers.push(w);
            var b = new Matrix(nodes[i + 1], 1);
            b.randomize();
            this.bias.push(b);
        }
    }

    predict(inputs) {

        var __hlayer__ = this.layers[0];
        var __olayer__ = this.layers[1];
        var __depth__ = inputs.length;
        var __hlayer_bias__ = this.bias[0];
        var __olayer_bias__ = this.bias[1];

        const argMax =  this.__gpu.createKernel(function (_i,_rows) {
            let y = 0,max=0;
            for(let i=0;i<_rows;i++){

                if(max < _i[this.thread.y][i][0]){
                    max = _i[this.thread.y][i][0];
                    y=i;
                }

            }
         
            return y;
        }).setOutput([1, __depth__]);

        const sfmxReduce = this.__gpu.createKernel(function (_i, mp, _o_rows) {
            let sum = 0;
            let d = 0;
            let thisMpValue = mp[this.thread.z][0][0];
            for (let i = 0; i < _o_rows; i++) {
                for (let j = 0; j < 1; j++) {
                    d += Math.exp(_i[this.thread.z][i][j] - thisMpValue);
                }
            }
            sum = Math.exp(_i[this.thread.z][this.thread.y][this.thread.x] - thisMpValue) / d;
            return sum;
        }).setPipeline(true).setOutput([1, __olayer__.rows, __depth__]);

        const sfmxMaxPoint = this.__gpu.createKernel(function (_i, _o_rows) {
            let sum = 0;
            let mp = 0;
            for (let i = 0; i < _o_rows; i++) {
                let thisValue = _i[this.thread.z][i][0];
                if (thisValue > mp) {
                    mp = thisValue;
                }
            }
            sum = mp;
            return sum;
        }).setPipeline(true).setOutput([1, 1, __depth__]);

        const hLayerCompute = this.__gpu.createKernel(function (_i, _h, _b, _h_cols) {
            let sum = _b[this.thread.y][this.thread.x];
            for (let i = 0; i < _h_cols; i++) {
                sum += _i[this.thread.z][i][this.thread.x] * _h[this.thread.y][i];
            }
            sum = Math.max(0, sum);
            return sum;
        }).setPipeline(true).setOutput([1, __hlayer__.rows, __depth__]);

        const oLayerCompute = this.__gpu.createKernel(function (_i, _h, _b, _h_cols) {
            let sum = _b[this.thread.y][this.thread.x];
            for (let i = 0; i < _h_cols; i++) {
                sum += _i[this.thread.z][i][this.thread.x] * _h[this.thread.y][i];
            }
           
            return sum;
        }).setPipeline(true).setOutput([1, __olayer__.rows, __depth__]);

        const kernelProc = this.__gpu.combineKernels(hLayerCompute, oLayerCompute,sfmxMaxPoint,sfmxReduce,argMax, 
            function(_i, _h, _b, _h_cols, _o_h, _o_b, _o_h_cols,_o_h_rows) {      
            var h_output = hLayerCompute(_i, _h, _b, _h_cols);
            var o_output = oLayerCompute(h_output, _o_h, _o_b,_o_h_cols);
            var mp = (sfmxMaxPoint(o_output, _o_h_rows));
            return argMax(sfmxReduce(o_output,mp,_o_h_rows),_o_h_rows);

        });

        var predictions =  kernelProc(inputs, __hlayer__.data, __hlayer_bias__.data, __hlayer__.cols, __olayer__.data, __olayer_bias__.data, __olayer__.cols,__olayer__.rows);

        //destroy all kernels
        hLayerCompute.destroy();
        oLayerCompute.destroy();
        sfmxMaxPoint.destroy();
        sfmxReduce.destroy();

        return predictions;

    }


    load(NeuralData) {
        for (var i = 0; i < NeuralData.layers.length; i++) {
            this.layers[i].data = NeuralData.layers[i].data;
        }
        for (var i = 0; i < NeuralData.bias.length; i++) {
            this.bias[i].data = NeuralData.bias[i].data;
        }
    }

    to3dTensor(inputs) {
        const conversion = this.__gpu.createKernel(function (_i) {
            let y = 0;
            y = _i[this.thread.z][this.thread.y];
            return y;
        }).setOutput([1, inputs[0].length, inputs.length]);
        return conversion(inputs);

    }


}