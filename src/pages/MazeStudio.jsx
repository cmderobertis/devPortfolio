import React, { useRef, useState, useEffect, useCallback } from "react";
import "../styles/MazeStudio.css";

// ------------------------- Maze Algorithms -------------------------

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

// Depth-first recursive backtracker for 2D
function generateDFS2D(cols, rows, rand = Math.random) {
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

// Prim's algorithm for 2D
function generatePrims2D(cols, rows, rand = Math.random) {
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

// BFS Solver
function solveBFS(grid, start, goal, cols, rows) {
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

// A* Solver
function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function solveAStar(grid, start, goal, cols, rows) {
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

// ------------------------- 2D Canvas Renderer -------------------------

function Maze2DCanvas({ grid, cellSize = 20, padding = 10, colors = {}, interactive = true, onCellClick, path = [] }) {
  const canvasRef = useRef();
  const [transform, setTransform] = useState({ tx: 0, ty: 0, scale: 1 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid) return;
    const ctx = canvas.getContext("2d");
    const rows = grid.length;
    const cols = grid[0].length;
    const w = cols * cellSize + padding * 2;
    const h = rows * cellSize + padding * 2;
    canvas.width = Math.floor(w * devicePixelRatio);
    canvas.height = Math.floor(h * devicePixelRatio);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(
      devicePixelRatio * transform.scale, 0, 0, 
      devicePixelRatio * transform.scale, 
      devicePixelRatio * transform.tx, 
      devicePixelRatio * transform.ty
    );

    ctx.clearRect(-padding, -padding, w, h);

    // Background
    ctx.fillStyle = colors.bg ?? "#1e293b";
    ctx.fillRect(-padding, -padding, w, h);

    // Draw path if available
    if (path.length > 0) {
      ctx.fillStyle = colors.path ?? "#ef4444";
      for (const cell of path) {
        const px = padding + cell.x * cellSize;
        const py = padding + cell.y * cellSize;
        ctx.fillRect(px + cellSize * 0.25, py + cellSize * 0.25, cellSize * 0.5, cellSize * 0.5);
      }
    }

    // Draw walls
    ctx.strokeStyle = colors.wall ?? "#e2e8f0";
    ctx.lineWidth = Math.max(1, 2 / transform.scale);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const c = grid[y][x];
        const px = padding + x * cellSize;
        const py = padding + y * cellSize;
        
        ctx.beginPath();
        if (c.walls.n) {
          ctx.moveTo(px, py);
          ctx.lineTo(px + cellSize, py);
        }
        if (c.walls.s) {
          ctx.moveTo(px, py + cellSize);
          ctx.lineTo(px + cellSize, py + cellSize);
        }
        if (c.walls.w) {
          ctx.moveTo(px, py);
          ctx.lineTo(px, py + cellSize);
        }
        if (c.walls.e) {
          ctx.moveTo(px + cellSize, py);
          ctx.lineTo(px + cellSize, py + cellSize);
        }
        ctx.stroke();
      }
    }

    // Start and end markers
    const startPx = padding + 0 * cellSize;
    const startPy = padding + 0 * cellSize;
    const endPx = padding + (cols - 1) * cellSize;
    const endPy = padding + (rows - 1) * cellSize;
    
    ctx.fillStyle = colors.start ?? "#22c55e";
    ctx.fillRect(startPx + 2, startPy + 2, cellSize - 4, cellSize - 4);
    
    ctx.fillStyle = colors.end ?? "#ef4444";
    ctx.fillRect(endPx + 2, endPy + 2, cellSize - 4, cellSize - 4);
  }, [grid, cellSize, padding, transform, colors, path]);

  // Pan interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !interactive) return;

    const onDown = (e) => {
      dragging.current = true;
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      last.current = { x: clientX, y: clientY };
    };

    const onMove = (e) => {
      if (!dragging.current) return;
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      const dx = (clientX - last.current.x) / transform.scale;
      const dy = (clientY - last.current.y) / transform.scale;
      last.current = { x: clientX, y: clientY };
      setTransform((t) => ({ ...t, tx: t.tx + dx, ty: t.ty + dy }));
    };

    const onUp = () => {
      dragging.current = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(5, transform.scale * scaleFactor));
      
      setTransform(t => ({
        ...t,
        scale: newScale,
        tx: centerX - (centerX - t.tx) * (newScale / t.scale),
        ty: centerY - (centerY - t.ty) * (newScale / t.scale)
      }));
    };

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("touchstart", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [grid, interactive, transform, cellSize, onCellClick]);

  return (
    <div className="maze-canvas-container">
      <canvas ref={canvasRef} className="maze-canvas" />
    </div>
  );
}

// ------------------------- Main App Component -------------------------

