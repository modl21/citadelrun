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
  COLOR_GROUND_CRACK,
  COLOR_PLAYER,
  COLOR_PLAYER_COAT,
  COLOR_PLAYER_ACCENT,
  COLOR_BULLET,
  COLOR_BULLET_TRAIL,
  COLOR_SPIKE,
  COLOR_CRATE,
  COLOR_BARREL,
  COLOR_WALL,
  COLOR_HIT_FLASH,
  COLOR_SUN,
  COLOR_MESA,
  COLOR_RUIN,
} from './gameConstants';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function drawDustBand(
  ctx: CanvasRenderingContext2D,
  y: number,
  height: number,
  alpha: number,
  offset: number,
) {
  const grad = ctx.createLinearGradient(0, y, 0, y + height);
  grad.addColorStop(0, `rgba(255, 170, 95, ${alpha * 0.05})`);
  grad.addColorStop(0.5, `rgba(255, 130, 55, ${alpha})`);
  grad.addColorStop(1, `rgba(110, 55, 20, ${alpha * 0.08})`);

  ctx.fillStyle = grad;
  for (let i = -1; i <= 1; i++) {
    const base = -offset + i * GAME_WIDTH;
    ctx.fillRect(base - 20, y, GAME_WIDTH + 40, height);
  }
}

function drawMesaLayer(
  ctx: CanvasRenderingContext2D,
  distance: number,
  speed: number,
  color: string,
  minHeight: number,
  maxHeight: number,
  segment: number,
  seed: number,
) {
  const offset = (distance * speed) % GAME_WIDTH;
  ctx.fillStyle = color;

  for (let i = -1; i <= 1; i++) {
    const base = -offset + i * GAME_WIDTH;
    for (let x = -segment; x < GAME_WIDTH + segment; x += segment) {
      const n = (x + seed) * 0.055;
      const ridge = Math.abs(Math.sin(n)) * 0.55 + Math.abs(Math.cos(n * 0.67)) * 0.45;
      const topY = GROUND_Y - (minHeight + ridge * (maxHeight - minHeight));
      const left = base + x;
      const width = segment + 10;
      const right = left + width;

      ctx.beginPath();
      ctx.moveTo(left, GROUND_Y + 2);
      ctx.lineTo(left + width * 0.08, topY + 14);
      ctx.lineTo(left + width * 0.32, topY + 2);
      ctx.lineTo(left + width * 0.66, topY);
      ctx.lineTo(right - width * 0.06, topY + 12);
      ctx.lineTo(right, GROUND_Y + 2);
      ctx.closePath();
      ctx.fill();

      // Cliff edge highlight
      ctx.fillStyle = 'rgba(255, 183, 121, 0.08)';
      ctx.fillRect(left + width * 0.12, topY + 8, 2, Math.max(6, GROUND_Y - topY - 14));
      ctx.fillStyle = color;
    }
  }
}

