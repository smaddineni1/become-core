/**
 * Supabase Client Configuration
 *
 * Single instance shared across the mobile app.
 * Uses AsyncStorage for session persistence.
 */
import { createClient } from '@supabase/supabase-js';

// These will be loaded from Doppler/env in production.
// For development, use Supabase local or dev project values.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Not needed for React Native
  },
});
