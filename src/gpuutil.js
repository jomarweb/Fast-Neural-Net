var __GPU = new GPU();

const layerCompute = __GPU.createKernel(function (_i, _h, _b, _h_cols) {
    let sum = _b[this.thread.y][this.thread.x];
    for (let i = 0; i < _h_cols; i++) {
        sum += _i[this.thread.z][i][this.thread.x] * _h[this.thread.y][i];
    }
    sum = Math.max(0, sum);
    return sum;
}).setDynamicOutput(true);