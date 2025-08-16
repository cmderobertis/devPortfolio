// src/engine/CellularAutomata.js

// Initialize 3D cellular automata grid
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

  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const centerZ = Math.floor(depth / 2);

  // Create a small structure in the center for visual interest
  for (let i = -2; i <= 2; i++) {
    if (centerX + i >= 0 && centerX + i < width && grid[centerZ] && grid[centerZ][centerY]) grid[centerZ][centerY][centerX + i] = 1;
    if (centerY + i >= 0 && centerY + i < height && grid[centerZ] && grid[centerZ][centerY + i]) grid[centerZ][centerY + i][centerX] = 1;
    if (centerZ + i >= 0 && centerZ + i < depth && grid[centerZ + i] && grid[centerZ + i][centerY]) grid[centerZ + i][centerY][centerX] = 1;
  }

  return grid;
};

// Count 3D neighbors
export const count3DNeighbors = (grid, x, y, z) => {
  // Check if grid and its dimensions are valid before proceeding
  if (!grid || grid.length === 0 || !grid[0] || grid[0].length === 0 || !grid[0][0] || grid[0][0].length === 0) {
    // console.error("Invalid grid structure in count3DNeighbors");
    return 0;
  }
  const depth = grid.length;
  const height = grid[0].length;
  const width = grid[0][0].length;
  let count = 0;

  for (let dz = -1; dz <= 1; dz++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0 && dz === 0) continue;
        const nz = (z + dz + depth) % depth; // Ensure wrapping for toroidal array
        const ny = (y + dy + height) % height;
        const nx = (x + dx + width) % width;
        // Additional checks for grid integrity if necessary, though modulo should handle bounds
        if (grid[nz] && grid[nz][ny] && typeof grid[nz][ny][nx] !== 'undefined') {
           count += grid[nz][ny][nx];
        }
      }
    }
  }

  return count;
};

// Update 3D cellular automata
export const update3DGrid = (currentGrid) => {
  if (!currentGrid || currentGrid.length === 0 || !currentGrid[0] || currentGrid[0].length === 0 || !currentGrid[0][0] || currentGrid[0][0].length === 0) {
    // console.warn("update3DGrid: currentGrid is empty or invalid.");
    return []; // Or handle error appropriately
  }
  const depth = currentGrid.length;
  const height = currentGrid[0].length;
  const width = currentGrid[0][0].length;

  // Create a deep copy of the grid
  const newGrid = currentGrid.map(layer => layer.map(row => [...row]));

  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const neighbors = count3DNeighbors(currentGrid, x, y, z); // Pass currentGrid

        // Example 3D rule (e.g., "Life 4-5/5")
        if (currentGrid[z][y][x] === 1) { // If cell is alive
          if (neighbors < 4 || neighbors > 6) { // Rule for survival (e.g., original had <4 or >6)
            newGrid[z][y][x] = 0; // Dies (underpopulation or overpopulation)
          }
        } else { // If cell is dead
          if (neighbors === 5) { // Rule for birth (e.g., original had ===5)
            newGrid[z][y][x] = 1; // Born
          }
        }
      }
    }
  }

  return newGrid;
};

