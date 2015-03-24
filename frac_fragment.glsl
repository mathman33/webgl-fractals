precision highp float;

#define PI 3.141592653589793238462643383279
const int MAX_DEGREE = 300;
const int ITERATIONS = 400;
const int EXPONENTS = 7;

uniform vec2 u_center;
uniform float u_zoom;
uniform float u_brightness;
uniform vec2 u_a;
uniform float u_eps;

varying vec2 v_vertex;

vec2 compmul(vec2 a, vec2 b) {
  return vec2(
    a[0]*b[0] - a[1]*b[1],
    a[0]*b[1] + a[1]*b[0]
  );
}

vec2 compdiv(vec2 a, vec2 b){
  return compmul(a, b*vec2(1, -1)) / (b[0]*b[0] + b[1]*b[1]);
}

vec2 comppow(vec2 a, int n) {
  vec2 r = vec2(1.0, 0.0);
  for (int i = 0; i < MAX_DEGREE; ++i) {
    if (n <= i) {
      break;
    }
    r = compmul(r, a);
  }
  return r;
}

float norm(vec2 a, vec2 b) {
  return sqrt((a[0] - b[0])*(a[0] - b[0]) + (a[1] - b[1])*(a[1] - b[1]));
}

float norm(vec3 a, vec3 b) {
  return sqrt((a[0] - b[0])*(a[0] - b[0]) + (a[1] - b[1])*(a[1] - b[1]) + (a[2] - b[2])*(a[2] - b[2]));
}

vec2 approximation(vec2 z, int n) {
  vec2 z2 = comppow(z, n-1);
  vec2 poly = compmul(z2, z) - vec2(1.0, 0.0);
  vec2 dpoly = float(n-1)*z2;

  return compdiv(poly, dpoly);
}

vec2 polar(float mag, float ang) {
  return vec2(mag*cos(ang), mag*sin(ang));
}


void main() {
  vec2 zeros[EXPONENTS];
  for (int i = 0; i < EXPONENTS; i += 1) {
    zeros[i] = polar(1.0, float(i)/float(EXPONENTS) * 2.0*PI);
  }

  vec2 p = v_vertex / u_zoom + u_center;
  //vec2 p = v_vertex * 2850.0;     // best zoom for degree-6
  //vec2 p = v_vertex * 45000000.0; // best zoom for degree-3

  float b = 0.0;
  for (int i = 0; i < ITERATIONS; i += 1) {
    p -= compmul(u_a, approximation(p, EXPONENTS));

    for (int j = 0; j < EXPONENTS; j += 1) {
      if (norm(p, zeros[j]) < u_eps) {
        b += u_brightness*float(j+1);
      }
    }
  }

  gl_FragColor = vec4((b/float(ITERATIONS))*vec3(0.3, 0.55, 0.6), 1.0);
}
