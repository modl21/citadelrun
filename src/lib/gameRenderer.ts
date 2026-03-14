import type { GameState, Obstacle } from './gameTypes';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GROUND_Y,
  GROUND_HEIGHT,
  COLOR_BG_TOP,
  COLOR_BG_BOTTOM,
  COLOR_GROUND,
  COLOR_GROUND_LINE,
  COLOR_PLAYER,
  COLOR_PLAYER_ACCENT,
  COLOR_BULLET,
  COLOR_SPIKE,
  COLOR_CRATE,
  COLOR_BARREL,
  COLOR_WALL,
  COLOR_HIT_FLASH,
} from './gameConstants';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number, isGrounded: boolean) {
  // Shadow on ground
  if (y < GROUND_Y - h * 0.5) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    const shadowW = w * 0.8;
    ctx.fillRect(x + (w - shadowW) / 2, GROUND_Y - 2, shadowW, 3);
  }

  // Body
  ctx.fillStyle = COLOR_PLAYER;
  ctx.shadowColor = COLOR_PLAYER;
  ctx.shadowBlur = 10;

  // Simple runner figure
  const cx = x + w / 2;
  const cy = y + h / 2;

  // Torso
  ctx.fillRect(cx - 5, y + 6, 10, h - 18);

  // Head
  ctx.beginPath();
  ctx.arc(cx, y + 6, 6, 0, Math.PI * 2);
  ctx.fill();

  // Running legs animation
  const legPhase = Math.sin(frame * 0.25) * 6;
  ctx.fillRect(cx - 6, y + h - 14, 4, 12 + (isGrounded ? legPhase : 0));
  ctx.fillRect(cx + 2, y + h - 14, 4, 12 + (isGrounded ? -legPhase : 0));

  // Arms
  const armPhase = Math.sin(frame * 0.25 + Math.PI) * 5;
  ctx.fillRect(cx - 10, y + 10, 5, 3);
  ctx.fillRect(cx + 5, y + 10 + (isGrounded ? armPhase * 0.3 : 0), 8, 3);

  ctx.shadowBlur = 0;

  // Visor / eye accent
  ctx.fillStyle = COLOR_PLAYER_ACCENT;
  ctx.shadowColor = COLOR_PLAYER_ACCENT;
  ctx.shadowBlur = 4;
  ctx.fillRect(cx, y + 3, 5, 3);
  ctx.shadowBlur = 0;
}

function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, frame: number) {
  const { x, y, width: w, height: h, type, hp, maxHp, hitFlash } = obs;

  // Pick color
  let color: string;
  switch (type) {
    case 'jump':   color = COLOR_SPIKE; break;
    case 'shoot1': color = COLOR_CRATE; break;
    case 'shoot2': color = COLOR_BARREL; break;
    case 'shoot3': color = COLOR_WALL; break;
  }

  // Hit flash override
  if (hitFlash > 0.3) {
    color = COLOR_HIT_FLASH;
  }

  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;

  switch (type) {
    case 'jump':
      // Spiky triangle
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.fill();

      // Second smaller spike
      ctx.beginPath();
      ctx.moveTo(x + w * 0.25, y + h * 0.3);
      ctx.lineTo(x + w * 0.55, y + h);
      ctx.lineTo(x - w * 0.05, y + h);
      ctx.closePath();
      ctx.fill();

      // Warning glow
      ctx.globalAlpha = 0.3 + Math.sin(frame * 0.15) * 0.15;
      ctx.fillStyle = COLOR_SPIKE;
      ctx.fillRect(x - 2, y + h - 4, w + 4, 4);
      ctx.globalAlpha = 1;
      break;

    case 'shoot1':
      // Crate box
      ctx.fillRect(x, y, w, h);
      // Cross detail
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + h);
      ctx.moveTo(x + w, y);
      ctx.lineTo(x, y + h);
      ctx.stroke();
      // Border
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      break;

    case 'shoot2':
      // Barrel (rounded rect)
      ctx.beginPath();
      const r2 = 5;
      ctx.moveTo(x + r2, y);
      ctx.lineTo(x + w - r2, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r2);
      ctx.lineTo(x + w, y + h - r2);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r2, y + h);
      ctx.lineTo(x + r2, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r2);
      ctx.lineTo(x, y + r2);
      ctx.quadraticCurveTo(x, y, x + r2, y);
      ctx.closePath();
      ctx.fill();
      // Bands
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x + 2, y + h * 0.25, w - 4, 3);
      ctx.fillRect(x + 2, y + h * 0.65, w - 4, 3);
      // HP indicator
      drawHpDots(ctx, x, y - 8, w, hp, maxHp, color);
      break;

    case 'shoot3':
      // Fortified wall
      ctx.fillRect(x, y, w, h);
      // Brick pattern
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      for (let row = 0; row < h; row += 10) {
        const offset = (Math.floor(row / 10) % 2) * (w / 2);
        ctx.fillRect(x + offset, y + row, 1, 10);
        ctx.fillRect(x, y + row, w, 1);
      }
      // Reinforced edges
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      // HP indicator
      drawHpDots(ctx, x, y - 8, w, hp, maxHp, color);
      break;
  }

  ctx.shadowBlur = 0;
}

