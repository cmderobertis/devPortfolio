import AnimationRegistry from './AnimationRegistry.js';

/**
 * Central animation manager for GameOfLife
 * Orchestrates all animation effects and manages their lifecycle
 */
class AnimationManager {
  constructor(canvas, theme) {
    this.canvas = canvas;
    this.theme = theme;
    this.activeEffects = new Map();
    this.settings = new Map();
    this.lastUpdate = performance.now();
    
    // Performance monitoring
    this.performanceMode = 'auto'; // 'high', 'medium', 'low', 'auto'
    this.frameTime = 0;
    this.frameTimeHistory = [];
    this.maxFrameTimeHistory = 60;
    
    // Animation layers
    this.layers = {
      background: [], // Grid effects, ambient animations
      cells: [],      // Cell-specific animations
      foreground: [], // Particles, ripples
      ui: []          // UI overlays, debug info
    };
  }

  /**
   * Enable an animation effect
   * @param {string} effectName - Name of the effect
   * @param {object} options - Effect configuration
   * @returns {boolean} Success status
   */
  enable(effectName, options = {}) {
    if (!AnimationRegistry.has(effectName)) {
      console.error(`Animation effect '${effectName}' not found`);
      return false;
    }

    // Create effect instance
    const effect = AnimationRegistry.create(effectName, options);
    if (!effect) return false;

    // Store in active effects
    this.activeEffects.set(effectName, effect);
    this.settings.set(effectName, options);

    // Add to appropriate layer
    const metadata = AnimationRegistry.getMetadata(effectName);
    const layer = metadata.layer || 'cells';
    if (this.layers[layer]) {
      this.layers[layer].push(effect);
    }

    console.log(`✓ Enabled animation: ${effectName}`);
    return true;
  }

  /**
   * Disable an animation effect
   * @param {string} effectName - Name of the effect
   */
  disable(effectName) {
    const effect = this.activeEffects.get(effectName);
    if (effect) {
      effect.cleanup();
      this.activeEffects.delete(effectName);
      
      // Remove from all layers
      Object.values(this.layers).forEach(layer => {
        const index = layer.indexOf(effect);
        if (index > -1) {
          layer.splice(index, 1);
        }
      });

      console.log(`✓ Disabled animation: ${effectName}`);
    }
  }

  /**
   * Toggle an animation effect
   * @param {string} effectName - Name of the effect
   * @param {object} options - Effect configuration (if enabling)
   * @returns {boolean} New enabled state
   */
  toggle(effectName, options = {}) {
    if (this.isEnabled(effectName)) {
      this.disable(effectName);
      return false;
    } else {
      this.enable(effectName, options);
      return true;
    }
  }

  /**
   * Check if an effect is enabled
   * @param {string} effectName - Name of the effect
   * @returns {boolean} Enabled state
   */
  isEnabled(effectName) {
    return this.activeEffects.has(effectName);
  }

  /**
   * Update effect settings
   * @param {string} effectName - Name of the effect
   * @param {object} newSettings - New settings to apply
   */
  updateSettings(effectName, newSettings) {
    const effect = this.activeEffects.get(effectName);
    if (effect) {
      // Apply new settings to effect
      Object.entries(newSettings).forEach(([key, value]) => {
        if (typeof effect[`set${key.charAt(0).toUpperCase() + key.slice(1)}`] === 'function') {
          effect[`set${key.charAt(0).toUpperCase() + key.slice(1)}`](value);
        } else if (key in effect) {
          effect[key] = value;
        }
      });

      // Update stored settings
      this.settings.set(effectName, { ...this.settings.get(effectName), ...newSettings });
    }
  }

  /**
   * Event: Cell was born
   * @param {number} x - Cell X coordinate
   * @param {number} y - Cell Y coordinate
   * @param {number} cellSize - Size of cells
   */
  onCellBirth(x, y, cellSize) {
    const timestamp = performance.now();
    this.activeEffects.forEach(effect => {
      if (effect.enabled) {
        effect.onCellBirth(x, y, timestamp, cellSize);
      }
    });
  }

  /**
   * Event: Cell died
   * @param {number} x - Cell X coordinate
   * @param {number} y - Cell Y coordinate
   * @param {number} cellSize - Size of cells
   */
  onCellDeath(x, y, cellSize) {
    const timestamp = performance.now();
    this.activeEffects.forEach(effect => {
      if (effect.enabled) {
        effect.onCellDeath(x, y, timestamp, cellSize);
      }
    });
  }

