# Become — System Architecture & Component Design
> Version 1.0 | May 2026

---

## 1. High-Level System Topology

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
│                                                                         │
│  ┌──────────────────┐     ┌──────────────────┐    ┌──────────────────┐ │
│  │ React Native App │     │  Next.js Web App  │    │  Admin Portal    │ │
│  │   (Expo SDK 52)  │     │   (App Router)    │    │  (Next.js)       │ │
│  └────────┬─────────┘     └────────┬──────────┘    └────────┬─────────┘ │
│           │                        │                         │           │
│  ┌────────┴────────────────────────┴─────────────────────────┴─────────┐ │
│  │                    @become/shared (TypeScript Types)                  │ │
│  └──────────────────────────────────┬──────────────────────────────────┘ │
└─────────────────────────────────────┼───────────────────────────────────┘
                                      │
                        ┌─────────────┼─────────────┐
                        ▼             ▼             ▼
         ┌──────────────────┐ ┌─────────────┐ ┌─────────────────────┐
         │  Supabase Cloud  │ │ Cloudflare  │ │    External APIs     │
         │  ─────────────── │ │ ─────────── │ │  ────────────────    │
         │  • Auth          │ │ • Workers   │ │  • OpenAI GPT-4o    │
         │  • PostgreSQL    │ │ • Stream    │ │  • Bodygram         │
         │  • Realtime      │ │ • R2        │ │  • RevenueCat       │
         │  • Storage       │ │ • CDN       │ │  • Apple/Google Pay │
         │  • Edge Funcs    │ │             │ │  • HealthKit/HC     │
         └──────────────────┘ └─────────────┘ └─────────────────────┘
```

---

## 2. Monorepo Structure

```
become/
├── apps/
│   ├── mobile/              # React Native (Expo) — iOS & Android
│   ├── web/                 # Next.js 15 — Marketing + Web App
│   └── admin/               # Next.js 15 — Internal Admin Portal
├── packages/
│   ├── shared/              # @become/shared — TypeScript types, validators, constants
│   ├── ui/                  # @become/ui — Cross-platform component library
│   ├── scoring/             # @become/scoring — Form scoring geometry engine
│   └── ai/                  # @become/ai — LLM prompt templates & guardrails
├── supabase/
│   ├── migrations/          # SQL migrations (schema, RLS, indexes)
│   ├── functions/           # Edge Functions (Deno)
│   └── seed/                # Dev seed data
├── workers/
│   └── form-scorer/         # Cloudflare Worker — edge scoring aggregation
├── assets/
│   ├── models/              # GLTF 3D character models
│   └── videos/              # AI-generated breathing videos
├── turbo.json               # Turborepo pipeline config
├── package.json             # Root workspace config
└── .kiro/
    └── tech.md              # This stack document
```

**Package Manager:** pnpm (workspace protocol)
**Build System:** Turborepo (parallel builds, remote caching)



---

## 3. Database Schema Design (Core Entities)

### 3.1 Entity Relationship Summary

```
User (1) ─────── (1) UserBiometricProfile
  │
  ├── (1:N) WorkoutSession
  │            └── (1:N) RepScore
  │
  ├── (1:N) NutritionPlan
  │            └── (1:N) Meal
  │
  ├── (1:N) HRVReading
  │
  ├── (1:N) GenieConversation
  │            └── (1:N) GenieMessage
  │
  └── (1:N) MindfulnessSession
```

### 3.2 Key Table Definitions

```sql
-- Core User (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  fitness_goal TEXT NOT NULL CHECK (fitness_goal IN ('lose_fat','build_muscle','improve_mobility','reduce_stress')),
  activity_level TEXT NOT NULL,
  dietary_preferences JSONB DEFAULT '[]',
  onboarding_completed_at TIMESTAMPTZ,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free','premium')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Biometric Profile (Digital Twin data)
CREATE TABLE public.user_biometric_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'simulation', -- 'simulation' | 'bodygram' | future providers
  measurements JSONB NOT NULL,  -- Standardized 240+ measurement map
  raw_provider_data JSONB,       -- Original provider response (encrypted at rest)
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, scanned_at)
);

