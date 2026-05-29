/**
 * useHealthSync — Syncs device health data → Supabase on app foreground
 */

import { useCallback, useState } from 'react';
import { getHealthProvider } from './health-provider';
import type { DailyHealthSnapshot } from './health-provider';
import { supabase } from '../supabase';
import { classifyHRV } from '@become/shared';

export function useHealthSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const syncHealthData = useCallback(async (): Promise<{ success: boolean; snapshot: DailyHealthSnapshot | null }> => {
    setIsSyncing(true);
    try {
      const provider = getHealthProvider();
      const today = new Date().toISOString().split('T')[0]!;
      const snapshot = await provider.getDailySnapshot(today);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, snapshot: null };

      if (snapshot.hrv) {
        await supabase.from('hrv_readings').insert({
          user_id: user.id,
          rmssd_ms: snapshot.hrv.rmssdMs,
          source: snapshot.hrv.source,
          classification: classifyHRV(snapshot.hrv.rmssdMs),
          recorded_at: snapshot.hrv.timestamp,
        });
      }

      if (snapshot.sleep) {
        await supabase.from('sleep_readings').insert({
          user_id: user.id,
          duration_minutes: snapshot.sleep.durationMinutes,
          deep_sleep_minutes: snapshot.sleep.deepSleepMinutes,
          rem_sleep_minutes: snapshot.sleep.remSleepMinutes,
          source: snapshot.hrv?.source ?? 'manual',
          recorded_date: today,
        });
      }

      if (snapshot.restingHeartRate) {
        await supabase.from('resting_hr_readings').insert({
          user_id: user.id,
          bpm: snapshot.restingHeartRate.bpm,
          source: snapshot.restingHeartRate.source,
          recorded_at: snapshot.restingHeartRate.timestamp,
        });
      }

      setLastSync(new Date().toISOString());
      return { success: true, snapshot };
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return { syncHealthData, isSyncing, lastSync };
}
