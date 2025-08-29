import { useReducer, useRef, useCallback, useMemo, useEffect } from 'react';
import { startTransition } from 'react';

// Simulation engine states
const SIMULATION_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  ERROR: 'error',
  LOADING: 'loading'
};

// Simulation engine actions
const ENGINE_ACTIONS = {
  START: 'START',
  STOP: 'STOP',
  PAUSE: 'PAUSE',
  RESUME: 'RESUME',
  STEP: 'STEP',
  RESET: 'RESET',
  UPDATE_CONFIG: 'UPDATE_CONFIG',
  SET_ERROR: 'SET_ERROR',
  UPDATE_PERFORMANCE: 'UPDATE_PERFORMANCE',
  SET_LOADING: 'SET_LOADING'
};

// Initial engine state
const initialEngineState = {
  status: SIMULATION_STATES.IDLE,
  generation: 0,
  timeStep: 0,
  lastUpdateTime: 0,
  targetFPS: 60,
  actualFPS: 0,
  config: {
    autoStart: false,
    maxGenerations: Infinity,
    stepMode: false,
    benchmarkMode: false
  },
  performance: {
    frameTime: 0,
    computeTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    totalFrames: 0
  },
  error: null,
  isLoading: false
};

// Simulation engine reducer
const simulationEngineReducer = (state, action) => {
  switch (action.type) {
    case ENGINE_ACTIONS.START:
      return {
        ...state,
        status: SIMULATION_STATES.RUNNING,
        error: null,
        lastUpdateTime: performance.now()
      };
      
    case ENGINE_ACTIONS.STOP:
      return {
        ...state,
        status: SIMULATION_STATES.IDLE,
        generation: 0,
        timeStep: 0
      };
      
    case ENGINE_ACTIONS.PAUSE:
      return {
        ...state,
        status: SIMULATION_STATES.PAUSED
      };
      
    case ENGINE_ACTIONS.RESUME:
      return {
        ...state,
        status: SIMULATION_STATES.RUNNING,
        lastUpdateTime: performance.now()
      };
      
    case ENGINE_ACTIONS.STEP:
      return {
        ...state,
        generation: state.generation + 1,
        timeStep: state.timeStep + 1
      };
      
    case ENGINE_ACTIONS.RESET:
      return {
        ...state,
        status: SIMULATION_STATES.IDLE,
        generation: 0,
        timeStep: 0,
        error: null,
        performance: { ...initialEngineState.performance }
      };
      
    case ENGINE_ACTIONS.UPDATE_CONFIG:
      return {
        ...state,
        config: { ...state.config, ...action.payload }
      };
      
    case ENGINE_ACTIONS.SET_ERROR:
      return {
        ...state,
        status: SIMULATION_STATES.ERROR,
        error: action.payload
      };
      
    case ENGINE_ACTIONS.UPDATE_PERFORMANCE:
      return {
        ...state,
        performance: { ...state.performance, ...action.payload },
        actualFPS: action.payload.fps || state.actualFPS
      };
      
    case ENGINE_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        status: action.payload ? SIMULATION_STATES.LOADING : state.status
      };
      
    default:
      return state;
  }
};

// Performance monitor class
class SimulationPerformanceMonitor {
  constructor() {
    this.frameHistory = [];
    this.maxHistorySize = 60; // 1 second at 60fps
    this.startTime = performance.now();
  }
  
  recordFrame(computeTime, renderTime) {
    const now = performance.now();
    const frameTime = now - (this.lastFrameTime || now);
    
    this.frameHistory.push({
      timestamp: now,
      frameTime,
      computeTime,
      renderTime,
      totalTime: computeTime + renderTime
    });
    
    // Keep history size manageable
    if (this.frameHistory.length > this.maxHistorySize) {
      this.frameHistory.shift();
    }
    
    this.lastFrameTime = now;
    
    return this.getMetrics();
  }
  