  /**
   * Event: Generation updated
   * @param {Array} oldGrid - Previous generation grid
   * @param {Array} newGrid - New generation grid
   */
  onGenerationUpdate(oldGrid, newGrid) {
    const timestamp = performance.now();
    
    // Detect changes and trigger appropriate events
    if (oldGrid && oldGrid.length && newGrid && newGrid.length) {
      for (let x = 0; x < Math.min(oldGrid.length, newGrid.length); x++) {
        for (let y = 0; y < Math.min(oldGrid[x].length, newGrid[x].length); y++) {
          const wasAlive = oldGrid[x][y] === 1;
          const isAlive = newGrid[x][y] === 1;
          
          if (!wasAlive && isAlive) {
            this.onCellBirth(x, y, this.getCellSize());
          } else if (wasAlive && !isAlive) {
            this.onCellDeath(x, y, this.getCellSize());
          }
        }
      }
    }

    // Notify all effects of generation update
    this.activeEffects.forEach(effect => {
      if (effect.enabled) {
        effect.onGenerationUpdate(oldGrid, newGrid, timestamp);
      }
    });
  }

  /**
   * Update all animations
   * @param {number} timestamp - Current timestamp
   */
  update(timestamp = performance.now()) {
    const deltaTime = timestamp - this.lastUpdate;
    this.lastUpdate = timestamp;

    // Update frame time tracking
    this.updateFrameTime(deltaTime);

    // Auto-adjust performance if needed
    if (this.performanceMode === 'auto') {
      this.autoAdjustPerformance();
    }

    // Update all active effects
    this.activeEffects.forEach(effect => {
      if (effect.enabled) {
        effect.update(deltaTime);
      }
    });
  }

  /**
   * Render all animations
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} cellSize - Size of cells
   */
  render(ctx, cellSize) {
    // Render each layer in order
    ['background', 'cells', 'foreground', 'ui'].forEach(layerName => {
      this.layers[layerName].forEach(effect => {
        if (effect.enabled) {
          effect.onRender(ctx, cellSize, this.theme);
        }
      });
    });
  }

  /**
   * Get current cell size (helper method)
   * @returns {number} Cell size
   */
  getCellSize() {
    // This would be passed from the GameCanvas component
    return this.cellSize || 10;
  }

  /**
   * Set cell size
   * @param {number} size - Cell size
   */
  setCellSize(size) {
    this.cellSize = size;
  }

  /**
   * Performance monitoring
   */
  updateFrameTime(deltaTime) {
    this.frameTime = deltaTime;
    this.frameTimeHistory.push(deltaTime);
    
    if (this.frameTimeHistory.length > this.maxFrameTimeHistory) {
      this.frameTimeHistory.shift();
    }
  }

  getAverageFrameTime() {
    if (this.frameTimeHistory.length === 0) return 0;
    return this.frameTimeHistory.reduce((a, b) => a + b) / this.frameTimeHistory.length;
  }

  autoAdjustPerformance() {
    const avgFrameTime = this.getAverageFrameTime();
    const targetFrameTime = 16.67; // 60 FPS
    
    if (avgFrameTime > targetFrameTime * 1.5) {
      // Performance is poor, reduce quality
      this.activeEffects.forEach(effect => {
        if (effect.setIntensity) {
          effect.setIntensity(effect.intensity * 0.9);
        }
      });
    } else if (avgFrameTime < targetFrameTime * 0.8) {
      // Performance is good, can increase quality
      this.activeEffects.forEach(effect => {
        if (effect.setIntensity && effect.intensity < 1.0) {
          effect.setIntensity(Math.min(1.0, effect.intensity * 1.1));
        }
      });
    }
  }

  /**
   * Export current configuration
   * @returns {object} Configuration object
   */
  exportConfig() {
    const config = {};
    this.settings.forEach((settings, effectName) => {
      config[effectName] = { ...settings };
    });
    return config;
  }

  /**
   * Import configuration
   * @param {object} config - Configuration to import
   */
  importConfig(config) {
    Object.entries(config).forEach(([effectName, settings]) => {
      if (settings.enabled) {
        this.enable(effectName, settings);
      }
    });
  }

  /**
   * Get performance stats
   * @returns {object} Performance statistics
   */
  getPerformanceStats() {
    return {
      activeEffects: this.activeEffects.size,
      frameTime: this.frameTime,
      averageFrameTime: this.getAverageFrameTime(),
      performanceMode: this.performanceMode,
      layers: Object.fromEntries(
        Object.entries(this.layers).map(([name, effects]) => [name, effects.length])
      )
    };
  }

  /**
   * Cleanup all effects
   */
  cleanup() {
    this.activeEffects.forEach(effect => effect.cleanup());
    this.activeEffects.clear();
    this.settings.clear();
    
    Object.keys(this.layers).forEach(layer => {
      this.layers[layer] = [];
    });
  }
}

export default AnimationManager;