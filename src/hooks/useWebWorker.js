/**
 * Custom hook for managing Web Worker communications
 * Provides type-safe interface for heavy computations
 */

import { useEffect, useRef, useCallback, useState } from 'react';

const MESSAGE_TYPES = {
  GAME_OF_LIFE_STEP: 'GAME_OF_LIFE_STEP',
  EMERGENCE_ENGINE_STEP: 'EMERGENCE_ENGINE_STEP',
  PHYSICS_CALCULATION: 'PHYSICS_CALCULATION',
  MAZE_GENERATION: 'MAZE_GENERATION',
  PATHFINDING: 'PATHFINDING'
};

export function useWebWorker(workerPath = '/workers/simulation-worker.js') {
  const workerRef = useRef(null);
  const requestIdRef = useRef(0);
  const pendingRequestsRef = useRef(new Map());
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [workerCapabilities, setWorkerCapabilities] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);

  // Initialize worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(workerPath);
      
      workerRef.current.onmessage = (event) => {
        const { type, requestId, data, success, error, capabilities, performanceMetrics } = event.data;
        
        switch (type) {
          case 'WORKER_READY':
            setIsWorkerReady(true);
            setWorkerCapabilities(capabilities || []);
            console.log('✅ Web Worker ready with capabilities:', capabilities);
            break;
            
          case 'RESULT':
            if (performanceMetrics) {
              setPerformanceMetrics(performanceMetrics);
            }
            
            const request = pendingRequestsRef.current.get(requestId);
            if (request) {
              pendingRequestsRef.current.delete(requestId);
              if (success) {
                request.resolve(data);
              } else {
                request.reject(new Error(error?.message || 'Worker computation failed'));
              }
            }
            break;
            
          case 'ERROR':
            const errorRequest = pendingRequestsRef.current.get(requestId);
            if (errorRequest) {
              pendingRequestsRef.current.delete(requestId);
              errorRequest.reject(new Error(error?.message || 'Worker error'));
            }
            break;
            
          default:
            console.warn('Unknown message type from worker:', type);
        }
      };
      
      workerRef.current.onerror = (error) => {
        console.error('Web Worker error:', error);
        setIsWorkerReady(false);
        
        // Reject all pending requests
        pendingRequestsRef.current.forEach((request) => {
          request.reject(new Error('Worker crashed'));
        });
        pendingRequestsRef.current.clear();
      };
      
    } catch (error) {
      console.error('Failed to initialize Web Worker:', error);
      setIsWorkerReady(false);
    }
    
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      pendingRequestsRef.current.clear();
    };
  }, [workerPath]);

  // Generic method to send messages to worker
  const sendMessage = useCallback((type, data) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isWorkerReady) {
        reject(new Error('Worker not ready'));
        return;
      }
      
      const requestId = ++requestIdRef.current;
      pendingRequestsRef.current.set(requestId, { resolve, reject });
      
      try {
        workerRef.current.postMessage({
          type,
          data,
          requestId
        });
      } catch (error) {
        pendingRequestsRef.current.delete(requestId);
        reject(error);
      }
    });
  }, [isWorkerReady]);

  // Specialized methods for different simulation types
  const calculateGameOfLifeStep = useCallback((grid, rules) => {
    return sendMessage(MESSAGE_TYPES.GAME_OF_LIFE_STEP, { grid, rules });
  }, [sendMessage]);

  const calculateEmergenceStep = useCallback((entities, config) => {
    return sendMessage(MESSAGE_TYPES.EMERGENCE_ENGINE_STEP, { entities, config });
  }, [sendMessage]);

  const calculatePhysicsStep = useCallback((entities, config) => {
    return sendMessage(MESSAGE_TYPES.PHYSICS_CALCULATION, { entities, config });
  }, [sendMessage]);

  return {
    isWorkerReady,
    workerCapabilities,
    performanceMetrics,
    calculateGameOfLifeStep,
    calculateEmergenceStep,
    calculatePhysicsStep,
    sendMessage
  };
}

/**
 * Hook specifically for Game of Life simulations with Web Worker
 */
export function useGameOfLifeWorker() {
  const { isWorkerReady, calculateGameOfLifeStep, performanceMetrics } = useWebWorker();
  const [isCalculating, setIsCalculating] = useState(false);

  const processGeneration = useCallback(async (currentGrid, rules) => {
    if (!isWorkerReady || isCalculating) {
      return null;
    }

    try {
      setIsCalculating(true);
      const result = await calculateGameOfLifeStep(currentGrid, rules);
      return result;
    } catch (error) {
      console.error('Game of Life calculation error:', error);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [isWorkerReady, isCalculating, calculateGameOfLifeStep]);

  return {
    isWorkerReady,
    isCalculating,
    processGeneration,
    performanceMetrics
  };
}

/**
 * Hook for Emergence Engine simulations with Web Worker
 */
export function useEmergenceWorker() {
  const { isWorkerReady, calculateEmergenceStep, performanceMetrics } = useWebWorker();
  const [isCalculating, setIsCalculating] = useState(false);

  const processStep = useCallback(async (entities, config) => {
    if (!isWorkerReady || isCalculating) {
      return null;
    }

    try {
      setIsCalculating(true);
      const result = await calculateEmergenceStep(entities, config);
      return result;
    } catch (error) {
      console.error('Emergence Engine calculation error:', error);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [isWorkerReady, isCalculating, calculateEmergenceStep]);

  return {
    isWorkerReady,
    isCalculating,
    processStep,
    performanceMetrics
  };
}

/**
 * Hook for physics simulations with Web Worker
 */
export function usePhysicsWorker() {
  const { isWorkerReady, calculatePhysicsStep, performanceMetrics } = useWebWorker();
  const [isCalculating, setIsCalculating] = useState(false);

  const processPhysics = useCallback(async (entities, config) => {
    if (!isWorkerReady || isCalculating) {
      return null;
    }

    try {
      setIsCalculating(true);
      const result = await calculatePhysicsStep(entities, config);
      return result;
    } catch (error) {
      console.error('Physics calculation error:', error);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [isWorkerReady, isCalculating, calculatePhysicsStep]);

  return {
    isWorkerReady,
    isCalculating,
    processPhysics,
    performanceMetrics
  };
}

export default useWebWorker;