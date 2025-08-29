# Portfolio Development Best Practices Guide

## Table of Contents

1. [React Development Standards](#react-development-standards)
2. [Component Design Principles](#component-design-principles)
3. [Code Organization Guidelines](#code-organization-guidelines)
4. [Performance Optimization Techniques](#performance-optimization-techniques)
5. [Accessibility Requirements](#accessibility-requirements)
6. [Testing Strategies](#testing-strategies)
7. [State Management Patterns](#state-management-patterns)
8. [Animation and Canvas Best Practices](#animation-and-canvas-best-practices)
9. [Build and Deployment Standards](#build-and-deployment-standards)
10. [Documentation Standards](#documentation-standards)

---

## React Development Standards

### Component Declaration Patterns

#### ✅ **Preferred: Functional Components with Hooks**
```javascript
// Use arrow functions for simple components
const SimpleComponent = ({ title, children }) => (
  <div className="simple-component">
    <h2>{title}</h2>
    {children}
  </div>
);

// Use function declarations for complex components with hooks
function ComplexSimulation({ config, onUpdate }) {
  const [isRunning, setIsRunning] = useState(false);
  const [entities, setEntities] = useState([]);
  const canvasRef = useRef(null);
  
  // Custom hook usage
  const { fps, frameTime } = usePerformanceMonitoring();
  
  useEffect(() => {
    // Simulation setup and cleanup
    const cleanup = initializeSimulation(canvasRef.current, config);
    return cleanup;
  }, [config]);
  
  return (
    <div className="simulation-container">
      <canvas ref={canvasRef} />
      <SimulationControls 
        isRunning={isRunning} 
        onToggle={() => setIsRunning(!isRunning)} 
      />
      {process.env.NODE_ENV === 'development' && (
        <PerformanceDisplay fps={fps} frameTime={frameTime} />
      )}
    </div>
  );
}
```

#### ❌ **Avoid: Class Components**
```javascript
// Don't use class components for new code
class OldComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  
  render() {
    return <div>{this.state.count}</div>;
  }
}
```

### Props and State Management

#### **Props Interface Design**
```javascript
// ✅ Use destructuring with default values
const SimulationCard = ({ 
  title, 
  description, 
  isActive = false, 
  onStart = () => {}, 
  onStop = () => {},
  config = {},
  ...restProps 
}) => {
  // Component implementation
};

// ✅ PropTypes for documentation and validation (optional)
SimulationCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onStart: PropTypes.func,
  onStop: PropTypes.func,
  config: PropTypes.object
};
```

#### **State Naming Conventions**
```javascript
// ✅ Use descriptive, specific names
const [isSimulationRunning, setIsSimulationRunning] = useState(false);
const [entityCount, setEntityCount] = useState(100);
const [currentGeneration, setCurrentGeneration] = useState(0);
const [performanceMetrics, setPerformanceMetrics] = useState({ fps: 60 });

// ❌ Avoid generic names
const [data, setData] = useState();
const [flag, setFlag] = useState(false);
const [state, setState] = useState({});
```

### Custom Hooks Patterns

#### **Animation Loop Hook**
```javascript
// ✅ Reusable animation loop with cleanup
const useAnimationLoop = (updateFunction, isRunning, targetFPS = 60) => {
  const animationRef = useRef();
  const lastTimeRef = useRef(0);
  const frameInterval = 1000 / targetFPS;
  
  useEffect(() => {
    if (!isRunning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }
    
    const animate = (currentTime) => {
      if (currentTime - lastTimeRef.current >= frameInterval) {
        updateFunction(currentTime - lastTimeRef.current);
        lastTimeRef.current = currentTime;
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, updateFunction, frameInterval]);
  
  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);
  
  return { stop };
};
```

#### **Performance Monitoring Hook**
```javascript
// ✅ Specialized hook for performance tracking
const usePerformanceMonitoring = (sampleSize = 60) => {
  const [fps, setFPS] = useState(60);
  const [frameTime, setFrameTime] = useState(16);
  const frameTimeHistory = useRef([]);
  const lastFrameTime = useRef(performance.now());
  
  const recordFrame = useCallback(() => {
    const now = performance.now();
    const delta = now - lastFrameTime.current;
    
    frameTimeHistory.current.push(delta);
    if (frameTimeHistory.current.length > sampleSize) {
      frameTimeHistory.current.shift();
    }
    
    const averageFrameTime = frameTimeHistory.current.reduce((a, b) => a + b, 0) / frameTimeHistory.current.length;
    const currentFPS = Math.round(1000 / averageFrameTime);
    
    setFPS(currentFPS);
    setFrameTime(Math.round(averageFrameTime * 100) / 100);
    
    lastFrameTime.current = now;
  }, [sampleSize]);
  
  return { fps, frameTime, recordFrame };
};
```

---

## Component Design Principles

### Single Responsibility Principle

#### **Component Separation Examples**

```javascript
// ✅ Good: Separated concerns
const SimulationCanvas = ({ entities, debugMode }) => {
  const canvasRef = useRef();
  
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    renderEntities(ctx, entities, debugMode);
  }, [entities, debugMode]);
  
  return <canvas ref={canvasRef} className="simulation-canvas" />;
};

const SimulationControls = ({ isRunning, onToggle, onReset, onStep }) => (
  <div className="simulation-controls">
    <button onClick={onToggle} className="btn btn-primary">
      {isRunning ? 'Pause' : 'Play'}
    </button>
    <button onClick={onReset} className="btn btn-secondary">Reset</button>
    <button onClick={onStep} className="btn btn-outline-primary" disabled={isRunning}>
      Step
    </button>
  </div>
);

const Simulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [entities, setEntities] = useState([]);
  
  return (
    <div className="simulation-container">
      <SimulationCanvas entities={entities} debugMode={false} />
      <SimulationControls 
        isRunning={isRunning}
        onToggle={() => setIsRunning(!isRunning)}
        onReset={() => setEntities([])}
        onStep={() => setEntities(updateEntities)}
      />
    </div>
  );
};

// ❌ Bad: Monolithic component
const MonolithicSimulation = () => {
  // Everything mixed together - rendering, controls, logic, state
  // Difficult to test, reuse, and maintain
};
```

### Composition Over Configuration

```javascript
// ✅ Good: Flexible composition
const InteractiveDemo = ({ children, title, description, controls }) => (
  <div className="interactive-demo">
    <header className="demo-header">
      <h3>{title}</h3>
      <p>{description}</p>
    </header>
    <main className="demo-content">
      {children}
    </main>
    {controls && (
      <footer className="demo-controls">
        {controls}
      </footer>
    )}
  </div>
);

// Usage with composition
<InteractiveDemo 
  title="Game of Life"
  description="Cellular automata emergence patterns"
  controls={<GameOfLifeControls onStart={start} onPause={pause} />}
>
  <GameOfLifeCanvas grid={grid} />
  <GameOfLifeStats generation={generation} liveCells={liveCells} />
</InteractiveDemo>
```

### Error Boundary Implementation

```javascript
// ✅ Simulation-specific error boundary
class SimulationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Simulation Error:', error, errorInfo);
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h3>Simulation Error</h3>
          <p>Sorry, this simulation encountered an error and couldn't continue.</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn btn-primary"
          >
            Try Again
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Error Details</summary>
              <pre>{this.state.error && this.state.error.toString()}</pre>
              <pre>{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Usage
<SimulationErrorBoundary>
  <GameOfLifeSimulation />
</SimulationErrorBoundary>
```

---

## Code Organization Guidelines

### File and Directory Structure

#### **Component Organization**
```
src/
├── components/           # Shared UI components
│   ├── common/          # Universally shared components
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   ├── Button.css
│   │   │   ├── Button.test.js
│   │   │   └── index.js
│   ├── layout/          # Layout-specific components
│   │   ├── Navbar/
│   │   └── Footer/
│   └── simulations/     # Simulation-specific components
│       ├── Canvas/
│       ├── Controls/
│       └── Statistics/
```

#### **Page Organization**
```
src/pages/
├── Resume/              # Page components get their own directories
│   ├── Resume.jsx
│   ├── Resume.css
│   ├── Resume.test.js
│   ├── components/      # Page-specific components
│   │   ├── ExperienceSection.jsx
│   │   ├── SkillsMatrix.jsx
│   │   └── ContactInfo.jsx
│   └── index.js
```

#### **Engine and Logic Organization**
```
src/engine/
├── SimulationEngine.js  # Base simulation engine
├── physics/             # Physics-related engines
│   ├── CollisionDetection.js
│   ├── ParticleSystem.js
│   └── ForceCalculation.js
├── ai/                  # AI and complex systems
│   ├── CellularAutomata.js
│   ├── FlockingBehavior.js
│   └── NeuralNetwork.js
└── graphics/            # Rendering engines
    ├── CanvasRenderer.js
    ├── WebGLRenderer.js
    └── EffectSystem.js
```

### Import Organization

#### **Import Order Standards**
```javascript
// 1. React and React-related imports
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

// 2. External library imports
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Play, Pause } from 'lucide-react';

// 3. Internal utilities and helpers
import { calculateNextGeneration, initializeGrid } from '../utils/gameOfLife';
import { debounce, throttle } from '../utils/performance';

// 4. Component imports
import SimulationCanvas from '../components/SimulationCanvas';
import PerformanceMonitor from '../components/PerformanceMonitor';

// 5. Style imports (last)
import './GameOfLife.css';
```

### Naming Conventions

#### **File Naming**
- **Components**: PascalCase (`GameOfLifeCanvas.jsx`)
- **Utilities**: camelCase (`gameOfLifeHelpers.js`)
- **Styles**: kebab-case (`game-of-life.css`)
- **Tests**: Component name + `.test.js` (`GameOfLifeCanvas.test.js`)

#### **Variable and Function Naming**
```javascript
// ✅ Good naming
const isSimulationRunning = useState(false);
const currentGeneration = useState(0);
const calculateNextGeneration = (grid, rules) => { /* */ };
const handleSimulationToggle = () => { /* */ };

// Constants in UPPER_SNAKE_CASE
const MAX_ENTITIES = 1000;
const DEFAULT_FPS = 60;
const SIMULATION_RULES = {
  SURVIVAL: [2, 3],
  BIRTH: [3]
};

// ❌ Avoid unclear naming
const data = useState();
const flag = useState(false);
const fn = () => { /* */ };
const temp = calculateStuff();
```

---

## Performance Optimization Techniques

### Canvas and Animation Optimization

#### **Efficient Rendering Patterns**
```javascript
// ✅ Optimized canvas rendering with dirty rectangles
const useOptimizedCanvas = () => {
  const canvasRef = useRef();
  const previousEntities = useRef([]);
  
  const render = useCallback((entities) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Calculate changed regions
    const dirtyRegions = calculateDirtyRegions(entities, previousEntities.current);
    
    // Only redraw changed areas
    dirtyRegions.forEach(region => {
      ctx.clearRect(region.x, region.y, region.width, region.height);
      
      // Render only entities in this region
      const entitiesInRegion = entities.filter(entity => 
        intersectsRegion(entity, region)
      );
      
      entitiesInRegion.forEach(entity => {
        drawEntity(ctx, entity);
      });
    });
    
    previousEntities.current = [...entities];
  }, []);
  
  return { canvasRef, render };
};

// Helper functions
const calculateDirtyRegions = (newEntities, oldEntities) => {
  const regions = [];
  
  // Check for moved or changed entities
  newEntities.forEach((entity, index) => {
    const oldEntity = oldEntities[index];
    if (!oldEntity || entityChanged(entity, oldEntity)) {
      regions.push(getEntityBounds(entity));
      if (oldEntity) {
        regions.push(getEntityBounds(oldEntity));
      }
    }
  });
  
  // Merge overlapping regions
  return mergeRegions(regions);
};
```

#### **Memory Management for Simulations**
```javascript
// ✅ Object pooling for frequently created/destroyed objects
class EntityPool {
  constructor(createFn, resetFn, initialSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }
  
  acquire() {
    return this.pool.length > 0 ? this.pool.pop() : this.createFn();
  }
  
  release(entity) {
    this.resetFn(entity);
    this.pool.push(entity);
  }
}

// Usage in simulation
const useEntityPool = () => {
  const pool = useRef(new EntityPool(
    () => ({ x: 0, y: 0, vx: 0, vy: 0, age: 0 }),
    (entity) => { entity.x = 0; entity.y = 0; entity.vx = 0; entity.vy = 0; entity.age = 0; }
  ));
  
  return pool.current;
};
```

### React Performance Optimization

#### **Memoization Strategies**
```javascript
// ✅ Strategic use of React.memo
const SimulationDisplay = React.memo(({ 
  entities, 
  generation, 
  isRunning, 
  debugMode 
}) => {
  return (
    <div className="simulation-display">
      <Canvas entities={entities} debugMode={debugMode} />
      <Stats generation={generation} entityCount={entities.length} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better control
  return (
    prevProps.generation === nextProps.generation &&
    prevProps.isRunning === nextProps.isRunning &&
    prevProps.debugMode === nextProps.debugMode &&
    entitiesEqual(prevProps.entities, nextProps.entities)
  );
});

// ✅ Use useMemo for expensive calculations
const SimulationStats = ({ entities }) => {
  const statistics = useMemo(() => {
    return {
      totalEntities: entities.length,
      averageSpeed: entities.reduce((sum, e) => sum + e.speed, 0) / entities.length,
      spatialDistribution: calculateSpatialDistribution(entities),
      energyDistribution: calculateEnergyDistribution(entities)
    };
  }, [entities]);
  
  return (
    <div className="simulation-stats">
      <div>Total Entities: {statistics.totalEntities}</div>
      <div>Average Speed: {statistics.averageSpeed.toFixed(2)}</div>
      <div>Energy Distribution: {statistics.energyDistribution}</div>
    </div>
  );
};

// ✅ Use useCallback for stable function references
const Simulation = () => {
  const [entities, setEntities] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  
  // Stable callback reference prevents unnecessary re-renders
  const handleEntityUpdate = useCallback((updatedEntity) => {
    setEntities(currentEntities => 
      currentEntities.map(entity => 
        entity.id === updatedEntity.id ? updatedEntity : entity
      )
    );
  }, []);
  
  const toggleSimulation = useCallback(() => {
    setIsRunning(current => !current);
  }, []);
  
  return (
    <div>
      <SimulationDisplay entities={entities} isRunning={isRunning} />
      <SimulationControls onToggle={toggleSimulation} />
    </div>
  );
};
```

#### **Code Splitting and Lazy Loading**
```javascript
// ✅ Route-based code splitting
import { lazy, Suspense } from 'react';

const EmergenceEngine = lazy(() => import('./pages/EmergenceEngine'));
const GameOfLife = lazy(() => import('./pages/GameOfLife'));
const Breakout = lazy(() => import('./pages/Breakout'));

// Loading component with simulation preview
const SimulationLoader = ({ simulationType }) => (
  <div className="simulation-loader">
    <div className="loading-spinner" />
    <p>Loading {simulationType}...</p>
    <div className="loading-preview">
      {/* Show a static preview or skeleton */}
    </div>
  </div>
);

// ✅ Component-level lazy loading for heavy components
const App = () => (
  <BrowserRouter>
    <Routes>
      <Route 
        path="/sim-interactive/emergence" 
        element={
          <Suspense fallback={<SimulationLoader simulationType="Emergence Engine" />}>
            <EmergenceEngine />
          </Suspense>
        } 
      />
      <Route 
        path="/sim-interactive/gameoflife" 
        element={
          <Suspense fallback={<SimulationLoader simulationType="Game of Life" />}>
            <GameOfLife />
          </Suspense>
        } 
      />
    </Routes>
  </BrowserRouter>
);
```

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance Standards

#### **Interactive Canvas Accessibility**
```javascript
// ✅ Accessible canvas implementation
const AccessibleSimulationCanvas = ({ 
  entities, 
  generation, 
  isRunning, 
  onCellToggle 
}) => {
  const canvasRef = useRef();
  const [focusedCell, setFocusedCell] = useState(null);
  
  // Keyboard navigation support
  const handleKeyDown = (event) => {
    if (!focusedCell) return;
    
    const { x, y } = focusedCell;
    let newFocus = { x, y };
    
    switch (event.key) {
      case 'ArrowUp':
        newFocus.y = Math.max(0, y - 1);
        break;
      case 'ArrowDown':
        newFocus.y = Math.min(gridHeight - 1, y + 1);
        break;
      case 'ArrowLeft':
        newFocus.x = Math.max(0, x - 1);
        break;
      case 'ArrowRight':
        newFocus.x = Math.min(gridWidth - 1, x + 1);
        break;
      case ' ':
      case 'Enter':
        onCellToggle(x, y);
        event.preventDefault();
        return;
      default:
        return;
    }
    
    setFocusedCell(newFocus);
    event.preventDefault();
  };
  
  return (
    <div className="accessible-canvas-container">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Game of Life simulation, generation ${generation}, ${entities.length} live cells`}
        tabIndex="0"
        onKeyDown={handleKeyDown}
        onClick={handleCanvasClick}
        className="simulation-canvas"
      />
      
      {/* Screen reader status updates */}
      <div 
        aria-live="polite" 
        aria-atomic="false" 
        className="sr-only"
      >
        {isRunning ? `Simulation running, generation ${generation}` : 'Simulation paused'}
      </div>
      
      {/* Alternative text representation for screen readers */}
      <div className="sr-only">
        <h4>Current simulation state:</h4>
        <p>{entities.length} live cells out of {gridWidth * gridHeight} total cells</p>
        <p>Generation: {generation}</p>
        <p>Status: {isRunning ? 'Running' : 'Paused'}</p>
      </div>
    </div>
  );
};
```

#### **Color and Contrast Standards**
```css
/* ✅ Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text) */
.simulation-controls {
  /* Primary button: 4.51:1 contrast ratio */
  --primary-color: #1976d2;
  --primary-text: #ffffff;
  
  /* Secondary button: 4.52:1 contrast ratio */
  --secondary-color: #f5f5f5;
  --secondary-text: #212121;
  
  /* Error states: 4.5:1 contrast ratio */
  --error-color: #d32f2f;
  --error-text: #ffffff;
}

/* Don't rely solely on color to convey information */
.entity-status {
  /* Use icons + color */
  background-color: var(--status-color);
  content: attr(data-status-icon);
}

.entity-status[data-status="active"]::before {
  content: "▶️"; /* Running icon */
  background-color: #4caf50;
}

.entity-status[data-status="paused"]::before {
  content: "⏸️"; /* Paused icon */  
  background-color: #ff9800;
}
```

#### **Focus Management**
```javascript
// ✅ Proper focus management for dynamic content
const SimulationModal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef();
  const previousFocusRef = useRef();
  
  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement;
      
      // Focus the modal
      modalRef.current?.focus();
      
      // Trap focus within modal
      const handleTabKey = (event) => {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      };
      
      document.addEventListener('keydown', handleTabKey);
      
      return () => {
        document.removeEventListener('keydown', handleTabKey);
        // Restore previous focus
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="modal-content"
        tabIndex="-1"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
```

---

## Testing Strategies

### Component Testing Patterns

#### **Simulation Component Testing**
```javascript
// ✅ Comprehensive simulation testing
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import GameOfLifeSimulation from './GameOfLifeSimulation';

describe('GameOfLifeSimulation', () => {
  const mockCanvas = {
    getContext: vi.fn(() => ({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
    }))
  };
  
  beforeEach(() => {
    // Mock canvas API
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCanvas.getContext());
  });
  
  test('initializes with default grid', () => {
    render(<GameOfLifeSimulation />);
    
    expect(screen.getByText(/generation: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/live cells: 0/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });
  
  test('toggles simulation state on play/pause', async () => {
    const user = userEvent.setup();
    render(<GameOfLifeSimulation />);
    
    const playButton = screen.getByRole('button', { name: /play/i });
    
    await user.click(playButton);
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    
    await user.click(screen.getByRole('button', { name: /pause/i }));
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });
  
  test('updates generation count when running', async () => {
    vi.useFakeTimers();
    render(<GameOfLifeSimulation />);
    
    const playButton = screen.getByRole('button', { name: /play/i });
    await userEvent.click(playButton);
    
    // Fast-forward time to trigger animation frames
    vi.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText(/generation: [1-9]/)).toBeInTheDocument();
    });
    
    vi.useRealTimers();
  });
  
  test('handles canvas interaction for cell toggling', async () => {
    const user = userEvent.setup();
    render(<GameOfLifeSimulation />);
    
    const canvas = screen.getByRole('img', { name: /game of life/i });
    
    // Mock getBoundingClientRect for accurate click coordinates
    canvas.getBoundingClientRect = vi.fn(() => ({
      left: 0, top: 0, width: 400, height: 400
    }));
    
    await user.click(canvas);
    
    // Should update live cell count
    await waitFor(() => {
      expect(screen.getByText(/live cells: [1-9]/)).toBeInTheDocument();
    });
  });
  
  test('keyboard navigation works correctly', async () => {
    const user = userEvent.setup();
    render(<GameOfLifeSimulation />);
    
    const canvas = screen.getByRole('img');
    canvas.focus();
    
    // Test arrow key navigation
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard(' '); // Toggle cell
    
    await waitFor(() => {
      expect(screen.getByText(/live cells: 1/)).toBeInTheDocument();
    });
  });
});
```

#### **Performance Testing**
```javascript
// ✅ Performance testing for simulations
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import SimulationPerformanceTest from './SimulationPerformanceTest';

describe('Simulation Performance', () => {
  test('maintains 60 FPS with 100 entities', async () => {
    const performanceMonitor = vi.fn();
    
    render(
      <SimulationPerformanceTest 
        entityCount={100}
        onPerformanceUpdate={performanceMonitor}
      />
    );
    
    // Let simulation run for a few frames
    await new Promise(resolve => setTimeout(resolve, 500));
    
    expect(performanceMonitor).toHaveBeenCalled();
    
    const lastCall = performanceMonitor.mock.calls.slice(-1)[0];
    const { fps } = lastCall[0];
    
    expect(fps).toBeGreaterThan(55); // Allow for some variance
  });
  
  test('adapts quality under high load', async () => {
    const qualityChangeHandler = vi.fn();
    
    render(
      <SimulationPerformanceTest 
        entityCount={1000} // High load
        onQualityChange={qualityChangeHandler}
      />
    );
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    expect(qualityChangeHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        quality: expect.stringMatching(/medium|low/)
      })
    );
  });
});
```

### Integration Testing

#### **Route and Navigation Testing**
```javascript
// ✅ Navigation flow testing
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import App from './App';

const renderApp = () => render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

describe('Portfolio Navigation', () => {
  test('navigates through main sections', async () => {
    const user = userEvent.setup();
    renderApp();
    
    // Should start on resume page
    expect(screen.getByText(/cameron de robertis/i)).toBeInTheDocument();
    
    // Navigate to about page
    await user.click(screen.getByRole('link', { name: /about/i }));
    expect(screen.getByText(/personal background/i)).toBeInTheDocument();
    
    // Navigate to interactive showcase
    await user.click(screen.getByRole('link', { name: /interactive/i }));
    expect(screen.getByText(/interactive demonstrations/i)).toBeInTheDocument();
  });
  
  test('loads simulations correctly', async () => {
    const user = userEvent.setup();
    renderApp();
    
    // Navigate to Game of Life
    await user.click(screen.getByRole('link', { name: /interactive/i }));
    await user.click(screen.getByText(/game of life/i));
    
    expect(screen.getByText(/generation: 0/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });
});
```

---

## State Management Patterns

### Context Usage Guidelines

#### **When to Use Context vs Local State**
```javascript
// ✅ Use Context for truly global state
const ThemeContext = createContext();
const UserPreferencesContext = createContext();

// ✅ Use local state for component-specific data
const SimulationComponent = () => {
  const [entities, setEntities] = useState([]); // Local - only this component needs it
  const [isRunning, setIsRunning] = useState(false); // Local - component-specific
  
  const { theme } = useContext(ThemeContext); // Global - affects entire app
  
  return (
    <div className={`simulation ${theme}`}>
      {/* Component implementation */}
    </div>
  );
};

// ❌ Don't use Context for temporary or frequently changing data
const BadContext = createContext();
const BadProvider = ({ children }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // Too frequent
  const [tempValue, setTempValue] = useState(''); // Temporary data
  
  // This will cause unnecessary re-renders across the app
  return (
    <BadContext.Provider value={{ mousePosition, tempValue }}>
      {children}
    </BadContext.Provider>
  );
};
```

#### **Context Optimization Patterns**
```javascript
// ✅ Split contexts by concern and update frequency
const ThemeConfigContext = createContext(); // Rarely changes
const ThemeStateContext = createContext();  // Changes with user interaction

const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('auto');
  const [resolvedTheme, setResolvedTheme] = useState('light');
  
  // Separate stable config from changing state
  const config = useMemo(() => ({
    availableThemes: ['light', 'dark', 'auto'],
    colorSchemes: AVAILABLE_COLOR_SCHEMES
  }), []);
  
  const state = useMemo(() => ({
    mode,
    resolvedTheme,
    setMode,
    toggleTheme: () => setMode(mode === 'light' ? 'dark' : 'light')
  }), [mode, resolvedTheme]);
  
  return (
    <ThemeConfigContext.Provider value={config}>
      <ThemeStateContext.Provider value={state}>
        {children}
      </ThemeStateContext.Provider>
    </ThemeConfigContext.Provider>
  );
};

// Separate hooks for different concerns
export const useThemeConfig = () => useContext(ThemeConfigContext);
export const useThemeState = () => useContext(ThemeStateContext);
```

### Simulation State Patterns

#### **Reducer Pattern for Complex Simulations**
```javascript
// ✅ Use useReducer for complex state transitions
const simulationReducer = (state, action) => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        entities: action.payload.entities,
        generation: 0,
        isRunning: false,
        statistics: calculateStatistics(action.payload.entities)
      };
      
    case 'START_SIMULATION':
      return {
        ...state,
        isRunning: true,
        lastStartTime: Date.now()
      };
      
    case 'PAUSE_SIMULATION':
      return {
        ...state,
        isRunning: false,
        totalRunTime: state.totalRunTime + (Date.now() - state.lastStartTime)
      };
      
    case 'UPDATE_GENERATION':
      const newEntities = calculateNextGeneration(state.entities, action.payload.rules);
      return {
        ...state,
        entities: newEntities,
        generation: state.generation + 1,
        statistics: calculateStatistics(newEntities)
      };
      
    case 'TOGGLE_CELL':
      const updatedEntities = toggleEntityAt(state.entities, action.payload.x, action.payload.y);
      return {
        ...state,
        entities: updatedEntities,
        statistics: calculateStatistics(updatedEntities)
      };
      
    case 'RESET':
      return initialSimulationState;
      
    default:
      return state;
  }
};

const useSimulationState = (initialEntities, rules) => {
  const [state, dispatch] = useReducer(simulationReducer, {
    entities: initialEntities,
    generation: 0,
    isRunning: false,
    statistics: { liveCells: 0, patterns: [] },
    totalRunTime: 0,
    lastStartTime: null
  });
  
  // Action creators
  const actions = useMemo(() => ({
    initialize: (entities) => dispatch({ type: 'INITIALIZE', payload: { entities } }),
    start: () => dispatch({ type: 'START_SIMULATION' }),
    pause: () => dispatch({ type: 'PAUSE_SIMULATION' }),
    updateGeneration: () => dispatch({ type: 'UPDATE_GENERATION', payload: { rules } }),
    toggleCell: (x, y) => dispatch({ type: 'TOGGLE_CELL', payload: { x, y } }),
    reset: () => dispatch({ type: 'RESET' })
  }), [rules]);
  
  return [state, actions];
};
```

---

## Animation and Canvas Best Practices

### Canvas Setup and Optimization

#### **High-DPI Canvas Setup**
```javascript
// ✅ Proper canvas initialization for sharp rendering
const useHighDPICanvas = () => {
  const canvasRef = useRef();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Get display size
    const displayWidth = canvas.offsetWidth;
    const displayHeight = canvas.offsetHeight;
    
    // Set actual size in memory (scaled up for high DPI)
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    
    // Scale the drawing context back down
    ctx.scale(dpr, dpr);
    
    // Set display size via CSS
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    // Optimize rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
  }, []);
  
  return canvasRef;
};
```

#### **Efficient Animation Loops**
```javascript
// ✅ Performance-optimized animation loop
const useGameLoop = (updateFn, renderFn, targetFPS = 60) => {
  const animationRef = useRef();
  const lastTimeRef = useRef(0);
  const accumulator = useRef(0);
  
  const timestep = 1000 / targetFPS;
  
  const gameLoop = useCallback((currentTime) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = currentTime;
    }
    
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    accumulator.current += deltaTime;
    
    // Fixed timestep updates for consistent physics
    while (accumulator.current >= timestep) {
      updateFn(timestep / 1000); // Convert to seconds
      accumulator.current -= timestep;
    }
    
    // Render with interpolation for smooth visuals
    const interpolation = accumulator.current / timestep;
    renderFn(interpolation);
    
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [updateFn, renderFn, timestep]);
  
  const start = useCallback(() => {
    if (!animationRef.current) {
      lastTimeRef.current = 0;
      accumulator.current = 0;
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameLoop]);
  
  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    return () => stop();
  }, [stop]);
  
  return { start, stop };
};
```

### Spatial Optimization

#### **Spatial Partitioning for Collision Detection**
```javascript
// ✅ Quadtree implementation for efficient collision detection
class QuadTree {
  constructor(bounds, maxObjects = 10, maxLevels = 5, level = 0) {
    this.maxObjects = maxObjects;
    this.maxLevels = maxLevels;
    this.level = level;
    this.bounds = bounds;
    this.objects = [];
    this.nodes = [];
  }
  
