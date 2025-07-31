// Vector Math Utilities for 2D operations
// JavaScript replacement for Numpy vector operations

export const vec = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
  mul: (a, s) => [a[0] * s, a[1] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1],
  norm: (a) => Math.sqrt(a[0] ** 2 + a[1] ** 2),
  normalize: (a) => {
    const mag = vec.norm(a);
    if (mag === 0) return [0, 0];
    return [a[0] / mag, a[1] / mag];
  },
};