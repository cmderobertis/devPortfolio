import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Emergence pattern types
const PatternTypes = {
  FLOCKING: 'flocking',
  NEURONS: 'neurons',
  ECONOMY: 'economy',
  CELLULAR: 'cellular'
};

// Cellular automata rules
const CellularRules = {
  CONWAY: 'conway',
  MAZE: 'maze',
  CORAL: 'coral'
};

// Initial emergence metrics
const initialMetrics = {
  coherence: 0,
  diversity: 0,
  efficiency: 0,
  emergence: 0,
  complexity: 0
};

// Agent factory for different patterns
const createAgent = (pattern, x, y, canvas, rules = {}) => {
  const baseAgent = {
    id: Math.random().toString(36).substr(2, 9),
    x: x || Math.random() * (canvas?.width || 800),
    y: y || Math.random() * (canvas?.height || 600),
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    age: 0,
    energy: 100,
    size: 3,
    color: 'rgba(139, 92, 246, 0.8)'
  };
  
  switch (pattern) {
    case PatternTypes.FLOCKING:
      return {
        ...baseAgent,
        maxSpeed: 2,
        maxForce: 0.03,
        separationRadius: 25,
        alignmentRadius: 50,
        cohesionRadius: 50
      };
      
    case PatternTypes.NEURONS:
      return {
        ...baseAgent,
        activation: Math.random() * 100,
        threshold: 50 + Math.random() * 30,
        connections: [],
        fired: false,
        refractoryPeriod: 0
      };
      
    case PatternTypes.ECONOMY:
      const roles = ['producer', 'consumer', 'trader'];
      const role = roles[Math.floor(Math.random() * roles.length)];
      return {
        ...baseAgent,
        role,
        wealth: 100,
        demand: Math.random() * 50,
        supply: Math.random() * 50,
        tradingRadius: 60
      };
      
    default:
      return baseAgent;
  }
};

