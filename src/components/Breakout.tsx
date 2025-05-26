import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_SIZE = 10;
const BLOCK_WIDTH = 75;
const BLOCK_HEIGHT = 20;
const BLOCK_PADDING = 2;

// 10 Beautiful Color Schemes
const COLOR_SCHEMES = [
  {
    name: "Sunset Gradient",
    paddle: "#FF6B6B",
    ball: "#FFE66D",
    blocks: ["#FF6B6B", "#FF8E53", "#FFB04D", "#FFD23F", "#FFE66D"],
    background: "#2C1810"
  },
  {
    name: "Ocean Depths",
    paddle: "#00B4D8",
    ball: "#90E0EF",
    blocks: ["#03045E", "#0077B6", "#00B4D8", "#48CAE4", "#90E0EF"],
    background: "#000814"
  },
  {
    name: "Forest Canopy",
    paddle: "#52B788",
    ball: "#D8F3DC",
    blocks: ["#1B4332", "#2D6A4F", "#40916C", "#52B788", "#74C69D"],
    background: "#081C15"
  },
  {
    name: "Aurora Borealis",
    paddle: "#7209B7",
    ball: "#F72585",
    blocks: ["#7209B7", "#B5179E", "#F72585", "#4CC9F0", "#4361EE"],
    background: "#0A0E27"
  },
  {
    name: "Desert Dunes",
    paddle: "#F4A261",
    ball: "#F4E285",
    blocks: ["#264653", "#E76F51", "#F4A261", "#E9C46A", "#F4E285"],
    background: "#1A1A1A"
  },
  {
    name: "Cherry Blossom",
    paddle: "#F8BBD0",
    ball: "#FFFFFF",
    blocks: ["#880E4F", "#C2185B", "#E91E63", "#F06292", "#F8BBD0"],
    background: "#1A0E1A"
  },
  {
    name: "Cosmic Nebula",
    paddle: "#B388FF",
    ball: "#FFEB3B",
    blocks: ["#4A148C", "#6A1B9A", "#8E24AA", "#AB47BC", "#B388FF"],
    background: "#0A0A0F"
  },
  {
    name: "Tropical Paradise",
    paddle: "#00BFA5",
    ball: "#FFD600",
    blocks: ["#00796B", "#00897B", "#009688", "#26A69A", "#00BFA5"],
    background: "#0D1F22"
  },
  {
    name: "Arctic Ice",
    paddle: "#B3E5FC",
    ball: "#FFFFFF",
    blocks: ["#0277BD", "#0288D1", "#039BE5", "#29B6F6", "#B3E5FC"],
    background: "#0A1929"
  },
  {
    name: "Autumn Leaves",
    paddle: "#FF7043",
    ball: "#FFC107",
    blocks: ["#BF360C", "#D84315", "#E64A19", "#F4511E", "#FF7043"],
    background: "#1A0F0A"
  }
];

