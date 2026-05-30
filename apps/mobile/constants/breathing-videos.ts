/**
 * Breathing Video Library
 * URLs for guided breathing sessions stored in Supabase Storage.
 */
export const BREATHING_VIDEOS = [
  {
    id: 'exhale_recovery_01',
    title: '5-Min Recovery Breathing',
    description: 'Slow diaphragmatic breathing to activate parasympathetic recovery',
    url: 'https://tehezgpzecdblhebddoo.supabase.co/storage/v1/object/public/videos/runway-agent-exhale-20260528-152325.mp4',
    durationSeconds: 300,
    category: 'meditation' as const,
    intensity: 'gentle' as const,
    tags: ['recovery', 'exhale', 'parasympathetic', 'hrv'],
    isDefault: true,
  },
] as const;

export function getDefaultBreathingVideo() {
  return BREATHING_VIDEOS[0];
}

export const PREFETCH_VIDEO_URLS = BREATHING_VIDEOS.map((v) => v.url);
