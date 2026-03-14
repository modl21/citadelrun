import { Zap, RotateCcw, Loader2, Skull } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface GameOverOverlayProps {
  score: number;
  isPublishing: boolean;
  onPlayAgain: () => void;
}

export function GameOverOverlay({ score, isPublishing, onPlayAgain }: GameOverOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/70 backdrop-blur-sm rounded-lg">
      <div className="text-center space-y-4 p-6">
        <div className="flex justify-center">
          <Skull className="size-8 text-red-500 animate-pulse" />
        </div>

        <h2 className="font-pixel text-lg text-red-500 tracking-wider">
          GAME OVER
        </h2>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-pixel">FINAL SCORE</p>
          <div className="flex items-center justify-center gap-2">
            <Zap className="size-5 text-accent fill-accent" />
            <span className="font-pixel text-2xl text-accent tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {isPublishing && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            <span className="text-xs font-pixel">SAVING SCORE...</span>
          </div>
        )}

        <Button
          onClick={onPlayAgain}
          className="bg-cyan-500 text-black font-pixel text-xs hover:bg-cyan-400 h-10 px-6"
        >
          <RotateCcw className="size-3.5 mr-2" />
          PLAY AGAIN (100 SATS)
        </Button>
      </div>
    </div>
  );
}
