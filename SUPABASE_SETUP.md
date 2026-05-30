# Become — Supabase Setup Guide

## Step 1: Run Database Migrations

1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/tehezgpzecdblhebddoo
2. Navigate to **SQL Editor** (left sidebar)
3. Click **+ New Query**
4. Copy the ENTIRE contents of `supabase/combined-migration.sql` and paste it
5. Click **Run** (Ctrl+Enter)

This creates all 14 tables with RLS policies, triggers, and indexes.

## Step 2: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** (already enabled by default):
   - Confirm email: ON
   - Secure email change: ON
3. Enable **Apple** (requires Apple Developer account):
   - Service ID: `com.become.app`
   - You'll need the Apple OAuth credentials from your developer portal
4. Enable **Google**:
   - Create OAuth credentials at console.cloud.google.com
   - Authorized redirect: `https://tehezgpzecdblhebddoo.supabase.co/auth/v1/callback`

## Step 3: Configure Auth Redirect URLs

Go to **Authentication** → **URL Configuration**:
- Site URL: `become://`
- Redirect URLs (add all):
  - `become://`
  - `become://login`
  - `become://register`
  - `http://localhost:8081`
  - `exp://localhost:8081`

## Step 4: Verify Tables

After running migrations, go to **Table Editor** and verify these tables exist:
- user_profiles
- user_biometric_profiles
- workout_sessions
- rep_scores
- hrv_readings
- nutrition_plans
- genie_conversations
- genie_messages
- mindfulness_sessions
- subscription_events
- sleep_readings
- resting_hr_readings
- biometric_baselines
- readiness_scores

## Step 5: Deploy Edge Functions (when ready)

```bash
supabase login
supabase link --project-ref tehezgpzecdblhebddoo
supabase functions deploy generate-meal-plan
supabase functions deploy genie-message
supabase functions deploy compute-readiness
supabase functions deploy onboarding-scan
supabase functions deploy revenuecat-webhook
```

Set secrets:
```bash
supabase secrets set OPENAI_API_KEY=your-key-here
supabase secrets set RC_WEBHOOK_SECRET=your-secret-here
```

## Environment Variables

### Mobile App (.env)
```
EXPO_PUBLIC_SUPABASE_URL=https://tehezgpzecdblhebddoo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_8ZGCicXame67Mn1TGcRyng_0jJ3sX-i
```

### Web App (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://tehezgpzecdblhebddoo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_8ZGCicXame67Mn1TGcRyng_0jJ3sX-i
```
