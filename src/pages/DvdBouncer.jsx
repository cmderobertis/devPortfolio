import React, { useState, useEffect, useRef, useCallback } from "react";
// Move imports needed by drawSimplifiedLogo to the top level
import {
  logoWidth as importedLogoWidth, // Rename to avoid conflict if needed later
  logoHeight as importedLogoHeight,
  dvdLogoPath as importedDvdLogoPath,
  shadeColor,
} from "../utils/dvdLogic";

// Import the rest of the utils needed inside the component
import {
  colors,
  getRand,
  checkBoundaryCollide,
  addChaosToVelocity,
  increaseSpeed,
  increaseSize,
  createNewLogo,
  // drawLogoOnCanvas, // Not used if only using simplified
  getNextColor,
} from "../utils/dvdLogic";
import "../styles/DvdBouncer.css"; // Import component CSS

// Import MD3 Control Panel components
import ControlPanel, {
  ControlGroup,
  SliderControl,
  ButtonControl,
  InfoDisplay,
  StatusIndicator,
} from "../components/design-system/ControlPanel";
import "../components/design-system/ControlPanel.css";

// Assign top-level constants
const logoWidth = importedLogoWidth;
const logoHeight = importedLogoHeight;
const dvdLogoPath = importedDvdLogoPath;

// Simplified drawLogo function for toned-down look
const drawSimplifiedLogo = (ctx, logo) => {
  const { x, y, color, width, height } = logo;

  ctx.save();
  ctx.translate(x, y);
  // Use the top-level constants
  const scaleX = width / logoWidth;
  const scaleY = height / logoHeight;
  ctx.scale(scaleX, scaleY);

  // Simple fill, maybe slightly darker
  ctx.fillStyle = shadeColor(color, -10); // shadeColor is also imported top-level
  ctx.globalAlpha = 0.9; // Slightly transparent
  ctx.filter = "none";

  // Use the top-level constant
  const outerPath = new Path2D(dvdLogoPath[0]);
  ctx.fill(outerPath);

  // Simple "DVD" text
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; // Whiteish text
  ctx.font = "bold 40px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Use the top-level constants
  ctx.fillText("DVD", logoWidth / 2, logoHeight / 2 + 5);

  ctx.restore();
};

