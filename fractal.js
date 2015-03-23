(function(window) {
  var sin = Math.sin;
  var cos = Math.cos;

  function matrixMultiply(matrices) {
    var R = identityMatrix();
    for (var i = 0; i < matrices.length; ++i) {
      var A = new Float32Array(R);
      var B = matrices[i];

      R[0]  =  A[0]*B[0] +  A[1]*B[4]  +  A[2]*B[8]  +  A[3]*B[12];
      R[1]  =  A[0]*B[1] +  A[1]*B[5]  +  A[2]*B[9]  +  A[3]*B[13];
      R[2]  =  A[0]*B[2] +  A[1]*B[6]  +  A[2]*B[10] +  A[3]*B[14];
      R[3]  =  A[0]*B[3] +  A[1]*B[7]  +  A[2]*B[11] +  A[3]*B[15];

      R[4]  =  A[4]*B[0] +  A[5]*B[4]  +  A[6]*B[8]  +  A[7]*B[12];
      R[5]  =  A[4]*B[1] +  A[5]*B[5]  +  A[6]*B[9]  +  A[7]*B[13];
      R[6]  =  A[4]*B[2] +  A[5]*B[6]  +  A[6]*B[10] +  A[7]*B[14];
      R[7]  =  A[4]*B[3] +  A[5]*B[7]  +  A[6]*B[11] +  A[7]*B[15];

      R[8]  =  A[8]*B[0] +  A[9]*B[4]  + A[10]*B[8]  + A[11]*B[12];
      R[9]  =  A[8]*B[1] +  A[9]*B[5]  + A[10]*B[9]  + A[11]*B[13];
      R[10] =  A[8]*B[2] +  A[9]*B[6]  + A[10]*B[10] + A[11]*B[14];
      R[11] =  A[8]*B[3] +  A[9]*B[7]  + A[10]*B[11] + A[11]*B[15];

      R[12] = A[12]*B[0] + A[13]*B[4]  + A[14]*B[8]  + A[15]*B[12];
      R[13] = A[12]*B[1] + A[13]*B[5]  + A[14]*B[9]  + A[15]*B[13];
      R[14] = A[12]*B[2] + A[13]*B[6]  + A[14]*B[10] + A[15]*B[14];
      R[15] = A[12]*B[3] + A[13]*B[7]  + A[14]*B[11] + A[15]*B[15];
    }

    return R;
  }

  function matrixTranspose(A) {
    return new Float32Array([
      A[0], A[4],  A[8], A[12],
      A[1], A[5],  A[9], A[13],
      A[2], A[6], A[10], A[14],
      A[3], A[7], A[11], A[15]
    ]);
  }

  function vectorMultiply(A, v) {
    return new Float32Array([
       A[0]*v[0] +  A[1]*v[1] +  A[2]*v[2] +  A[3]*v[3],
       A[4]*v[0] +  A[5]*v[1] +  A[6]*v[2] +  A[7]*v[3],
       A[8]*v[0] +  A[9]*v[1] + A[10]*v[2] + A[11]*v[3],
      A[12]*v[0] + A[13]*v[1] + A[14]*v[2] + A[15]*v[3]
    ]);
  }

  function identityMatrix() {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  function scaleMatrix(x_scale, y_scale, z_scale) {
    return new Float32Array([
      x_scale,       0,       0, 0,
            0, y_scale,       0, 0,
            0,       0, z_scale, 0,
            0,       0,       0, 1
    ]);
  }

  function translationMatrix(x, y, z) {
    return new Float32Array([
      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, z,
      0, 0, 0, 1,
    ]);
  }

  function rotationZMatrix(angle) {
    return new Float32Array([
       cos(angle), sin(angle), 0, 0,
      -sin(angle), cos(angle), 0, 0,
                0,          0, 1, 0,
                0,          0, 0, 1
    ]);
  }

  function rotationYMatrix(angle) {
    return new Float32Array([
       cos(angle),           0, -sin(angle), 0,
                0,           1,           0, 0,
       sin(angle),           0,  cos(angle), 0,
                0,           0,           0, 1
    ]);
  }

  function TriangleList(vertices) {
    this.vertices = new Float32Array(vertices);
  }

  function TriangleStrip(vertices) {
    this.vertices = new Float32Array(vertices);
  }

  window.matrixMultiply = matrixMultiply;
  window.matrixTranspose = matrixTranspose;
  window.vectorMultiply = vectorMultiply;
  window.identityMatrix = identityMatrix;
  window.scaleMatrix = scaleMatrix;
  window.translationMatrix = translationMatrix;
  window.rotationZMatrix = rotationZMatrix;
  window.rotationYMatrix = rotationYMatrix;

  window.TriangleList = TriangleList;
  window.TriangleStrip = TriangleStrip;

  window.Models = {
    "quad": new TriangleStrip([
      -1, -1, 0,
      -1,  1, 0,
       1, -1, 0,
       1,  1, 0
    ])
  };
})(window);

(function(window) {
  var fs = require("fs");

  function makeShaderProgram(gl) {
    var fragmentShaderSource = fs.readFileSync("frac_fragment.glsl");
    var vertexShaderSource = fs.readFileSync("frac_vertex.glsl");

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    console.log(gl.getShaderInfoLog(fragmentShader));

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    //console.log(gl.getShaderInfoLog(vertexShader));

    var program = gl.createProgram();
    gl.attachShader(program, fragmentShader);
    gl.attachShader(program, vertexShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    return program;
  }

  // Create a canvas
  var canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  // Get the WebGL context
  var gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});

  // Load the paddle geometry into GPU memory
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, Models["quad"].vertices, gl.STATIC_DRAW);

  var shaderProgram = makeShaderProgram(gl);

  function Fractal(gl, model) {
    this.gl = gl;
    this.model = model;

    this.redraw = true;
    this.settings = JSON.parse(fs.readFileSync("parameters.json"));
    this.lastset = fs.statSync("parameters.json").mtime
  }

  Fractal.prototype.update = function() {
    if (fs.statSync("parameters.json").mtime > this.lastset) {
      this.settings = JSON.parse(fs.readFileSync("parameters.json"));
      this.lastset = fs.statSync("parameters.json").mtime;
      this.redraw = true;
    }
  };

  Fractal.prototype.draw = function() {
    var gl = this.gl;

    // Render the tile geometry
    gl.useProgram(shaderProgram);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var vertexLocation = gl.getAttribLocation(shaderProgram, "a_vertex");
    var aspectLocation = gl.getUniformLocation(shaderProgram, "u_aspect");

    var centerLocation = gl.getUniformLocation(shaderProgram, "u_center");
    var zoomLocation = gl.getUniformLocation(shaderProgram, "u_zoom");
    var brightnessLocation = gl.getUniformLocation(shaderProgram, "u_brightness");
    var aLocation = gl.getUniformLocation(shaderProgram, "u_a");
    var epsLocation = gl.getUniformLocation(shaderProgram, "u_eps");

    gl.uniform1f(aspectLocation, 4/3);
    gl.uniform2fv(centerLocation, this.settings.center);
    gl.uniform1f(zoomLocation, this.settings.zoom);
    gl.uniform1f(brightnessLocation, this.settings.brightness);
    gl.uniform2fv(aLocation, this.settings.a);
    gl.uniform1f(epsLocation, this.settings.eps);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.model);
    gl.enableVertexAttribArray(vertexLocation);
    gl.vertexAttribPointer(vertexLocation, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  Fractal.prototype.set = function(prop, value) {
    this[prop] = value;
    this.redraw = true;
  };

  var world = new Fractal(gl, buffer);
  window.world = world;

  function onAnimationFrame() {
    requestAnimationFrame(onAnimationFrame);
    world.update();
    if (world.redraw) {
      world.redraw = false;
      world.draw();
    }
  }
  requestAnimationFrame(onAnimationFrame);

  window.saveImage = function(filename) {
    fs.writeFileSync(filename, new Buffer(canvas.toDataURL("image/png").replace(/^data:image\/\w+;base64,/, ""), "base64"));
  }
})(window);
