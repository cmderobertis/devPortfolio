// Utility types and helper interfaces

// Color and theming utilities
export interface ColorPalette {
  name: string;
  colors: string[];
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface ColorUtils {
  hexToRgb(hex: string): { r: number; g: number; b: number } | null;
  rgbToHex(r: number, g: number, b: number): string;
  hslToHex(h: number, s: number, l: number): string;
  adjustBrightness(hex: string, percent: number): string;
  getContrast(color1: string, color2: string): number;
  isLight(hex: string): boolean;
  generatePalette(baseColor: string, count: number): string[];
}

// Animation and timing
export interface AnimationConfig {
  duration: number;
  easing: EasingFunction;
  delay?: number;
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export type EasingFunction = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier(number, number, number, number)'
  | ((t: number) => number);

export interface AnimationFrame {
  timestamp: number;
  progress: number; // 0 to 1
  value: any;
}

// Mathematical utilities
export interface MathUtils {
  clamp(value: number, min: number, max: number): number;
  lerp(start: number, end: number, t: number): number;
  map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number;
  distance(p1: Vector2D, p2: Vector2D): number;
  angle(p1: Vector2D, p2: Vector2D): number;
  rotate(point: Vector2D, angle: number, origin?: Vector2D): Vector2D;
  normalize(vector: Vector2D): Vector2D;
  magnitude(vector: Vector2D): number;
  dot(v1: Vector2D, v2: Vector2D): number;
  cross(v1: Vector2D, v2: Vector2D): number;
}

export interface RandomUtils {
  random(min?: number, max?: number): number;
  randomInt(min: number, max: number): number;
  randomChoice<T>(array: T[]): T;
  randomChoices<T>(array: T[], count: number): T[];
  shuffle<T>(array: T[]): T[];
  seed(value: number): void;
  gaussian(mean: number, stdDev: number): number;
  perlin(x: number, y?: number, z?: number): number;
}

// Storage and persistence
export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
  keys(): string[];
  size(): number;
}

export interface LocalStorageAdapter extends StorageAdapter {
  isSupported(): boolean;
}

export interface SessionStorageAdapter extends StorageAdapter {
  isSupported(): boolean;
}

export interface IndexedDBAdapter {
  get<T>(store: string, key: string): Promise<T | null>;
  set<T>(store: string, key: string, value: T): Promise<void>;
  delete(store: string, key: string): Promise<void>;
  clear(store: string): Promise<void>;
  keys(store: string): Promise<string[]>;
}

// Performance monitoring
export interface PerformanceMonitor {
  startMeasure(name: string): void;
  endMeasure(name: string): number;
  mark(name: string): void;
  measure(name: string, startMark?: string, endMark?: string): number;
  getMetrics(): PerformanceMetrics;
  reset(): void;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  updateTime: number;
  renderTime: number;
  memoryUsage: {
    used: number;
    total: number;
    heap: number;
  };
  customMetrics: Record<string, number>;
}

// Debug and development utilities
export interface DebugConfig {
  enabled: boolean;
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  showFPS: boolean;
  showBounds: boolean;
  showGrid: boolean;
  showStats: boolean;
  logEvents: boolean;
}

export interface Logger {
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  trace(message: string, ...args: any[]): void;
  group(label: string): void;
  groupEnd(): void;
  time(label: string): void;
  timeEnd(label: string): void;
}

// Event system utilities
export interface EventEmitter<T = Record<string, any>> {
  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void;
  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void;
  once<K extends keyof T>(event: K, listener: (data: T[K]) => void): void;
  emit<K extends keyof T>(event: K, data: T[K]): void;
  removeAllListeners(event?: keyof T): void;
  listenerCount(event: keyof T): number;
}

export interface Subscription {
  unsubscribe(): void;
  isActive(): boolean;
}

// Validation utilities
export interface Validator<T> {
  validate(value: T): ValidationResult;
  isValid(value: T): boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field?: string;
  message: string;
  code?: string;
}

export interface ValidationRule<T> {
  test(value: T): boolean;
  message: string;
  code?: string;
}

// Data structure utilities
export interface Queue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  peek(): T | undefined;
  isEmpty(): boolean;
  size(): number;
  clear(): void;
}

export interface Stack<T> {
  push(item: T): void;
  pop(): T | undefined;
  peek(): T | undefined;
  isEmpty(): boolean;
  size(): number;
  clear(): void;
}

export interface CircularBuffer<T> {
  push(item: T): void;
  get(index: number): T | undefined;
  toArray(): T[];
  isFull(): boolean;
  isEmpty(): boolean;
  size(): number;
  capacity(): number;
  clear(): void;
}

// Spatial data structures
export interface QuadTree<T extends { position: Vector2D }> {
  insert(item: T): void;
  remove(item: T): boolean;
  query(bounds: BoundingBox): T[];
  queryPoint(point: Vector2D, radius?: number): T[];
  clear(): void;
  size(): number;
}

export interface SpatialHash<T extends { position: Vector2D }> {
  insert(item: T): void;
  remove(item: T): boolean;
  query(bounds: BoundingBox): T[];
  getNearby(position: Vector2D, radius: number): T[];
  clear(): void;
  size(): number;
}

// File and asset utilities
export interface AssetLoader {
  load<T>(url: string): Promise<T>;
  loadImage(url: string): Promise<HTMLImageElement>;
  loadAudio(url: string): Promise<AudioBuffer>;
  loadJSON<T>(url: string): Promise<T>;
  loadText(url: string): Promise<string>;
  preload(urls: string[]): Promise<void>;
  isLoaded(url: string): boolean;
  getProgress(): number;
}

// Time utilities
export interface TimeUtils {
  now(): number;
  deltaTime(): number;
  formatTime(milliseconds: number): string;
  formatDuration(seconds: number): string;
  debounce<T extends (...args: any[]) => any>(func: T, delay: number): T;
  throttle<T extends (...args: any[]) => any>(func: T, delay: number): T;
  createTimer(callback: () => void, interval: number): Timer;
}

export interface Timer {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  isRunning(): boolean;
  getElapsed(): number;
  getRemainingTime(): number;
}

// URL and routing utilities
export interface URLUtils {
  parseQuery(search: string): Record<string, string>;
  buildQuery(params: Record<string, string | number | boolean>): string;
  isAbsolute(url: string): boolean;
  join(...parts: string[]): string;
  resolve(base: string, relative: string): string;
}

// Device and platform detection
export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile';
  os: 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'unknown';
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown';
  version: string;
  isTouchDevice: boolean;
  hasWebGL: boolean;
  hasGamepad: boolean;
  pixelRatio: number;
  maxTextureSize: number;
}

// Generic utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

export type NonNullable<T> = T extends null | undefined ? never : T;

export type ValueOf<T> = T[keyof T];

export type ArrayElement<T extends readonly unknown[]> = T extends readonly (infer E)[] ? E : never;