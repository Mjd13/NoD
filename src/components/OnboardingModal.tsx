import { useState } from 'react';

interface Props {
  onDone: (displayName: string) => void;
}

export default function OnboardingModal({ onDone }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Enter a display name'); return; }
    if (trimmed.length < 2) { setError('At least 2 characters'); return; }
    if (trimmed.length > 24) { setError('Max 24 characters'); return; }
    onDone(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-surface-0 z-50 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="w-16 h-16 rounded-2xl bg-surface-3 border border-line-default flex items-center justify-center mb-8 shadow-glow-red-sm">
        <span className="text-2xl font-black text-white">S<span className="text-accent">C</span></span>
      </div>

      <h1 className="text-3xl font-black text-ink-primary tracking-tight text-center mb-2">
        Choose your name
      </h1>
      <p className="text-ink-tertiary text-sm text-center mb-8 max-w-xs">
        This is how you'll appear on the global leaderboard. Pick something good.
      </p>

      <div className="w-full max-w-sm">
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Your name or nickname"
          maxLength={24}
          autoFocus
          className={`w-full bg-surface-3 text-ink-primary text-lg font-semibold px-4 py-4 rounded-xl
                      border outline-none transition-colors text-center tracking-tight ${
            error ? 'border-accent' : 'border-line-default focus:border-accent'
          }`}
        />
        {error && <p className="text-accent text-sm text-center mt-2">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full mt-4 py-4 bg-accent text-white font-semibold text-lg rounded-xl
                     active:bg-red-600 active:scale-[0.98] transition-all touch-manipulation btn-shimmer"
        >
          Join Global Board
        </button>

        <p className="text-ink-muted text-xs text-center mt-4">
          No account needed · visible to all players
        </p>
      </div>
    </div>
  );
}
