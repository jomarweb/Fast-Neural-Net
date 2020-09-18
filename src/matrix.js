var return_v = false;
var v_val = 0.0;
var gaussRandom = function () {
  if (return_v) {
    return_v = false;
    return v_val;
  }
  var u = 2 * Math.random() - 1;
  var v = 2 * Math.random() - 1;
  var r = u * u + v * v;
  if (r == 0 || r > 1) return gaussRandom();
  var c = Math.sqrt(-2 * Math.log(r) / r);
  v_val = v * c; // cache this
  return_v = true;
  return u * c;
}

class Matrix {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.data = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(0));
  }

  addValue(i) {

    this.data = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(i));

    return this;

  }


  copy() {
    let m = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        m.data[i][j] = this.data[i][j];
      }
    }
    return m;
  }

  static fromArray(arr) {
    return new Matrix(arr.length, 1).map((e, i) => arr[i]);
  }

  static subtract(a, b) {
    if (a.rows !== b.rows || a.cols !== b.cols) {
      console.log(
        "sub Columns and Rows of A must match Columns and Rows of B."
      );
      return;
    }

    // Return a new Matrix a-b
    return new Matrix(a.rows, a.cols).map(
      (_, i, j) => {

        return a.data[i][j] - b.data[i][j]
      }
    );
  }


  static subtract(a, b) {
    if (a.rows !== b.rows || a.cols !== b.cols) {
      console.log(
        "sub Columns and Rows of A must match Columns and Rows of B."
      );
      return;
    }

    // Return a new Matrix a-b
    return new Matrix(a.rows, a.cols).map(
      (_, i, j) => {
        return a.data[i][j] - b.data[i][j];
      }
    );
  }


  static CrossEntropy(a, b) {

    if (a.rows !== b.rows || a.cols !== b.cols) {
      console.log(
        "sub Columns and Rows of A must match Columns and Rows of B."
      );
      return;
    }

    const mtx = new Matrix(a.rows, a.cols);
  
    a = a.data.map(x=> x[0]);
    b = b.data.map(x=> x[0]);

    var log = -Math.log(a[b.indexOf(Math.max(...b))])

    var err = new Array(b.length).fill(0);
    err[b.indexOf(Math.max(...b))] = log;
   
    mtx.data = err.map(x=>[x]);

    return mtx;


  }


  static se(a, b) {
    if (a.rows !== b.rows || a.cols !== b.cols) {
      console.log(
        "sub Columns and Rows of A must match Columns and Rows of B."
      );
      return;
    }

    // Return a new Matrix a-b
    return new Matrix(a.rows, a.cols).map(
      (_, i, j) => (a.data[i][j] - b.data[i][j]) ** 2
    );
  }

  toArray() {
    let arr = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        arr.push(this.data[i][j]);
      }
    }
    return arr;
  }



  randomize() {
    return this.map((e) => Math.random() * 2 - 1);
  }

  randomizeNorm(mu, std) {

    return this.map((e) => gaussRandom());
  }

  add(n) {
    if (n instanceof Matrix) {
      if (this.rows !== n.rows || this.cols !== n.cols) {
        console.log(
          "add Columns and Rows of A must match Columns and Rows of B."
        );
        return;
      }
      return this.map((e, i, j) => e + n.data[i][j]);
    }
  }

  static transpose(matrix) {
    return new Matrix(matrix.cols, matrix.rows).map(
      (_, i, j) => matrix.data[j][i]
    );
  }

  static multiply(a, b) {
    // Matrix product
    if (a.cols !== b.rows) {
      console.log("Columns of A must match rows of B.");
      return;
    }

    return new Matrix(a.rows, b.cols).map((e, i, j) => {
      // Dot product of values in col
      let sum = 0;
      for (let k = 0; k < a.cols; k++) {
        sum += a.data[i][k] * b.data[k][j];
      }
      return sum;
    });
  }

  multiply(n) {
    if (n instanceof Matrix) {
      if (this.rows !== n.rows || this.cols !== n.cols) {
        console.log(
          "smultiply Columns and Rows of A must match Columns and Rows of B."
        );
        return;
      }

      // hadamard product
      return this.map((e, i, j) => e * n.data[i][j]);
    } else {
      // Scalar product
      return this.map((e) => e * n);
    }
  }

  map(func, confg) {
    // Apply a function to every element of matrix
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let val = this.data[i][j];
        let ho = func(val, i, j);

        this.data[i][j] = ho;
      }
    }
    return this;
  }

  static map(matrix, func) {
    // Apply a function to every element of matrix
    return new Matrix(matrix.rows, matrix.cols).map((e, i, j) =>
      func(matrix.data[i][j], i, j)
    );
  }

  print() {
    console.table(this.data);
    return this;
  }

  serialize() {
    return JSON.stringify(this);
  }

  static deserialize(data) {
    if (typeof data == "string") {
      data = JSON.parse(data);
    }
    let matrix = new Matrix(data.rows, data.cols);
    matrix.data = data.data;
    return matrix;
  }
}

if (typeof module !== "undefined") {
  module.exports = Matrix;
}
