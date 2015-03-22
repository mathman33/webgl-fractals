precision highp float;

attribute vec3 a_vertex;
uniform float u_aspect;

varying vec2 v_vertex;

void main() {
  gl_Position = vec4(a_vertex, 1.0);
  v_vertex = gl_Position.xy * vec2(u_aspect, 1.0);
}
