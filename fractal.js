(function(window) {
  var fs = require("fs");

  var Models = {
    "quad": new Float32Array([
      -1, -1,
      -1,  1,
       1, -1,
       1,  1
    ])
  };

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
  gl.bufferData(gl.ARRAY_BUFFER, Models["quad"], gl.STATIC_DRAW);

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
    var colorLocation = gl.getUniformLocation(shaderProgram, "u_color");
    var exponentLocation = gl.getUniformLocation(shaderProgram, "u_exponent");
    var aLocation = gl.getUniformLocation(shaderProgram, "u_a");
    var epsLocation = gl.getUniformLocation(shaderProgram, "u_eps");

    gl.uniform1f(aspectLocation, canvas.width/canvas.height);
    gl.uniform2fv(centerLocation, this.settings.center);
    gl.uniform1f(zoomLocation, this.settings.zoom);
    gl.uniform1f(brightnessLocation, this.settings.brightness);
    gl.uniform3fv(colorLocation, this.settings.color);
    gl.uniform1i(exponentLocation, this.settings.exponent);
    gl.uniform2fv(aLocation, this.settings.a);
    gl.uniform1f(epsLocation, this.settings.eps);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.model);
    gl.enableVertexAttribArray(vertexLocation);
    gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  Fractal.prototype.set = function(prop, value) {
    this.settings[prop] = value;
    this.redraw = true;
  };

  var world = new Fractal(gl, buffer);

  window.world = world;
  window.saveImage = function(filename) {
    fs.writeFileSync(filename, new Buffer(canvas.toDataURL("image/png").replace(/^data:image\/\w+;base64,/, ""), "base64"));
  }

  requestAnimationFrame(function onAnimationFrame() {
    requestAnimationFrame(onAnimationFrame);
    world.update();
    if (world.redraw) {
      world.redraw = false;
      world.draw();
    }
  });
})(window);
