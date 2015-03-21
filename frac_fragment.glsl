precision highp float;

#define PI 3.141592653589793238462643383279

varying vec2 v_vertex;

vec2 compmul(vec2 a, vec2 b) {
  return vec2(
    a[0]*b[0] - a[1]*b[1],
    a[0]*b[1] + a[1]*b[0]
  );
}

vec2 compdiv(vec2 a, vec2 b){
  return compmul(a, b*vec2(1, -1)) / (pow(b[0], 2.0) + pow(b[1], 2.0));
}

float norm(vec2 a, vec2 b) {
  return sqrt(pow(a[0] - b[0], 2.0) + pow(a[1] - b[1], 2.0));
}

vec2 poly(vec2 z) {
  return compmul(compmul(compmul(z, z), z), z) - vec2(1.0, 0.0);
}

vec2 poly_p(vec2 z) {
  return compmul(vec2(4.0, 0.0), compmul(compmul(z, z), z));
}

vec2 polarToRect(float mag, float ang) {
  return vec2(mag*cos(ang), mag*sin(ang));
}


void main() {
  vec2 z1 = vec2(1.0, 0.0);
  vec2 z2 = vec2(0.0, 1.0);
  vec2 z3 = vec2(-1.0, 0.0);
  vec2 z4 = vec2(0.0, -1.0);

  vec2 a = vec2(0.6, 0.554727);
  float eps = 0.00000001;

  vec2 p = v_vertex;
  vec4 b = vec4(0.0, 0.0, 0.0, 0.0);

  const int iterations = 50;
  for (int i = 0; i < iterations; i += 1) {
    p -= compmul(a, compdiv(poly(p), poly_p(p)));

    if (norm(p, z1) < eps) {
      b[0] += 1.0;
    }
    if (norm(p, z2) < eps) {
      b[1] += 1.0;
    }
    if (norm(p, z3) < eps) {
      b[2] += 1.0;
    }
    if (norm(p, z4) < eps) {
      b[3] += 1.0;
    }
  }

  gl_FragColor = 0.10*vec4(b[0] + b[3], b[1] + b[3], b[2], 1.0);
}
