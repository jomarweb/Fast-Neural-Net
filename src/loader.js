//created by jomar bagaporo

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

class Loader {
  constructor(_ds) {
    this.ds = _ds;
    this.inputLen = 0;
  }

    prepareData(config) {
        console.log('preparing.')
    this.ds = this.ds.filter((x) => x[config.className] != null);

    var output = [];
    var keytreenames = config.className.split(".");
    var excluded = config.excluded || [];
    excluded.push(keytreenames[0]);

    this.ds.forEach((data) => {
      var nData = {},
        treevalue = data[keytreenames[0]];
      keytreenames.slice(1, keytreenames.length).forEach((key) => {
        treevalue = treevalue[key];
      });
      nData.Label = treevalue;
      if (!config.ignoreFeature) {
        var featureData = [];
        var featurekeys = Object.keys(data);
        for (var fIndex in featurekeys) {
          var feature = featurekeys[fIndex];
          if (
            excluded.filter((x) => {
              return x == feature;
            }).length >
              0 ==
            false
          ) {
           
            if (config.normalize)
              featureData.push((data[feature] - 0) / (2000 - 0));
            else featureData.push(data[feature]);
          }
        }

        nData.Feature = featureData;
      } else {
        nData.Feature = data.Feature;
      }
      excluded.map(function (x) {
        nData[x] = data[x];
      });
      output.push(nData);
    });

    var _classes = output.map(function (x) {
      return x.Label;
    });
    _classes = [...new Set(_classes)];
    console.log('class loaded')
    output.forEach(function (data) {
      data.LabelName = data.Label;
      data.Label = new Array(_classes.length).fill(0).map(function (x, i) {
        return i == _classes.indexOf(data.Label) ? [1] : [x];
      });
    });
      this.classes = _classes;

    

    return output;
  }

    makeValidationData(_ds, percentage) {
        console.log('making validation...')
    var trainData = [],
      testData = [];

    this.classes.forEach(function (_class) {
      var classArray = _ds.filter(function (x) {
        return x.LabelName == _class;
      });
      var testCount = Math.round((classArray.length * percentage) / 100);
      var trainCount = classArray.length - testCount;

      trainData = trainData.concat(classArray.slice(0, trainCount));
      testData = testData.concat(
        classArray.slice(trainCount, trainCount + testCount)
      );
    });

    return {
        trainDs: shuffle(shuffle(trainData)),
        testDs: shuffle(shuffle(testData)),
    };
  }

    mixed(_ds) {
        var output = [],dsByClasses=[];

        this.classes.forEach(function (_class) {
            dsByClasses.push(_ds.filter(function (x) {
                return x.LabelName == _class;
            }));
            
        });


        
        var cIndex = 0;
        for (let h = 0; h < _ds.length; h++) {
          for (let i = 0; i < dsByClasses.length; i++) {
         
           if(dsByClasses[i][h]) {
            output.push(dsByClasses[i][h])
           }
            
          }
          
        }
       
     
        return output;
    }

    makeBatch(_ds,size) {
        var output = [],dsByClasses=[];

        this.classes.forEach(function (_class) {
            dsByClasses.push(_ds.filter(function (x) {
                return x.LabelName == _class;
            }));
            
        });


        
        
        var bIndex = 0;
        for (var i = 0; i < 50; i++) {
          

            dsByClasses.forEach((x) => {
                if (output[bIndex] == null) {
                    output[bIndex] = [];
                }
                if (x[i]) {
                  
                    output[bIndex].push(JSON.parse(JSON.stringify(x[i])));
                }

                bIndex++;

                if (bIndex >= (size)) {
                    bIndex = 0;
                   
                }

                
            });   
       
        }

        return output;
    }

  testDataSet(_ds) {
    var similarCount = 0,
      testHitArray = [];
    _ds.testDs.forEach(function (tData, index) {
      if (
        _ds.trainDs.filter(function (x) {
          return JSON.stringify(x.Feature) == JSON.stringify(tData.Feature);
        }).length > 0
      ) {
        similarCount++;
        testHitArray.push(index);
      }
    });

    console.log(
      "similar " +
        similarCount +
        " test record indexe(s): " +
        testHitArray.join(",")
    );
  }
}
