# Component API Documentation

## Component Architecture

The portfolio uses a functional component architecture with React hooks for state management and React Router for navigation.

## Core Components

### Navbar (`src/components/Navbar.jsx`)

Main navigation component providing site-wide navigation and theme switching.

#### Props
- None (uses React Context for theme state)

#### Dependencies
- `React.useContext` - Accesses ThemeContext
- `react-router-dom.NavLink` - Navigation with active states
- `ThemeContext` - Theme state and toggle function

#### Features
- **Responsive Design**: Bootstrap navbar with collapsible mobile menu
- **Active Route Indication**: NavLink automatically applies active styles
- **Theme Toggle**: Button to switch between light/dark modes
- **Accessibility**: ARIA labels, keyboard navigation support
- **Email Contact**: Direct mailto link

#### Usage
```jsx
import Navbar from './components/Navbar'

// Automatically rendered for all routes except full-screen simulations
<App>
  <Navbar />
  {/* Other components */}
</App>
```

#### Styling
- Uses Bootstrap navbar classes
- Sticky positioning (`sticky-top`)
- Custom theme integration via CSS custom properties
- Material Design 3 enhanced styling

### GameCanvas (`src/components/GameCanvas.jsx`)

Reusable canvas component for interactive simulations and games.

#### Props
```typescript
interface GameCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  onCanvasReady?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
}
```

#### Usage
```jsx
<GameCanvas 
  width={800} 
  height={600} 
  onCanvasReady={(canvas, ctx) => {
    // Initialize game/simulation
  }}
/>
```

## Context Providers

### ThemeContext (`src/context/ThemeContext.jsx`)

Provides theme state management across the application.

#### Context Value
```typescript
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

#### Features
- **Persistent Storage**: Saves theme preference to localStorage
- **System Preference Detection**: Detects user's system color scheme
- **DOM Integration**: Automatically applies `data-theme` attribute
- **Body Class Management**: Adds/removes dark theme classes

#### Usage
```jsx
import { ThemeContext } from '../context/ThemeContext'

const Component = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
```

#### Implementation Details
```jsx
// Provider setup in App.jsx
<ThemeProvider>
  <BrowserRouter>
    {/* App content */}
  </BrowserRouter>
</ThemeProvider>
```

## Page Components

### InteractiveShowcase (`src/pages/InteractiveShowcase.jsx`)

Hub component displaying available interactive simulations and demos.

#### Props
- None

#### Data Structure
```typescript
interface PageItem {
  path: string;
  title: string;
  description: string;
}
```

#### Configuration
```javascript
const pages = [
  {
    path: "/sim-interactive/dvd",
    title: "DVD Bouncer",
    description: "Bouncing DVD logo"
  },
  {
    path: "/sim-interactive/emergence",
    title: "Emergence Engine", 
    description: "Complex systems & cellular automata simulations"
  },
  // ... other simulations
];
```

#### Features
- **Dynamic Grid Layout**: Responsive card grid using Bootstrap
- **Route Integration**: React Router Link components
- **Consistent Styling**: Material Design 3 card components
- **Extensible**: Easy to add new simulations

### Bio (`src/pages/Bio.jsx`)

Personal biography and background information page.

#### Props
- None

#### Features
- **Responsive Layout**: Bootstrap grid system
- **Rich Content**: Personal story, interests, professional journey
- **Theme Integration**: Consistent styling with theme system

### Resume (`src/pages/Resume.jsx`)

Professional experience, skills, and education showcase.

#### Props
- None

#### Features
- **Professional Layout**: Clean, print-friendly design
- **Skill Matrix**: Technology and framework showcase
- **Experience Timeline**: Work history with details
- **Print Optimization**: CSS media queries for printing

## Simulation Components

### Base Simulation Pattern

All interactive simulations follow a common pattern:

```jsx
const SimulationComponent = () => {
  // State management
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState(defaultConfig);
  
  // Canvas ref
  const canvasRef = useRef(null);
  
  // Animation loop
  useEffect(() => {
    if (isRunning) {
      const animate = () => {
        // Update logic
        // Render logic
        requestAnimationFrame(animate);
      };
      animate();
    }
  }, [isRunning]);
  
  // Controls and canvas
  return (
    <div className="simulation-container">
      <div className="controls">
        <button onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? 'Pause' : 'Play'}
        </button>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
};
```

### DvdBouncer (`src/pages/DvdBouncer.jsx`)

Physics simulation of bouncing DVD logo with collision detection.

#### State Management
```javascript
const [position, setPosition] = useState({ x: 50, y: 50 });
const [velocity, setVelocity] = useState({ x: 2, y: 1.5 });
const [color, setColor] = useState('#ff0000');
const [isPaused, setIsPaused] = useState(false);
```

#### Key Methods
- `updatePosition()` - Physics calculation and collision detection
- `checkCollision()` - Boundary collision and color change
- `render()` - Canvas drawing with smooth animation

### Breakout (`src/pages/Breakout.tsx`)

Classic arcade game implementation in TypeScript.

#### TypeScript Interfaces
```typescript
interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Ball extends GameObject {
  dx: number;
  dy: number;
  radius: number;
}

