precision highp float;

attribute vec3 a_vertex;
uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

varying vec2 v_vertex;

void main() {
  gl_Position = u_projection * u_view * u_model * vec4(a_vertex, 1.0);
  v_vertex = gl_Position.xy;
}
