import { useRef, useEffect, useCallback, useState } from 'react';

import { createInitialState, updateGame } from '@/lib/gameEngine';
import { renderGame } from '@/lib/gameRenderer';
import { GAME_WIDTH, GAME_HEIGHT } from '@/lib/gameConstants';
import type { GameState } from '@/lib/gameTypes';

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  isPlaying: boolean;
  isMobile: boolean;
}

export function GameCanvas({ onGameOver, isPlaying, isMobile }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(createInitialState(performance.now()));
  const frameRef = useRef(0);
  const animFrameRef = useRef(0);
  const gameOverCalledRef = useRef(false);
  const [canvasScale, setCanvasScale] = useState(1);

  // Input refs
  const jumpRef = useRef(false);
  const shootRef = useRef(false);

  // ── Canvas scaling ──────────────────────────────────────────────────────────
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

  // ── Reset game when starting ─────────────────────────────────────────────────
  useEffect(() => {
    gameStateRef.current = createInitialState(performance.now());
    gameOverCalledRef.current = false;
    jumpRef.current = false;
    shootRef.current = false;
  }, [isPlaying]);

  // ── Desktop Keyboard Controls ───────────────────────────────────────────────
  // Space = Jump, Enter = Shoot
  useEffect(() => {
    if (!isPlaying) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        jumpRef.current = true;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        shootRef.current = true;
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        jumpRef.current = false;
      }
      if (e.key === 'Enter') {
        shootRef.current = false;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying]);

  // ── Mobile Touch Controls ───────────────────────────────────────────────────
  const handleTouchStartJump = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    jumpRef.current = true;
  }, []);

  const handleTouchEndJump = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    jumpRef.current = false;
  }, []);

  const handleTouchStartShoot = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    shootRef.current = true;
  }, []);

  const handleTouchEndShoot = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    shootRef.current = false;
  }, []);

  // ── Game loop ───────────────────────────────────────────────────────────────
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

  // ── Idle animation when not playing ─────────────────────────────────────────
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
        speedMultiplier: 1,
      };
      renderGame(ctx!, idleState, frame);
      idleAnimFrame = requestAnimationFrame(animateIdle);
    }

    idleAnimFrame = requestAnimationFrame(animateIdle);
    return () => cancelAnimationFrame(idleAnimFrame);
  }, [isPlaying]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="game-canvas rounded-lg border border-orange-800/60 shadow-[0_0_40px_rgba(180,60,0,0.25)]"
        style={{
          width: GAME_WIDTH * canvasScale,
          height: GAME_HEIGHT * canvasScale,
          imageRendering: 'pixelated'
        }}
      />

      {/* Mobile Controls Overlay */}
      {isPlaying && isMobile && (
        <div className="absolute inset-0 z-10 pointer-events-none touch-none select-none">
          {/* JUMP — left side */}
          <div className="absolute bottom-4 left-3 pointer-events-auto">
            <button
              className="w-28 h-28 rounded-full bg-amber-500/25 border-2 border-amber-400/60 active:bg-amber-500/50 flex items-center justify-center transition-colors shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              onTouchStart={handleTouchStartJump}
              onTouchEnd={handleTouchEndJump}
              onMouseDown={handleTouchStartJump}
              onMouseUp={handleTouchEndJump}
              onTouchCancel={handleTouchEndJump}
            >
              <span className="text-amber-200 font-bold text-xl pointer-events-none tracking-widest drop-shadow-lg select-none">JUMP</span>
            </button>
          </div>

          {/* SHOOT — right side */}
          <div className="absolute bottom-4 right-3 pointer-events-auto">
            <button
              className="w-28 h-28 rounded-full bg-red-600/25 border-2 border-red-500/60 active:bg-red-600/50 flex items-center justify-center transition-colors shadow-[0_0_20px_rgba(220,38,38,0.2)]"
              onTouchStart={handleTouchStartShoot}
              onTouchEnd={handleTouchEndShoot}
              onMouseDown={handleTouchStartShoot}
              onMouseUp={handleTouchEndShoot}
              onTouchCancel={handleTouchEndShoot}
            >
              <span className="text-red-200 font-bold text-xl pointer-events-none tracking-widest drop-shadow-lg select-none">FIRE</span>
            </button>
          </div>

        </div>
      )}

      {/* Desktop hint */}
      {isPlaying && !isMobile && (
        <div className="absolute top-2 w-full text-center pointer-events-none text-amber-200/40 text-[10px] hidden sm:block">
          SPACE to Jump &bull; ENTER to Fire
        </div>
      )}
    </div>
  );
}
