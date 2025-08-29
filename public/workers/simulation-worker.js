/**
 * Web Worker for Heavy Simulation Computations
 * Handles cellular automata, game of life, and physics calculations
 * to keep the main thread responsive (improve FID)
 */

// Worker message types
const MESSAGE_TYPES = {
  GAME_OF_LIFE_STEP: 'GAME_OF_LIFE_STEP',
  EMERGENCE_ENGINE_STEP: 'EMERGENCE_ENGINE_STEP',
  PHYSICS_CALCULATION: 'PHYSICS_CALCULATION',
  MAZE_GENERATION: 'MAZE_GENERATION',
  PATHFINDING: 'PATHFINDING'
};

// Performance monitoring
let performanceMetrics = {
  totalOperations: 0,
  averageExecutionTime: 0,
  peakMemoryUsage: 0
};

// Game of Life logic
function calculateGameOfLifeStep(grid, rules = { birth: [3], survive: [2, 3] }) {
  const startTime = performance.now();
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = Array(rows).fill(null).map(() => Array(cols).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const neighbors = countLiveNeighbors(grid, i, j);
      const isAlive = grid[i][j] === 1;
      
      if (isAlive) {
        // Cell survival rules
        newGrid[i][j] = rules.survive.includes(neighbors) ? 1 : 0;
      } else {
        // Cell birth rules
        newGrid[i][j] = rules.birth.includes(neighbors) ? 1 : 0;
      }
    }
  }

  const executionTime = performance.now() - startTime;
  updatePerformanceMetrics(executionTime);
  
  return {
    grid: newGrid,
    stats: {
      executionTime,
      aliveCells: newGrid.flat().filter(cell => cell === 1).length,
      generation: (grid.generation || 0) + 1
    }
  };
}

function countLiveNeighbors(grid, row, col) {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      
      const newRow = (row + i + rows) % rows; // Wrap around edges
      const newCol = (col + j + cols) % cols;
      
      if (grid[newRow][newCol] === 1) count++;
    }
  }
  
  return count;
}

// Emergence Engine calculations
function calculateEmergenceStep(entities, config) {
  const startTime = performance.now();
  const updatedEntities = entities.map(entity => {
    const forces = calculateForces(entity, entities, config);
    const acceleration = {
      x: forces.x / (entity.mass || 1),
      y: forces.y / (entity.mass || 1)
    };

    return {
      ...entity,
      vx: entity.vx + acceleration.x * config.deltaTime,
      vy: entity.vy + acceleration.y * config.deltaTime,
      x: entity.x + entity.vx * config.deltaTime,
      y: entity.y + entity.vy * config.deltaTime,
      age: (entity.age || 0) + 1
    };
  });

  const executionTime = performance.now() - startTime;
  updatePerformanceMetrics(executionTime);

  return {
    entities: updatedEntities,
    stats: {
      executionTime,
      activeEntities: updatedEntities.filter(e => e.active !== false).length
    }
  };
}

function calculateForces(entity, allEntities, config) {
  let totalForce = { x: 0, y: 0 };

  allEntities.forEach(other => {
    if (other.id === entity.id) return;

    const dx = other.x - entity.x;
    const dy = other.y - entity.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < config.maxInteractionDistance && distance > 0) {
      const force = calculateInteractionForce(entity, other, distance, config);
      totalForce.x += (dx / distance) * force;
      totalForce.y += (dy / distance) * force;
    }
  });

  // Apply environmental forces
  if (config.boundaries) {
    const boundaryForce = calculateBoundaryForce(entity, config);
    totalForce.x += boundaryForce.x;
    totalForce.y += boundaryForce.y;
  }

  return totalForce;
}

function calculateInteractionForce(entity1, entity2, distance, config) {
  // Simple attraction/repulsion based on entity types
  const baseForce = config.baseForce || 0.1;
  const typeMultiplier = getTypeInteractionMultiplier(entity1.type, entity2.type, config);
  
  return (baseForce * typeMultiplier) / (distance * distance);
}