function drawRuinLayer(
  ctx: CanvasRenderingContext2D,
  distance: number,
  speed: number,
  color: string,
  segment: number,
) {
  const offset = (distance * speed) % GAME_WIDTH;
  ctx.fillStyle = color;

  for (let i = -1; i <= 1; i++) {
    const base = -offset + i * GAME_WIDTH;
    for (let x = -segment; x < GAME_WIDTH + segment; x += segment) {
      const n = x * 0.03;
      const towerH = 16 + Math.abs(Math.sin(n + 1.3)) * 22;
      const towerW = 9 + Math.abs(Math.cos(n * 0.8)) * 7;
      const left = base + x;
      const top = GROUND_Y - towerH;

      // Tower body
      ctx.fillRect(left, top, towerW, towerH);

      // Broken top profile
      ctx.clearRect(left + 1, top, 2, 2);
      ctx.clearRect(left + towerW - 3, top + 1, 2, 2);

      // Arch / opening
      if (towerH > 20) {
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.fillRect(left + 2, GROUND_Y - 10, Math.max(2, towerW - 4), 8);
        ctx.fillStyle = color;
      }

      // Connector wall chunks
      const wallW = 12 + Math.abs(Math.sin(n * 1.4 + 2)) * 12;
      const wallH = 6 + Math.abs(Math.cos(n * 1.1 + 4)) * 8;
      ctx.fillRect(left + towerW - 1, GROUND_Y - wallH, wallW, wallH);

      // Rebar silhouette
      ctx.fillStyle = 'rgba(18, 8, 2, 0.6)';
      ctx.fillRect(left + towerW * 0.5, top - 3, 1, 4);
      ctx.fillRect(left + towerW * 0.5 + 3, top - 2, 1, 3);
      ctx.fillStyle = color;
    }
  }
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  frame: number,
  isGrounded: boolean,
) {
  const bob = isGrounded ? Math.sin(frame * 0.25) * 0.9 : -0.8;
  const stride = isGrounded ? Math.sin(frame * 0.28) * 2.8 : 0;
  const lean = isGrounded ? 0.8 : 1.8;
  const cx = x + w / 2;
  const py = y + bob;

  // Ground shadow
  if (py < GROUND_Y - h * 0.45) {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    const shadowW = w * 0.95;
    ctx.fillRect(x + (w - shadowW) / 2, GROUND_Y - 2, shadowW, 3);
  }

  // Rear leg + boot
  ctx.fillStyle = '#2f1a0a';
  ctx.fillRect(cx - 5 - lean * 0.2, py + h - 15, 4, 11 + Math.max(0, -stride));
  ctx.fillRect(cx - 7 - lean * 0.2, py + h - 4, 8, 3);

  // Front leg + boot
  ctx.fillRect(cx + 1 - lean * 0.2, py + h - 15, 4, 11 + Math.max(0, stride));
  ctx.fillRect(cx - 1 - lean * 0.2, py + h - 4, 8, 3);

  // Coat body (duster)
  ctx.fillStyle = COLOR_PLAYER_COAT;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 8;
  const coatTail = Math.max(-3, Math.min(3, stride));
  ctx.beginPath();
  ctx.moveTo(cx - 7 - lean, py + 11);
  ctx.lineTo(cx + 7 - lean, py + 10);
  ctx.lineTo(cx + 8 + coatTail - lean, py + h - 4);
  ctx.lineTo(cx - 9 + coatTail * 0.4 - lean, py + h - 4);
  ctx.closePath();
  ctx.fill();

  // Torso armor panel
  ctx.fillStyle = COLOR_PLAYER;
  ctx.fillRect(cx - 4 - lean, py + 10, 8, 11);

  // Belt + ammo bandolier accent
  ctx.fillStyle = '#2a1606';
  ctx.fillRect(cx - 6 - lean, py + 18, 12, 2);
  ctx.fillStyle = COLOR_PLAYER_ACCENT;
  ctx.fillRect(cx - 1 - lean, py + 12, 5, 2);

  // Arms
  const armSwing = isGrounded ? Math.sin(frame * 0.28 + Math.PI) * 1.8 : -1;
  ctx.fillStyle = COLOR_PLAYER_COAT;
  ctx.fillRect(cx - 10 - lean, py + 12, 5, 3);
  ctx.fillRect(cx + 4 - lean, py + 11 + armSwing * 0.35, 6, 3);

  // Weapon silhouette (sawn-off / scrap blaster)
  ctx.fillStyle = '#3f220f';
  ctx.fillRect(cx + 8 - lean, py + 12 + armSwing * 0.35, 5, 2);
  ctx.fillStyle = '#8b5b31';
  ctx.fillRect(cx + 6 - lean, py + 13 + armSwing * 0.35, 2, 2);

  // Head
  ctx.fillStyle = COLOR_PLAYER;
  ctx.beginPath();
  ctx.arc(cx - lean * 0.4, py + 7, 5, 0, Math.PI * 2);
  ctx.fill();

  // Hat (Mad Max style)
  ctx.fillStyle = '#2b1708';
  ctx.fillRect(cx - 6 - lean * 0.35, py + 1, 11, 3); // brim
  ctx.fillRect(cx - 4 - lean * 0.35, py - 2, 7, 4); // crown

  // Scarf / goggles accent
  ctx.fillStyle = COLOR_PLAYER_ACCENT;
  ctx.fillRect(cx - 1 - lean * 0.35, py + 6, 4, 2);

  ctx.shadowBlur = 0;
}

function drawHpDots(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  hp: number,
  maxHp: number,
  color: string,
) {
  const dotSize = 4;
  const gap = 3;
  const totalW = maxHp * (dotSize + gap) - gap;
  const startX = x + (w - totalW) / 2;

  for (let i = 0; i < maxHp; i++) {
    ctx.fillStyle = i < hp ? color : 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(startX + i * (dotSize + gap), y, dotSize, dotSize);
  }
}

