import React, { useRef, useEffect, useCallback, useState } from 'react';
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';
import useScreenReader from '../hooks/useScreenReader';
import { generateAriaLabel, focusManagement } from '../utils/accessibility';

const GameCanvas = ({ 
  grid, 
  numCellsX, 
  numCellsY, 
  cellSize, 
  theme, 
  onCellClick,
  className = '',
  style = {},
  isPlaying = false,
  generation = 0
}) => {
  const canvasRef = useRef(null);
  const [liveCells, setLiveCells] = useState(0);
  const { announceGridPosition, announceStatus } = useScreenReader();

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


  // Draw focus indicator for keyboard navigation
  const drawFocusIndicator = useCallback((ctx, x, y) => {
    const px = x * cellSize;
    const py = y * cellSize;
    
    // Draw focus outline
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--md-sys-color-primary').trim();
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(px + 2, py + 2, cellSize - 4, cellSize - 4);
    ctx.setLineDash([]);
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

    let liveCellCount = 0;

    // Draw all cells with bounds checking
    for (let x = 0; x < Math.min(numCellsX, grid.length); x++) {
      if (!grid[x]) continue;
      for (let y = 0; y < Math.min(numCellsY, grid[x].length); y++) {
        const isAlive = grid[x][y] === 1;
        if (isAlive) liveCellCount++;
        drawCell(ctx, x, y, isAlive);
      }
    }

    // Draw focus indicator if keyboard navigation is active
    if (isKeyboardActive && focusPosition) {
      drawFocusIndicator(ctx, focusPosition.x, focusPosition.y);
    }

    // Update live cell count
    setLiveCells(liveCellCount);
  }, [grid, numCellsX, numCellsY, drawCell, drawFocusIndicator]);

  // Keyboard navigation setup
  const {
    focusPosition,
    isKeyboardActive,
    containerRef
  } = useKeyboardNavigation({
    gridWidth: numCellsX,
    gridHeight: numCellsY,
    initialPosition: { x: Math.floor(numCellsX / 2), y: Math.floor(numCellsY / 2) },
    onPositionChange: (position) => {
      if (grid && grid[position.x] && grid[position.x][position.y] !== undefined) {
        const isAlive = grid[position.x][position.y] === 1;
        const cellInfo = isAlive ? 'alive cell' : 'dead cell';
        announceGridPosition(position.x, position.y, cellInfo);
      }
      // Redraw grid to show focus indicator
      drawGrid();
    },
    onSelect: (position) => {
      if (onCellClick && position.x < numCellsX && position.y < numCellsY) {
        onCellClick(position.x, position.y);
        const isAlive = grid && grid[position.x] ? grid[position.x][position.y] === 1 : false;
        const action = isAlive ? 'deactivated' : 'activated';
        announceStatus(`Cell ${action}`);
      }
    }
  });

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

  // Announce generation changes and statistics
  useEffect(() => {
    if (generation > 0) {
      announceStatus(`Generation ${generation}, ${liveCells} live cells`);
    }
  }, [generation, liveCells, announceStatus]);

  // Generate comprehensive ARIA label
  const ariaLabel = generateAriaLabel.interactiveCanvas(
    'Conway\'s Game of Life grid',
    `Generation ${generation}, ${liveCells} live cells, ${isPlaying ? 'playing' : 'paused'}`,
    'Use arrow keys to navigate, Enter or Space to toggle cells, Escape to exit grid navigation'
  );

  return (
    <div
      ref={containerRef}
      className="game-canvas-wrapper"
      style={{ display: 'inline-block', position: 'relative' }}
    >
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
        role="img"
        aria-label={ariaLabel}
        aria-describedby="game-canvas-instructions"
        tabIndex={0}
      />
      
      {/* Hidden instructions for screen readers */}
      <div
        id="game-canvas-instructions"
        className="sr-only"
        aria-hidden="true"
      >
        Interactive Game of Life grid. Use arrow keys to navigate between cells.
        Press Enter or Space to toggle a cell between alive and dead.
        Press Escape to exit grid navigation mode.
        Current grid size: {numCellsX} by {numCellsY} cells.
      </div>
      
      {/* Live region for dynamic announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="game-status"
      >
        {/* Screen reader announcements will be inserted here */}
      </div>
    </div>
  );
};

export default GameCanvas;