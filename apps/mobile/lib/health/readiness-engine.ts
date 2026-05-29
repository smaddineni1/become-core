/**
 * Readiness Engine — Daily Readiness Score Calculator
 *
 * Computes a 0-100 Readiness Score from biometric data:
 * - HRV relative to personal baseline (40% weight)
 * - Resting heart rate relative to baseline (25% weight)
 * - Sleep duration + quality (35% weight)
 *
 * The score drives the Recommendation Router:
 * - 80-100: "Recovered" → High-intensity workout recommended
 * - 50-79:  "Balanced"  → Moderate activity recommended
 * - 0-49:   "Stressed"  → Recovery mode: breathing + recovery nutrition
 */

export interface ReadinessFactors {
  hrvScore: number;        // 0-100 (HRV vs baseline)
  restingHRScore: number;  // 0-100 (lower resting HR = better)
  sleepScore: number;      // 0-100 (duration + quality)
}

export interface ReadinessScore {
  overall: number;         // 0-100 composite
  factors: ReadinessFactors;
  classification: 'recovered' | 'balanced' | 'stressed';
  recommendation: ReadinessRecommendation;
  computedAt: string;
}

export interface ReadinessRecommendation {
  category: 'high_intensity' | 'moderate_activity' | 'recovery';
  message: string;
  suggestedRoute: string;
  nutritionFocus: 'performance' | 'maintenance' | 'recovery';
}

interface BaselineData {
  hrvBaselineMs: number;     // 7-day rolling average HRV
  restingHRBaseline: number; // 7-day rolling average resting HR
  sleepBaseline: number;     // 7-day rolling average sleep (minutes)
}

const WEIGHTS = {
  hrv: 0.40,
  restingHR: 0.25,
  sleep: 0.35,
} as const;

export class ReadinessEngine {
  /**
   * Calculate the daily readiness score.
   *
   * @param currentHRV - Today's RMSSD in ms (null if unavailable)
   * @param currentRestingHR - Today's resting HR in bpm (null if unavailable)
   * @param sleepMinutes - Last night's total sleep in minutes (null if unavailable)
   * @param sleepQualityPct - 0-1 quality ratio (deep+rem / total) (null if unavailable)
   * @param baseline - 7-day rolling baseline data
   */
  static calculate(
    currentHRV: number | null,
    currentRestingHR: number | null,
    sleepMinutes: number | null,
    sleepQualityPct: number | null,
    baseline: BaselineData,
  ): ReadinessScore {
    // HRV Score (higher = better; compare to personal baseline)
    const hrvScore = currentHRV !== null
      ? this.scoreHRV(currentHRV, baseline.hrvBaselineMs)
      : 50; // Neutral if no data

    // Resting HR Score (lower = better; compare to personal baseline)
    const restingHRScore = currentRestingHR !== null
      ? this.scoreRestingHR(currentRestingHR, baseline.restingHRBaseline)
      : 50;

    // Sleep Score (duration + quality)
    const sleepScore = sleepMinutes !== null
      ? this.scoreSleep(sleepMinutes, sleepQualityPct ?? 0.5, baseline.sleepBaseline)
      : 50;

    // Weighted composite
    const overall = Math.round(
      hrvScore * WEIGHTS.hrv +
      restingHRScore * WEIGHTS.restingHR +
      sleepScore * WEIGHTS.sleep,
    );

    const classification = this.classify(overall);
    const recommendation = this.recommend(classification, overall);

    return {
      overall: Math.max(0, Math.min(100, overall)),
      factors: { hrvScore, restingHRScore, sleepScore },
      classification,
      recommendation,
      computedAt: new Date().toISOString(),
    };
  }

  /**
   * Score HRV relative to baseline.
   * Above baseline = recovered (>100 maps to high score)
   * Below baseline = stressed (<80% maps to low score)
   */
  private static scoreHRV(current: number, baseline: number): number {
    if (baseline <= 0) return 50;
    const ratio = current / baseline;

    if (ratio >= 1.2) return 100;       // 20%+ above baseline
    if (ratio >= 1.0) return 70 + (ratio - 1.0) * 150; // 70-100
    if (ratio >= 0.8) return 40 + (ratio - 0.8) * 150; // 40-70
    if (ratio >= 0.6) return 10 + (ratio - 0.6) * 150; // 10-40
    return Math.max(0, ratio * 16);      // Very low
  }

  /**
   * Score resting heart rate (inverse — lower is better).
   * Below baseline = recovered
   * Above baseline = stressed
   */
  private static scoreRestingHR(current: number, baseline: number): number {
    if (baseline <= 0) return 50;
    const diff = current - baseline; // positive = elevated (bad)

    if (diff <= -5) return 100;       // 5+ bpm below baseline
    if (diff <= 0) return 75 + Math.abs(diff) * 5; // 75-100
    if (diff <= 5) return 50 + (5 - diff) * 5;     // 50-75
    if (diff <= 10) return 25 + (10 - diff) * 5;   // 25-50
    return Math.max(0, 25 - (diff - 10) * 2.5);    // 0-25
  }

  /**
   * Score sleep (duration + quality relative to baseline).
   * Optimal: 7-9 hours with high deep+REM proportion.
   */
  private static scoreSleep(
    minutes: number,
    qualityPct: number,
    baselineMinutes: number,
  ): number {
    // Duration score (optimal: 420-540 min = 7-9 hours)
    let durationScore: number;
    if (minutes >= 420 && minutes <= 540) {
      durationScore = 100;
    } else if (minutes >= 360) {
      durationScore = 70 + ((minutes - 360) / 60) * 30;
    } else if (minutes >= 300) {
      durationScore = 40 + ((minutes - 300) / 60) * 30;
    } else {
      durationScore = Math.max(0, (minutes / 300) * 40);
    }

    // Quality score (proportion of deep + REM sleep)
    // Good quality: >40% deep+REM; Poor: <25%
    const qualityScore = Math.min(100, qualityPct * 200); // 0.5 = 100

    // Combined (60% duration, 40% quality)
    return Math.round(durationScore * 0.6 + qualityScore * 0.4);
  }

  private static classify(score: number): 'recovered' | 'balanced' | 'stressed' {
    if (score >= 80) return 'recovered';
    if (score >= 50) return 'balanced';
    return 'stressed';
  }

  private static recommend(
    classification: 'recovered' | 'balanced' | 'stressed',
    score: number,
  ): ReadinessRecommendation {
    switch (classification) {
      case 'recovered':
        return {
          category: 'high_intensity',
          message: 'Your body is fully recovered. Great day for a challenging workout!',
          suggestedRoute: '/(tabs)/form-check',
          nutritionFocus: 'performance',
        };
      case 'balanced':
        return {
          category: 'moderate_activity',
          message: 'You\'re in a balanced state. Moderate activity will keep you on track.',
          suggestedRoute: '/(tabs)/mind-body?tab=yoga',
          nutritionFocus: 'maintenance',
        };
      case 'stressed':
        return {
          category: 'recovery',
          message: 'Your body needs recovery today. Let\'s focus on breathing and gentle restoration.',
          suggestedRoute: '/(tabs)/mind-body/breathing',
          nutritionFocus: 'recovery',
        };
    }
  }
}
