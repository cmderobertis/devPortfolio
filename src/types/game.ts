// Game-specific type definitions for interactive simulations

export interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'gameOver' | 'levelComplete';
  score: number;
  level: number;
  lives: number;
  time: {
    elapsed: number;
    remaining?: number;
  };
  settings: GameSettings;
}

export interface GameSettings {
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  colorScheme: string;
  soundEnabled: boolean;
  controlScheme: 'keyboard' | 'mouse' | 'touch';
  debugMode: boolean;
}

// Breakout Game Types
export interface BreakoutState extends GameState {
  balls: Ball[];
  paddle: Paddle;
  blocks: Block[];
  powerups: PowerUp[];
  lasers: Laser[];
  activePowerups: Record<string, number>; // powerup type -> expiry timestamp
  keysPressed: Set<string>;
  scoreMultiplier: number;
  scoreMultiplierBlocks: number;
}

export interface PowerUp extends Entity {
  type: PowerUpType;
  rotation: number;
  fallSpeed: number;
  symbol: string;
  color: string;
}

export interface PowerUpType {
  id: 'expand' | 'multiball' | 'slow' | 'laser' | 'score';
  name: string;
  symbol: string;
  color: string;
  probability: number;
  duration?: number; // in milliseconds
  effect: string;
}

export interface Laser extends Entity {
  speed: number;
  damage: number;
  color: string;
}

export interface Ball extends Entity {
  radius: number;
  color: string;
  trail?: Vector2D[];
  maxSpeed: number;
}

export interface Paddle extends Entity {
  width: number;
  height: number;
  color: string;
  speed: number;
  normalWidth: number; // for powerup resets
}

export interface Block extends Entity {
  width: number;
  height: number;
  color: string;
  hits: number;
  maxHits: number;
  type: 'normal' | 'special';
  points: number;
}

// DVD Bouncer Types
export interface DvdBouncerState {
  logo: DvdLogo;
  settings: DvdSettings;
  statistics: DvdStatistics;
}

export interface DvdLogo extends Entity {
  width: number;
  height: number;
  color: string;
  scale: number;
  rotation?: number;
  trail?: Vector2D[];
}

export interface DvdSettings {
  speed: number;
  colorChange: boolean;
  showTrail: boolean;
  bounceSound: boolean;
  logoSize: number;
  backgroundColor: string;
}

export interface DvdStatistics {
  bounces: number;
  cornerHits: number;
  timeRunning: number;
  averageSpeed: number;
  colorChanges: number;
}

// Game of Life Types
export interface GameOfLifeState {
  grid: CellGrid;
  rules: GameOfLifeRules;
  patterns: Pattern[];
  running: boolean;
  speed: number;
  generation: number;
  statistics: GameOfLifeStatistics;
}

export interface GameOfLifeRules {
  survivalRules: number[]; // neighbor counts for survival
  birthRules: number[]; // neighbor counts for birth
  toroidal: boolean; // wrap edges
}

export interface Pattern {
  name: string;
  cells: Vector2D[];
  description: string;
  category: 'still' | 'oscillator' | 'spaceship' | 'methuselah' | 'gun';
}

export interface GameOfLifeStatistics {
  population: number;
  births: number;
  deaths: number;
  generation: number;
  stability: number; // measure of pattern stability
}

// Input handling types
export interface InputState {
  keys: Set<string>;
  mouse: MouseState;
  touch: TouchState;
  gamepad?: GamepadState;
}

export interface MouseState {
  position: Vector2D;
  buttons: Set<number>;
  wheel: number;
  isDown: boolean;
}

export interface TouchState {
  touches: Touch[];
  gestures?: Gesture;
}

export interface Touch {
  id: number;
  position: Vector2D;
  pressure: number;
  startTime: number;
}

export interface Gesture {
  type: 'tap' | 'swipe' | 'pinch' | 'rotate';
  center: Vector2D;
  delta: Vector2D;
  scale?: number;
  rotation?: number;
}

export interface GamepadState {
  buttons: boolean[];
  axes: number[];
  connected: boolean;
  id: string;
}

// Audio types
export interface AudioManager {
  sounds: Map<string, AudioBuffer>;
  music: Map<string, AudioBuffer>;
  volume: {
    master: number;
    sfx: number;
    music: number;
  };
  play(soundId: string, volume?: number): void;
  playMusic(musicId: string, loop?: boolean): void;
  stop(soundId: string): void;
  setVolume(type: 'master' | 'sfx' | 'music', value: number): void;
}

// Performance monitoring
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  updateTime: number;
  renderTime: number;
  memoryUsage: number;
  entityCount: number;
  drawCalls: number;
}

// Accessibility types
export interface AccessibilityOptions {
  enableKeyboardNav: boolean;
  enableScreenReader: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  colorBlindFriendly: boolean;
  fontSize: 'small' | 'medium' | 'large';
  announceGameEvents: boolean;
}

export interface KeyboardNavigation {
  currentFocus: string | null;
  focusableElements: HTMLElement[];
  navigate(direction: 'up' | 'down' | 'left' | 'right'): void;
  activate(): void;
  escape(): void;
}

// Game loop types
export interface GameLoop {
  running: boolean;
  lastFrameTime: number;
  frameCount: number;
  targetFPS: number;
  actualFPS: number;
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  update(deltaTime: number): void;
  render(): void;
}

// Collision detection
export interface CollisionResult {
  collided: boolean;
  point?: Vector2D;
  normal?: Vector2D;
  penetration?: number;
  entityA: Entity;
  entityB: Entity;
}

export interface CollisionSystem {
  checkCollision(a: Entity, b: Entity): CollisionResult;
  checkCollisions(entities: Entity[]): CollisionResult[];
  resolveCollision(result: CollisionResult): void;
}

// Utility types for games
export type GameEventType = 
  | 'game-start' 
  | 'game-end' 
  | 'level-complete' 
  | 'player-death' 
  | 'score-update' 
  | 'powerup-collected' 
  | 'collision' 
  | 'pause' 
  | 'resume';

export type GameMode = 'single-player' | 'multiplayer' | 'ai-vs-human' | 'demo';

export type DifficultyModifier = {
  speed: number;
  entityCount: number;
  rules: Partial<SimulationRules>;
  scoreMultiplier: number;
};