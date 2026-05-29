import type { ExerciseProfile, RepPhase } from './types.js';

/**
 * Finite State Machine for rep detection.
 * Tracks phase transitions based on joint angle thresholds.
 */
export class RepStateMachine {
  private currentPhase: RepPhase;
  private repCount = 0;
  private readonly profile: ExerciseProfile;

  constructor(profile: ExerciseProfile) {
    this.profile = profile;
    this.currentPhase = profile.phases[0]!;
  }

  /**
   * Process a new frame's joint angles and determine if a phase transition occurred.
   * Returns true if a complete rep was just finished.
   */
  update(jointAngles: Record<string, number>): boolean {
    let repCompleted = false;

    for (const transition of this.profile.transitions) {
      if (transition.from !== this.currentPhase) continue;

      const angle = jointAngles[transition.trigger.joint];
      if (angle === undefined) continue;

      const shouldTransition =
        transition.trigger.condition === 'below'
          ? angle < transition.trigger.angleDeg
          : angle > transition.trigger.angleDeg;

      if (shouldTransition) {
        this.currentPhase = transition.to;

        // If we've returned to the start phase, that's a completed rep
        const startPhase = this.profile.phases[0]!;
        if (this.currentPhase === startPhase && this.repCount > 0 || 
            (this.currentPhase === startPhase && this.hasPassedBottom())) {
          this.repCount++;
          repCompleted = true;
        }
        break;
      }
    }

    return repCompleted;
  }

  private hasPassedBottom(): boolean {
    // The phase before the current one should be 'ascent' or equivalent
    // indicating we went through a full cycle
    return true; // Simplified — full implementation tracks phase history
  }

  getCurrentPhase(): RepPhase {
    return this.currentPhase;
  }

  getRepCount(): number {
    return this.repCount;
  }

  reset(): void {
    this.currentPhase = this.profile.phases[0]!;
    this.repCount = 0;
  }
}
