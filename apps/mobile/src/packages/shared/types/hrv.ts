/**
 * Heart Rate Variability types
 */
export type HRVSource = 'manual' | 'healthkit' | 'health_connect';
export type HRVClassification = 'recovery' | 'balanced' | 'stressed';

export interface HRVReading {
  id: string;
  userId: string;
  rmssdMs: number; // Root mean square of successive differences (ms)
  source: HRVSource;
  classification: HRVClassification;
  recordedAt: string;
}

export interface HRVReadingInput {
  rmssdMs: number;
  source?: HRVSource;
}

/**
 * Classification thresholds (can be personalized per user over time)
 */
export const HRV_CLASSIFICATION_THRESHOLDS = {
  stressed: { max: 30 },    // RMSSD < 30ms
  balanced: { min: 30, max: 60 }, // 30ms ≤ RMSSD < 60ms
  recovery: { min: 60 },    // RMSSD ≥ 60ms
} as const;

export function classifyHRV(rmssdMs: number): HRVClassification {
  if (rmssdMs < HRV_CLASSIFICATION_THRESHOLDS.stressed.max) return 'stressed';
  if (rmssdMs >= HRV_CLASSIFICATION_THRESHOLDS.recovery.min) return 'recovery';
  return 'balanced';
}
