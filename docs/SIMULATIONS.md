# Interactive Simulations Technical Documentation

## Overview

The portfolio features six distinct interactive simulations demonstrating various aspects of computer science, physics, and game development. Each simulation showcases different technical approaches and algorithms.

## Simulation Architecture

### Common Patterns

All simulations follow a consistent architectural pattern:

```javascript
const SimulationComponent = () => {
  // Core state management
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  
  // Simulation loop
  useEffect(() => {
    if (isRunning) {
      const animate = () => {
        updateSimulation();
        renderFrame();
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning]);
  
  return (
    <div className="simulation-container">
      <canvas ref={canvasRef} />
      <div className="controls">{/* Control UI */}</div>
    </div>
  );
};
```

### Performance Optimization

- **RequestAnimationFrame**: Smooth 60fps animations
- **Canvas Optimization**: Efficient drawing operations with context state management
- **Memory Management**: Proper cleanup of animation frames and event listeners
- **Responsive Design**: Dynamic canvas sizing based on viewport

## DVD Bouncer Simulation

### Technical Overview
Physics simulation of a bouncing DVD logo with realistic collision detection and color-changing effects.

#### Core Algorithm
```javascript
// Position update with velocity
const updatePosition = (logo, deltaTime) => {
  logo.x += logo.velocityX * deltaTime;
  logo.y += logo.velocityY * deltaTime;
};

// Collision detection
const checkCollision = (logo, canvas) => {
  const collisions = {
    left: logo.x <= 0,
    right: logo.x + logo.width >= canvas.width,
    top: logo.y <= 0,
    bottom: logo.y + logo.height >= canvas.height
  };
  
  return collisions;
};
```

#### Physics Implementation
- **Velocity Vectors**: Independent X and Y velocity components
- **Boundary Collision**: Perfect elastic collision with canvas edges
- **Color Randomization**: Random color selection on collision events
- **Chaos Factor**: Optional velocity randomization for organic movement

#### Key Features
```javascript
// src/pages/DvdBouncer.jsx:31
const drawSimplifiedLogo = (ctx, logo) => {
  const { x, y, color, width, height } = logo;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleX, scaleY);
  ctx.fillStyle = shadeColor(color, -10);
  ctx.globalAlpha = 0.9;
  
  // Render DVD logo path
  const outerPath = new Path2D(dvdLogoPath[0]);
  ctx.fill(outerPath);
  
  ctx.restore();
};
```

#### Performance Features
- SVG path rendering for crisp logo display
- Optimized drawing with canvas transforms
- Minimal state updates for smooth animation
- Efficient collision detection algorithms

## Breakout Game

### Technical Overview
Classic arcade game implementation in TypeScript with modern React patterns.

#### TypeScript Interfaces
```typescript
// src/pages/Breakout.tsx:45
interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Ball extends GameObject {
  dx: number; // X velocity
  dy: number; // Y velocity
  radius: number;
}

interface Brick extends GameObject {
  visible: boolean;
  color: string;
  value: number; // Points awarded
}
```

#### Game Physics

##### Ball Movement
```typescript
const updateBall = (ball: Ball, deltaTime: number) => {
  ball.x += ball.dx * deltaTime;
  ball.y += ball.dy * deltaTime;
  
  // Wall collision detection
  if (ball.x <= ball.radius || ball.x >= canvas.width - ball.radius) {
    ball.dx *= -1;
  }
  if (ball.y <= ball.radius) {
    ball.dy *= -1;
  }
};
```

##### Paddle Collision
```typescript
const checkPaddleCollision = (ball: Ball, paddle: GameObject) => {
  const ballBottom = ball.y + ball.radius;
  const ballTop = ball.y - ball.radius;
  const ballLeft = ball.x - ball.radius;
  const ballRight = ball.x + ball.radius;
  
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;
  const paddleLeft = paddle.x;
  const paddleRight = paddle.x + paddle.width;
  
  return (ballBottom >= paddleTop && ballTop <= paddleBottom &&
          ballRight >= paddleLeft && ballLeft <= paddleRight);
};
```

#### Dynamic Sizing System
```typescript
// src/pages/Breakout.tsx:5
const useGameDimensions = () => {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  
  useEffect(() => {
    const updateDimensions = () => {
      const navbarHeight = 80;
      const verticalPadding = 80;
      const horizontalPadding = 40;
      const uiElementsHeight = 120;
      
      const availableWidth = window.innerWidth - horizontalPadding;
      const availableHeight = window.innerHeight - navbarHeight - verticalPadding - uiElementsHeight;
      
      // Maintain 4:3 aspect ratio
      const aspectRatio = 4/3;
      let gameWidth = availableWidth;
      let gameHeight = gameWidth / aspectRatio;
      
      if (gameHeight > availableHeight) {
        gameHeight = availableHeight;
        gameWidth = gameHeight * aspectRatio;
      }
      
      setDimensions({ width: gameWidth, height: gameHeight });
    };
    
    updateDimensions();
  }, []);
};
```

