import { Position, Velocity, Player, Enemy, Bullet, PowerUp, LevelUpPopup } from '../types/game';
import { EnemyType, PowerUpType, UpgradeType } from '../types/game';

export const GAME_CONFIG = {
  canvasWidth: 800,
  canvasHeight: 600,
  tileSize: 32,
  fps: 60
};

export const DIFFICULTY_CONFIG = {
  // Difficulty progression: every 20 seconds increases difficulty
  secondsPerDifficulty: 20,
  // Spawn system configuration
  baseSpawnInterval: 180, // frames (3 seconds at 60fps)
  minSpawnInterval: 60,   // minimum 1 second
  maxBatchSize: 5,        // maximum enemies spawned at once
  minBatchSize: 1         // minimum enemies spawned at once
};

export const LEVEL_CONFIG = {
  // Level progression: increasing XP requirements
  baseXPPerLevel: 50,
  xpIncreasePerLevel: 20, // Each level requires 25 more XP than the previous
  // Popup configuration
  popupDuration: 2000, // 2 seconds
  // Upgrade effect amounts (linear scaling)
  upgradeAmounts: {
    [UpgradeType.DAMAGE]: 5,        // +5 damage per level
    [UpgradeType.FIRE_RATE]: 0.5,   // +0.5 bullets per second per level
    [UpgradeType.BULLET_SIZE]: 1,   // +1 pixel bullet size per level
    [UpgradeType.SPEED]: 0.2,       // +0.2 speed per level
    [UpgradeType.HEALTH]: 50        // +50 max health per level
  }
};

export const PLAYER_CONFIG = {
  size: 24,
  speed: 2,
  maxHealth: 100,
  fireRate: 2.5, // bullets per second
  damage: 30
};

export const ENEMY_CONFIGS = {
  [EnemyType.BASIC]: {
    size: 20,
    speed: 0.5,
    health: 25,
    damage: 20,
    points: 10  // Basic enemy - baseline score
  },
  [EnemyType.GHOST]: {
    size: 16,
    speed: 1.5,
    health: 15,
    damage: 15,
    points: 25  // Teleport ability makes it more challenging
  },
  [EnemyType.HEAVY]: {
    size: 28,
    speed: 0.25,
    health: 50,
    damage: 40,
    points: 40  // Shield ability makes it much more challenging
  },
  [EnemyType.HUNTER]: {
    size: 18,
    speed: 2.5, // Fastest enemy
    health: 10,  // Most fragile
    damage: 25,
    points: 30  // Overshoot targeting makes it challenging but fragile
  },
  [EnemyType.BOSS]: {
    size: 40,
    speed: 0.75,
    health: 200,
    damage: 60,
    points: 150 // Boss enemy - highest reward
  }
};