const DvdBouncer = () => {
  const canvasRef = useRef(null);
  const [logos, setLogos] = useState([]);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // Use percentage directly (1-10)
  const [growthMultiplier, setGrowthMultiplier] = useState(1); // Use percentage directly (1-10)
  const [baseSpeed, setBaseSpeed] = useState(2.0);
  const [angleVariation, setAngleVariation] = useState(10);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [status, setStatus] = useState("🔄 DVD Bouncer Ready!");

  const logosRef = useRef(logos);
  const animationFrameId = useRef(null);
  const particleContainerRef = useRef(null);
  const rippleContainerRef = useRef(null);
  const flashContainerRef = useRef(null);
  const toastIdCounter = useRef(0);

  useEffect(() => {
    logosRef.current = logos;
  }, [logos]);

  const showToast = useCallback((message, duration = 2000) => {
    const id = toastIdCounter.current++;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration + 400);
  }, []);

  const updateStatus = useCallback((message) => {
    setStatus(message);
  }, []);

  // --- Simplified Particle Effects (Optional) ---
  const createParticles = useCallback((x, y, count, color) => {
    const container = particleContainerRef.current;
    if (!container) return;
    // Reduce particle count for toned-down effect
    const reducedCount = Math.floor(count / 3);
    for (let i = 0; i < reducedCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle simple"; // Add 'simple' class
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      const size = Math.random() * 2 + 1; // Smaller particles
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.opacity = String(Math.random() * 0.4 + 0.2); // Less opaque

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5 + 0.5; // Slower speed
      let vx = Math.cos(angle) * speed;
      let vy = Math.sin(angle) * speed;
      let posX = x;
      let posY = y;
      let opacity = parseFloat(particle.style.opacity);
      const maxLife = Math.random() * 15 + 5;
      let lifetime = 0;

      container.appendChild(particle);

      function animateParticle() {
        if (lifetime >= maxLife || !particle.parentElement) {
          if (particle.parentElement) particle.remove();
          return;
        }
        posX += vx;
        posY += vy;
        opacity -= parseFloat(particle.style.opacity) / maxLife;
        particle.style.transform = `translate(${posX - x}px, ${posY - y}px)`;
        particle.style.opacity = String(Math.max(0, opacity));
        lifetime++;
        requestAnimationFrame(animateParticle);
      }
      requestAnimationFrame(animateParticle);
    }
  }, []);

  const handleAddLogo = useCallback(
    (x = null, y = null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Use top-level logoWidth/Height if createNewLogo needs them
      const newLogoData = createNewLogo(canvas.width, canvas.height, baseSpeed);
      if (x !== null && y !== null) {
        newLogoData.x = Math.max(
          0,
          Math.min(x - newLogoData.width / 2, canvas.width - newLogoData.width)
        );
        newLogoData.y = Math.max(
          0,
          Math.min(
            y - newLogoData.height / 2,
            canvas.height - newLogoData.height
          )
        );
      }
      setLogos((prev) => [...prev, newLogoData]);
      updateStatus(
        `${logosRef.current.length + 1} DVD logo${
          logosRef.current.length === 0 ? "" : "s"
        } bouncing`
      );
      showToast(`Added DVD Logo #${logosRef.current.length + 1}`);
    },
    [baseSpeed, showToast, updateStatus]
  ); // Removed logoWidth, logoHeight dependency as they are top-level now

  const handleReset = useCallback(() => {
    setLogos([]);
    setMaxSpeed(0);
    updateStatus("🔄 Simulation reset");
    showToast("🔄 Simulation reset");
  }, [showToast, updateStatus]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    if (
      canvas.width !== window.innerWidth ||
      canvas.height !== window.innerHeight
    ) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentMaxSpeed = 0;
    const logosAfterProcessing = [];
    logosRef.current.forEach((logo) => {
      // Iterate over the current logos
      let { x, y, vx, vy, color, width, height, scale } = logo;

      let nextX = x + vx;
      let nextY = y + vy;

      // Use top-level logoWidth/Height if checkBoundaryCollide needs them
      const { bounceX, bounceY } = checkBoundaryCollide(
        x,
        y,
        vx,
        vy,
        width,
        height,
        canvas.width,
        canvas.height
      );

      let didBounce = false;
      const speedMult = speedMultiplier / 100; // Convert percentage for calculation
      const growthMult = growthMultiplier / 100; // Convert percentage for calculation

      if (bounceX) {
        didBounce = true;

        vx *= -1;
        ({ vx, vy } = increaseSpeed(vx, vy, speedMult));
        scale = increaseSize(scale, growthMult);
        // Use top-level constants for base width/height
        width = logoWidth * scale;
        height = logoHeight * scale;
        ({ vx, vy } = addChaosToVelocity(vx, vy, angleVariation));
        color = getNextColor(color);

        x = nextX <= 0 ? 0 : canvas.width - width;
        y = nextY;
      }

      if (bounceY) {
        didBounce = true;

        vy *= -1;
        if (!bounceX) {
          ({ vx, vy } = increaseSpeed(vx, vy, speedMult));
          scale = increaseSize(scale, growthMult);
          // Use top-level constants for base width/height
          width = logoWidth * scale;
          height = logoHeight * scale;
          ({ vx, vy } = addChaosToVelocity(vx, vy, angleVariation));
          color = getNextColor(color);
        }

        y = nextY <= 0 ? 0 : canvas.height - height;
        if (!bounceX) {
          x = nextX;
        }
      }

      if (!didBounce) {
        x = nextX;
        y = nextY;
      } else {
        if (width >= canvas.width) {
          // Logo became wider than canvas - split it
          const centerX = x + width / 2; // Use the original logo's center
          const centerY = y + height / 2; // Use the original logo's center
          // Create two new logos at the center of the old one
          logosAfterProcessing.push(
            createNewLogo(
              canvas.width,
              canvas.height,
              baseSpeed,
              centerX,
              centerY
            )
          );
          logosAfterProcessing.push(
            createNewLogo(
              canvas.width,
              canvas.height,
              baseSpeed,
              centerX,
              centerY
            )
          );
          return; // Skip adding the old logo to logosAfterProcessing
        } else if (height >= canvas.height) {
          // Logo became taller than canvas - split it
          const centerX = x + width / 2;
          const centerY = y + height / 2;
          logosAfterProcessing.push(
            createNewLogo(
              canvas.width,
              canvas.height,
              baseSpeed,
              centerX,
              centerY
            )
          );
          logosAfterProcessing.push(
            createNewLogo(
              canvas.width,
              canvas.height,
              baseSpeed,
              centerX,
              centerY
            )
          );
          return; // Skip adding the old logo to logosAfterProcessing
        }
      }

      if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) {
        // No code here, but keeping the block for structure
      }
      x = Math.max(0, Math.min(x, canvas.width - width));
      y = Math.max(0, Math.min(y, canvas.height - height));

      const speed = Math.sqrt(vx * vx + vy * vy);
      currentMaxSpeed = Math.max(currentMaxSpeed, speed);
      if (didBounce && speed > maxSpeed && speed > 10) {
        showToast(`🚀 New max speed: ${Math.round(speed)}`);
      }

      // Use the simplified drawing function (which now has access to top-level constants)
      drawSimplifiedLogo(ctx, { ...logo, x, y, color, width, height });

      // If the logo wasn't replaced, add it to the next frame's logos
      logosAfterProcessing.push({
        ...logo,
        x,
        y,
        vx,
        vy,
        color,
        width,
        height,
        scale,
      });
    }); // Added closing bracket for forEach

    // Update the logos reference with the processed logos
    logosRef.current = logosAfterProcessing;
    setMaxSpeed((prevMax) => Math.max(prevMax, currentMaxSpeed));

    animationFrameId.current = requestAnimationFrame(animate);
  }, [
    angleVariation,
    growthMultiplier,
    maxSpeed,
    showToast,
    speedMultiplier,
    baseSpeed,
  ]); // Added missing dependencies

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [animate]);

  useEffect(() => {
    showToast("✨ Tap anywhere to add DVD logos!", 3000);
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const initialX = canvas.width / 2;
        const initialY = canvas.height / 2;
        handleAddLogo(initialX, initialY);
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast]);

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    handleAddLogo(x, y);
  };

  const handleCanvasTouch = (event) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || event.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleAddLogo(x, y);
  };

  const handleButtonPress = (event) => {
    const button = event.currentTarget;
    const pressEffect = document.createElement("div");
    pressEffect.className = "button-press";
    button.style.position = "relative"; // Ensure button is positioned for effect
    button.style.overflow = "hidden"; // Contain effect
    button.appendChild(pressEffect);
    setTimeout(() => {
      if (pressEffect.parentElement) pressEffect.remove();
    }, 500);
  };

  const handleAddButtonClick = (e) => {
    handleButtonPress(e);
    handleAddLogo();
  };

  const handleResetButtonClick = (e) => {
    handleButtonPress(e);
    handleReset();
  };

  const handleToggleControlsClick = (e) => {
    handleButtonPress(e);
    setControlsVisible(!controlsVisible);
    showToast(controlsVisible ? "🎮 Controls hidden" : "🎮 Controls visible");
  };

  return (
    <div className="dvd-bouncer-container">
      {/* Effect Containers */}
      <div ref={particleContainerRef} className="particle-container"></div>
      <div ref={rippleContainerRef} className="ripple-container"></div>
      <div ref={flashContainerRef} className="flash-container"></div>

      <canvas
        ref={canvasRef}
        className="dvd-canvas"
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasTouch}
      />

      {/* Status Indicators */}
      <div className="dvd-status-indicators">
        <InfoDisplay
          label="DVDs"
          value={logos.length}
          color="primary"
          icon="fas fa-tv"
        />
        <InfoDisplay
          label="Max Speed"
          value={Math.round(maxSpeed)}
          color="secondary"
          icon="fas fa-tachometer-alt"
        />
        <StatusIndicator
          status={logos.length > 0 ? "running" : "idle"}
          label={status}
        />
      </div>

      {/* MD3 Control Panel */}
      <ControlPanel
        title="DVD Bouncer Controls"
        position="bottom"
        collapsible={true}
        className={controlsVisible ? "" : "md3-control-panel--collapsed"}
      >
        <ControlGroup label="Simulation Parameters" direction="vertical">
          <SliderControl
            label="Speed Gain"
            value={speedMultiplier}
            onChange={(val) => setSpeedMultiplier(val)}
            min={0}
            max={10}
            step={1}
            unit="%"
            icon="fas fa-tachometer-alt"
          />

          <SliderControl
            label="Growth Rate"
            value={growthMultiplier}
            onChange={(val) => setGrowthMultiplier(val)}
            min={0}
            max={10}
            step={1}
            unit="%"
            icon="fas fa-expand-arrows-alt"
          />

          <SliderControl
            label="Base Speed"
            value={baseSpeed}
            onChange={(val) => setBaseSpeed(val)}
            min={0.5}
            max={10}
            step={0.5}
            unit=""
            icon="fas fa-play"
          />

          <SliderControl
            label="Chaos Level"
            value={angleVariation}
            onChange={(val) => setAngleVariation(val)}
            min={0}
            max={45}
            step={1}
            unit="°"
            icon="fas fa-random"
          />
        </ControlGroup>

        <ControlGroup label="Actions" direction="horizontal">
          <ButtonControl
            variant="filled"
            onClick={handleAddButtonClick}
            icon="fas fa-plus"
          >
            Add Logo
          </ButtonControl>

          <ButtonControl
            variant="outlined"
            onClick={handleResetButtonClick}
            icon="fas fa-redo"
          >
            Reset
          </ButtonControl>

          <ButtonControl
            variant="text"
            onClick={handleToggleControlsClick}
            icon={`fas ${controlsVisible ? "fa-eye-slash" : "fa-eye"}`}
          >
            {controlsVisible ? "Hide" : "Show"}
          </ButtonControl>
        </ControlGroup>
      </ControlPanel>

      {/* Toast Notifications Container */}
      <div id="toast-container" className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast visible`}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DvdBouncer;
