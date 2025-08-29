import { lazy, Suspense, memo } from 'react';
import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring.js';

// Skeleton loader for simulations
const SimulationSkeleton = memo(() => (
  <div className="simulation-skeleton" style={{
    width: '100%',
    height: '600px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{
      width: '60px',
      height: '60px',
      border: '3px solid #e9ecef',
      borderTop: '3px solid #007bff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    <div style={{
      position: 'absolute',
      bottom: '20px',
      color: '#6c757d',
      fontSize: '14px'
    }}>
      Loading simulation...
    </div>
  </div>
));

// Lazy-loaded simulation components with performance monitoring
const LazyEmergenceEngine = lazy(() => 
  import('../pages/EmergenceEngine.jsx').catch(err => {
    console.warn('Failed to load EmergenceEngine:', err);
    return { default: () => <div>Failed to load simulation</div> };
  })
);

const LazyGameOfLife = lazy(() => 
  import('../pages/GameOfLife.jsx').catch(err => {
    console.warn('Failed to load GameOfLife:', err);
    return { default: () => <div>Failed to load simulation</div> };
  })
);

const LazyBreakout = lazy(() => 
  import('../pages/Breakout.tsx').catch(err => {
    console.warn('Failed to load Breakout:', err);
    return { default: () => <div>Failed to load simulation</div> };
  })
);

const LazyMazeStudio = lazy(() => 
  import('../pages/MazeStudio.jsx').catch(err => {
    console.warn('Failed to load MazeStudio:', err);
    return { default: () => <div>Failed to load simulation</div> };
  })
);

const LazyPrisms = lazy(() => 
  import('../pages/Prisms.jsx').catch(err => {
    console.warn('Failed to load Prisms:', err);
    return { default: () => <div>Failed to load simulation</div> };
  })
);

const LazyDatabaseEditor = lazy(() => 
  import('../pages/DatabaseEditor.jsx').catch(err => {
    console.warn('Failed to load DatabaseEditor:', err);
    return { default: () => <div>Failed to load simulation</div> };
  })
);

// HOC for wrapping simulations with performance monitoring
const withPerformanceMonitoring = (WrappedComponent, displayName) => {
  const Component = memo((props) => {
    const { metrics, performanceScore } = usePerformanceMonitoring({
      trackWebVitals: true,
      trackMemory: true
    });

    // Warn if performance is poor
    if (performanceScore < 60) {
      console.warn(`Performance warning for ${displayName}:`, metrics);
    }

    return <WrappedComponent {...props} />;
  });

  Component.displayName = `withPerformanceMonitoring(${displayName})`;
  return Component;
};

// Enhanced lazy simulation wrapper
export const LazySimulation = memo(({ type, ...props }) => {
  const simulationComponents = {
    emergence: LazyEmergenceEngine,
    gameoflife: LazyGameOfLife,
    breakout: LazyBreakout,
    maze: LazyMazeStudio,
    prisms: LazyPrisms,
    database: LazyDatabaseEditor
  };

  const Component = simulationComponents[type?.toLowerCase()];

  if (!Component) {
    return <div>Unknown simulation type: {type}</div>;
  }

  const EnhancedComponent = withPerformanceMonitoring(Component, type);

  return (
    <Suspense fallback={<SimulationSkeleton />}>
      <EnhancedComponent {...props} />
    </Suspense>
  );
});

LazySimulation.displayName = 'LazySimulation';

// Preload function for critical simulations
export const preloadSimulation = (type) => {
  const simulationComponents = {
    emergence: () => import('../pages/EmergenceEngine.jsx'),
    gameoflife: () => import('../pages/GameOfLife.jsx'),
    breakout: () => import('../pages/Breakout.tsx'),
    maze: () => import('../pages/MazeStudio.jsx'),
    prisms: () => import('../pages/Prisms.jsx'),
    database: () => import('../pages/DatabaseEditor.jsx')
  };

  const loader = simulationComponents[type?.toLowerCase()];
  if (loader) {
    loader().catch(err => console.warn(`Failed to preload ${type}:`, err));
  }
};

// Intersection Observer for smart preloading
export const useSmartPreloading = () => {
  const preloadOnHover = (type) => {
    return {
      onMouseEnter: () => preloadSimulation(type),
      onFocus: () => preloadSimulation(type)
    };
  };

  return { preloadOnHover };
};