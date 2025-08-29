// TypeScript conversion of CellularAutomata.js
import type { CellGrid, Cell } from '../types/simulation';

// 3D Grid types
type Grid3D = number[][][];

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface RenderParams {
  width: number;
  height: number;
  editMode?: boolean;
  cursor?: Point3D | { x: number; y: number };
}

// Cellular automata rule types
type CellularRules = 'conway' | 'maze' | 'coral';

/**
 * Initialize 3D cellular automata grid
 * @param width - Grid width
 * @param height - Grid height  
 * @param depth - Grid depth
 * @returns 3D grid array
 */
export const initialize3DGrid = (
  width = 20, 
  height = 20, 
  depth = 20
): Grid3D => {
  const grid: Grid3D = [];

  // Initialize grid with random values
  for (let z = 0; z < depth; z++) {
    grid[z] = [];
    for (let y = 0; y < height; y++) {
      grid[z][y] = [];
      for (let x = 0; x < width; x++) {
        grid[z][y][x] = Math.random() < 0.2 ? 1 : 0;
      }
    }
  }

  // Create a small structure in the center for visual interest
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const centerZ = Math.floor(depth / 2);

  for (let i = -2; i <= 2; i++) {
    // X axis structure
    if (centerX + i >= 0 && centerX + i < width && 
        grid[centerZ]?.[centerY]) {
      grid[centerZ][centerY][centerX + i] = 1;
    }
    
    // Y axis structure  
    if (centerY + i >= 0 && centerY + i < height && 
        grid[centerZ]?.[centerY + i]) {
      grid[centerZ][centerY + i][centerX] = 1;
    }
    
    // Z axis structure
    if (centerZ + i >= 0 && centerZ + i < depth && 
        grid[centerZ + i]?.[centerY]) {
      grid[centerZ + i][centerY][centerX] = 1;
    }
  }

  return grid;
};

/**
 * Count living neighbors in 3D space
 * @param grid - 3D grid
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @returns Number of living neighbors
 */
export const count3DNeighbors = (
  grid: Grid3D, 
  x: number, 
  y: number, 
  z: number
): number => {
  // Validate grid structure
  if (!grid?.length || !grid[0]?.length || !grid[0][0]?.length) {
    return 0;
  }

  const depth = grid.length;
  const height = grid[0].length;
  const width = grid[0][0].length;
  let count = 0;

  // Check all 26 neighbors (3x3x3 cube minus center)
  for (let dz = -1; dz <= 1; dz++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        // Skip the center cell
        if (dx === 0 && dy === 0 && dz === 0) continue;

        // Toroidal wrapping
        const nz = (z + dz + depth) % depth;
        const ny = (y + dy + height) % height;
        const nx = (x + dx + width) % width;

        // Check if neighbor exists and add to count
        if (grid[nz]?.[ny]?.[nx] !== undefined) {
          count += grid[nz][ny][nx];
        }
      }
    }
  }

  return count;
};

/**
 * Update 3D cellular automata using specified rules
 * @param currentGrid - Current 3D grid state
 * @returns Updated 3D grid
 */
export const update3DGrid = (currentGrid: Grid3D): Grid3D => {
  if (!currentGrid?.length || !currentGrid[0]?.length || !currentGrid[0][0]?.length) {
    return [];
  }

  const depth = currentGrid.length;
  const height = currentGrid[0].length;
  const width = currentGrid[0][0].length;

  // Create deep copy of the grid
  const newGrid: Grid3D = currentGrid.map(layer => 
    layer.map(row => [...row])
  );

  // Apply 3D rules (modified 3D Life rule: "Life 4-6/5")
  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const neighbors = count3DNeighbors(currentGrid, x, y, z);
        const isAlive = currentGrid[z][y][x] === 1;

        if (isAlive) {
          // Survival rule: 4-6 neighbors
          newGrid[z][y][x] = (neighbors >= 4 && neighbors <= 6) ? 1 : 0;
        } else {
          // Birth rule: exactly 5 neighbors
          newGrid[z][y][x] = (neighbors === 5) ? 1 : 0;
        }
      }
    }
  }

  return newGrid;
};

/**
 * Render 3D cellular automata in isometric view
 * @param ctx - Canvas rendering context
 * @param cellular3DGrid - 3D grid to render
 * @param params - Rendering parameters
 */
