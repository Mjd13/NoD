import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { loadLastSetup, saveLastSetup } from '../utils/storage';
import { db, firebaseEnabled } from '../lib/firebase';

interface PlayerEntry {
  name: string;
  uid?: string;
}

interface Props {
  onStartGame: (players: PlayerEntry[], holes: 9 | 18, dealerIndex: number) => void;
  currentUser?: { name: string; uid: string } | null;
  recentPlayers?: { name: string; uid: string }[];
}

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

function formatDisplay(digits: string): string {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="8" cy="8" r="4.5" />
      <path d="M14 14l3 3" />
      <path d="M6 6.5c0-1 .8-1.5 2-1.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
      <line x1="4" y1="4" x2="16" y2="16" />
      <line x1="16" y1="4" x2="4" y2="16" />
    </svg>
  );
}

type SlotMode = 'guest' | 'recent' | 'searching' | 'found';

function PlayerSlot({ index, entry, onChange, error, isDealer, onSetDealer, recentPlayers }: {
  index: number;
  entry: PlayerEntry;
  onChange: (entry: PlayerEntry) => void;
  error: string;
  isDealer: boolean;
  onSetDealer: () => void;
  recentPlayers: { name: string; uid: string }[];
}) {
  const [mode, setMode] = useState<SlotMode>(entry.uid ? 'found' : 'guest');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookupBusy, setLookupBusy] = useState(false);

  const handleLookup = async () => {
    if (phoneDigits.length !== 10 || !db) return;
    setLookupBusy(true);
    setLookupError('');
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('phone', '==', `+1${phoneDigits}`)));
      if (snap.empty) {
        setLookupError('No account found. You can still add them as a guest below.');
      } else {
        const data = snap.docs[0].data();
        onChange({ name: data.displayName as string, uid: snap.docs[0].id });
        setMode('found');
      }
    } catch {
      setLookupError('Could not search. Check your connection.');
    }
    setLookupBusy(false);
  };

  const handleClearToGuest = () => {
    onChange({ name: '' });
    setPhoneDigits('');
    setLookupError('');
    setMode('guest');
  };

  if (mode === 'found') {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={onSetDealer}
          title="Set as first drawer"
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 touch-manipulation transition-colors ${
            isDealer ? 'bg-accent text-white' : 'bg-surface-4 text-ink-secondary'
          }`}
        >
          {isDealer ? <span className="text-sm leading-none">🃏</span> : <span className="text-xs font-bold">{index + 1}</span>}
        </button>
        <div className="flex-1 bg-surface-3 border border-accent/40 rounded-xl px-3 py-2.5 flex items-center gap-2 min-w-0">
          <span className="text-ink-primary text-base flex-1 truncate">{entry.name}</span>
          <span className="label-caps text-accent shrink-0">verified</span>
        </div>
        <button
          onClick={handleClearToGuest}
          className="w-9 h-9 rounded-xl bg-surface-3 border border-line-default flex items-center justify-center text-ink-muted active:bg-surface-4 touch-manipulation shrink-0"
        >
          <XIcon />
        </button>
      </div>
    );
  }

  if (mode === 'recent') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onSetDealer}
            title="Set as first drawer"
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 touch-manipulation transition-colors ${
              isDealer ? 'bg-accent text-white' : 'bg-surface-4 text-ink-secondary'
            }`}
          >
            {isDealer ? <span className="text-sm leading-none">🃏</span> : <span className="text-xs font-bold">{index + 1}</span>}
          </button>
          <p className="text-ink-secondary text-sm font-medium flex-1">Recent players</p>
          <button onClick={handleClearToGuest} className="text-ink-muted text-xs">Cancel</button>
        </div>
        <div className="ml-10 flex flex-col gap-1">
          {recentPlayers.map(p => (
            <button
              key={p.uid}
              onClick={() => { onChange({ name: p.name, uid: p.uid }); setMode('found'); }}
              className="flex items-center gap-3 px-3 py-2.5 bg-surface-3 rounded-xl text-left
                         active:bg-surface-4 touch-manipulation transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <span className="text-accent text-xs font-bold">{p.name[0].toUpperCase()}</span>
              </div>
              <span className="flex-1 text-ink-primary text-sm font-medium truncate">{p.name}</span>
              <span className="text-accent text-xs font-semibold shrink-0">Add</span>
            </button>
          ))}
          <button
            onClick={() => setMode('searching')}
            className="flex items-center gap-2 px-3 py-2.5 text-ink-muted text-sm text-left
                       active:text-ink-secondary touch-manipulation"
          >
            <SearchIcon />
            Search by phone number
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'searching') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onSetDealer}
            title="Set as first drawer"
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 touch-manipulation transition-colors ${
              isDealer ? 'bg-accent text-white' : 'bg-surface-4 text-ink-secondary'
            }`}
          >
            {isDealer ? <span className="text-sm leading-none">🃏</span> : <span className="text-xs font-bold">{index + 1}</span>}
          </button>
          <div className="flex items-center bg-surface-3 border border-line-default rounded-xl overflow-hidden focus-within:border-accent flex-1 transition-colors">
            <span className="px-3 py-2.5 text-ink-secondary text-sm border-r border-line-default shrink-0">+1</span>
            <input
              type="tel"
              inputMode="numeric"
              value={formatDisplay(phoneDigits)}
              onChange={e => setPhoneDigits(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="(555) 000-0000"
              className="flex-1 bg-transparent px-3 py-2.5 text-ink-primary text-sm placeholder:text-ink-muted focus:outline-none"
              autoFocus
            />
          </div>
          <button
            onClick={handleLookup}
            disabled={phoneDigits.length !== 10 || lookupBusy}
            className="px-3 h-10 bg-accent text-white rounded-xl text-sm font-semibold disabled:opacity-40 touch-manipulation shrink-0"
          >
            {lookupBusy ? '…' : 'Find'}
          </button>
        </div>
        {lookupError && (
          <div className="ml-11 flex flex-col gap-1">
            <p className="text-ink-tertiary text-xs">{lookupError}</p>
            <input
              type="text"
              value={entry.name}
              onChange={e => onChange({ name: e.target.value })}
              placeholder={`Player ${index + 1} (guest)`}
              className="w-full bg-surface-3 text-ink-primary px-3 py-2 rounded-xl text-sm border border-line-default focus:border-accent outline-none transition-colors"
            />
          </div>
        )}
        <button onClick={handleClearToGuest} className="text-ink-muted text-xs ml-11 text-left">
          Cancel — add as guest
        </button>
      </div>
    );
  }

  // Guest mode (default)
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onSetDealer}
        title="Set as first drawer"
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 touch-manipulation transition-colors ${
          isDealer ? 'bg-accent text-white' : 'bg-surface-4 text-ink-secondary'
        }`}
      >
        {isDealer ? <span className="text-sm leading-none">🃏</span> : <span className="text-xs font-bold">{index + 1}</span>}
      </button>
      <div className="flex-1">
        <input
          type="text"
          value={entry.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder={`Player ${index + 1}`}
          className={`w-full bg-surface-3 text-ink-primary px-3 py-2.5 rounded-xl text-base border ${
            error ? 'border-accent bg-accent-muted' : 'border-line-default focus:border-accent'
          } outline-none transition-colors`}
        />
        {error && <p className="text-accent text-sm mt-1">{error}</p>}
      </div>
      {firebaseEnabled && (
        <button
          onClick={() => setMode(recentPlayers.length > 0 ? 'recent' : 'searching')}
          title="Add registered player"
          className="w-9 h-9 rounded-xl bg-surface-3 border border-line-default flex items-center justify-center text-ink-muted active:bg-surface-4 touch-manipulation shrink-0"
        >
          <SearchIcon />
        </button>
      )}
    </div>
  );
}