function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, frame: number) {
  const { x, y, width: w, height: h, type, hp, maxHp, hitFlash } = obs;

  let color: string;
  switch (type) {
    case 'jump':
      color = COLOR_SPIKE;
      break;
    case 'shoot1':
      color = COLOR_CRATE;
      break;
    case 'shoot2':
      color = COLOR_BARREL;
      break;
    case 'shoot3':
      color = COLOR_WALL;
      break;
  }

  if (hitFlash > 0.3) {
    color = COLOR_HIT_FLASH;
  }

  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;

  switch (type) {
    case 'jump': {
      // Rebar spike cluster + hazard plate
      ctx.fillStyle = '#3a1d0f';
      ctx.fillRect(x - 2, y + h - 5, w + 4, 6);

      ctx.fillStyle = color;
      const pulse = 0.25 + Math.sin(frame * 0.18 + x * 0.06) * 0.08;
      for (let i = 0; i < 4; i++) {
        const sx = x + i * (w / 3.8);
        const sw = 5;
        const spikeTop = y + (i % 2 === 0 ? 2 : 6);

        ctx.beginPath();
        ctx.moveTo(sx, y + h - 4);
        ctx.lineTo(sx + sw * 0.5, spikeTop);
        ctx.lineTo(sx + sw, y + h - 4);
        ctx.closePath();
        ctx.fill();
      }

      // Electrified warning wire glow
      ctx.globalAlpha = pulse;
      ctx.fillStyle = 'rgba(255, 86, 24, 0.95)';
      ctx.fillRect(x - 1, y + h - 7, w + 2, 2);
      ctx.globalAlpha = 1;
      break;
    }

    case 'shoot1': {
      // Scrapyard mine crate
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);

      ctx.fillStyle = 'rgba(43, 22, 8, 0.45)';
      ctx.fillRect(x + 2, y + 2, w - 4, 5);
      ctx.fillRect(x + 2, y + h - 8, w - 4, 5);

      // Hazard symbol
      ctx.fillStyle = '#2a1506';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.5, y + h * 0.28);
      ctx.lineTo(x + w * 0.72, y + h * 0.66);
      ctx.lineTo(x + w * 0.28, y + h * 0.66);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 179, 94, 0.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      break;
    }

    case 'shoot2': {
      // Explosive fuel drum
      const r = 5;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Painted hazard rings
      ctx.fillStyle = 'rgba(36, 17, 6, 0.33)';
      ctx.fillRect(x + 2, y + h * 0.23, w - 4, 3);
      ctx.fillRect(x + 2, y + h * 0.62, w - 4, 3);

      // Corrosion patch
      ctx.fillStyle = 'rgba(248, 193, 119, 0.22)';
      ctx.fillRect(x + w * 0.62, y + h * 0.4, 4, 4);

      drawHpDots(ctx, x, y - 8, w, hp, maxHp, color);
      break;
    }

    case 'shoot3': {
      // Concrete barricade segment with rebar
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);

      // Slab seams
      ctx.fillStyle = 'rgba(26, 14, 6, 0.35)';
      for (let row = 5; row < h; row += 10) {
        ctx.fillRect(x + 1, y + row, w - 2, 1);
      }

      // Rebar spikes protruding
      ctx.fillStyle = '#2b1708';
      for (let i = 0; i < 3; i++) {
        const rx = x + 3 + i * ((w - 8) / 2);
        const rH = 4 + (i % 2);
        ctx.fillRect(rx, y - rH, 1, rH);
      }

      // Paint stripe remnant
      ctx.fillStyle = 'rgba(240, 150, 72, 0.2)';
      ctx.fillRect(x + 2, y + h * 0.36, w - 4, 2);

      ctx.strokeStyle = 'rgba(248, 200, 146, 0.22)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

      drawHpDots(ctx, x, y - 8, w, hp, maxHp, color);
      break;
    }
  }

  ctx.shadowBlur = 0;
}

