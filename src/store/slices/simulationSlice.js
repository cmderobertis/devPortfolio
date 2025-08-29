/**
 * Simulation Slice - Interactive simulation state management
 * Features: Multi-simulation support, performance tracking, state persistence
 */

export const createSimulationSlice = (set, get) => ({
  simulations: {},

  // Initialize a new simulation
  initSimulation: (simulationId, config = {}) => {
    set((state) => {
      state.simulations[simulationId] = {
        id: simulationId,
        status: 'initialized', // initialized, running, paused, stopped, error
        config: {
          fps: 60,
          autoPlay: false,
          preserveState: true,
          enableWebWorker: true,
          ...config
        },
        state: {
          frame: 0,
          elapsedTime: 0,
          lastUpdate: null,
          data: null
        },
        performance: {
          averageFPS: 0,
          frameTime: [],
          memoryUsage: 0,
          webWorkerActive: false
        },
        controls: {
          playbackSpeed: 1.0,
          stepMode: false,
          recording: false
        },
        errors: [],
        createdAt: new Date().toISOString()
      }
    })

    // Initialize performance monitoring
    get().startSimulationMonitoring(simulationId)
  },

  // Update simulation state
  updateSimulation: (simulationId, updates) => {
    set((state) => {
      if (state.simulations[simulationId]) {
        const simulation = state.simulations[simulationId]
        
        // Update state
        simulation.state = { ...simulation.state, ...updates.state }
        
        // Update performance metrics if provided
        if (updates.performance) {
          simulation.performance = { ...simulation.performance, ...updates.performance }
        }
        
        // Update last update timestamp
        simulation.state.lastUpdate = new Date().toISOString()
        
        // Increment frame counter
        if (updates.state && 'frame' in updates.state) {
          simulation.state.frame++
        }
      }
    })
  },

  // Start simulation
  startSimulation: (simulationId) => {
    set((state) => {
      if (state.simulations[simulationId]) {
        state.simulations[simulationId].status = 'running'
        state.simulations[simulationId].state.lastUpdate = new Date().toISOString()
      }
    })
    
    get().addNotification({
      type: 'info',
      title: 'Simulation Started',
      message: `${simulationId} is now running`,
      duration: 2000
    })
  },

  // Pause simulation
  pauseSimulation: (simulationId) => {
    set((state) => {
      if (state.simulations[simulationId]) {
        state.simulations[simulationId].status = 'paused'
      }
    })
  },

  // Stop simulation
  stopSimulation: (simulationId) => {
    set((state) => {
      if (state.simulations[simulationId]) {
        state.simulations[simulationId].status = 'stopped'
      }
    })
  },

  // Reset simulation to initial state
  resetSimulation: (simulationId) => {
    set((state) => {
      if (state.simulations[simulationId]) {
        const simulation = state.simulations[simulationId]
        simulation.state = {
          frame: 0,
          elapsedTime: 0,
          lastUpdate: new Date().toISOString(),
          data: null
        }
        simulation.status = 'initialized'
        simulation.errors = []
      }
    })
  },

  // Update simulation configuration
  updateSimulationConfig: (simulationId, configUpdates) => {
    set((state) => {
      if (state.simulations[simulationId]) {
        state.simulations[simulationId].config = {
          ...state.simulations[simulationId].config,
          ...configUpdates
        }
      }
    })
  },

  // Update simulation controls
  updateSimulationControls: (simulationId, controlUpdates) => {
    set((state) => {
      if (state.simulations[simulationId]) {
        state.simulations[simulationId].controls = {
          ...state.simulations[simulationId].controls,
          ...controlUpdates
        }
      }
    })
  },

  // Set simulation playback speed
  setSimulationSpeed: (simulationId, speed) => {
    set((state) => {
      if (state.simulations[simulationId]) {
        state.simulations[simulationId].controls.playbackSpeed = Math.max(0.1, Math.min(5.0, speed))
      }
    })
  },

  // Toggle step mode
  toggleStepMode: (simulationId) => {
    set((state) => {
      if (state.simulations[simulationId]) {
        state.simulations[simulationId].controls.stepMode = !state.simulations[simulationId].controls.stepMode
        
        // Pause if entering step mode
        if (state.simulations[simulationId].controls.stepMode) {
          state.simulations[simulationId].status = 'paused'
        }
      }
    })
  },

  // Step simulation forward (when in step mode)
  stepSimulation: (simulationId, steps = 1) => {
    const simulation = get().simulations[simulationId]
    if (simulation && simulation.controls.stepMode) {
      set((state) => {
        state.simulations[simulationId].state.frame += steps
        state.simulations[simulationId].state.lastUpdate = new Date().toISOString()
      })
    }
  },

  // Performance monitoring
  updateSimulationPerformance: (simulationId, performanceData) => {
    set((state) => {
      if (state.simulations[simulationId]) {
        const simulation = state.simulations[simulationId]
        
        // Update frame time history
        if (performanceData.frameTime) {
          simulation.performance.frameTime.push({
            time: performanceData.frameTime,
            timestamp: Date.now()
          })
          
          // Keep only last 60 frames
          if (simulation.performance.frameTime.length > 60) {
            simulation.performance.frameTime.shift()
          }
          
          // Calculate average FPS
          const recentFrames = simulation.performance.frameTime.slice(-30)
          const avgFrameTime = recentFrames.reduce((sum, f) => sum + f.time, 0) / recentFrames.length
          simulation.performance.averageFPS = Math.round(1000 / avgFrameTime)
        }
        
        // Update other performance metrics
        Object.assign(simulation.performance, performanceData)
        
        // Check for performance issues
        if (simulation.performance.averageFPS < 30) {
          get().addSimulationError(simulationId, {
            type: 'performance',
            severity: 'warning',
            message: `Low FPS detected: ${simulation.performance.averageFPS}`
          })
        }
      }
    })
  },

  // Start performance monitoring for a simulation
  startSimulationMonitoring: (simulationId) => {
    const checkPerformance = () => {
      const simulation = get().simulations[simulationId]
      if (simulation && simulation.status === 'running') {
        // Monitor memory usage
        if (performance.memory) {
          get().updateSimulationPerformance(simulationId, {
            memoryUsage: performance.memory.usedJSHeapSize
          })
        }
        
        // Continue monitoring
        setTimeout(checkPerformance, 1000)
      }
    }
    
    checkPerformance()
  },

  // Error handling
  addSimulationError: (simulationId, error) => {
    set((state) => {
      if (state.simulations[simulationId]) {
        const errorEntry = {
          id: `error_${Date.now()}`,
          timestamp: new Date().toISOString(),
          ...error
        }
        
        state.simulations[simulationId].errors.push(errorEntry)
        
        // Keep only last 10 errors
        if (state.simulations[simulationId].errors.length > 10) {
          state.simulations[simulationId].errors.shift()
        }
        
        // Set simulation status to error for critical errors
        if (error.severity === 'critical') {
          state.simulations[simulationId].status = 'error'
        }
      }
    })
    
    // Add notification for errors
    get().addNotification({
      type: error.severity === 'critical' ? 'error' : 'warning',
      title: 'Simulation Error',
      message: error.message,
      duration: error.severity === 'critical' ? 0 : 5000 // Critical errors don't auto-close
    })
  },

  // Clear simulation errors
  clearSimulationErrors: (simulationId) => {
    set((state) => {
      if (state.simulations[simulationId]) {
        state.simulations[simulationId].errors = []
        
        // Reset status if it was in error state
        if (state.simulations[simulationId].status === 'error') {
          state.simulations[simulationId].status = 'stopped'
        }
      }
    })
  },

  // Recording functionality
  startSimulationRecording: (simulationId) => {
    set((state) => {
      if (state.simulations[simulationId]) {
        state.simulations[simulationId].controls.recording = true
        
        // Initialize recording data structure
        if (!state.simulations[simulationId].recording) {
          state.simulations[simulationId].recording = {
            startTime: new Date().toISOString(),
            frames: [],
            metadata: {}
          }
        }
      }
    })
  },

  stopSimulationRecording: (simulationId) => {
    set((state) => {
      if (state.simulations[simulationId]) {
        state.simulations[simulationId].controls.recording = false
        
        if (state.simulations[simulationId].recording) {
          state.simulations[simulationId].recording.endTime = new Date().toISOString()
        }
      }
    })
  },

  // Record simulation frame data
  recordSimulationFrame: (simulationId, frameData) => {
    set((state) => {
      const simulation = state.simulations[simulationId]
      if (simulation && simulation.controls.recording && simulation.recording) {
        simulation.recording.frames.push({
          frame: simulation.state.frame,
          timestamp: new Date().toISOString(),
          data: frameData
        })
        
        // Limit recording size (keep last 1000 frames)
        if (simulation.recording.frames.length > 1000) {
          simulation.recording.frames.shift()
        }
      }
    })
  },

  // Cleanup simulation
  destroySimulation: (simulationId) => {
    set((state) => {
      delete state.simulations[simulationId]
    })
  },

  // Utility methods
  getSimulation: (simulationId) => {
    return get().simulations[simulationId] || null
  },

  getRunningSimulations: () => {
    const simulations = get().simulations
    return Object.values(simulations).filter(sim => sim.status === 'running')
  },

  getSimulationsByStatus: (status) => {
    const simulations = get().simulations
    return Object.values(simulations).filter(sim => sim.status === status)
  },

  // Bulk operations
  pauseAllSimulations: () => {
    set((state) => {
      Object.values(state.simulations).forEach(simulation => {
        if (simulation.status === 'running') {
          simulation.status = 'paused'
        }
      })
    })
  },

  resumeAllSimulations: () => {
    set((state) => {
      Object.values(state.simulations).forEach(simulation => {
        if (simulation.status === 'paused') {
          simulation.status = 'running'
          simulation.state.lastUpdate = new Date().toISOString()
        }
      })
    })
  },

  stopAllSimulations: () => {
    set((state) => {
      Object.values(state.simulations).forEach(simulation => {
        simulation.status = 'stopped'
      })
    })
  },

  // Export simulation data
  exportSimulationData: (simulationId) => {
    const simulation = get().simulations[simulationId]
    if (simulation) {
      return {
        ...simulation,
        exportedAt: new Date().toISOString()
      }
    }
    return null
  },

  // Import simulation data
  importSimulationData: (simulationId, data) => {
    set((state) => {
      state.simulations[simulationId] = {
        ...data,
        importedAt: new Date().toISOString()
      }
    })
  }
})