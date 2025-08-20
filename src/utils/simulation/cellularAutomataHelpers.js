// Cellular Automata Helper Functions
// Extracted from EmergenceEngine.jsx

// Helper functions for cellular automata simulation and metrics
export const getCellularGridMetrics = (grid, is3D = false) => {
  if (!grid || grid.length === 0) return { totalCells: 0, liveCells: 0, density: 0 };

  let totalCells = 0;
  let liveCells = 0;

  if (is3D && grid[0] && grid[0][0]) {
    totalCells = grid.length * grid[0].length * grid[0][0].length;
    liveCells = grid.flat(2).filter(cell => cell === 1).length;
  } else if (!is3D && grid[0]) {
    totalCells = grid.length * (grid[0]?.length || 0);
    liveCells = grid.flat().filter(cell => cell === 1).length;
  }

  const density = totalCells > 0 ? liveCells / totalCells : 0;
  
  return { totalCells, liveCells, density };
};

// Calculate emergence metrics based on cellular automata state
export const calculateEmergenceMetrics = (grid, is3D, generation) => {
  const { totalCells, liveCells, density } = getCellularGridMetrics(grid, is3D);
  
  return {
    coherence: density,
    diversity: Math.abs(0.5 - density) * 2,
    efficiency: generation > 0 && liveCells > 0 ? 
      Math.min(1, liveCells / (generation * 0.1 + liveCells * 0.01)) : 0
  };
};

// Grid manipulation helpers
export const createDeepGridCopy = (grid, is3D = false) => {
  if (is3D) {
    return grid.map(layer => layer.map(row => [...row]));
  } else {
    return grid.map(row => [...row]);
  }
};

// Toggle cell state at cursor position
export const toggleCellAtCursor = (grid, cursor, is3D = false) => {
  const newGrid = createDeepGridCopy(grid, is3D);
  
  if (is3D) {
    if (newGrid[cursor.z] && newGrid[cursor.z][cursor.y] && 
        typeof newGrid[cursor.z][cursor.y][cursor.x] !== 'undefined') {
      newGrid[cursor.z][cursor.y][cursor.x] = 1 - newGrid[cursor.z][cursor.y][cursor.x];
    }
  } else {
    if (newGrid[cursor.y] && typeof newGrid[cursor.y][cursor.x] !== 'undefined') {
      newGrid[cursor.y][cursor.x] = 1 - newGrid[cursor.y][cursor.x];
    }
  }
  
  return newGrid;
};

// Cursor movement validation
export const validateCursorMovement = (cursor, direction, config, is3D = false) => {
  const maxX = config.defaultWidth - 1;
  const maxY = config.defaultHeight - 1;
  const maxZ = is3D ? config.defaultDepth - 1 : 0;
  
  let newCursor = { ...cursor };
  
  switch (direction) {
    case 'left':
    case 'a':
      newCursor.x = Math.max(0, cursor.x - 1);
      break;
    case 'right':
    case 'd':
      newCursor.x = Math.min(maxX, cursor.x + 1);
      break;
    case 'up':
    case 'w':
      newCursor.y = Math.max(0, cursor.y - 1);
      break;
    case 'down':
    case 's':
      newCursor.y = Math.min(maxY, cursor.y + 1);
      break;
    case 'q':
      if (is3D) newCursor.z = Math.max(0, cursor.z - 1);
      break;
    case 'e':
      if (is3D) newCursor.z = Math.min(maxZ, cursor.z + 1);
      break;
  }
  
  return newCursor;
};

// Agent visualization helpers for non-cellular patterns
export const getAgentVisualizationProps = (agent, selectedPattern) => {
  const size = selectedPattern === 'neurons' ? 3 + agent.activation * 0.05 :
               selectedPattern === 'economy' ? 2 + agent.energy * 0.02 : 3;

  const color = selectedPattern === 'neurons' ? 
    `rgba(16, 185, 129, ${0.3 + agent.activation * 0.007})` :
    selectedPattern === 'economy' ? 
      (agent.role === 'producer' ? 'rgba(239, 68, 68, 0.8)' :
       agent.role === 'consumer' ? 'rgba(59, 130, 246, 0.8)' :
       'rgba(245, 158, 11, 0.8)') :
    'rgba(139, 92, 246, 0.8)';

  return { size, color };
};

// Drawing helpers for different agent patterns
export const drawFlockingAgent = (ctx, agent) => {
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(agent.x, agent.y);
  ctx.lineTo(agent.x + agent.vx * 10, agent.y + agent.vy * 10);
  ctx.stroke();
};