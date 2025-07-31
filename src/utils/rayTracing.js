// Ray Tracing Engine for Light Simulation
// Line intersections, surface normals, and refraction calculations

import { vec } from './vectorMath.js';

// Calculate intersection point between two lines
export const getLineIntersection = (p1, v1, p2, v2) => {
  const det = v1[0] * -v2[1] - v1[1] * -v2[0];
  if (Math.abs(det) < 1e-9) return null; // Parallel lines

  const b = vec.sub(p2, p1);
  const t = (b[0] * -v2[1] - b[1] * -v2[0]) / det;

  if (t > 1e-6) {
    return vec.add(p1, vec.mul(v1, t));
  }
  return null;
};

// Calculate surface normal from two points defining an edge
export const getNormal = (p1, p2) => {
  const edgeVec = vec.sub(p2, p1);
  return vec.normalize([-edgeVec[1], edgeVec[0]]);
};

// Calculate refracted ray direction using Snell's law
export const refract = (incidentVec, normal, n1, n2) => {
  const inc = vec.normalize(incidentVec);
  const cosI = -vec.dot(normal, inc);

  const sinT2Sq = (n1 / n2) ** 2 * (1 - cosI ** 2);
  if (sinT2Sq > 1) return null; // Total Internal Reflection

  const cosT = Math.sqrt(1 - sinT2Sq);
  const term1 = vec.mul(inc, n1 / n2);
  const term2 = vec.mul(normal, (n1 / n2) * cosI - cosT);
  return vec.normalize(vec.add(term1, term2));
};