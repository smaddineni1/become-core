# Become — Prioritized Implementation Checklist
> Version 1.0 | May 2026

---

## Execution Philosophy

Tasks are organized in **sequential phases**. Each phase must be substantially complete before moving to the next. Within a phase, tasks can be parallelized where no dependency exists.

**Estimated Total Duration:** 10–12 weeks for MVP launch (1 senior full-stack engineer + AI assist)

---

## Phase 0 — Foundation & Infrastructure (Week 1)

| # | Task | Depends On | Deliverable |
|---|------|-----------|-------------|
| 0.1 | Initialize pnpm monorepo with Turborepo | — | `turbo.json`, root `package.json`, workspace config |
| 0.2 | Create `apps/mobile` with Expo SDK 52 (blank template) | 0.1 | Booting Expo app with Expo Router |
| 0.3 | Create `apps/web` with Next.js 15 (App Router) | 0.1 | Running Next.js app |
| 0.4 | Create `packages/shared` — shared TypeScript types | 0.1 | Importable `@become/shared` package |
| 0.5 | Create `packages/ui` — component library (NativeWind + Tamagui) | 0.2 | Button, Input, Card, Modal base components |
| 0.6 | Set up Supabase project (dev + staging + prod) | — | Running Supabase instance with local Docker |
| 0.7 | Configure Doppler — create projects for all environments | — | Env vars accessible from all services |
| 0.8 | Set up Sentry — connect React Native + Next.js SDKs | 0.2, 0.3 | Error reporting active in dev |
| 0.9 | Set up PostHog — install SDKs, create feature flags | 0.2, 0.3 | Analytics events flowing in dev |
| 0.10 | Set up Cloudflare — account, Workers project, R2 bucket, Stream | — | Workers deployable, R2 accessible |
| 0.11 | Configure EAS Build + EAS Update profiles | 0.2 | Dev builds installable on physical devices |
| 0.12 | Set up CI pipeline (GitHub Actions) — lint, type-check, build | 0.1–0.3 | PR checks running on every commit |

---

## Phase 1 — Authentication & User Profile (Week 2)

| # | Task | Depends On | Deliverable |
|---|------|-----------|-------------|
| 1.1 | Write Supabase migration: `user_profiles` table + RLS | 0.6 | Migration file, schema live |
| 1.2 | Configure Supabase Auth providers: Email, Apple, Google | 0.6 | Auth flows working in Supabase dashboard |
| 1.3 | Build auth screens: Login, Register, Forgot Password | 0.5, 1.2 | Functional auth flow in mobile app |
| 1.4 | Implement auth context & session management (Zustand + Supabase SDK) | 1.3 | Persistent login, auto-refresh tokens |
| 1.5 | Build profile screen: view/edit profile, avatar upload | 1.1, 1.4 | Profile editable, avatar stored in Supabase Storage |
| 1.6 | Implement subscription check middleware (RevenueCat SDK) | 1.4 | `useSubscription()` hook, entitlement gates |

---

## Phase 2 — Onboarding & Digital Twin (Week 3)

| # | Task | Depends On | Deliverable |
|---|------|-----------|-------------|
| 2.1 | Write Supabase migration: `user_biometric_profiles` table + RLS | 0.6 | Migration applied |
| 2.2 | Define `BiometricScanProvider` interface in `@become/shared` | 0.4 | TypeScript interface exported |
| 2.3 | Implement `SimulationScanProvider` (mock measurements from height/weight) | 2.2 | Provider class passes unit tests |
| 2.4 | Build multi-step quiz screen (animated, 6-8 steps) | 0.5, 1.4 | Functional quiz persisting to `user_profiles` |
| 2.5 | Build Digital Twin scan screen — 60s animated UI with progress | 0.5, 2.3 | Immersive scan animation |
| 2.6 | Wire scan screen to `SimulationScanProvider`, store results | 2.1, 2.5 | Measurements stored in `user_biometric_profiles` |
| 2.7 | Build onboarding completion celebration screen | 2.6 | Confetti animation, CTA to dashboard |
| 2.8 | Implement re-onboarding flow from Profile settings | 2.4, 2.6 | Users can re-take quiz + scan |

---

## Phase 3 — Form Check Engine (Weeks 4–5)

