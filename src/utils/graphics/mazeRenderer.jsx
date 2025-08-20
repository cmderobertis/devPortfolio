// Maze Rendering Utilities
// Extracted from MazeStudio.jsx

import React, { useRef, useState, useEffect } from "react";

// 2D Canvas Maze Renderer Component
export function Maze2DCanvas({ 
  grid, 
  cellSize = 20, 
  padding = 10, 
  colors = {}, 
  interactive = true, 
  onCellClick, 
  path = [] 
}) {
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

  // Pan and zoom interaction
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