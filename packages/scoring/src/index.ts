// @become/scoring — Form Check Geometry & Scoring Engine
export { calculateJointAngle, calculateMidpoint, normalize3D } from './geometry.js';
export { RepStateMachine } from './rep-state-machine.js';
export { detectCues } from './cue-detection.js';
export { scoreRep } from './score-calculator.js';
export { AIR_SQUAT_PROFILE } from './profiles/air-squat.js';
export { PUSH_UP_PROFILE } from './profiles/push-up.js';
export { SIT_UP_PROFILE } from './profiles/sit-up.js';
export { KETTLEBELL_SWING_PROFILE } from './profiles/kettlebell-swing.js';
export { getProfile } from './profiles/index.js';
export type { Landmark, ExerciseProfile, JointDefinition, CueRule, RepPhase, PhaseTransition } from './types.js';
