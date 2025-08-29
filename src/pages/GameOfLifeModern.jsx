import React, { useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { startTransition, useDeferredValue } from 'react';
import { Button, Container, Typography, Checkbox } from '../design-system';
import InteractivePageWrapper from '../components/InteractivePageWrapper';
import SimulationErrorBoundary from '../components/SimulationErrorBoundary';
import { ConcurrentSimulation, useConcurrentSimulation } from '../components/ConcurrentSimulation';

// Zustand stores
import useGameOfLifeStore from '../stores/gameOfLifeStore';
import useSimulationStore from '../stores/simulationStore';

// Custom hooks
import useSimulationEngine from '../hooks/useSimulationEngine';
import usePerformanceMonitoring from '../hooks/usePerformanceMonitoring';

// Styles
import '../components/InteractivePageWrapper.css';
import '../styles/GameOfLife.css';

// Enhanced Game Canvas with React 18 concurrent features
const ConcurrentGameCanvas = React.memo(({ 
  grid, 
  numCellsX, 
  numCellsY, 
  cellSize, 
  theme, 
  onCellClick,
  isPending
}) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  
  // Defer grid updates for smooth interaction
  const deferredGrid = useDeferredValue(grid);
  
  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      contextRef.current = canvas.getContext('2d');
      canvas.width = numCellsX * cellSize;
      canvas.height = numCellsY * cellSize;
    }
  }, [numCellsX, numCellsY, cellSize]);
  
  // Optimized rendering with concurrent features
  const renderGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    
    if (!canvas || !ctx || !deferredGrid || deferredGrid.length === 0) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);
    
    // Batch cell rendering for performance
    ctx.fillStyle = theme.live;
    ctx.beginPath();
    
    for (let x = 0; x < numCellsX; x++) {
      for (let y = 0; y < numCellsY; y++) {
        if (deferredGrid[x] && deferredGrid[x][y] === 1) {
          ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
    
    ctx.fill();
    
    // Draw grid lines
    if (cellSize >= 8) {
      ctx.strokeStyle = theme.grid;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      
      // Vertical lines
      for (let x = 0; x <= numCellsX; x++) {
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, height);
      }
      
      // Horizontal lines
      for (let y = 0; y <= numCellsY; y++) {
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(width, y * cellSize);
      }
      
      ctx.stroke();
    }
    
    // Visual indicator for pending updates
    if (isPending) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, width, height);
    }
  }, [deferredGrid, numCellsX, numCellsY, cellSize, theme, isPending]);
  
  // Render when grid changes
  useEffect(() => {
    requestAnimationFrame(renderGrid);
  }, [renderGrid]);
  
  // Handle cell clicks with concurrent updates
  const handleCanvasClick = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas || !onCellClick) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);
    
    // Use startTransition for smooth interaction
    startTransition(() => {
      onCellClick(x, y);
    });
  }, [cellSize, onCellClick]);
  
  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      style={{
        border: '1px solid var(--md-sys-color-outline)',
        borderRadius: '4px',
        cursor: 'pointer',
        opacity: isPending ? 0.7 : 1,
        transition: 'opacity 0.2s ease'
      }}
      aria-label="Game of Life grid - click cells to toggle"
      role="img"
    />
  );
});

ConcurrentGameCanvas.displayName = 'ConcurrentGameCanvas';

// Performance monitoring display
const PerformanceDisplay = React.memo(({ metrics, performance }) => {
  const { fps, memory, timing } = metrics;
  const grade = useMemo(() => {
    if (fps.current >= 55 && memory.percentage < 0.7) return 'A';
    if (fps.current >= 45 && memory.percentage < 0.8) return 'B';
    if (fps.current >= 30 && memory.percentage < 0.9) return 'C';
    return 'D';
  }, [fps.current, memory.percentage]);
  
  return (
    <div className="performance-display" style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      backgroundColor: 'var(--md-sys-color-surface-container)',
      padding: '8px',
      borderRadius: '6px',
      fontSize: '0.75rem',
      color: 'var(--md-sys-color-on-surface)',
      minWidth: '120px'
    }}>
      <div>FPS: {fps.current.toFixed(1)}</div>
      <div>Memory: {(memory.percentage * 100).toFixed(1)}%</div>
      <div>Grade: <span style={{ 
        fontWeight: 'bold',
        color: grade === 'A' ? '#10B981' : grade === 'B' ? '#F59E0B' : '#EF4444'
      }}>{grade}</span></div>
      {performance && (
        <div>Gen Time: {performance.generationTime?.toFixed(1)}ms</div>
      )}
    </div>
  );
});