function drawHpDots(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, hp: number, maxHp: number, color: string) {
  const dotSize = 4;
  const gap = 3;
  const totalW = maxHp * (dotSize + gap) - gap;
  const startX = x + (w - totalW) / 2;

  for (let i = 0; i < maxHp; i++) {
    ctx.fillStyle = i < hp ? color : 'rgba(255,255,255,0.15)';
    ctx.fillRect(startX + i * (dotSize + gap), y, dotSize, dotSize);
  }
}

// ─── Main Render ──────────────────────────────────────────────────────────────

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, frame: number) {
  const shake = state.screenShake || 0;
  const shakeX = shake > 0 ? (Math.random() - 0.5) * shake * 2 : 0;
  const shakeY = shake > 0 ? (Math.random() - 0.5) * shake * 2 : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  // ── Sky gradient ──────────────────────────────────────────────────────────
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  skyGrad.addColorStop(0, COLOR_BG_TOP);
  skyGrad.addColorStop(1, COLOR_BG_BOTTOM);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(-10, -10, GAME_WIDTH + 20, GROUND_Y + 10);

  // ── Stars ─────────────────────────────────────────────────────────────────
  for (const star of state.stars) {
    const twinkle = 0.5 + Math.sin(frame * 0.03 + star.x) * 0.3;
    ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }

  // ── Distant city silhouette (parallax) ────────────────────────────────────
  ctx.fillStyle = '#0d1525';
  const cityOffset = (state.distanceTraveled * 0.03) % GAME_WIDTH;
  for (let i = -1; i <= 1; i++) {
    const base = -cityOffset + i * GAME_WIDTH;
    for (let bx = 0; bx < GAME_WIDTH; bx += 28) {
      const bh = 15 + Math.sin(bx * 0.7 + 13) * 20 + Math.cos(bx * 0.3) * 10;
      ctx.fillRect(base + bx, GROUND_Y - bh, 20, bh);
    }
  }

  // ── Mid-ground buildings ──────────────────────────────────────────────────
  ctx.fillStyle = '#111a30';
  const midOffset = (state.distanceTraveled * 0.08) % GAME_WIDTH;
  for (let i = -1; i <= 1; i++) {
    const base = -midOffset + i * GAME_WIDTH;
    for (let bx = 0; bx < GAME_WIDTH; bx += 50) {
      const bh = 20 + Math.sin(bx * 0.4 + 5) * 25;
      ctx.fillRect(base + bx, GROUND_Y - bh, 35, bh);
      // Window lights
      ctx.fillStyle = 'rgba(255, 200, 50, 0.15)';
      for (let wy = GROUND_Y - bh + 4; wy < GROUND_Y - 4; wy += 8) {
        for (let wx = base + bx + 4; wx < base + bx + 31; wx += 8) {
          if (Math.random() > 0.4) {
            ctx.fillRect(wx, wy, 3, 3);
          }
        }
      }
      ctx.fillStyle = '#111a30';
    }
  }

  // ── Ground ────────────────────────────────────────────────────────────────
  ctx.fillStyle = COLOR_GROUND;
  ctx.fillRect(-10, GROUND_Y, GAME_WIDTH + 20, GROUND_HEIGHT + 10);

  // Ground surface line
  ctx.fillStyle = COLOR_GROUND_LINE;
  ctx.fillRect(-10, GROUND_Y, GAME_WIDTH + 20, 2);

  // Ground details (scrolling dashes)
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (const tile of state.groundTiles) {
    ctx.fillRect(tile.x, GROUND_Y + 8 + tile.type * 6, 12, 1);
  }

  // ── Obstacles ─────────────────────────────────────────────────────────────
  for (const obs of state.obstacles) {
    if (obs.active) {
      drawObstacle(ctx, obs, frame);
    }
  }

  // ── Player ────────────────────────────────────────────────────────────────
  if (!state.gameOver) {
    drawPlayer(ctx, state.player.x, state.player.y, state.player.width, state.player.height, frame, state.player.isGrounded);
  }

  // ── Bullets ───────────────────────────────────────────────────────────────
  for (const bullet of state.bullets) {
    // Trail
    ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
    ctx.fillRect(bullet.x - 8, bullet.y + 1, 10, bullet.height - 2);

    // Bullet body
    ctx.fillStyle = COLOR_BULLET;
    ctx.shadowColor = COLOR_BULLET;
    ctx.shadowBlur = 6;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    ctx.shadowBlur = 0;
  }

  // ── Particles ─────────────────────────────────────────────────────────────
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 3;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;

  ctx.restore();

  // ── HUD ───────────────────────────────────────────────────────────────────
  ctx.fillStyle = '#ffffff';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${state.score}`, 10, 18);

  ctx.textAlign = 'right';
  const time = Math.floor(state.survivalTime);
  const mins = Math.floor(time / 60);
  const secs = time % 60;
  ctx.fillText(`${mins}:${secs.toString().padStart(2, '0')}`, GAME_WIDTH - 10, 18);

  // Speed indicator
  ctx.textAlign = 'center';
  const speedPct = Math.floor(((state.gameSpeed - 3.2) / (10 - 3.2)) * 100);
  if (speedPct > 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(`SPD ${speedPct}%`, GAME_WIDTH / 2, 18);
  }
}