interface Brick extends GameObject {
  visible: boolean;
  color: string;
}
```

#### Game State Management
```typescript
const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver'>('paused');
const [score, setScore] = useState(0);
const [bricks, setBricks] = useState<Brick[]>([]);
```

### EmergenceEngine (`src/pages/EmergenceEngine.jsx`)

Complex systems and cellular automata visualization engine.

#### Engine Integration
```javascript
import { CellularAutomata } from '../engine/CellularAutomata';
import { EmergenceEngineCore } from '../engine/EmergenceEngineCore';
import { Metrics } from '../engine/Metrics';
```

#### State Management
```javascript
const [grid, setGrid] = useState(null);
const [isRunning, setIsRunning] = useState(false);
const [generation, setGeneration] = useState(0);
const [selectedRule, setSelectedRule] = useState('gameOfLife');
```

#### Key Features
- **Rule System**: Support for multiple CA rules
- **3D Visualization**: Three-dimensional cellular automata
- **Performance Metrics**: Real-time performance monitoring
- **Interactive Controls**: Rule modification and pattern loading

## Engine Classes

### CellularAutomata (`src/engine/CellularAutomata.js`)

Core cellular automata simulation engine.

#### Main Functions

##### `initialize3DGrid(width, height, depth)`
```javascript
// Initialize 3D cellular automata grid
const grid = initialize3DGrid(20, 20, 20);
// Returns 3D array with random initial state
```

##### `count3DNeighbors(grid, x, y, z)`
```javascript
// Count living neighbors in 3D space
const neighborCount = count3DNeighbors(grid, x, y, z);
// Returns integer count of active neighbors
```

##### `updateGeneration(grid, rule)`
```javascript
// Apply cellular automata rules to generate next state
const nextGrid = updateGeneration(currentGrid, 'gameOfLife');
// Returns new grid state based on rule
```

#### Supported Rules
- **Game of Life**: Conway's classic 2D/3D rules
- **Rule 30**: Elementary cellular automaton
- **Custom Rules**: Configurable neighbor count rules

### EmergenceEngineCore (`src/engine/EmergenceEngineCore.js`)

Advanced complex systems simulation framework.

#### Core Methods

##### `initializeSystem(config)`
```javascript
const system = EmergenceEngineCore.initializeSystem({
  width: 100,
  height: 100,
  density: 0.3,
  rule: 'gameOfLife'
});
```

##### `evolveSystem(system, steps)`
```javascript
// Evolve system for multiple generations
const evolvedSystem = EmergenceEngineCore.evolveSystem(system, 10);
```

##### `analyzePatterns(system)`
```javascript
// Analyze emergent patterns and behaviors
const analysis = EmergenceEngineCore.analyzePatterns(system);
// Returns metrics on stability, periodicity, growth
```

### Metrics (`src/engine/Metrics.js`)

Performance monitoring and analytics for simulations.

#### Performance Tracking

##### `startTiming(label)`
```javascript
Metrics.startTiming('render');
// ... rendering code ...
const duration = Metrics.endTiming('render');
```

##### `trackFPS()`
```javascript
const fps = Metrics.trackFPS();
console.log(`Current FPS: ${fps}`);
```

##### `getSystemInfo()`
```javascript
const info = Metrics.getSystemInfo();
// Returns browser capabilities, canvas performance, etc.
```

## Styling Integration

### CSS Class Usage

#### Bootstrap Integration
- `navbar`, `nav-link`, `navbar-brand` - Navigation styling
- `card`, `card-body` - Content containers
- `btn`, `btn-primary`, `btn-outline-light` - Interactive buttons
- `container-lg`, `row`, `col-*` - Grid layout system

#### Custom Classes
- `.simulation-container` - Full-screen simulation wrapper
- `.controls` - Simulation control panel
- `.theme-toggle` - Theme switching button
- `.print-hidden` - Hidden in print mode

#### CSS Custom Properties
```css
/* Available in all components */
var(--surface-color)      /* Card backgrounds */
var(--on-surface-color)   /* Text on surfaces */
var(--primary-color)      /* Brand color */
var(--shadow-color)       /* Drop shadows */
var(--background-color)   /* Page background */
```

## Common Patterns

### Animation Loop Pattern
```javascript
useEffect(() => {
  if (!isRunning) return;
  
  let animationId;
  const animate = () => {
    updateState();
    render();
    animationId = requestAnimationFrame(animate);
  };
  
  animate();
  
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
}, [isRunning]);
```

### Canvas Setup Pattern
```javascript
const canvasRef = useRef(null);

useEffect(() => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Configure context
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = '#ffffff';
  
  return () => {
    // Cleanup if needed
  };
}, []);
```

### Responsive Design Pattern
```javascript
useEffect(() => {
  const handleResize = () => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

## Testing Considerations

### Component Testing
- Mock React Router context for navigation components
- Mock ThemeContext for theme-dependent components
- Use React Testing Library for DOM testing
- Mock canvas context for simulation components

### Integration Testing
- Test theme persistence across page navigation
- Verify responsive behavior at different breakpoints
- Test simulation performance under load
- Validate accessibility features

## Performance Optimization

### Canvas Optimization
- Use `requestAnimationFrame` for smooth animations
- Implement dirty rectangle rendering for large canvases
- Cache frequently used calculations
- Optimize drawing operations with `ctx.save()` and `ctx.restore()`

### React Optimization
- Use `React.memo` for pure components
- Implement `useCallback` for event handlers
- Use `useMemo` for expensive calculations
- Minimize re-renders with proper dependency arrays

### Memory Management
- Clean up timers and animation frames in `useEffect` cleanup
- Remove event listeners on component unmount
- Clear large data structures when switching simulations
- Monitor memory usage in development tools