import { useState, useCallback } from 'react';
import { supabase, supabaseEnabled } from '../lib/supabase';
import { getOrCreateDeviceId, loadDisplayName, saveDisplayName } from '../utils/storage';

export function useProfile() {
  const [displayName, setDisplayNameState] = useState<string | null>(loadDisplayName);

  const deviceId = getOrCreateDeviceId();

  const setDisplayName = useCallback(async (name: string) => {
    const trimmed = name.trim();
    saveDisplayName(trimmed);
    setDisplayNameState(trimmed);

    if (supabaseEnabled && supabase) {
      await supabase.from('profiles').upsert(
        { device_id: deviceId, display_name: trimmed },
        { onConflict: 'device_id' }
      );
    }
  }, [deviceId]);

  return { displayName, deviceId, setDisplayName, needsOnboarding: !displayName };
}
