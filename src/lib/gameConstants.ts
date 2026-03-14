// ─── Canvas ───────────────────────────────────────────────────────────────────
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 260;

// ─── Ground ───────────────────────────────────────────────────────────────────
export const GROUND_Y = GAME_HEIGHT - 40; // y where the ground surface is
export const GROUND_HEIGHT = 40;

// ─── Player ───────────────────────────────────────────────────────────────────
export const PLAYER_X = 72;             // fixed horizontal position
export const PLAYER_WIDTH = 28;
export const PLAYER_HEIGHT = 36;
/** y when standing on ground */
export const PLAYER_GROUND_Y = GROUND_Y - PLAYER_HEIGHT;

// ─── Physics ──────────────────────────────────────────────────────────────────
export const GRAVITY = 0.55;
export const JUMP_VELOCITY = -11.5;

// ─── Bullets ──────────────────────────────────────────────────────────────────
export const BULLET_WIDTH = 14;
export const BULLET_HEIGHT = 5;
export const BULLET_SPEED = 12;         // px per frame, rightward
export const BULLET_COOLDOWN = 300;     // ms between shots

// ─── Obstacles ────────────────────────────────────────────────────────────────
/** Min/max pixel gap between obstacle spawns */
export const OBSTACLE_GAP_MIN = 260;
export const OBSTACLE_GAP_MAX = 520;

// jump-only obstacles: spikes — cannot be shot
export const SPIKE_WIDTH = 28;
export const SPIKE_HEIGHT = 32;

// shoot-1 obstacle: crate
export const CRATE_WIDTH = 30;
export const CRATE_HEIGHT = 30;

// shoot-2 obstacle: barrel
export const BARREL_WIDTH = 28;
export const BARREL_HEIGHT = 36;

// shoot-3 obstacle: wall segment
export const WALL_WIDTH = 22;
export const WALL_HEIGHT = 52;

// ─── Background parallax ──────────────────────────────────────────────────────
export const PARALLAX_FAR_SPEED = 0.15;
export const PARALLAX_MID_SPEED = 0.45;

// ─── Difficulty ───────────────────────────────────────────────────────────────
export const INITIAL_SPEED = 3.2;           // px / frame at start
export const MAX_SPEED = 10;                // px / frame cap
export const SPEED_RAMP_PER_SECOND = 0.014; // how much speed grows per second
export const DIFFICULTY_RAMP_INTERVAL = 10; // seconds between difficulty bumps

// ─── Scoring ──────────────────────────────────────────────────────────────────
export const SCORE_PER_SECOND = 1;          // survival score
export const SCORE_SHOOT1 = 15;             // destroying 1-hit obstacle
export const SCORE_SHOOT2 = 30;             // destroying 2-hit obstacle
export const SCORE_SHOOT3 = 50;             // destroying 3-hit obstacle
export const SCORE_HIT = 5;                 // partial hit on multi-hp obstacle

// ─── Colors — Mad Max Wasteland ──────────────────────────────────────────────
export const COLOR_BG_TOP = '#1a0a00';        // deep burnt orange-black sky
export const COLOR_BG_BOTTOM = '#3d1a00';     // scorched horizon glow
export const COLOR_GROUND = '#2a1800';        // cracked parched earth
export const COLOR_GROUND_LINE = '#5c3010';   // dried crust surface line
export const COLOR_GROUND_CRACK = '#1a0e00';  // crack details
export const COLOR_PLAYER = '#e8a422';        // sun-baked amber hero
export const COLOR_PLAYER_COAT = '#7c4a10';   // brown leather coat
export const COLOR_PLAYER_ACCENT = '#ff6b1a'; // fire/ember orange
export const COLOR_BULLET = '#ff9900';        // blazing amber shot
export const COLOR_BULLET_TRAIL = '#ff4400';  // fire trail
export const COLOR_SPIKE = '#cc2200';         // blood-red spikes — must jump
export const COLOR_CRATE = '#8b6914';         // rusted tin crate — 1-shot
export const COLOR_BARREL = '#b34000';        // corroded drum — 2-shot
export const COLOR_WALL = '#4a3520';          // broken stone wall — 3-shot
export const COLOR_HIT_FLASH = '#ffcc44';     // golden flash on hit
export const COLOR_PARTICLE_DUST = '#c4793a'; // sand/dust particles
export const COLOR_SUN = '#ff8800';           // scorching sun
export const COLOR_MESA = '#2e1505';          // far mesa silhouette
export const COLOR_RUIN = '#1e1005';          // distant ruins

// ─── Payment / Nostr ─────────────────────────────────────────────────────────
export const PAYMENT_AMOUNT_SATS = 100;
export const PAYMENT_RECIPIENT = 'tony@npubx.cash';
export const GAME_SCORE_KIND = 1448;
export const GAME_TAG = 'citadel-run';