// ─── Main Render ──────────────────────────────────────────────────────────────

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, frame: number) {
  const shake = state.screenShake || 0;
  const shakeX = shake > 0 ? (Math.random() - 0.5) * shake * 2 : 0;
  const shakeY = shake > 0 ? (Math.random() - 0.5) * shake * 2 : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  // ── Sky gradient ──────────────────────────────────────────────────────────
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y + 20);
  skyGrad.addColorStop(0, COLOR_BG_TOP);
  skyGrad.addColorStop(0.62, COLOR_BG_BOTTOM);
  skyGrad.addColorStop(1, '#552100');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(-10, -10, GAME_WIDTH + 20, GROUND_Y + 30);

  // ── Scorching sun and heat haze ───────────────────────────────────────────
  const sunX = GAME_WIDTH * 0.78;
  const sunY = GROUND_Y - 96;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, 48);
  sunGlow.addColorStop(0, 'rgba(255, 194, 88, 0.95)');
  sunGlow.addColorStop(0.35, `${COLOR_SUN}CC`);
  sunGlow.addColorStop(1, 'rgba(255, 122, 22, 0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 48, 0, Math.PI * 2);
  ctx.fill();

  // Horizon heat shimmer
  const haze = ctx.createLinearGradient(0, GROUND_Y - 45, 0, GROUND_Y + 12);
  haze.addColorStop(0, 'rgba(255, 170, 100, 0)');
  haze.addColorStop(0.5, 'rgba(255, 139, 55, 0.18)');
  haze.addColorStop(1, 'rgba(108, 45, 17, 0)');
  ctx.fillStyle = haze;
  ctx.fillRect(-12, GROUND_Y - 48, GAME_WIDTH + 24, 58);

  // ── Dust particles in the sky (reuses star field) ─────────────────────────
  for (const mote of state.stars) {
    const shimmer = 0.45 + Math.sin(frame * 0.02 + mote.x * 0.04) * 0.22;
    const alpha = Math.max(0.07, mote.brightness * 0.5 * shimmer);
    ctx.fillStyle = `rgba(255, 196, 126, ${alpha})`;
    ctx.fillRect(mote.x, mote.y, Math.max(0.8, mote.size), Math.max(0.8, mote.size));
  }

  // ── Moving dust bands ──────────────────────────────────────────────────────
  drawDustBand(ctx, GROUND_Y - 82, 22, 0.12, (state.distanceTraveled * 0.12) % GAME_WIDTH);
  drawDustBand(ctx, GROUND_Y - 58, 18, 0.08, (state.distanceTraveled * 0.19) % GAME_WIDTH);

  // ── Distant mesas and ruined skyline (parallax) ───────────────────────────
  drawMesaLayer(ctx, state.distanceTraveled, 0.025, COLOR_MESA, 62, 94, 70, 13);
  drawRuinLayer(ctx, state.distanceTraveled, 0.055, COLOR_RUIN, 56);

  // ── Foreground ruined mounds ───────────────────────────────────────────────
  ctx.fillStyle = '#261305';
  const moundOffset = (state.distanceTraveled * 0.11) % GAME_WIDTH;
  for (let i = -1; i <= 1; i++) {
    const base = -moundOffset + i * GAME_WIDTH;
    for (let x = -20; x < GAME_WIDTH + 30; x += 44) {
      const ridge = Math.abs(Math.sin(x * 0.06 + 1.2)) * 10;
      const mW = 34;
      const top = GROUND_Y - 10 - ridge;
      const left = base + x;

      ctx.beginPath();
      ctx.moveTo(left, GROUND_Y + 1);
      ctx.lineTo(left + 8, top + 7);
      ctx.lineTo(left + 20, top);
      ctx.lineTo(left + mW, GROUND_Y + 1);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ── Ground ────────────────────────────────────────────────────────────────
  const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, GAME_HEIGHT);
  groundGrad.addColorStop(0, COLOR_GROUND_LINE);
  groundGrad.addColorStop(0.18, COLOR_GROUND);
  groundGrad.addColorStop(1, '#1a0c02');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(-10, GROUND_Y, GAME_WIDTH + 20, GROUND_HEIGHT + 10);

  // Surface line
  ctx.fillStyle = COLOR_GROUND_LINE;
  ctx.fillRect(-10, GROUND_Y, GAME_WIDTH + 20, 2);

  // Cracks and grit
  for (const tile of state.groundTiles) {
    const baseX = tile.x;
    const y = GROUND_Y + 7 + tile.type * 5;

    ctx.fillStyle = COLOR_GROUND_CRACK;
    ctx.fillRect(baseX + 3, y, 11, 1);
    ctx.fillRect(baseX + 10, y + 3, 6, 1);

    ctx.fillStyle = 'rgba(245, 172, 114, 0.12)';
    ctx.fillRect(baseX + 8, y - 1, 1, 1);
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
    ctx.fillStyle = `${COLOR_BULLET_TRAIL}66`;
    ctx.fillRect(bullet.x - 9, bullet.y + 1, 11, bullet.height - 2);

    // Bullet body
    ctx.fillStyle = COLOR_BULLET;
    ctx.shadowColor = COLOR_BULLET;
    ctx.shadowBlur = 7;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    // Spark tip
    ctx.fillStyle = '#ffd18a';
    ctx.fillRect(bullet.x + bullet.width - 1, bullet.y + 1, 2, Math.max(1, bullet.height - 2));
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
  ctx.fillStyle = '#fff4db';
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
    ctx.fillStyle = 'rgba(255, 208, 142, 0.45)';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(`SPD ${speedPct}%`, GAME_WIDTH / 2, 18);
  }
}
