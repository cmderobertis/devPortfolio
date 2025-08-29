import BaseAnimation from '../BaseAnimation.js';

/**
 * Ripple effects - creates expanding circles when cells change state
 * Shows the "influence" spreading through the grid
 */
class RippleEffect extends BaseAnimation {
  constructor(options = {}) {
    super({
      duration: 800,
      intensity: 0.6,
      ...options
    });

    this.ripples = new Map(); // Stores active ripples
    this.maxRadius = options.maxRadius || 100;
    this.birthColor = options.birthColor || 'rgba(0, 255, 0, 0.3)';
    this.deathColor = options.deathColor || 'rgba(255, 0, 0, 0.3)';
    this.rippleWidth = options.rippleWidth || 2;
  }

  onCellBirth(x, y, timestamp, cellSize) {
    if (!this.enabled) return;
    this.createRipple(x, y, timestamp, cellSize, 'birth');
  }

  onCellDeath(x, y, timestamp, cellSize) {
    if (!this.enabled) return;
    this.createRipple(x, y, timestamp, cellSize, 'death');
  }

  createRipple(x, y, timestamp, cellSize, type) {
    const id = `${type}_${x}_${y}_${timestamp}`;
    
    this.ripples.set(id, {
      x: x * cellSize + cellSize / 2, // Center of cell
      y: y * cellSize + cellSize / 2,
      startTime: timestamp,
      duration: this.duration,
      maxRadius: this.maxRadius * this.intensity,
      type,
      progress: 0,
      radius: 0,
      alpha: this.intensity
    });
  }

  update(deltaTime) {
    if (!this.enabled) return;

    const currentTime = performance.now();

    for (const [id, ripple] of this.ripples) {
      const elapsed = currentTime - ripple.startTime;
      ripple.progress = Math.min(elapsed / ripple.duration, 1);
      
      // Ease out for smooth expansion
      const easedProgress = this.easeOutCubic(ripple.progress);
      ripple.radius = easedProgress * ripple.maxRadius;
      
      // Fade out over time
      ripple.alpha = (1 - ripple.progress) * this.intensity;

      // Remove completed ripples
      if (ripple.progress >= 1) {
        this.ripples.delete(id);
      }
    }
  }

  onRender(ctx, cellSize, theme) {
    if (!this.enabled) return;

    ctx.save();

    this.ripples.forEach(ripple => {
      const { x, y, radius, alpha, type } = ripple;
      
      if (radius > 0 && alpha > 0) {
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = type === 'birth' ? this.getBirthColor() : this.getDeathColor();
        ctx.lineWidth = this.rippleWidth;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  getBirthColor() {
    // Use theme-aware colors
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue('--md-sys-color-primary').trim();
    return this.addAlpha(primary, 0.3 * this.intensity);
  }

  getDeathColor() {
    const error = getComputedStyle(document.documentElement)
      .getPropertyValue('--md-sys-color-error').trim() || '#ff4444';
    return this.addAlpha(error, 0.3 * this.intensity);
  }

  addAlpha(color, alpha) {
    // Convert hex/rgb to rgba with alpha
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else if (color.startsWith('rgb')) {
      return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    }
    return `rgba(128, 128, 128, ${alpha})`; // fallback
  }

  // Configuration schema
  static getConfigSchema() {
    return {
      ...super.getConfigSchema(),
      maxRadius: {
        type: 'range',
        min: 20,
        max: 200,
        step: 10,
        default: 100,
        label: 'Max Ripple Radius'
      },
      rippleWidth: {
        type: 'range',
        min: 1,
        max: 8,
        step: 1,
        default: 2,
        label: 'Ripple Width'
      },
      duration: {
        type: 'range',
        min: 200,
        max: 2000,
        step: 100,
        default: 800,
        label: 'Ripple Duration (ms)'
      }
    };
  }

  // Custom setters
  setMaxRadius(radius) {
    this.maxRadius = Math.max(20, Math.min(200, radius));
  }

  setRippleWidth(width) {
    this.rippleWidth = Math.max(1, Math.min(8, width));
  }

  cleanup() {
    this.ripples.clear();
  }
}

export default RippleEffect;