import React, { useEffect, useRef, useState } from 'react';
import { GameState, Player, Enemy, Bullet, PowerUp, Position, Velocity, EnemyType, PowerUpType } from '../types/game';
import { createPlayer, GAME_CONFIG, PLAYER_CONFIG, createEnemy, createBullet, createPowerUp, checkCollision, distance, clamp, getRandomSpawnPosition, randomBetween, ENEMY_CONFIGS } from '../utils/gameUtils';

const GameBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [gameState, setGameState] = useState<GameState>(() => ({
    player: createPlayer(),
    bullets: [],
    enemies: [],
    powerUps: [],
    score: 0,
    level: 1,
    gameOver: false,
    paused: false,
    keys: {},
    spawnTimer: 0,
    gameStarted: false
  }));

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      if (!gameState.gameStarted || gameState.gameOver || gameState.paused) return;
      
      setGameState(prevState => {
        const newState = { ...prevState };
        
        // Update player position
        updatePlayer(newState);
        
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
        
        // Check for level progression
        checkLevelProgression(newState);
        
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
  }, [gameState.gameOver, gameState.paused]);

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
    if (now - player.lastShot >= player.fireRate) {
      if (keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight']) {
        const bulletVelocity: Velocity = { x: 0, y: 0 };
        
        if (keys['ArrowUp']) bulletVelocity.y = -8;
        if (keys['ArrowDown']) bulletVelocity.y = 8;
        if (keys['ArrowLeft']) bulletVelocity.x = -8;
        if (keys['ArrowRight']) bulletVelocity.x = 8;

        if (bulletVelocity.x !== 0 || bulletVelocity.y !== 0) {
          const bullet = createBullet(
            { x: player.position.x, y: player.position.y },
            bulletVelocity
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
      // Simple AI: move towards player
      const dx = state.player.position.x - enemy.position.x;
      const dy = state.player.position.y - enemy.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        enemy.velocity.x = (dx / dist) * enemy.speed;
        enemy.velocity.y = (dy / dist) * enemy.speed;
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
        applyPowerUp(state, powerUp);
        return false; // Remove power-up
      }
      return true;
    });
  };

  const applyPowerUp = (state: GameState, powerUp: PowerUp) => {
    switch (powerUp.type) {
      case PowerUpType.HEALTH:
        state.player.health = Math.min(state.player.maxHealth, state.player.health + 25);
        break;
      case PowerUpType.SPEED:
        state.player.speed = Math.min(8, state.player.speed + 1);
        break;
      case PowerUpType.FIRE_RATE:
        state.player.fireRate = Math.max(100, state.player.fireRate - 50);
        break;
    }
  };

  const checkCollisions = (state: GameState) => {
    // Bullet vs Enemy collisions
    state.bullets = state.bullets.filter(bullet => {
      const hitEnemy = state.enemies.find(enemy => checkCollision(bullet, enemy));
      if (hitEnemy) {
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
        if (enemy.type !== EnemyType.BOSS) {
          console.log(`Enemy ${enemy.type} died from collision with player`);
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
    
    // Calculate spawn interval based on level (higher level = faster spawning)
    const baseSpawnInterval = 120; // frames (2 seconds at 60fps)
    const levelPenalty = Math.max(0, (state.level - 1) * 10); // reduce interval by 10 frames per level
    const spawnInterval = Math.max(30, baseSpawnInterval - levelPenalty); // minimum 0.5 seconds
    
    // Spawn enemy if timer reached and we haven't hit the enemy limit
    if (state.spawnTimer >= spawnInterval) {
      let enemyTypes = [EnemyType.BASIC];
      
      // Add more enemy types as level increases
      if (state.level >= 2) enemyTypes.push(EnemyType.FAST);
      if (state.level >= 3) enemyTypes.push(EnemyType.HEAVY);
      if (state.level >= 5 && Math.random() < 0.15) enemyTypes = [EnemyType.BOSS];
      
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      const enemy = createEnemy(type, getRandomSpawnPosition());
      
      // Scale enemy stats with level
      enemy.health = Math.floor(enemy.health * (1 + (state.level - 1) * 0.3));
      enemy.maxHealth = enemy.health;
      enemy.speed = enemy.speed * (1 + (state.level - 1) * 0.1);
      
      state.enemies.push(enemy);
      state.spawnTimer = 0; // Reset timer
    }
  };

  const spawnPowerUps = (state: GameState) => {
    if (Math.random() < 0.001) { // Very low chance
      const powerUpTypes = [PowerUpType.HEALTH, PowerUpType.SPEED, PowerUpType.FIRE_RATE];
      const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      const powerUp = createPowerUp(type, {
        x: randomBetween(50, GAME_CONFIG.canvasWidth - 50),
        y: randomBetween(50, GAME_CONFIG.canvasHeight - 50)
      });
      state.powerUps.push(powerUp);
    }
  };

  const checkLevelProgression = (state: GameState) => {
    const requiredScore = state.level * 100; // 100 points per level
    if (state.score >= requiredScore) {
      state.level++;
      // Heal player slightly on level up
      state.player.health = Math.min(state.player.maxHealth, state.player.health + 20);
    }
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
      [EnemyType.BASIC]: '#e74c3c',
      [EnemyType.FAST]: '#9b59b6',
      [EnemyType.HEAVY]: '#8b4513',
      [EnemyType.BOSS]: '#e67e22'
    };
    
    // Use normal color regardless of health
    ctx.fillStyle = colors[enemy.type];
    
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

  const drawUI = (ctx: CanvasRenderingContext2D, state: GameState) => {
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '16px Courier New';
    ctx.fillText(`Score: ${state.score}`, 10, 25);
    ctx.fillText(`Level: ${state.level}`, 10, 45);
    ctx.fillText(`Health: ${state.player.health}/${state.player.maxHealth}`, 10, 65);
    ctx.fillText(`Enemies: ${state.enemies.length}`, 10, 85);
    
    // Show spawn timer progress (optional debug info)
    const spawnInterval = Math.max(30, 120 - (state.level - 1) * 10);
    const progress = Math.min(1, state.spawnTimer / spawnInterval);
    ctx.fillStyle = '#7f8c8d';
    ctx.fillText(`Next spawn: ${Math.ceil((spawnInterval - state.spawnTimer) / 60)}s`, 10, 105);
    
    // Debug: Show enemy health info
    if (state.enemies.length > 0) {
      ctx.fillStyle = '#f39c12';
      ctx.font = '12px Courier New';
      state.enemies.forEach((enemy, index) => {
        const enemyType = enemy.type === EnemyType.BOSS ? 'BOSS' : enemy.type.toUpperCase();
        ctx.fillText(`${enemyType} ${index + 1}: ${enemy.health}/${enemy.maxHealth}`, 10, 125 + (index * 15));
      });
    }
    
    // Show collision death info
    ctx.fillStyle = '#e67e22';
    ctx.font = '12px Courier New';
    ctx.fillText('Collision = Death (no points)', 10, 125 + (state.enemies.length * 15) + 20);
    ctx.fillText('Boss collision = Damage only', 10, 125 + (state.enemies.length * 15) + 35);
    
    // Debug: Show collision detection
    ctx.fillStyle = '#9b59b6';
    ctx.font = '12px Courier New';
    const playerPos = state.player.position;
    state.enemies.forEach((enemy, index) => {
      const isColliding = checkCollision(state.player, enemy);
      if (isColliding) {
        ctx.fillText(`COLLISION with ${enemy.type}`, 10, 125 + (state.enemies.length * 15) + 50 + (index * 15));
      }
    });
    
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
            level: 1,
            gameOver: false,
            paused: false,
            keys: {},
            spawnTimer: 0,
            gameStarted: false
          });
        }
      }
      
      if (e.key === ' ' || e.key === 'Space') {
        if (!gameState.gameStarted) {
          setGameState(prevState => ({ ...prevState, gameStarted: true }));
        } else if (!gameState.gameOver) {
          setGameState(prevState => ({ ...prevState, paused: !prevState.paused }));
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
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
  }, [gameState.gameOver]);

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Journey of the Prairie King</h1>
        <p>A Stardew Valley Minigame Recreation</p>
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
              <span>Health Pack (+25 HP)</span>
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
