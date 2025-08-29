/**
 * Base class for all GameOfLife animations
 * Provides common interface and lifecycle hooks
 */
class BaseAnimation {
  constructor(options = {}) {
    this.enabled = options.enabled ?? true;
    this.intensity = options.intensity ?? 1.0;
    this.duration = options.duration ?? 300; // ms
    this.easingFunction = options.easing ?? this.easeOutCubic;
    
    // Animation state
    this.activeAnimations = new Map();
    this.animationId = 0;
  }

  // Lifecycle hooks - override in subclasses
  onCellBirth(x, y, timestamp, cellSize) {}
  onCellDeath(x, y, timestamp, cellSize) {}
  onGenerationUpdate(oldGrid, newGrid, timestamp) {}
  onRender(ctx, cellSize, theme) {}
  
  // Animation management
  update(deltaTime) {
    if (!this.enabled) return;
    
    // Update all active animations
    for (const [id, animation] of this.activeAnimations) {
      animation.elapsed += deltaTime;
      animation.progress = Math.min(animation.elapsed / animation.duration, 1);
      
      // Remove completed animations
      if (animation.progress >= 1) {
        this.activeAnimations.delete(id);
      }
    }
  }

  // Utility methods
  createAnimation(data, duration = this.duration) {
    const id = this.animationId++;
    const animation = {
      id,
      elapsed: 0,
      progress: 0,
      duration,
      data
    };
    this.activeAnimations.set(id, animation);
    return animation;
  }

  // Easing functions
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Settings
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.cleanup();
    }
  }

  setIntensity(intensity) {
    this.intensity = Math.max(0, Math.min(1, intensity));
  }

  // Cleanup
  cleanup() {
    this.activeAnimations.clear();
  }

  // Configuration for settings UI
  static getConfigSchema() {
    return {
      enabled: { type: 'boolean', default: true, label: 'Enable Effect' },
      intensity: { type: 'range', min: 0, max: 1, step: 0.1, default: 1.0, label: 'Intensity' },
      duration: { type: 'range', min: 100, max: 1000, step: 50, default: 300, label: 'Duration (ms)' }
    };
  }
}

export default BaseAnimation;