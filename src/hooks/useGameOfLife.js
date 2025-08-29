import { useState, useCallback, useRef, useEffect } from 'react';
import { createGameOfLifeAnimationManager, ANIMATION_PRESETS } from '../utils/animations/index.js';

// Game of Life theme using Material Design 3 color tokens
export const theme = {
  bg: 'var(--md-sys-color-surface-container-low)',
  dead: 'var(--md-sys-color-surface-container-low)',
  live: 'var(--md-sys-color-primary)',
  grid: 'var(--md-sys-color-outline-variant)',
  borderLight: 'var(--md-sys-color-surface-container-high)',
  borderDark: 'var(--md-sys-color-outline-variant)',
};

const useGameOfLife = (initialCellsX = 20) => {
  const [numCellsX] = useState(initialCellsX);
  const [cellSize, setCellSize] = useState(10);
  const [numCellsY, setNumCellsY] = useState(30);
  const [grid, setGrid] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generationsPerSecond, setGenerationsPerSecond] = useState(3);
  const [currentTheme] = useState(theme);
  const [animateTransitions, setAnimateTransitions] = useState(true);
  
  const lastUpdateTimeRef = useRef(0);
  const animationIdRef = useRef(null);

  // Create a new grid
  const createGrid = useCallback((cols, rows) => {
    if (rows <= 0 || !isFinite(rows)) {
      console.error("Invalid number of rows:", rows);
      return [];
    }
    return new Array(cols).fill(null).map(() => new Array(rows).fill(0));
  }, []);

  // Initialize grids
  const initializeGrids = useCallback((canvasWidth, canvasHeight) => {
    const newCellSize = Math.max(1, Math.floor(canvasWidth / numCellsX));
    const newNumCellsY = Math.max(1, Math.floor(canvasHeight / newCellSize));
    
    setCellSize(newCellSize);
    setNumCellsY(newNumCellsY);
    
    const newGrid = createGrid(numCellsX, newNumCellsY);
    setGrid(newGrid);
    
    return { cellSize: newCellSize, numCellsY: newNumCellsY };
  }, [numCellsX, createGrid]);

  // Randomize the grid with live cells
  const randomizeGrid = useCallback(() => {
    const newGrid = createGrid(numCellsX, numCellsY);
    for (let x = 0; x < numCellsX; x++) {
      for (let y = 0; y < numCellsY; y++) {
        // 15% chance for live cells - good balance for interesting patterns
        newGrid[x][y] = Math.random() > 0.85 ? 1 : 0;
      }
    }
    setGrid(newGrid);
  }, [numCellsX, numCellsY, createGrid]);

  // Count neighbors for a cell
  const countNeighbors = useCallback((x, y, currentGrid) => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const col = (x + i + numCellsX) % numCellsX;
        const row = (y + j + numCellsY) % numCellsY;
        count += currentGrid[col][row];
      }
    }
    return count;
  }, [numCellsX, numCellsY]);

  // Compute next generation using functional update to avoid stale closure
  const computeNextGeneration = useCallback(() => {
    setGrid(currentGrid => {
      if (!currentGrid.length) return currentGrid;
      
      const newGrid = createGrid(numCellsX, numCellsY);
      
      for (let x = 0; x < numCellsX; x++) {
        for (let y = 0; y < numCellsY; y++) {
          const neighbors = countNeighbors(x, y, currentGrid);
          const isAlive = currentGrid[x][y] === 1;

          // Conway's Game of Life rules:
          // 1. Any live cell with fewer than two live neighbors dies (underpopulation)
          // 2. Any live cell with two or three live neighbors lives on to the next generation
          // 3. Any live cell with more than three live neighbors dies (overpopulation)
          // 4. Any dead cell with exactly three live neighbors becomes a live cell (reproduction)
          
          if (isAlive) {
            // Live cell rules
            if (neighbors < 2) {
              newGrid[x][y] = 0; // Dies from underpopulation
            } else if (neighbors === 2 || neighbors === 3) {
              newGrid[x][y] = 1; // Survives
            } else {
              newGrid[x][y] = 0; // Dies from overpopulation
            }
          } else {
            // Dead cell rules
            if (neighbors === 3) {
              newGrid[x][y] = 1; // Becomes alive through reproduction
            } else {
              newGrid[x][y] = 0; // Stays dead
            }
          }
        }
      }

      return newGrid;
    });
  }, [numCellsX, numCellsY, countNeighbors, createGrid]);

  // Toggle cell state
  const toggleCell = useCallback((x, y) => {
    if (x >= 0 && x < numCellsX && y >= 0 && y < numCellsY) {
      setGrid(prev => {
        const newGrid = prev.map(col => [...col]);
        newGrid[x][y] = newGrid[x][y] ? 0 : 1;
        return newGrid;
      });
    }
  }, [numCellsX, numCellsY]);

  // Game loop
  const gameLoop = useCallback((timestamp) => {
    if (!isPlaying) {
      // Clear animation frame when not playing
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      return;
    }

    const elapsed = timestamp - lastUpdateTimeRef.current;
    const interval = 1000 / generationsPerSecond;

    if (elapsed > interval) {
      lastUpdateTimeRef.current = timestamp - (elapsed % interval);
      computeNextGeneration();
    }

    // Only request next frame if still playing
    if (isPlaying) {
      animationIdRef.current = requestAnimationFrame(gameLoop);
    }
  }, [isPlaying, generationsPerSecond, computeNextGeneration]);

  // Start/stop the game loop
  const startGameLoop = useCallback(() => {
    if (!animationIdRef.current && isPlaying) {
      lastUpdateTimeRef.current = performance.now();
      animationIdRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameLoop, isPlaying]);

  const stopGameLoop = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
  }, []);

  // Control functions
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Start/stop game loop based on isPlaying state
  useEffect(() => {
    if (isPlaying) {
      lastUpdateTimeRef.current = performance.now();
      startGameLoop();
    } else {
      stopGameLoop();
    }
    
    // Cleanup function to ensure no hanging animation frames
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, [isPlaying, startGameLoop, stopGameLoop]);

  const resetGrid = useCallback(() => {
    setIsPlaying(false); // Pause before reset
    randomizeGrid();
  }, [randomizeGrid]);

  const setSpeed = useCallback((speed) => {
    setGenerationsPerSecond(speed);
  }, []);

  const setAnimate = useCallback((animate) => {
    setAnimateTransitions(animate);
  }, []);



  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopGameLoop();
    };
  }, [stopGameLoop]);

  return {
    // State
    grid,
    numCellsX,
    numCellsY,
    cellSize,
    isPlaying,
    generationsPerSecond,
    currentTheme,
    animateTransitions,
    
    // Actions
    initializeGrids,
    randomizeGrid,
    toggleCell,
    togglePlayPause,
    resetGrid,
    setSpeed,
    setAnimate,
    startGameLoop,
    stopGameLoop
  };
};

export default useGameOfLife;