const BreakoutGame = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const [gameState, setGameState] = useState('menu');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [colorSchemeIndex, setColorSchemeIndex] = useState(0);
  const [colorMode, setColorMode] = useState('manual'); // 'manual' or 'rotate'
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [ballPos, setBallPos] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100 });
  const [ballVel, setBallVel] = useState({ x: 4, y: -4 });
  const [paddleX, setPaddleX] = useState(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const currentScheme = COLOR_SCHEMES[colorSchemeIndex];

  // Generate blocks based on level
  interface Block {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    hits: number;
    type: 'normal' | 'special';
  }

  type GenerateBlocks = (levelNum: number) => Block[];

  const generateBlocks: GenerateBlocks = useCallback((levelNum: number): Block[] => {
    const newBlocks: Block[] = [];
    const rows: number = Math.min(5 + Math.floor(levelNum / 5), 12);
    const cols: number = Math.floor(GAME_WIDTH / (BLOCK_WIDTH + BLOCK_PADDING));
    
    // Chaos factor increases with level
    const chaosFactor: number = Math.min(levelNum / 40, 1);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Procedural pattern generation
        let shouldPlace: boolean = true;
        
        if (levelNum <= 5) {
          // Simple patterns
          shouldPlace = true;
        } else if (levelNum <= 15) {
          // Introduce gaps
          shouldPlace = Math.random() > 0.2;
        } else if (levelNum <= 25) {
          // Chaotic patterns
          const pattern = (row + col) % 3;
          shouldPlace = Math.random() > 0.3 || pattern === 0;
        } else if (levelNum <= 35) {
          // Very chaotic
          shouldPlace = Math.random() > 0.4;
          // Add wave pattern
          if (Math.sin(col * 0.5) > Math.cos(row * 0.3)) {
            shouldPlace = !shouldPlace;
          }
        } else {
          // Maximum chaos
          shouldPlace = Math.random() > 0.5;
          // Spiral pattern
          const centerX = cols / 2;
          const centerY = rows / 2;
          const dist = Math.sqrt(Math.pow(col - centerX, 2) + Math.pow(row - centerY, 2));
          if (dist % 3 < 1) shouldPlace = !shouldPlace;
        }
        
        if (shouldPlace) {
          const blockType: 'normal' | 'special' = Math.random() < (0.1 * chaosFactor) ? 'special' : 'normal';
          const hits: number = blockType === 'special' ? 2 : 1;
          
          newBlocks.push({
            x: col * (BLOCK_WIDTH + BLOCK_PADDING) + BLOCK_PADDING,
            y: row * (BLOCK_HEIGHT + BLOCK_PADDING) + 50,
            width: BLOCK_WIDTH,
            height: BLOCK_HEIGHT,
            color: currentScheme.blocks[row % currentScheme.blocks.length],
            hits: hits,
            type: blockType
          });
        }
      }
    }
    
    return newBlocks;
  }, [currentScheme]);

  // Initialize level
  useEffect(() => {
    if (gameState === 'playing') {
      const newBlocks = generateBlocks(level);
      setBlocks(newBlocks);
      setBallPos({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100 });
      setBallVel({ x: 4 + level * 0.1, y: -(4 + level * 0.1) });
      
      if (colorMode === 'rotate') {
        setColorSchemeIndex((level - 1) % COLOR_SCHEMES.length);
      }
    }
  }, [level, gameState, generateBlocks, colorMode]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const gameLoop = () => {
      setBallPos(prev => {
        let newX = prev.x + ballVel.x;
        let newY = prev.y + ballVel.y;
        let newVelX = ballVel.x;
        let newVelY = ballVel.y;

        // Wall collisions
        if (newX <= 0 || newX >= GAME_WIDTH - BALL_SIZE) {
          newVelX = -newVelX;
          newX = newX <= 0 ? 0 : GAME_WIDTH - BALL_SIZE;
        }
        if (newY <= 0) {
          newVelY = -newVelY;
          newY = 0;
        }

        // Paddle collision
        if (
          newY + BALL_SIZE >= GAME_HEIGHT - PADDLE_HEIGHT - 20 &&
          newY + BALL_SIZE <= GAME_HEIGHT - 10 &&
          newX + BALL_SIZE >= paddleX &&
          newX <= paddleX + PADDLE_WIDTH
        ) {
          newVelY = -Math.abs(newVelY);
          const hitPos = (newX - paddleX) / PADDLE_WIDTH;
          newVelX = 8 * (hitPos - 0.5);
        }

        // Bottom boundary (lose life)
        if (newY >= GAME_HEIGHT) {
          setLives(prev => prev - 1);
          setBallPos({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100 });
          setBallVel({ x: 4 + level * 0.1, y: -(4 + level * 0.1) });
          return { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100 };
        }

        setBallVel({ x: newVelX, y: newVelY });
        return { x: newX, y: newY };
      });

      // Block collisions
      setBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        let blocksHit = 0;

        for (let i = newBlocks.length - 1; i >= 0; i--) {
          const block = newBlocks[i];
          if (
            ballPos.x + BALL_SIZE >= block.x &&
            ballPos.x <= block.x + block.width &&
            ballPos.y + BALL_SIZE >= block.y &&
            ballPos.y <= block.y + block.height
          ) {
            block.hits--;
            if (block.hits <= 0) {
              newBlocks.splice(i, 1);
              setScore(prev => prev + (block.type === 'special' ? 20 : 10));
            }
            blocksHit++;
            
            setBallVel(prev => ({ x: prev.x, y: -prev.y }));
          }
        }

        if (newBlocks.length === 0) {
          setLevel(prev => prev + 1);
          setGameState('levelComplete');
        }

        return newBlocks;
      });
    };

    gameLoopRef.current = setInterval(gameLoop, 16);
    return () => {
      if (gameLoopRef.current !== null) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, isPaused, ballVel, paddleX, level, ballPos]);

  // Check for game over
  useEffect(() => {
    if (lives <= 0) {
      setGameState('gameOver');
    }
  }, [lives]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;
      
      if (e.key === 'ArrowLeft') {
        setPaddleX(prev => Math.max(0, prev - 20));
      } else if (e.key === 'ArrowRight') {
        setPaddleX(prev => Math.min(GAME_WIDTH - PADDLE_WIDTH, prev + 20));
      } else if (e.key === ' ') {
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Handle mouse/touch movement
  const handleMouseMove = (e) => {
    if (gameState !== 'playing') return;
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setPaddleX(Math.max(0, Math.min(GAME_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2)));
  };

  const handleTouchMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    setPaddleX(Math.max(0, Math.min(GAME_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2)));
    setPaddleX(Math.max(0, Math.min(GAME_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2)));
  };

  const startGame = () => {
    setGameState('playing');
    setLevel(1);
    setScore(0);
    setLives(3);
    setIsPaused(false);
  };

  const continueToNextLevel = () => {
    setGameState('playing');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ backgroundColor: currentScheme.background }}>
      {gameState === 'menu' && (
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold mb-8" style={{ color: currentScheme.ball }}>
            Chaotic Breakout
          </h1>
          
          <div className="space-y-4">
            <h2 className="text-2xl" style={{ color: currentScheme.paddle }}>Color Scheme</h2>
            <div className="flex flex-col items-center space-y-2">
              <select 
                value={colorSchemeIndex} 
                onChange={(e) => setColorSchemeIndex(Number(e.target.value))}
                className="px-4 py-2 rounded bg-white/20 text-white"
                style={{ backgroundColor: currentScheme.blocks[0] }}
              >
                {COLOR_SCHEMES.map((scheme, index) => (
                  <option key={index} value={index}>{scheme.name}</option>
                ))}
              </select>
              
              <label className="flex items-center space-x-2" style={{ color: currentScheme.paddle }}>
                <input 
                  type="checkbox" 
                  checked={colorMode === 'rotate'} 
                  onChange={(e) => setColorMode(e.target.checked ? 'rotate' : 'manual')}
                  className="w-4 h-4"
                />
                <span>Rotate colors each level</span>
              </label>
            </div>
          </div>
          
          <button 
            onClick={startGame}
            className="px-8 py-4 text-2xl font-bold rounded-lg transition-transform hover:scale-105"
            style={{ backgroundColor: currentScheme.paddle, color: currentScheme.background }}
          >
            Start Game
          </button>
          
          <div className="text-sm mt-4" style={{ color: currentScheme.blocks[2] }}>
            Use arrow keys, mouse, or touch to move the paddle
          </div>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'levelComplete') && (
        <div className="relative">
          <div className="flex justify-between items-center mb-4 w-full">
            <div style={{ color: currentScheme.paddle }}>
              Level: {level}/40
            </div>
            <div style={{ color: currentScheme.paddle }}>
              Score: {score}
            </div>
            <div style={{ color: currentScheme.paddle }}>
              Lives: {'❤️'.repeat(lives)}
            </div>
          </div>

          <div 
            ref={canvasRef}
            className="relative border-2 cursor-pointer"
            style={{ 
              width: GAME_WIDTH, 
              height: GAME_HEIGHT, 
              borderColor: currentScheme.paddle,
              backgroundColor: currentScheme.background 
            }}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            {/* Blocks */}
            {blocks.map((block, index) => (
              <div
                key={index}
                className="absolute transition-opacity duration-300"
                style={{
                  left: block.x,
                  top: block.y,
                  width: block.width,
                  height: block.height,
                  backgroundColor: block.color,
                  opacity: block.hits > 1 ? 0.6 : 1,
                  border: block.type === 'special' ? '2px solid ' + currentScheme.ball : 'none'
                }}
              />
            ))}

            {/* Ball */}
            <div
              className="absolute rounded-full"
              style={{
                left: ballPos.x,
                top: ballPos.y,
                width: BALL_SIZE,
                height: BALL_SIZE,
                backgroundColor: currentScheme.ball,
                boxShadow: `0 0 10px ${currentScheme.ball}`
              }}
            />

            {/* Paddle */}
            <div
              className="absolute rounded"
              style={{
                left: paddleX,
                bottom: 20,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT,
                backgroundColor: currentScheme.paddle,
                boxShadow: `0 0 20px ${currentScheme.paddle}`
              }}
            />

            {/* Pause overlay */}
            {isPaused && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-4xl font-bold" style={{ color: currentScheme.ball }}>
                  PAUSED
                </div>
              </div>
            )}

            {/* Level complete overlay */}
            {gameState === 'levelComplete' && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center space-y-4">
                <div className="text-4xl font-bold" style={{ color: currentScheme.ball }}>
                  Level {level - 1} Complete!
                </div>
                <button
                  onClick={continueToNextLevel}
                  className="px-6 py-3 text-xl font-bold rounded-lg"
                  style={{ backgroundColor: currentScheme.paddle, color: currentScheme.background }}
                >
                  Next Level
                </button>
              </div>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex justify-center items-center space-x-4 mt-4">
            <button
              onMouseDown={() => setPaddleX(prev => Math.max(0, prev - 30))}
              onTouchStart={() => setPaddleX(prev => Math.max(0, prev - 30))}
              className="p-3 rounded-lg"
              style={{ backgroundColor: currentScheme.paddle, color: currentScheme.background }}
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={() => setIsPaused(prev => !prev)}
              className="p-3 rounded-lg"
              style={{ backgroundColor: currentScheme.paddle, color: currentScheme.background }}
            >
              {isPaused ? <Play size={24} /> : <Pause size={24} />}
            </button>
            
            <button
              onMouseDown={() => setPaddleX(prev => Math.min(GAME_WIDTH - PADDLE_WIDTH, prev + 30))}
              onTouchStart={() => setPaddleX(prev => Math.min(GAME_WIDTH - PADDLE_WIDTH, prev + 30))}
              className="p-3 rounded-lg"
              style={{ backgroundColor: currentScheme.paddle, color: currentScheme.background }}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold" style={{ color: currentScheme.ball }}>
            Game Over
          </h1>
          <div className="text-3xl" style={{ color: currentScheme.paddle }}>
            Final Score: {score}
          </div>
          <div className="text-2xl" style={{ color: currentScheme.blocks[2] }}>
            Reached Level: {level}
          </div>
          <button
            onClick={() => setGameState('menu')}
            className="px-8 py-4 text-2xl font-bold rounded-lg flex items-center space-x-2"
            style={{ backgroundColor: currentScheme.paddle, color: currentScheme.background }}
          >
            <RotateCcw size={24} />
            <span>Play Again</span>
          </button>
        </div>
      )}

      {level === 41 && (
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold animate-pulse" style={{ color: currentScheme.ball }}>
            🎉 Victory! 🎉
          </h1>
          <div className="text-3xl" style={{ color: currentScheme.paddle }}>
            You conquered all 40 levels!
          </div>
          <div className="text-2xl" style={{ color: currentScheme.blocks[2] }}>
            Final Score: {score}
          </div>
          <button
            onClick={() => setGameState('menu')}
            className="px-8 py-4 text-2xl font-bold rounded-lg"
            style={{ backgroundColor: currentScheme.paddle, color: currentScheme.background }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default BreakoutGame;