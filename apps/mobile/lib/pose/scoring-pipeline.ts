/**
 * Scoring Pipeline — Connects MediaPipe output to the @become/scoring engine
 *
 * This is the real-time loop that:
 * 1. Receives pose frames from MediaPipe
 * 2. Extracts joint angles using the geometry engine
 * 3. Scores each frame against the exercise profile
 * 4. Detects corrective cues
 * 5. Tracks rep state machine transitions
 * 6. Outputs live UI updates
 */

import type { ExerciseId } from '@app/packages/shared';
import {
  type Landmark,
  type ExerciseProfile,
  type RepPhase,
  calculateJointAngle,
  getProfile,
  RepStateMachine,
  scoreRep,
  detectCues,
} from '@app/packages/scoring';
import {
  type ProcessedPoseFrame,
  type MediaPipePoseResult,
  extractLandmarks,
  toLandmarkRecord,
  isPoseReliable,
} from './mediapipe-processor';

// ----- Types -----

export interface ScoringState {
  currentScore: number;
  averageScore: number;
  repCount: number;
  currentPhase: RepPhase;
  activeCues: Array<{ cue: string; message: string; severity: number }>;
  isReliable: boolean;
  jointAngles: Record<string, number>;
  repScores: number[];
  sessionDurationMs: number;
}

export interface ScoringCallbacks {
  onScoreUpdate: (state: ScoringState) => void;
  onRepCompleted: (repNumber: number, score: number) => void;
  onCueTriggered: (cue: string, message: string) => void;
}

// ----- Pipeline Class -----

export class ScoringPipeline {
  private readonly profile: ExerciseProfile;
  private readonly stateMachine: RepStateMachine;
  private readonly callbacks: ScoringCallbacks;

  private repScores: number[] = [];
  private frameCount = 0;
  private runningScoreSum = 0;
  private currentScore = 0;
  private sessionStartTime: number;
  private lastCueEmitTime: Map<string, number> = new Map();

  // Cue cooldown to prevent spamming (min 2s between same cue)
  private readonly CUE_COOLDOWN_MS = 2000;

  constructor(exerciseId: ExerciseId, callbacks: ScoringCallbacks) {
    this.profile = getProfile(exerciseId);
    this.stateMachine = new RepStateMachine(this.profile);
    this.callbacks = callbacks;
    this.sessionStartTime = Date.now();
  }

  /**
   * Process a single frame from MediaPipe.
   * Call this on every camera frame (target: 30fps, minimum: 15fps scoring).
   */
  processFrame(rawResult: MediaPipePoseResult): void {
    // Step 1: Extract and validate landmarks
    const frame = extractLandmarks(rawResult);
    const isReliable = isPoseReliable(frame);

    if (!isReliable) {
      this.emitState(isReliable, {});
      return;
    }

    // Step 2: Convert to record format for scoring engine
    const landmarkRecord = toLandmarkRecord(frame);

    // Step 3: Calculate all joint angles defined in the exercise profile
    const jointAngles = this.calculateAllJointAngles(landmarkRecord);

    // Step 4: Update rep state machine
    const repCompleted = this.stateMachine.update(jointAngles);

    // Step 5: Score current frame
    const currentPhase = this.stateMachine.getCurrentPhase();
    const scoreResult = scoreRep(jointAngles, currentPhase, this.profile);
    this.currentScore = scoreResult.score;
    this.frameCount++;
    this.runningScoreSum += scoreResult.score;

    // Step 6: Handle rep completion
    if (repCompleted && this.currentScore >= this.profile.minScoreForValidRep) {
      this.repScores.push(this.currentScore);
      this.callbacks.onRepCompleted(this.repScores.length, this.currentScore);
    }

    // Step 7: Detect and emit cues (with cooldown)
    const activeCues = detectCues(jointAngles, this.profile);
    for (const cue of activeCues) {
      const lastEmit = this.lastCueEmitTime.get(cue.cue) ?? 0;
      if (Date.now() - lastEmit > this.CUE_COOLDOWN_MS) {
        this.callbacks.onCueTriggered(cue.cue, cue.message);
        this.lastCueEmitTime.set(cue.cue, Date.now());
      }
    }

    // Step 8: Emit full state update
    this.emitState(isReliable, jointAngles, activeCues);
  }

  /**
   * Calculate joint angles for all target joints in the exercise profile.
   */
  private calculateAllJointAngles(
    landmarks: Record<string, Landmark>,
  ): Record<string, number> {
    const angles: Record<string, number> = {};

    for (const [jointName, definition] of Object.entries(this.profile.targetJoints)) {
      const [aName, bName, cName] = definition.landmarks;
      const a = landmarks[aName];
      const b = landmarks[bName];
      const c = landmarks[cName];

      if (a && b && c) {
        angles[jointName] = calculateJointAngle(a, b, c);
      }
    }

    return angles;
  }

  /**
   * Emit current scoring state to UI via callback.
   */
  private emitState(
    isReliable: boolean,
    jointAngles: Record<string, number>,
    activeCues: Array<{ cue: string; message: string; severity: number }> = [],
  ): void {
    const averageScore =
      this.repScores.length > 0
        ? this.repScores.reduce((sum, s) => sum + s, 0) / this.repScores.length
        : 0;

    this.callbacks.onScoreUpdate({
      currentScore: Math.round(this.currentScore),
      averageScore: Math.round(averageScore),
      repCount: this.stateMachine.getRepCount(),
      currentPhase: this.stateMachine.getCurrentPhase(),
      activeCues,
      isReliable,
      jointAngles,
      repScores: [...this.repScores],
      sessionDurationMs: Date.now() - this.sessionStartTime,
    });
  }

  /**
   * Get final session summary for persistence.
   */
  getSessionSummary() {
    return {
      totalReps: this.repScores.length,
      averageScore:
        this.repScores.length > 0
          ? Math.round(
              this.repScores.reduce((s, v) => s + v, 0) / this.repScores.length,
            )
          : 0,
      repScores: [...this.repScores],
      durationSeconds: Math.round((Date.now() - this.sessionStartTime) / 1000),
      totalFramesProcessed: this.frameCount,
    };
  }

  /**
   * Reset the pipeline for a new session.
   */
  reset(): void {
    this.stateMachine.reset();
    this.repScores = [];
    this.frameCount = 0;
    this.runningScoreSum = 0;
    this.currentScore = 0;
    this.sessionStartTime = Date.now();
    this.lastCueEmitTime.clear();
  }
}