-- Workout Session (Form Check)
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  exercise TEXT NOT NULL CHECK (exercise IN ('air_squat','push_up','sit_up','kettlebell_swing')),
  total_reps INTEGER NOT NULL DEFAULT 0,
  average_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL,
  cues_detected JSONB DEFAULT '[]',  -- [{cue: 'knee_cave', count: 3, first_at: ...}]
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Individual Rep Scores
CREATE TABLE public.rep_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  rep_number INTEGER NOT NULL,
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  joint_angles JSONB NOT NULL,  -- {left_knee: 92.3, right_knee: 91.1, hip: 85.6, ...}
  cues JSONB DEFAULT '[]',
  scored_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HRV Readings
CREATE TABLE public.hrv_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  rmssd_ms NUMERIC(6,2) NOT NULL,  -- Root mean square of successive differences
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','healthkit','health_connect')),
  classification TEXT NOT NULL CHECK (classification IN ('recovery','balanced','stressed')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Nutrition Plans
CREATE TABLE public.nutrition_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  meals JSONB NOT NULL,  -- Array of meal objects with macros
  total_calories INTEGER NOT NULL,
  total_protein_g NUMERIC(5,1),
  total_carbs_g NUMERIC(5,1),
  total_fat_g NUMERIC(5,1),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  regeneration_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, plan_date)
);

-- Genie Conversations
CREATE TABLE public.genie_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.genie_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.genie_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  action_buttons JSONB DEFAULT '[]',  -- [{label, route, icon}]
  embedding vector(1536),  -- pgvector for RAG retrieval
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.3 Row-Level Security Pattern

```sql
-- Example RLS policy (applied to every user-facing table)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);
```



---

## 4. Component Architecture — Form Check Engine

### 4.1 Data Flow (On-Device + Edge)

```
┌─────────────── DEVICE (Zero Network for Video) ──────────────────────┐
│                                                                       │
│  Camera Feed ──► MediaPipe Pose ──► 33 Landmarks (x,y,z,visibility) │
│                    (WASM/TFLite)                                      │
│                         │                                            │
│                         ▼                                            │
│              ┌─────────────────────┐                                 │
│              │ @become/scoring     │                                 │
│              │ ─────────────────── │                                 │
│              │ 1. Extract angles   │                                 │
│              │ 2. Compare to model │                                 │
│              │ 3. Detect cues      │                                 │
│              │ 4. Score 0-100      │                                 │
│              └──────────┬──────────┘                                 │
│                         │                                            │
│                         ▼                                            │
│              ┌─────────────────────┐                                 │
│              │   UI Overlay Layer  │ ◄── 3D Model Ref Angles         │
│              │   (Score + Cues)    │                                 │
│              └──────────┬──────────┘                                 │
│                         │                                            │
└─────────────────────────┼────────────────────────────────────────────┘
                          │ (On rep complete, batch post)
                          ▼
              ┌─────────────────────┐
              │ Cloudflare Worker   │  ◄── Aggregates session stats
              │ (form-scorer)       │      Validates, stores to Supabase
              └─────────────────────┘
```

### 4.2 Angle Calculation Algorithm

```typescript
// @become/scoring/src/geometry.ts

interface Landmark { x: number; y: number; z: number; }

/**
 * Calculate angle at joint B formed by segments BA and BC
 * using the dot product / cosine rule in 3D space.
 */
export function calculateJointAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2 + ba.z ** 2);
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2 + bc.z ** 2);

  const cosAngle = dot / (magBA * magBC);
  return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
}
```

### 4.3 Exercise Scoring Profiles

Each exercise has a scoring profile defining:
- **Target joints** to measure (e.g., knee, hip, shoulder)
- **Ideal angle ranges** per phase (e.g., bottom of squat: knee 80-100°, hip 70-90°)
- **Cue trigger thresholds** (e.g., knee valgus > 10° from midline = "Knee Cave")
- **Rep detection rules** (state machine: Standing → Descent → Bottom → Ascent → Standing)

