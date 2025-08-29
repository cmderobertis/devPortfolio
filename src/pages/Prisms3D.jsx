import React, { useRef, useEffect, useState } from "react";
import { vec3, matrix3D } from '../utils/vector3D.js';
import { N_AIR, calculateRefractiveIndices, COLOR_MAP } from '../utils/opticsUtils.js';
import { createTriangularPrism, createSquarePrism, transformPrism, rayFaceIntersection, PRISM_SHAPES } from '../utils/prism3D.js';
import { Button } from '../design-system';
import InteractivePageWrapper from '../components/InteractivePageWrapper';
import '../components/InteractivePageWrapper.css';

const Prism3DSimulation = () => {
  const canvasRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [lightSource, setLightSource] = useState({ x: -200, y: 0, z: 0, intensity: 1 });
  const [beamDirection, setBeamDirection] = useState({ x: 1, y: 0, z: 0 });
  const [manualControl, setManualControl] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null); // 'position' or 'direction'
  const [selectedPrism, setSelectedPrism] = useState(PRISM_SHAPES.TRIANGULAR);
  const [prismRotation, setPrismRotation] = useState({ x: 0, y: 0, z: 0 });
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    let animationId;
    let time = 0;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      const containerWidth = container.clientWidth;
      const containerHeight = Math.min(700, window.innerHeight * 0.7);
      
      canvas.width = containerWidth;
      canvas.height = containerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Camera setup
    const camera = {
      position: [0, 0, 8],
      target: [0, 0, 0],
      up: [0, 1, 0]
    };

    const animate = () => {
      if (!isAnimating) return;
      
      const { width, height } = canvas;
      time += 0.01;

      // Clear canvas
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      // Create prism based on selection
      let basePrism;
      if (selectedPrism === PRISM_SHAPES.TRIANGULAR) {
        basePrism = createTriangularPrism(1.5, 3);
      } else {
        basePrism = createSquarePrism(1.2, 3);
      }

      // Apply rotation with time-based animation
      const rotation = [
        prismRotation.x + Math.sin(time * 0.3) * 0.1,
        prismRotation.y + time * 0.2,
        prismRotation.z + Math.cos(time * 0.25) * 0.05
      ];
      
      const prism = transformPrism(basePrism, rotation, [0, 0, 0]);

      // Project prism vertices to 2D
      ctx.save();
      ctx.translate(width / 2, height / 2);
      
      const projectedVertices = prism.vertices.map(vertex => 
        vec3.project2D(vertex, camera, width, height)
      );

      // Draw prism wireframe
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 2;
      
      prism.faces.forEach(face => {
        ctx.beginPath();
        const firstVertex = projectedVertices[face.vertices[0]];
        ctx.moveTo(firstVertex[0] - width/2, firstVertex[1] - height/2);
        
        face.vertices.forEach(vertexIndex => {
          const vertex = projectedVertices[vertexIndex];
          ctx.lineTo(vertex[0] - width/2, vertex[1] - height/2);
        });
        ctx.closePath();
        
        // Fill faces with subtle transparency
        const faceCenter = face.vertices.reduce((sum, vertexIndex) => {
          const vertex = prism.vertices[vertexIndex];
          return vec3.add(sum, vertex);
        }, [0, 0, 0]).map(coord => coord / face.vertices.length);
        
        const lightDot = vec3.dot(vec3.normalize(face.normal), vec3.normalize([1, 1, 1]));
        const brightness = Math.max(0.1, lightDot * 0.5 + 0.5);
        
        ctx.fillStyle = `rgba(100, 150, 255, ${brightness * 0.3})`;
        ctx.fill();
        ctx.stroke();
      });

      // Light source position (keep steady)
      const currentLightSource = [
        lightSource.x,
        lightSource.y, 
        lightSource.z
      ];

      // Draw light source
      const lightPos2D = vec3.project2D(currentLightSource, camera, width, height);
      const gradient = ctx.createRadialGradient(
        lightPos2D[0] - width/2, lightPos2D[1] - height/2, 0,
        lightPos2D[0] - width/2, lightPos2D[1] - height/2, 30
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(lightPos2D[0] - width/2, lightPos2D[1] - height/2, 30, 0, Math.PI * 2);
      ctx.fill();

      // Ray tracing for each color
      const refractiveIndices = calculateRefractiveIndices();
      const numRays = 5; // Multiple rays for better effect
      
      Object.entries(refractiveIndices).forEach(([color, nGlass], colorIndex) => {
        for (let rayIndex = 0; rayIndex < numRays; rayIndex++) {
          // Create slightly divergent rays based on beam direction
          const rayOffset = (rayIndex - numRays/2) * 0.3;
          const baseDirection = manualControl ? 
            vec3.normalize([beamDirection.x, beamDirection.y, beamDirection.z]) :
            vec3.normalize([1, 0, 0]);
          const rayDirection = manualControl ?
            vec3.normalize([baseDirection[0], baseDirection[1] + rayOffset * 0.1, baseDirection[2]]) :
            vec3.normalize([1, rayOffset * 0.1, 0]);
          
          let currentPosition = [...currentLightSource];
          let currentDirection = [...rayDirection];
          let path3D = [currentPosition];
          let inside = false;
          let iterations = 0;
          const maxIterations = 10;

          while (iterations < maxIterations) {
            // Find closest intersection with prism
            let closestIntersection = null;
            let closestDistance = Infinity;
            let intersectedFace = null;

            prism.faces.forEach(face => {
              const intersection = rayFaceIntersection(currentPosition, currentDirection, face, prism.vertices);
              if (intersection && intersection.distance < closestDistance) {
                closestDistance = intersection.distance;
                closestIntersection = intersection;
                intersectedFace = face;
              }
            });

            if (!closestIntersection) break;

            path3D.push(closestIntersection.point);

            // Calculate refraction
            const n1 = inside ? nGlass : N_AIR;
            const n2 = inside ? N_AIR : nGlass;
            const normal = inside ? vec3.mul(closestIntersection.normal, -1) : closestIntersection.normal;

            const refractedDirection = refract3D(currentDirection, normal, n1, n2);
            
            if (!refractedDirection) {
              // Total internal reflection
              currentDirection = reflect3D(currentDirection, normal);
            } else {
              currentDirection = refractedDirection;
              inside = !inside;
            }

            currentPosition = vec3.add(closestIntersection.point, vec3.mul(currentDirection, 0.01));
            iterations++;
          }

          // Extend final ray
          if (path3D.length > 1) {
            const finalPoint = vec3.add(
              path3D[path3D.length - 1], 
              vec3.mul(currentDirection, 200)
            );
            path3D.push(finalPoint);
          }

          // Draw the path
          if (path3D.length > 1) {
            ctx.beginPath();
            const startPoint = vec3.project2D(path3D[0], camera, width, height);
            ctx.moveTo(startPoint[0] - width/2, startPoint[1] - height/2);

            for (let i = 1; i < path3D.length; i++) {
              const point = vec3.project2D(path3D[i], camera, width, height);
              ctx.lineTo(point[0] - width/2, point[1] - height/2);
            }

            const intensity = lightSource.intensity * (0.7 + 0.3 * Math.sin(time + colorIndex));
            ctx.strokeStyle = COLOR_MAP[color] || color.toLowerCase();
            ctx.globalAlpha = intensity * 0.8;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Add glow effect
            ctx.globalAlpha = intensity * 0.3;
            ctx.lineWidth = 6;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });

      ctx.restore();

      if (isAnimating) {
        animationId = requestAnimationFrame(animate);
      }
    };

    // Mouse interaction handlers
    const handleMouseDown = (e) => {
      if (!manualControl) return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - width / 2;
      const mouseY = e.clientY - rect.top - height / 2;
      
      // Check if clicking near light source (for positioning)
      const lightPos2D = vec3.project2D(currentLightSource, camera, width, height);
      const lightDistance = Math.sqrt(
        Math.pow(mouseX - (lightPos2D[0] - width/2), 2) + 
        Math.pow(mouseY - (lightPos2D[1] - height/2), 2)
      );
      
      if (lightDistance < 30) {
        setIsDragging(true);
        setDragType('position');
      } else {
        // Otherwise, set beam direction towards click point
        setIsDragging(true);
        setDragType('direction');
      }
    };
    
    const handleMouseMove = (e) => {
      if (!isDragging || !manualControl) return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - width / 2;
      const mouseY = e.clientY - rect.top - height / 2;
      
      if (dragType === 'position') {
        // Update light source position
        const worldPos = screenTo3D(mouseX, mouseY, currentLightSource[2]);
        setLightSource(prev => ({ ...prev, x: worldPos[0], y: worldPos[1] }));
      } else if (dragType === 'direction') {
        // Update beam direction towards mouse
        const worldPos = screenTo3D(mouseX, mouseY, 0);
        const direction = vec3.normalize(vec3.sub(worldPos, currentLightSource));
        setBeamDirection({ x: direction[0], y: direction[1], z: direction[2] });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragType(null);
    };
    
    // Helper function to convert screen coordinates to 3D world coordinates
    const screenTo3D = (screenX, screenY, z) => {
      const fov = Math.PI / 4;
      const distance = Math.abs(z - camera.position[2]);
      const scale = Math.tan(fov / 2) * distance;
      
      const worldX = (screenX / (width / 2)) * scale + camera.position[0];
      const worldY = -(screenY / (height / 2)) * scale + camera.position[1];
      
      return [worldX, worldY, z];
    };
    
    if (manualControl) {
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
    } else {
      canvas.style.cursor = 'default';
    }

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (manualControl && canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isAnimating, lightSource, selectedPrism, prismRotation, beamDirection, manualControl, isDragging, dragType]);

  // 3D refraction calculation
  const refract3D = (incident, normal, n1, n2) => {
    const inc = vec3.normalize(incident);
    const cosI = -vec3.dot(normal, inc);
    
    const sinT2Sq = (n1 / n2) ** 2 * (1 - cosI ** 2);
    if (sinT2Sq > 1) return null; // Total Internal Reflection
    
    const cosT = Math.sqrt(1 - sinT2Sq);
    const term1 = vec3.mul(inc, n1 / n2);
    const term2 = vec3.mul(normal, (n1 / n2) * cosI - cosT);
    return vec3.normalize(vec3.add(term1, term2));
  };

  // 3D reflection calculation
  const reflect3D = (incident, normal) => {
    const inc = vec3.normalize(incident);
    const dot = vec3.dot(inc, normal);
    return vec3.normalize(vec3.sub(inc, vec3.mul(normal, 2 * dot)));
  };

  return (
    <div className="position-relative">
      {/* Controls */}
      {showControls && (
        <div className="position-absolute top-0 start-0 m-3 bg-dark bg-opacity-75 p-3 rounded">
          <div className="mb-3">
            <label className="form-label text-white">Prism Shape:</label>
            <select 
              className="form-select form-select-sm"
              value={selectedPrism}
              onChange={(e) => setSelectedPrism(e.target.value)}
            >
              <option value={PRISM_SHAPES.TRIANGULAR}>Triangular</option>
              <option value={PRISM_SHAPES.SQUARE}>Square</option>
            </select>
          </div>
          
          <div className="mb-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="manualControl"
                checked={manualControl}
                onChange={(e) => setManualControl(e.target.checked)}
              />
              <label className="form-check-label text-white" htmlFor="manualControl">
                Manual Beam Control
              </label>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="form-label text-white">Light Intensity:</label>
            <input
              type="range"
              className="form-range"
              min="0.1"
              max="2"
              step="0.1"
              value={lightSource.intensity}
              onChange={(e) => setLightSource(prev => ({...prev, intensity: parseFloat(e.target.value)}))}
            />
          </div>
          
          {manualControl && (
            <>
              <div className="mb-3">
                <label className="form-label text-white">Light Position X:</label>
                <input
                  type="range"
                  className="form-range"
                  min="-300"
                  max="100"
                  step="5"
                  value={lightSource.x}
                  onChange={(e) => setLightSource(prev => ({...prev, x: parseFloat(e.target.value)}))}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label text-white">Light Position Y:</label>
                <input
                  type="range"
                  className="form-range"
                  min="-150"
                  max="150"
                  step="5"
                  value={lightSource.y}
                  onChange={(e) => setLightSource(prev => ({...prev, y: parseFloat(e.target.value)}))}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label text-white">Beam Direction X:</label>
                <input
                  type="range"
                  className="form-range"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={beamDirection.x}
                  onChange={(e) => setBeamDirection(prev => ({...prev, x: parseFloat(e.target.value)}))}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label text-white">Beam Direction Y:</label>
                <input
                  type="range"
                  className="form-range"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={beamDirection.y}
                  onChange={(e) => setBeamDirection(prev => ({...prev, y: parseFloat(e.target.value)}))}
                />
              </div>
              
              <div className="alert alert-info alert-sm" role="alert">
                <small>
                  <strong>Tip:</strong> Click and drag the light source to reposition it, or click elsewhere to aim the beam!
                </small>
              </div>
            </>
          )}

          <div className="mb-3">
            <label className="form-label text-white">Rotation X:</label>
            <input
              type="range"
              className="form-range"
              min="-3.14"
              max="3.14"
              step="0.1"
              value={prismRotation.x}
              onChange={(e) => setPrismRotation(prev => ({...prev, x: parseFloat(e.target.value)}))}
            />
          </div>

          <Button 
            variant="outlined"
            size="small"
            onClick={() => setIsAnimating(!isAnimating)}
            disabled={manualControl}
            className="me-2"
          >
            {isAnimating ? 'Pause' : 'Play'}
          </Button>
          
          {manualControl && (
            <Button 
              variant="outlined"
              size="small"
              onClick={() => {
                setLightSource({ x: -200, y: 0, z: 0, intensity: 1 });
                setBeamDirection({ x: 1, y: 0, z: 0 });
              }}
            >
              Reset Beam
            </Button>
          )}
        </div>
      )}

      {/* Toggle controls button */}
      <Button
        variant="outlined"
        size="small"
        onClick={() => setShowControls(!showControls)}
        className="position-absolute top-0 end-0 m-3"
      >
        {showControls ? 'Hide Controls' : 'Show Controls'}
      </Button>

      <canvas
        ref={canvasRef}
        style={{ 
          display: "block", 
          background: "#0a0a0a",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
          width: "100%",
          height: "auto"
        }}
      />
    </div>
  );
};

const Prisms3DPage = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <InteractivePageWrapper>
      <div className="container-lg py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="display-4 fw-bold text-primary mb-0">3D Prism Light Dispersion</h1>
            <Button 
              variant="outlined"
              onClick={() => setShowInfo(!showInfo)}
              icon={<i className="fas fa-info-circle"></i>}
            >
              {showInfo ? 'Hide Info' : 'Show Info'}
            </Button>
          </div>
        </div>
      </div>

      {showInfo && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">About This 3D Simulation</h5>
                <p className="card-text">
                  An advanced 3D light dispersion simulation where you can cast light through different prism shapes 
                  in 3D space. The simulation features realistic ray tracing, multiple prism geometries, and 
                  interactive controls for light positioning and prism orientation.
                </p>
                <h6>Enhanced Features:</h6>
                <ul>
                  <li><strong>3D Ray Tracing:</strong> True 3D light paths with multiple ray casting</li>
                  <li><strong>Multiple Prism Shapes:</strong> Triangular and square prisms with different optical properties</li>
                  <li><strong>Interactive Controls:</strong> Adjust light intensity, prism rotation, and animation</li>
                  <li><strong>Realistic Physics:</strong> Proper 3D refraction, reflection, and total internal reflection</li>
                  <li><strong>Dynamic Animation:</strong> Animated light source and prism rotation</li>
                </ul>
                <p className="mb-0">
                  Use the controls to experiment with different configurations and observe how light behaves 
                  in 3D space as it passes through various prism geometries.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-12">
          <div className="card bg-dark">
            <div className="card-body p-2">
              <Prism3DSimulation />
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="card-title">Technical Implementation</h6>
              <p className="card-text small mb-0">
                Built with HTML5 Canvas and 3D vector mathematics. Features include 3D-to-2D projection, 
                ray-face intersection testing, multiple light ray casting, and real-time 3D transformations. 
                The simulation uses proper 3D physics for light refraction and supports multiple prism geometries.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </InteractivePageWrapper>
  );
};

export default Prisms3DPage;