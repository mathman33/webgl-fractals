precision lowp float;

#define PI 3.141592653589793238462643383279
const int EXPONENT = {{EXPONENT}};
const int ITERATIONS = {{ITERATIONS}};

uniform vec2 u_center;
uniform float u_zoom;
uniform float u_brightness;
uniform vec3 u_color;
uniform vec2 u_a;
uniform float u_eps;

varying vec2 v_vertex;

vec2 compmul(vec2 a, vec2 b) {
  return b[0]*a + b[1]*vec2(-a[1], a[0]);
}

vec2 compdiv(vec2 a, vec2 b){
  return compmul(a, b*vec2(1, -1)) / (b[0]*b[0] + b[1]*b[1]);
}

float norm(vec2 a, vec2 b) {
  return sqrt((a[0] - b[0])*(a[0] - b[0]) + (a[1] - b[1])*(a[1] - b[1]));
}

float norm(vec3 a, vec3 b) {
  return sqrt((a[0] - b[0])*(a[0] - b[0]) + (a[1] - b[1])*(a[1] - b[1]) + (a[2] - b[2])*(a[2] - b[2]));
}

vec2 approximation(vec2 z) {
  vec2 z2 = vec2(1.0, 0.0);
  for (int i = 0; i < EXPONENT-1; ++i) {
    z2 = compmul(z2, z);
  }

  vec2 poly = compmul(z2, z) - vec2(1.0, 0.0);
  vec2 dpoly = float(EXPONENT)*z2;

  return compdiv(poly, dpoly);
}

vec2 polar(float mag, float ang) {
  return vec2(mag*cos(ang), mag*sin(ang));
}


void main() {
  vec2 zeros[EXPONENT];
  for (int i = 0; i < EXPONENT; i += 1) {
    zeros[i] = polar(1.0, float(i)/float(EXPONENT) * 2.0*PI);
  }

  float tolerance = u_eps*u_eps;
  vec2 p = v_vertex / u_zoom + u_center;
  //vec2 p = v_vertex * 2850.0;     // best zoom for degree-6
  //vec2 p = v_vertex * 45000000.0; // best zoom for degree-3

  float b = 0.0;
  for (int i = 0; i < ITERATIONS; i += 1) {
    p -= compmul(u_a, approximation(p));

    for (int j = 0; j < EXPONENT; j += 1) {
      if (dot(p - zeros[j], p - zeros[j]) < tolerance) {
        b = float(ITERATIONS-i)*float(j+1)*u_brightness;
        //b += u_brightness*float(j+1);
      }
    }

    if (b > 0.0) {
      break;
    }
  }

  gl_FragColor = vec4((b/float(ITERATIONS))*u_color, 1.0);
}