```typescript
// @become/scoring/src/profiles/air-squat.ts
export const AIR_SQUAT_PROFILE: ExerciseProfile = {
  exercise: 'air_squat',
  phases: ['standing', 'descent', 'bottom', 'ascent'],
  targetJoints: {
    left_knee: { landmarks: ['LEFT_HIP', 'LEFT_KNEE', 'LEFT_ANKLE'] },
    right_knee: { landmarks: ['RIGHT_HIP', 'RIGHT_KNEE', 'RIGHT_ANKLE'] },
    left_hip: { landmarks: ['LEFT_SHOULDER', 'LEFT_HIP', 'LEFT_KNEE'] },
    right_hip: { landmarks: ['RIGHT_SHOULDER', 'RIGHT_HIP', 'RIGHT_KNEE'] },
    torso_lean: { landmarks: ['MID_SHOULDER', 'MID_HIP', 'VERTICAL_REF'] },
  },
  idealRanges: {
    bottom: { knee: [80, 100], hip: [70, 90], torso_lean: [0, 30] },
  },
  cues: {
    knee_cave: { joint: 'knee_valgus', threshold: 10, message: 'Keep knees tracking over toes' },
    deficient_depth: { joint: 'left_hip', threshold: 100, message: 'Go deeper — hips below knees' },
    forward_lean: { joint: 'torso_lean', threshold: 35, message: 'Keep chest upright' },
  },
  repDetection: {
    startPhase: 'standing',
    bottomTrigger: { joint: 'left_knee', angleBelowDeg: 110 },
    completionTrigger: { joint: 'left_knee', angleAboveDeg: 160 },
    minScoreForValidRep: 60,
  },
};
```



---

## 5. Component Architecture — Genie AI Coach

### 5.1 Request Pipeline

```
┌──────────┐     ┌───────────────────┐     ┌──────────────────────────────┐
│  Client  │────►│ Supabase Edge Fn  │────►│ Genie Pipeline               │
│  (chat)  │     │ /genie/message    │     │                              │
└──────────┘     └───────────────────┘     │ 1. Embed user message        │
                                            │ 2. pgvector similarity search │
                                            │ 3. Build context window:      │
                                            │    - System prompt            │
                                            │    - User profile summary     │
                                            │    - HRV classification       │
                                            │    - Top-5 RAG chunks         │
                                            │    - Last 10 messages         │
                                            │ 4. Call GPT-4o (streaming)    │
                                            │ 5. Parse structured output:   │
                                            │    { text, action_buttons[] } │
                                            │ 6. Store message + embedding  │
                                            │ 7. Stream response to client  │
                                            └──────────────────────────────┘
```

### 5.2 Structured Output Schema

```typescript
// @become/shared/src/types/genie.ts
export interface GenieResponse {
  text: string;
  action_buttons: ActionButton[];
}

export interface ActionButton {
  label: string;          // e.g., "Start Air Squat"
  route: string;          // e.g., "/form-check/air_squat"
  icon?: string;          // e.g., "dumbbell" | "meditation" | "salad"
}

// GPT-4o JSON Schema enforcement
export const GENIE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    text: { type: 'string' },
    action_buttons: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          route: { type: 'string' },
          icon: { type: 'string' },
        },
        required: ['label', 'route'],
      },
      maxItems: 3,
    },
  },
  required: ['text', 'action_buttons'],
} as const;
```

### 5.3 Intent → Route Mapping

| User Intent | Genie Route | Button Example |
|-------------|-------------|----------------|
| "I'm exhausted" | `/mind-body?tab=meditation` | "Guided Recovery Session" |
| "Show me how to squat" | `/form-check/air_squat` | "Start Air Squat Form Check" |
| "I want to meditate" | `/mind-body?tab=meditation` | "5-Min Calm Meditation" |
| "What should I eat?" | `/nutrition` | "View Today's Meal Plan" |
| "Check my stress" | `/mind-body?tab=hrv` | "Log HRV Reading" |