  split() {
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const { x, y } = this.bounds;
    
    this.nodes[0] = new QuadTree({ x: x + subWidth, y, width: subWidth, height: subHeight }, this.maxObjects, this.maxLevels, this.level + 1);
    this.nodes[1] = new QuadTree({ x, y, width: subWidth, height: subHeight }, this.maxObjects, this.maxLevels, this.level + 1);
    this.nodes[2] = new QuadTree({ x, y: y + subHeight, width: subWidth, height: subHeight }, this.maxObjects, this.maxLevels, this.level + 1);
    this.nodes[3] = new QuadTree({ x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight }, this.maxObjects, this.maxLevels, this.level + 1);
  }
  
  insert(object) {
    if (this.nodes.length > 0) {
      const index = this.getIndex(object);
      if (index !== -1) {
        this.nodes[index].insert(object);
        return;
      }
    }
    
    this.objects.push(object);
    
    if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
      if (this.nodes.length === 0) {
        this.split();
      }
      
      let i = 0;
      while (i < this.objects.length) {
        const index = this.getIndex(this.objects[i]);
        if (index !== -1) {
          this.nodes[index].insert(this.objects.splice(i, 1)[0]);
        } else {
          i++;
        }
      }
    }
  }
  
  retrieve(object) {
    const index = this.getIndex(object);
    let returnObjects = this.objects;
    
    if (this.nodes.length > 0) {
      if (index !== -1) {
        returnObjects = returnObjects.concat(this.nodes[index].retrieve(object));
      } else {
        for (let i = 0; i < this.nodes.length; i++) {
          returnObjects = returnObjects.concat(this.nodes[i].retrieve(object));
        }
      }
    }
    
    return returnObjects;
  }
  
  getIndex(object) {
    let index = -1;
    const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
    const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;
    
    const topQuadrant = object.y < horizontalMidpoint && object.y + object.height < horizontalMidpoint;
    const bottomQuadrant = object.y > horizontalMidpoint;
    
    if (object.x < verticalMidpoint && object.x + object.width < verticalMidpoint) {
      if (topQuadrant) {
        index = 1;
      } else if (bottomQuadrant) {
        index = 2;
      }
    } else if (object.x > verticalMidpoint) {
      if (topQuadrant) {
        index = 0;
      } else if (bottomQuadrant) {
        index = 3;
      }
    }
    
    return index;
  }
  
  clear() {
    this.objects = [];
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i]) {
        this.nodes[i].clear();
        delete this.nodes[i];
      }
    }
    this.nodes = [];
  }
}
```

---

## Build and Deployment Standards

### Enhanced Vite Configuration

#### **Production-Ready Vite Config**
```javascript
// vite.config.js - Enhanced configuration
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    
    // Bundle analyzer for optimization
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    }),
    
    // Progressive Web App support
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['cd_favicon.png'],
      manifest: {
        name: 'Cameron De Robertis Portfolio',
        short_name: 'CD Portfolio',
        description: 'Interactive developer portfolio with simulations',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'cd_favicon.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ],
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          
          // Separate simulation engines
          simulations: [
            './src/pages/EmergenceEngine',
            './src/pages/GameOfLife',
            './src/pages/DvdBouncer'
          ],
          
          // Separate UI libraries
          ui: ['lucide-react', 'bootstrap'],
          
          // Separate utility functions
          utils: [
            './src/utils/dvdLogic',
            './src/utils/vectorMath',
            './src/utils/graphics/canvasUtils'
          ]
        }
      }
    },
    
    // Performance budgets
    chunkSizeWarningLimit: 1000,
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: true
  },
  
  // Environment-specific optimizations
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
});
```

### CI/CD Pipeline Standards

#### **GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Build and Deploy Portfolio

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  performance:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

  deploy:
    runs-on: ubuntu-latest
    needs: [test, performance]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build for production
        run: npm run build
        
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: portfolio-project-id
```