function calculateBoundaryForce(entity, config) {
  const force = { x: 0, y: 0 };
  const margin = config.boundaryMargin || 50;
  const strength = config.boundaryStrength || 0.5;

  if (entity.x < margin) force.x += strength * (margin - entity.x);
  if (entity.x > config.width - margin) force.x -= strength * (entity.x - (config.width - margin));
  if (entity.y < margin) force.y += strength * (margin - entity.y);
  if (entity.y > config.height - margin) force.y -= strength * (entity.y - (config.height - margin));

  return force;
}

function getTypeInteractionMultiplier(type1, type2, config) {
  const interactions = config.typeInteractions || {};
  const key = `${type1}-${type2}`;
  const reverseKey = `${type2}-${type1}`;
  
  return interactions[key] || interactions[reverseKey] || 1;
}

// Physics calculations for simulations
function calculatePhysicsStep(entities, config) {
  const startTime = performance.now();
  
  const updatedEntities = entities.map(entity => {
    // Apply gravity
    let acceleration = { x: 0, y: config.gravity || 0 };
    
    // Apply drag
    const drag = config.drag || 0.99;
    const newVx = entity.vx * drag + acceleration.x * config.deltaTime;
    const newVy = entity.vy * drag + acceleration.y * config.deltaTime;
    
    // Update position
    const newX = entity.x + newVx * config.deltaTime;
    const newY = entity.y + newVy * config.deltaTime;
    
    // Handle boundary collisions
    let finalX = newX;
    let finalY = newY;
    let finalVx = newVx;
    let finalVy = newVy;
    
    if (config.boundaries) {
      if (newX <= 0 || newX >= config.width) {
        finalVx = -newVx * (config.restitution || 0.8);
        finalX = Math.max(0, Math.min(config.width, newX));
      }
      if (newY <= 0 || newY >= config.height) {
        finalVy = -newVy * (config.restitution || 0.8);
        finalY = Math.max(0, Math.min(config.height, newY));
      }
    }
    
    return {
      ...entity,
      x: finalX,
      y: finalY,
      vx: finalVx,
      vy: finalVy
    };
  });

  const executionTime = performance.now() - startTime;
  updatePerformanceMetrics(executionTime);

  return {
    entities: updatedEntities,
    stats: { executionTime }
  };
}

// Performance monitoring utilities
function updatePerformanceMetrics(executionTime) {
  performanceMetrics.totalOperations++;
  performanceMetrics.averageExecutionTime = 
    (performanceMetrics.averageExecutionTime * (performanceMetrics.totalOperations - 1) + executionTime) / 
    performanceMetrics.totalOperations;
    
  // Estimate memory usage (rough approximation)
  if (performance.memory) {
    performanceMetrics.peakMemoryUsage = Math.max(
      performanceMetrics.peakMemoryUsage, 
      performance.memory.usedJSHeapSize
    );
  }
}

function getPerformanceReport() {
  return {
    ...performanceMetrics,
    memorySupported: !!performance.memory,
    currentMemoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0
  };
}

// Main message handler
self.addEventListener('message', (event) => {
  const { type, data, requestId } = event.data;
  
  try {
    let result;
    
    switch (type) {
      case MESSAGE_TYPES.GAME_OF_LIFE_STEP:
        result = calculateGameOfLifeStep(data.grid, data.rules);
        break;
        
      case MESSAGE_TYPES.EMERGENCE_ENGINE_STEP:
        result = calculateEmergenceStep(data.entities, data.config);
        break;
        
      case MESSAGE_TYPES.PHYSICS_CALCULATION:
        result = calculatePhysicsStep(data.entities, data.config);
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
    
    // Send result back to main thread
    self.postMessage({
      type: 'RESULT',
      requestId,
      data: result,
      success: true,
      performanceMetrics: getPerformanceReport()
    });
    
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      type: 'ERROR',
      requestId,
      error: {
        message: error.message,
        stack: error.stack
      },
      success: false
    });
  }
});

// Worker initialization
self.postMessage({
  type: 'WORKER_READY',
  capabilities: Object.keys(MESSAGE_TYPES),
  performanceSupported: {
    highResolutionTime: !!performance.now,
    memoryAPI: !!performance.memory,
    workerPerformanceAPI: !!performance.mark
  }
});

console.log('🔧 Simulation Worker initialized and ready for computations');