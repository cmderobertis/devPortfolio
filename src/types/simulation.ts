// Core simulation entity interfaces
export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D extends Vector2D {
  z: number;
}

export interface Velocity2D {
  vx: number;
  vy: number;
}

export interface Velocity3D extends Velocity2D {
  vz: number;
}

// Base entity interface for all simulation objects
export interface Entity {
  id: string | number;
  position: Vector2D;
  velocity?: Velocity2D;
  energy?: number;
  active?: boolean;
  metadata?: Record<string, unknown>;
}

// Emergence Engine specific types
export interface Agent extends Entity {
  connections: string[] | number[];
  role?: 'agent' | 'producer' | 'consumer' | 'trader' | 'neuron';
  activation?: number;
  stimulationThreshold?: number;
  energyCost?: number;
}

export interface FlockingAgent extends Agent {
  separationRadius: number;
  cohesionRadius: number;
  alignmentRadius: number;
  maxSpeed: number;
  maxForce: number;
}

export interface NeuronAgent extends Agent {
  firingRate: number;
  restingPotential: number;
  threshold: number;
  refractoryPeriod: number;
  synapses: Synapse[];
}

export interface Synapse {
  from: string | number;
  to: string | number;
  weight: number;
  delay: number;
}

// Economic simulation entities
export interface EconomicAgent extends Agent {
  wealth: number;
  productivity: number;
  consumptionRate: number;
  tradingHistory: TradeRecord[];
}

export interface TradeRecord {
  timestamp: number;
  partnerId: string | number;
  amount: number;
  resource: string;
}

// Cellular Automata types
export interface Cell {
  x: number;
  y: number;
  state: number | boolean;
  age?: number;
  neighbors?: Cell[];
}

export interface CellGrid {
  width: number;
  height: number;
  cells: Cell[][];
  generation: number;
}

// Game entities
export interface GameObject extends Entity {
  bounds: BoundingBox;
  visible: boolean;
  collidable: boolean;
  layer?: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Ball extends GameObject {
  radius: number;
  color: string;
  trail?: Vector2D[];
}

export interface Paddle extends GameObject {
  width: number;
  height: number;
  speed: number;
  color: string;
}

export interface Block extends GameObject {
  hits: number;
  maxHits: number;
  type: 'normal' | 'special' | 'powerup' | 'indestructible';
  color: string;
  points: number;
}

// Simulation state management
export interface SimulationState<T extends Entity = Entity> {
  entities: T[];
  canvas: {
    width: number;
    height: number;
  };
  time: {
    current: number;
    delta: number;
    scale: number;
  };
  isRunning: boolean;
  isPaused: boolean;
  generation?: number;
  statistics?: SimulationStatistics;
}

export interface SimulationStatistics {
  entityCount: number;
  activeEntityCount: number;
  averageEnergy?: number;
  averageSpeed?: number;
  collisions?: number;
  interactions?: number;
  generation?: number;
  fps?: number;
}

// Simulation configuration
export interface SimulationConfig {
  entityCount: number;
  canvasSize: Vector2D;
  rules: SimulationRules;
  performance: PerformanceConfig;
  visualization: VisualizationConfig;
}

export interface SimulationRules {
  physics: PhysicsRules;
  interaction: InteractionRules;
  environment: EnvironmentRules;
}

export interface PhysicsRules {
  gravity?: Vector2D;
  friction?: number;
  maxSpeed?: number;
  bounceDecay?: number;
  collisionEnabled?: boolean;
}

export interface InteractionRules {
  cohesion?: number;
  separation?: number;
  alignment?: number;
  randomness?: number;
  interactionRadius?: number;
  stimulationThreshold?: number;
}

export interface EnvironmentRules {
  boundaryBehavior: 'wrap' | 'bounce' | 'absorb';
  obstacles?: BoundingBox[];
  attractors?: Vector2D[];
  repulsors?: Vector2D[];
}

export interface PerformanceConfig {
  targetFPS: number;
  maxEntities: number;
  spatialOptimization: boolean;
  levelOfDetail: boolean;
  cullingEnabled: boolean;
}

export interface VisualizationConfig {
  showTrails: boolean;
  showConnections: boolean;
  showForces: boolean;
  showStatistics: boolean;
  colorScheme: string;
  particleSize: number;
}

// Animation and rendering types
export interface AnimationFrame {
  timestamp: number;
  entities: Entity[];
  camera?: Camera;
  effects?: Effect[];
}

export interface Camera {
  position: Vector2D;
  zoom: number;
  rotation: number;
  bounds: BoundingBox;
}

export interface Effect {
  id: string;
  type: 'particle' | 'trail' | 'explosion' | 'ripple';
  position: Vector2D;
  lifetime: number;
  intensity: number;
  color: string;
}

// Event system types
export interface SimulationEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
  entityId?: string | number;
}

export interface EventHandler<T = SimulationEvent> {
  (event: T): void;
}

export interface EventEmitter {
  on<T = SimulationEvent>(eventType: string, handler: EventHandler<T>): void;
  off<T = SimulationEvent>(eventType: string, handler: EventHandler<T>): void;
  emit(event: SimulationEvent): void;
}

// Utility types
export type EntityType = 'agent' | 'ball' | 'paddle' | 'block' | 'cell' | 'neuron' | 'particle';
export type SimulationPattern = 'flocking' | 'cellular' | 'neurons' | 'economy' | 'physics';
export type UpdateFunction<T extends Entity> = (entities: T[], config: SimulationConfig) => T[];
export type RenderFunction<T extends Entity> = (entities: T[], context: CanvasRenderingContext2D) => void;