---

## Documentation Standards

### Component Documentation

#### **JSDoc Standards for Components**
```javascript
/**
 * Interactive simulation canvas component with accessibility and performance optimization
 * 
 * @component
 * @example
 * ```jsx
 * <SimulationCanvas
 *   entities={gameEntities}
 *   isRunning={true}
 *   generation={45}
 *   onCellClick={(x, y) => toggleCell(x, y)}
 *   debugMode={false}
 *   aria-label="Game of Life simulation display"
 * />
 * ```
 */
const SimulationCanvas = ({ 
  /** Array of simulation entities to render */
  entities,
  
  /** Whether the simulation is currently running */
  isRunning,
  
  /** Current generation number for accessibility announcements */
  generation,
  
  /** Callback fired when a cell is clicked - (x: number, y: number) => void */
  onCellClick,
  
  /** Enable debug mode rendering with additional visual information */
  debugMode = false,
  
  /** Additional CSS classes to apply to the canvas container */
  className = '',
  
  /** Forward ref to canvas element for external access */
  ...props 
}) => {
  // Implementation
};
```

#### **README Template for Components**
```markdown
# SimulationCanvas Component

## Purpose
Renders interactive simulations with accessibility support and performance optimization.

## Features
- High-DPI canvas rendering
- Keyboard navigation support
- Screen reader accessibility
- Performance monitoring
- Debug mode visualization

## Usage

### Basic Example
```jsx
import SimulationCanvas from './SimulationCanvas';

<SimulationCanvas
  entities={entities}
  isRunning={isRunning}
  onCellClick={handleCellClick}
/>
```

### Advanced Example
```jsx
<SimulationCanvas
  entities={entities}
  isRunning={isRunning}
  generation={generation}
  debugMode={true}
  onCellClick={handleCellClick}
  className="custom-canvas"
  aria-label={`Simulation with ${entities.length} entities`}
/>
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `entities` | `Array<Entity>` | `[]` | Simulation entities to render |
| `isRunning` | `boolean` | `false` | Simulation running state |
| `generation` | `number` | `0` | Current generation for accessibility |
| `onCellClick` | `function` | `() => {}` | Cell click handler |
| `debugMode` | `boolean` | `false` | Enable debug visualization |

## Accessibility
- Supports keyboard navigation (arrow keys, space, enter)
- Provides screen reader announcements for state changes
- Includes alternative text descriptions of simulation state

## Performance
- Uses high-DPI canvas optimization
- Implements dirty rectangle rendering
- Includes performance monitoring hooks
```

This comprehensive best practices guide establishes the foundation for maintaining high-quality, performant, and accessible code throughout the portfolio project. These patterns should be consistently applied across all components and features to ensure a cohesive, professional codebase that demonstrates technical excellence.