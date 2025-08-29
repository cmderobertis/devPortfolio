import React, { useEffect, useRef } from 'react';
import useGameOfLife from '../hooks/useGameOfLife.js';
import GameCanvas from '../components/GameCanvas.jsx';
import { Button, Container, Typography, Checkbox } from '../design-system';
import InteractivePageWrapper from '../components/InteractivePageWrapper';
import '../components/InteractivePageWrapper.css';
import '../styles/GameOfLife.css';

const GameOfLife = () => {
  const containerRef = useRef(null);

  const {
    // State
    grid,
    numCellsX,
    numCellsY,
    cellSize,
    isPlaying,
    generationsPerSecond,
    currentTheme,
    animateTransitions,
    
    // Actions
    initializeGrids,
    randomizeGrid,
    toggleCell,
    togglePlayPause,
    resetGrid,
    setSpeed,
    setAnimate,
    startGameLoop
  } = useGameOfLife(50);

  // Initialize the game when component mounts
  useEffect(() => {
    let isInitialLoad = true;
    
    const initializeGame = () => {
      if (!containerRef.current) return;
      
      const contentArea = containerRef.current.querySelector('.gameoflife-canvas-container');
      if (!contentArea) return;

      const canvasWidth = contentArea.clientWidth - 24;
      const canvasHeight = contentArea.clientHeight - 120;

      initializeGrids(canvasWidth, canvasHeight);
      
      // Only randomize on initial load, not on resize
      if (isInitialLoad) {
        randomizeGrid(); // Start with random live cells
        isInitialLoad = false;
      }
      
      startGameLoop();
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
  }, [initializeGrids, randomizeGrid, startGameLoop]);


  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value, 10);
    setSpeed(newSpeed);
  };

  const handleAnimateChange = (checked) => {
    setAnimate(checked);
  };

  return (
    <InteractivePageWrapper>
      <Container className="gameoflife-container">
        <div 
          ref={containerRef}
          className="gameoflife-main-content"
        >
          <div className="gameoflife-header">
            <Typography variant="display-small">
              Conway's Game of Life
            </Typography>
          </div>
          
          <div className="gameoflife-content-layout">
            <div className="gameoflife-controls">
              <div className="gameoflife-control-group">
                <Button variant="filled" onClick={togglePlayPause}>
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button variant="outlined" onClick={resetGrid}>
                  Reset
                </Button>
                <Button variant="outlined" onClick={randomizeGrid}>
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
                  />
                </div>
              </div>
              
              <div className="gameoflife-control-group">
                <Checkbox
                  checked={animateTransitions}
                  onChange={handleAnimateChange}
                  label="Animate"
                />
              </div>
            </div>
            
            <div className="gameoflife-canvas-container">
              <GameCanvas
                grid={grid}
                numCellsX={numCellsX}
                numCellsY={numCellsY}
                cellSize={cellSize}
                theme={currentTheme}
                onCellClick={toggleCell}
              />
            </div>
          </div>
        </div>
      </Container>
    </InteractivePageWrapper>
  );
};

export default GameOfLife;