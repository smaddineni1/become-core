import type { CueType, ExerciseId } from '../shared';

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export type RepPhase = 'standing' | 'descent' | 'bottom' | 'ascent' | 'start' | 'down' | 'up';

export interface JointDefinition {
  landmarks: [string, string, string]; // [A, B, C] — angle calculated at B
}

export interface IdealRange {
  min: number;
  max: number;
}

export interface CueRule {
  cue: CueType;
  joint: string;
  condition: 'above' | 'below';
  threshold: number;
  message: string;
}

export interface PhaseTransition {
  from: RepPhase;
  to: RepPhase;
  trigger: {
    joint: string;
    condition: 'below' | 'above';
    angleDeg: number;
  };
}

export interface ExerciseProfile {
  exercise: ExerciseId;
  phases: RepPhase[];
  targetJoints: Record<string, JointDefinition>;
  idealRanges: Record<string, Record<string, IdealRange>>;
  cues: CueRule[];
  transitions: PhaseTransition[];
  minScoreForValidRep: number;
}
