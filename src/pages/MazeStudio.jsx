import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from '../design-system';
import "../styles/MazeStudio.css";
import InteractivePageWrapper from '../components/InteractivePageWrapper';
import '../components/InteractivePageWrapper.css';

// Import maze generation and pathfinding algorithms
import { generateDFS2D, generatePrims2D } from '../utils/algorithms/mazeGeneration';
import { solveBFS, solveAStar } from '../utils/algorithms/pathfinding';
import { Maze2DCanvas } from '../utils/graphics/mazeRenderer.jsx';

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
    <InteractivePageWrapper>
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
            <Button 
              variant="filled" 
              onClick={generate} 
              disabled={busy}
            >
              {busy ? "Generating..." : "Generate Maze"}
            </Button>
          </div>

          <div className="button-group">
            <Button 
              variant="outlined" 
              onClick={doSolve} 
              disabled={busy || !grid}
            >
              {busy ? "Solving..." : "Solve Maze"}
            </Button>
            <Button 
              variant="outlined" 
              onClick={clearPath} 
              disabled={!path.length}
            >
              Clear Path
            </Button>
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
    </InteractivePageWrapper>
  );
}