import { useState, useCallback, useRef } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Zap, Play, Smartphone, Keyboard } from 'lucide-react';
import type { NSecSigner } from '@nostrify/nostrify';

import { Button } from '@/components/ui/button';
import { GameCanvas } from '@/components/GameCanvas';
import { PaymentGate } from '@/components/PaymentGate';
import { Leaderboard } from '@/components/Leaderboard';
import { WeeklyWinnerBanner } from '@/components/WeeklyWinnerBanner';
import { GameOverOverlay } from '@/components/GameOverOverlay';
import { usePublishScore } from '@/hooks/usePublishScore';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { GamePhase } from '@/lib/gameTypes';
import type { GameInvoice } from '@/lib/lightning';

const Index = () => {
  useSeoMeta({
    title: 'Citadel Run - One Life. Infinite Run. Pay Sats to Play.',
    description: 'An endless runner powered by Bitcoin Lightning. Jump obstacles, shoot barriers, survive as long as you can. Pay 100 sats for one life.',
    ogTitle: 'Citadel Run',
    ogDescription: '100 Sats. One Life. Run Forever.',
    ogType: 'website',
    ogSiteName: 'Citadel Run',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Citadel Run',
    twitterDescription: '100 Sats. One Life. Run Forever.',
  });

  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [showPayment, setShowPayment] = useState(false);
  const [lightningAddress, setLightningAddress] = useState('');
  const [finalScore, setFinalScore] = useState(0);
  const signerRef = useRef<NSecSigner | null>(null);
  const { mutateAsync: publishScore, isPending: isPublishing } = usePublishScore();

  const handleStartGame = useCallback(() => {
    setShowPayment(true);
  }, []);

  const handlePaid = useCallback((address: string, gameInvoice: GameInvoice) => {
    setLightningAddress(address);
    setShowPayment(false);
    setPhase('ready');
    signerRef.current = gameInvoice.signer;
  }, []);

  const handleLaunchGame = useCallback(() => {
    setPhase('playing');
  }, []);

  const handleGameOver = useCallback(async (score: number) => {
    setFinalScore(score);
    setPhase('gameOver');

    if (signerRef.current && lightningAddress) {
      try {
        await publishScore({
          score,
          lightning: lightningAddress,
          signer: signerRef.current,
        });
      } catch (error) {
        console.error('Failed to publish score:', error);
      }
    }
  }, [lightningAddress, publishScore]);

  const handlePlayAgain = useCallback(() => {
    setPhase('idle');
    setFinalScore(0);
    setShowPayment(true);
  }, []);

  return (
    <div className="min-h-full bg-[#0a0914] text-foreground overflow-y-auto">
      {/* Subtle scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.02]">
        <div className="w-full h-[200%] bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(255,255,255,0.02)_2px,rgba(255,255,255,0.02)_4px)] animate-scanline" />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-full px-4 py-6 gap-5">
        {/* Weekly Winner Banner */}
        <WeeklyWinnerBanner />

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="font-pixel text-xl md:text-2xl text-cyan-400 tracking-wider animate-float">
            CITADEL RUN
          </h1>
          <p className="text-xs text-muted-foreground/80 max-w-xs mx-auto">
            One life. Infinite run. Survive the gauntlet.
          </p>
        </div>

        {/* Game Area */}
        <div className="relative">
          <GameCanvas
            onGameOver={handleGameOver}
            isPlaying={phase === 'playing'}
          />

          {/* Idle overlay */}
          {phase === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50 backdrop-blur-[2px] rounded-lg">
              <div className="text-center space-y-5 p-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="size-14 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-float">
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-cyan-400">
                        <path d="M6 22L14 6L22 22H6Z" fill="currentColor" opacity="0.4" />
                        <path d="M10 22L14 10L18 22H10Z" fill="currentColor" />
                        <circle cx="14" cy="8" r="3" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 size-4 bg-accent rounded-full flex items-center justify-center">
                      <Zap className="size-2.5 text-accent-foreground fill-accent-foreground" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-pixel text-xs text-foreground tracking-wider">
                    100 SATS = 1 LIFE
                  </p>
                  <p className="text-[10px] text-muted-foreground max-w-[220px] mx-auto">
                    Jump or shoot your way through. One hit and it&apos;s over.
                  </p>
                </div>

                <Button
                  onClick={handleStartGame}
                  className="bg-cyan-500 text-black font-pixel text-xs hover:bg-cyan-400 h-12 px-8 shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-shadow"
                >
                  <Zap className="size-4 mr-2" />
                  INSERT COIN
                </Button>

                {/* Controls hint */}
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground/50">
                  {isMobile ? (
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="size-3" />
                      <span className="text-[8px] font-pixel">TAP = JUMP &middot; DOUBLE TAP = SHOOT</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Keyboard className="size-3" />
                      <span className="text-[8px] font-pixel">SPACE = JUMP &middot; DOUBLE SPACE = SHOOT</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ready overlay — payment received, waiting to start */}
          {phase === 'ready' && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60 backdrop-blur-[2px] rounded-lg">
              <div className="text-center space-y-6 p-6">
                <div className="space-y-2">
                  <p className="font-pixel text-[10px] text-cyan-400/70 tracking-wider">
                    PAYMENT RECEIVED
                  </p>
                  <p className="font-pixel text-sm text-foreground tracking-wider">
                    GET READY
                  </p>
                </div>

                <Button
                  onClick={handleLaunchGame}
                  className="bg-cyan-500 text-black font-pixel text-sm hover:bg-cyan-400 h-14 px-10 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] transition-shadow animate-pulse-glow"
                >
                  <Play className="size-5 mr-2 fill-current" />
                  RUN
                </Button>

                {isMobile ? (
                  <p className="text-[9px] text-muted-foreground/50 font-pixel">
                    TAP = JUMP &middot; DOUBLE TAP = SHOOT
                  </p>
                ) : (
                  <p className="text-[9px] text-muted-foreground/50 font-pixel">
                    SPACE = JUMP &middot; DOUBLE SPACE = SHOOT
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Game Over overlay */}
          {phase === 'gameOver' && (
            <GameOverOverlay
              score={finalScore}
              isPublishing={isPublishing}
              onPlayAgain={handlePlayAgain}
            />
          )}
        </div>

        {/* Obstacle legend */}
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center justify-center gap-4 text-[8px] font-pixel text-muted-foreground/60 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 bg-red-500 rotate-45" />
              JUMP OVER
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 bg-lime-500" />
              1 SHOT
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-sm" />
              2 SHOTS
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 bg-purple-500" />
              3 SHOTS
            </span>
          </div>
        </div>

        {/* Leaderboard */}
        <Leaderboard />

        {/* Footer */}
        <footer className="text-center text-[10px] text-muted-foreground/40 pb-4 space-y-1">
          <p>
            Scores stored on{' '}
            <span className="text-cyan-400/50">Nostr</span>
            {' '}&middot;{' '}
            Payments via{' '}
            <span className="text-accent/50">Lightning</span>
          </p>
          <p>
            Vibed with{' '}
            <a
              href="https://shakespeare.diy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400/50 hover:text-cyan-400/80 transition-colors"
            >
              Shakespeare
            </a>
          </p>
        </footer>
      </div>

      {/* Payment Dialog */}
      <PaymentGate
        open={showPayment}
        onPaid={handlePaid}
        onClose={() => setShowPayment(false)}
      />
    </div>
  );
};

export default Index;