  getMetrics() {
    if (this.frameHistory.length === 0) {
      return {
        fps: 0,
        avgFrameTime: 0,
        avgComputeTime: 0,
        avgRenderTime: 0,
        frameDrops: 0
      };
    }
    
    const recent = this.frameHistory.slice(-30); // Last 30 frames
    const avgFrameTime = recent.reduce((sum, frame) => sum + frame.frameTime, 0) / recent.length;
    const avgComputeTime = recent.reduce((sum, frame) => sum + frame.computeTime, 0) / recent.length;
    const avgRenderTime = recent.reduce((sum, frame) => sum + frame.renderTime, 0) / recent.length;
    
    const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
    const frameDrops = recent.filter(frame => frame.frameTime > 20).length; // >20ms = dropped frame at 60fps
    
    return {
      fps: Math.round(fps * 10) / 10,
      avgFrameTime: Math.round(avgFrameTime * 100) / 100,
      avgComputeTime: Math.round(avgComputeTime * 100) / 100,
      avgRenderTime: Math.round(avgRenderTime * 100) / 100,
      frameDrops,
      totalFrames: this.frameHistory.length
    };
  }
  
  reset() {
    this.frameHistory = [];
    this.startTime = performance.now();
    this.lastFrameTime = null;
  }
}

// Main simulation engine hook
const useSimulationEngine = (config = {}) => {
  const [state, dispatch] = useReducer(simulationEngineReducer, {
    ...initialEngineState,
    config: { ...initialEngineState.config, ...config }
  });
  
  const performanceMonitor = useRef(new SimulationPerformanceMonitor());
  const animationFrameRef = useRef(null);
  const computeWorkerRef = useRef(null);
  const stepCallbackRef = useRef(null);
  const renderCallbackRef = useRef(null);
  
  // Memoized engine controls
  const controls = useMemo(() => ({
    start: () => dispatch({ type: ENGINE_ACTIONS.START }),
    stop: () => dispatch({ type: ENGINE_ACTIONS.STOP }),
    pause: () => dispatch({ type: ENGINE_ACTIONS.PAUSE }),
    resume: () => dispatch({ type: ENGINE_ACTIONS.RESUME }),
    step: () => dispatch({ type: ENGINE_ACTIONS.STEP }),
    reset: () => {
      dispatch({ type: ENGINE_ACTIONS.RESET });
      performanceMonitor.current.reset();
    },
    updateConfig: (configUpdate) => dispatch({ 
      type: ENGINE_ACTIONS.UPDATE_CONFIG, 
      payload: configUpdate 
    })
  }), []);
  
  // Set computation callback
  const setStepCallback = useCallback((callback) => {
    stepCallbackRef.current = callback;
  }, []);
  
  // Set render callback
  const setRenderCallback = useCallback((callback) => {
    renderCallbackRef.current = callback;
  }, []);
  
  // Engine loop with performance monitoring
  const engineLoop = useCallback((timestamp) => {
    const computeStart = performance.now();
    
    try {
      // Execute computation step
      if (stepCallbackRef.current) {
        stepCallbackRef.current(state.generation);
      }
      
      const computeEnd = performance.now();
      const computeTime = computeEnd - computeStart;
      
      // Execute render step
      const renderStart = performance.now();
      if (renderCallbackRef.current) {
        renderCallbackRef.current(state.generation);
      }
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      
      // Update performance metrics
      const metrics = performanceMonitor.current.recordFrame(computeTime, renderTime);
      
      // Update performance state with React 18 transition
      startTransition(() => {
        dispatch({ 
          type: ENGINE_ACTIONS.UPDATE_PERFORMANCE, 
          payload: {
            ...metrics,
            frameTime: renderEnd - computeStart,
            computeTime,
            renderTime,
            totalFrames: metrics.totalFrames
          }
        });
        
        dispatch({ type: ENGINE_ACTIONS.STEP });
      });
      
      // Check for performance issues
      if (metrics.fps < 30 && metrics.totalFrames > 10) {
        console.warn(`Low FPS detected: ${metrics.fps}fps`);
      }
      
      // Continue loop if running
      if (state.status === SIMULATION_STATES.RUNNING && 
          state.generation < state.config.maxGenerations) {
        
        // Frame rate limiting
        const targetFrameTime = 1000 / state.targetFPS;
        const actualFrameTime = renderEnd - timestamp;
        const delay = Math.max(0, targetFrameTime - actualFrameTime);
        
        setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(engineLoop);
        }, delay);
      }
      
    } catch (error) {
      console.error('Simulation engine error:', error);
      dispatch({ 
        type: ENGINE_ACTIONS.SET_ERROR, 
        payload: {
          message: error.message,
          stack: error.stack,
          timestamp: Date.now()
        }
      });
    }
  }, [state.status, state.generation, state.targetFPS, state.config.maxGenerations]);
  
  // Start/stop engine based on status
  useEffect(() => {
    if (state.status === SIMULATION_STATES.RUNNING) {
      animationFrameRef.current = requestAnimationFrame(engineLoop);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.status, engineLoop]);
  
  // Web Worker support for heavy computation
  const enableWebWorker = useCallback((workerScript) => {
    if (typeof Worker !== 'undefined') {
      try {
        const worker = new Worker(workerScript);
        computeWorkerRef.current = worker;
        
        worker.onmessage = (event) => {
          const { type, data } = event.data;
          
          switch (type) {
            case 'computation_complete':
              // Handle worker computation results
              if (renderCallbackRef.current) {
                renderCallbackRef.current(data);
              }
              break;
              
            case 'error':
              dispatch({ 
                type: ENGINE_ACTIONS.SET_ERROR, 
                payload: data 
              });
              break;
              
            default:
              console.warn('Unknown worker message type:', type);
          }
        };
        
        worker.onerror = (error) => {
          console.error('Worker error:', error);
          dispatch({ 
            type: ENGINE_ACTIONS.SET_ERROR, 
            payload: { message: 'Web Worker error', error } 
          });
        };
        
        return true;
      } catch (error) {
        console.warn('Web Worker not supported:', error);
        return false;
      }
    }
    return false;
  }, []);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (computeWorkerRef.current) {
        computeWorkerRef.current.terminate();
      }
    };
  }, []);
  
  // Memory management utilities
  const memoryUtils = useMemo(() => ({
    getMemoryUsage: () => {
      if (performance.memory) {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    },
    
    forceGarbageCollection: () => {
      if (window.gc) {
        window.gc();
      }
    }
  }), []);
  
  // Benchmarking utilities
  const benchmark = useMemo(() => ({
    run: async (iterations = 1000) => {
      dispatch({ type: ENGINE_ACTIONS.SET_LOADING, payload: true });
      
      const results = [];
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        const iterationStart = performance.now();
        
        if (stepCallbackRef.current) {
          stepCallbackRef.current(i);
        }
        
        const iterationEnd = performance.now();
        results.push(iterationEnd - iterationStart);
        
        // Yield to UI occasionally
        if (i % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      const endTime = performance.now();
      
      dispatch({ type: ENGINE_ACTIONS.SET_LOADING, payload: false });
      
      return {
        totalTime: endTime - startTime,
        avgTime: results.reduce((sum, time) => sum + time, 0) / results.length,
        minTime: Math.min(...results),
        maxTime: Math.max(...results),
        iterations,
        throughput: iterations / ((endTime - startTime) / 1000)
      };
    }
  }), []);
  
  return {
    // State
    state,
    isRunning: state.status === SIMULATION_STATES.RUNNING,
    isPaused: state.status === SIMULATION_STATES.PAUSED,
    isIdle: state.status === SIMULATION_STATES.IDLE,
    hasError: state.status === SIMULATION_STATES.ERROR,
    isLoading: state.isLoading,
    
    // Controls
    ...controls,
    
    // Callbacks
    setStepCallback,
    setRenderCallback,
    
    // Advanced features
    enableWebWorker,
    memoryUtils,
    benchmark,
    
    // Performance data
    performance: state.performance,
    generation: state.generation,
    actualFPS: state.actualFPS
  };
};

export default useSimulationEngine;