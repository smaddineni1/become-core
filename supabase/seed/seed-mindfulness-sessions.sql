-- Seed mindfulness sessions with the real breathing video
INSERT INTO public.mindfulness_sessions (title, description, category, duration, intensity, thumbnail_url, video_url, is_breathing, tags)
VALUES
  (
    '5-Min Recovery Breathing',
    'Slow diaphragmatic breathing to activate parasympathetic recovery. Follow the visual guide to regulate your nervous system.',
    'meditation',
    5,
    'gentle',
    'https://tehezgpzecdblhebddoo.supabase.co/storage/v1/object/public/videos/runway-agent-exhale-20260528-152325.mp4',
    'https://tehezgpzecdblhebddoo.supabase.co/storage/v1/object/public/videos/runway-agent-exhale-20260528-152325.mp4',
    true,
    '["recovery", "exhale", "parasympathetic", "hrv", "gentle"]'
  )
ON CONFLICT DO NOTHING;
