import BaseAnimation from '../BaseAnimation.js';

/**
 * Smooth cell transitions - cells fade in/out when born/dying
 * Creates organic, less jarring visual transitions between generations
 */
class SmoothTransitions extends BaseAnimation {
  constructor(options = {}) {
    super({
      duration: 200,
      intensity: 1.0,
      ...options
    });

    this.birthAnimations = new Map(); // x,y -> animation data
    this.deathAnimations = new Map(); // x,y -> animation data
    this.fadeInDuration = options.fadeInDuration || this.duration;
    this.fadeOutDuration = options.fadeOutDuration || this.duration * 0.8;
  }

  onCellBirth(x, y, timestamp, cellSize) {
    if (!this.enabled) return;

    const key = `${x},${y}`;
    
    // Remove any existing death animation for this cell
    this.deathAnimations.delete(key);

    // Create birth animation
    this.birthAnimations.set(key, {
      x, y,
      startTime: timestamp,
      duration: this.fadeInDuration,
      cellSize,
      progress: 0,
      alpha: 0
    });
  }

  onCellDeath(x, y, timestamp, cellSize) {
    if (!this.enabled) return;

    const key = `${x},${y}`;
    
    // Remove any existing birth animation for this cell
    this.birthAnimations.delete(key);

    // Create death animation
    this.deathAnimations.set(key, {
      x, y,
      startTime: timestamp,
      duration: this.fadeOutDuration,
      cellSize,
      progress: 0,
      alpha: 1
    });
  }

  update(deltaTime) {
    if (!this.enabled) return;

    const currentTime = performance.now();

    // Update birth animations
    for (const [key, animation] of this.birthAnimations) {
      const elapsed = currentTime - animation.startTime;
      animation.progress = Math.min(elapsed / animation.duration, 1);
      animation.alpha = this.easingFunction(animation.progress) * this.intensity;

      // Remove completed animations
      if (animation.progress >= 1) {
        this.birthAnimations.delete(key);
      }
    }

    // Update death animations
    for (const [key, animation] of this.deathAnimations) {
      const elapsed = currentTime - animation.startTime;
      animation.progress = Math.min(elapsed / animation.duration, 1);
      animation.alpha = (1 - this.easingFunction(animation.progress)) * this.intensity;

      // Remove completed animations
      if (animation.progress >= 1) {
        this.deathAnimations.delete(key);
      }
    }
  }

  onRender(ctx, cellSize, theme) {
    if (!this.enabled) return;

    // Get computed colors
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--md-sys-color-primary').trim();
    
    // Render birth animations (fading in)
    this.birthAnimations.forEach(animation => {
      this.renderCell(ctx, animation, primaryColor, cellSize);
    });

    // Render death animations (fading out)
    this.deathAnimations.forEach(animation => {
      this.renderCell(ctx, animation, primaryColor, cellSize);
    });
  }

  renderCell(ctx, animation, color, cellSize) {
    const { x, y, alpha } = animation;
    const px = x * cellSize;
    const py = y * cellSize;

    ctx.save();
    
    // Apply alpha
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    
    // Optional: Add scaling effect for more drama
    if (this.intensity > 0.7) {
      const scale = 0.3 + (alpha * 0.7); // Scale from 30% to 100%
      const centerX = px + cellSize / 2;
      const centerY = py + cellSize / 2;
      
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
    }
    
    // Draw cell
    ctx.fillStyle = color;
    ctx.fillRect(px, py, cellSize, cellSize);
    
    ctx.restore();
  }

  // Configuration for settings UI
  static getConfigSchema() {
    return {
      ...super.getConfigSchema(),
      fadeInDuration: { 
        type: 'range', 
        min: 50, 
        max: 500, 
        step: 25, 
        default: 200, 
        label: 'Fade In Duration (ms)' 
      },
      fadeOutDuration: { 
        type: 'range', 
        min: 50, 
        max: 500, 
        step: 25, 
        default: 160, 
        label: 'Fade Out Duration (ms)' 
      },
      easingFunction: {
        type: 'select',
        options: [
          { value: 'easeOutCubic', label: 'Ease Out Cubic' },
          { value: 'easeInOutCubic', label: 'Ease In-Out Cubic' },
          { value: 'linear', label: 'Linear' }
        ],
        default: 'easeOutCubic',
        label: 'Easing Function'
      }
    };
  }

  // Custom setters for dynamic configuration
  setFadeInDuration(duration) {
    this.fadeInDuration = Math.max(50, duration);
  }

  setFadeOutDuration(duration) {
    this.fadeOutDuration = Math.max(50, duration);
  }

  cleanup() {
    this.birthAnimations.clear();
    this.deathAnimations.clear();
  }
}

export default SmoothTransitions;