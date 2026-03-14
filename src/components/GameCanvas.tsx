import { useRef, useEffect, useCallback, useState } from 'react';

import { createInitialState, updateGame } from '@/lib/gameEngine';
import { renderGame } from '@/lib/gameRenderer';
import { GAME_WIDTH, GAME_HEIGHT } from '@/lib/gameConstants';
import type { GameState } from '@/lib/gameTypes';

const DOUBLE_TAP_THRESHOLD = 300; // ms

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  isPlaying: boolean;
}

export function GameCanvas({ onGameOver, isPlaying }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(createInitialState(performance.now()));
  const frameRef = useRef(0);
  const animFrameRef = useRef(0);
  const gameOverCalledRef = useRef(false);
  const [canvasScale, setCanvasScale] = useState(1);

  // Input refs
  const jumpRef = useRef(false);
  const shootRef = useRef(false);
  const lastTapRef = useRef(0);

  // ── Canvas scaling ──────────────────────────────────────────────────────
  useEffect(() => {
    function handleResize() {
      const maxW = Math.min(window.innerWidth - 16, 640);
      const maxH = window.innerHeight - 200;
      const scaleW = maxW / GAME_WIDTH;
      const scaleH = maxH / GAME_HEIGHT;
      setCanvasScale(Math.min(scaleW, scaleH, 1.5));
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Reset game when starting ────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      gameStateRef.current = createInitialState(performance.now());
      gameOverCalledRef.current = false;
      jumpRef.current = false;
      shootRef.current = false;
      lastTapRef.current = 0;
    }
  }, [isPlaying]);

  // ── Input: determines jump vs shoot based on single/double press ────────
  const handleAction = useCallback(() => {
    const now = performance.now();
    const sinceLastTap = now - lastTapRef.current;

    if (sinceLastTap < DOUBLE_TAP_THRESHOLD) {
      // Double tap/press → shoot
      shootRef.current = true;
      lastTapRef.current = 0; // reset to prevent triple-tap triggering another shoot
      // auto-release shoot after a short window
      setTimeout(() => {
        shootRef.current = false;
      }, 80);
    } else {
      // First tap → will jump (unless followed quickly by second tap)
      lastTapRef.current = now;
      // Delay the jump slightly to detect a possible double-tap
      setTimeout(() => {
        if (lastTapRef.current === now) {
          // No second tap came — execute jump
          jumpRef.current = true;
          setTimeout(() => {
            jumpRef.current = false;
          }, 60);
        }
      }, DOUBLE_TAP_THRESHOLD * 0.6);
    }
  }, []);

  // ── Desktop keyboard controls ───────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (e.repeat) return; // ignore held key repeats
        handleAction();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, handleAction]);

  // ── Mobile touch controls ───────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    function handleTouch(e: TouchEvent) {
      e.preventDefault();
      handleAction();
    }

    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    return () => {
      canvas.removeEventListener('touchstart', handleTouch);
    };
  }, [isPlaying, handleAction]);

  // Also handle click for desktop mouse
  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    function handleClick(e: MouseEvent) {
      e.preventDefault();
      handleAction();
    }

    canvas.addEventListener('mousedown', handleClick);
    return () => {
      canvas.removeEventListener('mousedown', handleClick);
    };
  }, [isPlaying, handleAction]);

  // ── Game loop ───────────────────────────────────────────────────────────
  const gameLoop = useCallback(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = performance.now();
    const state = gameStateRef.current;

    if (!state.gameOver) {
      gameStateRef.current = updateGame(
        state,
        { jump: jumpRef.current, shoot: shootRef.current },
        now,
      );
    } else if (!gameOverCalledRef.current) {
      gameOverCalledRef.current = true;
      onGameOver(state.score);
    }

    frameRef.current++;
    renderGame(ctx, gameStateRef.current, frameRef.current);

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, onGameOver]);

  useEffect(() => {
    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, gameLoop]);

  // ── Idle animation when not playing ─────────────────────────────────────
  useEffect(() => {
    if (isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let idleState = createInitialState(performance.now());
    // Spawn some obstacles for visual interest
    idleState.obstacles = [
      { x: 200, y: GAME_HEIGHT - 40 - 32, width: 28, height: 32, type: 'jump', hp: 999, maxHp: 999, active: true, hitFlash: 0 },
      { x: 320, y: GAME_HEIGHT - 40 - 30, width: 30, height: 30, type: 'shoot1', hp: 1, maxHp: 1, active: true, hitFlash: 0 },
      { x: 420, y: GAME_HEIGHT - 40 - 36, width: 28, height: 36, type: 'shoot2', hp: 2, maxHp: 2, active: true, hitFlash: 0 },
    ];

    let idleAnimFrame: number;

    function animateIdle() {
      frame++;
      // Slow scroll
      idleState = {
        ...idleState,
        stars: idleState.stars.map((s) => {
          let nx = s.x - s.speed * 1.5;
          if (nx < -2) nx += GAME_WIDTH + 4;
          return { ...s, x: nx };
        }),
        distanceTraveled: idleState.distanceTraveled + 0.5,
        obstacles: idleState.obstacles.map((o) => {
          let nx = o.x - 0.5;
          if (nx < -40) nx += GAME_WIDTH + 80;
          return { ...o, x: nx };
        }),
        groundTiles: idleState.groundTiles.map((t) => {
          let nx = t.x - 0.5;
          if (nx < -40) nx += GAME_WIDTH + 80;
          return { ...t, x: nx };
        }),
        frame,
        survivalTime: 0,
        gameSpeed: 1.5,
      };
      renderGame(ctx!, idleState, frame);
      idleAnimFrame = requestAnimationFrame(animateIdle);
    }

    idleAnimFrame = requestAnimationFrame(animateIdle);
    return () => cancelAnimationFrame(idleAnimFrame);
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={GAME_WIDTH}
      height={GAME_HEIGHT}
      className="game-canvas rounded-lg border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.12)]"
      style={{
        width: GAME_WIDTH * canvasScale,
        height: GAME_HEIGHT * canvasScale,
      }}
    />
  );
}