export const POWERUP_CONFIGS = {
  [PowerUpType.HEALTH]: {
    size: 16,
    duration: 0,
    effect: (player: Player) => {
      player.health = player.maxHealth; // Full heal
    }
  },
  [PowerUpType.SPEED]: {
    size: 16,
    duration: 10000, // 10 seconds
    effect: (player: Player) => {
      player.speed = player.speed * 1.5; // 50% speed increase
    }
  },
  [PowerUpType.FIRE_RATE]: {
    size: 16,
    duration: 10000, // 10 seconds
    effect: (player: Player) => {
      player.fireRate = player.fireRate * 1.5; // 50% faster firing (1.5x bullets per second)
    }
  },
  [PowerUpType.DAMAGE]: {
    size: 16,
    duration: 10000, // 10 seconds
    effect: (player: Player) => {
      player.damage = player.damage * 1.5; // 50% damage increase
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
    size: PLAYER_CONFIG.size,
    level: 1,
    experience: 0,
    damage: PLAYER_CONFIG.damage,
    bulletSize: 5,
    baseSpeed: PLAYER_CONFIG.speed,
    baseFireRate: PLAYER_CONFIG.fireRate,
    baseDamage: PLAYER_CONFIG.damage,
    powerUpEffects: {},
    levelUpBonuses: {}
  };
}

export function createEnemy(type: EnemyType, position: Position, playerPosition?: Position): Enemy {
  const config = ENEMY_CONFIGS[type];
  const now = Date.now();
  const enemy: Enemy = {
    id: Math.random().toString(36).substr(2, 9),
    position,
    velocity: { x: 0, y: 0 },
    health: config.health,
    maxHealth: config.health,
    damage: config.damage,
    speed: config.speed,
    size: config.size,
    type,
    lastAttack: 0,
    spawnTime: now
  };

  // Set target position for hunter enemies
  if (type === EnemyType.HUNTER && playerPosition) {
    enemy.targetPosition = { ...playerPosition };
  }
  
  // Initialize teleport timer for ghost enemies
  if (type === EnemyType.GHOST) {
    enemy.lastTeleport = Date.now();
  }
  
  // Initialize shield timer for heavy enemies - set to 0 so they don't start with shield active
  if (type === EnemyType.HEAVY) {
    enemy.lastShield = 0; // Will be set to current time when they first activate shield
  }

  return enemy;
}

export function createBullet(position: Position, velocity: Velocity, damage: number, bulletSize: number): Bullet {
  return {
    id: Math.random().toString(36).substr(2, 9),
    position,
    velocity,
    damage,
    size: bulletSize
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

export function calculateDifficulty(gameStartTime: number): number {
  const currentTime = Date.now();
  const elapsedSeconds = (currentTime - gameStartTime) / 1000;
  return Math.floor(elapsedSeconds / DIFFICULTY_CONFIG.secondsPerDifficulty) + 1;
}

export function getSpawnInterval(difficulty: number): number {
  const { baseSpawnInterval, minSpawnInterval } = DIFFICULTY_CONFIG;
  
  // Create a cycle: 2.5s -> 2.2s -> 1.9s -> 1.6s -> 1.3s -> 1s
  const cycleLength = 6; // 6 difficulties per cycle
  const cyclePosition = (difficulty - 1) % cycleLength;
  
  // Custom intervals for each step in the cycle
  const cycleIntervals = [150, 132, 114, 96, 78, 60]; // frames (2.5s, 2.2s, 1.9s, 1.6s, 1.3s, 1s)
  const interval = Math.max(minSpawnInterval, cycleIntervals[cyclePosition]);
  return interval;
}

export function getSpawnBatchSize(difficulty: number): number {
  const { minBatchSize, maxBatchSize } = DIFFICULTY_CONFIG;
  
  // Increase batch size every 6 difficulties (every full cycle)
  const batchSize = Math.min(maxBatchSize, minBatchSize + Math.floor((difficulty - 1) / 6));
  return Math.max(minBatchSize, batchSize);
}

export function getAvailableEnemyTypes(difficulty: number): EnemyType[] {
  let enemyTypes = [EnemyType.BASIC];
  
  if (difficulty >= 2) enemyTypes.push(EnemyType.GHOST);
  if (difficulty >= 3) enemyTypes.push(EnemyType.HEAVY);
  if (difficulty >= 4) enemyTypes.push(EnemyType.HUNTER);
  if (difficulty >= 5) enemyTypes.push(EnemyType.BOSS);
  
  return enemyTypes;
}

export function hasBossOnField(enemies: Enemy[]): boolean {
  return enemies.some(enemy => enemy.type === EnemyType.BOSS);
}

export function calculateLevel(experience: number): number {
  let level = 1;
  let xpNeeded = 0;
  
  while (xpNeeded <= experience) {
    xpNeeded += LEVEL_CONFIG.baseXPPerLevel + (level - 1) * LEVEL_CONFIG.xpIncreasePerLevel;
    if (xpNeeded <= experience) {
      level++;
    }
  }
  
  return level;
}

export function getExperienceToNextLevel(currentLevel: number, currentXP: number): number {
  let totalXPNeeded = 0;
  for (let i = 1; i < currentLevel; i++) {
    totalXPNeeded += LEVEL_CONFIG.baseXPPerLevel + (i - 1) * LEVEL_CONFIG.xpIncreasePerLevel;
  }
  
  const xpForNextLevel = LEVEL_CONFIG.baseXPPerLevel + (currentLevel - 1) * LEVEL_CONFIG.xpIncreasePerLevel;
  return totalXPNeeded + xpForNextLevel - currentXP;
}

export function getRandomUpgrade(): UpgradeType {
  const upgradeTypes = Object.values(UpgradeType);
  return upgradeTypes[Math.floor(Math.random() * upgradeTypes.length)];
}

export function createLevelUpPopup(type: UpgradeType): LevelUpPopup {
  const messages = {
    [UpgradeType.DAMAGE]: 'Damage Up!',
    [UpgradeType.FIRE_RATE]: 'Fire Rate Up!',
    [UpgradeType.BULLET_SIZE]: 'Bullet Size Up!',
    [UpgradeType.SPEED]: 'Speed Up!',
    [UpgradeType.HEALTH]: 'Health Up!'
  };

  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    message: messages[type],
    timestamp: Date.now(),
    duration: LEVEL_CONFIG.popupDuration
  };
}

export function applyUpgrade(player: Player, upgradeType: UpgradeType): void {
  const amount = LEVEL_CONFIG.upgradeAmounts[upgradeType];
  
  // Heal 10% of max health on level up
  const healAmount = Math.floor(player.maxHealth * 0.1);
  player.health = Math.min(player.maxHealth, player.health + healAmount);
  
  // Track the level-up bonus
  if (!player.levelUpBonuses[upgradeType]) {
    player.levelUpBonuses[upgradeType] = 0;
  }
  player.levelUpBonuses[upgradeType] += amount;
  
  switch (upgradeType) {
    case UpgradeType.DAMAGE:
      player.damage += amount;
      break;
    case UpgradeType.FIRE_RATE:
      player.fireRate += amount; // Add bullets per second
      break;
    case UpgradeType.BULLET_SIZE:
      player.bulletSize += amount;
      break;
    case UpgradeType.SPEED:
      player.speed += amount;
      break;
    case UpgradeType.HEALTH:
      player.maxHealth += amount;
      player.health += amount; // Also heal the player
      break;
  }
}

export function applyPowerUp(player: Player, powerUpType: PowerUpType): void {
  const config = POWERUP_CONFIGS[powerUpType];
  const now = Date.now();
  
  // Apply immediate effect
  config.effect(player);
  
  // Track temporary effects
  if (config.duration > 0) {
    player.powerUpEffects[powerUpType] = {
      startTime: now,
      duration: config.duration
    };
  }
}

export function updatePowerUpEffects(player: Player): void {
  const now = Date.now();
  
  // Reset to base values + level-up bonuses
  player.speed = player.baseSpeed + (player.levelUpBonuses[UpgradeType.SPEED] || 0);
  player.fireRate = player.baseFireRate + (player.levelUpBonuses[UpgradeType.FIRE_RATE] || 0);
  player.damage = player.baseDamage + (player.levelUpBonuses[UpgradeType.DAMAGE] || 0);
  
  // Apply active power-up effects
  Object.entries(player.powerUpEffects).forEach(([type, effect]) => {
    const powerUpType = type as PowerUpType;
    const elapsed = now - effect.startTime;
    
    if (elapsed < effect.duration) {
      // Power-up is still active
      const config = POWERUP_CONFIGS[powerUpType];
      if (config.duration > 0) {
        config.effect(player);
      }
    } else {
      // Power-up has expired
      delete player.powerUpEffects[powerUpType];
    }
  });
}
