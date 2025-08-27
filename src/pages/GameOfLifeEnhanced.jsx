import React, { useRef } from 'react';
import useGameOfLife from '../hooks/useGameOfLife.js';
import GameCanvas from '../components/GameCanvas.jsx';
import { 
  Page, 
  Stack, 
  LayoutGrid as Grid, 
  GridItem,
  Button,
  Typography,
  Card,
  CardContent,
  ThemeVariantProvider
} from '../components/design-system';

/**
 * Enhanced Game of Life with the new design system
 * Demonstrates theme variant usage for retro-98 styling
 */
const GameOfLifeEnhanced = () => {
  const containerRef = useRef(null);
  
  // Game of Life logic from existing hook
  const {
    canvasRef,
    isRunning,
    generation,
    toggleGame,
    resetGame,
    randomizeGrid,
    stepForward,
    setSpeed,
    speed,
    gridSize,
    setGridSize,
    cellSize,
    setCellSize
  } = useGameOfLife();

  return (
    <ThemeVariantProvider variant="retro-98">
      <Page ref={containerRef} className="gameoflife-page">
        <Stack spacing="lg">
          <Typography variant="display-large" align="center">
            Conway's Game of Life
          </Typography>
          
          <Typography variant="body-large" align="center">
            Classic cellular automaton with Windows 98 styling
          </Typography>

          <Grid columns={12} spacing="md">
            {/* Game Canvas */}
            <GridItem span={12} spanMd={8}>
              <Card>
                <CardContent>
                  <GameCanvas ref={canvasRef} />
                </CardContent>
              </Card>
            </GridItem>

            {/* Controls */}
            <GridItem span={12} spanMd={4}>
              <Card>
                <CardContent>
                  <Stack spacing="md">
                    <Typography variant="title-medium">
                      Game Controls
                    </Typography>
                    
                    {/* Play/Pause Controls */}
                    <Stack spacing="sm">
                      <Button 
                        variant="filled" 
                        onClick={toggleGame}
                        fullWidth
                      >
                        {isRunning ? 'Pause' : 'Play'}
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        onClick={stepForward}
                        disabled={isRunning}
                        fullWidth
                      >
                        Step Forward
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        onClick={resetGame}
                        fullWidth
                      >
                        Reset
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        onClick={randomizeGrid}
                        fullWidth
                      >
                        Randomize
                      </Button>
                    </Stack>

                    {/* Game Statistics */}
                    <Stack spacing="sm">
                      <Typography variant="title-small">
                        Statistics
                      </Typography>
                      <Typography variant="body-medium">
                        Generation: {generation}
                      </Typography>
                      <Typography variant="body-medium">
                        Status: {isRunning ? 'Running' : 'Paused'}
                      </Typography>
                    </Stack>

                    {/* Settings */}
                    <Stack spacing="sm">
                      <Typography variant="title-small">
                        Settings
                      </Typography>
                      
                      {/* Speed Control */}
                      <div>
                        <Typography variant="body-small">
                          Speed: {speed}ms
                        </Typography>
                        <input
                          type="range"
                          min="50"
                          max="1000"
                          value={speed}
                          onChange={(e) => setSpeed(parseInt(e.target.value))}
                          style={{ width: '100%' }}
                        />
                      </div>
                      
                      {/* Grid Size Control */}
                      <div>
                        <Typography variant="body-small">
                          Grid Size: {gridSize}x{gridSize}
                        </Typography>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          value={gridSize}
                          onChange={(e) => setGridSize(parseInt(e.target.value))}
                          style={{ width: '100%' }}
                        />
                      </div>
                      
                      {/* Cell Size Control */}
                      <div>
                        <Typography variant="body-small">
                          Cell Size: {cellSize}px
                        </Typography>
                        <input
                          type="range"
                          min="2"
                          max="20"
                          value={cellSize}
                          onChange={(e) => setCellSize(parseInt(e.target.value))}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </GridItem>
          </Grid>

          {/* Instructions */}
          <Card>
            <CardContent>
              <Stack spacing="sm">
                <Typography variant="title-medium">
                  How to Play
                </Typography>
                <Typography variant="body-medium">
                  Conway's Game of Life is a cellular automaton where cells live, die, or are born based on these rules:
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body-small">
                      Any live cell with fewer than two live neighbors dies (underpopulation)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body-small">
                      Any live cell with two or three live neighbors lives on to the next generation
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body-small">
                      Any live cell with more than three live neighbors dies (overpopulation)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body-small">
                      Any dead cell with exactly three live neighbors becomes a live cell (reproduction)
                    </Typography>
                  </li>
                </ul>
                <Typography variant="body-small">
                  Click on the grid to toggle cells, then press Play to watch the simulation evolve!
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Page>
    </ThemeVariantProvider>
  );
};

export default GameOfLifeEnhanced;