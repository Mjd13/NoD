import { Game, GameSetupData } from '../types';

const GAMES_KEY = 'scorecards_games';
const LAST_SETUP_KEY = 'scorecards_lastSetup';
const DISPLAY_NAME_KEY = 'scorecards_display_name';
const AUTH_SKIPPED_KEY = 'scorecards_auth_skipped';

export function loadGames(): Game[] {
  try {
    const data = localStorage.getItem(GAMES_KEY);
    return data ? (JSON.parse(data) as Game[]) : [];
  } catch {
    return [];
  }
}

export function saveGames(games: Game[]): void {
  try {
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  } catch {
    console.warn('localStorage quota exceeded — could not save games');
  }
}

export function loadLastSetup(): GameSetupData | null {
  try {
    const data = localStorage.getItem(LAST_SETUP_KEY);
    return data ? (JSON.parse(data) as GameSetupData) : null;
  } catch {
    return null;
  }
}

export function saveLastSetup(setup: GameSetupData): void {
  try {
    localStorage.setItem(LAST_SETUP_KEY, JSON.stringify(setup));
  } catch {
    // non-critical, ignore
  }
}

export function loadDisplayName(): string | null {
  return localStorage.getItem(DISPLAY_NAME_KEY);
}

export function saveDisplayName(name: string): void {
  localStorage.setItem(DISPLAY_NAME_KEY, name);
}

export function loadAuthSkipped(): boolean {
  return localStorage.getItem(AUTH_SKIPPED_KEY) === '1';
}

export function saveAuthSkipped(): void {
  localStorage.setItem(AUTH_SKIPPED_KEY, '1');
}