export default function GameSetup({ onStartGame, currentUser, recentPlayers = [] }: Props) {
  const [playerCount, setPlayerCount] = useState(2);
  const [holes, setHoles] = useState<9 | 18>(9);
  const [players, setPlayers] = useState<PlayerEntry[]>(() => {
    const p1: PlayerEntry = currentUser
      ? { name: currentUser.name, uid: currentUser.uid }
      : { name: '' };
    return [p1, { name: '' }];
  });
  const [dealerIndex, setDealerIndex] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const lastSetup = loadLastSetup();

  useEffect(() => {
    setPlayers(prev => {
      if (prev.length === playerCount) return prev;
      if (playerCount > prev.length) {
        return [...prev, ...new Array(playerCount - prev.length).fill({ name: '' })];
      }
      return prev.slice(0, playerCount);
    });
  }, [playerCount]);

  const handleQuickStart = () => {
    if (!lastSetup) return;
    setPlayerCount(lastSetup.playerNames.length);
    setHoles(lastSetup.holes);
    setPlayers(lastSetup.playerNames.map(name => ({
      name,
      uid: currentUser?.name.toLowerCase() === name.toLowerCase() ? currentUser.uid : undefined,
    })));
  };

  const handleStart = () => {
    const errs = players.map(p => (p.name.trim().length === 0 ? 'Name required' : ''));
    setErrors(errs);
    if (errs.some(e => e)) return;
    saveLastSetup({ playerNames: players.map(p => p.name.trim()), holes });
    onStartGame(players.map(p => ({ ...p, name: p.name.trim() })), holes, dealerIndex);
  };

  const updatePlayer = (i: number, entry: PlayerEntry) => {
    setPlayers(prev => prev.map((p, idx) => idx === i ? entry : p));
    setErrors(prev => prev.map((e, idx) => idx === i ? '' : e));
  };

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col pb-24">
      <div className="px-4 pt-safe pb-6">
        <h1 className="text-4xl font-black text-ink-primary tracking-tight">
          Scorecards<sup className="text-accent text-lg font-bold ml-0.5 align-super">PRO</sup>
        </h1>
        <p className="text-ink-tertiary text-sm mt-1">Golf Card Game Tracker</p>
      </div>

      <div className="flex-1 px-4 flex flex-col gap-4">
        {lastSetup && (
          <button
            onClick={handleQuickStart}
            className="w-full p-4 card-featured text-left active:brightness-110 active:scale-[0.98] transition-all touch-manipulation"
          >
            <p className="label-caps text-accent mb-1">Quick Start</p>
            <p className="text-ink-primary text-sm font-medium">
              {lastSetup.playerNames.join(', ')} · {lastSetup.holes} holes
            </p>
          </button>
        )}

        <div className="card p-4">
          <h2 className="text-ink-primary font-semibold text-lg tracking-tight mb-4">Game Settings</h2>

          <div className="mb-4">
            <p className="label-caps mb-2">Number of Players</p>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => i + MIN_PLAYERS).map(n => (
                <button
                  key={n}
                  onClick={() => setPlayerCount(n)}
                  className={`w-12 h-12 rounded-xl font-semibold text-sm transition-all touch-manipulation ${
                    playerCount === n
                      ? 'bg-accent text-white active:bg-red-600'
                      : 'bg-surface-3 text-ink-secondary border border-line-default active:bg-surface-4'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label-caps mb-2">Game Length</p>
            <div className="flex bg-surface-3 rounded-xl p-1 gap-1">
              {([9, 18] as const).map(h => (
                <button
                  key={h}
                  onClick={() => setHoles(h)}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all touch-manipulation ${
                    holes === h ? 'bg-accent text-white' : 'text-ink-secondary active:text-ink-primary'
                  }`}
                >
                  {h} Holes
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-ink-primary font-semibold text-lg tracking-tight">Players</h2>
            <p className="text-ink-muted text-xs">Tap 🃏 to set first draw</p>
          </div>
          <div className="flex flex-col gap-4">
            {players.map((entry, i) => {
              const usedUids = new Set(players.filter((_, j) => j !== i).map(p => p.uid).filter(Boolean));
              return (
                <PlayerSlot
                  key={i}
                  index={i}
                  entry={entry}
                  onChange={e => updatePlayer(i, e)}
                  error={errors[i] ?? ''}
                  isDealer={dealerIndex === i}
                  onSetDealer={() => setDealerIndex(i)}
                  recentPlayers={recentPlayers.filter(p => !usedUids.has(p.uid))}
                />
              );
            })}
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-4 text-white font-semibold text-lg rounded-xl
                     active:bg-red-600 active:scale-[0.98] transition-all mt-2 touch-manipulation btn-shimmer"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
