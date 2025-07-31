import React, { useEffect, useRef } from 'react';
import useGameOfLife from '../hooks/useGameOfLife.js';
import GameCanvas from '../components/GameCanvas.jsx';
import '98.css/dist/98.css';

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
    
    // Actions
    initializeGrids,
    randomizeGrid,
    toggleCell,
    togglePlayPause,
    resetGrid,
    setSpeed,
    setTheme,
    startGameLoop,
    
    // Themes
    themes
  } = useGameOfLife(50);

  // Initialize the game when component mounts
  useEffect(() => {
    const initializeGame = () => {
      if (!containerRef.current) return;
      
      const contentArea = containerRef.current.querySelector('.window-body');
      if (!contentArea) return;

      const canvasWidth = contentArea.clientWidth - 24;
      const canvasHeight = contentArea.clientHeight - 120;

      initializeGrids(canvasWidth, canvasHeight);
      randomizeGrid();
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

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleSpeedChange = (e) => {
    setSpeed(parseInt(e.target.value, 10));
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#008080',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div className="window" style={{ 
        width: '90vw', 
        height: '90vh',
        maxWidth: '1200px',
        maxHeight: '800px'
      }}>
        <div className="title-bar">
          <div className="title-bar-text">Conway's Game of Life</div>
          <div className="title-bar-controls">
            <button className="title-bar-control" aria-label="Close">&#x2715;</button>
          </div>
        </div>
        <div className="window-body" style={{ 
          height: 'calc(100% - 30px)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: '#fff',
            border: '2px inset',
            margin: '10px',
            overflow: 'hidden'
          }}>
            <GameCanvas
              grid={grid}
              numCellsX={numCellsX}
              numCellsY={numCellsY}
              cellSize={cellSize}
              theme={currentTheme}
              onCellClick={toggleCell}
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>
          
          <div className="status-bar">
            <div className="status-bar-field">
              <button className="btn" onClick={togglePlayPause}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
            <div className="status-bar-field">
              <button className="btn" onClick={resetGrid}>
                Reset
              </button>
            </div>
            <div className="status-bar-field">
              <select value={Object.keys(themes).find(key => themes[key] === currentTheme) || 'minesweeper'} onChange={handleThemeChange}>
                <option value="minesweeper">Minesweeper</option>
                <option value="aperture">Aperture</option>
                <option value="lego">LEGO</option>
                <option value="pixel">Pixel Art</option>
                <option value="neon">Neon</option>
              </select>
            </div>
          </div>
          
          <div className="status-bar">
            <div className="status-bar-field" style={{ width: '100%' }}>
              <label style={{ fontSize: '12px', marginRight: '10px' }}>
                Speed: {generationsPerSecond} GPS
              </label>
              <input
                type="range"
                min="1"
                max="60"
                value={generationsPerSecond}
                onChange={handleSpeedChange}
                style={{ width: '200px' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOfLife;