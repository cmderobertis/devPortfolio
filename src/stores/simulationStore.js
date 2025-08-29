import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Performance metrics interface
const initialPerformanceMetrics = {
  fps: 60,
  frameTime: 16.67,
  memoryUsage: 0,
  renderTime: 0,
  lastUpdate: Date.now()
};

// Entity pool for memory optimization
class EntityPool {
  constructor(maxSize = 1000) {
    this.pool = [];
    this.maxSize = maxSize;
  }

  acquire() {
    return this.pool.length > 0 ? this.pool.pop().reset() : this.createEntity();
  }

  release(entity) {
    if (this.pool.length < this.maxSize) {
      this.pool.push(entity);
    }
  }

  createEntity() {
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      alive: false,
      age: 0,
      energy: 100,
      reset() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.alive = false;
        this.age = 0;
        this.energy = 100;
        return this;
      }
    };
  }
}

// Create the simulation store with subscriber support
const useSimulationStore = create(
  subscribeWithSelector((set, get) => ({
    // Core simulation state
    simulationType: 'gameOfLife',
    isRunning: false,
    isPaused: false,
    generation: 0,
    timeStep: 0,
    
    // Entity management
    entities: [],
    entityPool: new EntityPool(1000),
    maxEntities: 10000,
    
    // Grid-based simulations (Game of Life, Cellular Automata)
    grid: [],
    gridWidth: 0,
    gridHeight: 0,
    gridDepth: 1, // For 3D cellular automata
    cellSize: 10,
    
    // Simulation configuration
    config: {
      speed: 60, // FPS target
      rules: {},
      dimensions: { width: 800, height: 600 },
      interactive: true
    },
    
    // Performance monitoring
    performance: { ...initialPerformanceMetrics },
    performanceHistory: [],
    
    // Error handling
    errors: [],
    warnings: [],
    
    // Computed properties
    get activeCells() {
      const state = get();
      if (state.simulationType === 'gameOfLife' || state.simulationType === 'cellular') {
        return state.grid.flat(state.gridDepth > 1 ? 2 : 1).filter(cell => cell === 1).length;
      }
      return state.entities.filter(entity => entity.alive).length;
    },
    
    get averageFPS() {
      const history = get().performanceHistory;
      if (history.length === 0) return 60;
      const sum = history.reduce((acc, metrics) => acc + metrics.fps, 0);
      return sum / history.length;
    },
    
    get memoryPressure() {
      const state = get();
      const entityCount = state.entities.length;
      const gridCellCount = state.grid.length * (state.grid[0]?.length || 0) * state.gridDepth;
      const totalMemoryUnits = entityCount + gridCellCount;
      return Math.min(1, totalMemoryUnits / 50000); // Normalize to 0-1 scale
    },
    
    // Actions
    setSimulationType: (type) => set({ simulationType: type, generation: 0, timeStep: 0 }),
    
    toggleSimulation: () => set((state) => ({ 
      isRunning: !state.isRunning,
      isPaused: state.isRunning ? true : false
    })),
    
    startSimulation: () => set({ isRunning: true, isPaused: false }),
    stopSimulation: () => set({ isRunning: false, isPaused: true }),
    
    resetSimulation: () => set((state) => ({
      isRunning: false,
      isPaused: false,
      generation: 0,
      timeStep: 0,
      entities: [],
      grid: state.simulationType === 'gameOfLife' || state.simulationType === 'cellular' ? 
        state.grid.map(row => Array.isArray(row) ? row.map(() => 0) : 0) : [],
      errors: [],
      warnings: []
    })),
    
    // Grid management
    initializeGrid: (width, height, depth = 1, fillValue = 0) => set((state) => {
      let newGrid;
      if (depth === 1) {
        // 2D grid
        newGrid = Array.from({ length: height }, () => Array(width).fill(fillValue));
      } else {
        // 3D grid
        newGrid = Array.from({ length: depth }, () =>
          Array.from({ length: height }, () => Array(width).fill(fillValue))
        );
      }
      
      return {
        grid: newGrid,
        gridWidth: width,
        gridHeight: height,
        gridDepth: depth
      };
    }),
    
    updateGrid: (newGrid) => set((state) => ({
      grid: newGrid,
      generation: state.generation + 1
    })),
    
    updateCell: (x, y, z = 0, value) => set((state) => {
      const newGrid = JSON.parse(JSON.stringify(state.grid)); // Deep clone
      
      if (state.gridDepth === 1) {
        // 2D grid
        if (y >= 0 && y < newGrid.length && x >= 0 && x < newGrid[y].length) {
          newGrid[y][x] = value;
        }
      } else {
        // 3D grid
        if (z >= 0 && z < newGrid.length && 
            y >= 0 && y < newGrid[z].length && 
            x >= 0 && x < newGrid[z][y].length) {
          newGrid[z][y][x] = value;
        }
      }
      
      return { grid: newGrid };
    }),
    
    // Entity management
    addEntity: (entityData) => set((state) => {
      if (state.entities.length >= state.maxEntities) {
        console.warn('Max entities reached');
        return state;
      }
      
      const entity = state.entityPool.acquire();
      Object.assign(entity, entityData);
      entity.alive = true;
      
      return {
        entities: [...state.entities, entity],
        timeStep: state.timeStep + 1
      };
    }),
    
    removeEntity: (entityId) => set((state) => {
      const entityIndex = state.entities.findIndex(e => e.id === entityId);
      if (entityIndex === -1) return state;
      
      const entity = state.entities[entityIndex];
      state.entityPool.release(entity);
      
      return {
        entities: state.entities.filter((_, i) => i !== entityIndex)
      };
    }),
    
    updateEntities: (updater) => set((state) => ({
      entities: typeof updater === 'function' ? updater(state.entities) : updater,
      generation: state.generation + 1
    })),
    
    // Configuration management
    updateConfig: (configUpdate) => set((state) => ({
      config: { ...state.config, ...configUpdate }
    })),
    
    setSpeed: (speed) => set((state) => ({
      config: { ...state.config, speed }
    })),
    
    setDimensions: (width, height) => set((state) => ({
      config: { ...state.config, dimensions: { width, height } }
    })),
    
    // Performance monitoring
    updatePerformance: (performanceUpdate) => set((state) => {
      const newPerformance = { ...state.performance, ...performanceUpdate, lastUpdate: Date.now() };
      
      // Keep performance history for analysis (last 100 entries)
      const newHistory = [...state.performanceHistory, newPerformance];
      if (newHistory.length > 100) {
        newHistory.shift();
      }
      
      return {
        performance: newPerformance,
        performanceHistory: newHistory
      };
    }),
    
    // Error handling
    addError: (error) => set((state) => ({
      errors: [...state.errors, { 
        id: Date.now(), 
        message: error.message || error, 
        timestamp: Date.now(),
        type: 'error'
      }]
    })),
    
    addWarning: (warning) => set((state) => ({
      warnings: [...state.warnings, { 
        id: Date.now(), 
        message: warning.message || warning, 
        timestamp: Date.now(),
        type: 'warning'
      }]
    })),
    
    clearErrors: () => set({ errors: [] }),
    clearWarnings: () => set({ warnings: [] }),
    
    // Batch operations for performance
    batchUpdate: (updates) => set((state) => ({
      ...state,
      ...updates
    })),
    
    // Advanced state management
    createSnapshot: () => {
      const state = get();
      return {
        simulationType: state.simulationType,
        generation: state.generation,
        entities: JSON.parse(JSON.stringify(state.entities)),
        grid: JSON.parse(JSON.stringify(state.grid)),
        config: JSON.parse(JSON.stringify(state.config)),
        timestamp: Date.now()
      };
    },
    
    restoreSnapshot: (snapshot) => set((state) => ({
      ...state,
      simulationType: snapshot.simulationType,
      generation: snapshot.generation,
      entities: snapshot.entities,
      grid: snapshot.grid,
      config: snapshot.config,
      isRunning: false
    }))
  }))
);

// Performance monitoring subscription
useSimulationStore.subscribe(
  (state) => state.performance.fps,
  (fps) => {
    if (fps < 30) {
      useSimulationStore.getState().addWarning(`Low FPS detected: ${fps.toFixed(1)}`);
    }
  }
);

// Memory pressure monitoring
useSimulationStore.subscribe(
  (state) => state.memoryPressure,
  (pressure) => {
    if (pressure > 0.8) {
      useSimulationStore.getState().addWarning(`High memory pressure: ${(pressure * 100).toFixed(1)}%`);
    }
  }
);

export default useSimulationStore;