#### Game State Management
```typescript
type GameState = 'playing' | 'paused' | 'gameOver' | 'victory';

const [gameState, setGameState] = useState<GameState>('paused');
const [score, setScore] = useState(0);
const [lives, setLives] = useState(3);
const [level, setLevel] = useState(1);
```

## Emergence Engine

### Technical Overview
Advanced cellular automata and complex systems visualization engine supporting both 2D and 3D simulations.

#### Engine Architecture
```javascript
// src/pages/EmergenceEngine.jsx:4
import { initializeAgents, updateAgents } from '../engine/EmergenceEngineCore.js';
import {
  initializeCellularGrid,
  updateCellularGrid,
  drawCellularAutomata,
  initialize3DGrid,
  update3DGrid
} from '../engine/CellularAutomata.js';
```

#### Cellular Automata Implementation

##### 3D Grid Initialization
```javascript
// src/engine/CellularAutomata.js:4
export const initialize3DGrid = (width = 20, height = 20, depth = 20) => {
  const grid = [];
  for (let z = 0; z < depth; z++) {
    grid[z] = [];
    for (let y = 0; y < height; y++) {
      grid[z][y] = [];
      for (let x = 0; x < width; x++) {
        grid[z][y][x] = Math.random() < 0.2 ? 1 : 0;
      }
    }
  }
  
  // Create central structure for visual interest
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const centerZ = Math.floor(depth / 2);
  
  for (let i = -2; i <= 2; i++) {
    if (centerX + i >= 0 && centerX + i < width) 
      grid[centerZ][centerY][centerX + i] = 1;
    if (centerY + i >= 0 && centerY + i < height) 
      grid[centerZ][centerY + i][centerX] = 1;
    if (centerZ + i >= 0 && centerZ + i < depth) 
      grid[centerZ + i][centerY][centerX] = 1;
  }
  
  return grid;
};
```

##### 3D Neighbor Counting
```javascript
// src/engine/CellularAutomata.js:31
export const count3DNeighbors = (grid, x, y, z) => {
  const depth = grid.length;
  const height = grid[0].length;
  const width = grid[0][0].length;
  let count = 0;

  for (let dz = -1; dz <= 1; dz++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0 && dz === 0) continue;
        
        // Toroidal wrapping for seamless boundaries
        const nz = (z + dz + depth) % depth;
        const ny = (y + dy + height) % height;
        const nx = (x + dx + width) % width;
        
        if (grid[nz] && grid[nz][ny] && typeof grid[nz][ny][nx] !== 'undefined') {
          count += grid[nz][ny][nx];
        }
      }
    }
  }
  
  return count;
};
```

#### Conway's Game of Life Rules
```javascript
const applyGameOfLifeRules = (currentState, neighborCount) => {
  if (currentState === 1) {
    // Live cell survival rules
    return (neighborCount === 2 || neighborCount === 3) ? 1 : 0;
  } else {
    // Dead cell birth rule
    return neighborCount === 3 ? 1 : 0;
  }
};
```

#### Configurable Rule System
```javascript
// src/config/emergenceRules.js
export const defaultRules = {
  birthThreshold: 3,
  survivalMin: 2,
  survivalMax: 3,
  overpopulationLimit: 4,
  underpopulationLimit: 1
};

// Custom rule application
const applyCustomRules = (currentState, neighborCount, rules) => {
  if (currentState === 1) {
    // Survival conditions
    return (neighborCount >= rules.survivalMin && 
            neighborCount <= rules.survivalMax) ? 1 : 0;
  } else {
    // Birth conditions
    return neighborCount === rules.birthThreshold ? 1 : 0;
  }
};
```

#### Real-Time Metrics
```javascript
// src/engine/Metrics.js
export const calculateMetrics = (grid, previousGrid) => {
  let livingCells = 0;
  let changedCells = 0;
  let totalCells = 0;
  
  // Calculate basic statistics
  for (let z = 0; z < grid.length; z++) {
    for (let y = 0; y < grid[z].length; y++) {
      for (let x = 0; x < grid[z][y].length; x++) {
        totalCells++;
        if (grid[z][y][x] === 1) livingCells++;
        if (previousGrid && grid[z][y][x] !== previousGrid[z][y][x]) {
          changedCells++;
        }
      }
    }
  }
  
  return {
    livingCells,
    density: livingCells / totalCells,
    stability: 1 - (changedCells / totalCells),
    generation: generation + 1
  };
};
```