export const draw3DCellularAutomata = (
  ctx: CanvasRenderingContext2D,
  cellular3DGrid: Grid3D,
  params: RenderParams
): void => {
  if (!cellular3DGrid?.length) return;

  const { width, height, editMode = false, cursor } = params;

  // Background
  ctx.fillStyle = 'rgba(15, 23, 42, 1)';
  ctx.fillRect(0, 0, width, height);

  const gridDepth = cellular3DGrid.length;
  if (!gridDepth) return;
  
  const gridHeight = cellular3DGrid[0]?.length ?? 0;
  if (!gridHeight) return;
  
  const gridWidth = cellular3DGrid[0]?.[0]?.length ?? 0;
  if (!gridWidth) return;

  // Calculate isometric projection parameters
  const cellSize = Math.min(
    width / (gridWidth + gridDepth * 0.5), 
    height / (gridHeight + gridDepth * 0.5)
  ) * 0.8;

  const offsetX = width / 2 - (gridWidth * cellSize * 0.5 - gridDepth * cellSize * 0.25);
  const offsetY = height / 2 - (gridHeight * cellSize * 0.25 + gridDepth * cellSize * 0.125);

  // Render from back to front for proper depth ordering
  for (let z = gridDepth - 1; z >= 0; z--) {
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (cellular3DGrid[z]?.[y]?.[x] === 1) {
          // Isometric projection coordinates
          const isoX = offsetX + (x - z) * cellSize * 0.866; // cos(30°)
          const isoY = offsetY + (x + z) * cellSize * 0.5 - y * cellSize;

          // Depth-based opacity
          const alpha = 0.3 + (z / gridDepth) * 0.7;
          ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;

          // Draw top face of cube
          ctx.beginPath();
          ctx.moveTo(isoX, isoY);
          ctx.lineTo(isoX + cellSize * 0.866, isoY - cellSize * 0.5);
          ctx.lineTo(isoX, isoY - cellSize);
          ctx.lineTo(isoX - cellSize * 0.866, isoY - cellSize * 0.5);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }

  // Draw cursor if in edit mode
  if (editMode && cursor && 'z' in cursor) {
    const cursor3D = cursor as Point3D;
    const isoX = offsetX + (cursor3D.x - cursor3D.z) * cellSize * 0.866;
    const isoY = offsetY + (cursor3D.x + cursor3D.z) * cellSize * 0.5 - cursor3D.y * cellSize;

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.lineWidth = 2;

    // Draw cursor cube outline
    ctx.beginPath();
    ctx.moveTo(isoX, isoY);
    ctx.lineTo(isoX + cellSize * 0.866, isoY - cellSize * 0.5);
    ctx.lineTo(isoX, isoY - cellSize);
    ctx.lineTo(isoX - cellSize * 0.866, isoY - cellSize * 0.5);
    ctx.closePath();
    ctx.stroke();
  }
};

/**
 * Initialize 2D cellular automata grid
 * @param cellularRules - Rules to apply
 * @param width - Grid width
 * @param height - Grid height
 * @returns Initialized 2D grid
 */
export const initializeCellularGrid = (
  cellularRules: CellularRules,
  width = 60,
  height = 40
): number[][] => {
  // Initialize with random values
  const grid: number[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => Math.random() < 0.3 ? 1 : 0)
  );

  // Add pattern-specific initializations
  if (cellularRules === 'conway') {
    // Clear central area
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    for (let y = centerY - 5; y < centerY + 5; y++) {
      for (let x = centerX - 5; x < centerX + 5; x++) {
        if (y >= 0 && y < height && x >= 0 && x < width) {
          grid[y][x] = 0;
        }
      }
    }

    // Add Glider pattern
    if (width > 5 && height > 5) {
      const gliderPattern: Array<[number, number]> = [
        [1, 2], [2, 3], [3, 1], [3, 2], [3, 3]
      ];
      
      gliderPattern.forEach(([y, x]) => {
        if (y < height && x < width) {
          grid[y][x] = 1;
        }
      });
    }

    // Add Pulsar pattern if space allows
    const pulsarX = 15;
    const pulsarY = 15;
    
    if (pulsarX + 14 < width && pulsarY + 14 < height) {
      // Clear area for pulsar
      for (let y = pulsarY; y < pulsarY + 15; y++) {
        for (let x = pulsarX; x < pulsarX + 15; x++) {
          if (y < height && x < width) {
            grid[y][x] = 0;
          }
        }
      }

      // Pulsar pattern coordinates
      const pulsarPattern: Array<[number, number]> = [
        [2,4],[2,5],[2,6],[2,10],[2,11],[2,12],
        [4,2],[4,7],[4,9],[4,14],[5,2],[5,7],[5,9],[5,14],
        [6,2],[6,7],[6,9],[6,14],[7,4],[7,5],[7,6],[7,10],[7,11],[7,12],
        [9,4],[9,5],[9,6],[9,10],[9,11],[9,12],[10,2],[10,7],[10,9],[10,14],
        [11,2],[11,7],[11,9],[11,14],[12,2],[12,7],[12,9],[12,14],
        [14,4],[14,5],[14,6],[14,10],[14,11],[14,12]
      ];

      pulsarPattern.forEach(([dy, dx]) => {
        const y = pulsarY + dy;
        const x = pulsarX + dx;
        if (y < height && x < width) {
          grid[y][x] = 1;
        }
      });
    }
  }

  return grid;
};

/**
 * Count living neighbors in 2D grid
 * @param grid - 2D grid
 * @param x - X coordinate
 * @param y - Y coordinate  
 * @returns Number of living neighbors
 */
