// 3D Vector Math Utilities for 3D space light simulation
// Extended vector operations for 3D space

export const vec3 = {
  // Basic operations
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ],
  
  // Magnitude and normalization
  norm: (a) => Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2),
  normalize: (a) => {
    const mag = vec3.norm(a);
    if (mag === 0) return [0, 0, 0];
    return [a[0] / mag, a[1] / mag, a[2] / mag];
  },
  
  // Distance between points
  distance: (a, b) => vec3.norm(vec3.sub(b, a)),
  
  // Projection utilities
  projectToPlane: (point, planeNormal, planePoint) => {
    const toPoint = vec3.sub(point, planePoint);
    const distance = vec3.dot(toPoint, planeNormal);
    return vec3.sub(point, vec3.mul(planeNormal, distance));
  },
  
  // Convert 3D to 2D screen coordinates
  project2D: (point3D, camera, screenWidth, screenHeight) => {
    // Simple perspective projection
    const fov = Math.PI / 4; // 45 degrees
    const distance = vec3.distance(point3D, camera.position);
    const scale = Math.tan(fov / 2) * distance;
    
    const x = ((point3D[0] - camera.position[0]) / scale) * screenWidth / 2 + screenWidth / 2;
    const y = ((point3D[1] - camera.position[1]) / scale) * screenHeight / 2 + screenHeight / 2;
    
    return [x, y];
  }
};

// 3D transformation matrices
export const matrix3D = {
  // Rotation around X axis
  rotateX: (angle) => [
    [1, 0, 0],
    [0, Math.cos(angle), -Math.sin(angle)],
    [0, Math.sin(angle), Math.cos(angle)]
  ],
  
  // Rotation around Y axis
  rotateY: (angle) => [
    [Math.cos(angle), 0, Math.sin(angle)],
    [0, 1, 0],
    [-Math.sin(angle), 0, Math.cos(angle)]
  ],
  
  // Rotation around Z axis
  rotateZ: (angle) => [
    [Math.cos(angle), -Math.sin(angle), 0],
    [Math.sin(angle), Math.cos(angle), 0],
    [0, 0, 1]
  ],
  
  // Apply matrix transformation to vector
  transform: (matrix, vector) => [
    matrix[0][0] * vector[0] + matrix[0][1] * vector[1] + matrix[0][2] * vector[2],
    matrix[1][0] * vector[0] + matrix[1][1] * vector[1] + matrix[1][2] * vector[2],
    matrix[2][0] * vector[0] + matrix[2][1] * vector[1] + matrix[2][2] * vector[2]
  ]
};