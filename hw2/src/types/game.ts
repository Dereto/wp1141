export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Player {
  position: Position;
  velocity: Velocity;
  health: number;
  maxHealth: number;
  speed: number;
  fireRate: number;
  lastShot: number;
  size: number;
}

export interface Bullet {
  id: string;
  position: Position;
  velocity: Velocity;
  damage: number;
  size: number;
}

export interface Enemy {
  id: string;
  position: Position;
  velocity: Velocity;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  size: number;
  type: EnemyType;
  lastAttack: number;
}

export enum EnemyType {
  BASIC = 'basic',
  FAST = 'fast',
  HEAVY = 'heavy',
  BOSS = 'boss'
}

export interface PowerUp {
  id: string;
  position: Position;
  type: PowerUpType;
  size: number;
  duration: number;
}

export enum PowerUpType {
  HEALTH = 'health',
  SPEED = 'speed',
  FIRE_RATE = 'fireRate',
  DAMAGE = 'damage'
}

export interface GameState {
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  powerUps: PowerUp[];
  score: number;
  level: number;
  gameOver: boolean;
  paused: boolean;
  keys: { [key: string]: boolean };
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  tileSize: number;
  fps: number;
}
