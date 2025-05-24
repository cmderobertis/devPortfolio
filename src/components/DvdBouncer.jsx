import React, { useState, useEffect, useRef, useCallback } from 'react';
// Move imports needed by drawSimplifiedLogo to the top level
import {
    logoWidth as importedLogoWidth, // Rename to avoid conflict if needed later
    logoHeight as importedLogoHeight,
    dvdLogoPath as importedDvdLogoPath,
    shadeColor
} from '../utils/dvdLogic';

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
    getNextColor
} from '../utils/dvdLogic';
import './DvdBouncer.css'; // Import component CSS
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS

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
    ctx.filter = 'none';

    // Use the top-level constant
    const outerPath = new Path2D(dvdLogoPath[0]);
    ctx.fill(outerPath);

    // Simple "DVD" text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Whiteish text
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Use the top-level constants
    ctx.fillText('DVD', logoWidth / 2, logoHeight / 2 + 5);

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
    const [status, setStatus] = useState('🔄 DVD Bouncer Ready!');

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
        setToasts(prev => [...prev, { id, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
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
            const particle = document.createElement('div');
            particle.className = 'particle simple'; // Add 'simple' class
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

     // --- Ripple Effect (Keep or Remove) ---
     const createRipple = useCallback((x, y, size = 100) => {
         const container = rippleContainerRef.current;
         if (!container) return;
         const ripple = document.createElement('div');
         ripple.className = 'ripple simple'; // Add 'simple' class
         ripple.style.width = `${size}px`;
         ripple.style.height = `${size}px`;
         ripple.style.left = `${x - size / 2}px`;
         ripple.style.top = `${y - size / 2}px`;
         container.appendChild(ripple);
         setTimeout(() => {
             if (ripple.parentElement) ripple.remove();
         }, 1000);
     }, []);

     // --- Impact Flash Effect (Keep or Remove) ---
     const createImpactFlash = useCallback((side, position, dimension) => {
         const container = flashContainerRef.current;
         if (!container) return;
         const flash = document.createElement('div');
         flash.className = 'impact-flash simple'; // Add 'simple' class
         if (side === 'left' || side === 'right') {
             flash.style.top = `${position}px`;
             flash.style.height = `${dimension}px`;
             if (side === 'left') flash.style.left = '0';
             else flash.style.right = '0';
         } else {
             flash.style.left = `${position}px`;
             flash.style.width = `${dimension}px`;
             if (side === 'top') flash.style.top = '0';
             else flash.style.bottom = '0';
         }
         container.appendChild(flash);
         setTimeout(() => {
             if (flash.parentElement) flash.remove();
         }, 300);
     }, []);

    const handleAddLogo = useCallback((x = null, y = null) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // Use top-level logoWidth/Height if createNewLogo needs them
        const newLogoData = createNewLogo(canvas.width, canvas.height, baseSpeed);
        if (x !== null && y !== null) {
            newLogoData.x = Math.max(0, Math.min(x - newLogoData.width / 2, canvas.width - newLogoData.width));
            newLogoData.y = Math.max(0, Math.min(y - newLogoData.height / 2, canvas.height - newLogoData.height));
        }
        setLogos(prev => [...prev, newLogoData]);
        updateStatus(`${logosRef.current.length + 1} DVD logo${logosRef.current.length === 0 ? '' : 's'} bouncing`);
        showToast(`Added DVD Logo #${logosRef.current.length + 1}`);
        if (x !== null && y !== null) {
           createRipple(x, y);
        }
    }, [baseSpeed, showToast, updateStatus, createRipple]); // Removed logoWidth, logoHeight dependency as they are top-level now

    const handleReset = useCallback(() => {
        setLogos([]);
        setMaxSpeed(0);
        updateStatus('🔄 Simulation reset');
        showToast('🔄 Simulation reset');
        const canvas = canvasRef.current;
        if (canvas) {
           createRipple(canvas.width / 2, canvas.height / 2, 300);
        }
    }, [showToast, updateStatus, createRipple]);

    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let currentMaxSpeed = 0;
        const logosAfterProcessing = [];
        logosRef.current.forEach(logo => { // Iterate over the current logos
            let { x, y, vx, vy, color, width, height, scale } = logo;

            let nextX = x + vx;
            let nextY = y + vy;

            // Use top-level logoWidth/Height if checkBoundaryCollide needs them
            const { bounceX, bounceY } = checkBoundaryCollide(x, y, vx, vy, width, height, canvas.width, canvas.height);

            let didBounce = false;
            const speedMult = speedMultiplier / 100; // Convert percentage for calculation
            const growthMult = growthMultiplier / 100; // Convert percentage for calculation

            if (bounceX) {
                didBounce = true;
                const particleX = nextX <= 0 ? x : x + width;
                const particleY = y + height / 2;
                createParticles(particleX, particleY, 20, color);
                createImpactFlash(nextX <= 0 ? 'left' : 'right', y, height);

                vx *= -1;
                ({ vx, vy } = increaseSpeed(vx, vy, speedMult));
                scale = increaseSize(scale, growthMult);
                // Use top-level constants for base width/height
                width = logoWidth * scale;
                height = logoHeight * scale;
                ({ vx, vy } = addChaosToVelocity(vx, vy, angleVariation));
                color = getNextColor(color);

                x = (nextX <= 0) ? 0 : canvas.width - width;
                y = nextY;
            }

             if (bounceY) {
                didBounce = true;
                const particleX = x + width / 2;
                const particleY = nextY <= 0 ? y : y + height;
                createParticles(particleX, particleY, 20, color);
                createImpactFlash(nextY <= 0 ? 'top' : 'bottom', x, width);

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

                y = (nextY <= 0) ? 0 : canvas.height - height;
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
                    logosAfterProcessing.push(createNewLogo(canvas.width, canvas.height, baseSpeed, centerX, centerY));
                    logosAfterProcessing.push(createNewLogo(canvas.width, canvas.height, baseSpeed, centerX, centerY));
                    return; // Skip adding the old logo to logosAfterProcessing
                } else if (height >= canvas.height) {
                    // Logo became taller than canvas - split it
                    const centerX = x + width / 2;
                    const centerY = y + height / 2;
                    logosAfterProcessing.push(createNewLogo(canvas.width, canvas.height, baseSpeed, centerX, centerY));
                    logosAfterProcessing.push(createNewLogo(canvas.width, canvas.height, baseSpeed, centerX, centerY));
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
            logosAfterProcessing.push({ ...logo, x, y, vx, vy, color, width, height, scale });
        }); // Added closing bracket for forEach

        // Update the logos reference with the processed logos
        logosRef.current = logosAfterProcessing;
        setMaxSpeed(prevMax => Math.max(prevMax, currentMaxSpeed));

        animationFrameId.current = requestAnimationFrame(animate);
    }, [angleVariation, createImpactFlash, createParticles, growthMultiplier, maxSpeed, showToast, speedMultiplier, baseSpeed]); // Added missing dependencies

    useEffect(() => {
        animationFrameId.current = requestAnimationFrame(animate);
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [animate]);

    useEffect(() => {
        showToast('✨ Tap anywhere to add DVD logos!', 3000);
        const timer = setTimeout(() => {
            const canvas = canvasRef.current;
            if (canvas) {
                const initialX = canvas.width / 2;
                const initialY = canvas.height / 2;
                createRipple(initialX, initialY, 200);
                handleAddLogo(initialX, initialY);
            }
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showToast, createRipple]);

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
        const pressEffect = document.createElement('div');
        pressEffect.className = 'button-press';
        button.style.position = 'relative'; // Ensure button is positioned for effect
        button.style.overflow = 'hidden'; // Contain effect
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
         showToast(controlsVisible ? '🎮 Controls hidden' : '🎮 Controls visible');
    };

    return (
        <div className="dvd-bouncer-container">
            {/* Status and Speed Indicator (Simplified Look) */}
            <div id="status" className={`status-display ${status ? 'visible' : ''}`}>
                {status}
            </div>
            <div id="speed-indicator" className="speed-indicator">
                {Math.round(maxSpeed)}
            </div>

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

            {/* Controls Panel */}
            <div id="controls" className={`controls ${controlsVisible ? '' : 'hidden'}`}>
                {/* Speed Multiplier Control */}
                <div className="control-group">
                    <label htmlFor="speed-multiplier" className="control-label">Speed Gain</label>
                    <input
                        type="range"
                        id="speed-multiplier"
                        min="0"
                        max="10"
                        step="1"
                        value={speedMultiplier}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setSpeedMultiplier(val);
                            // showToast(`Speed gain set to ${val}%`); // Optional: Keep toast?
                        }}
                    />
                    <span className="control-value">{speedMultiplier}%</span>
                    <i className="fas fa-tachometer-alt control-icon"></i> {/* Font Awesome Icon */}
                </div>

                 {/* Growth Multiplier Control */}
                <div className="control-group">
                     <label htmlFor="growth-multiplier" className="control-label">Growth</label>
                    <input
                        type="range"
                        id="growth-multiplier"
                        min="0"
                        max="10"
                        step="1"
                        value={growthMultiplier}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setGrowthMultiplier(val);
                           // showToast(`Growth set to ${val}%`);
                        }}
                    />
                    <span className="control-value">{growthMultiplier}%</span>
                     <i className="fas fa-expand-arrows-alt control-icon"></i>
                </div>

                {/* Base Speed Control */}
                <div className="control-group">
                    <label htmlFor="base-speed" className="control-label">Base Speed</label>
                     <input
                        type="range"
                        id="base-speed"
                        min="0.5"
                        max="10" // Increased max slightly
                        step="0.5"
                        value={baseSpeed}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setBaseSpeed(val);
                           // showToast(`Base speed set to ${val.toFixed(1)}`);
                        }}
                    />
                    <span className="control-value">{baseSpeed.toFixed(1)}</span>
                     <i className="fas fa-play control-icon"></i>
                </div>

                {/* Angle Variation Control */}
                <div className="control-group">
                    <label htmlFor="angle-variation" className="control-label">Chaos</label>
                    <input
                        type="range"
                        id="angle-variation"
                        min="0"
                        max="45"
                        step="1" // Finer step
                        value={angleVariation}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setAngleVariation(val);
                           // showToast(`Angle chaos set to ${val}°`);
                        }}
                    />
                    <span className="control-value">{angleVariation}°</span>
                    <i className="fas fa-random control-icon"></i>
                </div>

                {/* Action Buttons */}
                <div className="button-row">
                    <button title="Add Logo" id="add-logo-button" onClick={handleAddButtonClick}>
                         <i className="fas fa-plus"></i> {/* Icon only */}
                    </button>
                    <button title="Reset" id="reset-button" onClick={handleResetButtonClick}>
                         <i className="fas fa-redo"></i> {/* Icon only */}
                    </button>
                </div>
            </div>

            {/* Toggle Controls Button */}
            <button id="control-toggle" className="control-toggle" title="Toggle Controls" onClick={handleToggleControlsClick}>
                 <i className={`fas ${controlsVisible ? 'fa-times' : 'fa-sliders-h'}`}></i>
             </button>

            {/* Toast Notifications Container */}
            <div id="toast-container" className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast visible`}>
                        {toast.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DvdBouncer;