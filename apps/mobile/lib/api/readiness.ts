/**
 * Readiness API — Client-side functions for readiness scoring
 */

import { supabase } from '../supabase';

const FUNCTIONS_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

export interface ReadinessResponse {
  score: number;
  classification: 'recovered' | 'balanced' | 'stressed';
  factors: { hrv: number; restingHR: number; sleep: number };
  baseline: { hrvMs: number; restingHR: number; sleepMin: number };
  recommendation: {
    category: string;
    message: string;
    suggestedRoute: string;
    nutritionFocus: string;
  };
  dataAvailable: { hrv: boolean; restingHR: boolean; sleep: boolean };
}

/**
 * Fetch (or compute) today's readiness score from the backend.
 */
export async function getReadinessScore(): Promise<{ success: boolean; data?: ReadinessResponse; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'Not authenticated' };

  const response = await fetch(`${FUNCTIONS_URL}/functions/v1/compute-readiness`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  const data = await response.json();
  if (!response.ok) return { success: false, error: data.error };
  return { success: true, data };
}

/**
 * Fetch the 7-day readiness trend from stored scores.
 */
export async function getReadinessTrend(): Promise<Array<{ date: string; score: number; classification: string }>> {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('readiness_scores')
    .select('score_date, overall_score, classification')
    .gte('score_date', weekAgo)
    .order('score_date', { ascending: true });

  if (error || !data) return [];
  return data.map((r: any) => ({
    date: r.score_date,
    score: r.overall_score,
    classification: r.classification,
  }));
}
