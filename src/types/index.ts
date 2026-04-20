export interface Player {
  name: string;
  scores: number[];
  uid?: string;
}

export interface Game {
  id: string;
  date: number;
  players: Player[];
  holesPlayed: number;
  completed: boolean;
}

export interface GameSetupData {
  playerNames: string[];
  holes: 9 | 18;
}

export interface ActiveGame {
  players: Player[];
  holesPlayed: 9 | 18;
  currentHole: number;
  currentPlayerIndex: number;
  startDealerIndex: number;
}

export interface LeaderboardEntry {
  playerName: string;
  wins: number;
  rank: number;
}

export interface Achievement {
  title: string;
  playerName: string;
  value: string;
}

export type Screen = 'setup' | 'scorecard' | 'summary' | 'history' | 'analytics' | 'global';

export type AdvanceResult = 'nextPlayer' | 'nextHole' | 'complete';
