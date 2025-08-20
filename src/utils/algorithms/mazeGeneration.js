// Maze Generation Algorithms
// Extracted from MazeStudio.jsx

// Helper function to remove walls between two adjacent cells
function removeWalls2D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  if (dx === 1) {
    a.walls.w = false;
    b.walls.e = false;
  } else if (dx === -1) {
    a.walls.e = false;
    b.walls.w = false;
  }
  if (dy === 1) {
    a.walls.n = false;
    b.walls.s = false;
  } else if (dy === -1) {
    a.walls.s = false;
    b.walls.n = false;
  }
}

// Depth-first recursive backtracker algorithm for 2D maze generation
export function generateDFS2D(cols, rows, rand = Math.random) {
  const grid = new Array(rows);
  for (let y = 0; y < rows; y++) {
    grid[y] = new Array(cols);
    for (let x = 0; x < cols; x++) {
      grid[y][x] = { x, y, walls: { n: true, s: true, e: true, w: true }, visited: false };
    }
  }

  const stack = [];
  const start = grid[0][0];
  start.visited = true;
  stack.push(start);
  while (stack.length) {
    const current = stack[stack.length - 1];
    const nbs = [];
    const { x, y } = current;
    if (y > 0 && !grid[y - 1][x].visited) nbs.push(grid[y - 1][x]);
    if (y < rows - 1 && !grid[y + 1][x].visited) nbs.push(grid[y + 1][x]);
    if (x > 0 && !grid[y][x - 1].visited) nbs.push(grid[y][x - 1]);
    if (x < cols - 1 && !grid[y][x + 1].visited) nbs.push(grid[y][x + 1]);

    if (nbs.length) {
      const next = nbs[Math.floor(rand() * nbs.length)];
      removeWalls2D(current, next);
      next.visited = true;
      stack.push(next);
    } else {
      stack.pop();
    }
  }
  return grid;
}

// Prim's algorithm for 2D maze generation
export function generatePrims2D(cols, rows, rand = Math.random) {
  const grid = new Array(rows);
  for (let y = 0; y < rows; y++) {
    grid[y] = new Array(cols);
    for (let x = 0; x < cols; x++) {
      grid[y][x] = { x, y, walls: { n: true, s: true, e: true, w: true }, inMaze: false };
    }
  }
  const walls = [];
  const start = grid[0][0];
  start.inMaze = true;
  const pushWalls = (cell) => {
    const { x, y } = cell;
    if (y > 0) walls.push([cell, grid[y - 1][x]]);
    if (y < rows - 1) walls.push([cell, grid[y + 1][x]]);
    if (x > 0) walls.push([cell, grid[y][x - 1]]);
    if (x < cols - 1) walls.push([cell, grid[y][x + 1]]);
  };
  pushWalls(start);
  while (walls.length) {
    const i = Math.floor(rand() * walls.length);
    const [a, b] = walls.splice(i, 1)[0];
    if (!b.inMaze) {
      removeWalls2D(a, b);
      b.inMaze = true;
      pushWalls(b);
    }
  }
  return grid;
}