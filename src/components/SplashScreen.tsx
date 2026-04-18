import { useEffect } from 'react';

interface Props {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 bg-surface-0 flex flex-col items-center justify-center z-50 cursor-pointer select-none"
      onClick={onDone}
    >
      {/* Glow ring + logomark */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute w-32 h-32 rounded-full bg-accent-glow animate-pulse-ring" />
        <div className="w-20 h-20 rounded-2xl bg-surface-3 border border-line-default flex items-center justify-center animate-logo-scale shadow-glow-red-sm">
          <span className="text-3xl font-black tracking-tight text-white">
            S<span className="text-accent">C</span>
          </span>
        </div>
      </div>

      {/* Wordmark */}
      <div className="flex items-start gap-1">
        <span
          className="text-4xl font-black text-white"
          style={{ animation: 'wordmark-in 0.5s ease-out 0.3s both', letterSpacing: '-0.02em' }}
        >
          Scorecards
        </span>
        <span
          className="text-accent text-sm font-bold mt-1.5 opacity-0"
          style={{ animation: 'wordmark-in 0.4s ease-out 0.7s forwards' }}
        >
          PRO
        </span>
      </div>

      {/* Skip hint */}
      <p
        className="absolute bottom-16 label-caps opacity-0"
        style={{ animation: 'wordmark-in 0.3s ease-out 1.1s forwards' }}
      >
        tap to continue
      </p>
    </div>
  );
}
