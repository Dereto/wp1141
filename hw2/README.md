# Prairie King: Enhanced Edition

本次作業靈感來源於遊戲"星露谷物語"中的一個小遊戲"Journey of the Prairie King"，在玩到破防之後決定試著重現它，不能只有我受苦。不過成品相較於原本的靈感來源有許多改動，像是用生命值而不是一被碰到就死掉，以及隨著分數升級等。活一到兩分鐘左右應該就能看到所有的敵人了，但歡迎挑戰高分，最後一次測試我的分數大約在兩萬分上下。

希望大家玩得開心。

## Game Features

- **Top-down shooter gameplay** with WASD movement and arrow key shooting
- **5 Unique Enemy Types** with special abilities and behaviors:
  - **Basic**: Standard red enemies with balanced stats
  - **Ghost**: Purple enemies that teleport randomly every 10 seconds
  - **Heavy**: Brown armored tanks with shield ability every 20 seconds
  - **Hunter**: Green fast predators with overshoot targeting
  - **Boss**: Orange high-health enemies (max 1 on field)
- **Advanced Power-up System** with health packs, speed boosts, fire rate increases, and damage boosts
- **Time-based Difficulty Scaling** that increases every 20 seconds
- **Level Progression System** using score as XP with random upgrades
- **Dynamic Enemy Spawning** with cyclical spawn patterns and batch sizes
- **Collision Detection** between bullets, enemies, and player
- **Score System** with balanced enemy point values
- **Pixel art aesthetic** matching the original game style

## Controls

### Movement
- **W** - Move Up
- **A** - Move Left  
- **S** - Move Down
- **D** - Move Right

### Combat
- **↑** - Shoot Up
- **←** - Shoot Left
- **↓** - Shoot Down
- **→** - Shoot Right

### Game Controls
- **R** - Restart game (when game over)

## Enemy Types

- **Basic Enemies** (Red) - Standard enemies with moderate health and speed
- **Ghost Enemies** (Purple) - Teleport randomly every 10 seconds
- **Heavy Enemies** (Brown) - Shield ability every 20 seconds, become invulnerable
- **Hunter Enemies** (Green) - Fast predators with overshoot targeting
- **Boss Enemies** (Orange) - Rare, powerful enemies that appear at higher difficulties (max 1 on field)

## Power-ups

- **Health Pack** (Red) - Full heal
- **Speed Boost** (Blue) - 50% speed increase for 10 seconds
- **Rapid Fire** (Orange) - 50% fire rate increase for 10 seconds
- **Damage Boost** (Purple) - 50% damage increase for 10 seconds

## Game Mechanics

- **Time-Based Difficulty**: Difficulty increases every 20 seconds for consistent progression
- **Cyclical Enemy Spawning**: Enemies spawn in cycles - 2.5s/1 enemy → 2.2s/1 enemy → 1.9s/1 enemy → 1.6s/1 enemy → 1.3s/1 enemy → 1s/1 enemy → 2.5s/2 enemies → ...
- **Enemy Scaling**: Enemies become stronger and more numerous at higher difficulties
- **Boss Limitation**: Maximum 1 boss on field at any time to encourage strategic targeting
- **Collision System**: Precise collision detection for all game objects
- **Health System**: Player health decreases when touching enemies
- **Score System**: Earn points by defeating enemies

## Installation & Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open your browser to `http://localhost:3000`

## Building for Production

```bash
npm run build
```

## Technical Details

- **Framework**: React 18 with TypeScript
- **Bundler**: Webpack 5
- **Canvas Rendering**: HTML5 Canvas for game graphics
- **Game Loop**: 60 FPS game loop with React state management
- **Architecture**: Component-based with utility functions for game logic

## Game Architecture

- `GameBoard.tsx` - Main game component with game loop and rendering
- `types/game.ts` - TypeScript interfaces for game objects
- `utils/gameUtils.ts` - Game utility functions and configuration
- `index.css` - Styling with pixel art aesthetic

## Development Notes

The game uses a React-based game loop that updates the game state every frame. All game objects (player, enemies, bullets, power-ups) are managed through React state, with collision detection and game logic handled in utility functions.

The canvas rendering system draws all game objects with appropriate styling to match the original Stardew Valley aesthetic.

