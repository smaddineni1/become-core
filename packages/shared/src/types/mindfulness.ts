/**
 * Mind & Body / Mindfulness types
 */
export type MindfulnessCategory = 'yoga' | 'meditation';
export type SessionDuration = 5 | 10 | 20;
export type SessionIntensity = 'gentle' | 'moderate' | 'energizing';

export interface MindfulnessSession {
  id: string;
  title: string;
  description: string;
  category: MindfulnessCategory;
  duration: SessionDuration;
  intensity: SessionIntensity;
  thumbnailUrl: string;
  videoUrl: string | null; // null for non-video sessions
  isBreathing: boolean;
  tags: string[];
  createdAt: string;
}

export interface BreathingVideoConfig {
  url: string;
  cacheable: boolean;
  loopable: boolean;
  durationSeconds: number;
}