// Emergence Engine Store
const useEmergenceStore = create(
  subscribeWithSelector((set, get) => ({
    // Core state
    isRunning: false,
    selectedPattern: PatternTypes.FLOCKING,
    generation: 0,
    
    // Agents for particle-based simulations
    agents: [],
    maxAgents: 500,
    
    // Cellular automata state
    cellularGrid: [],
    cellular3DGrid: [],
    cellularRules: CellularRules.CONWAY,
    is3D: false,
    editMode: false,
    cursor: { x: 0, y: 0, z: 0 },
    
    // Grid dimensions
    gridConfig: {
      width: 80,
      height: 50,
      depth: 20,
      cellSize: 8
    },
    
    // Simulation parameters
    rules: {
      separation: 1.0,
      alignment: 1.0,
      cohesion: 1.0,
      maxSpeed: 2.0,
      maxForce: 0.03
    },
    
    simulationSpeed: 100, // ms delay between updates
    
    // Canvas reference
    canvasRef: null,
    
    // Emergence metrics
    metrics: { ...initialMetrics },
    metricsHistory: [],
    
    // Performance tracking
    performance: {
      updateTime: 0,
      renderTime: 0,
      agentCount: 0,
      fps: 60
    },
    
    // Computed properties
    get activeCells() {
      const state = get();
      if (state.selectedPattern === PatternTypes.CELLULAR) {
        if (state.is3D) {
          return state.cellular3DGrid.flat(2).filter(cell => cell === 1).length;
        }
        return state.cellularGrid.flat().filter(cell => cell === 1).length;
      }
      return state.agents.filter(agent => agent.energy > 0).length;
    },
    
    get density() {
      const state = get();
      if (state.selectedPattern === PatternTypes.CELLULAR) {
        const totalCells = state.gridConfig.width * state.gridConfig.height * 
                          (state.is3D ? state.gridConfig.depth : 1);
        return totalCells > 0 ? state.activeCells / totalCells : 0;
      }
      return state.agents.length / state.maxAgents;
    },
    
    // Actions
    setCanvas: (canvasRef) => set({ canvasRef }),
    
    setPattern: (pattern) => set((state) => {
      // Reset state when changing patterns
      return {
        selectedPattern: pattern,
        generation: 0,
        agents: [],
        isRunning: false,
        // Keep cellular grids if switching to cellular, else clear
        cellularGrid: pattern === PatternTypes.CELLULAR ? state.cellularGrid : [],
        cellular3DGrid: pattern === PatternTypes.CELLULAR ? state.cellular3DGrid : [],
        is3D: pattern === PatternTypes.CELLULAR ? state.is3D : false,
        editMode: pattern === PatternTypes.CELLULAR ? false : false
      };
    }),
    
    toggleSimulation: () => set((state) => ({ isRunning: !state.isRunning })),
    startSimulation: () => set({ isRunning: true }),
    stopSimulation: () => set({ isRunning: false }),
    
    resetSimulation: () => set((state) => {
      const { canvasRef, selectedPattern, gridConfig } = state;
      
      if (selectedPattern === PatternTypes.CELLULAR) {
        return {
          isRunning: false,
          generation: 0,
          cellularGrid: state.is3D ? [] : 
            Array.from({ length: gridConfig.height }, () => 
              Array(gridConfig.width).fill(0)
            ),
          cellular3DGrid: state.is3D ? 
            Array.from({ length: gridConfig.depth }, () =>
              Array.from({ length: gridConfig.height }, () =>
                Array(gridConfig.width).fill(0)
              )
            ) : [],
          cursor: { 
            x: Math.floor(gridConfig.width / 2), 
            y: Math.floor(gridConfig.height / 2), 
            z: Math.floor(gridConfig.depth / 2) 
          },
          metrics: { ...initialMetrics }
        };
      } else {
        // Initialize agents for particle-based patterns
        const canvas = canvasRef?.current;
        if (canvas) {
          const agentCount = selectedPattern === PatternTypes.FLOCKING ? 150 :
                           selectedPattern === PatternTypes.NEURONS ? 100 :
                           selectedPattern === PatternTypes.ECONOMY ? 80 : 150;
          
          const newAgents = Array.from({ length: agentCount }, () => 
            createAgent(selectedPattern, null, null, canvas, state.rules)
          );
          
          return {
            isRunning: false,
            generation: 0,
            agents: newAgents,
            metrics: { ...initialMetrics }
          };
        }
        
        return {
          isRunning: false,
          generation: 0,
          agents: [],
          metrics: { ...initialMetrics }
        };
      }
    }),
    
    // Cellular automata actions
    initializeCellularGrid: (randomize = true) => set((state) => {
      const { gridConfig } = state;
      
      if (state.is3D) {
        const grid = Array.from({ length: gridConfig.depth }, () =>
          Array.from({ length: gridConfig.height }, () =>
            Array.from({ length: gridConfig.width }, () => 
              randomize ? (Math.random() < 0.3 ? 1 : 0) : 0
            )
          )
        );
        
        return {
          cellular3DGrid: grid,
          cursor: { 
            x: Math.floor(gridConfig.width / 2), 
            y: Math.floor(gridConfig.height / 2), 
            z: Math.floor(gridConfig.depth / 2) 
          }
        };
      } else {
        const grid = Array.from({ length: gridConfig.height }, () =>
          Array.from({ length: gridConfig.width }, () =>
            randomize ? (Math.random() < 0.3 ? 1 : 0) : 0
          )
        );
        
        return {
          cellularGrid: grid,
          cursor: { 
            x: Math.floor(gridConfig.width / 2), 
            y: Math.floor(gridConfig.height / 2), 
            z: 0 
          }
        };
      }
    }),
    
    toggleCell: (x, y, z = 0) => set((state) => {
      if (state.is3D) {
        const newGrid = state.cellular3DGrid.map((layer, layerIdx) =>
          layer.map((row, rowIdx) =>
            row.map((cell, colIdx) =>
              layerIdx === z && rowIdx === y && colIdx === x ? 1 - cell : cell
            )
          )
        );
        return { cellular3DGrid: newGrid };
      } else {
        const newGrid = state.cellularGrid.map((row, rowIdx) =>
          row.map((cell, colIdx) =>
            rowIdx === y && colIdx === x ? 1 - cell : cell
          )
        );
        return { cellularGrid: newGrid };
      }
    }),
    
    setCursor: (x, y, z = 0) => set({ cursor: { x, y, z } }),
    
    toggle3D: () => set((state) => ({
      is3D: !state.is3D,
      editMode: false // Exit edit mode when switching dimensions
    })),
    
    toggleEditMode: () => set((state) => ({
      editMode: !state.editMode,
      isRunning: state.editMode ? state.isRunning : false // Stop when entering edit mode
    })),
    
    setCellularRules: (rules) => set({ cellularRules: rules }),
    
    // Agent-based simulation actions
    updateAgents: (updateFn) => set((state) => ({
      agents: typeof updateFn === 'function' ? updateFn(state.agents) : updateFn,
      generation: state.generation + 1
    })),
    
    addAgent: (agentData) => set((state) => {
      if (state.agents.length >= state.maxAgents) return state;
      
      const newAgent = createAgent(
        state.selectedPattern, 
        agentData?.x, 
        agentData?.y, 
        state.canvasRef?.current, 
        state.rules
      );
      
      Object.assign(newAgent, agentData);
      
      return { agents: [...state.agents, newAgent] };
    }),
    
    removeAgent: (agentId) => set((state) => ({
      agents: state.agents.filter(agent => agent.id !== agentId)
    })),
    
    // Rule management
    updateRules: (ruleUpdates) => set((state) => ({
      rules: { ...state.rules, ...ruleUpdates }
    })),
    
    setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
    
    // Metrics calculation
    calculateMetrics: () => set((state) => {
      const { agents, selectedPattern, cellularGrid, cellular3DGrid, is3D } = state;
      let metrics = { ...initialMetrics };
      
      if (selectedPattern === PatternTypes.CELLULAR) {
        const grid = is3D ? cellular3DGrid : cellularGrid;
        const activeCells = is3D ? 
          grid.flat(2).filter(cell => cell === 1).length :
          grid.flat().filter(cell => cell === 1).length;
        
        const totalCells = is3D ? 
          grid.length * (grid[0]?.length || 0) * (grid[0]?.[0]?.length || 0) :
          grid.length * (grid[0]?.length || 0);
        
        const density = totalCells > 0 ? activeCells / totalCells : 0;
        
        metrics = {
          coherence: density,
          diversity: Math.abs(0.5 - density) * 2,
          efficiency: activeCells > 0 ? Math.min(1, activeCells / (state.generation * 0.1 + activeCells * 0.01)) : 0,
          emergence: density > 0 ? Math.sin(density * Math.PI) : 0,
          complexity: density * (1 - density) * 4 // Maximum when density = 0.5
        };
      } else {
        // Agent-based metrics
        if (agents.length === 0) return { metrics };
        
        // Calculate spatial coherence
        const avgX = agents.reduce((sum, agent) => sum + agent.x, 0) / agents.length;
        const avgY = agents.reduce((sum, agent) => sum + agent.y, 0) / agents.length;
        const avgDistance = agents.reduce((sum, agent) => 
          sum + Math.sqrt((agent.x - avgX) ** 2 + (agent.y - avgY) ** 2), 0
        ) / agents.length;
        
        const canvasSize = Math.sqrt((state.canvasRef?.current?.width || 800) ** 2 + 
                                   (state.canvasRef?.current?.height || 600) ** 2);
        const coherence = 1 - Math.min(1, avgDistance / (canvasSize * 0.5));
        
        // Calculate diversity (velocity variance)
        const avgVel = agents.reduce((sum, agent) => 
          sum + Math.sqrt(agent.vx ** 2 + agent.vy ** 2), 0
        ) / agents.length;
        const velVariance = agents.reduce((sum, agent) => {
          const vel = Math.sqrt(agent.vx ** 2 + agent.vy ** 2);
          return sum + (vel - avgVel) ** 2;
        }, 0) / agents.length;
        const diversity = Math.min(1, Math.sqrt(velVariance) / 5);
        
        // Calculate efficiency (pattern-specific)
        let efficiency = 0.5; // Default
        if (selectedPattern === PatternTypes.NEURONS) {
          const activeNeurons = agents.filter(agent => agent.fired).length;
          efficiency = agents.length > 0 ? activeNeurons / agents.length : 0;
        } else if (selectedPattern === PatternTypes.ECONOMY) {
          const avgWealth = agents.reduce((sum, agent) => sum + (agent.wealth || 0), 0) / agents.length;
          efficiency = Math.min(1, avgWealth / 200);
        }
        
        metrics = {
          coherence,
          diversity,
          efficiency,
          emergence: coherence * diversity,
          complexity: coherence * (1 - coherence) * diversity * 4
        };
      }
      
      // Store metrics history
      const newHistory = [...state.metricsHistory, { ...metrics, timestamp: Date.now() }];
      if (newHistory.length > 100) newHistory.shift();
      
      return { 
        metrics,
        metricsHistory: newHistory
      };
    }),
    
    // Performance monitoring
    updatePerformance: (performanceUpdate) => set((state) => ({
      performance: { ...state.performance, ...performanceUpdate }
    })),
    
    // State export/import
    exportState: () => {
      const state = get();
      return {
        selectedPattern: state.selectedPattern,
        generation: state.generation,
        agents: state.agents,
        cellularGrid: state.cellularGrid,
        cellular3DGrid: state.cellular3DGrid,
        rules: state.rules,
        metrics: state.metrics,
        timestamp: Date.now()
      };
    },
    
    importState: (stateData) => set((state) => ({
      ...state,
      selectedPattern: stateData.selectedPattern || state.selectedPattern,
      generation: stateData.generation || 0,
      agents: stateData.agents || [],
      cellularGrid: stateData.cellularGrid || [],
      cellular3DGrid: stateData.cellular3DGrid || [],
      rules: stateData.rules || state.rules,
      metrics: stateData.metrics || state.metrics,
      isRunning: false
    }))
  }))
);

// Performance monitoring subscription
useEmergenceStore.subscribe(
  (state) => state.performance.fps,
  (fps) => {
    if (fps < 30) {
      console.warn(`Emergence Engine: Low FPS detected: ${fps.toFixed(1)}`);
    }
  }
);

// Complexity monitoring subscription
useEmergenceStore.subscribe(
  (state) => state.metrics.complexity,
  (complexity) => {
    if (complexity > 0.8) {
      console.info(`High complexity pattern detected: ${complexity.toFixed(2)}`);
    }
  }
);

export { PatternTypes, CellularRules };
export default useEmergenceStore;