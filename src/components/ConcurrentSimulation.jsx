import React, { 
  useDeferredValue, 
  startTransition, 
  useCallback, 
  useMemo, 
  Suspense,
  useEffect,
  useState
} from 'react';

// Loading fallback component
const SimulationSkeleton = ({ width = 800, height = 600 }) => (
  <div 
    className="simulation-skeleton"
    style={{ 
      width, 
      height,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'loading 1.5s infinite',
      borderRadius: '8px'
    }}
  >
    <style>{`
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

// Error boundary for concurrent simulations
class ConcurrentSimulationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log to external service if needed
    console.error('Concurrent Simulation Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="simulation-error-fallback" style={{
          padding: '24px',
          textAlign: 'center',
          backgroundColor: 'var(--md-sys-color-error-container)',
          color: 'var(--md-sys-color-on-error-container)',
          borderRadius: '8px',
          margin: '16px'
        }}>
          <h3>Simulation Error</h3>
          <p>Something went wrong with the simulation.</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry Simulation
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '16px', textAlign: 'left' }}>
              <summary>Error Details</summary>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for concurrent simulation features
const withConcurrentFeatures = (WrappedComponent) => {
  return React.memo(React.forwardRef((props, ref) => {
    const [isPending, setIsPending] = useState(false);
    
    // Defer heavy updates for smooth interactions
    const deferredSimulationData = useDeferredValue(props.simulationData);
    const deferredEntities = useDeferredValue(props.entities);
    const deferredGrid = useDeferredValue(props.grid);
    
    // Memoize expensive calculations
    const processedData = useMemo(() => {
      if (!deferredSimulationData) return null;
      
      // Process simulation data with deferred values
      return {
        ...deferredSimulationData,
        entities: deferredEntities,
        grid: deferredGrid
      };
    }, [deferredSimulationData, deferredEntities, deferredGrid]);
    
    // Concurrent update handler
    const handleUpdate = useCallback((updateFn) => {
      setIsPending(true);
      
      startTransition(() => {
        updateFn();
        setIsPending(false);
      });
    }, []);
    
    // Throttled update for high-frequency changes
    const throttledUpdate = useCallback((updateFn, delay = 16) => {
      const throttledFn = throttle(updateFn, delay);
      handleUpdate(throttledFn);
    }, [handleUpdate]);
    
    return (
      <ConcurrentSimulationErrorBoundary>
        <Suspense fallback={<SimulationSkeleton {...props} />}>
          <WrappedComponent
            ref={ref}
            {...props}
            simulationData={processedData}
            isPending={isPending}
            onUpdate={handleUpdate}
            onThrottledUpdate={throttledUpdate}
          />
        </Suspense>
      </ConcurrentSimulationErrorBoundary>
    );
  }));
};

// Utility function for throttling
function throttle(func, delay) {
  let timeoutId;
  let lastExecTime = 0;
  
  return function (...args) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

// Concurrent simulation wrapper component
const ConcurrentSimulation = ({ 
  children, 
  fallbackComponent: FallbackComponent = SimulationSkeleton,
  errorFallback: ErrorFallback = null,
  enableErrorBoundary = true,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const content = (
    <Suspense fallback={<FallbackComponent {...props} />}>
      {children}
    </Suspense>
  );
  
  if (enableErrorBoundary) {
    return (
      <ConcurrentSimulationErrorBoundary ErrorFallback={ErrorFallback}>
        {content}
      </ConcurrentSimulationErrorBoundary>
    );
  }
  
  return content;
};

// Hook for concurrent simulation state management
const useConcurrentSimulation = (simulationData, options = {}) => {
  const {
    deferUpdates = true,
    throttleDelay = 16,
    enableTransitions = true
  } = options;
  
  // Defer values for smooth UI
  const deferredData = deferUpdates ? useDeferredValue(simulationData) : simulationData;
  const [isPending, setIsPending] = useState(false);
  
  // Update handler with transitions
  const updateSimulation = useCallback((updateFn) => {
    if (enableTransitions) {
      setIsPending(true);
      startTransition(() => {
        updateFn();
        setIsPending(false);
      });
    } else {
      updateFn();
    }
  }, [enableTransitions]);
  
  // Throttled updates for high-frequency changes
  const throttledUpdate = useMemo(() => 
    throttle((updateFn) => updateSimulation(updateFn), throttleDelay),
    [updateSimulation, throttleDelay]
  );
  
  return {
    deferredData,
    isPending,
    updateSimulation,
    throttledUpdate
  };
};

// Performance monitoring hook for concurrent features
const useConcurrentPerformance = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    deferredUpdates: 0,
    transitionTime: 0,
    frameDrops: 0
  });
  
  useEffect(() => {
    let frameId;
    let lastFrameTime = performance.now();
    let frameCount = 0;
    
    const measureFrame = (timestamp) => {
      frameCount++;
      const frameDelta = timestamp - lastFrameTime;
      
      // Detect frame drops (>16.67ms for 60fps)
      if (frameDelta > 20) {
        setMetrics(prev => ({
          ...prev,
          frameDrops: prev.frameDrops + 1,
          renderTime: frameDelta
        }));
      }
      
      lastFrameTime = timestamp;
      
      // Update metrics every 60 frames
      if (frameCount % 60 === 0) {
        setMetrics(prev => ({
          ...prev,
          renderTime: frameDelta
        }));
      }
      
      frameId = requestAnimationFrame(measureFrame);
    };
    
    frameId = requestAnimationFrame(measureFrame);
    
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);
  
  return metrics;
};

export {
  ConcurrentSimulation,
  withConcurrentFeatures,
  useConcurrentSimulation,
  useConcurrentPerformance,
  ConcurrentSimulationErrorBoundary,
  SimulationSkeleton
};