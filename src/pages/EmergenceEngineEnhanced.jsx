import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, Target, Waves, Box, Grid, Settings2, Edit3 } from 'lucide-react';
import { 
  Page, 
  Stack, 
  LayoutGrid as Grid2, 
  GridItem,
  Button,
  Typography,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Checkbox,
  ThemeVariantProvider
} from '../components/design-system';

// Import existing engine functions
import { initializeAgents, updateAgents } from '../engine/EmergenceEngineCore.js';
import {
  initializeCellularGrid as initCellGrid,
  updateCellularGrid as updateCellGrid,
  drawCellularAutomata as drawCellAuto,
  initialize3DGrid as init3DCellGrid,
  update3DGrid as update3DCellGrid
} from '../engine/CellularAutomata.js';
import { calculateMetrics as calcMetrics } from '../engine/Metrics.js';

// Import configurations
import { defaultRules } from '../config/emergenceRules.js';
import {
  agentCountParams,
  cellularGridConfig,
  cellular3DGridConfig,
  initialCellularRules,
  simulationSpeeds
} from '../config/emergencePatterns.js';

const EmergenceEngineEnhanced = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [agents, setAgents] = useState([]);
  const [rules, setRules] = useState(defaultRules);
  const [selectedPattern, setSelectedPattern] = useState('flocking');
  const [cellularGrid, setCellularGrid] = useState([]);
  const [cellularRules, setCellularRules] = useState(initialCellularRules);
  const [generation, setGeneration] = useState(0);
  const [is3D, setIs3D] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0, z: 0 });
  const [simulationSpeed, setSimulationSpeed] = useState(simulationSpeeds.default);
  const [cellular3DGrid, setCellular3DGrid] = useState([]);
  const [emergentMetrics, setEmergentMetrics] = useState({
    coherence: 0,
    diversity: 0,
    efficiency: 0
  });

  // Pattern definitions for UI
  const patterns = [
    { id: 'flocking', name: 'Flocking', icon: Target, description: 'Bird-like swarm behavior' },
    { id: 'predatorPrey', name: 'Predator-Prey', icon: Zap, description: 'Predator and prey dynamics' },
    { id: 'schooling', name: 'Schooling', icon: Waves, description: 'Fish schooling patterns' },
    { id: 'cellular', name: 'Cellular', icon: Grid, description: 'Cellular automata simulation' },
    { id: 'particle', name: 'Particle', icon: Box, description: 'Particle system dynamics' }
  ];

  const currentPattern = patterns.find(p => p.id === selectedPattern);

  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setGeneration(0);
    const canvas = canvasRef.current;

    if (selectedPattern === 'cellular') {
      if (is3D) {
        setCellular3DGrid(init3DCellGrid(
          cellular3DGridConfig.defaultWidth, 
          cellular3DGridConfig.defaultHeight, 
          cellular3DGridConfig.defaultDepth
        ));
        setCursor({ 
          x: Math.floor(cellular3DGridConfig.defaultWidth / 2), 
          y: Math.floor(cellular3DGridConfig.defaultHeight / 2), 
          z: Math.floor(cellular3DGridConfig.defaultDepth / 2) 
        });
      } else {
        setCellularGrid(initCellGrid(
          cellularRules, 
          cellularGridConfig.defaultWidth, 
          cellularGridConfig.defaultHeight
        ));
        setCursor({ 
          x: Math.floor(cellularGridConfig.defaultWidth / 2), 
          y: Math.floor(cellularGridConfig.defaultHeight / 2), 
          z: 0 
        });
      }
    } else {
      if (canvas) {
        setAgents(initializeAgents(selectedPattern, canvas, rules, agentCountParams));
      } else {
        setAgents([]);
      }
    }

    // Initial draw
    requestAnimationFrame(() => {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (selectedPattern === 'cellular') {
          if (is3D) {
            const initial3DGrid = init3DCellGrid(
              cellular3DGridConfig.defaultWidth, 
              cellular3DGridConfig.defaultHeight, 
              cellular3DGridConfig.defaultDepth
            );
            drawCellAuto(ctx, initial3DGrid, initial3DGrid, canvas.width, canvas.height, true, editMode, cursor, 0, cellularRules);
          } else {
            const initialGrid = initCellGrid(cellularRules, cellularGridConfig.defaultWidth, cellularGridConfig.defaultHeight);
            drawCellAuto(ctx, initialGrid, [], canvas.width, canvas.height, false, editMode, cursor, 0, cellularRules);
          }
        } else {
          ctx.fillStyle = 'rgba(15, 23, 42, 1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          const initialAgents = initializeAgents(selectedPattern, canvas, rules, agentCountParams);
          setAgents(initialAgents);
        }
      }
    });
  }, [selectedPattern, is3D, editMode, cursor, cellularRules, rules]);

  const animate = useCallback(() => {
    if (!isRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    if (selectedPattern === 'cellular') {
      if (is3D) {
        const newGrid = update3DCellGrid(cellular3DGrid, cellularRules);
        setCellular3DGrid(newGrid);
        drawCellAuto(ctx, newGrid, cellular3DGrid, canvas.width, canvas.height, true, editMode, cursor, generation, cellularRules);
      } else {
        const newGrid = updateCellGrid(cellularGrid, cellularRules);
        setCellularGrid(newGrid);
        drawCellAuto(ctx, newGrid, cellularGrid, canvas.width, canvas.height, false, editMode, cursor, generation, cellularRules);
      }
      setGeneration(prev => prev + 1);
    } else {
      const newAgents = updateAgents(agents, rules, canvas);
      setAgents(newAgents);
      
      // Calculate and update metrics
      const metrics = calcMetrics(newAgents);
      setEmergentMetrics(metrics);
    }

    setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, simulationSpeed);
  }, [isRunning, selectedPattern, is3D, cellular3DGrid, cellularGrid, agents, rules, cellularRules, editMode, cursor, generation, simulationSpeed]);

  const toggleSimulation = () => {
    if (isRunning) {
      setIsRunning(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      setIsRunning(true);
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  const handlePatternChange = (patternId) => {
    setSelectedPattern(patternId);
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Initialize simulation when pattern changes
  useEffect(() => {
    resetSimulation();
  }, [resetSimulation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <ThemeVariantProvider variant="neon">
      <Page maxWidth="full">
        <Stack spacing="lg">
          <Stack spacing="md" align="center">
            <Typography variant="display-large">
              Emergence Engine
            </Typography>
            <Typography variant="body-large" align="center">
              Explore complex systems, cellular automata, and emergent behaviors
            </Typography>
          </Stack>

          <Grid2 columns={12} spacing="md">
            {/* Pattern Selection */}
            <GridItem span={12} spanMd={3}>
              <Card>
                <CardHeader>
                  <Typography variant="title-medium">
                    <Settings2 style={{ display: 'inline', marginRight: '0.5rem' }} />
                    Simulation Patterns
                  </Typography>
                </CardHeader>
                <CardContent>
                  <Stack spacing="sm">
                    {patterns.map((pattern) => {
                      const IconComponent = pattern.icon;
                      return (
                        <Button
                          key={pattern.id}
                          variant={selectedPattern === pattern.id ? "filled" : "outlined"}
                          onClick={() => handlePatternChange(pattern.id)}
                          icon={<IconComponent size={16} />}
                          className="w-full justify-start"
                        >
                          <Stack spacing="xs">
                            <Typography variant="label-large">
                              {pattern.name}
                            </Typography>
                            <Typography variant="body-small">
                              {pattern.description}
                            </Typography>
                          </Stack>
                        </Button>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            </GridItem>

            {/* Main Canvas */}
            <GridItem span={12} spanMd={6}>
              <Card>
                <CardContent>
                  <Stack spacing="md">
                    <Stack direction="horizontal" spacing="md" justify="between" align="center">
                      <Typography variant="title-medium">
                        {currentPattern?.name} Simulation
                      </Typography>
                      <Stack direction="horizontal" spacing="sm">
                        <Button
                          variant="filled"
                          onClick={toggleSimulation}
                          icon={isRunning ? <Pause size={16} /> : <Play size={16} />}
                        >
                          {isRunning ? 'Pause' : 'Play'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={resetSimulation}
                          icon={<RotateCcw size={16} />}
                        >
                          Reset
                        </Button>
                      </Stack>
                    </Stack>

                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={600}
                      style={{
                        width: '100%',
                        height: 'auto',
                        backgroundColor: '#0f172a',
                        borderRadius: 'var(--md-sys-shape-corner-medium)',
                        border: '2px solid var(--md-sys-color-outline-variant)'
                      }}
                    />

                    {/* Generation Counter for Cellular */}
                    {selectedPattern === 'cellular' && (
                      <Typography variant="body-medium" align="center">
                        Generation: {generation}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </GridItem>

            {/* Controls and Metrics */}
            <GridItem span={12} spanMd={3}>
              <Stack spacing="md">
                {/* Simulation Controls */}
                <Card>
                  <CardHeader>
                    <Typography variant="title-medium">Controls</Typography>
                  </CardHeader>
                  <CardContent>
                    <Stack spacing="md">
                      {/* Speed Control */}
                      <div>
                        <Typography variant="label-medium">Speed</Typography>
                        <input
                          type="range"
                          min="10"
                          max="1000"
                          step="10"
                          value={simulationSpeed}
                          onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
                          style={{ width: '100%' }}
                        />
                        <Typography variant="body-small">
                          {simulationSpeed}ms
                        </Typography>
                      </div>

                      {/* Cellular-specific controls */}
                      {selectedPattern === 'cellular' && (
                        <Stack spacing="sm">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Checkbox
                              checked={is3D}
                              onChange={(e) => setIs3D(e.target.checked)}
                            />
                            <Typography variant="body-medium">3D Mode</Typography>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Checkbox
                              checked={editMode}
                              onChange={(e) => setEditMode(e.target.checked)}
                            />
                            <Typography variant="body-medium">Edit Mode</Typography>
                          </div>
                        </Stack>
                      )}

                      {/* Agent-based simulation controls */}
                      {selectedPattern !== 'cellular' && (
                        <Stack spacing="sm">
                          <div>
                            <Typography variant="label-medium">Cohesion</Typography>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={rules.cohesion || 50}
                              onChange={(e) => setRules(prev => ({
                                ...prev,
                                cohesion: parseInt(e.target.value)
                              }))}
                              style={{ width: '100%' }}
                            />
                          </div>

                          <div>
                            <Typography variant="label-medium">Separation</Typography>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={rules.separation || 50}
                              onChange={(e) => setRules(prev => ({
                                ...prev,
                                separation: parseInt(e.target.value)
                              }))}
                              style={{ width: '100%' }}
                            />
                          </div>

                          <div>
                            <Typography variant="label-medium">Alignment</Typography>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={rules.alignment || 50}
                              onChange={(e) => setRules(prev => ({
                                ...prev,
                                alignment: parseInt(e.target.value)
                              }))}
                              style={{ width: '100%' }}
                            />
                          </div>
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Metrics Display */}
                {selectedPattern !== 'cellular' && (
                  <Card>
                    <CardHeader>
                      <Typography variant="title-medium">Emergence Metrics</Typography>
                    </CardHeader>
                    <CardContent>
                      <Stack spacing="sm">
                        <div>
                          <Typography variant="body-medium">Coherence</Typography>
                          <div style={{
                            width: '100%',
                            height: '8px',
                            backgroundColor: 'var(--md-sys-color-surface-variant)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div
                              style={{
                                width: `${emergentMetrics.coherence}%`,
                                height: '100%',
                                backgroundColor: 'var(--md-sys-color-primary)',
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </div>
                          <Typography variant="body-small">
                            {emergentMetrics.coherence.toFixed(1)}%
                          </Typography>
                        </div>

                        <div>
                          <Typography variant="body-medium">Diversity</Typography>
                          <div style={{
                            width: '100%',
                            height: '8px',
                            backgroundColor: 'var(--md-sys-color-surface-variant)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div
                              style={{
                                width: `${emergentMetrics.diversity}%`,
                                height: '100%',
                                backgroundColor: 'var(--md-sys-color-secondary)',
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </div>
                          <Typography variant="body-small">
                            {emergentMetrics.diversity.toFixed(1)}%
                          </Typography>
                        </div>

                        <div>
                          <Typography variant="body-medium">Efficiency</Typography>
                          <div style={{
                            width: '100%',
                            height: '8px',
                            backgroundColor: 'var(--md-sys-color-surface-variant)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div
                              style={{
                                width: `${emergentMetrics.efficiency}%`,
                                height: '100%',
                                backgroundColor: 'var(--md-sys-color-tertiary)',
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </div>
                          <Typography variant="body-small">
                            {emergentMetrics.efficiency.toFixed(1)}%
                          </Typography>
                        </div>
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </GridItem>
          </Grid2>
        </Stack>
      </Page>
    </ThemeVariantProvider>
  );
};

export default EmergenceEngineEnhanced;