## Duck Konundrum Puzzle

### Technical Overview
Recreation of an MIT Mystery Hunt puzzle featuring constraint satisfaction and logical reasoning simulation.

#### Puzzle Logic
The simulation demonstrates step-by-step constraint solving where team members must be arranged to spell "QUACK" using their initials.

#### Constraint System
```javascript
const constraints = {
  teamMembers: ['Harold', 'Quinn', 'Uma', 'Alice', 'Charlie', 'Kevin'],
  targetWord: 'QUACK',
  positions: [1, 2, 3, 4, 5], // Available positions
  rules: {
    haroldMustBeLast: true,
    adjacencyConstraints: true,
    uniquePositions: true
  }
};
```

#### Solving Algorithm
```javascript
const solveConstraints = (members, target) => {
  const steps = [];
  
  // Step 1: Identify required initials
  const requiredInitials = target.split(''); // ['Q', 'U', 'A', 'C', 'K']
  
  // Step 2: Map members to initials
  const memberInitials = members.map(name => ({
    name,
    initial: name[0]
  }));
  
  // Step 3: Apply constraints
  const validArrangements = findValidArrangements(memberInitials, requiredInitials);
  
  // Step 4: Demonstrate solution process
  steps.push({
    description: "Identifying team members and required letters",
    data: { members, target, requiredInitials }
  });
  
  return { solution: validArrangements[0], steps };
};
```

#### Interactive Visualization
- Step-by-step puzzle progression
- Highlight constraint violations and successes
- Educational demonstration of logical reasoning
- Visual feedback for each solving step

## Prism Simulations

### Prism Light Dispersion (2D)
Physics-based simulation of light refraction through triangular prisms.

#### Ray Tracing Implementation
```javascript
const calculateRefraction = (ray, surface, n1, n2) => {
  // Snell's Law: n1 * sin(θ1) = n2 * sin(θ2)
  const incidenceAngle = calculateIncidenceAngle(ray, surface);
  const sinTheta2 = (n1 / n2) * Math.sin(incidenceAngle);
  
  // Check for total internal reflection
  if (Math.abs(sinTheta2) > 1) {
    return calculateReflection(ray, surface);
  }
  
  const refractionAngle = Math.asin(sinTheta2);
  return createRefractedRay(ray, surface, refractionAngle);
};
```

#### Spectral Dispersion
```javascript
const disperseWhiteLight = (ray, prism) => {
  const wavelengths = [650, 580, 550, 480, 400]; // Red to Violet
  const refractiveIndices = wavelengths.map(w => calculateRefractiveIndex(w));
  
  return wavelengths.map((wavelength, index) => {
    const dispersedRay = calculateRefraction(ray, prism, 1.0, refractiveIndices[index]);
    return {
      ...dispersedRay,
      wavelength,
      color: wavelengthToColor(wavelength)
    };
  });
};
```

### 3D Prism Simulation
Advanced three-dimensional light simulation with interactive controls.

#### 3D Ray Mathematics
```javascript
const trace3DRay = (origin, direction, prism) => {
  // Ray-triangle intersection for 3D prism faces
  const intersections = prism.faces.map(face => 
    calculateRayTriangleIntersection(origin, direction, face)
  );
  
  // Find closest intersection
  const closestIntersection = intersections
    .filter(i => i.distance > 0)
    .sort((a, b) => a.distance - b.distance)[0];
  
  if (!closestIntersection) return null;
  
  return {
    point: closestIntersection.point,
    normal: closestIntersection.face.normal,
    distance: closestIntersection.distance
  };
};
```

#### 3D Visualization
- Interactive camera controls with mouse/touch
- Real-time 3D rendering using Canvas 2D API
- Multiple prism shapes and orientations
- Dynamic light source positioning

## Game of Life

### Technical Overview
Classic Conway's Game of Life implementation with Windows 98 styling and modern React patterns.

#### Grid Management
```javascript
const initializeGrid = (rows, cols) => {
  return Array(rows).fill().map(() => 
    Array(cols).fill().map(() => Math.random() > 0.7 ? 1 : 0)
  );
};
```

