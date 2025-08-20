// Pathfinding Algorithms
// Extracted from MazeStudio.jsx

// BFS (Breadth-First Search) pathfinding algorithm
export function solveBFS(grid, start, goal, cols, rows) {
  const q = [start];
  const seen = new Set();
  const parent = new Map();
  seen.add(`${start.x},${start.y}`);
  while (q.length) {
    const c = q.shift();
    if (c.x === goal.x && c.y === goal.y) {
      const path = [];
      let cur = c;
      while (cur) {
        path.push(cur);
        cur = parent.get(`${cur.x},${cur.y}`);
      }
      return path.reverse();
    }
    const neighbors = [];
    if (!c.walls.s && c.y < rows - 1) neighbors.push({ x: c.x, y: c.y + 1 });
    if (!c.walls.n && c.y > 0) neighbors.push({ x: c.x, y: c.y - 1 });
    if (!c.walls.e && c.x < cols - 1) neighbors.push({ x: c.x + 1, y: c.y });
    if (!c.walls.w && c.x > 0) neighbors.push({ x: c.x - 1, y: c.y });

    for (const n of neighbors) {
      const key = `${n.x},${n.y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      parent.set(key, c);
      q.push(grid[n.y][n.x]);
    }
  }
  return [];
}

// Heuristic function for A* algorithm
function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// A* pathfinding algorithm
export function solveAStar(grid, start, goal, cols, rows) {
  const open = new Set([`${start.x},${start.y}`]);
  const g = new Map();
  const f = new Map();
  const parent = new Map();
  const startKey = `${start.x},${start.y}`;
  const goalKey = `${goal.x},${goal.y}`;
  g.set(startKey, 0);
  f.set(startKey, heuristic(start, goal));

  while (open.size) {
    let currentKey = null;
    let bestF = Infinity;
    for (const k of open) {
      const fv = f.get(k) ?? Infinity;
      if (fv < bestF) {
        bestF = fv;
        currentKey = k;
      }
    }
    open.delete(currentKey);
    const [cx, cy] = currentKey.split(",").map(Number);
    const c = grid[cy][cx];
    if (currentKey === goalKey) {
      const path = [];
      let cur = c;
      while (cur) {
        path.push(cur);
        cur = parent.get(`${cur.x},${cur.y}`);
      }
      return path.reverse();
    }

    const neighbors = [];
    if (!c.walls.s && c.y < rows - 1) neighbors.push(grid[c.y + 1][c.x]);
    if (!c.walls.n && c.y > 0) neighbors.push(grid[c.y - 1][c.x]);
    if (!c.walls.e && c.x < cols - 1) neighbors.push(grid[c.y][c.x + 1]);
    if (!c.walls.w && c.x > 0) neighbors.push(grid[c.y][c.x - 1]);

    for (const n of neighbors) {
      const nk = `${n.x},${n.y}`;
      const tentative = (g.get(currentKey) ?? Infinity) + 1;
      if (tentative < (g.get(nk) ?? Infinity)) {
        parent.set(nk, c);
        g.set(nk, tentative);
        f.set(nk, tentative + heuristic(n, goal));
        open.add(nk);
      }
    }
  }
  return [];
}