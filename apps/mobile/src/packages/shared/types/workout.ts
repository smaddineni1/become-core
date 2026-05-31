/**
 * Workout / Form Check types
 */
export type ExerciseId = 'air_squat' | 'push_up' | 'sit_up' | 'kettlebell_swing';

export type CueType = 'knee_cave' | 'deficient_depth' | 'forward_lean';

export interface CueDetection {
  cue: CueType;
  count: number;
  firstAt: string;
  message: string;
}

export interface RepScore {
  id: string;
  sessionId: string;
  repNumber: number;
  score: number; // 0-100
  jointAngles: Record<string, number>;
  cues: CueType[];
  scoredAt: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  exercise: ExerciseId;
  totalReps: number;
  averageScore: number;
  durationSeconds: number;
  cuesDetected: CueDetection[];
  startedAt: string;
  completedAt: string | null;
}

export interface WorkoutSessionInput {
  exercise: ExerciseId;
}

export interface RepScoreBatch {
  sessionId: string;
  reps: Array<{
    repNumber: number;
    score: number;
    jointAngles: Record<string, number>;
    cues: CueType[];
  }>;
}
