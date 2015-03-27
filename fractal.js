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

  function makeShaderProgram(gl, exponent, iterations) {
    var fragmentShaderSource = fs.readFileSync("frac_fragment.glsl", {encoding: "utf-8"});
    var vertexShaderSource = fs.readFileSync("frac_vertex.glsl", {encoding: "utf-8"});

    fragmentShaderSource = fragmentShaderSource.replace(/\{\{EXPONENT\}\}/g, ""+exponent).replace(/\{\{ITERATIONS\}\}/g, ""+iterations);
    console.log(fragmentShaderSource);

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
  var gl = canvas.getContext("webgl", {
    antialias: true,
    preserveDrawingBuffer: true  // enable saving the canvas as an image.
  });

  // Load the paddle geometry into GPU memory
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, Models["quad"], gl.STATIC_DRAW);

  var settings = JSON.parse(fs.readFileSync("parameters.json"));
  var shaderProgram = makeShaderProgram(gl, settings.exponent, settings.iterations);

  function Fractal(gl, model, settings) {
    this.gl = gl;
    this.model = model;

    this.redraw = true;
    this.settings = settings;
    this.lastset = fs.statSync("parameters.json").mtime

    this.lastkeys = {
      up: 0,
      down: 0,
      left: 0,
      right: 0
    };
    this.keys = {
      up: 0,
      down: 0,
      left: 0,
      right: 0
    };
  }

  Fractal.prototype.update = function() {
    if (fs.statSync("parameters.json").mtime > this.lastset) {
      this.settings = JSON.parse(fs.readFileSync("parameters.json"));
      this.lastset = fs.statSync("parameters.json").mtime;
      this.redraw = true;
    }
    if (!this.redraw) {
      if (this.keys.up - this.keys.down != 0) {
        this.settings.center[1] += (this.keys.up - this.keys.down)/(10*this.settings.zoom);
        this.redraw = true;
      }
      if (this.keys.right - this.keys.left != 0) {
        this.settings.center[0] += (this.keys.right - this.keys.left)/(10*this.settings.zoom);
        this.redraw = true;
      }
    }

    // var tmp = this.lastkeys;
    // this.lastkeys = this.keys;
    // tmp.up = this.lastkeys.up;
    // tmp.down = this.lastkeys.down;
    // tmp.left = this.lastkeys.left;
    // tmp.right = this.lastkeys.right;
    // this.keys = tmp;
  };

  Fractal.prototype.draw = function() {
    var gl = this.gl;

    // Render the tile geometry
    gl.useProgram(shaderProgram);

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

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  Fractal.prototype.set = function(prop, value) {
    this.settings[prop] = value;
    this.redraw = true;
  };

  var world = new Fractal(gl, buffer, settings);

  window.world = world;
  window.saveImage = function(filename) {
    fs.writeFileSync(filename, new Buffer(canvas.toDataURL("image/png").replace(/^data:image\/\w+;base64,/, ""), "base64"));
  }

  window.onkeydown = function(ev) {
    switch (ev.keyCode) {
    case 65: world.keys.left = 1; break;
    case 68: world.keys.right = 1; break;
    case 87: world.keys.up = 1; break;
    case 83: world.keys.down = 1; break;
    }
  }
  window.onkeyup = function(ev) {
    switch (ev.keyCode) {
    case 65: world.keys.left = 0; break;
    case 68: world.keys.right = 0; break;
    case 87: world.keys.up = 0; break;
    case 83: world.keys.down = 0; break;
    }
  }

  requestAnimationFrame(function onAnimationFrame() {
    requestAnimationFrame(onAnimationFrame);
    world.update();
    if (world.redraw) {
      world.draw();
      world.redraw = false;
    }
  });
})(window);
