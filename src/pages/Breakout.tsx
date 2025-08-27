import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import InteractivePageWrapper from '../components/InteractivePageWrapper';
import '../components/InteractivePageWrapper.css';

// Dynamic sizing based on viewport with no overflow
const useGameDimensions = () => {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  
  useEffect(() => {
    const updateDimensions = () => {
      // Calculate exact available space
      const navbarHeight = 80; // Blue header space
      const verticalPadding = 80; // Top/bottom margins
      const horizontalPadding = 40; // Left/right margins
      const uiElementsHeight = 120; // Score bar + controls height
      
      const availableWidth = window.innerWidth - horizontalPadding;
      const availableHeight = window.innerHeight - navbarHeight - verticalPadding - uiElementsHeight;
      
      // Classic arcade aspect ratio with absolute constraint fitting
      const aspectRatio = 4/3;
      let gameWidth = availableWidth;
      let gameHeight = gameWidth / aspectRatio;
      
      // If height exceeds available space, constrain by height instead
      if (gameHeight > availableHeight) {
        gameHeight = availableHeight;
        gameWidth = gameHeight * aspectRatio;
      }
      
      // Ensure playable minimums but never exceed container
      gameWidth = Math.max(400, Math.min(gameWidth, availableWidth));
      gameHeight = Math.max(300, Math.min(gameHeight, availableHeight));
      
      setDimensions({ width: gameWidth, height: gameHeight });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  return dimensions;
};

const PADDLE_WIDTH_RATIO = 0.125; // 12.5% of game width
const PADDLE_HEIGHT = 15;
const BALL_SIZE_RATIO = 0.0125; // 1.25% of game width
const BLOCK_WIDTH_RATIO = 0.09375; // ~9.4% of game width
const BLOCK_HEIGHT = 20;
const BLOCK_PADDING = 2;
const POWERUP_SIZE_RATIO = 0.025; // 2.5% of game width
const POWERUP_FALL_SPEED = 2;

const COLOR_SCHEMES = [
  {
    name: "Sunset Gradient",
    paddle: "#FF6B6B",
    ball: "#FFE66D",
    blocks: ["#FF6B6B", "#FF8E53", "#FFB04D", "#FFD23F", "#FFE66D"],
    background: "#2C1810",
    powerups: "#FF4081"
  },
  {
    name: "Ocean Depths",
    paddle: "#00B4D8",
    ball: "#90E0EF",
    blocks: ["#03045E", "#0077B6", "#00B4D8", "#48CAE4", "#90E0EF"],
    background: "#000814",
    powerups: "#00E676"
  },
  {
    name: "Forest Canopy",
    paddle: "#52B788",
    ball: "#D8F3DC",
    blocks: ["#1B4332", "#2D6A4F", "#40916C", "#52B788", "#74C69D"],
    background: "#081C15",
    powerups: "#FFEB3B"
  }
];

const POWERUP_TYPES = [
  {
    id: 'expand',
    name: 'Expand Paddle',
    symbol: '◄►',
    color: '#4CAF50',
    probability: 0.3,
    effect: 'Increases paddle width by 50% for 10 seconds'
  },
  {
    id: 'multiball',
    name: 'Multi Ball',
    symbol: '●●●',
    color: '#2196F3',
    probability: 0.15,
    effect: 'Spawns 2 additional balls'
  },
  {
    id: 'slow',
    name: 'Slow Ball',
    symbol: '◐',
    color: '#FF9800',
    probability: 0.25,
    effect: 'Reduces ball speed by 40% for 8 seconds'
  },
  {
    id: 'laser',
    name: 'Laser Paddle',
    symbol: '▲▲▲',
    color: '#F44336',
    probability: 0.2,
    effect: 'Paddle shoots lasers for 6 seconds'
  },
  {
    id: 'score',
    name: 'Score Boost',
    symbol: '★',
    color: '#9C27B0',
    probability: 0.1,
    effect: 'Next 5 blocks worth 3x points'
  }
];

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  hits: number;
  type: 'normal' | 'special';
}

interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: typeof POWERUP_TYPES[0];
  rotation: number;
}

interface Ball {
  x: number;
  y: number;
  velX: number;
  velY: number;
  id: string;
}

interface Laser {
  x: number;
  y: number;
  speed: number;
  id: string;
}

const BreakoutGame = () => {
  const { width: GAME_WIDTH, height: GAME_HEIGHT } = useGameDimensions();
  const PADDLE_WIDTH = GAME_WIDTH * PADDLE_WIDTH_RATIO;
  const BALL_SIZE = GAME_WIDTH * BALL_SIZE_RATIO;
  const BLOCK_WIDTH = GAME_WIDTH * BLOCK_WIDTH_RATIO;
  const POWERUP_SIZE = GAME_WIDTH * POWERUP_SIZE_RATIO;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<{
    balls: Ball[];
    paddleX: number;
    paddleWidth: number;
    blocks: Block[];
    powerups: PowerUp[];
    lasers: Laser[];
    score: number;
    lives: number;
    level: number;
    gameState: string;
    isPaused: boolean;
    keysPressed: Set<string>;
    activePowerups: {[key: string]: number};
    scoreMultiplier: number;
    scoreMultiplierBlocks: number;
  }>({
    balls: [{x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, velX: 4, velY: -4, id: 'main'}],
    paddleX: GAME_WIDTH / 2 - PADDLE_WIDTH / 2,
    paddleWidth: PADDLE_WIDTH,
    blocks: [],
    powerups: [],
    lasers: [],
    score: 0,
    lives: 3,
    level: 1,
    gameState: 'menu',
    isPaused: false,
    keysPressed: new Set(),
    activePowerups: {},
    scoreMultiplier: 1,
    scoreMultiplierBlocks: 0
  });
  
  const animationFrameRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState('menu');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [colorSchemeIndex, setColorSchemeIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentScheme = COLOR_SCHEMES[colorSchemeIndex];

  const generateBlocks = useCallback((levelNum: number): Block[] => {
    const newBlocks: Block[] = [];
    const rows = Math.min(5 + Math.floor(levelNum / 3), 10);
    const cols = Math.floor(GAME_WIDTH / (BLOCK_WIDTH + BLOCK_PADDING));
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const blockType: 'normal' | 'special' = Math.random() < 0.15 ? 'special' : 'normal';
        const hits = blockType === 'special' ? 2 : 1;
        
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
    
    return newBlocks;
  }, [currentScheme]);

  const spawnPowerup = (x: number, y: number) => {
    if (Math.random() < 0.4) { // 40% chance
      const availableTypes = POWERUP_TYPES.filter(type => Math.random() < type.probability);
      if (availableTypes.length > 0) {
        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        gameStateRef.current.powerups.push({
          id: Math.random().toString(36),
          x: x + BLOCK_WIDTH / 2 - POWERUP_SIZE / 2,
          y: y + BLOCK_HEIGHT,
          type: type,
          rotation: 0
        });
      }
    }
  };

  const activatePowerup = (powerup: PowerUp) => {
    const gameState = gameStateRef.current;
    
    switch (powerup.type.id) {
      case 'expand':
        gameState.paddleWidth = PADDLE_WIDTH * 1.5;
        gameState.activePowerups.expand = Date.now() + 10000;
        break;
        
      case 'multiball':
        const mainBall = gameState.balls[0];
        gameState.balls.push(
          {x: mainBall.x, y: mainBall.y, velX: mainBall.velX + 2, velY: mainBall.velY, id: Math.random().toString(36)},
          {x: mainBall.x, y: mainBall.y, velX: mainBall.velX - 2, velY: mainBall.velY, id: Math.random().toString(36)}
        );
        break;
        
      case 'slow':
        gameState.balls.forEach(ball => {
          ball.velX *= 0.6;
          ball.velY *= 0.6;
        });
        gameState.activePowerups.slow = Date.now() + 8000;
        break;
        
      case 'laser':
        gameState.activePowerups.laser = Date.now() + 6000;
        break;
        
      case 'score':
        gameState.scoreMultiplier = 3;
        gameState.scoreMultiplierBlocks = 5;
        break;
    }
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameState = gameStateRef.current;

    // Clear canvas
    ctx.fillStyle = currentScheme.background;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw borders
    const borderWidth = 4;
    ctx.shadowColor = currentScheme.paddle;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = currentScheme.paddle;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth/2, borderWidth/2, GAME_WIDTH - borderWidth, GAME_HEIGHT - borderWidth);
    
    ctx.shadowBlur = 0;
    ctx.strokeStyle = currentScheme.ball;
    ctx.lineWidth = 1;
    ctx.strokeRect(borderWidth + 1, borderWidth + 1, GAME_WIDTH - 2*(borderWidth + 1), GAME_HEIGHT - 2*(borderWidth + 1));
    ctx.shadowBlur = 0;

    // Draw blocks
    gameState.blocks.forEach(block => {
      ctx.fillStyle = block.color;
      ctx.fillRect(block.x, block.y, block.width, block.height);
      
      if (block.type === 'normal') {
        const gradient = ctx.createLinearGradient(block.x, block.y, block.x, block.y + block.height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(block.x, block.y, block.width, block.height / 2);
      }
      
      if (block.type === 'special') {
        ctx.strokeStyle = currentScheme.ball;
        ctx.lineWidth = 2;
        ctx.strokeRect(block.x, block.y, block.width, block.height);
      }
      
      if (block.hits > 1) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(block.x, block.y, block.width, block.height);
      }
    });

    // Draw powerups with rotation and glow
    gameState.powerups.forEach(powerup => {
      ctx.save();
      ctx.translate(powerup.x + POWERUP_SIZE/2, powerup.y + POWERUP_SIZE/2);
      ctx.rotate(powerup.rotation);
      
      // Glow effect
      ctx.shadowColor = powerup.type.color;
      ctx.shadowBlur = 10;
      
      // Background circle
      ctx.fillStyle = powerup.type.color;
      ctx.beginPath();
      ctx.arc(0, 0, POWERUP_SIZE/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Symbol
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(powerup.type.symbol, 0, 0);
      
      ctx.restore();
    });

    // Draw lasers
    gameState.lasers.forEach(laser => {
      ctx.fillStyle = '#FF4444';
      ctx.shadowColor = '#FF4444';
      ctx.shadowBlur = 5;
      ctx.fillRect(laser.x - 2, laser.y, 4, 15);
      ctx.shadowBlur = 0;
    });

    // Draw balls
    gameState.balls.forEach(ball => {
      const ballCenterX = ball.x + BALL_SIZE / 2;
      const ballCenterY = ball.y + BALL_SIZE / 2;
      
      // Glow
      const glowGradient = ctx.createRadialGradient(
        ballCenterX, ballCenterY, 0,
        ballCenterX, ballCenterY, BALL_SIZE * 2
      );
      glowGradient.addColorStop(0, currentScheme.ball + '80');
      glowGradient.addColorStop(1, currentScheme.ball + '00');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(ball.x - BALL_SIZE, ball.y - BALL_SIZE, BALL_SIZE * 3, BALL_SIZE * 3);
      
      // Ball
      ctx.fillStyle = currentScheme.ball;
      ctx.beginPath();
      ctx.arc(ballCenterX, ballCenterY, BALL_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(ballCenterX - 1, ballCenterY - 1, BALL_SIZE / 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw paddle
    const paddleY = GAME_HEIGHT - PADDLE_HEIGHT - 20;
    const paddleCenterX = gameState.paddleX + gameState.paddleWidth / 2;
    
    // Paddle glow (enhanced if laser active)
    const paddleGlow = ctx.createRadialGradient(
      paddleCenterX, paddleY + PADDLE_HEIGHT / 2, 0,
      paddleCenterX, paddleY + PADDLE_HEIGHT / 2, gameState.paddleWidth
    );
    const glowColor = gameState.activePowerups.laser ? '#FF4444' : currentScheme.paddle;
    paddleGlow.addColorStop(0, glowColor + '60');
    paddleGlow.addColorStop(1, glowColor + '00');
    ctx.fillStyle = paddleGlow;
    ctx.fillRect(gameState.paddleX - 20, paddleY - 10, gameState.paddleWidth + 40, PADDLE_HEIGHT + 20);
    
    // Paddle
    ctx.fillStyle = gameState.activePowerups.laser ? '#FF6666' : currentScheme.paddle;
    ctx.fillRect(gameState.paddleX, paddleY, gameState.paddleWidth, PADDLE_HEIGHT);
    
    // Paddle highlight
    const paddleGradient = ctx.createLinearGradient(gameState.paddleX, paddleY, gameState.paddleX, paddleY + PADDLE_HEIGHT);
    paddleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    paddleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = paddleGradient;
    ctx.fillRect(gameState.paddleX, paddleY, gameState.paddleWidth, PADDLE_HEIGHT / 2);

    // Draw active powerup indicators
    let indicatorY = 10;
    Object.entries(gameState.activePowerups).forEach(([type, endTime]) => {
      if (typeof endTime === 'number' && endTime > Date.now()) {
        const timeLeft = Math.ceil((endTime - Date.now()) / 1000);
        const powerupType = POWERUP_TYPES.find(p => p.id === type);
        if (powerupType) {
          ctx.fillStyle = powerupType.color;
          ctx.fillRect(10, indicatorY, 30, 20);
          ctx.fillStyle = 'white';
          ctx.font = '12px Arial';
          ctx.fillText(powerupType.symbol, 15, indicatorY + 15);
          ctx.fillText(`${timeLeft}s`, 45, indicatorY + 15);
          indicatorY += 25;
        }
      }
    });

    // Score multiplier indicator
    if (gameState.scoreMultiplier > 1) {
      ctx.fillStyle = '#9C27B0';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`${gameState.scoreMultiplier}x SCORE! (${gameState.scoreMultiplierBlocks} blocks left)`, GAME_WIDTH - 200, 30);
    }

    // Pause/level complete overlays
    if (gameState.isPaused && gameState.gameState === 'playing') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.fillStyle = currentScheme.ball;
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }

    if (gameState.gameState === 'levelComplete') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.fillStyle = currentScheme.ball;
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Level ${gameState.level - 1} Complete!`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
    }
  }, [currentScheme]);

  const gameLoop = useCallback(() => {
    const gameState = gameStateRef.current;
    
    if (gameState.gameState !== 'playing' || gameState.isPaused) {
      draw();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const now = Date.now();

    // Handle powerup expiration
    Object.keys(gameState.activePowerups).forEach(type => {
      if (gameState.activePowerups[type] < now) {
        delete gameState.activePowerups[type];
        if (type === 'expand') {
          gameState.paddleWidth = PADDLE_WIDTH;
        } else if (type === 'slow') {
          gameState.balls.forEach(ball => {
            ball.velX /= 0.6;
            ball.velY /= 0.6;
          });
        }
      }
    });

    // Handle key presses
    if (gameState.keysPressed.has('ArrowLeft')) {
      gameState.paddleX = Math.max(0, gameState.paddleX - 8);
    }
    if (gameState.keysPressed.has('ArrowRight')) {
      gameState.paddleX = Math.min(GAME_WIDTH - gameState.paddleWidth, gameState.paddleX + 8);
    }
    if (gameState.keysPressed.has(' ') && gameState.activePowerups.laser) {
      // Shoot laser
      if (Math.random() < 0.3) { // Rate limit
        gameState.lasers.push({
          x: gameState.paddleX + gameState.paddleWidth / 2,
          y: GAME_HEIGHT - PADDLE_HEIGHT - 20,
          speed: 8,
          id: Math.random().toString(36)
        });
      }
    }

    // Update powerups
    gameState.powerups.forEach(powerup => {
      powerup.y += POWERUP_FALL_SPEED;
      powerup.rotation += 0.1;
    });

    // Check powerup collection
    gameState.powerups = gameState.powerups.filter(powerup => {
      const paddleY = GAME_HEIGHT - PADDLE_HEIGHT - 20;
      if (powerup.y + POWERUP_SIZE >= paddleY &&
          powerup.x + POWERUP_SIZE >= gameState.paddleX &&
          powerup.x <= gameState.paddleX + gameState.paddleWidth) {
        activatePowerup(powerup);
        return false;
      }
      return powerup.y < GAME_HEIGHT;
    });

    // Update lasers
    gameState.lasers.forEach(laser => {
      laser.y -= laser.speed;
    });

    // Laser-block collisions
    gameState.lasers = gameState.lasers.filter(laser => {
      for (let i = gameState.blocks.length - 1; i >= 0; i--) {
        const block = gameState.blocks[i];
        if (laser.x >= block.x && laser.x <= block.x + block.width &&
            laser.y >= block.y && laser.y <= block.y + block.height) {
          
          block.hits--;
          if (block.hits <= 0) {
            spawnPowerup(block.x, block.y);
            gameState.blocks.splice(i, 1);
            
            const points = (block.type === 'special' ? 20 : 10) * gameState.scoreMultiplier;
            gameState.score += points;
            setScore(gameState.score);
            
            if (gameState.scoreMultiplierBlocks > 0) {
              gameState.scoreMultiplierBlocks--;
              if (gameState.scoreMultiplierBlocks === 0) {
                gameState.scoreMultiplier = 1;
              }
            }
          }
          return false;
        }
      }
      return laser.y > 0;
    });

    // Update balls
    gameState.balls.forEach((ball, ballIndex) => {
      let newX = ball.x + ball.velX;
      let newY = ball.y + ball.velY;

      // Wall collisions
      if (newX <= 4 || newX >= GAME_WIDTH - BALL_SIZE - 4) {
        ball.velX = -ball.velX;
        newX = newX <= 4 ? 4 : GAME_WIDTH - BALL_SIZE - 4;
      }
      if (newY <= 4) {
        ball.velY = -ball.velY;
        newY = 4;
      }

      // Paddle collision
      const paddleY = GAME_HEIGHT - PADDLE_HEIGHT - 20;
      if (newY + BALL_SIZE >= paddleY &&
          newY + BALL_SIZE <= paddleY + PADDLE_HEIGHT + 10 &&
          newX + BALL_SIZE >= gameState.paddleX &&
          newX <= gameState.paddleX + gameState.paddleWidth) {
        ball.velY = -Math.abs(ball.velY);
        const hitPos = (newX + BALL_SIZE / 2 - gameState.paddleX) / gameState.paddleWidth;
        ball.velX = 8 * (hitPos - 0.5);
      }

      // Bottom boundary
      if (newY >= GAME_HEIGHT) {
        if (gameState.balls.length > 1) {
          gameState.balls.splice(ballIndex, 1);
          return;
        } else {
          gameState.lives--;
          setLives(gameState.lives);
          ball.x = GAME_WIDTH / 2;
          ball.y = GAME_HEIGHT - 100;
          ball.velX = 4;
          ball.velY = -4;
          
          if (gameState.lives <= 0) {
            gameState.gameState = 'gameOver';
            setGameState('gameOver');
          }
          return;
        }
      }

      ball.x = newX;
      ball.y = newY;

      // Block collisions
      let ballHit = false;
      for (let i = gameState.blocks.length - 1; i >= 0; i--) {
        const block = gameState.blocks[i];
        if (ball.x + BALL_SIZE >= block.x &&
            ball.x <= block.x + block.width &&
            ball.y + BALL_SIZE >= block.y &&
            ball.y <= block.y + block.height &&
            !ballHit) {
          
          // Physics calculation
          const ballCenterX = ball.x + BALL_SIZE / 2;
          const ballCenterY = ball.y + BALL_SIZE / 2;
          const blockCenterX = block.x + block.width / 2;
          const blockCenterY = block.y + block.height / 2;
          
          const deltaX = ballCenterX - blockCenterX;
          const deltaY = ballCenterY - blockCenterY;
          
          const overlapX = (block.width / 2 + BALL_SIZE / 2) - Math.abs(deltaX);
          const overlapY = (block.height / 2 + BALL_SIZE / 2) - Math.abs(deltaY);
          
          if (overlapX < overlapY) {
            ball.velX = -ball.velX;
          } else {
            ball.velY = -ball.velY;
          }
          
          block.hits--;
          if (block.hits <= 0) {
            spawnPowerup(block.x, block.y);
            gameState.blocks.splice(i, 1);
            
            const points = (block.type === 'special' ? 20 : 10) * gameState.scoreMultiplier;
            gameState.score += points;
            setScore(gameState.score);
            
            if (gameState.scoreMultiplierBlocks > 0) {
              gameState.scoreMultiplierBlocks--;
              if (gameState.scoreMultiplierBlocks === 0) {
                gameState.scoreMultiplier = 1;
              }
            }
          }
          ballHit = true;
        }
      }
    });

    if (gameState.blocks.length === 0) {
      gameState.level++;
      gameState.gameState = 'levelComplete';
      setLevel(gameState.level);
      setGameState('levelComplete');
    }

    draw();
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [draw]);

  // Game initialization and event handlers (similar to previous version)
  useEffect(() => {
    if (gameState === 'playing') {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      draw();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, gameLoop, draw]);

  useEffect(() => {
    if (gameState === 'playing') {
      const newBlocks = generateBlocks(level);
      gameStateRef.current.blocks = newBlocks;
      gameStateRef.current.balls = [{x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, velX: 4 + level * 0.1, velY: -(4 + level * 0.1), id: 'main'}];
      gameStateRef.current.powerups = [];
      gameStateRef.current.lasers = [];
      gameStateRef.current.gameState = 'playing';
      gameStateRef.current.isPaused = false;
      gameStateRef.current.activePowerups = {};
      gameStateRef.current.paddleWidth = PADDLE_WIDTH;
      gameStateRef.current.scoreMultiplier = 1;
      gameStateRef.current.scoreMultiplierBlocks = 0;
    }
  }, [level, gameState, generateBlocks]);

  useEffect(() => {
    gameStateRef.current.isPaused = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'playing') {
          setIsPaused(prev => !prev);
        }
        return;
      }
      
      if (gameState === 'playing') {
        gameStateRef.current.keysPressed.add(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keysPressed.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameState !== 'playing') return;
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    gameStateRef.current.paddleX = Math.max(0, Math.min(GAME_WIDTH - gameStateRef.current.paddleWidth, x - gameStateRef.current.paddleWidth / 2));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameState !== 'playing') return;
    if (!canvasRef.current) return;
    
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    gameStateRef.current.paddleX = Math.max(0, Math.min(GAME_WIDTH - gameStateRef.current.paddleWidth, x - gameStateRef.current.paddleWidth / 2));
  };

  const startGame = () => {
    setGameState('playing');
    setLevel(1);
    setScore(0);
    setLives(3);
    setIsPaused(false);
    
    gameStateRef.current = {
      balls: [{x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, velX: 4, velY: -4, id: 'main'}],
      paddleX: GAME_WIDTH / 2 - PADDLE_WIDTH / 2,
      paddleWidth: PADDLE_WIDTH,
      blocks: [],
      powerups: [],
      lasers: [],
      score: 0,
      lives: 3,
      level: 1,
      gameState: 'playing',
      isPaused: false,
      keysPressed: new Set(),
      activePowerups: {},
      scoreMultiplier: 1,
      scoreMultiplierBlocks: 0
    };
  };

  const continueToNextLevel = () => {
    setGameState('playing');
  };

  return (
    <InteractivePageWrapper>
      <div className="w-full h-screen flex flex-col overflow-hidden" style={{ backgroundColor: currentScheme.background }}>
      {gameState === 'menu' && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-3xl w-full">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ color: currentScheme.ball }}>
              Power-Up Breakout
            </h1>
            
            <div className="p-3 rounded-lg" style={{ backgroundColor: currentScheme.background + '80' }}>
              <h3 className="text-base lg:text-lg mb-3" style={{ color: currentScheme.paddle }}>Power-Ups Available:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs sm:text-sm">
                {POWERUP_TYPES.map(powerup => (
                  <div key={powerup.id} className="flex items-center justify-between px-2">
                    <span style={{ color: powerup.color }}>{powerup.symbol} {powerup.name}</span>
                    <span style={{ color: currentScheme.ball }} className="text-xs hidden sm:inline">{powerup.effect}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-lg lg:text-xl" style={{ color: currentScheme.paddle }}>Color Scheme</h2>
              <select 
                value={colorSchemeIndex} 
                onChange={(e) => setColorSchemeIndex(Number(e.target.value))}
                className="px-3 py-2 rounded bg-white/20 text-white text-sm"
                style={{ backgroundColor: currentScheme.blocks[0] }}
              >
                {COLOR_SCHEMES.map((scheme, index) => (
                  <option key={index} value={index} style={{ color: 'black' }}>{scheme.name}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={startGame}
              className="px-6 py-3 text-lg lg:text-xl font-bold rounded-lg transition-transform hover:scale-105"
              style={{ backgroundColor: currentScheme.paddle, color: currentScheme.background }}
            >
              Start Game
            </button>
            
            <div className="text-xs sm:text-sm mt-3" style={{ color: currentScheme.blocks[2] }}>
              Mouse/touch to move • SPACE to pause/shoot • Collect power-ups!
            </div>
          </div>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'levelComplete') && (
        <div className="flex-1 flex flex-col p-2 sm:p-4 overflow-hidden">
          <div className="flex justify-between items-center mb-2 w-full">
            <div style={{ color: currentScheme.paddle }} className="font-bold text-sm sm:text-base">
              Level: {level}
            </div>
            <div style={{ color: currentScheme.paddle }} className="font-bold text-sm sm:text-base">
              Score: {score}
            </div>
            <div style={{ color: currentScheme.paddle }} className="font-bold text-sm sm:text-base">
              Lives: {'❤️'.repeat(lives)}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative min-h-0">
            <canvas 
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              className="cursor-crosshair shadow-xl block"
              style={{ 
                backgroundColor: currentScheme.background,
                imageRendering: 'pixelated',
                borderRadius: '6px',
                boxShadow: `0 0 20px ${currentScheme.paddle}40, inset 0 0 15px ${currentScheme.background}80`,
                maxWidth: '100%',
                maxHeight: '100%',
                width: GAME_WIDTH + 'px',
                height: GAME_HEIGHT + 'px'
              }}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
            />

            {gameState === 'levelComplete' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <button
                  onClick={continueToNextLevel}
                  className="px-4 py-2 text-lg font-bold rounded-lg"
                  style={{ backgroundColor: currentScheme.paddle, color: currentScheme.background }}
                >
                  Next Level
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-center items-center space-x-4 mt-2">
            <button
              onMouseDown={() => {
                gameStateRef.current.paddleX = Math.max(0, gameStateRef.current.paddleX - 30);
              }}
              onTouchStart={() => {
                gameStateRef.current.paddleX = Math.max(0, gameStateRef.current.paddleX - 30);
              }}
              className="p-2 rounded-lg transition-transform hover:scale-105"
              style={{ backgroundColor: currentScheme.paddle, color: currentScheme.background }}
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={() => setIsPaused(prev => !prev)}
              className="p-2 rounded-lg transition-transform hover:scale-105"
              style={{ backgroundColor: currentScheme.paddle, color: currentScheme.background }}
            >
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
            </button>
            
            <button
              onMouseDown={() => {
                gameStateRef.current.paddleX = Math.min(GAME_WIDTH - gameStateRef.current.paddleWidth, gameStateRef.current.paddleX + 30);
              }}
              onTouchStart={() => {
                gameStateRef.current.paddleX = Math.min(GAME_WIDTH - gameStateRef.current.paddleWidth, gameStateRef.current.paddleX + 30);
              }}
              className="p-2 rounded-lg transition-transform hover:scale-105"
              style={{ backgroundColor: currentScheme.paddle, color: currentScheme.background }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="text-center text-xs mt-1" style={{ color: currentScheme.ball }}>
            Laser mode: Hold SPACE to shoot!
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ color: currentScheme.ball }}>
              Game Over
            </h1>
            <div className="text-xl sm:text-2xl" style={{ color: currentScheme.paddle }}>
              Final Score: {score}
            </div>
            <div className="text-lg sm:text-xl" style={{ color: currentScheme.blocks[2] }}>
              Reached Level: {level}
            </div>
            <button
              onClick={() => setGameState('menu')}
              className="px-6 py-3 text-lg sm:text-xl font-bold rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 mx-auto"
              style={{ backgroundColor: currentScheme.paddle, color: currentScheme.background }}
            >
              <RotateCcw size={20} />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}
      </div>
    </InteractivePageWrapper>
  );
};

export default BreakoutGame;