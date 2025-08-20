// Canvas Utilities
// General canvas drawing and animation helpers extracted from various components

// Canvas setup and configuration
export const setupCanvas = (canvas, options = {}) => {
  if (!canvas) return null;
  
  const {
    width = window.innerWidth,
    height = window.innerHeight,
    scale = devicePixelRatio || 1
  } = options;
  
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  
  return ctx;
};

// Clear canvas with optional background color
export const clearCanvas = (ctx, canvas, backgroundColor = 'transparent') => {
  if (!ctx || !canvas) return;
  
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  if (backgroundColor === 'transparent') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  ctx.restore();
};

// Drawing primitives
export const drawCircle = (ctx, x, y, radius, fillStyle = '#000', strokeStyle = null, lineWidth = 1) => {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  
  ctx.restore();
};

export const drawRectangle = (ctx, x, y, width, height, fillStyle = '#000', strokeStyle = null, lineWidth = 1) => {
  ctx.save();
  
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fillRect(x, y, width, height);
  }
  
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, width, height);
  }
  
  ctx.restore();
};

export const drawLine = (ctx, x1, y1, x2, y2, strokeStyle = '#000', lineWidth = 1) => {
  ctx.save();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
};

// Text drawing utilities
export const drawText = (ctx, text, x, y, options = {}) => {
  const {
    font = '16px Arial',
    fillStyle = '#000',
    strokeStyle = null,
    lineWidth = 1,
    textAlign = 'left',
    textBaseline = 'top',
    maxWidth = null
  } = options;
  
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = fillStyle;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  
  if (maxWidth) {
    ctx.fillText(text, x, y, maxWidth);
  } else {
    ctx.fillText(text, x, y);
  }
  
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    if (maxWidth) {
      ctx.strokeText(text, x, y, maxWidth);
    } else {
      ctx.strokeText(text, x, y);
    }
  }
  
  ctx.restore();
};

// Animation frame management
export class AnimationManager {
  constructor() {
    this.animationId = null;
    this.isRunning = false;
    this.callbacks = new Set();
  }
  
  addCallback(callback) {
    this.callbacks.add(callback);
  }
  
  removeCallback(callback) {
    this.callbacks.delete(callback);
  }
  
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }
  
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isRunning = false;
  }
  
  animate = () => {
    if (!this.isRunning) return;
    
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Animation callback error:', error);
      }
    });
    
    this.animationId = requestAnimationFrame(this.animate);
  }
}

// Canvas event handling utilities
export const getCanvasCoordinates = (canvas, event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  let clientX, clientY;
  
  if (event.touches && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }
  
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
};

// Transform utilities
export const applyTransform = (ctx, transform) => {
  const { tx = 0, ty = 0, scale = 1, rotation = 0 } = transform;
  
  ctx.save();
  ctx.translate(tx, ty);
  if (rotation !== 0) {
    ctx.rotate(rotation);
  }
  if (scale !== 1) {
    ctx.scale(scale, scale);
  }
  
  return () => ctx.restore(); // Return cleanup function
};

// Grid drawing utility
export const drawGrid = (ctx, canvas, cellSize = 20, strokeStyle = '#ddd', lineWidth = 1) => {
  ctx.save();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  
  const width = canvas.width;
  const height = canvas.height;
  
  // Vertical lines
  for (let x = 0; x <= width; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 0; y <= height; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  ctx.restore();
};

// Performance utilities
export const withPerformanceMonitoring = (callback, label = 'Canvas Operation') => {
  return (...args) => {
    const start = performance.now();
    const result = callback(...args);
    const end = performance.now();
    
    if (end - start > 16) { // Log if operation takes longer than one frame
      console.warn(`${label} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };
};