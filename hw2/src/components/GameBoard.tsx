import React, { useEffect, useRef, useState } from 'react';
import { GameState, Player, Enemy, Bullet, PowerUp, Position, Velocity, EnemyType, PowerUpType, UpgradeType, LevelUpPopup } from '../types/game';
import { createPlayer, GAME_CONFIG, PLAYER_CONFIG, createEnemy, createBullet, createPowerUp, checkCollision, distance, clamp, getRandomSpawnPosition, randomBetween, ENEMY_CONFIGS, DIFFICULTY_CONFIG, calculateDifficulty, getSpawnInterval, getSpawnBatchSize, getAvailableEnemyTypes, hasBossOnField, LEVEL_CONFIG, calculateLevel, getRandomUpgrade, createLevelUpPopup, applyUpgrade, applyPowerUp, updatePowerUpEffects, getExperienceToNextLevel } from '../utils/gameUtils';

const GameBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [gameState, setGameState] = useState<GameState>(() => ({
    player: createPlayer(),
    bullets: [],
    enemies: [],
    powerUps: [],
    score: 0,
    difficulty: 1,
    gameOver: false,
    paused: false,
    keys: {},
    spawnTimer: 0,
    spawnBatchSize: 1,
    gameStarted: false,
    gameStartTime: 0,
    levelUpPopups: []
  }));

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      if (!gameState.gameStarted || gameState.gameOver || gameState.paused) return;
      
      setGameState(prevState => {
        const newState = { ...prevState };
        
        // Update player position
        updatePlayer(newState);
        
        // Update power-up effects
        updatePowerUpEffects(newState.player);
        
        // Update bullets
        updateBullets(newState);
        
        // Update enemies
        updateEnemies(newState);
        
        // Update power-ups
        updatePowerUps(newState);
        
        // Check collisions
        checkCollisions(newState);
        
        // Spawn enemies
        spawnEnemies(newState);
        
        // Spawn power-ups
        spawnPowerUps(newState);
        
        // Check for level ups
        checkLevelUp(newState);
        
        // Update level up popups
        updateLevelUpPopups(newState);
        
        // Difficulty is now calculated automatically in spawnEnemies
        
        return newState;
      });
    };

    const interval = setInterval(gameLoop, 1000 / GAME_CONFIG.fps);
    gameLoopRef.current = interval as NodeJS.Timeout;

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.gameStarted, gameState.gameOver, gameState.paused]);

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);

    // Draw grid
    drawGrid(ctx);

    // Draw player
    drawPlayer(ctx, gameState.player);

    // Draw bullets
    gameState.bullets.forEach(bullet => drawBullet(ctx, bullet));

    // Draw enemies
    gameState.enemies.forEach(enemy => drawEnemy(ctx, enemy));

    // Draw power-ups
    gameState.powerUps.forEach(powerUp => drawPowerUp(ctx, powerUp));

    // Draw level up popups
    gameState.levelUpPopups.forEach(popup => drawLevelUpPopup(ctx, popup));

    // Draw UI
    drawUI(ctx, gameState);

  }, [gameState]);

  const updatePlayer = (state: GameState) => {
    const player = state.player;
    const keys = state.keys;

    // Reset velocity
    player.velocity.x = 0;
    player.velocity.y = 0;

    // Handle movement
    if (keys['w'] || keys['W']) player.velocity.y = -player.speed;
    if (keys['s'] || keys['S']) player.velocity.y = player.speed;
    if (keys['a'] || keys['A']) player.velocity.x = -player.speed;
    if (keys['d'] || keys['D']) player.velocity.x = player.speed;

    // Normalize diagonal movement
    if (player.velocity.x !== 0 && player.velocity.y !== 0) {
      player.velocity.x *= 0.707;
      player.velocity.y *= 0.707;
    }

    // Update position
    player.position.x += player.velocity.x;
    player.position.y += player.velocity.y;

    // Keep player in bounds
    player.position.x = clamp(player.position.x, player.size / 2, GAME_CONFIG.canvasWidth - player.size / 2);
    player.position.y = clamp(player.position.y, player.size / 2, GAME_CONFIG.canvasHeight - player.size / 2);
    
    // Ensure player health doesn't go below 0
    player.health = Math.max(0, player.health);
    
    // Check for game over
    if (player.health <= 0) {
      state.gameOver = true;
    }

    // Handle shooting
    const now = Date.now();
    const fireInterval = 1000 / player.fireRate; // Convert BPS to milliseconds
    if (now - player.lastShot >= fireInterval) {
      if (keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight']) {
        const bulletVelocity: Velocity = { x: 0, y: 0 };
        
        if (keys['ArrowUp']) bulletVelocity.y = -8;
        if (keys['ArrowDown']) bulletVelocity.y = 8;
        if (keys['ArrowLeft']) bulletVelocity.x = -8;
        if (keys['ArrowRight']) bulletVelocity.x = 8;

        if (bulletVelocity.x !== 0 || bulletVelocity.y !== 0) {
          const bullet = createBullet(
            { x: player.position.x, y: player.position.y },
            bulletVelocity,
            player.damage,
            player.bulletSize
          );
          state.bullets.push(bullet);
          player.lastShot = now;
        }
      }
    }
  };

  const updateBullets = (state: GameState) => {
    state.bullets = state.bullets.filter(bullet => {
      bullet.position.x += bullet.velocity.x;
      bullet.position.y += bullet.velocity.y;

      // Remove bullets that are off screen
      return bullet.position.x >= -10 && bullet.position.x <= GAME_CONFIG.canvasWidth + 10 &&
             bullet.position.y >= -10 && bullet.position.y <= GAME_CONFIG.canvasHeight + 10;
    });
  };

  const updateEnemies = (state: GameState) => {
    state.enemies.forEach(enemy => {
      if (enemy.type === EnemyType.HUNTER) {
        // Hunter AI: move towards target position, then overshoot by constant distance
        if (enemy.targetPosition) {
          const dx = enemy.targetPosition.x - enemy.position.x;
          const dy = enemy.targetPosition.y - enemy.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 5) { // Still moving towards target
            if (dist > 0) {
              enemy.velocity.x = (dx / dist) * enemy.speed;
              enemy.velocity.y = (dy / dist) * enemy.speed;
            }
          } else { // Reached target, set new target with overshoot
            // Calculate direction from current position to player
            const playerDx = state.player.position.x - enemy.position.x;
            const playerDy = state.player.position.y - enemy.position.y;
            const playerDist = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
            
            if (playerDist > 0) {
              // Set target to player position plus extra distance in same direction
              const overshootDistance = 100; // Constant overshoot distance
              const directionX = playerDx / playerDist;
              const directionY = playerDy / playerDist;
              
              let targetX = state.player.position.x + directionX * overshootDistance;
              let targetY = state.player.position.y + directionY * overshootDistance;
              
              // Clamp target position to stay within bounds
              targetX = Math.max(50, Math.min(GAME_CONFIG.canvasWidth - 50, targetX));
              targetY = Math.max(50, Math.min(GAME_CONFIG.canvasHeight - 50, targetY));
              
              enemy.targetPosition = {
                x: targetX,
                y: targetY
              };
            } else {
              // Player is exactly on top of hunter, just set target to player position
              enemy.targetPosition = { ...state.player.position };
            }
          }
        } else {
          // No target set, set initial target
          enemy.targetPosition = { ...state.player.position };
        }
      } else if (enemy.type === EnemyType.GHOST) {
        // Ghost AI: teleport every 10 seconds, then move towards player
        const now = Date.now();
        const teleportInterval = 10000; // 10 seconds
        
        if (enemy.lastTeleport && (now - enemy.lastTeleport) >= teleportInterval) {
          // Teleport to random position at least as far away as original distance
          const playerX = state.player.position.x;
          const playerY = state.player.position.y;
          const ghostX = enemy.position.x;
          const ghostY = enemy.position.y;
          
          // Calculate original distance from player
          const originalDistance = Math.sqrt(
            (playerX - ghostX) ** 2 + (playerY - ghostY) ** 2
          );
          
          // Try to find a valid random position
          let attempts = 0;
          let newX, newY, newDistance;
          
          do {
            // Generate random position within bounds
            newX = Math.random() * (GAME_CONFIG.canvasWidth - 100) + 50;
            newY = Math.random() * (GAME_CONFIG.canvasHeight - 100) + 50;
            
            // Calculate distance from player to new position
            newDistance = Math.sqrt(
              (playerX - newX) ** 2 + (playerY - newY) ** 2
            );
            
            attempts++;
          } while (newDistance < originalDistance && attempts < 50);
          
          // If we couldn't find a valid position after 50 attempts, use the last generated position
          enemy.position.x = newX;
          enemy.position.y = newY;
          enemy.lastTeleport = now;
        }
        
        // Standard movement towards player
        const dx = state.player.position.x - enemy.position.x;
        const dy = state.player.position.y - enemy.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
          enemy.velocity.x = (dx / dist) * enemy.speed;
          enemy.velocity.y = (dy / dist) * enemy.speed;
        }
      } else if (enemy.type === EnemyType.HEAVY) {
        // Heavy AI: shield ability every 20 seconds for 3 seconds
        const now = Date.now();
        const shieldInterval = 20000; // 20 seconds
        const shieldDuration = 3000; // 3 seconds
        
        if (enemy.lastShield > 0) {
          const timeSinceLastShield = now - enemy.lastShield;
          
          if (timeSinceLastShield >= shieldInterval) {
            // Activate shield
            enemy.lastShield = now;
            // Stop movement during shield
            enemy.velocity.x = 0;
            enemy.velocity.y = 0;
          } else if (timeSinceLastShield < shieldDuration) {
            // Shield is active, stay in place
            enemy.velocity.x = 0;
            enemy.velocity.y = 0;
          } else {
            // Shield is over, resume normal movement
            const dx = state.player.position.x - enemy.position.x;
            const dy = state.player.position.y - enemy.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
              enemy.velocity.x = (dx / dist) * enemy.speed;
              enemy.velocity.y = (dy / dist) * enemy.speed;
            }
          }
        } else {
          // No shield timer set, move normally and check if it's time to activate first shield
          const dx = state.player.position.x - enemy.position.x;
          const dy = state.player.position.y - enemy.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0) {
            enemy.velocity.x = (dx / dist) * enemy.speed;
            enemy.velocity.y = (dy / dist) * enemy.speed;
          }
          
          // Check if it's time to activate first shield (after 20 seconds from when this enemy was created)
          if (enemy.spawnTime) {
            const timeSinceSpawn = now - enemy.spawnTime;
            if (timeSinceSpawn >= shieldInterval) {
              enemy.lastShield = now;
              enemy.velocity.x = 0;
              enemy.velocity.y = 0;
            }
          }
        }
      } else {
        // Standard AI: move towards player
        const dx = state.player.position.x - enemy.position.x;
        const dy = state.player.position.y - enemy.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
          enemy.velocity.x = (dx / dist) * enemy.speed;
          enemy.velocity.y = (dy / dist) * enemy.speed;
        }
      }

      enemy.position.x += enemy.velocity.x;
      enemy.position.y += enemy.velocity.y;
    });

    // Remove enemies that are off screen
    state.enemies = state.enemies.filter(enemy => 
      enemy.position.x > -50 && enemy.position.x < GAME_CONFIG.canvasWidth + 50 &&
      enemy.position.y > -50 && enemy.position.y < GAME_CONFIG.canvasHeight + 50
    );
  };

  const updatePowerUps = (state: GameState) => {
    // Power-ups don't move, just check for collection
    state.powerUps = state.powerUps.filter(powerUp => {
      if (checkCollision(state.player, powerUp)) {
        applyPowerUp(state.player, powerUp.type);
        return false; // Remove power-up
      }
      return true;
    });
  };

  const checkCollisions = (state: GameState) => {
    // Bullet vs Enemy collisions
    state.bullets = state.bullets.filter(bullet => {
      const hitEnemy = state.enemies.find(enemy => checkCollision(bullet, enemy));
      if (hitEnemy) {
        // Check if heavy enemy has active shield
        if (hitEnemy.type === EnemyType.HEAVY && hitEnemy.lastShield) {
          const now = Date.now();
          const timeSinceLastShield = now - hitEnemy.lastShield;
          const shieldDuration = 3000; // 3 seconds
          
          if (timeSinceLastShield < shieldDuration) {
            // Shield is active, bullet is absorbed
            return false; // Remove bullet but don't damage enemy
          }
        }
        
        hitEnemy.health -= bullet.damage;
        return false; // Remove bullet
      }
      return true;
    });

    // Remove dead enemies and award points
    state.enemies = state.enemies.filter(enemy => {
      if (enemy.health <= 0) {
        state.score += ENEMY_CONFIGS[enemy.type].points;
        return false; // Remove enemy
      }
      return true; // Keep alive enemy
    });

    // Enemy vs Player collisions - separate collision detection from enemy removal
    const collidingEnemyIds: string[] = [];
    
    state.enemies.forEach(enemy => {
      if (checkCollision(state.player, enemy)) {
        const now = Date.now();
        
        if (now - enemy.lastAttack >= 1000) { // 1 second cooldown
          state.player.health -= enemy.damage;
          enemy.lastAttack = now;
          
          // Clamp player health to prevent negative values
          state.player.health = Math.max(0, state.player.health);
          
          if (state.player.health <= 0) {
            state.gameOver = true;
          }
        }
          // Non-boss enemies die immediately on collision (no points)
        // Exception: Heavy enemies with active shield don't die on collision
        let shouldDieOnCollision = enemy.type !== EnemyType.BOSS;
        if (enemy.type === EnemyType.HEAVY && enemy.lastShield && enemy.lastShield > 0) {
          const timeSinceLastShield = now - enemy.lastShield;
          const shieldDuration = 3000; // 3 seconds
          
          if (timeSinceLastShield < shieldDuration) {
            // Shield is active, don't die on collision
            shouldDieOnCollision = false;
          }
        }
        
        if (shouldDieOnCollision) {
          collidingEnemyIds.push(enemy.id);
        }
      }
    });
    
    // Remove colliding non-boss enemies
    state.enemies = state.enemies.filter(enemy => !collidingEnemyIds.includes(enemy.id));
  };

  const spawnEnemies = (state: GameState) => {
    // Update spawn timer
    state.spawnTimer++;
    
    // Calculate current difficulty based on time
    const currentDifficulty = calculateDifficulty(state.gameStartTime);
    state.difficulty = currentDifficulty;
    
    // Get spawn configuration based on difficulty
    const spawnInterval = getSpawnInterval(currentDifficulty);
    const batchSize = getSpawnBatchSize(currentDifficulty);
    state.spawnBatchSize = batchSize;
    
    // Check if we should spawn enemies
    if (state.spawnTimer >= spawnInterval) {
      // Get available enemy types for current difficulty
      const availableEnemyTypes = getAvailableEnemyTypes(currentDifficulty);
      
      // Spawn enemies in batch
      for (let i = 0; i < batchSize; i++) {
        let enemyType: EnemyType;
        
        // Boss spawning logic - only if no boss exists and chance allows
        if (availableEnemyTypes.includes(EnemyType.BOSS) && 
            !hasBossOnField(state.enemies) && 
            Math.random() < 0.15) {
          enemyType = EnemyType.BOSS;
        } else {
          // Choose from available types (excluding boss if one exists)
          const typesToChooseFrom = hasBossOnField(state.enemies) 
            ? availableEnemyTypes.filter(type => type !== EnemyType.BOSS)
            : availableEnemyTypes;
          enemyType = typesToChooseFrom[Math.floor(Math.random() * typesToChooseFrom.length)];
        }
        
        const enemy = createEnemy(enemyType, getRandomSpawnPosition(), state.player.position);
        
        // Scale enemy stats with difficulty
        enemy.health = Math.floor(enemy.health * (1 + (currentDifficulty - 1) * 0.2));
        enemy.maxHealth = enemy.health;
        enemy.speed = enemy.speed * (1 + (currentDifficulty - 1) * 0.05);
        
        state.enemies.push(enemy);
      }
      
      // Reset timer
      state.spawnTimer = 0;
    }
  };

  const spawnPowerUps = (state: GameState) => {
    if (Math.random() < 0.001) { // Very low chance
      const powerUpTypes = [PowerUpType.HEALTH, PowerUpType.SPEED, PowerUpType.FIRE_RATE, PowerUpType.DAMAGE];
      const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      const powerUp = createPowerUp(type, {
        x: randomBetween(50, GAME_CONFIG.canvasWidth - 50),
        y: randomBetween(50, GAME_CONFIG.canvasHeight - 50)
      });
      state.powerUps.push(powerUp);
    }
  };

  const checkLevelUp = (state: GameState) => {
    // Update player experience to match score
    state.player.experience = state.score;
    
    // Calculate new level
    const newLevel = calculateLevel(state.player.experience);
    
    // Check if player leveled up
    if (newLevel > state.player.level) {
      state.player.level = newLevel;
      
      // Get random upgrade
      const upgradeType = getRandomUpgrade();
      
      // Apply upgrade
      applyUpgrade(state.player, upgradeType);
      
      // Create popup
      const popup = createLevelUpPopup(upgradeType);
      state.levelUpPopups.push(popup);
    }
  };

  const updateLevelUpPopups = (state: GameState) => {
    const now = Date.now();
    state.levelUpPopups = state.levelUpPopups.filter(popup => {
      return now - popup.timestamp < popup.duration;
    });
  };


  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= GAME_CONFIG.canvasWidth; x += GAME_CONFIG.tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_CONFIG.canvasHeight);
      ctx.stroke();
    }
    
    for (let y = 0; y <= GAME_CONFIG.canvasHeight; y += GAME_CONFIG.tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_CONFIG.canvasWidth, y);
      ctx.stroke();
    }
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player) => {
    ctx.fillStyle = '#3498db';
    ctx.fillRect(
      player.position.x - player.size / 2,
      player.position.y - player.size / 2,
      player.size,
      player.size
    );
    
    // Health bar
    const barWidth = player.size;
    const barHeight = 4;
    const healthPercent = player.health / player.maxHealth;
    
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(
      player.position.x - barWidth / 2,
      player.position.y - player.size / 2 - 8,
      barWidth,
      barHeight
    );
    
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(
      player.position.x - barWidth / 2,
      player.position.y - player.size / 2 - 8,
      barWidth * healthPercent,
      barHeight
    );
  };

  const drawBullet = (ctx: CanvasRenderingContext2D, bullet: Bullet) => {
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(
      bullet.position.x - bullet.size / 2,
      bullet.position.y - bullet.size / 2,
      bullet.size,
      bullet.size
    );
  };

  const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
    const colors: { [key in EnemyType]: string } = {
      [EnemyType.BASIC]: '#e74c3c',     // Red - Basic threat
      [EnemyType.GHOST]: '#9b59b6',     // Purple - Mystical teleport
      [EnemyType.HEAVY]: '#8b4513',     // Brown - Armored tank (more visible)
      [EnemyType.BOSS]: '#e67e22',      // Orange - Boss warning
      [EnemyType.HUNTER]: '#27ae60'     // Green - Fast predator
    };
    
    // Check if heavy enemy has active shield
    let color = colors[enemy.type];
    if (enemy.type === EnemyType.HEAVY && enemy.lastShield) {
      const now = Date.now();
      const timeSinceLastShield = now - enemy.lastShield;
      const shieldDuration = 3000; // 3 seconds
      
      if (timeSinceLastShield < shieldDuration) {
        color = '#87CEEB'; // Light blue for shield
      }
    }
    
    ctx.fillStyle = color;
    
    ctx.fillRect(
      enemy.position.x - enemy.size / 2,
      enemy.position.y - enemy.size / 2,
      enemy.size,
      enemy.size
    );
    
    // Health bar (only show for bosses)
    if (enemy.type === EnemyType.BOSS) {
      const healthPercent = enemy.health / enemy.maxHealth;
      const barWidth = enemy.size;
      const barHeight = 3;
      
      // Background (red)
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(
        enemy.position.x - barWidth / 2,
        enemy.position.y - enemy.size / 2 - 6,
        barWidth,
        barHeight
      );
      
      // Health (green)
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(
        enemy.position.x - barWidth / 2,
        enemy.position.y - enemy.size / 2 - 6,
        barWidth * healthPercent,
        barHeight
      );
    }
  };

  const drawPowerUp = (ctx: CanvasRenderingContext2D, powerUp: PowerUp) => {
    const colors: { [key in PowerUpType]: string } = {
      [PowerUpType.HEALTH]: '#e74c3c',
      [PowerUpType.SPEED]: '#3498db',
      [PowerUpType.FIRE_RATE]: '#f39c12',
      [PowerUpType.DAMAGE]: '#9b59b6'
    };
    
    ctx.fillStyle = colors[powerUp.type];
    ctx.beginPath();
    ctx.arc(powerUp.position.x, powerUp.position.y, powerUp.size / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawLevelUpPopup = (ctx: CanvasRenderingContext2D, popup: LevelUpPopup) => {
    const now = Date.now();
    const elapsed = now - popup.timestamp;
    const progress = elapsed / popup.duration;
    
    // Fade out effect
    const alpha = Math.max(0, 1 - progress);
    
    // Position popup above player
    const x = GAME_CONFIG.canvasWidth / 2;
    const y = GAME_CONFIG.canvasHeight / 2 - 50 - (progress * 30); // Move up over time
    
    // Draw background
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
    ctx.fillRect(x - 100, y - 20, 200, 40);
    
    // Draw border
    ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 100, y - 20, 200, 40);
    
    // Draw text
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    ctx.font = 'bold 20px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(popup.message, x, y + 5);
    ctx.textAlign = 'left';
  };

  const drawUI = (ctx: CanvasRenderingContext2D, state: GameState) => {
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '16px Courier New';
    ctx.fillText(`Score: ${state.score}`, 10, 25);
    ctx.fillText(`Level: ${state.player.level}`, 10, 45);
    ctx.fillText(`Difficulty: ${state.difficulty}`, 10, 65);
    ctx.fillText(`Health: ${state.player.health}/${state.player.maxHealth}`, 10, 85);
    ctx.fillText(`Enemies: ${state.enemies.length}`, 10, 105);
    
    // Show experience progress
    const expToNext = getExperienceToNextLevel(state.player.level, state.player.experience);
    ctx.fillText(`XP to Next: ${expToNext}`, 10, 125);
    
    // Show resulting stats
    ctx.font = '12px Courier New';
    ctx.fillStyle = '#ecf0f1';
    ctx.fillText(`Damage: ${state.player.damage}`, 10, 145);
    ctx.fillText(`Fire Rate: ${state.player.fireRate.toFixed(1)} BPS`, 10, 160);
    ctx.fillText(`Speed: ${state.player.speed.toFixed(1)}`, 10, 175);
    ctx.fillText(`Bullet Size: ${state.player.bulletSize}`, 10, 190);
    
    // Show active power-up effects
    const activePowerUps = Object.keys(state.player.powerUpEffects);
    if (activePowerUps.length > 0) {
      ctx.fillStyle = '#f39c12';
      ctx.fillText('Active Power-ups:', 10, 210);
      activePowerUps.forEach((powerUp, index) => {
        const effect = state.player.powerUpEffects[powerUp as PowerUpType];
        const remaining = Math.ceil((effect.duration - (Date.now() - effect.startTime)) / 1000);
        ctx.fillText(`${powerUp}: ${remaining}s`, 10, 225 + (index * 15));
      });
    }
    
    if (state.gameOver) {
      ctx.fillStyle = '#e74c3c';
      ctx.font = '32px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2);
      ctx.fillText('Press R to Restart', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 40);
      ctx.textAlign = 'left';
    }
  };

  // Event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for game keys to avoid scrolling
      const gameKeys = ['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space', 'r', 'R'];
      if (gameKeys.includes(e.key)) {
        e.preventDefault();
      }
      
      setGameState(prevState => ({
        ...prevState,
        keys: { ...prevState.keys, [e.key]: true }
      }));
      
      if (e.key === 'r' || e.key === 'R') {
        if (gameState.gameOver) {
          setGameState({
            player: createPlayer(),
            bullets: [],
            enemies: [],
            powerUps: [],
            score: 0,
            difficulty: 1,
            gameOver: false,
            paused: false,
            keys: {},
            spawnTimer: 0,
            spawnBatchSize: 1,
            gameStarted: false,
            gameStartTime: 0,
            levelUpPopups: []
          });
        }
      }
      
      if (e.key === ' ' || e.key === 'Space') {
        if (!gameState.gameStarted) {
          setGameState(prevState => ({ 
            ...prevState, 
            gameStarted: true,
            gameStartTime: Date.now()
          }));
        } else if (!gameState.gameOver) {
          setGameState(prevState => ({ ...prevState, paused: !prevState.paused }));
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Prevent default behavior for game keys to avoid scrolling
      const gameKeys = ['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space', 'r', 'R'];
      if (gameKeys.includes(e.key)) {
        e.preventDefault();
      }
      
      setGameState(prevState => ({
        ...prevState,
        keys: { ...prevState.keys, [e.key]: false }
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.gameStarted, gameState.gameOver]);

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Prairie King: Enhanced Edition</h1>
        <p>Advanced top-down shooter with enemy AI and progression system</p>
      </div>
      
      <div className="game-main">
        <div className="game-sidebar">
          <div className="controls">
            <div className="control-group">
              <h3>Movement</h3>
              <p>W - Move Up</p>
              <p>A - Move Left</p>
              <p>S - Move Down</p>
              <p>D - Move Right</p>
            </div>
            <div className="control-group">
              <h3>Combat</h3>
              <p>↑ - Shoot Up</p>
              <p>← - Shoot Left</p>
              <p>↓ - Shoot Down</p>
              <p>→ - Shoot Right</p>
            </div>
            <div className="control-group">
              <h3>Game Controls</h3>
              <p>SPACE - Start/Pause</p>
              <p>R - Restart</p>
            </div>
          </div>
        </div>
        
        <div className="game-center">
          <canvas
            ref={canvasRef}
            width={GAME_CONFIG.canvasWidth}
            height={GAME_CONFIG.canvasHeight}
            style={{ border: '2px solid #34495e' }}
          />
          
          {!gameState.gameStarted && (
            <div className="start-menu">
              <h2>Press SPACE to Start</h2>
              <p>Survive the waves of enemies and collect power-ups!</p>
            </div>
          )}
          
          {gameState.paused && gameState.gameStarted && (
            <div className="pause-menu">
              <h2>Game Paused</h2>
              <p>Press SPACE to Resume</p>
            </div>
          )}
          
          {gameState.gameOver && (
            <div className="game-over-menu">
              <h2>Game Over</h2>
              <p>Final Score: {gameState.score}</p>
              <p>Press R to Restart</p>
            </div>
          )}
        </div>
        
        <div className="game-sidebar">
          <div className="powerup-info">
            <h3>Power-ups</h3>
            <div className="powerup-item">
              <div className="powerup-color health"></div>
              <span>Health Pack </span>
            </div>
            <div className="powerup-item">
              <div className="powerup-color speed"></div>
              <span>Speed Boost</span>
            </div>
            <div className="powerup-item">
              <div className="powerup-color fire-rate"></div>
              <span>Rapid Fire</span>
            </div>
            <div className="powerup-item">
              <div className="powerup-color damage"></div>
              <span>Damage Boost</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