export default function MazeStudio() {
  // UI state
  const [cols, setCols] = useState(25);
  const [rows, setRows] = useState(20);
  const [algorithm, setAlgorithm] = useState("dfs");
  const [solver, setSolver] = useState("bfs");
  const [cellSize, setCellSize] = useState(20);
  const [colors, setColors] = useState({
    bg: "#1e293b",
    wall: "#e2e8f0",
    path: "#ef4444",
    start: "#22c55e",
    end: "#ef4444",
  });
  const [showPath, setShowPath] = useState(true);

  // Data
  const [grid, setGrid] = useState(null);
  const [path, setPath] = useState([]);
  const [busy, setBusy] = useState(false);

  const generate = useCallback(() => {
    setBusy(true);
    setPath([]);
    setTimeout(() => {
      const newGrid = algorithm === "dfs" ? generateDFS2D(cols, rows) : generatePrims2D(cols, rows);
      setGrid(newGrid);
      setBusy(false);
    }, 10);
  }, [cols, rows, algorithm]);

  useEffect(() => {
    generate();
  }, [generate]);

  const doSolve = useCallback(() => {
    if (!grid) return;
    setBusy(true);
    setTimeout(() => {
      const start = grid[0][0];
      const goal = grid[rows - 1][cols - 1];
      const sol = solver === "bfs" ? 
        solveBFS(grid, start, goal, cols, rows) : 
        solveAStar(grid, start, goal, cols, rows);
      setPath(sol);
      setBusy(false);
    }, 10);
  }, [grid, solver, cols, rows]);

  const clearPath = useCallback(() => {
    setPath([]);
  }, []);

  return (
    <div className="maze-studio">
      <aside className="maze-sidebar">
        <h2 className="maze-title">Maze Studio</h2>
        <div className="maze-controls">
          <label className="control-group">
            Columns: {cols}
            <input 
              type="range" 
              min={5} 
              max={60} 
              value={cols} 
              onChange={(e) => setCols(Number(e.target.value))}
              className="slider" 
            />
          </label>
          
          <label className="control-group">
            Rows: {rows}
            <input 
              type="range" 
              min={5} 
              max={45} 
              value={rows} 
              onChange={(e) => setRows(Number(e.target.value))}
              className="slider"
            />
          </label>
          
          <label className="control-group">
            Cell Size: {cellSize}px
            <input 
              type="range" 
              min={8} 
              max={40} 
              value={cellSize} 
              onChange={(e) => setCellSize(Number(e.target.value))}
              className="slider"
            />
          </label>

          <div className="button-group">
            <select 
              value={algorithm} 
              onChange={(e) => setAlgorithm(e.target.value)} 
              className="select-input"
            >
              <option value="dfs">Depth-First Search</option>
              <option value="prims">Prim's Algorithm</option>
            </select>
          </div>

          <div className="button-group">
            <select 
              value={solver} 
              onChange={(e) => setSolver(e.target.value)} 
              className="select-input"
            >
              <option value="bfs">BFS Solver</option>
              <option value="astar">A* Solver</option>
            </select>
          </div>

          <div className="button-group">
            <button 
              className="btn btn-primary" 
              onClick={generate} 
              disabled={busy}
            >
              {busy ? "Generating..." : "Generate Maze"}
            </button>
          </div>

          <div className="button-group">
            <button 
              className="btn btn-secondary" 
              onClick={doSolve} 
              disabled={busy || !grid}
            >
              {busy ? "Solving..." : "Solve Maze"}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={clearPath} 
              disabled={!path.length}
            >
              Clear Path
            </button>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={showPath} 
                onChange={(e) => setShowPath(e.target.checked)} 
              />
              Show solution path
            </label>
          </div>

          <div className="color-controls">
            <label className="control-group">
              Colors:
              <div className="color-picker-group">
                <div className="color-picker">
                  <label>Background</label>
                  <input 
                    type="color" 
                    value={colors.bg} 
                    onChange={(e) => setColors(c => ({ ...c, bg: e.target.value }))} 
                  />
                </div>
                <div className="color-picker">
                  <label>Walls</label>
                  <input 
                    type="color" 
                    value={colors.wall} 
                    onChange={(e) => setColors(c => ({ ...c, wall: e.target.value }))} 
                  />
                </div>
                <div className="color-picker">
                  <label>Path</label>
                  <input 
                    type="color" 
                    value={colors.path} 
                    onChange={(e) => setColors(c => ({ ...c, path: e.target.value }))} 
                  />
                </div>
              </div>
            </label>
          </div>

          <div className="help-text">
            <strong>Controls:</strong><br />
            • Drag to pan the maze<br />
            • Scroll/pinch to zoom<br />
            • Green square: Start<br />
            • Red square: Goal<br />
            • Red path: Solution
          </div>
        </div>
      </aside>

      <main className="maze-main">
        <div className="maze-viewport">
          <div className="maze-canvas-wrapper">
            <Maze2DCanvas 
              grid={grid} 
              cellSize={cellSize} 
              colors={colors} 
              interactive 
              path={showPath ? path : []}
            />
          </div>

          <div className="maze-status">
            <div>
              Grid: {cols} × {rows} | 
              Algorithm: {algorithm.toUpperCase()} | 
              Solver: {solver.toUpperCase()}
            </div>
            <div>
              {path.length > 0 && `Solution: ${path.length} steps`}
              {busy && " | Working..."}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}