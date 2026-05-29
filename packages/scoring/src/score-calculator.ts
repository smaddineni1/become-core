import type { ExerciseProfile, RepPhase } from './types.js';
import { detectCues } from './cue-detection.js';

export interface ScoreResult {
  score: number;         // 0-100
  jointAngles: Record<string, number>;
  phase: RepPhase;
  cuesPenalty: number;   // Points deducted for active cues
  rangePenalty: number;  // Points deducted for out-of-range angles
}

/**
 * Score a single frame against the exercise profile.
 * Score = 100 - rangePenalty - cuesPenalty
 *
 * Range penalty: For each joint outside ideal range, deduct proportional to distance.
 * Cue penalty: Each active cue deducts 10-20 points based on severity.
 */
export function scoreRep(
  jointAngles: Record<string, number>,
  currentPhase: RepPhase,
  profile: ExerciseProfile,
): ScoreResult {
  let rangePenalty = 0;
  let cuesPenalty = 0;

  // Calculate range penalties
  const phaseRanges = profile.idealRanges[currentPhase];
  if (phaseRanges) {
    const jointCount = Object.keys(phaseRanges).length;
    const maxPenaltyPerJoint = jointCount > 0 ? 60 / jointCount : 60;

    for (const [joint, range] of Object.entries(phaseRanges)) {
      const angle = jointAngles[joint];
      if (angle === undefined) continue;

      if (angle < range.min) {
        const deviation = range.min - angle;
        rangePenalty += Math.min(maxPenaltyPerJoint, (deviation / 30) * maxPenaltyPerJoint);
      } else if (angle > range.max) {
        const deviation = angle - range.max;
        rangePenalty += Math.min(maxPenaltyPerJoint, (deviation / 30) * maxPenaltyPerJoint);
      }
    }
  }

  // Calculate cue penalties
  const activeCues = detectCues(jointAngles, profile);
  for (const cue of activeCues) {
    cuesPenalty += 10 + cue.severity * 10; // 10-20 per cue
  }

  const score = Math.max(0, Math.min(100, 100 - rangePenalty - cuesPenalty));

  return {
    score: Math.round(score * 100) / 100,
    jointAngles,
    phase: currentPhase,
    cuesPenalty: Math.round(cuesPenalty * 100) / 100,
    rangePenalty: Math.round(rangePenalty * 100) / 100,
  };
}