export const countNeighbors = (
  grid: number[][], 
  x: number, 
  y: number
): number => {
  if (!grid?.length || !grid[0]?.length) {
    return 0;
  }

  const height = grid.length;
  const width = grid[0].length;
  let count = 0;

  // Check 8 neighboring cells
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      // Skip center cell
      if (dx === 0 && dy === 0) continue;

      // Toroidal wrapping
      const nx = (x + dx + width) % width;
      const ny = (y + dy + height) % height;

      if (grid[ny]?.[nx] !== undefined) {
        count += grid[ny][nx];
      }
    }
  }

  return count;
};

/**
 * Update 2D cellular automata based on rules
 * @param currentGrid - Current grid state
 * @param cellularRules - Rules to apply
 * @returns Updated grid
 */
export const updateCellularGrid = (
  currentGrid: number[][], 
  cellularRules: CellularRules
): number[][] => {
  if (!currentGrid?.length || !currentGrid[0]?.length) {
    return [];
  }

  const height = currentGrid.length;
  const width = currentGrid[0].length;
  
  // Create deep copy
  const newGrid = currentGrid.map(row => [...row]);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const neighbors = countNeighbors(currentGrid, x, y);
      const isAlive = currentGrid[y][x] === 1;

      switch (cellularRules) {
        case 'conway':
          // Conway's Game of Life: B3/S23
          if (isAlive) {
            newGrid[y][x] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
          } else {
            newGrid[y][x] = (neighbors === 3) ? 1 : 0;
          }
          break;

        case 'maze':
          // Maze generation rules
          if (isAlive) {
            newGrid[y][x] = (neighbors >= 1 && neighbors <= 5) ? 1 : 0;
          } else {
            newGrid[y][x] = (neighbors === 3) ? 1 : 0;
          }
          break;

        case 'coral':
          // Coral growth simulation
          if (isAlive) {
            newGrid[y][x] = (neighbors >= 4 && neighbors <= 7) ? 1 : 0;
          } else {
            newGrid[y][x] = (neighbors === 3 || neighbors === 6 || neighbors === 7) ? 1 : 0;
          }
          break;

        default:
          // Default to Conway's rules
          if (isAlive) {
            newGrid[y][x] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
          } else {
            newGrid[y][x] = (neighbors === 3) ? 1 : 0;
          }
      }
    }
  }

  return newGrid;
};

/**
 * Render 2D cellular automata
 * @param ctx - Canvas rendering context
 * @param cellularGrid - 2D grid to render
 * @param cellular3DGrid - 3D grid (for 3D mode)
 * @param params - Rendering parameters
 * @param is3D - Whether to render in 3D mode
 * @param generation - Current generation number
 * @param cellularRules - Active rules
 */
export const drawCellularAutomata = (
  ctx: CanvasRenderingContext2D,
  cellularGrid: number[][] | null,
  cellular3DGrid: Grid3D | null,
  params: RenderParams,
  is3D: boolean,
  generation: number,
  cellularRules: CellularRules
): void => {
  if (is3D && cellular3DGrid) {
    draw3DCellularAutomata(ctx, cellular3DGrid, params);
    return;
  }

  if (!cellularGrid?.length || !cellularGrid[0]?.length) {
    return;
  }

  const { width, height, editMode = false, cursor } = params;
  const cellWidth = width / cellularGrid[0].length;
  const cellHeight = height / cellularGrid.length;

  // Background
  ctx.fillStyle = 'rgba(15, 23, 42, 1)';
  ctx.fillRect(0, 0, width, height);

  // Render cells
  cellularGrid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 1) {
        // Color variation based on generation and rules
        const age = Math.min(1, generation * 0.01);
        let r: number, g: number, b: number;

        switch (cellularRules) {
          case 'conway':
            [r, g, b] = [16, 185, 129]; // Teal
            break;
          case 'maze':
            [r, g, b] = [147, 51, 234]; // Purple
            break;
          case 'coral':
          default:
            [r, g, b] = [251, 146, 60]; // Orange
        }

        const alpha = 0.7 + age * 0.3;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        
        // Draw cell with slight gap for grid effect
        ctx.fillRect(
          x * cellWidth, 
          y * cellHeight, 
          cellWidth - 0.5, 
          cellHeight - 0.5
        );
      }
    });
  });

  // Draw cursor if in edit mode
  if (editMode && cursor && !('z' in cursor)) {
    const cursor2D = cursor as { x: number; y: number };
    const cursorX = cursor2D.x * cellWidth;
    const cursorY = cursor2D.y * cellHeight;

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(cursorX, cursorY, cellWidth, cellHeight);

    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.fillRect(cursorX, cursorY, cellWidth, cellHeight);
  }

  // Draw grid lines for large cells
  if (cellWidth > 8) {
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
    ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x <= cellularGrid[0].length; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellWidth, 0);
      ctx.lineTo(x * cellWidth, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= cellularGrid.length; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellHeight);
      ctx.lineTo(width, y * cellHeight);
      ctx.stroke();
    }
  }
};