# Become — Technology Stack & Architecture Decisions
> Version 1.0 | Authored by Kiro (Principal Architect) | May 2026

---

## 1. Guiding Principles

| Principle | Rationale |
|-----------|-----------|
| **Minimal Ops Surface** | No self-managed servers, databases, or container orchestration. Every layer is a managed service. |
| **Edge-First Performance** | AI coaching, pose scoring, and media delivery run at the network edge — not in a central region. |
| **Modular Adapters** | Every third-party integration (biometrics, payments, LLM providers) is behind an interface so providers can be swapped without app rewrites. |
| **Privacy by Architecture** | Biometric and health data never leaves the user's device unless explicitly required. Pose detection runs 100% on-device. |
| **Revenue-Ready on Day 1** | Subscription infrastructure, analytics, and A/B testing are baked into the foundation — not bolted on later. |

---

## 2. Full Stack Decision Matrix

### 2.1 Client Layer

| Role | Technology | Version | Decision Rationale |
|------|-----------|---------|-------------------|
| **Mobile App** | React Native + Expo | SDK 52 | Single TypeScript codebase ships to iOS and Android. Expo EAS handles builds, OTA updates, and push notifications without a CI/CD team. New Architecture (JSI/Fabric) unlocks 60fps UI needed for live pose overlay. |
| **Web App / Admin Portal** | Next.js (App Router) | 15.x | Shares component library and TypeScript types with mobile. Server Components reduce bundle size. Edge Runtime support for sub-50ms SSR globally. |
| **Component Library** | NativeWind + Tamagui | Latest | NativeWind brings Tailwind CSS utility classes to React Native. Tamagui compiles styles at build time — zero runtime overhead on the UI thread. |
| **State Management** | Zustand + TanStack Query | 5.x | Zustand for global client state (session, Genie overlay, navigation). TanStack Query for all server state, caching, and background sync. No Redux boilerplate. |
| **Navigation** | Expo Router | 4.x | File-based routing identical to Next.js — one mental model for the entire team. Deep-link and universal link support is built-in. |

### 2.2 3D, Pose & Vision Layer

| Role | Technology | Decision Rationale |
|------|-----------|-------------------|
| **3D Character Rendering** | Three.js + React Three Fiber (R3F) | Declarative React API over WebGL. Supports GLTF/GLB character assets, skeletal animation rigs, and custom shaders. Runs in both React Native (via expo-gl) and browser. |
| **3D Asset Pipeline** | GLTF 2.0 + Draco compression | Industry standard. Draco reduces mesh file sizes by ~80%. Assets hosted on Cloudflare CDN with aggressive cache headers. |
| **Real-Time Pose Detection** | MediaPipe Pose Landmarker | On-device WASM (web) and native TFLite (mobile). Outputs 33 3D skeletal landmarks at 30fps. Zero latency because no network round-trip. Zero data egress cost. HIPAA-compatible by design. |
| **Form Scoring Engine** | Custom TypeScript / Cloudflare Worker | Joint angle geometry (cosine rule on landmark vectors) computed on-device. Score normalization and historical comparison handled at the edge. See `design.md` §4. |
| **Biometric Scan (Digital Twin)** | Bodygram API Adapter | Modular `BiometricScanProvider` interface. Bodygram is the default implementation. Any future provider (e.g., Fit3D, Scanbot) drops in by implementing the same interface without touching UI code. |

### 2.3 Backend & Data Layer

| Role | Technology | Version | Decision Rationale |
|------|-----------|---------|-------------------|
| **Core BaaS** | Supabase | Cloud | Managed Postgres with Row-Level Security eliminates an entire auth/permission service. Built-in Auth (social, magic link, phone OTP), Realtime (websockets), Storage (S3-compatible), and Edge Functions in one platform. Predictable pricing, no egress fees on the free/pro tier. |
| **Primary Database** | PostgreSQL (via Supabase) | 16 | Relational model perfectly fits user profiles, workout history, nutrition plans, and HRV time-series. pgvector extension enables semantic search for Genie coach context retrieval (RAG). |
| **Realtime / Subscriptions** | Supabase Realtime | — | Postgres logical replication exposed as websocket channels. Used for live session state, Genie chat feed, and HRV metric push updates. |
| **File & Media Storage** | Supabase Storage + Cloudflare R2 | — | Supabase Storage for user-generated content (avatar, scan photos). Cloudflare R2 for large static assets (3D models, AI-generated video). R2 has zero egress fees. |
| **Edge Functions** | Supabase Edge Functions (Deno) | — | Nutrition pipeline, Genie routing logic, and Bodygram webhook processing. Deno runtime has native TypeScript support and built-in security sandboxing. |
| **Ultra-Low Latency Compute** | Cloudflare Workers | — | Form scoring result aggregation and live coaching cue evaluation run within 5ms globally. Deployed to 300+ PoPs. |

### 2.4 AI & LLM Layer

