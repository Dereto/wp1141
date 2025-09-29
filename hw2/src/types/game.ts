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
  level: number;
  experience: number;
  damage: number;
  bulletSize: number;
  baseSpeed: number;
  baseFireRate: number;
  baseDamage: number;
  powerUpEffects: { [key in PowerUpType]?: { startTime: number; duration: number } };
  levelUpBonuses: { [key in UpgradeType]?: number };
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
  targetPosition?: Position; // For hunter enemies
  lastTeleport?: number; // For ghost enemies
  lastShield?: number; // For heavy enemies
  spawnTime?: number; // When this enemy was created
}

export enum EnemyType {
  BASIC = 'basic',
  GHOST = 'ghost',
  HEAVY = 'heavy',
  BOSS = 'boss',
  HUNTER = 'hunter'
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

export enum UpgradeType {
  DAMAGE = 'damage',
  FIRE_RATE = 'fireRate',
  BULLET_SIZE = 'bulletSize',
  SPEED = 'speed',
  HEALTH = 'health'
}

export interface LevelUpPopup {
  id: string;
  type: UpgradeType;
  message: string;
  timestamp: number;
  duration: number;
}

export interface GameState {
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  powerUps: PowerUp[];
  score: number;
  difficulty: number;
  gameOver: boolean;
  paused: boolean;
  keys: { [key: string]: boolean };
  spawnTimer: number;
  spawnBatchSize: number;
  gameStarted: boolean;
  gameStartTime: number;
  levelUpPopups: LevelUpPopup[];
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  tileSize: number;
  fps: number;
}
