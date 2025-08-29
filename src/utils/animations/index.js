// Animation system exports and registration
import AnimationManager from './AnimationManager.js';
import AnimationRegistry from './AnimationRegistry.js';

// Import all effects
import SmoothTransitions from './effects/SmoothTransitions.js';
import RippleEffect from './effects/RippleEffect.js';

// Register all effects with metadata
AnimationRegistry.register('smooth-transitions', SmoothTransitions, {
  category: 'cell-effects',
  description: 'Smooth fade in/out transitions for cell birth and death',
  layer: 'cells',
  version: '1.0.0'
});

AnimationRegistry.register('ripple-effect', RippleEffect, {
  category: 'visual-effects', 
  description: 'Expanding ripples when cells change state',
  layer: 'foreground',
  version: '1.0.0'
});

// TODO: Register additional effects as they're created
// AnimationRegistry.register('cell-aging', CellAging, { ... });
// AnimationRegistry.register('particle-system', ParticleSystem, { ... });
// AnimationRegistry.register('grid-pulse', GridPulse, { ... });

// Export main classes
export { AnimationManager, AnimationRegistry };

// Export effect classes for direct use if needed
export { SmoothTransitions, RippleEffect };

// Convenience function to create a configured animation manager
export const createGameOfLifeAnimationManager = (canvas, theme) => {
  const manager = new AnimationManager(canvas, theme);
  
  // Enable default effects
  manager.enable('smooth-transitions', {
    enabled: true,
    intensity: 0.8,
    fadeInDuration: 250,
    fadeOutDuration: 200
  });
  
  return manager;
};

// Animation presets
export const ANIMATION_PRESETS = {
  'minimal': {
    'smooth-transitions': { enabled: true, intensity: 0.5 }
  },
  'standard': {
    'smooth-transitions': { enabled: true, intensity: 0.8 },
    'ripple-effect': { enabled: true, intensity: 0.6 }
  },
  'full': {
    'smooth-transitions': { enabled: true, intensity: 1.0 },
    'ripple-effect': { enabled: true, intensity: 0.8 },
    // 'cell-aging': { enabled: true, intensity: 0.7 },
    // 'particle-system': { enabled: true, intensity: 0.5 }
  },
  'performance': {
    'smooth-transitions': { enabled: true, intensity: 0.3 }
  }
};

export default { AnimationManager, AnimationRegistry };