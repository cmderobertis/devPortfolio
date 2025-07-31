import { useState, useCallback, useRef, useEffect } from 'react';

// Game of Life themes
export const themes = {
  minesweeper: {
    bg: '#c0c0c0',
    dead: '#c0c0c0',
    live: '#000000',
    grid: '#808080',
    borderLight: '#ffffff',
    borderDark: '#808080',
  },
  aperture: {
    bg: '#e0e0e0',
    dead: '#ffffff',
    live: '#ff6f00',
    grid: '#cccccc',
    borderLight: '#f0f0f0',
    borderDark: '#a0a0a0',
    bombColor: '#0077c2'
  },
  lego: {
    bg: '#a0a0a0',
    dead: '#d3d3d3',
    live: '#ffde00',
    grid: '#606060',
    borderLight: '#f0f0f0',
    borderDark: '#808080',
    bombColor: '#d9000d'
  },
  pixel: {
    bg: '#554862',
    dead: '#7A6A83',
    live: '#F7A4A4',
    grid: '#3E3546',
    borderLight: '#9D8DA9',
    borderDark: '#3E3546',
    bombColor: '#FFF8BC'
  },
  neon: {
    bg: '#0a011a',
    dead: '#1a0a3a',
    live: '#ff00ff',
    grid: '#3a1a5a',
    borderLight: '#5a3a7a',
    borderDark: '#100525',
    bombColor: '#00ffff'
  }
};

const useGameOfLife = (initialCellsX = 50) => {
  const [numCellsX] = useState(initialCellsX);
  const [cellSize, setCellSize] = useState(10);
  const [numCellsY, setNumCellsY] = useState(30);
  const [grid, setGrid] = useState([]);
  const [nextGrid, setNextGrid] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [generationsPerSecond, setGenerationsPerSecond] = useState(10);
  const [currentTheme, setCurrentTheme] = useState(themes.minesweeper);
  
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
    const newNextGrid = createGrid(numCellsX, newNumCellsY);
    
    setGrid(newGrid);
    setNextGrid(newNextGrid);
    
    return { cellSize: newCellSize, numCellsY: newNumCellsY };
  }, [numCellsX, createGrid]);

  // Randomize the grid
  const randomizeGrid = useCallback(() => {
    const newGrid = createGrid(numCellsX, numCellsY);
    for (let x = 0; x < numCellsX; x++) {
      for (let y = 0; y < numCellsY; y++) {
        newGrid[x][y] = Math.random() > 0.75 ? 1 : 0;
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

  // Compute next generation
  const computeNextGeneration = useCallback(() => {
    if (!grid.length || !nextGrid.length) return;
    
    const newNextGrid = createGrid(numCellsX, numCellsY);
    
    for (let x = 0; x < numCellsX; x++) {
      for (let y = 0; y < numCellsY; y++) {
        const neighbors = countNeighbors(x, y, grid);
        const isAlive = grid[x][y] === 1;

        if (isAlive && (neighbors < 2 || neighbors > 3)) {
          newNextGrid[x][y] = 0; // Dies
        } else if (!isAlive && neighbors === 3) {
          newNextGrid[x][y] = 1; // Becomes alive
        } else {
          newNextGrid[x][y] = grid[x][y]; // Stays the same
        }
      }
    }

    // Swap grids
    setGrid(newNextGrid);
    setNextGrid(grid);
  }, [grid, nextGrid, numCellsX, numCellsY, countNeighbors, createGrid]);

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
    animationIdRef.current = requestAnimationFrame(gameLoop);

    if (!isPlaying) return;

    const elapsed = timestamp - lastUpdateTimeRef.current;
    const interval = 1000 / generationsPerSecond;

    if (elapsed > interval) {
      lastUpdateTimeRef.current = timestamp - (elapsed % interval);
      computeNextGeneration();
    }
  }, [isPlaying, generationsPerSecond, computeNextGeneration]);

  // Start/stop the game loop
  const startGameLoop = useCallback(() => {
    if (!animationIdRef.current) {
      animationIdRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameLoop]);

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

  const resetGrid = useCallback(() => {
    randomizeGrid();
  }, [randomizeGrid]);

  const setSpeed = useCallback((speed) => {
    setGenerationsPerSecond(speed);
  }, []);

  const setTheme = useCallback((themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themes[themeName]);
    }
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
    
    // Actions
    initializeGrids,
    randomizeGrid,
    toggleCell,
    togglePlayPause,
    resetGrid,
    setSpeed,
    setTheme,
    startGameLoop,
    stopGameLoop,
    
    // Themes
    themes
  };
};

export default useGameOfLife;