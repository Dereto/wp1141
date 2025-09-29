import { Position, Velocity, Player, Enemy, Bullet, PowerUp } from '../types/game';
import { EnemyType, PowerUpType } from '../types/game';

export const GAME_CONFIG = {
  canvasWidth: 800,
  canvasHeight: 600,
  tileSize: 32,
  fps: 60
};

export const DIFFICULTY_CONFIG = {
  // Difficulty progression: every 200 points increases difficulty (slower than before)
  pointsPerDifficulty: 200,
  // Spawn system configuration
  baseSpawnInterval: 180, // frames (3 seconds at 60fps)
  minSpawnInterval: 60,   // minimum 1 second
  maxBatchSize: 5,        // maximum enemies spawned at once
  minBatchSize: 1         // minimum enemies spawned at once
};

export const PLAYER_CONFIG = {
  size: 24,
  speed: 2,
  maxHealth: 10000,
  fireRate: 300, // milliseconds between shots
  damage: 25
};

export const ENEMY_CONFIGS = {
  [EnemyType.BASIC]: {
    size: 20,
    speed: 0.5,
    health: 25,
    damage: 20,
    points: 10
  },
  [EnemyType.FAST]: {
    size: 16,
    speed: 1.5,
    health: 15,
    damage: 15,
    points: 15
  },
  [EnemyType.HEAVY]: {
    size: 28,
    speed: 0.25,
    health: 50,
    damage: 40,
    points: 25
  },
  [EnemyType.BOSS]: {
    size: 40,
    speed: 0.75,
    health: 150,
    damage: 60,
    points: 100
  }
};

export const POWERUP_CONFIGS = {
  [PowerUpType.HEALTH]: {
    size: 16,
    duration: 0,
    effect: (player: Player) => {
      player.health = Math.min(player.maxHealth, player.health + 25);
    }
  },
  [PowerUpType.SPEED]: {
    size: 16,
    duration: 10000,
    effect: (player: Player) => {
      player.speed = Math.min(8, player.speed + 1);
    }
  },
  [PowerUpType.FIRE_RATE]: {
    size: 16,
    duration: 10000,
    effect: (player: Player) => {
      player.fireRate = Math.max(100, player.fireRate - 50);
    }
  },
  [PowerUpType.DAMAGE]: {
    size: 16,
    duration: 10000,
    effect: (player: Player) => {
      // This would be handled in bullet creation
    }
  }
};

export function createPlayer(): Player {
  return {
    position: { x: GAME_CONFIG.canvasWidth / 2, y: GAME_CONFIG.canvasHeight / 2 },
    velocity: { x: 0, y: 0 },
    health: PLAYER_CONFIG.maxHealth,
    maxHealth: PLAYER_CONFIG.maxHealth,
    speed: PLAYER_CONFIG.speed,
    fireRate: PLAYER_CONFIG.fireRate,
    lastShot: 0,
    size: PLAYER_CONFIG.size
  };
}

export function createEnemy(type: EnemyType, position: Position): Enemy {
  const config = ENEMY_CONFIGS[type];
  return {
    id: Math.random().toString(36).substr(2, 9),
    position,
    velocity: { x: 0, y: 0 },
    health: config.health,
    maxHealth: config.health,
    damage: config.damage,
    speed: config.speed,
    size: config.size,
    type,
    lastAttack: 0
  };
}

export function createBullet(position: Position, velocity: Velocity, damage: number = PLAYER_CONFIG.damage): Bullet {
  return {
    id: Math.random().toString(36).substr(2, 9),
    position,
    velocity,
    damage,
    size: 5
  };
}

export function createPowerUp(type: PowerUpType, position: Position): PowerUp {
  return {
    id: Math.random().toString(36).substr(2, 9),
    position,
    type,
    size: POWERUP_CONFIGS[type].size,
    duration: POWERUP_CONFIGS[type].duration
  };
}

export function distance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function checkCollision(obj1: { position: Position; size: number }, obj2: { position: Position; size: number }): boolean {
  const dist = distance(obj1.position, obj2.position);
  return dist < (obj1.size + obj2.size) / 2;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function getRandomSpawnPosition(): Position {
  const side = Math.floor(Math.random() * 4);
  const config = GAME_CONFIG;
  
  switch (side) {
    case 0: // Top
      return { x: randomBetween(0, config.canvasWidth), y: -50 };
    case 1: // Right
      return { x: config.canvasWidth + 50, y: randomBetween(0, config.canvasHeight) };
    case 2: // Bottom
      return { x: randomBetween(0, config.canvasWidth), y: config.canvasHeight + 50 };
    case 3: // Left
      return { x: -50, y: randomBetween(0, config.canvasHeight) };
    default:
      return { x: 0, y: 0 };
  }
}

export function calculateDifficulty(score: number): number {
  return Math.floor(score / DIFFICULTY_CONFIG.pointsPerDifficulty) + 1;
}

export function getSpawnInterval(difficulty: number): number {
  const { baseSpawnInterval, minSpawnInterval } = DIFFICULTY_CONFIG;
  
  // Create a cycle: 3s -> 2.5s -> 2s -> 1.5s -> 1s, then reset to 3s with batch size 2
  const cycleLength = 5; // 5 difficulties per cycle
  const cyclePosition = (difficulty - 1) % cycleLength;
  
  // Reduce interval by 30 frames (0.5s) per step in cycle
  const interval = Math.max(minSpawnInterval, baseSpawnInterval - (cyclePosition * 30));
  return interval;
}

export function getSpawnBatchSize(difficulty: number): number {
  const { minBatchSize, maxBatchSize } = DIFFICULTY_CONFIG;
  
  // Increase batch size every 5 difficulties (every full cycle)
  const batchSize = Math.min(maxBatchSize, minBatchSize + Math.floor((difficulty - 1) / 5));
  return Math.max(minBatchSize, batchSize);
}

export function getAvailableEnemyTypes(difficulty: number): EnemyType[] {
  let enemyTypes = [EnemyType.BASIC];
  
  if (difficulty >= 2) enemyTypes.push(EnemyType.FAST);
  if (difficulty >= 3) enemyTypes.push(EnemyType.HEAVY);
  if (difficulty >= 5) enemyTypes.push(EnemyType.BOSS);
  
  return enemyTypes;
}

export function hasBossOnField(enemies: Enemy[]): boolean {
  return enemies.some(enemy => enemy.type === EnemyType.BOSS);
}
