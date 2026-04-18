import { useState, useEffect, useCallback } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, firebaseEnabled } from '../lib/firebase';
import { loadDisplayName, saveDisplayName } from '../utils/storage';

export type AuthStage = 'loading' | 'unauthenticated' | 'no-name' | 'done';

function friendlyError(code: string): string {
  if (code === 'auth/invalid-phone-number') return 'Invalid number — use international format: +1 555 000 0000';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.';
  if (code === 'auth/code-expired') return 'Code expired. Request a new one.';
  if (code === 'auth/invalid-verification-code') return 'Wrong code. Please check and retry.';
  if (code === 'auth/missing-phone-number') return 'Please enter a phone number.';
  return 'Something went wrong. Please try again.';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayNameState] = useState<string | null>(null);
  const [stage, setStage] = useState<AuthStage>('loading');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      setStage('done');
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setStage('unauthenticated');
        return;
      }
      const cached = loadDisplayName();
      if (cached) {
        setDisplayNameState(cached);
        setStage('done');
        return;
      }
      if (db) {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          const name = snap.data().displayName as string;
          saveDisplayName(name);
          setDisplayNameState(name);
          setStage('done');
          return;
        }
      }
      setStage('no-name');
    });
    return unsub;
  }, []);

  const sendCode = useCallback(async (phone: string, verifier: RecaptchaVerifier) => {
    if (!auth) return;
    setAuthError(null);
    setBusy(true);
    try {
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmation(result);
    } catch (e: any) {
      setAuthError(friendlyError(e.code));
      // Clear the used verifier so a fresh one can be created on retry
      verifier.clear();
    } finally {
      setBusy(false);
    }
  }, []);

  const verifyCode = useCallback(async (code: string) => {
    if (!confirmation) return;
    setAuthError(null);
    setBusy(true);
    try {
      await confirmation.confirm(code);
      // onAuthStateChanged fires → sets stage to 'no-name' or 'done'
    } catch (e: any) {
      setAuthError(friendlyError(e.code));
    } finally {
      setBusy(false);
    }
  }, [confirmation]);

  const saveName = useCallback(async (name: string) => {
    if (!user || !db) return;
    const trimmed = name.trim();
    saveDisplayName(trimmed);
    setDisplayNameState(trimmed);
    await setDoc(doc(db, 'users', user.uid), {
      displayName: trimmed,
      phone: user.phoneNumber ?? '',
      createdAt: serverTimestamp(),
    }, { merge: true });
    await setDoc(doc(db, 'leaderboard', user.uid), {
      uid: user.uid,
      displayName: trimmed,
      gamesPlayed: 0,
      wins: 0,
      bestScore: 999,
      avgScore: 999,
    }, { merge: true });
    setStage('done');
  }, [user]);

  return {
    user,
    uid: user?.uid ?? null,
    displayName,
    stage,
    busy,
    authError,
    sendCode,
    verifyCode,
    saveName,
    needsOnboarding: stage === 'unauthenticated' || stage === 'no-name',
  };
}