---

## 6. Component Architecture — Nutrition Pipeline

### 6.1 Generation Flow

```
┌───────────────┐     ┌─────────────────────────────────────────────┐
│ Daily Cron    │────►│ Supabase Edge Function: generate-meal-plan  │
│ (Supabase)    │     │                                             │
└───────────────┘     │ 1. Fetch user profile + biometrics          │
                      │ 2. Build system prompt with:                │
                      │    - Caloric target (from biometrics)       │
                      │    - Macro ratios (from fitness goal)       │
                      │    - Dietary preferences                    │
                      │    - BRAND GUARDRAIL BLOCK LIST             │
                      │ 3. Call GPT-4o (JSON mode)                  │
                      │ 4. Validate against MealPlanSchema          │
                      │ 5. Retry if invalid (max 3x)               │
                      │ 6. Store validated plan in nutrition_plans  │
                      │ 7. Push notification: "Your plan is ready"  │
                      └─────────────────────────────────────────────┘
```

### 6.2 Brand Guardrail System Prompt Fragment

```
STRICT NUTRITION CONSTRAINTS (NEVER VIOLATE):
You are a whole-food nutrition expert. Every single food recommendation MUST be:
- A whole, minimally processed food ingredient
- Preparable from raw ingredients in a home kitchen

You are ABSOLUTELY PROHIBITED from recommending:
- Commercial protein bars (Quest, Kind, RXBar, Clif, etc.)
- Commercial protein powders or shakes (Optimum Nutrition, Ghost, etc.)
- Clear protein drinks (Protein2O, Premier Protein Clear, etc.)
- Meal replacement shakes (Huel, Soylent, etc.)
- Any heavily marketed branded snack product
- Pre-packaged/processed convenience foods

If asked about protein sources, recommend ONLY: eggs, Greek yogurt, cottage cheese,
chicken, turkey, fish, legumes, tofu, tempeh, nuts, seeds, and similar whole foods.
```

---

## 7. Component Architecture — Digital Twin Onboarding

### 7.1 Provider Adapter Interface

```typescript
// @become/shared/src/providers/biometric-scan.ts
export interface BiometricScanResult {
  measurements: Record<string, number>;  // 240+ standardized keys
  confidence: number;                     // 0-1 confidence score
  provider: string;                       // 'simulation' | 'bodygram'
  rawData?: unknown;                      // Provider-specific raw response
}

export interface BiometricScanProvider {
  readonly name: string;
  readonly requiredInputs: ('front_photo' | 'side_photo' | 'height' | 'weight')[];
  
  initializeScan(userId: string, inputs: Record<string, unknown>): Promise<string>; // returns scanId
  pollStatus(scanId: string): Promise<'processing' | 'complete' | 'failed'>;
  getResults(scanId: string): Promise<BiometricScanResult>;
}
```

### 7.2 Simulation Provider (P0 Default)

```typescript
// Generates realistic-looking mock measurements based on height/weight/sex
export class SimulationScanProvider implements BiometricScanProvider {
  readonly name = 'simulation';
  readonly requiredInputs = ['height', 'weight'] as const;
  
  async initializeScan(userId: string, inputs: Record<string, unknown>): Promise<string> {
    // Returns immediately — the 60s timer is purely UI animation
    return `sim_${userId}_${Date.now()}`;
  }
  
  async pollStatus(): Promise<'complete'> {
    return 'complete'; // Instant
  }
  
  async getResults(scanId: string): Promise<BiometricScanResult> {
    // Generate measurements from statistical models based on height/weight/sex
    return { measurements: generateSimulatedMeasurements(), confidence: 0.85, provider: 'simulation' };
  }
}
```

---

