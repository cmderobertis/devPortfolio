import React, { useEffect, useRef } from 'react';
import useGameOfLife from '../hooks/useGameOfLife.js';
import GameCanvas from '../components/GameCanvas.jsx';
import { Button } from '../components/design-system';

const GameOfLife = () => {
  const containerRef = useRef(null);

  // Conditionally load 98.css only for this component
  useEffect(() => {
    // Create a style element with scoped 98.css rules
    const style = document.createElement('style');
    style.id = 'gameoflife-98css';
    
    // Import and scope the 98.css styles to this component only
    import('98.css/dist/98.css').then(() => {
      // The CSS is now loaded, but we need to scope it
      // This is a simplified approach - in production you'd want to process the CSS
      style.textContent = `
        .gameoflife-container button,
        .gameoflife-container .md3-button,
        .gameoflife-container input[type=reset],
        .gameoflife-container input[type=submit] {
          background: silver !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf !important;
          box-sizing: border-box;
          color: #222 !important;
          min-height: 23px;
          min-width: 75px;
          padding: 0 12px !important;
          font-family: "Pixelated MS Sans Serif", Arial !important;
          font-size: 11px !important;
          -webkit-font-smoothing: none;
        }
        .gameoflife-container button:not(:disabled):active,
        .gameoflife-container .md3-button:not(:disabled):active {
          box-shadow: inset -1px -1px #fff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px grey !important;
        }
        .gameoflife-container button:focus,
        .gameoflife-container .md3-button:focus {
          outline: 1px dotted #000 !important;
          outline-offset: -4px;
        }
        .gameoflife-container .md3-button__text {
          color: #222 !important;
        }
        .gameoflife-container .md3-button__state-layer {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    });

    // Cleanup function
    return () => {
      // Remove the scoped styles when component unmounts
      const existingStyle = document.getElementById('gameoflife-98css');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
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
    loadTestPattern,
    
    // Themes
    themes
  } = useGameOfLife(50);

  // Initialize the game when component mounts
  useEffect(() => {
    let isInitialLoad = true;
    
    const initializeGame = () => {
      if (!containerRef.current) return;
      
      const contentArea = containerRef.current.querySelector('.window-body');
      if (!contentArea) return;

      const canvasWidth = contentArea.clientWidth - 24;
      const canvasHeight = contentArea.clientHeight - 120;

      initializeGrids(canvasWidth, canvasHeight);
      
      // Only load test pattern on initial load, not on resize
      if (isInitialLoad) {
        loadTestPattern(); // Start with a glider pattern instead of random
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
  }, [initializeGrids, loadTestPattern, startGameLoop]);

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value, 10);
    setSpeed(newSpeed);
  };

  return (
    <div 
      ref={containerRef}
      className="gameoflife-container"
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
              <Button variant="outlined" size="small" onClick={togglePlayPause}>
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
            </div>
            <div className="status-bar-field">
              <Button variant="outlined" size="small" onClick={resetGrid}>
                Reset
              </Button>
            </div>
            <div className="status-bar-field">
              <Button variant="outlined" size="small" onClick={loadTestPattern}>
                Patterns
              </Button>
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