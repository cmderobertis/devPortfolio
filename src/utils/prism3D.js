// 3D Prism Geometry and Light Interaction
// Defines various prism shapes and their 3D properties

import { vec3, matrix3D } from './vector3D.js';

// Prism shape definitions
export const PRISM_SHAPES = {
  TRIANGULAR: 'triangular',
  SQUARE: 'square',
  PENTAGONAL: 'pentagonal',
  CYLINDER: 'cylinder'
};

// Create triangular prism geometry
export const createTriangularPrism = (size = 1, height = 2) => {
  const vertices = [
    // Front face triangle
    [-size, -size * Math.sqrt(3) / 3, height / 2],
    [size, -size * Math.sqrt(3) / 3, height / 2],
    [0, size * 2 * Math.sqrt(3) / 3, height / 2],
    // Back face triangle
    [-size, -size * Math.sqrt(3) / 3, -height / 2],
    [size, -size * Math.sqrt(3) / 3, -height / 2],
    [0, size * 2 * Math.sqrt(3) / 3, -height / 2]
  ];
  
  const faces = [
    // Triangular faces
    { vertices: [0, 1, 2], normal: [0, 0, 1] }, // Front
    { vertices: [5, 4, 3], normal: [0, 0, -1] }, // Back
    // Rectangular faces
    { vertices: [0, 3, 4, 1], normal: [0, -1, 0] }, // Bottom
    { vertices: [1, 4, 5, 2], normal: [Math.sqrt(3)/2, 0.5, 0] }, // Right
    { vertices: [2, 5, 3, 0], normal: [-Math.sqrt(3)/2, 0.5, 0] } // Left
  ];
  
  return { vertices, faces, type: PRISM_SHAPES.TRIANGULAR };
};

// Create square prism (cube)
export const createSquarePrism = (size = 1, height = 2) => {
  const vertices = [
    // Front face
    [-size, -size, height / 2],
    [size, -size, height / 2],
    [size, size, height / 2],
    [-size, size, height / 2],
    // Back face
    [-size, -size, -height / 2],
    [size, -size, -height / 2],
    [size, size, -height / 2],
    [-size, size, -height / 2]
  ];
  
  const faces = [
    { vertices: [0, 1, 2, 3], normal: [0, 0, 1] }, // Front
    { vertices: [7, 6, 5, 4], normal: [0, 0, -1] }, // Back
    { vertices: [0, 4, 5, 1], normal: [0, -1, 0] }, // Bottom
    { vertices: [2, 6, 7, 3], normal: [0, 1, 0] }, // Top
    { vertices: [1, 5, 6, 2], normal: [1, 0, 0] }, // Right
    { vertices: [3, 7, 4, 0], normal: [-1, 0, 0] } // Left
  ];
  
  return { vertices, faces, type: PRISM_SHAPES.SQUARE };
};

// Transform prism with rotation and translation
export const transformPrism = (prism, rotation = [0, 0, 0], translation = [0, 0, 0]) => {
  const { vertices, faces } = prism;
  
  // Apply rotations
  const rotX = matrix3D.rotateX(rotation[0]);
  const rotY = matrix3D.rotateY(rotation[1]);
  const rotZ = matrix3D.rotateZ(rotation[2]);
  
  const transformedVertices = vertices.map(vertex => {
    let transformed = matrix3D.transform(rotX, vertex);
    transformed = matrix3D.transform(rotY, transformed);
    transformed = matrix3D.transform(rotZ, transformed);
    return vec3.add(transformed, translation);
  });
  
  // Transform face normals
  const transformedFaces = faces.map(face => {
    let normal = matrix3D.transform(rotX, face.normal);
    normal = matrix3D.transform(rotY, normal);
    normal = matrix3D.transform(rotZ, normal);
    return { ...face, normal: vec3.normalize(normal) };
  });
  
  return { ...prism, vertices: transformedVertices, faces: transformedFaces };
};

// Find intersection of ray with prism face
export const rayFaceIntersection = (rayOrigin, rayDirection, face, vertices) => {
  const faceVertices = face.vertices.map(i => vertices[i]);
  const normal = face.normal;
  
  // Check if ray is parallel to face
  const denominator = vec3.dot(rayDirection, normal);
  if (Math.abs(denominator) < 1e-9) return null;
  
  // Calculate intersection with plane
  const planePoint = faceVertices[0];
  const t = vec3.dot(vec3.sub(planePoint, rayOrigin), normal) / denominator;
  
  if (t < 1e-6) return null; // Ray goes backward
  
  const intersectionPoint = vec3.add(rayOrigin, vec3.mul(rayDirection, t));
  
  // Check if intersection point is inside the face polygon
  if (isPointInPolygon(intersectionPoint, faceVertices, normal)) {
    return { point: intersectionPoint, normal, distance: t };
  }
  
  return null;
};

// Check if point is inside a polygon (using ray casting)
const isPointInPolygon = (point, polygon, normal) => {
  // For simplicity, assuming triangular or rectangular faces
  if (polygon.length === 3) {
    return isPointInTriangle(point, polygon[0], polygon[1], polygon[2]);
  } else if (polygon.length === 4) {
    return isPointInQuad(point, polygon[0], polygon[1], polygon[2], polygon[3]);
  }
  return false;
};

// Point in triangle test using barycentric coordinates
const isPointInTriangle = (p, a, b, c) => {
  const v0 = vec3.sub(c, a);
  const v1 = vec3.sub(b, a);
  const v2 = vec3.sub(p, a);
  
  const dot00 = vec3.dot(v0, v0);
  const dot01 = vec3.dot(v0, v1);
  const dot02 = vec3.dot(v0, v2);
  const dot11 = vec3.dot(v1, v1);
  const dot12 = vec3.dot(v1, v2);
  
  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
  
  return (u >= 0) && (v >= 0) && (u + v <= 1);
};

// Point in quadrilateral test
const isPointInQuad = (point, a, b, c, d) => {
  // Split quad into two triangles and test both
  return isPointInTriangle(point, a, b, c) || isPointInTriangle(point, a, c, d);
};