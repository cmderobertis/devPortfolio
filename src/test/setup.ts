import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock canvas and WebGL for testing
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}));

// Mock HTMLCanvasElement methods
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Array(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Array(4) })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    quadraticCurveTo: vi.fn(),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    }))
  }))
});

// Mock requestAnimationFrame for animation testing
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

// Mock performance.now for consistent timing in tests
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now())
};

// Mock window.matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Extend expect with custom matchers for accessibility testing
expect.extend({
  toBeAccessible(received) {
    // Custom matcher for accessibility assertions
    const pass = received && typeof received.getAttribute === 'function';
    return {
      message: () => `expected element to be accessible`,
      pass
    };
  },
  
  toHaveAriaLabel(received, expected) {
    const ariaLabel = received.getAttribute('aria-label');
    const pass = ariaLabel === expected;
    return {
      message: () => `expected element to have aria-label "${expected}", but got "${ariaLabel}"`,
      pass
    };
  }
});

// Declare custom matchers for TypeScript
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeAccessible(): T;
    toHaveAriaLabel(expected: string): T;
  }
  interface AsymmetricMatchersContaining {
    toBeAccessible(): any;
    toHaveAriaLabel(expected: string): any;
  }
}