#### Rule Implementation
```javascript
const updateGrid = (grid) => {
  const newGrid = grid.map(row => [...row]);
  
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      const neighbors = countNeighbors(grid, i, j);
      
      if (grid[i][j] === 1) {
        // Live cell rules
        newGrid[i][j] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
      } else {
        // Dead cell rules  
        newGrid[i][j] = neighbors === 3 ? 1 : 0;
      }
    }
  }
  
  return newGrid;
};
```

#### Neighbor Counting
```javascript
const countNeighbors = (grid, row, col) => {
  let count = 0;
  
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      
      const newRow = row + i;
      const newCol = col + j;
      
      // Boundary checking
      if (newRow >= 0 && newRow < grid.length && 
          newCol >= 0 && newCol < grid[newRow].length) {
        count += grid[newRow][newCol];
      }
    }
  }
  
  return count;
};
```

#### Pattern Management
```javascript
const patterns = {
  glider: [
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 1]
  ],
  blinker: [
    [1, 1, 1]
  ],
  block: [
    [1, 1],
    [1, 1]
  ]
};

const insertPattern = (grid, pattern, startRow, startCol) => {
  const newGrid = grid.map(row => [...row]);
  
  pattern.forEach((row, i) => {
    row.forEach((cell, j) => {
      const gridRow = startRow + i;
      const gridCol = startCol + j;
      
      if (gridRow >= 0 && gridRow < newGrid.length &&
          gridCol >= 0 && gridCol < newGrid[gridRow].length) {
        newGrid[gridRow][gridCol] = cell;
      }
    });
  });
  
  return newGrid;
};
```

## Performance Considerations

### Canvas Optimization

#### Efficient Rendering
```javascript
// Use canvas state management for performance
const optimizedRender = (ctx, objects) => {
  ctx.save();
  
  // Batch similar operations
  objects.forEach(obj => {
    if (obj.type === 'circle') {
      renderCircles(ctx, objects.filter(o => o.type === 'circle'));
    }
  });
  
  ctx.restore();
};
```

#### Memory Management
```javascript
// Proper cleanup in simulation components
useEffect(() => {
  return () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    // Clean up large data structures
    setGrid([]);
    setAgents([]);
  };
}, []);
```

### Frame Rate Optimization
```javascript
// Adaptive frame rate for complex simulations
const adaptiveFrameRate = (complexity) => {
  const baseDelay = 16; // 60fps
  const complexityMultiplier = Math.min(complexity / 1000, 5);
  return baseDelay * (1 + complexityMultiplier);
};
```

## Accessibility Features

### Keyboard Navigation
```javascript
// Keyboard controls for simulations
useEffect(() => {
  const handleKeyPress = (event) => {
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        setIsRunning(prev => !prev);
        break;
      case 'KeyR':
        event.preventDefault();
        resetSimulation();
        break;
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

### Screen Reader Support
```javascript
// Accessible controls with proper ARIA labels
<button
  onClick={toggleSimulation}
  aria-label={isRunning ? 'Pause simulation' : 'Start simulation'}
  aria-pressed={isRunning}
>
  {isRunning ? <Pause /> : <Play />}
</button>
```

## Future Enhancements

### Planned Features
- **WebGL Integration**: Hardware-accelerated 3D graphics
- **Web Workers**: Background computation for complex simulations  
- **WebAssembly**: High-performance mathematical calculations
- **Real-time Collaboration**: Multi-user simulation editing
- **Export Functionality**: Save simulation states and animations
- **Mobile Optimization**: Touch controls and responsive layouts
- **VR/AR Support**: Immersive 3D visualization experiences

### Technical Debt
- Standardize TypeScript usage across all simulations
- Implement comprehensive error handling
- Add automated testing for simulation accuracy
- Optimize bundle size with code splitting
- Improve mobile performance and touch controls

## Development Resources

### Testing Simulations
```bash
# Performance testing
npm run dev
# Open DevTools Performance tab
# Record simulation for analysis

# Memory leak detection
# Monitor DevTools Memory tab
# Watch for growing heap size during long runs
```

### Debugging Tips
```javascript
// Debug mode for simulations
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

if (DEBUG_MODE) {
  console.log('Simulation state:', { 
    isRunning, 
    generation, 
    activeObjects: objects.length 
  });
}
```

### Performance Monitoring
```javascript
// Frame rate monitoring
let frameCount = 0;
let lastTime = Date.now();

const monitorPerformance = () => {
  frameCount++;
  const currentTime = Date.now();
  
  if (currentTime - lastTime >= 1000) {
    const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
    console.log(`FPS: ${fps}`);
    frameCount = 0;
    lastTime = currentTime;
  }
};
```