| Role | Technology | Decision Rationale |
|------|-----------|-------------------|
| **Genie Coach LLM** | OpenAI GPT-4o | Best-in-class reasoning + tool calling. Structured Outputs (JSON mode) guarantees Genie returns parseable Action Button payloads. Streaming responses for conversational feel. |
| **Nutrition Plan Generation** | OpenAI GPT-4o + system prompt guardrails | Prompt engineering pipeline with strict system-level constraints prohibiting processed/packaged food recommendations. Output schema enforced via JSON Schema validation before delivery to client. |
| **Semantic Memory (RAG)** | pgvector (Supabase) + OpenAI Embeddings | User wellness history, HRV trends, and past Genie conversations are embedded and stored in Postgres. Genie retrieves relevant context chunks on each message — making it genuinely personalized over time. |
| **HRV Recommendation Engine** | Rule-based + LLM hybrid | HRV data is scored against threshold rules first (fast, free). Only ambiguous cases are escalated to LLM for nuanced recommendation — minimizes token cost. |

### 2.5 Video & Media Layer

| Role | Technology | Decision Rationale |
|------|-----------|-------------------|
| **Video Hosting & Delivery** | Cloudflare Stream | Adaptive bitrate HLS streaming. Handles AI-generated video files natively. Per-minute pricing — no egress fees. Global CDN with sub-2s start time. |
| **Video Caching (client)** | Expo AV + custom prefetch manager | Breathing module videos are prefetched and cached locally on first app load. Subsequent plays are instant and offline-capable. |
| **Generative Video Pipeline** | Sora API / Runway Gen-3 (adapter) | AI video generation is behind a `GenerativeVideoProvider` adapter. Sora is first implementation. Provider can change without touching the player UI. |

### 2.6 Infrastructure & DevOps

| Role | Technology | Decision Rationale |
|------|-----------|-------------------|
| **Mobile CI/CD & OTA** | Expo EAS Build + EAS Update | Submits to App Store and Google Play from CI. OTA updates push JS bundle changes to users without store review delays. |
| **Web Hosting** | Vercel | Zero-config Next.js deployment. Edge Network for SSR. Preview deployments on every PR. |
| **CDN & DDoS Protection** | Cloudflare | Sits in front of all origins. WAF, rate limiting, and bot management included. |
| **Secrets Management** | Doppler | Single source of truth for env vars across local, staging, and production. Eliminates `.env` file proliferation. |
| **Error Monitoring** | Sentry | Native SDK for React Native + Next.js. Session replay and performance tracing. |
| **Product Analytics** | PostHog (Cloud) | Open-source core. Feature flags, A/B testing, funnel analytics, and session recording in one tool. Self-hostable if needed. |
| **Payments & Subscriptions** | RevenueCat | Cross-platform subscription management. Single API abstracts App Store, Google Play, and Stripe web payments. Webhook-driven entitlement sync to Supabase. |

### 2.7 Communication

| Role | Technology | Decision Rationale |
|------|-----------|-------------------|
| **Transactional Email** | Resend | Modern developer-first email API. React Email templates render consistent HTML emails. |
| **Push Notifications** | Expo Push Notification Service | Wraps APNs and FCM. One API for both platforms. |
| **In-App Messaging** | Supabase Realtime | Genie chat feed is a Realtime subscription — no separate WebSocket server needed. |

---

## 3. Key Architecture Patterns

### 3.1 Provider Adapter Pattern
All third-party integrations implement a TypeScript interface:
```
BiometricScanProvider | GenerativeVideoProvider | LLMProvider | PaymentProvider
```
Business logic depends only on the interface, never the concrete SDK.

### 3.2 Edge-First Scoring
Pose scoring never touches the Supabase region. The flow is:
```
Device Camera → MediaPipe (on-device) → Joint Angles → Cloudflare Worker → Score + Cues → UI overlay
```
Round-trip: <10ms globally.

### 3.3 RAG-Powered Genie
```
User Message → Embedding → pgvector similarity search → Top-K context chunks
→ GPT-4o (system prompt + context + history) → Structured JSON (text + action_buttons[]) → UI
```

### 3.4 Row-Level Security (RLS)
Every Supabase table has RLS policies. Users can only read/write their own rows. No application-layer auth middleware required for data isolation.

---

## 4. Language Decision

**TypeScript everywhere.** One language across:
- React Native mobile app
- Next.js web app
- Supabase Edge Functions (Deno)
- Cloudflare Workers
- Shared type library (`@become/types`)

Benefits: shared types eliminate API contract drift, one hiring profile, one linting config, full-stack type safety end-to-end.

---

## 5. Rejected Alternatives & Rationale

| Rejected | Reason |
|----------|--------|
| Flutter | Dart ecosystem; cannot share types/logic with JS backend. Smaller talent pool. |
| AWS / GCP direct | Requires DevOps headcount to manage. Not appropriate for a lean founding team. |
| Firebase | Firestore's document model is poorly suited for relational wellness data (HRV time-series, nutrition plans). Vendor lock-in risk. |
| Custom WebSocket server | Supabase Realtime covers all use cases without a stateful server to manage. |
| TensorFlow.js (pose) | MediaPipe is 3x faster on mobile, has better landmark accuracy, and is actively maintained by Google. |
| Separate CMS (Contentful, Sanity) | Overkill for V1. Content managed via Supabase tables + admin Next.js dashboard. Revisit at scale. |
| Redux Toolkit | Zustand + TanStack Query covers all state patterns with 1/10th the boilerplate. |
