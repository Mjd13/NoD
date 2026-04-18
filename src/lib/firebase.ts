import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;

export const firebaseEnabled = Boolean(apiKey && projectId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (firebaseEnabled) {
  app = initializeApp({
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  });
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };

export interface GlobalEntry {
  uid: string;
  displayName: string;
  gamesPlayed: number;
  wins: number;
  bestScore: number;
  avgScore: number;
}

export interface GameResult {
  id: string;
  uid: string;
  displayName: string;
  holesPlayed: number;
  playerCount: number;
  totalScore: number;
  won: boolean;
}
