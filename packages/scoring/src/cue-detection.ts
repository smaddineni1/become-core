import type { CueType } from '@become/shared';
import type { CueRule, ExerciseProfile } from './types.js';

export interface DetectedCue {
  cue: CueType;
  message: string;
  severity: number; // 0-1 how far past threshold
}

/**
 * Evaluate current joint angles against the exercise profile's cue rules.
 * Returns an array of currently active cues.
 */
export function detectCues(
  jointAngles: Record<string, number>,
  profile: ExerciseProfile,
): DetectedCue[] {
  const detected: DetectedCue[] = [];

  for (const rule of profile.cues) {
    const angle = jointAngles[rule.joint];
    if (angle === undefined) continue;

    let triggered = false;
    let severity = 0;

    if (rule.condition === 'above' && angle > rule.threshold) {
      triggered = true;
      severity = Math.min(1, (angle - rule.threshold) / 20);
    } else if (rule.condition === 'below' && angle < rule.threshold) {
      triggered = true;
      severity = Math.min(1, (rule.threshold - angle) / 20);
    }

    if (triggered) {
      detected.push({
        cue: rule.cue,
        message: rule.message,
        severity,
      });
    }
  }

  return detected;
}
