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

// ─── Colors ───────────────────────────────────────────────────────────────────
export const COLOR_BG_TOP = '#0a0914';
export const COLOR_BG_BOTTOM = '#0f1a2e';
export const COLOR_GROUND = '#1a2640';
export const COLOR_GROUND_LINE = '#2a3f60';
export const COLOR_PLAYER = '#22d3ee';      // cyan
export const COLOR_PLAYER_ACCENT = '#f0abfc'; // pink accent
export const COLOR_BULLET = '#fde047';      // yellow
export const COLOR_SPIKE = '#ef4444';       // red — must jump
export const COLOR_CRATE = '#84cc16';       // lime — 1-shot
export const COLOR_BARREL = '#f97316';      // orange — 2-shot
export const COLOR_WALL = '#a855f7';        // purple — 3-shot
export const COLOR_HIT_FLASH = '#ffffff';
export const COLOR_PARTICLE_DUST = '#94a3b8';

// ─── Payment / Nostr ─────────────────────────────────────────────────────────
export const PAYMENT_AMOUNT_SATS = 100;
export const PAYMENT_RECIPIENT = 'tony@npubx.cash';
export const GAME_SCORE_KIND = 1448;
export const GAME_TAG = 'citadel-run';
