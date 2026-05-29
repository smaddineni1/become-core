/**
 * Edge Function: compute-readiness
 *
 * Computes daily Readiness Score for a user from biometric data.
 * Called on-demand (when user opens app) or via daily cron.
 *
 * Pipeline:
 * 1. Fetch latest HRV, resting HR, sleep data
 * 2. Compute/update 7-day rolling baselines
 * 3. Calculate readiness score using weighted model
 * 4. Store score + classification
 * 5. Return readiness + recommendation
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const WEIGHTS = { hrv: 0.40, restingHR: 0.25, sleep: 0.35 };
const BASELINE_WINDOW_DAYS = 7;

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401, corsHeaders);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: 'Invalid token' }, 401, corsHeaders);

    const today = new Date().toISOString().split('T')[0]!;
    const weekAgo = new Date(Date.now() - BASELINE_WINDOW_DAYS * 86400000).toISOString();

    // 1. Fetch recent data
    const [hrvData, hrData, sleepData] = await Promise.all([
      supabase.from('hrv_readings')
        .select('rmssd_ms, recorded_at')
        .eq('user_id', user.id)
        .gte('recorded_at', weekAgo)
        .order('recorded_at', { ascending: false }),
      supabase.from('resting_hr_readings')
        .select('bpm, recorded_at')
        .eq('user_id', user.id)
        .gte('recorded_at', weekAgo)
        .order('recorded_at', { ascending: false }),
      supabase.from('sleep_readings')
        .select('duration_minutes, deep_sleep_minutes, rem_sleep_minutes, recorded_date')
        .eq('user_id', user.id)
        .gte('recorded_date', weekAgo.split('T')[0])
        .order('recorded_date', { ascending: false }),
    ]);

    // 2. Compute baselines (7-day rolling averages)
    const hrvValues = (hrvData.data ?? []).map((r: any) => r.rmssd_ms);
    const hrValues = (hrData.data ?? []).map((r: any) => r.bpm);
    const sleepValues = (sleepData.data ?? []).map((r: any) => r.duration_minutes);

    const hrvBaseline = hrvValues.length > 0 ? avg(hrvValues) : 45;
    const hrBaseline = hrValues.length > 0 ? avg(hrValues) : 65;
    const sleepBaseline = sleepValues.length > 0 ? avg(sleepValues) : 420;

    // 3. Update baseline record
    await supabase.from('biometric_baselines').upsert({
      user_id: user.id,
      hrv_baseline_ms: round(hrvBaseline),
      resting_hr_baseline: round(hrBaseline),
      sleep_baseline_minutes: round(sleepBaseline),
      window_days: BASELINE_WINDOW_DAYS,
      computed_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // 4. Get today's readings (most recent)
    const currentHRV = hrvValues[0] ?? null;
    const currentHR = hrValues[0] ?? null;
    const currentSleep = sleepValues[0] ?? null;

    const sleepRow = (sleepData.data ?? [])[0];
    const deepRem = (sleepRow?.deep_sleep_minutes ?? 0) + (sleepRow?.rem_sleep_minutes ?? 0);
    const sleepQuality = currentSleep ? deepRem / currentSleep : 0.5;

    // 5. Score each factor
    const hrvScore = currentHRV !== null ? scoreHRV(currentHRV, hrvBaseline) : 50;
    const hrScore = currentHR !== null ? scoreRestingHR(currentHR, hrBaseline) : 50;
    const sleepScore = currentSleep !== null ? scoreSleep(currentSleep, sleepQuality) : 50;

    const overall = Math.round(
      hrvScore * WEIGHTS.hrv + hrScore * WEIGHTS.restingHR + sleepScore * WEIGHTS.sleep,
    );

    const classification = overall >= 80 ? 'recovered' : overall >= 50 ? 'balanced' : 'stressed';
    const nutritionFocus = classification === 'recovered' ? 'performance'
      : classification === 'balanced' ? 'maintenance' : 'recovery';
    const recommendationCategory = classification === 'recovered' ? 'high_intensity'
      : classification === 'balanced' ? 'moderate_activity' : 'recovery';

    // 6. Store readiness score
    await supabase.from('readiness_scores').upsert({
      user_id: user.id,
      score_date: today,
      overall_score: clamp(overall, 0, 100),
      hrv_factor: clamp(Math.round(hrvScore), 0, 100),
      resting_hr_factor: clamp(Math.round(hrScore), 0, 100),
      sleep_factor: clamp(Math.round(sleepScore), 0, 100),
      classification,
      recommendation_category: recommendationCategory,
      nutrition_focus: nutritionFocus,
      computed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,score_date' });

    // 7. Build response
    const recommendation = buildRecommendation(classification, overall);

    return json({
      score: clamp(overall, 0, 100),
      classification,
      factors: { hrv: Math.round(hrvScore), restingHR: Math.round(hrScore), sleep: Math.round(sleepScore) },
      baseline: { hrvMs: round(hrvBaseline), restingHR: round(hrBaseline), sleepMin: round(sleepBaseline) },
      recommendation,
      dataAvailable: { hrv: currentHRV !== null, restingHR: currentHR !== null, sleep: currentSleep !== null },
    }, 200, corsHeaders);
  } catch (error) {
    return json({ error: 'Internal error', details: String(error) }, 500, corsHeaders);
  }
});

// ----- Scoring Functions -----
function scoreHRV(current: number, baseline: number): number {
  if (baseline <= 0) return 50;
  const ratio = current / baseline;
  if (ratio >= 1.2) return 100;
  if (ratio >= 1.0) return 70 + (ratio - 1.0) * 150;
  if (ratio >= 0.8) return 40 + (ratio - 0.8) * 150;
  return Math.max(0, ratio * 50);
}

function scoreRestingHR(current: number, baseline: number): number {
  const diff = current - baseline;
  if (diff <= -5) return 100;
  if (diff <= 0) return 75 + Math.abs(diff) * 5;
  if (diff <= 5) return 50 + (5 - diff) * 5;
  if (diff <= 10) return 25 + (10 - diff) * 5;
  return Math.max(0, 25 - (diff - 10) * 2.5);
}

function scoreSleep(minutes: number, qualityPct: number): number {
  let durationScore = minutes >= 420 ? 100 : minutes >= 360 ? 70 + ((minutes - 360) / 60) * 30 : Math.max(0, (minutes / 360) * 70);
  const qualityScore = Math.min(100, qualityPct * 200);
  return Math.round(durationScore * 0.6 + qualityScore * 0.4);
}

function buildRecommendation(classification: string, score: number) {
  if (classification === 'recovered') return {
    category: 'high_intensity', message: 'Your body is fully recovered — great day for a challenge!',
    suggestedRoute: '/(tabs)/form-check', nutritionFocus: 'performance',
  };
  if (classification === 'balanced') return {
    category: 'moderate_activity', message: 'Balanced state — moderate activity will keep momentum.',
    suggestedRoute: '/(tabs)/mind-body?tab=yoga', nutritionFocus: 'maintenance',
  };
  return {
    category: 'recovery', message: 'Your body needs recovery today. Guided breathing & gentle nutrition.',
    suggestedRoute: '/(tabs)/mind-body/breathing', nutritionFocus: 'recovery',
  };
}

// ----- Utilities -----
function avg(arr: number[]): number { return arr.reduce((s, v) => s + v, 0) / arr.length; }
function round(n: number): number { return Math.round(n * 100) / 100; }
function clamp(n: number, min: number, max: number): number { return Math.max(min, Math.min(max, n)); }
function json(data: any, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
}
