// Central type definitions export
export * from './simulation';
export * from './game';
export * from './ui';
export * from './utils';

// Re-export common types for convenience
export type { Vector2D, Vector3D, Entity, Agent, SimulationState, SimulationConfig } from './simulation';
export type { GameState, BreakoutState, InputState, PerformanceMetrics } from './game';
export type { ThemeConfig, ComponentProps, NavigationItem } from './ui';
export type { ColorPalette, AnimationConfig, DebugConfig } from './utils';