| # | Task | Depends On | Deliverable |
|---|------|-----------|-------------|
| 3.1 | Create `packages/scoring` — geometry engine with `calculateJointAngle` | 0.4 | Exported scoring package, unit tests green |
| 3.2 | Define exercise profiles: Air Squat, Push-up, Sit-up, Kettlebell Swing | 3.1 | Profile configs with angle ranges + cues |
| 3.3 | Implement rep state machine (Standing → Descent → Bottom → Ascent) | 3.1, 3.2 | State machine passes test cases |
| 3.4 | Implement cue detection logic (knee cave, depth, forward lean) | 3.2 | Cue triggers at correct thresholds |
| 3.5 | Integrate MediaPipe Pose Landmarker (expo-camera + WASM bridge) | 0.2 | 33 landmarks streaming from camera |
| 3.6 | Build split-screen layout: left = 3D model, right = camera feed | 0.5, 3.5 | Responsive split-screen rendering |
| 3.7 | Integrate React Three Fiber — load GLTF character model with animation | 3.6 | Animated 3D character playing exercise loop |
| 3.8 | Wire scoring engine to MediaPipe output — live score overlay | 3.1–3.5 | Score updating in real time on camera feed |
| 3.9 | Implement corrective cue overlays (animated text + haptic) | 3.4, 3.8 | Visual cues appear correctly on detection |
| 3.10 | Build rep counter UI + score gauge (animated arc, color-coded) | 3.3, 3.8 | Rep increments on valid completion, gauge reflects score |
| 3.11 | Write Supabase migration: `workout_sessions` + `rep_scores` | 0.6 | Tables live |
| 3.12 | Build Cloudflare Worker: session aggregation + Supabase write | 0.10, 3.11 | Worker deployed, sessions persisted |
| 3.13 | Build exercise selector screen (grid of available exercises) | 0.5, 3.6 | Navigation to form-check for each exercise |
| 3.14 | Build post-session summary screen (rep breakdown, cues histogram) | 3.11, 3.12 | Summary displays after session end |
| 3.15 | Procure/create GLTF character assets for 4 launch exercises | — | 4 optimized GLTF files (Draco compressed) |

---

## Phase 4 — Mind & Body Dashboard (Week 6)

| # | Task | Depends On | Deliverable |
|---|------|-----------|-------------|
| 4.1 | Build Yoga/Meditation toggle dashboard layout | 0.5 | Fluid animated tab switching |
| 4.2 | Design session card component (thumbnail, duration, type) | 0.5 | Reusable card in `@become/ui` |
| 4.3 | Seed session content data in Supabase (10 yoga + 10 meditation sessions) | 0.6 | Content available via API |
| 4.4 | Build session grid with category filters (duration, type) | 4.1, 4.2, 4.3 | Browsable session catalog |
| 4.5 | Build Guided Breathing video player (Expo AV + custom controls) | 0.5 | Play, Pause, Replay, auto-hide controls |
| 4.6 | Implement video prefetch & cache manager | 4.5, 0.10 | Videos cached on first load, offline playback |
| 4.7 | Upload AI-generated breathing videos to Cloudflare Stream | 0.10 | 3-5 HD breathing videos available |
| 4.8 | Write Supabase migration: `hrv_readings` table | 0.6 | Table live |
| 4.9 | Build HRV manual entry form + classification logic | 4.8 | User can log HRV, classification displays |
| 4.10 | Build "Recommended For You" strip based on HRV classification | 4.4, 4.9 | Context-aware session recommendations |
| 4.11 | Build 7-day HRV trend chart (using react-native-chart-kit or Victory) | 4.8 | Visual trend line with data points |

---

## Phase 5 — Nutrition Pipeline (Week 7)

| # | Task | Depends On | Deliverable |
|---|------|-----------|-------------|
| 5.1 | Write Supabase migration: `nutrition_plans` table | 0.6 | Table live |
| 5.2 | Create `packages/ai` — prompt templates + guardrail system prompt | 0.4 | Exportable prompt module |
| 5.3 | Build Edge Function: `generate-meal-plan` (GPT-4o + JSON mode) | 0.6, 5.2 | Function deployed, callable |
| 5.4 | Implement JSON Schema validation on LLM output + retry logic | 5.3 | Invalid outputs caught, retried, or fallback served |
| 5.5 | Implement daily cron trigger (Supabase pg_cron) for premium users | 5.3, 1.6 | Plans auto-generated daily |
| 5.6 | Build nutrition screen: today's meal plan display | 0.5, 5.1 | Meals displayed with macros |
| 5.7 | Build meal card component (ingredients, macros, prep time, method) | 0.5 | Expandable meal cards |
| 5.8 | Implement "Regenerate Plan" button with tier gating | 5.3, 1.6 | Button works, rate-limited for free tier |
| 5.9 | Build push notification: "Your meal plan is ready" | 5.5 | Notification arrives after generation |

---

## Phase 6 — Genie AI Coach (Week 8–9)