## 8. API Design — Edge Function Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Authenticate | Public |
| POST | `/onboarding/quiz` | Submit quiz responses | User |
| POST | `/onboarding/scan/init` | Initialize biometric scan | User |
| GET | `/onboarding/scan/:id/status` | Poll scan status | User |
| GET | `/onboarding/scan/:id/results` | Retrieve scan results | User |
| POST | `/form-check/session` | Start a new form check session | Premium |
| POST | `/form-check/session/:id/reps` | Submit batch of scored reps | Premium |
| POST | `/form-check/session/:id/complete` | Finalize session | Premium |
| GET | `/nutrition/today` | Get today's meal plan | Premium |
| POST | `/nutrition/regenerate` | Regenerate today's plan | Premium |
| POST | `/genie/message` | Send message to Genie (streaming) | User |
| GET | `/genie/history` | Retrieve conversation history | User |
| GET | `/mind-body/sessions` | List available sessions | User |
| POST | `/hrv/reading` | Log HRV reading | User |
| GET | `/hrv/trend` | Get 7-day HRV trend | User |
| GET | `/profile` | Get user profile | User |
| PATCH | `/profile` | Update user profile | User |

---

## 9. Client-Side Architecture

### 9.1 Mobile App Screen Map

```
AppRoot
├── (auth)
│   ├── login
│   ├── register
│   └── forgot-password
├── (onboarding)
│   ├── quiz
│   └── scan
├── (tabs)
│   ├── home                   # Dashboard with daily summary
│   ├── form-check
│   │   ├── index              # Exercise selector
│   │   └── [exercise]         # Split-screen form check
│   ├── mind-body
│   │   ├── index              # Yoga/Meditation toggle
│   │   ├── breathing          # Video player
│   │   └── hrv               # HRV module
│   ├── nutrition
│   │   └── index              # Today's meal plan
│   └── profile
│       ├── index              # Settings, scan, subscription
│       └── history            # Workout history
└── _layout                    # Global: Genie FAB overlay
```

### 9.2 Genie Overlay Architecture

The Genie FAB is rendered at the `_layout` level (above all tab content), ensuring it persists across navigation. It uses a shared Zustand store:

```typescript
// stores/genie-store.ts
interface GenieStore {
  isOpen: boolean;
  messages: GenieMessage[];
  isStreaming: boolean;
  open: () => void;
  close: () => void;
  sendMessage: (text: string) => Promise<void>;
}
```

---

## 10. Deployment Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRODUCTION                                     │
│                                                                         │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────────────┐ │
│  │   Vercel    │    │  Cloudflare  │    │       Supabase Cloud      │ │
│  │ ─────────── │    │ ──────────── │    │  ─────────────────────    │ │
│  │ Next.js Web │    │ CDN          │    │  PostgreSQL 16 (pgvector) │ │
│  │ Edge SSR    │    │ Workers      │    │  Auth + JWT               │ │
│  │             │    │ Stream       │    │  Realtime                 │ │
│  │             │    │ R2 Storage   │    │  Edge Functions (Deno)    │ │
│  │             │    │ WAF          │    │  Storage (avatars)        │ │
│  └─────────────┘    └──────────────┘    └───────────────────────────┘ │
│                                                                         │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────────────┐ │
│  │  Expo EAS   │    │   Doppler    │    │        PostHog            │ │
│  │ ─────────── │    │ ──────────── │    │  ─────────────────────    │ │
│  │ iOS builds  │    │ Secrets mgmt │    │  Analytics + Feature Flags│ │
│  │ Android     │    │ Env vars     │    │  A/B Testing              │ │
│  │ OTA Updates │    │              │    │  Session Recording        │ │
│  └─────────────┘    └──────────────┘    └───────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### 10.1 Environment Strategy

| Environment | Purpose | Database | AI | Deployment |
|-------------|---------|----------|------|-----------|
| **Local** | Development | Supabase Local (Docker) | GPT-4o-mini (lower cost) | `expo start`, `next dev` |
| **Preview** | PR review | Supabase branch DB | GPT-4o-mini | Vercel Preview + EAS Dev Build |
| **Staging** | QA & UAT | Supabase staging project | GPT-4o | Vercel Preview + EAS Internal Distribution |
| **Production** | Live users | Supabase production project | GPT-4o | Vercel Prod + App Store / Play Store |
