// Constants
export const logoWidth = 160;
export const logoHeight = 100;

// DVD Logo SVG path data (simplified for Path2D)
export const dvdLogoPath = [
    // Outer shape
    "M40,0 L120,0 C140,0 160,20 160,40 L160,60 C160,80 140,100 120,100 L40,100 C20,100 0,80 0,60 L0,40 C0,20 20,0 40,0 Z",
    // Inner cutout - Note: Path2D doesn't directly support cutouts like SVG fill-rules.
    // We'll handle this by drawing the outer path, then the inner path with background color, or using compositing.
    // For simplicity here, we might just draw the outer path and simulate the look.
    // Or, draw outer, then draw inner with background color (less robust).
    // Let's stick to drawing the outer shape and text separately if needed.
    // "M50,20 L110,20 C120,20 130,30 130,40 L130,60 C130,70 120,80 110,80 L50,80 C40,80 30,70 30,60 L30,40 C30,30 40,20 50,20 Z",
    // "DVD" letters - This is complex to draw directly. We'll omit for simplicity or draw simple text.
    // "M65,35 L65,65 L75,65 L75,50 L90,65 L100,65 L100,35 L90,35 L90,50 L75,35 Z"
];

// Colors for the DVD logo
export const colors = [
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FF00FF', // Magenta
    '#FFFF00', // Yellow
    '#00FFFF', // Cyan
    '#FF8000', // Orange
    '#8000FF'  // Purple
];

// Utility Functions

// Get a random number in a range
export function getRand(min, max) {
    return min + Math.random() * (max - min);
}

// Check for boundary collisions
export function checkBoundaryCollide(x, y, vx, vy, currentWidth, currentHeight, canvasWidth, canvasHeight) {
    const nextX = x + vx;
    const nextY = y + vy;
    let bounceX = false;
    let bounceY = false;

    if (nextX <= 0 || nextX + currentWidth >= canvasWidth) {
        bounceX = true;
    }
    if (nextY <= 0 || nextY + currentHeight >= canvasHeight) {
        bounceY = true;
    }

    return { bounceX, bounceY };
}

// Add random variation to the bounce angle
export function addChaosToVelocity(vx, vy, angleVariationDegrees) {
    const currentAngle = Math.atan2(vy, vx);
    const currentSpeed = Math.sqrt(vx * vx + vy * vy);

    if (currentSpeed === 0) return { vx: 0, vy: 0 }; // Avoid division by zero

    const angleChange = getRand(0, angleVariationDegrees) * (Math.PI / 180);
    const newAngle = currentAngle + angleChange;

    return {
        vx: Math.cos(newAngle) * currentSpeed,
        vy: Math.sin(newAngle) * currentSpeed
    };
}

// Function to increase speed with each bounce
export function increaseSpeed(vx, vy, speedMultiplier) {
    const currentSpeed = Math.sqrt(vx * vx + vy * vy);
    const newSpeed = currentSpeed * (1 + speedMultiplier);
    // Prevent speed from becoming zero if currentSpeed is zero
    const ratio = currentSpeed === 0 ? 1 : newSpeed / currentSpeed;
    return {
        vx: vx * ratio,
        vy: vy * ratio
    };
}

// Function to increase size with each bounce
export function increaseSize(currentScale, growthMultiplier) {
    return currentScale * (1 + growthMultiplier);
}

// Function to create a new logo object
export function createNewLogo(canvasWidth, canvasHeight, baseSpeed) {
    const initialWidth = logoWidth; // Start with base size
    const initialHeight = logoHeight;
    const randomX = Math.random() * Math.max(0, canvasWidth - initialWidth);
    const randomY = Math.random() * Math.max(0, canvasHeight - initialHeight);

    return {
        id: Date.now() + Math.random(), // Simple unique ID
        x: randomX,
        y: randomY,
        vx: getRand(baseSpeed * 0.5, baseSpeed * 1.5) * (Math.random() > 0.5 ? 1 : -1),
        vy: getRand(baseSpeed * 0.5, baseSpeed * 1.5) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
        width: initialWidth,
        height: initialHeight,
        scale: 1.0
    };
}

// Helper function to lighten or darken a color
export function shadeColor(color, percent) {
    let R = parseInt(color.substring(1,3), 16);
    let G = parseInt(color.substring(3,5), 16);
    let B = parseInt(color.substring(5,7), 16);

    R = parseInt(String(R * (100 + percent) / 100), 10);
    G = parseInt(String(G * (100 + percent) / 100), 10);
    B = parseInt(String(B * (100 + percent) / 100), 10);

    R = Math.min(255, Math.max(0, R));
        G = Math.min(255, Math.max(0, G));
        B = Math.min(255, Math.max(0, B));
    
        const RR = R.toString(16).padStart(2, '0');
        const GG = G.toString(16).padStart(2, '0');
        const BB = B.toString(16).padStart(2, '0');
    
        return "#"+RR+GG+BB;
    }

// Function to draw a single logo on the canvas
export function drawLogoOnCanvas(ctx, logo) {
    const { x, y, color, width, height } = logo;

    // Draw glow effect first
    const glowColor = color;
    const glowAlpha = 0.6;
    ctx.save();
    ctx.translate(x, y);
    const glowScaleX = width / logoWidth * 1.1;
    const glowScaleY = height / logoHeight * 1.1;
    ctx.scale(glowScaleX, glowScaleY);
    ctx.fillStyle = glowColor;
    ctx.globalAlpha = glowAlpha;
    ctx.filter = 'blur(8px)';
    const outerPath = new Path2D(dvdLogoPath[0]);
    ctx.fill(outerPath);
    ctx.restore();

    // Draw the actual logo
    ctx.save();
    ctx.translate(x, y);
    const scaleX = width / logoWidth;
    const scaleY = height / logoHeight;
    ctx.scale(scaleX, scaleY);

    // Metallic gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, logoHeight);
    gradient.addColorStop(0, shadeColor(color, 20));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, shadeColor(color, -20));
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 1;
    ctx.filter = 'none';

    // Draw main path
    ctx.fill(outerPath); // Use the same Path2D object

    // Subtle highlight
    const highlight = ctx.createLinearGradient(0, 10, logoWidth, 20);
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0)');
    highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlight;
    ctx.fill(outerPath); // Fill again with highlight

    // Optionally draw "DVD" text (simple version)
    ctx.fillStyle = 'black';
    ctx.font = 'bold 40px sans-serif'; // Adjust font as needed
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DVD', logoWidth / 2, logoHeight / 2 + 5); // Adjust positioning

    ctx.restore();
}

// Function to get the next color, avoiding repetition
export function getNextColor(currentColor) {
    let nextColor = colors[Math.floor(Math.random() * colors.length)];
    while (colors.length > 1 && nextColor === currentColor) {
        nextColor = colors[Math.floor(Math.random() * colors.length)];
    }
    return nextColor;
}
