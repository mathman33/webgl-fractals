precision highp float;

#define PI 3.141592653589793238462643383279
const int ITERATIONS = {{ITERATIONS}};
const int NUMROOTS = {{NUMROOTS}};

varying vec2 v_vertex;

uniform vec2 u_center;
uniform float u_zoom;
uniform float u_brightness;
uniform vec3 u_color;
uniform vec2 u_a;
uniform float u_eps;

uniform vec2 u_poly[NUMROOTS+1];
uniform vec2 u_deriv[NUMROOTS+1];
uniform vec2 u_roots[NUMROOTS+1];


vec2 compmul(const vec2 a, const vec2 b) {
  return b[0]*a + b[1]*vec2(-a[1], a[0]);
}

vec2 compdiv(const vec2 a, const vec2 b){
  return compmul(a, b*vec2(1, -1)) / (b[0]*b[0] + b[1]*b[1]);
}

float norm(const vec2 a, const vec2 b) {
  return sqrt((a[0] - b[0])*(a[0] - b[0]) + (a[1] - b[1])*(a[1] - b[1]));
}

float norm(const vec3 a, const vec3 b) {
  return sqrt((a[0] - b[0])*(a[0] - b[0]) + (a[1] - b[1])*(a[1] - b[1]) + (a[2] - b[2])*(a[2] - b[2]));
}

vec2 approximation(const vec2 z) {
  vec2 zx = vec2(1, 0);
  vec2 numerator = vec2(0, 0);
  vec2 denominator = vec2(0, 0);
  for (int i = 0; i < NUMROOTS+1; i += 1) {
    numerator += compmul(u_poly[i], zx);
    denominator += compmul(u_deriv[i], zx);
    zx = compmul(zx, z);
  }

  return compdiv(numerator, denominator);
}

void main() {
  float tolerance = u_eps*u_eps;
  vec2 p = v_vertex / u_zoom + u_center;

  // // Highlight the roots
  // for (int i = 0; i < NUMROOTS; i += 1) {
  //   if (dot(p - u_roots[i], p - u_roots[i]) < 0.01) {
  //     gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
  //     return;
  //   }
  // }

  float b = 0.0;
  for (int i = 0; i < ITERATIONS; i += 1) {
    p -= compmul(u_a, approximation(p));

    for (int j = 0; j < NUMROOTS; j += 1) {
      if (dot(p - u_roots[j], p - u_roots[j]) < tolerance) {
        b = float(ITERATIONS-i)*float(j+1)*u_brightness;
      }
    }

    if (b > 0.0) {
      break;
    }
  }

  gl_FragColor = vec4((b/float(ITERATIONS))*u_color, 1.0);
}
