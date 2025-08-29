import React, { useRef, useEffect, useCallback } from 'react';

const GameCanvas = ({ 
  grid, 
  numCellsX, 
  numCellsY, 
  cellSize, 
  theme, 
  onCellClick,
  className = '',
  style = {}
}) => {
  const canvasRef = useRef(null);

  // Draw a single cell with simple flat style
  const drawCell = useCallback((ctx, x, y, isAlive) => {
    const px = x * cellSize;
    const py = y * cellSize;

    // Draw cell background
    if (isAlive) {
      // Live cell - use primary color
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--md-sys-color-primary').trim();
    } else {
      // Dead cell - use container background
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--md-sys-color-surface-container-low').trim();
    }
    
    ctx.fillRect(px, py, cellSize, cellSize);

    // Draw subtle grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--md-sys-color-outline-variant').trim();
    ctx.lineWidth = 0.5;
    ctx.strokeRect(px, py, cellSize, cellSize);
  }, [cellSize]);


  // Draw the entire grid
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid || !grid.length || !numCellsX || !numCellsY) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas with container background color
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--md-sys-color-surface-container-low').trim();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all cells with bounds checking
    for (let x = 0; x < Math.min(numCellsX, grid.length); x++) {
      if (!grid[x]) continue;
      for (let y = 0; y < Math.min(numCellsY, grid[x].length); y++) {
        const isAlive = grid[x][y] === 1;
        drawCell(ctx, x, y, isAlive);
      }
    }
  }, [grid, numCellsX, numCellsY, drawCell]);

  // Handle canvas click/touch
  const handleCanvasInteraction = useCallback((e) => {
    e.preventDefault();
    if (!onCellClick) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = Math.floor((clientX - rect.left) / cellSize);
    const y = Math.floor((clientY - rect.top) / cellSize);

    onCellClick(x, y);
  }, [cellSize, onCellClick]);

  // Update canvas size when dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = numCellsX * cellSize;
    canvas.height = numCellsY * cellSize;
  }, [numCellsX, numCellsY, cellSize]);

  // Redraw when grid or theme changes
  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        cursor: 'pointer',
        imageRendering: 'pixelated',
        ...style
      }}
      onClick={handleCanvasInteraction}
      onTouchStart={handleCanvasInteraction}
    />
  );
};

export default GameCanvas;