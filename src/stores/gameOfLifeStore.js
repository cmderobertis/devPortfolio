import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Game of Life specific store
const useGameOfLifeStore = create(
  subscribeWithSelector((set, get) => ({
    // Game of Life specific state
    numCellsX: 50,
    numCellsY: 30,
    cellSize: 10,
    grid: [],
    nextGrid: [], // Buffer for next generation calculation
    
    // Simulation control
    isRunning: false,
    generationsPerSecond: 3,
    currentGeneration: 0,
    
    // Visual settings
    animateTransitions: true,
    showGrid: true,
    theme: {
      bg: 'var(--md-sys-color-surface-container-low)',
      dead: 'var(--md-sys-color-surface-container-low)',
      live: 'var(--md-sys-color-primary)',
      grid: 'var(--md-sys-color-outline-variant)',
      borderLight: 'var(--md-sys-color-surface-container-high)',
      borderDark: 'var(--md-sys-color-outline-variant)',
    },
    
    // Performance tracking
    performance: {
      fps: 60,
      generationTime: 0,
      renderTime: 0,
      lastFrameTime: Date.now()
    },
    
    // Statistics
    statistics: {
      totalGenerations: 0,
      maxLiveCells: 0,
      currentLiveCells: 0,
      stabilityCounter: 0,
      lastGridHash: '',
      patterns: []
    },
    
    // Pattern recognition
    knownPatterns: [
      { name: 'Still Life - Block', pattern: [[1,1],[1,1]] },
      { name: 'Still Life - Beehive', pattern: [[0,1,1,0],[1,0,0,1],[0,1,1,0]] },
      { name: 'Oscillator - Blinker', pattern: [[1],[1],[1]] },
      { name: 'Oscillator - Toad', pattern: [[0,1,1,1],[1,1,1,0]] }
    ],
    
    // Computed properties
    get liveCells() {
      return get().grid.flat().filter(cell => cell === 1).length;
    },
    
    get density() {
      const state = get();
      const totalCells = state.numCellsX * state.numCellsY;
      return totalCells > 0 ? state.liveCells / totalCells : 0;
    },
    
    get isStable() {
      return get().statistics.stabilityCounter > 5;
    },
    
    get averageGenerationTime() {
      const history = get().performanceHistory || [];
      if (history.length === 0) return 0;
      const sum = history.reduce((acc, perf) => acc + (perf.generationTime || 0), 0);
      return sum / history.length;
    },
    
    // Actions
    initializeGrid: (width, height, cellSize) => set((state) => {
      const newNumCellsX = state.numCellsX || Math.floor(width / cellSize);
      const newNumCellsY = state.numCellsY || Math.floor(height / cellSize);
      const newCellSize = Math.max(1, Math.floor(width / newNumCellsX));
      
      const grid = Array.from({ length: newNumCellsX }, () => 
        Array(newNumCellsY).fill(0)
      );
      
      return {
        numCellsX: newNumCellsX,
        numCellsY: newNumCellsY,
        cellSize: newCellSize,
        grid,
        nextGrid: Array.from({ length: newNumCellsX }, () => 
          Array(newNumCellsY).fill(0)
        ),
        currentGeneration: 0,
        statistics: { ...state.statistics, currentLiveCells: 0 }
      };
    }),
    
    randomizeGrid: (density = 0.15) => set((state) => {
      const newGrid = Array.from({ length: state.numCellsX }, () =>
        Array.from({ length: state.numCellsY }, () => Math.random() < density ? 1 : 0)
      );
      
      const liveCells = newGrid.flat().filter(cell => cell === 1).length;
      
      return {
        grid: newGrid,
        currentGeneration: 0,
        statistics: {
          ...state.statistics,
          currentLiveCells: liveCells,
          maxLiveCells: Math.max(state.statistics.maxLiveCells, liveCells),
          stabilityCounter: 0,
          lastGridHash: ''
        }
      };
    }),
    
    toggleCell: (x, y) => set((state) => {
      if (x < 0 || x >= state.numCellsX || y < 0 || y >= state.numCellsY) {
        return state;
      }
      
      const newGrid = state.grid.map(row => [...row]);
      newGrid[x][y] = newGrid[x][y] ? 0 : 1;
      
      const liveCells = newGrid.flat().filter(cell => cell === 1).length;
      
      return {
        grid: newGrid,
        statistics: {
          ...state.statistics,
          currentLiveCells: liveCells,
          stabilityCounter: 0
        }
      };
    }),
    
    clearGrid: () => set((state) => ({
      grid: Array.from({ length: state.numCellsX }, () => 
        Array(state.numCellsY).fill(0)
      ),
      currentGeneration: 0,
      statistics: {
        ...state.statistics,
        currentLiveCells: 0,
        stabilityCounter: 0,
        lastGridHash: ''
      }
    })),
    
    // Conway's Game of Life rules implementation
    countNeighbors: (x, y, grid) => {
      const state = get();
      let count = 0;
      
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          
          // Wrap around edges (toroidal topology)
          const col = (x + i + state.numCellsX) % state.numCellsX;
          const row = (y + j + state.numCellsY) % state.numCellsY;
          
          count += grid[col][row];
        }
      }
      
      return count;
    },
    
    computeNextGeneration: () => set((state) => {
      const startTime = performance.now();
      
      // Use the pre-allocated nextGrid buffer
      const nextGrid = state.nextGrid;
      
      for (let x = 0; x < state.numCellsX; x++) {
        for (let y = 0; y < state.numCellsY; y++) {
          const neighbors = get().countNeighbors(x, y, state.grid);
          const isAlive = state.grid[x][y] === 1;
          
          // Conway's Game of Life rules
          if (isAlive) {
            // Live cell survives with 2 or 3 neighbors
            nextGrid[x][y] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
          } else {
            // Dead cell becomes alive with exactly 3 neighbors
            nextGrid[x][y] = neighbors === 3 ? 1 : 0;
          }
        }
      }
      
      const generationTime = performance.now() - startTime;
      const liveCells = nextGrid.flat().filter(cell => cell === 1).length;
      
      // Create grid hash for stability detection
      const gridHash = nextGrid.flat().join('');
      const isStable = gridHash === state.statistics.lastGridHash;
      
      // Swap grids (reuse memory)
      const oldGrid = state.grid;
      
      return {
        grid: nextGrid,
        nextGrid: oldGrid, // Reuse the old grid as next buffer
        currentGeneration: state.currentGeneration + 1,
        performance: {
          ...state.performance,
          generationTime,
          lastFrameTime: Date.now()
        },
        statistics: {
          ...state.statistics,
          totalGenerations: state.statistics.totalGenerations + 1,
          currentLiveCells: liveCells,
          maxLiveCells: Math.max(state.statistics.maxLiveCells, liveCells),
          stabilityCounter: isStable ? state.statistics.stabilityCounter + 1 : 0,
          lastGridHash: gridHash
        }
      };
    }),
    
    // Control actions
    toggleSimulation: () => set((state) => ({ isRunning: !state.isRunning })),
    startSimulation: () => set({ isRunning: true }),
    stopSimulation: () => set({ isRunning: false }),
    
    setSpeed: (generationsPerSecond) => set({ generationsPerSecond }),
    setAnimateTransitions: (animate) => set({ animateTransitions: animate }),
    setShowGrid: (showGrid) => set({ showGrid }),
    
    // Pattern loading
    loadPattern: (pattern, startX = 0, startY = 0) => set((state) => {
      const newGrid = state.grid.map(row => [...row]);
      
      for (let i = 0; i < pattern.length; i++) {
        for (let j = 0; j < pattern[i].length; j++) {
          const x = startX + j;
          const y = startY + i;
          
          if (x >= 0 && x < state.numCellsX && y >= 0 && y < state.numCellsY) {
            newGrid[x][y] = pattern[i][j];
          }
        }
      }
      
      const liveCells = newGrid.flat().filter(cell => cell === 1).length;
      
      return {
        grid: newGrid,
        statistics: {
          ...state.statistics,
          currentLiveCells: liveCells,
          stabilityCounter: 0
        }
      };
    }),
    
    // Performance monitoring
    updatePerformance: (perfUpdate) => set((state) => ({
      performance: { ...state.performance, ...perfUpdate }
    })),
    
    // Export/Import functionality
    exportState: () => {
      const state = get();
      return {
        grid: state.grid,
        generation: state.currentGeneration,
        config: {
          numCellsX: state.numCellsX,
          numCellsY: state.numCellsY,
          cellSize: state.cellSize
        },
        statistics: state.statistics,
        timestamp: Date.now()
      };
    },
    
    importState: (stateData) => set((state) => ({
      grid: stateData.grid || state.grid,
      currentGeneration: stateData.generation || 0,
      numCellsX: stateData.config?.numCellsX || state.numCellsX,
      numCellsY: stateData.config?.numCellsY || state.numCellsY,
      cellSize: stateData.config?.cellSize || state.cellSize,
      statistics: stateData.statistics || state.statistics,
      isRunning: false
    }))
  }))
);

// Performance monitoring subscription
useGameOfLifeStore.subscribe(
  (state) => state.performance.generationTime,
  (generationTime) => {
    if (generationTime > 50) { // Alert if generation takes more than 50ms
      console.warn(`Slow generation detected: ${generationTime.toFixed(2)}ms`);
    }
  }
);

// Stability detection subscription
useGameOfLifeStore.subscribe(
  (state) => state.statistics.stabilityCounter,
  (stabilityCounter) => {
    if (stabilityCounter === 10) {
      console.info('Stable pattern detected - simulation has reached equilibrium');
    }
  }
);

export default useGameOfLifeStore;