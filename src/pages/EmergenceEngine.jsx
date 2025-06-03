import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, Target, Waves, Box, Grid, Settings2, Edit3 } from 'lucide-react';

// Import functions from engine
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

import '../styles/EmergenceEngine.css'; // Actual import for styles

const EmergenceEngine = () => {
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

  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
    }
    setGeneration(0);
    const canvas = canvasRef.current;

    if (selectedPattern === 'cellular') {
      if (is3D) {
        setCellular3DGrid(init3DCellGrid(cellular3DGridConfig.defaultWidth, cellular3DGridConfig.defaultHeight, cellular3DGridConfig.defaultDepth));
        setCursor({ x: Math.floor(cellular3DGridConfig.defaultWidth / 2), y: Math.floor(cellular3DGridConfig.defaultHeight / 2), z: Math.floor(cellular3DGridConfig.defaultDepth / 2) });
      } else {
        setCellularGrid(initCellGrid(cellularRules, cellularGridConfig.defaultWidth, cellularGridConfig.defaultHeight));
        setCursor({ x: Math.floor(cellularGridConfig.defaultWidth / 2), y: Math.floor(cellularGridConfig.defaultHeight / 2), z: 0 });
      }
    } else {
      if (canvas) {
        setAgents(initializeAgents(selectedPattern, canvas, rules, agentCountParams));
      } else {
        setAgents([]);
      }
    }

    requestAnimationFrame(() => {
        if (canvas) {
            const ctx = canvas.getContext('2d');
            let initialGridToDraw, initial3DGridToDraw;
            if (selectedPattern === 'cellular') {
                if (is3D) {
                    initial3DGridToDraw = init3DCellGrid(cellular3DGridConfig.defaultWidth, cellular3DGridConfig.defaultHeight, cellular3DGridConfig.defaultDepth);
                    drawCellAuto(ctx, initial3DGridToDraw, initial3DGridToDraw, canvas.width, canvas.height, true, editMode, cursor, 0, cellularRules);
                } else {
                    initialGridToDraw = initCellGrid(cellularRules, cellularGridConfig.defaultWidth, cellularGridConfig.defaultHeight);
                    drawCellAuto(ctx, initialGridToDraw, [], canvas.width, canvas.height, false, editMode, cursor, 0, cellularRules);
                }
            } else {
                ctx.fillStyle = 'rgba(15, 23, 42, 1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const initialAgents = initializeAgents(selectedPattern, canvas, rules, agentCountParams);
                initialAgents.forEach(agent => {
                    ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
                    ctx.beginPath();
                    ctx.arc(agent.x, agent.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
        }
    });
  }, [selectedPattern, rules, agentCountParams, cellularRules, is3D, cellularGridConfig, cellular3DGridConfig, editMode, cursor]);


  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (selectedPattern === 'cellular') {
      const currentGridToDraw = is3D ? cellular3DGrid : cellularGrid;
      // Pass the same grid for both 2D and 3D main grid param if appropriate, or an empty array for the unused one
      drawCellAuto(ctx, is3D ? cellular3DGrid : cellularGrid, is3D ? cellular3DGrid : [], canvas.width, canvas.height, is3D, editMode, cursor, generation, cellularRules);

      if (!editMode && isRunning) {
        if (is3D) {
          setCellular3DGrid(currentGrid => update3DCellGrid(currentGrid));
        } else {
          setCellularGrid(currentGrid => updateCellGrid(currentGrid, cellularRules));
        }
        setGeneration(gen => gen + 1);
      }

      const currentGridForMetrics = is3D ? cellular3DGrid : cellularGrid;
      if (currentGridForMetrics && currentGridForMetrics.length > 0) {
        let totalCells = 0;
        let liveCells = 0;

        if (is3D && currentGridForMetrics[0] && currentGridForMetrics[0][0]) {
          totalCells = currentGridForMetrics.length * currentGridForMetrics[0].length * currentGridForMetrics[0][0].length;
          liveCells = currentGridForMetrics.flat(2).filter(cell => cell === 1).length;
        } else if (!is3D && currentGridForMetrics[0]) {
          totalCells = currentGridForMetrics.length * (currentGridForMetrics[0]?.length || 0);
          liveCells = currentGridForMetrics.flat().filter(cell => cell === 1).length;
        }

        const density = totalCells > 0 ? liveCells / totalCells : 0;
        setEmergentMetrics({
          coherence: density,
          diversity: Math.abs(0.5 - density) * 2,
          efficiency: generation > 0 && liveCells > 0 ? Math.min(1, liveCells / (generation * 0.1 + liveCells * 0.01)) : 0
        });
      }

      if (isRunning && !editMode) {
        animationRef.current = setTimeout(() => {
          animationRef.current = requestAnimationFrame(animate);
        }, simulationSpeed);
      } else if (editMode || !isRunning) {
         drawCellAuto(ctx, is3D ? cellular3DGrid : cellularGrid, is3D ? cellular3DGrid : [], canvas.width, canvas.height, is3D, editMode, cursor, generation, cellularRules);
      }
      return;
    }

    ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setAgents(currentAgents => {
      const newAgents = updateAgents(currentAgents, canvas, rules, selectedPattern);

      newAgents.forEach(agent => {
        const size = selectedPattern === 'neurons' ? 3 + agent.activation * 0.05 :
                     selectedPattern === 'economy' ? 2 + agent.energy * 0.02 : 3;

        const color = selectedPattern === 'neurons' ? `rgba(16, 185, 129, ${0.3 + agent.activation * 0.007})` :
                      selectedPattern === 'economy' ? (agent.role === 'producer' ? 'rgba(239, 68, 68, 0.8)' :
                                                     agent.role === 'consumer' ? 'rgba(59, 130, 246, 0.8)' :
                                                     'rgba(245, 158, 11, 0.8)') :
                      'rgba(139, 92, 246, 0.8)';

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, size, 0, Math.PI * 2);
        ctx.fill();

        if (selectedPattern === 'flocking') {
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(agent.x, agent.y);
          ctx.lineTo(agent.x + agent.vx * 10, agent.y + agent.vy * 10);
          ctx.stroke();
        }
      });

      if (newAgents.length > 0) {
        setEmergentMetrics(calcMetrics(newAgents, rules));
      }
      return newAgents;
    });

    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isRunning, rules, selectedPattern, cellularRules, editMode, is3D, cellularGrid, cellular3DGrid, generation, cursor, simulationSpeed, calcMetrics, agentCountParams]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 800;
    canvas.height = 500;
    resetSimulation();
  }, [selectedPattern, is3D, cellularRules, resetSimulation]);

  useEffect(() => {
    if (isRunning && !editMode) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      const canvas = canvasRef.current;
      if (canvas) {
          const ctx = canvas.getContext('2d');
          if (selectedPattern === 'cellular') {
              const gridToDraw = is3D ? cellular3DGrid : cellularGrid;
              const grid3DToDraw = is3D ? cellular3DGrid : []; // Pass empty if not 3D
              drawCellAuto(ctx, gridToDraw, grid3DToDraw, canvas.width, canvas.height, is3D, true, cursor, generation, cellularRules);
          } else {
                ctx.fillStyle = 'rgba(15, 23, 42, 1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                if (agents && agents.length > 0) {
                    agents.forEach(agent => {
                        const size = selectedPattern === 'neurons' ? 3 + agent.activation * 0.05 : selectedPattern === 'economy' ? 2 + agent.energy * 0.02 : 3;
                        const color = selectedPattern === 'neurons' ? `rgba(16, 185, 129, ${0.3 + agent.activation * 0.007})` : selectedPattern === 'economy' ? (agent.role === 'producer' ? 'rgba(239, 68, 68, 0.8)' : agent.role === 'consumer' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(245, 158, 11, 0.8)') : 'rgba(139, 92, 246, 0.8)';
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(agent.x, agent.y, size, 0, Math.PI * 2);
                        ctx.fill();
                    });
                }
          }
      }
    }
    return () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };
  }, [isRunning, editMode, animate, selectedPattern, cellularGrid, cellular3DGrid, is3D, cursor, generation, cellularRules, agents]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!editMode || selectedPattern !== 'cellular') return;

      const currentGridState = is3D ? cellular3DGrid : cellularGrid;
      if (!currentGridState || currentGridState.length === 0) return;

      const gridContentCheck = is3D ? (currentGridState[0] && currentGridState[0][0]) : currentGridState[0];
      if (!gridContentCheck) return;

      const config = is3D ? cellular3DGridConfig : cellularGridConfig;
      const maxX = config.defaultWidth - 1;
      const maxY = config.defaultHeight - 1;
      const maxZ = is3D ? config.defaultDepth - 1 : 0;

      let newCursor = { ...cursor };

      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') newCursor.x = Math.max(0, cursor.x - 1);
      else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') newCursor.x = Math.min(maxX, cursor.x + 1);
      else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') newCursor.y = Math.max(0, cursor.y - 1);
      else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') newCursor.y = Math.min(maxY, cursor.y + 1);
      else if (is3D && (e.key.toLowerCase() === 'q')) newCursor.z = Math.max(0, cursor.z - 1);
      else if (is3D && (e.key.toLowerCase() === 'e')) newCursor.z = Math.min(maxZ, cursor.z + 1);

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (is3D) {
          setCellular3DGrid(grid => {
            const newGridDeepCopy = grid.map(layer => layer.map(row => [...row]));
            if(newGridDeepCopy[newCursor.z] && newGridDeepCopy[newCursor.z][newCursor.y] && typeof newGridDeepCopy[newCursor.z][newCursor.y][newCursor.x] !== 'undefined') {
                newGridDeepCopy[newCursor.z][newCursor.y][newCursor.x] = 1 - newGridDeepCopy[newCursor.z][newCursor.y][newCursor.x];
            }
            return newGridDeepCopy;
          });
        } else {
          setCellularGrid(grid => {
            const newGridDeepCopy = grid.map(row => [...row]);
            if(newGridDeepCopy[newCursor.y] && typeof newGridDeepCopy[newCursor.y][newCursor.x] !== 'undefined') {
                 newGridDeepCopy[newCursor.y][newCursor.x] = 1 - newGridDeepCopy[newCursor.y][newCursor.x];
            }
            return newGridDeepCopy;
          });
        }
      }
      setCursor(newCursor);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [editMode, selectedPattern, is3D, cellular3DGrid, cellularGrid, cursor, cellularGridConfig, cellular3DGridConfig]);

  const handleRuleChange = (ruleName, value) => {
    setRules(prev => ({ ...prev, [ruleName]: parseFloat(value) }));
  };

  const handlePatternChange = (e) => {
    const newPattern = e.target.value;
    setSelectedPattern(newPattern);
    if (newPattern !== 'cellular') {
        setIs3D(false);
        setEditMode(false);
    } else {
        setEditMode(false);
    }
  };

  const handleCellularRuleChange = (e) => {
    setCellularRules(e.target.value);
  }

  const toggle3D = () => {
    if (selectedPattern === 'cellular') {
      setIs3D(prevIs3D => !prevIs3D);
    }
  };

  const toggleEditMode = () => {
    if (selectedPattern === 'cellular') {
      setEditMode(prevEditMode => {
        const newEditModeState = !prevEditMode;
        if (newEditModeState) setIsRunning(false);
        return newEditModeState;
      });
    }
  };

  return (
    <div className="emergence-engine-container">
      <canvas ref={canvasRef} className="emergence-canvas"></canvas>

      <div className="controls-panel">
        <button onClick={() => setIsRunning(prev => !prev)} disabled={editMode && selectedPattern === 'cellular'}>
          {isRunning ? <Pause size={18} /> : <Play size={18} />} {isRunning ? 'Pause' : 'Play'}
        </button>
        <button onClick={resetSimulation}><RotateCcw size={18} /> Reset</button>

        <select value={selectedPattern} onChange={handlePatternChange}>
          <option value="flocking">Flocking</option>
          <option value="neurons">Neurons</option>
          <option value="economy">Economy</option>
          <option value="cellular">Cellular Automata</option>
        </select>

        {selectedPattern === 'cellular' && (
          <>
            <select value={cellularRules} onChange={handleCellularRuleChange}>
              <option value="conway">Conway's Life</option>
              <option value="maze">Maze (B3/S12345)</option>
              <option value="coral">Coral (B3/S45678)</option>
            </select>
            <button onClick={toggle3D}>{is3D ? <Grid size={18} /> : <Box size={18} />} {is3D ? '2D View' : '3D View'}</button>
            <button
                onClick={toggleEditMode}
                className={editMode ? 'edit-mode-active-button' : ''}
            >
              <Edit3 size={18} /> {editMode ? 'Exit Edit' : 'Edit Cells'}
            </button>
             <select value={simulationSpeed} onChange={(e) => setSimulationSpeed(Number(e.target.value))}>
                <option value={simulationSpeeds.slow}>Slow</option>
                <option value={simulationSpeeds.default}>Normal</option>
                <option value={simulationSpeeds.fast}>Fast</option>
            </select>
          </>
        )}
      </div>

      {selectedPattern !== 'cellular' && (
        <div className="rules-grid">
          {Object.entries(rules).map(([key, value]) => (
            <React.Fragment key={key}>
              <label htmlFor={key}><Settings2 size={14}/>{key}:</label>
              <input type="range" id={key} name={key} min="0" max="2" step="0.1" value={value} onChange={(e) => handleRuleChange(key, e.target.value)} />
              <span>{value.toFixed(1)}</span>
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="metrics-bar">
        <div className="metric-item" title="Coherence: Orderliness of movement or structure. High means uniform."><Target size={16} /> Coherence: {emergentMetrics.coherence.toFixed(2)}</div>
        <div className="metric-item" title="Diversity: Variety in positions or states. High means spread out or diverse patterns."><Waves size={16} /> Diversity: {emergentMetrics.diversity.toFixed(2)}</div>
        <div className="metric-item" title="Efficiency: System's ability to maintain state or activity. Varies by model."><Zap size={16} /> Efficiency: {emergentMetrics.efficiency.toFixed(2)}</div>
      </div>
      {editMode && selectedPattern === 'cellular' && (
        <div className="edit-mode-hint">
            Use Arrow keys (or W/A/S/D) to move cursor. {is3D ? "Q/E for depth. " : ""}Press Enter/Space to toggle cell state.
        </div>
      )}
    </div>
  );
};

export default EmergenceEngine;