PerformanceDisplay.displayName = 'PerformanceDisplay';

// Main Game of Life component with modern React architecture
const GameOfLifeModern = () => {
  const containerRef = useRef(null);
  
  // Zustand stores
  const {
    // State
    grid,
    numCellsX,
    numCellsY,
    cellSize,
    isRunning,
    generationsPerSecond,
    currentGeneration,
    animateTransitions,
    theme,
    performance,
    statistics,
    
    // Actions
    initializeGrid,
    randomizeGrid,
    toggleCell,
    toggleSimulation,
    clearGrid,
    setSpeed,
    setAnimateTransitions,
    computeNextGeneration
  } = useGameOfLifeStore();
  
  // Simulation engine
  const engine = useSimulationEngine({
    autoStart: false,
    targetFPS: generationsPerSecond
  });
  
  // Performance monitoring
  const performanceMonitoring = usePerformanceMonitoring({
    enabled: true,
    sampleRate: 1000,
    webVitals: true
  });
  
  // Concurrent simulation features
  const { deferredData, isPending, updateSimulation } = useConcurrentSimulation({
    grid,
    generation: currentGeneration,
    performance,
    statistics
  });
  
  // Initialize the simulation engine
  useEffect(() => {
    engine.setStepCallback(() => {
      if (isRunning) {
        const startTime = performance.now();
        computeNextGeneration();
        const endTime = performance.now();
        
        // Update performance metrics
        useGameOfLifeStore.getState().updatePerformance({
          generationTime: endTime - startTime
        });
      }
    });
    
    engine.setRenderCallback(() => {
      // Rendering is handled by the canvas component
    });
  }, [engine, isRunning, computeNextGeneration]);
  
  // Sync engine with game state
  useEffect(() => {
    if (isRunning && !engine.isRunning) {
      engine.start();
    } else if (!isRunning && engine.isRunning) {
      engine.stop();
    }
  }, [isRunning, engine]);
  
  // Initialize grid when component mounts
  useEffect(() => {
    const initializeGame = () => {
      if (!containerRef.current) return;
      
      const contentArea = containerRef.current.querySelector('.gameoflife-canvas-container');
      if (!contentArea) return;
      
      const canvasWidth = Math.max(400, contentArea.clientWidth - 24);
      const canvasHeight = Math.max(300, contentArea.clientHeight - 120);
      
      initializeGrid(canvasWidth, canvasHeight, 10);
      randomizeGrid(0.15); // 15% initial density
    };
    
    const timeoutId = setTimeout(initializeGame, 100);
    
    const handleResize = () => {
      clearTimeout(window.resizedFinished);
      window.resizedFinished = setTimeout(initializeGame, 250);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      clearTimeout(window.resizedFinished);
    };
  }, [initializeGrid, randomizeGrid]);
  
  // Event handlers with concurrent updates
  const handleSpeedChange = useCallback((e) => {
    const newSpeed = parseInt(e.target.value, 10);
    updateSimulation(() => {
      setSpeed(newSpeed);
      engine.updateConfig({ targetFPS: newSpeed });
    });
  }, [updateSimulation, setSpeed, engine]);
  
  const handleAnimateChange = useCallback((checked) => {
    updateSimulation(() => setAnimateTransitions(checked));
  }, [updateSimulation, setAnimateTransitions]);
  
  const handleToggleSimulation = useCallback(() => {
    updateSimulation(toggleSimulation);
  }, [updateSimulation, toggleSimulation]);
  
  const handleReset = useCallback(() => {
    updateSimulation(() => {
      clearGrid();
      randomizeGrid(0.15);
    });
  }, [updateSimulation, clearGrid, randomizeGrid]);
  
  const handleCellClick = useCallback((x, y) => {
    if (!isRunning) {
      toggleCell(x, y);
    }
  }, [toggleCell, isRunning]);
  
  // Memoized statistics display
  const statisticsDisplay = useMemo(() => {
    if (!statistics) return null;
    
    return (
      <div className="statistics-display" style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '16px',
        fontSize: '0.875rem'
      }}>
        <div>Generation: {currentGeneration}</div>
        <div>Live Cells: {statistics.currentLiveCells}</div>
        <div>Max Cells: {statistics.maxLiveCells}</div>
        <div>Density: {(statistics.currentLiveCells / (numCellsX * numCellsY) * 100).toFixed(1)}%</div>
        {statistics.stabilityCounter > 0 && (
          <div>Stable: {statistics.stabilityCounter} gen</div>
        )}
      </div>
    );
  }, [statistics, currentGeneration, numCellsX, numCellsY]);
  
  return (
    <SimulationErrorBoundary componentName="Game of Life">
      <InteractivePageWrapper>
        <Container className="gameoflife-container">
          <div 
            ref={containerRef}
            className="gameoflife-main-content"
            style={{ position: 'relative' }}
          >
            <div className="gameoflife-header">
              <Typography variant="display-small">
                Conway's Game of Life (Modern)
              </Typography>
            </div>
            
            {statisticsDisplay}
            
            <div className="gameoflife-content-layout">
              <div className="gameoflife-controls">
                <div className="gameoflife-control-group">
                  <Button 
                    variant="filled" 
                    onClick={handleToggleSimulation}
                    disabled={isPending}
                  >
                    {isRunning ? 'Pause' : 'Play'}
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={handleReset}
                    disabled={isPending}
                  >
                    Reset
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => updateSimulation(() => randomizeGrid(0.15))}
                    disabled={isPending}
                  >
                    Randomize
                  </Button>
                </div>
                
                <div className="gameoflife-control-group">
                  <div className="gameoflife-speed-container">
                    <Typography variant="label-medium">
                      Speed: {generationsPerSecond} GPS
                    </Typography>
                    <input
                      type="range"
                      min="1"
                      max="60"
                      value={generationsPerSecond}
                      onChange={handleSpeedChange}
                      className="gameoflife-speed-slider"
                      disabled={isPending}
                    />
                  </div>
                </div>
                
                <div className="gameoflife-control-group">
                  <Checkbox
                    checked={animateTransitions}
                    onChange={handleAnimateChange}
                    label="Animate Transitions"
                    disabled={isPending}
                  />
                </div>
              </div>
              
              <div className="gameoflife-canvas-container">
                <ConcurrentSimulation
                  fallbackComponent={() => (
                    <div style={{
                      width: numCellsX * cellSize || 400,
                      height: numCellsY * cellSize || 300,
                      backgroundColor: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px'
                    }}>
                      Loading simulation...
                    </div>
                  )}
                >
                  <Suspense fallback={<div>Loading canvas...</div>}>
                    <ConcurrentGameCanvas
                      grid={grid}
                      numCellsX={numCellsX}
                      numCellsY={numCellsY}
                      cellSize={cellSize}
                      theme={theme}
                      onCellClick={handleCellClick}
                      isPending={isPending}
                    />
                  </Suspense>
                </ConcurrentSimulation>
              </div>
            </div>
            
            {/* Performance monitoring display */}
            <PerformanceDisplay 
              metrics={performanceMonitoring.metrics}
              performance={performance}
            />
            
            {/* Performance alerts */}
            {performanceMonitoring.alerts.length > 0 && (
              <div className="performance-alerts" style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                maxWidth: '300px'
              }}>
                {performanceMonitoring.alerts.slice(-3).map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      backgroundColor: alert.type === 'critical' ? '#FEE2E2' : '#FEF3C7',
                      color: alert.type === 'critical' ? '#DC2626' : '#D97706',
                      padding: '8px 12px',
                      marginBottom: '4px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      border: `1px solid ${alert.type === 'critical' ? '#FECACA' : '#FDE68A'}`
                    }}
                  >
                    {alert.message}
                  </div>
                ))}
              </div>
            )}
            
            {/* Engine status indicator */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                fontSize: '0.75rem',
                backgroundColor: 'var(--md-sys-color-surface-container)',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                Engine: {engine.isRunning ? '🟢' : '🔴'} | 
                FPS: {engine.actualFPS.toFixed(1)} | 
                Gen: {engine.generation}
              </div>
            )}
          </div>
        </Container>
      </InteractivePageWrapper>
    </SimulationErrorBoundary>
  );
};

export default GameOfLifeModern;