| # | Task | Depends On | Deliverable |
|---|------|-----------|-------------|
| 6.1 | Write Supabase migration: `genie_conversations` + `genie_messages` + pgvector | 0.6 | Tables + vector extension live |
| 6.2 | Build Edge Function: `genie/message` (streaming, structured output) | 0.6, 5.2, 6.1 | Streaming Genie responses with action buttons |
| 6.3 | Implement RAG pipeline: embed user message → pgvector search → top-5 chunks | 6.1, 6.2 | Contextual retrieval working |
| 6.4 | Build Genie system prompt with user context injection (HRV, goals, history) | 6.2, 4.9 | Personalized prompts per user |
| 6.5 | Build Genie FAB component (persistent floating button + animated expand) | 0.5 | FAB visible on all tab screens |
| 6.6 | Build Genie chat feed UI (messages, streaming indicators, scroll) | 6.5 | Elegant conversational UI |
| 6.7 | Build Action Button chips rendering + navigation dispatch | 6.6, 6.2 | Tapping chip routes to correct screen |
| 6.8 | Implement Genie Zustand store (open/close, messages, streaming state) | 6.5, 6.6 | Global state management working |
| 6.9 | Wire conversation persistence (save to Supabase, load on app open) | 6.1, 6.8 | Chat history restored across sessions |
| 6.10 | Test all intent categories with end-to-end flows | 6.2–6.9 | Rest, Form Check, Meditation, Nutrition, HRV intents all route correctly |

---

## Phase 7 — Payments & Entitlements (Week 9)

| # | Task | Depends On | Deliverable |
|---|------|-----------|-------------|
| 7.1 | Configure RevenueCat: products, entitlements, offerings | — | Products defined in RC dashboard |
| 7.2 | Integrate RevenueCat SDK in mobile app | 7.1, 0.2 | Purchase flow callable |
| 7.3 | Build paywall/upgrade screen | 7.2, 0.5 | Premium features surfaced with purchase CTA |
| 7.4 | Configure RevenueCat webhook → Supabase (sync subscription_tier) | 7.1, 0.6 | `user_profiles.subscription_tier` updates on purchase/cancel |
| 7.5 | Implement premium gates on all P0 premium features | 7.4, 1.6 | Non-subscribers see upgrade prompts |
| 7.6 | Test full purchase → entitlement → feature unlock cycle | 7.5 | End-to-end subscription flow verified |

---

## Phase 8 — Polish, Performance & Launch Prep (Week 10–11)

| # | Task | Depends On | Deliverable |
|---|------|-----------|-------------|
| 8.1 | Performance audit: form check 15fps on target devices | Phase 3 | Profiling report, optimizations applied |
| 8.2 | Performance audit: app TTI < 3s on 4G | All phases | Bundle analysis, code splitting applied |
| 8.3 | Implement offline support: cached meals, workout history, breathing videos | Phases 3–5 | Core features usable without network |
| 8.4 | Implement error boundaries + graceful degradation (unsupported cameras, etc.) | All | No unhandled crashes |
| 8.5 | UI polish pass: animations, transitions, loading states, empty states | All | Consistent, premium feel throughout |
| 8.6 | Accessibility audit: labels, font scaling, color contrast | 8.5 | WCAG 2.1 AA on key flows |
| 8.7 | Security review: RLS policies, API auth, no exposed secrets | All | Audit checklist green |
| 8.8 | Privacy policy + terms of service (legal copy) | — | Legal pages in app + web |
| 8.9 | App Store metadata: screenshots, description, keywords | 8.5 | Store listings prepared |
| 8.10 | Configure production environment in Doppler, Supabase, Cloudflare, Vercel | All | Production infra live |

---

## Phase 9 — Testing & Launch (Week 11–12)

| # | Task | Depends On | Deliverable |
|---|------|-----------|-------------|
| 9.1 | End-to-end testing: full user journey (register → quiz → scan → form check → nutrition → genie) | All | All critical paths passing |
| 9.2 | Load testing: nutrition pipeline + Genie under 1000 concurrent users | 5.3, 6.2 | Performance meets SLA |
| 9.3 | Beta distribution via EAS Internal Distribution | 8.11 | TestFlight / Internal Track builds live |
| 9.4 | Beta tester feedback collection (2-week window) | 9.3 | Bug list + UX feedback documented |
| 9.5 | Bug fixes from beta feedback | 9.4 | Critical bugs resolved |
| 9.6 | Submit to App Store + Google Play | 9.5 | Under review |
| 9.7 | Deploy web app to Vercel production | 9.5 | Web live |
| 9.8 | Launch day monitoring: Sentry, PostHog, Supabase dashboards | 9.6, 9.7 | Real-time observability active |

---

## Post-Launch Roadmap (P1/P2)

| Priority | Feature | Target |
|----------|---------|--------|
| P1 | Bodygram API integration (real biometric scan) | Launch + 2 weeks |
| P1 | HealthKit / Health Connect HRV integration | Launch + 2 weeks |
| P1 | Post-session summary screen | Launch + 2 weeks |
| P1 | Weekly macro tracking in nutrition | Launch + 3 weeks |
| P1 | Genie RAG + conversation persistence | Launch + 3 weeks |
| P1 | 7-day HRV trend chart | Launch + 3 weeks |
| P2 | Expanded exercise library (Deadlift, Lunge, Plank, OHP) | Launch + 6 weeks |
| P2 | Grocery list generator | Launch + 8 weeks |
| P2 | Social features (share sessions, leaderboards) | Launch + 10 weeks |
| P2 | Apple Watch / Wear OS companion | Launch + 12 weeks |
