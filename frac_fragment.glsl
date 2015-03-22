precision highp float;

#define PI 3.141592653589793238462643383279
const int MAX_DEGREE = 300;

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
  const int iterations = 1000;
  const int exponent = 10;
  const float brightness_factor = 0.3;
  vec2 a = vec2(1.0, 0.9);
  float eps = 0.1;

  vec2 center = vec2(20.0, 3.0);
  float zoom = pow(2.0, 6.0);

  vec2 zeros[exponent];
  for (int i = 0; i < exponent; i += 1) {
    zeros[i] = polar(1.0, float(i)/float(exponent) * 2.0*PI);
  }

  vec2 p = v_vertex / zoom + center;
  //vec2 p = v_vertex * 2850.0;     // best zoom for degree-6
  //vec2 p = v_vertex * 45000000.0; // best zoom for degree-3

  float b = 0.0;
  for (int i = 0; i < iterations; i += 1) {
    p -= compmul(a, approximation(p, exponent));

    for (int j = 0; j < exponent; j += 1) {
      if (norm(p, zeros[j]) < eps) {
        b += brightness_factor*float(j+1);
      }
    }
  }

  gl_FragColor = vec4((b/float(iterations))*vec3(0.3, 0.55, 0.6), 1.0);
}
