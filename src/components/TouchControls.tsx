import { useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Crosshair } from 'lucide-react';

interface TouchControlsProps {
  keysRef: React.MutableRefObject<{ left: boolean; right: boolean; shoot: boolean }>;
}

export function TouchControls({ keysRef }: TouchControlsProps) {
  const shootTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLeft = useCallback(() => {
    keysRef.current.left = true;
    keysRef.current.right = false;
  }, [keysRef]);

  const stopLeft = useCallback(() => {
    keysRef.current.left = false;
  }, [keysRef]);

  const startRight = useCallback(() => {
    keysRef.current.right = true;
    keysRef.current.left = false;
  }, [keysRef]);

  const stopRight = useCallback(() => {
    keysRef.current.right = false;
  }, [keysRef]);

  const startShoot = useCallback(() => {
    // Fire immediately
    keysRef.current.shoot = true;
    // Keep firing while held
    shootTimerRef.current = setInterval(() => {
      keysRef.current.shoot = true;
      setTimeout(() => { keysRef.current.shoot = false; }, 50);
    }, 200);
  }, [keysRef]);

  const stopShoot = useCallback(() => {
    keysRef.current.shoot = false;
    if (shootTimerRef.current) {
      clearInterval(shootTimerRef.current);
      shootTimerRef.current = null;
    }
  }, [keysRef]);

  return (
    <div className="w-full max-w-md mx-auto flex items-center justify-between px-2 select-none" style={{ touchAction: 'none' }}>
      {/* Left side: directional buttons */}
      <div className="flex items-center gap-3">
        <button
          onTouchStart={(e) => { e.preventDefault(); startLeft(); }}
          onTouchEnd={(e) => { e.preventDefault(); stopLeft(); }}
          onTouchCancel={stopLeft}
          onMouseDown={startLeft}
          onMouseUp={stopLeft}
          onMouseLeave={stopLeft}
          className="size-16 rounded-2xl bg-white/5 border border-white/10 active:bg-primary/20 active:border-primary/40 flex items-center justify-center transition-colors"
          aria-label="Move left"
        >
          <ChevronLeft className="size-8 text-white/60" />
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); startRight(); }}
          onTouchEnd={(e) => { e.preventDefault(); stopRight(); }}
          onTouchCancel={stopRight}
          onMouseDown={startRight}
          onMouseUp={stopRight}
          onMouseLeave={stopRight}
          className="size-16 rounded-2xl bg-white/5 border border-white/10 active:bg-primary/20 active:border-primary/40 flex items-center justify-center transition-colors"
          aria-label="Move right"
        >
          <ChevronRight className="size-8 text-white/60" />
        </button>
      </div>

      {/* Right side: fire button */}
      <button
        onTouchStart={(e) => { e.preventDefault(); startShoot(); }}
        onTouchEnd={(e) => { e.preventDefault(); stopShoot(); }}
        onTouchCancel={stopShoot}
        onMouseDown={startShoot}
        onMouseUp={stopShoot}
        onMouseLeave={stopShoot}
        className="size-20 rounded-full bg-destructive/10 border-2 border-destructive/30 active:bg-destructive/30 active:border-destructive/60 flex items-center justify-center transition-colors"
        aria-label="Fire"
      >
        <Crosshair className="size-9 text-destructive/80" />
      </button>
    </div>
  );
}
