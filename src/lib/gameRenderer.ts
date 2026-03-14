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
  grad.addColorStop(0, `rgba(115, 86, 62, ${alpha * 0.08})`);
  grad.addColorStop(0.45, `rgba(84, 62, 45, ${alpha * 0.75})`);
  grad.addColorStop(1, `rgba(40, 29, 21, ${alpha * 0.18})`);

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

      // Cliff edge weathering
      ctx.fillStyle = 'rgba(154, 121, 96, 0.1)';
      ctx.fillRect(left + width * 0.12, topY + 8, 1, Math.max(6, GROUND_Y - topY - 14));
      ctx.fillStyle = 'rgba(20, 13, 8, 0.14)';
      ctx.fillRect(left + width * 0.6, topY + 10, 1, Math.max(5, GROUND_Y - topY - 18));
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
      // Barbed wire hazard coil
      const postW = 2;
      const wireY = y + h * 0.42;

      // Rust posts
      ctx.fillStyle = '#4f3a2c';
      ctx.fillRect(x + 2, y + h * 0.1, postW, h * 0.9);
      ctx.fillRect(x + w - 4, y + h * 0.1, postW, h * 0.9);

      // Coiled wires
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i <= 22; i++) {
        const t = i / 22;
        const wx = x + 3 + t * (w - 6);
        const wy = wireY + Math.sin(t * Math.PI * 3.5 + frame * 0.03) * 3;
        if (i === 0) {
          ctx.moveTo(wx, wy);
        } else {
          ctx.lineTo(wx, wy);
        }
      }
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i <= 22; i++) {
        const t = i / 22;
        const wx = x + 3 + t * (w - 6);
        const wy = wireY + 6 + Math.sin(t * Math.PI * 3.2 + 1.2 + frame * 0.03) * 3;
        if (i === 0) {
          ctx.moveTo(wx, wy);
        } else {
          ctx.lineTo(wx, wy);
        }
      }
      ctx.stroke();

      // Barbs
      ctx.strokeStyle = '#7d7368';
      ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        const bx = x + 5 + i * ((w - 10) / 6);
        const by = wireY + (i % 2 ? 1 : -1);
        ctx.beginPath();
        ctx.moveTo(bx - 1.5, by - 1.2);
        ctx.lineTo(bx + 1.5, by + 1.2);
        ctx.moveTo(bx - 1.5, by + 1.2);
        ctx.lineTo(bx + 1.5, by - 1.2);
        ctx.stroke();
      }

      // Dusty base shadow
      ctx.fillStyle = 'rgba(20, 12, 8, 0.35)';
      ctx.fillRect(x - 1, y + h - 3, w + 2, 3);
      break;
    }

    case 'shoot1': {
      // Scrapyard truck wreck
      const bodyY = y + h * 0.28;
      const bodyH = h * 0.48;
      const cabW = w * 0.36;

      // Main chassis
      ctx.fillStyle = color;
      ctx.fillRect(x + 1, bodyY, w - 2, bodyH);

      // Cab
      ctx.fillStyle = '#7b5a1a';
      ctx.fillRect(x + w - cabW - 1, y + h * 0.15, cabW, bodyH + h * 0.13);

      // Bed rail
      ctx.fillStyle = 'rgba(38, 20, 6, 0.5)';
      ctx.fillRect(x + 2, bodyY + 2, w * 0.45, 2);

      // Window crack
      ctx.fillStyle = 'rgba(16, 9, 3, 0.55)';
      ctx.fillRect(x + w - cabW + 2, y + h * 0.24, cabW - 5, 4);

      // Wheels
      ctx.fillStyle = '#211104';
      ctx.fillRect(x + 4, y + h - 6, 7, 6);
      ctx.fillRect(x + w - 11, y + h - 6, 7, 6);
      ctx.fillStyle = '#674925';
      ctx.fillRect(x + 6, y + h - 4, 3, 2);
      ctx.fillRect(x + w - 9, y + h - 4, 3, 2);

      // Rust stripe + grime streaks
      ctx.fillStyle = 'rgba(178, 128, 82, 0.2)';
      ctx.fillRect(x + 3, bodyY + bodyH * 0.55, w - 6, 2);
      ctx.fillStyle = 'rgba(24, 15, 9, 0.26)';
      ctx.fillRect(x + 6, bodyY + 1, 1, bodyH + 3);
      ctx.fillRect(x + w * 0.58, bodyY + 2, 1, bodyH + 2);

      // Bullet dents
      ctx.fillStyle = 'rgba(23, 13, 7, 0.5)';
      ctx.fillRect(x + 8, bodyY + 6, 2, 1);
      ctx.fillRect(x + w * 0.45, bodyY + 9, 2, 1);

      ctx.strokeStyle = 'rgba(195, 146, 99, 0.26)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, bodyY + 0.5, w - 1, bodyH + h * 0.13 - 1);
      break;
    }

    case 'shoot2': {
      // Fuel drum
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

      // Corrosion patch + grime
      ctx.fillStyle = 'rgba(182, 140, 98, 0.2)';
      ctx.fillRect(x + w * 0.62, y + h * 0.4, 4, 4);
      ctx.fillStyle = 'rgba(28, 17, 10, 0.28)';
      ctx.fillRect(x + 4, y + h * 0.34, 1, h * 0.5);
      ctx.fillRect(x + w - 6, y + h * 0.3, 1, h * 0.55);

      drawHpDots(ctx, x, y - 8, w, hp, maxHp, color);
      break;
    }

    case 'shoot3': {
      // Small wasteland citadel
      const wallTop = y + 10;
      const wallH = h - 10;

      // Base wall
      ctx.fillStyle = color;
      ctx.fillRect(x, wallTop, w, wallH);

      // Battlements
      ctx.fillRect(x + 1, y + 6, 4, 5);
      ctx.fillRect(x + w * 0.5 - 2, y + 4, 5, 7);
      ctx.fillRect(x + w - 6, y + 6, 4, 5);

      // Gate
      ctx.fillStyle = 'rgba(30, 16, 7, 0.45)';
      ctx.fillRect(x + w * 0.38, y + h - 13, w * 0.24, 10);

      // Side braces
      ctx.fillStyle = '#3b2919';
      ctx.fillRect(x + 2, wallTop + 5, 2, wallH - 7);
      ctx.fillRect(x + w - 4, wallTop + 5, 2, wallH - 7);

      // Flag/rebar pole
      ctx.fillStyle = '#2b1708';
      ctx.fillRect(x + w * 0.5, y - 4, 1, 8);
      ctx.fillStyle = 'rgba(240, 150, 72, 0.28)';
      ctx.fillRect(x + w * 0.5 + 1, y - 4, 4, 2);

      // Surface wear + blast scars
      ctx.fillStyle = 'rgba(173, 143, 114, 0.15)';
      ctx.fillRect(x + 2, wallTop + 7, w - 4, 1);
      ctx.fillRect(x + 3, wallTop + 16, w - 6, 1);
      ctx.fillStyle = 'rgba(20, 12, 8, 0.32)';
      ctx.fillRect(x + 5, wallTop + 12, 2, 1);
      ctx.fillRect(x + w - 8, wallTop + 18, 2, 1);

      ctx.strokeStyle = 'rgba(173, 143, 114, 0.24)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, wallTop + 0.5, w - 1, wallH - 1);

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
  skyGrad.addColorStop(0.58, COLOR_BG_BOTTOM);
  skyGrad.addColorStop(1, '#1e1510');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(-10, -10, GAME_WIDTH + 20, GROUND_Y + 30);

  // ── Scorching sun and heat haze ───────────────────────────────────────────
  const sunX = GAME_WIDTH * 0.78;
  const sunY = GROUND_Y - 96;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, 52);
  sunGlow.addColorStop(0, 'rgba(234, 177, 123, 0.72)');
  sunGlow.addColorStop(0.4, `${COLOR_SUN}9A`);
  sunGlow.addColorStop(1, 'rgba(92, 58, 34, 0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 48, 0, Math.PI * 2);
  ctx.fill();

  // Horizon heat shimmer + ash band
  const haze = ctx.createLinearGradient(0, GROUND_Y - 45, 0, GROUND_Y + 12);
  haze.addColorStop(0, 'rgba(145, 110, 79, 0)');
  haze.addColorStop(0.5, 'rgba(113, 84, 58, 0.2)');
  haze.addColorStop(1, 'rgba(62, 42, 27, 0)');
  ctx.fillStyle = haze;
  ctx.fillRect(-12, GROUND_Y - 48, GAME_WIDTH + 24, 58);

  const ashBand = ctx.createLinearGradient(0, GROUND_Y - 26, 0, GROUND_Y + 4);
  ashBand.addColorStop(0, 'rgba(46, 33, 24, 0)');
  ashBand.addColorStop(0.5, 'rgba(39, 29, 22, 0.25)');
  ashBand.addColorStop(1, 'rgba(46, 33, 24, 0)');
  ctx.fillStyle = ashBand;
  ctx.fillRect(-10, GROUND_Y - 28, GAME_WIDTH + 20, 34);

  // ── Dust particles in the sky (reuses star field) ─────────────────────────
  for (const mote of state.stars) {
    const shimmer = 0.45 + Math.sin(frame * 0.02 + mote.x * 0.04) * 0.22;
    const alpha = Math.max(0.05, mote.brightness * 0.42 * shimmer);
    ctx.fillStyle = `rgba(168, 138, 109, ${alpha})`;
    ctx.fillRect(mote.x, mote.y, Math.max(0.8, mote.size), Math.max(0.8, mote.size));
  }

  // ── Moving dust bands ──────────────────────────────────────────────────────
  drawDustBand(ctx, GROUND_Y - 82, 22, 0.12, (state.distanceTraveled * 0.12) % GAME_WIDTH);
  drawDustBand(ctx, GROUND_Y - 58, 18, 0.08, (state.distanceTraveled * 0.19) % GAME_WIDTH);

  // ── Distant mesas and ruined skyline (parallax) ───────────────────────────
  drawMesaLayer(ctx, state.distanceTraveled, 0.025, COLOR_MESA, 62, 94, 70, 13);
  drawRuinLayer(ctx, state.distanceTraveled, 0.055, COLOR_RUIN, 56);

  // ── Foreground ruined mounds ───────────────────────────────────────────────
  ctx.fillStyle = '#221710';
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
  groundGrad.addColorStop(0.2, COLOR_GROUND);
  groundGrad.addColorStop(1, '#140f0c');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(-10, GROUND_Y, GAME_WIDTH + 20, GROUND_HEIGHT + 10);

  // Surface line
  ctx.fillStyle = COLOR_GROUND_LINE;
  ctx.fillRect(-10, GROUND_Y, GAME_WIDTH + 20, 2);

  // Dry mud ripple shadows
  ctx.fillStyle = 'rgba(18, 12, 9, 0.24)';
  for (let rx = -8; rx < GAME_WIDTH + 20; rx += 24) {
    ctx.fillRect(rx, GROUND_Y + 3 + ((rx / 24) % 2), 12, 1);
  }

  // Cracks and grit
  for (const tile of state.groundTiles) {
    const baseX = tile.x;
    const y = GROUND_Y + 7 + tile.type * 5;

    ctx.fillStyle = COLOR_GROUND_CRACK;
    ctx.fillRect(baseX + 3, y, 11, 1);
    ctx.fillRect(baseX + 10, y + 3, 6, 1);

    ctx.fillStyle = 'rgba(160, 132, 102, 0.16)';
    ctx.fillRect(baseX + 8, y - 1, 1, 1);

    // Debris pebbles
    ctx.fillStyle = 'rgba(33, 22, 15, 0.35)';
    ctx.fillRect(baseX + 15, y + 1, 1, 1);
    ctx.fillRect(baseX + 21, y + 4, 1, 1);
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

  // Foreground dust veil for depth
  const nearDust = ctx.createLinearGradient(0, GROUND_Y - 24, 0, GROUND_Y + 8);
  nearDust.addColorStop(0, 'rgba(48, 35, 24, 0)');
  nearDust.addColorStop(0.45, 'rgba(57, 42, 30, 0.18)');
  nearDust.addColorStop(1, 'rgba(48, 35, 24, 0)');
  ctx.fillStyle = nearDust;
  ctx.fillRect(-10, GROUND_Y - 24, GAME_WIDTH + 20, 34);

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

  // ── Fuel explosion ring (big blast) ───────────────────────────────────────
  if (state.fuelExplosionTimer > 0) {
    const t = 1 - state.fuelExplosionTimer / 26;
    const radius = 8 + t * 48;
    const alpha = Math.max(0, 0.85 - t * 0.85);

    const blast = ctx.createRadialGradient(
      state.fuelExplosionX,
      state.fuelExplosionY,
      4,
      state.fuelExplosionX,
      state.fuelExplosionY,
      radius,
    );
    blast.addColorStop(0, `rgba(255, 228, 168, ${alpha})`);
    blast.addColorStop(0.45, `rgba(212, 176, 122, ${alpha * 0.75})`);
    blast.addColorStop(1, 'rgba(82, 49, 28, 0)');

    ctx.fillStyle = blast;
    ctx.beginPath();
    ctx.arc(state.fuelExplosionX, state.fuelExplosionY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 214, 153, ${alpha * 0.8})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(state.fuelExplosionX, state.fuelExplosionY, radius * 0.72, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();

  // ── HUD ───────────────────────────────────────────────────────────────────
  ctx.fillStyle = '#d8c2a0';
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

  // Flash warning when fuel penalty triggers
  if (state.fuelFlashTimer > 0) {
    const blinkOn = Math.floor(state.fuelFlashTimer / 3) % 2 === 0;
    if (blinkOn) {
      ctx.textAlign = 'center';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = 'rgba(255, 228, 178, 0.95)';
      ctx.fillText('10% FASTER', GAME_WIDTH / 2, 34);
    }
  }
}