// Draw 3D cellular automata (isometric view)
export const draw3DCellularAutomata = (ctx, cellular3DGrid, width, height, editMode, cursor) => {
  if (!cellular3DGrid || !cellular3DGrid.length) return;

  ctx.fillStyle = 'rgba(15, 23, 42, 1)'; // Background color (e.g., dark blue)
  ctx.fillRect(0, 0, width, height);

  const gridDepth = cellular3DGrid.length;
  if (gridDepth === 0) return;
  const gridHeight = cellular3DGrid[0].length;
  if (gridHeight === 0) return;
  const gridWidth = cellular3DGrid[0][0].length;
  if (gridWidth === 0) return;

  // Adjust cellSize calculation for better visualization
  const cellSize = Math.min(width / (gridWidth + gridDepth * 0.5), height / (gridHeight + gridDepth * 0.5)) * 0.8;
  const offsetX = width / 2 - (gridWidth * cellSize * 0.5 - gridDepth * cellSize * 0.25); // Center isometric view
  const offsetY = height / 2 - (gridHeight * cellSize * 0.25 + gridDepth * cellSize * 0.125); // Adjust vertical centering

  for (let z = gridDepth - 1; z >= 0; z--) { // Draw from back to front for correct layering
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (cellular3DGrid[z][y][x] === 1) {
          // Isometric projection
          const isoX = offsetX + (x - z) * cellSize * 0.866; // cos(30deg)
          const isoY = offsetY + (x + z) * cellSize * 0.5 - y * cellSize;   // sin(30deg) for x and z, y goes "up"

          const alpha = 0.3 + (z / gridDepth) * 0.7; // Opacity based on depth
          ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`; // Cell color (e.g., teal)

          // Draw a simple cube (can be improved with actual 3D faces)
          // Top face
          ctx.beginPath();
          ctx.moveTo(isoX, isoY);
          ctx.lineTo(isoX + cellSize * 0.866, isoY - cellSize * 0.5);
          ctx.lineTo(isoX, isoY - cellSize);
          ctx.lineTo(isoX - cellSize * 0.866, isoY - cellSize * 0.5);
          ctx.closePath();
          ctx.fill();
          // Could add side faces for better 3D effect here
        }
      }
    }
  }

  if (editMode && cursor) { // editMode and cursor are passed as arguments
    // Adjust cursor projection similarly
    const isoX = offsetX + (cursor.x - cursor.z) * cellSize * 0.866;
    const isoY = offsetY + (cursor.x + cursor.z) * cellSize * 0.5 - cursor.y * cellSize;

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'; // Cursor color (e.g., red)
    ctx.lineWidth = 2;
    // Draw a cube outline for the cursor
    ctx.beginPath();
    ctx.moveTo(isoX, isoY);
    ctx.lineTo(isoX + cellSize * 0.866, isoY - cellSize * 0.5);
    ctx.lineTo(isoX, isoY - cellSize);
    ctx.lineTo(isoX - cellSize * 0.866, isoY - cellSize * 0.5);
    ctx.closePath();
    ctx.stroke();
  }
};

// Initialize cellular automata grid
export const initializeCellularGrid = (cellularRules, width = 60, height = 40) => {
  const grid = [];
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      grid[y][x] = Math.random() < 0.3 ? 1 : 0; // Default random initialization
    }
  }

  // Specific patterns based on cellularRules (example: Conway's Game of Life patterns)
  if (cellularRules === 'conway') {
    // Clear a central area
    for (let y = Math.floor(height/2) - 5; y < Math.floor(height/2) + 5; y++) {
      for (let x = Math.floor(width/2) - 5; x < Math.floor(width/2) + 5; x++) {
        if (y >= 0 && y < height && x >=0 && x < width) grid[y][x] = 0;
      }
    }
    // Glider
    if (width > 5 && height > 5) {
        grid[1][2] = 1; grid[2][3] = 1; grid[3][1] = 1; grid[3][2] = 1; grid[3][3] = 1;
    }

    // Pulsar (example, requires larger grid)
    const px = 15, py = 15; // Position for Pulsar
    if (px + 14 < width && py + 14 < height) { // Check bounds for pulsar
      for (let y = py; y < py + 15; y++) { // Clear area for pulsar
        for (let x = px; x < px + 15; x++) {
          grid[y][x] = 0;
        }
      }
      const pulsarPattern = [
        [2,4],[2,5],[2,6],[2,10],[2,11],[2,12],
        [4,2],[4,7],[4,9],[4,14],[5,2],[5,7],[5,9],[5,14],
        [6,2],[6,7],[6,9],[6,14],[7,4],[7,5],[7,6],[7,10],[7,11],[7,12],
        [9,4],[9,5],[9,6],[9,10],[9,11],[9,12],[10,2],[10,7],[10,9],[10,14],
        [11,2],[11,7],[11,9],[11,14],[12,2],[12,7],[12,9],[12,14],
        [14,4],[14,5],[14,6],[14,10],[14,11],[14,12]
      ];
      pulsarPattern.forEach(([dx, dy]) => {
        if (py + dy < height && px + dx < width) { // Check bounds for each cell
          grid[py + dy][px + dx] = 1;
        }
      });
    }
  }
  return grid;
};

// Count neighbors for cellular automata
export const countNeighbors = (grid, x, y) => {
  if (!grid || grid.length === 0 || !grid[0] || grid[0].length === 0) {
    // console.error("Invalid grid structure in countNeighbors");
    return 0;
  }
  const height = grid.length;
  const width = grid[0].length;
  let count = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = (x + dx + width) % width;   // Toroidal wrapping
      const ny = (y + dy + height) % height; // Toroidal wrapping
      if (grid[ny] && typeof grid[ny][nx] !== 'undefined') {
        count += grid[ny][nx];
      }
    }
  }
  return count;
};

// Update cellular automata
export const updateCellularGrid = (currentGrid, cellularRules) => {
  if (!currentGrid || currentGrid.length === 0 || !currentGrid[0] || currentGrid[0].length === 0) {
    // console.warn("updateCellularGrid: currentGrid is empty or invalid.");
    return [];
  }
  const height = currentGrid.length;
  const width = currentGrid[0].length;
  const newGrid = currentGrid.map(row => [...row]); // Deep copy

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const neighbors = countNeighbors(currentGrid, x, y); // Pass currentGrid

      if (cellularRules === 'conway') { // Conway's Game of Life rules
        if (currentGrid[y][x] === 1) { // If cell is alive
          if (neighbors < 2 || neighbors > 3) {
            newGrid[y][x] = 0; // Dies (underpopulation/overpopulation)
          } else {
            newGrid[y][x] = 1; // Survives (2-3 neighbors)
          }
        } else { // If cell is dead
          if (neighbors === 3) {
            newGrid[y][x] = 1; // Born (reproduction)
          } else {
            newGrid[y][x] = 0; // Stays dead
          }
        }
      } else if (cellularRules === 'maze') { // Maze generation rules (example)
        if (currentGrid[y][x] === 1) { // If cell is part of maze (alive)
          if (neighbors < 1 || neighbors > 5) newGrid[y][x] = 0; // Dies if too few/many neighbors
        } else { // If cell is empty space
          if (neighbors === 3) newGrid[y][x] = 1; // Becomes part of maze
        }
      } else if (cellularRules === 'coral') { // Coral growth simulation (example)
        if (currentGrid[y][x] === 1) { // If cell is coral
          if (neighbors < 4 || neighbors > 7) newGrid[y][x] = 0; // Dies (original had <4, let's try <4 or >7 for variety)
        } else { // If cell is empty water
          if (neighbors === 3 || neighbors === 6 || neighbors === 7) newGrid[y][x] = 1; // Grows coral (original had ===3, let's add more conditions)
        }
      }
      // Add other rule sets as needed
    }
  }
  return newGrid;
};

// Draw cellular automata
export const drawCellularAutomata = (ctx, cellularGrid, cellular3DGrid, width, height, is3D, editMode, cursor, generation, cellularRules) => {
  if (is3D) {
    // Ensure cellular3DGrid is passed to draw3DCellularAutomata
    draw3DCellularAutomata(ctx, cellular3DGrid, width, height, editMode, cursor);
    return;
  }

  if (!cellularGrid || !cellularGrid.length || !cellularGrid[0]) {
    // console.warn("drawCellularAutomata: cellularGrid is empty or invalid for 2D drawing.");
    return;
  }

  const cellWidth = width / cellularGrid[0].length;
  const cellHeight = height / cellularGrid.length;

  ctx.fillStyle = 'rgba(15, 23, 42, 1)'; // Background color (e.g., dark slate blue)
  ctx.fillRect(0, 0, width, height);

  cellularGrid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 1) {
        const age = Math.min(1, generation * 0.01); // Use generation for color variation
        let R, G, B;
        if (cellularRules === 'conway') {
          R = 16; G = 185; B = 129; // Teal
        } else if (cellularRules === 'maze') {
          R = 147; G = 51; B = 234; // Purple
        } else { // Default or 'coral'
          R = 251; G = 146; B = 60; // Orange
        }
        ctx.fillStyle = `rgba(${R}, ${G}, ${B}, ${0.7 + age * 0.3})`;

        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth - 0.5, cellHeight - 0.5); // -0.5 for grid line effect
      }
    });
  });

  if (editMode && cursor) { // editMode and cursor are passed as arguments
    const cursorX = cursor.x * cellWidth;
    const cursorY = cursor.y * cellHeight;

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'; // Cursor color (e.g., red)
    ctx.lineWidth = 2;
    ctx.strokeRect(cursorX, cursorY, cellWidth, cellHeight);

    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'; // Cursor fill
    ctx.fillRect(cursorX, cursorY, cellWidth, cellHeight);
  }

  // Optional: Draw grid lines if cells are large enough
  if (cellWidth > 8) {
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)'; // Grid line color (e.g., gray)
    ctx.lineWidth = 0.5;
    for (let xPos = 0; xPos <= cellularGrid[0].length; xPos++) {
      ctx.beginPath();
      ctx.moveTo(xPos * cellWidth, 0);
      ctx.lineTo(xPos * cellWidth, height);
      ctx.stroke();
    }
    for (let yPos = 0; yPos <= cellularGrid.length; yPos++) {
      ctx.beginPath();
      ctx.moveTo(0, yPos * cellHeight);
      ctx.lineTo(width, yPos * cellHeight);
      ctx.stroke();
    }
  }
};
