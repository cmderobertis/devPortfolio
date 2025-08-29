import React, { useRef, useEffect, useState } from "react";
import { vec } from '../utils/vectorMath.js';
import { N_AIR, calculateRefractiveIndices, COLOR_MAP } from '../utils/opticsUtils.js';
import { getLineIntersection, getNormal, refract } from '../utils/rayTracing.js';
import { Button } from '../design-system';
import InteractivePageWrapper from '../components/InteractivePageWrapper';
import '../components/InteractivePageWrapper.css';

const PrismSimulation = (props) => {
  const canvasRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    let animationId;
    let time = 0;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      const containerWidth = container.clientWidth;
      const containerHeight = Math.min(600, window.innerHeight * 0.6);
      
      canvas.width = containerWidth;
      canvas.height = containerHeight;
    };

    // Initial resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      if (!isAnimating) return;
      
      const { width, height } = canvas;
      time += 0.01 * animationSpeed;

      // --- Define Prism Geometry relative to canvas size ---
      const scale = Math.min(width, height) / 8; // Scale the simulation to fit the canvas
      const prismHeight = Math.sqrt(3);
      const prismVertices = [
        [0, 0],
        [2, 0],
        [1, prismHeight],
      ].map((p) => vec.mul(p, scale));
      const center = vec.mul(
        vec.add(vec.add(prismVertices[0], prismVertices[1]), prismVertices[2]),
        1 / 3
      );
      const PRISM_VERTICES = prismVertices.map((p) => vec.sub(p, center));

      // Drawing Logic
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, width, height);

      // Center the coordinate system
      ctx.save();
      ctx.translate(width / 2, height / 2);

      // Draw Prism with subtle animation
      const prismOpacity = 0.7 + 0.1 * Math.sin(time * 0.5);
      ctx.beginPath();
      ctx.moveTo(PRISM_VERTICES[0][0], PRISM_VERTICES[0][1]);
      for (let i = 1; i < PRISM_VERTICES.length; i++) {
        ctx.lineTo(PRISM_VERTICES[i][0], PRISM_VERTICES[i][1]);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(200, 255, 255, ${prismOpacity})`;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Animate the incoming light angle slightly
      const angleOffset = Math.sin(time * 0.3) * 0.02;
      const initialStart = [-width / 2.5, scale * 0.25];
      const initialDirection = vec.normalize([1, -0.05 + angleOffset]);

      // Draw incoming white light with pulsing effect
      const lightIntensity = 0.8 + 0.2 * Math.sin(time * 2);
      ctx.beginPath();
      ctx.moveTo(initialStart[0], initialStart[1]);
      ctx.lineTo(PRISM_VERTICES[0][0] - 10, PRISM_VERTICES[0][1] + 28);
      ctx.strokeStyle = `rgba(255, 255, 255, ${lightIntensity})`;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Add light source glow
      const gradient = ctx.createRadialGradient(
        initialStart[0], initialStart[1], 0,
        initialStart[0], initialStart[1], 20
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${lightIntensity * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(initialStart[0], initialStart[1], 20, 0, Math.PI * 2);
      ctx.fill();

      // Get pre-calculated refractive indices
      const refractiveIndices = calculateRefractiveIndices();

      // Trace each color
      for (const color in refractiveIndices) {
        const nGlass = refractiveIndices[color];
        let path = [initialStart];

        // First intersection
        let intersections = [];
        for (let i = 0; i < PRISM_VERTICES.length; i++) {
          const p1 = PRISM_VERTICES[i];
          const p2 = PRISM_VERTICES[(i + 1) % PRISM_VERTICES.length];
          const intersect = getLineIntersection(
            initialStart,
            initialDirection,
            p1,
            vec.sub(p2, p1)
          );
          if (intersect) {
            intersections.push({
              dist: vec.norm(vec.sub(intersect, initialStart)),
              point: intersect,
              edgeIdx: i,
            });
          }
        }
        if (!intersections.length) continue;

        const { point: entryPoint, edgeIdx } = intersections.sort(
          (a, b) => a.dist - b.dist
        )[0];
        path.push(entryPoint);

        // Refraction at entry
        const normalEntry = getNormal(
          PRISM_VERTICES[edgeIdx],
          PRISM_VERTICES[(edgeIdx + 1) % PRISM_VERTICES.length]
        );
        const dirInPrism = refract(
          initialDirection,
          normalEntry,
          N_AIR,
          nGlass
        );
        if (!dirInPrism) continue;

        // Second intersection
        intersections = [];
        for (let i = 0; i < PRISM_VERTICES.length; i++) {
          if (i === edgeIdx) continue;
          const p1 = PRISM_VERTICES[i];
          const p2 = PRISM_VERTICES[(i + 1) % PRISM_VERTICES.length];
          const intersect = getLineIntersection(
            entryPoint,
            dirInPrism,
            p1,
            vec.sub(p2, p1)
          );
          if (intersect) {
            intersections.push({
              dist: vec.norm(vec.sub(intersect, entryPoint)),
              point: intersect,
              edgeIdx: i,
            });
          }
        }
        if (!intersections.length) continue;

        const { point: exitPoint, edgeIdx: edgeIdxExit } = intersections.sort(
          (a, b) => a.dist - b.dist
        )[0];
        path.push(exitPoint);

        // Refraction at exit
        const normalExit = getNormal(
          PRISM_VERTICES[edgeIdxExit],
          PRISM_VERTICES[(edgeIdxExit + 1) % PRISM_VERTICES.length]
        );
        const finalDir = refract(dirInPrism, normalExit, nGlass, N_AIR);
        if (!finalDir) continue;

        const finalPoint = vec.add(exitPoint, vec.mul(finalDir, width));
        path.push(finalPoint);

        // Draw the path with enhanced visuals
        const rayIntensity = 0.7 + 0.3 * Math.sin(time + Object.keys(refractiveIndices).indexOf(color));
        ctx.beginPath();
        ctx.moveTo(path[0][0], path[0][1]);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i][0], path[i][1]);
        }
        ctx.strokeStyle = COLOR_MAP[color] || color.toLowerCase();
        ctx.globalAlpha = rayIntensity;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Add subtle glow effect to dispersed rays
        ctx.strokeStyle = COLOR_MAP[color] || color.toLowerCase();
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Restore canvas state
      ctx.restore();

      if (isAnimating) {
        animationId = requestAnimationFrame(animate);
      }
    };

    // Start animation
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isAnimating, animationSpeed]);

  return (
    <canvas
      ref={canvasRef}
      {...props}
      style={{ 
        display: "block", 
        background: "#1a1a1a",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        width: "100%",
        height: "auto"
      }}
    />
  );
};

const PrismPage = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <InteractivePageWrapper>
      <div className="container-lg py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="display-4 fw-bold text-primary mb-0">Prism Light Dispersion</h1>
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
                <h5 className="card-title">About This Simulation</h5>
                <p className="card-text">
                  This interactive simulation demonstrates the physics of light dispersion through a triangular prism. 
                  White light entering the prism is separated into its component colors due to wavelength-dependent 
                  refraction, creating the familiar rainbow spectrum.
                </p>
                <h6>Key Physics Concepts:</h6>
                <ul>
                  <li><strong>Snell's Law:</strong> Governs how light bends when passing between materials</li>
                  <li><strong>Dispersion:</strong> Different wavelengths (colors) have different refractive indices</li>
                  <li><strong>Cauchy's Equation:</strong> Used to calculate wavelength-dependent refractive indices</li>
                  <li><strong>Total Internal Reflection:</strong> When light cannot exit a material at certain angles</li>
                </ul>
                <p className="mb-0">
                  The simulation uses real optical constants for crown glass and accounts for the slight 
                  variation in refractive index across the visible spectrum (380-700 nanometers).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-2">
              <PrismSimulation />
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
                Built with HTML5 Canvas and vanilla JavaScript. Features real-time ray tracing, 
                physics-accurate refraction calculations, and responsive canvas scaling. 
                The animation subtly varies the incident light angle to show how dispersion changes.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </InteractivePageWrapper>
  );
};

export default PrismPage;