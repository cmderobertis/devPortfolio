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

  // Draw a single cell with minesweeper style
  const drawCell = useCallback((ctx, x, y, isAlive) => {
    const px = x * cellSize;
    const py = y * cellSize;

    // Draw the beveled cell background
    ctx.fillStyle = theme.dead;
    ctx.fillRect(px, py, cellSize, cellSize);

    // Light border (top and left)
    ctx.strokeStyle = theme.borderLight;
    ctx.beginPath();
    ctx.moveTo(px, py + cellSize);
    ctx.lineTo(px, py);
    ctx.lineTo(px + cellSize, py);
    ctx.stroke();

    // Dark border (bottom and right)
    ctx.strokeStyle = theme.borderDark;
    ctx.beginPath();
    ctx.moveTo(px + cellSize, py);
    ctx.lineTo(px + cellSize, py + cellSize);
    ctx.lineTo(px, py + cellSize);
    ctx.stroke();

    if (isAlive) {
      drawBomb(ctx, px, py);
    }
  }, [cellSize, theme]);

  // Draw bomb/living cell
  const drawBomb = useCallback((ctx, px, py) => {
    const centerX = px + cellSize / 2;
    const centerY = py + cellSize / 2;
    const radius = cellSize * 0.35;

    // Bomb body
    ctx.fillStyle = theme.live;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Bomb shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Fuse
    ctx.strokeStyle = theme.bombColor || theme.live;
    ctx.lineWidth = Math.max(1, cellSize * 0.1);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX + radius * 0.5, centerY - radius * 1.5);
    ctx.stroke();
    ctx.lineWidth = 1;
  }, [cellSize, theme]);

  // Draw the entire grid
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid || !grid.length || !numCellsX || !numCellsY) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas with background color
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all cells with bounds checking
    for (let x = 0; x < Math.min(numCellsX, grid.length); x++) {
      if (!grid[x]) continue;
      for (let y = 0; y < Math.min(numCellsY, grid[x].length); y++) {
        const isAlive = grid[x][y] === 1;
        drawCell(ctx, x, y, isAlive);
      }
    }
  }, [grid, numCellsX, numCellsY, theme, drawCell]);

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