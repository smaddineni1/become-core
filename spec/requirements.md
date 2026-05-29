# Become — Product Requirements Document
> Version 1.0 | May 2026 | Status: Awaiting Executive Authorization

---

## 1. Document Purpose

This document defines the complete functional and non-functional requirements for the Become platform rebuild. Each requirement is tagged with a priority tier:

- **P0** — Must ship at launch. Blocking.
- **P1** — Ships in first update cycle (within 30 days of launch).
- **P2** — Roadmap item (60–90 days post-launch).

---

## 2. Actors & User Roles

| Actor | Description |
|-------|-------------|
| **Guest** | Unauthenticated visitor who has downloaded the app |
| **Free User** | Registered user on the free tier |
| **Premium User** | Subscriber with active paid entitlement |
| **Admin** | Internal Become team member with access to the web admin portal |
| **Genie (AI)** | The autonomous AI coaching agent acting on behalf of the platform |

---

## 3. Functional Requirements

### 3.1 Authentication & User Identity

| ID | Priority | Requirement |
|----|----------|-------------|
| AUTH-01 | P0 | The system shall allow users to register via email/password, Apple Sign-In, and Google Sign-In. |
| AUTH-02 | P0 | The system shall issue a JWT session token upon successful authentication, refreshed automatically before expiry. |
| AUTH-03 | P0 | The system shall enforce email verification before granting access to personalized features. |
| AUTH-04 | P0 | The system shall allow password reset via a time-limited, single-use email link. |
| AUTH-05 | P1 | The system shall support biometric authentication (Face ID / Fingerprint) as a session unlock mechanism on supported devices. |
| AUTH-06 | P0 | All user data rows in the database shall be protected by Row-Level Security policies ensuring users can only access their own records. |

---

### 3.2 Onboarding & Digital Twin Biometric Scan

| ID | Priority | Requirement |
|----|----------|-------------|
| ONB-01 | P0 | Upon first registration, the system shall present a multi-step personalized wellness quiz collecting: age, sex, height, weight, primary fitness goal (lose fat / build muscle / improve mobility / reduce stress), activity level, and dietary preferences. |
| ONB-02 | P0 | Quiz responses shall be persisted to the user profile and used to seed initial AI recommendations. |
| ONB-03 | P0 | After quiz completion, the system shall present an animated, immersive "Digital Twin" biometric scan screen running for a minimum of 60 seconds with animated scanning UI. |
| ONB-04 | P0 | The Digital Twin scan screen shall be implemented as a `BiometricScanProvider` modular adapter. The default implementation shall display the animated simulation. |
| ONB-05 | P1 | The Bodygram API shall be integrated as the first concrete `BiometricScanProvider` implementation, capable of extracting and mapping a minimum of 240 distinct physical measurements into the user profile schema. |
| ONB-06 | P0 | The system shall map all received biometric measurements to a standardized internal schema (`UserBiometricProfile`) regardless of which scan provider is active. |
| ONB-07 | P0 | Onboarding shall be re-enterable — users can update their quiz responses and retrigger a scan from their profile settings at any time. |
| ONB-08 | P0 | The system shall display a clear privacy disclosure before initiating any biometric scan, requiring explicit user consent. |

---

### 3.3 AI Form Check Engine

| ID | Priority | Requirement |
|----|----------|-------------|
| FORM-01 | P0 | The system shall render a split-screen interface: left panel showing an animated 3D character model performing a selected exercise; right panel showing a live camera feed with skeletal overlay. |
| FORM-02 | P0 | The 3D character model shall be rendered using a GLTF 2.0 asset with a skeletal animation rig supporting loop playback at a minimum of 30fps on mid-range devices. |
| FORM-03 | P0 | The system shall activate MediaPipe Pose Landmarker on the user's device camera, running entirely on-device with no video data transmitted to any server. |
| FORM-04 | P0 | The system shall detect and display a 33-point skeletal overlay on the user's camera feed in real time. |
| FORM-05 | P0 | The scoring engine shall calculate geometric joint angles from landmark coordinates using the cosine rule for all relevant joints per exercise. |
| FORM-06 | P0 | The engine shall produce a live 0–100 performance score, updated on each processed frame (minimum 15fps scoring rate). |
| FORM-07 | P0 | The score shall be displayed as a prominent animated numerical readout and a color-coded arc gauge (green ≥80, amber 50–79, red <50). |
| FORM-08 | P0 | The system shall detect and display the following corrective cues in real time: **Knee Cave** (knee valgus angle exceeds threshold), **Deficient Depth** (hip crease does not pass knee level during squat), **Excess Forward Lean** (torso angle exceeds threshold during squat). |
| FORM-09 | P0 | Corrective cues shall be displayed as animated text overlays on the camera feed and accompanied by a distinct haptic pulse pattern on supported devices. |
| FORM-10 | P0 | The system shall support the following launch exercises: Air Squat, Push-up, Sit-up, Kettlebell Swing. |
| FORM-11 | P0 | The system shall count valid repetitions automatically, incrementing the counter only when a rep meets a minimum quality threshold (score ≥ 60 on the scoring engine). |
| FORM-12 | P0 | Each completed form-check session shall be persisted to the user's workout history with timestamp, exercise, rep count, average score, and detected cues log. |
| FORM-13 | P1 | The system shall provide a post-session summary screen with rep-by-rep score breakdown and most frequent corrective cues. |
| FORM-14 | P2 | The exercise library shall be expanded to include: Deadlift, Lunge, Plank, Overhead Press. |

---

### 3.4 Mind & Body Dashboard

| ID | Priority | Requirement |
|----|----------|-------------|
| MIND-01 | P0 | The dashboard shall provide a fluid animated toggle switching the primary view between "Yoga" and "Meditation" ecosystems. |
| MIND-02 | P0 | Each ecosystem shall display a curated grid of sessions categorized by duration (5 min, 10 min, 20 min) and intensity/type. |
| MIND-03 | P0 | The Guided Breathing module shall implement a custom media player capable of loading, playing, pausing, replaying, and looping AI-generated HD video files. |
| MIND-04 | P0 | Breathing module videos shall be prefetched and cached on the client on first app launch to enable instant playback and offline viewing. |
| MIND-05 | P0 | The media player shall display accessible playback controls: Play, Pause, and Replay. Controls shall auto-hide after 3 seconds of inactivity and reappear on tap. |
| MIND-06 | P0 | The system shall accept Heart Rate Variability (HRV) data input via manual entry (numeric field) as the P0 implementation. |
| MIND-07 | P1 | The system shall integrate with Apple HealthKit (iOS) and Google Health Connect (Android) to automatically read HRV data with user permission. |
| MIND-08 | P0 | The HRV engine shall classify the user's current state as one of: **Recovery** (HRV above personal baseline), **Balanced**, or **Stressed** (HRV below baseline). |
| MIND-09 | P0 | Based on HRV classification, the system shall surface a "Recommended For You" session strip at the top of the dashboard with contextually appropriate sessions. |
| MIND-10 | P1 | HRV readings shall be stored as a time-series and visualized as a 7-day trend chart on the dashboard. |

---

### 3.5 Nutrition Pipeline

| ID | Priority | Requirement |
|----|----------|-------------|
| NUT-01 | P0 | The system shall generate a daily meal plan for each premium user, personalized to their biometric goals and dietary preferences from the onboarding quiz. |
| NUT-02 | P0 | Meal plan generation shall be executed via a prompt-engineering pipeline calling GPT-4o with a strict system prompt that explicitly prohibits: commercial packaged protein snacks, commercial protein bars, protein drinks (liquid/powder form), and heavily processed branded food products. |
| NUT-03 | P0 | The system prompt shall enforce that all meal recommendations consist exclusively of whole, minimally processed food ingredients. |
| NUT-04 | P0 | Generated meal plans shall be validated against a JSON Schema before being stored or presented to the user. Invalid outputs shall be retried (max 3 attempts) before surfacing a fallback plan. |
| NUT-05 | P0 | Each meal plan shall include: meal name, ingredients list (with quantities), estimated macros (protein/carb/fat in grams), preparation time, and a brief preparation method. |
| NUT-06 | P0 | The daily plan shall include a minimum of 3 meals and 1 optional snack per day. |
| NUT-07 | P0 | Users shall be able to regenerate their daily plan (once per day on free tier, unlimited on premium). |
| NUT-08 | P1 | Users shall be able to mark individual meals as "completed" and log alternatives. |
| NUT-09 | P1 | The system shall track and display weekly macro averages against user targets. |
| NUT-10 | P2 | The system shall integrate a grocery list generator that aggregates ingredients across the weekly meal plan. |

---

### 3.6 Genie AI Coach

| ID | Priority | Requirement |
|----|----------|-------------|
| GENIE-01 | P0 | A persistent floating action button (FAB) shall be visible on all primary application screens. |
| GENIE-02 | P0 | Tapping the FAB shall expand an elegant bottom-sheet conversational chat feed with an animated entry transition. |
| GENIE-03 | P0 | The chat feed shall maintain a scrollable history of the current session's conversation. |
| GENIE-04 | P0 | User messages shall be sent to the GPT-4o Genie pipeline via a Supabase Edge Function. |
| GENIE-05 | P0 | The Genie pipeline shall respond with streaming tokens displayed in real time in the chat bubble. |
| GENIE-06 | P0 | Every Genie response payload shall include a structured `action_buttons` array. Each button object shall contain: `label` (string), `route` (app deep-link path), and `icon` (optional). |
| GENIE-07 | P0 | Action buttons shall be rendered as tappable chips below the Genie response text. Tapping a chip shall navigate the user to the corresponding app route and dismiss the Genie overlay. |
| GENIE-08 | P0 | The Genie pipeline shall handle at minimum the following intent categories: **Rest/Recovery** ("I'm tired/exhausted/sore"), **Form Check** ("show me how to do [exercise]"), **Meditation/Yoga** ("I want to meditate / do yoga"), **Nutrition** ("what should I eat"), **HRV/Stress** ("check my stress levels"). |
| GENIE-09 | P0 | The Genie system prompt shall include the user's current HRV classification, biometric goal, and last 3 app sessions as context. |
| GENIE-10 | P1 | Genie shall retrieve top-5 semantically relevant chunks from the user's wellness history via pgvector RAG before constructing each response. |
| GENIE-11 | P1 | Conversation history for the current session shall be persisted to Supabase and accessible on subsequent app opens. |
| GENIE-12 | P0 | Genie shall never recommend any food product that violates the nutrition brand guardrails (same constraints as NUT-02). |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Priority | Requirement |
|----|----------|-------------|
| PERF-01 | P0 | The form scoring engine shall maintain a minimum of 15 scored frames per second on an iPhone 12 / mid-range Android device from 2022 or newer. |
| PERF-02 | P0 | 3D character model animation shall run at a minimum of 30fps on the same device class. |
| PERF-03 | P0 | The app initial load to interactive (TTI) shall not exceed 3 seconds on a 4G network. |
| PERF-04 | P0 | Genie first token shall appear within 1.5 seconds of message submission on a standard connection. |
| PERF-05 | P0 | Breathing module video playback shall begin within 2 seconds of user tap (from cache). |
| PERF-06 | P0 | The Cloudflare Worker scoring endpoint shall respond within 10ms at p99. |

### 4.2 Scalability

| ID | Priority | Requirement |
|----|----------|-------------|
| SCALE-01 | P0 | The backend shall support a minimum of 50,000 concurrent active users without configuration changes. |
| SCALE-02 | P0 | The nutrition pipeline shall process plan generation requests within 10 seconds under normal load conditions. |
| SCALE-03 | P1 | All database queries on user-facing endpoints shall be covered by appropriate indexes with query times under 100ms at p95. |

### 4.3 Security & Privacy

| ID | Priority | Requirement |
|----|----------|-------------|
| SEC-01 | P0 | All data in transit shall be encrypted via TLS 1.3 minimum. |
| SEC-02 | P0 | All data at rest shall be encrypted using AES-256. |
| SEC-03 | P0 | Camera feed data during form check sessions shall never be transmitted, recorded, or stored. Processing is entirely on-device. |
| SEC-04 | P0 | Biometric scan data shall be stored encrypted and accessible only by the data subject (enforced via RLS). |
| SEC-05 | P0 | All API endpoints shall require a valid authenticated JWT. No unauthenticated access to personalized data. |
| SEC-06 | P0 | LLM prompts and system instructions shall never be exposed to the client. All AI calls are server-side only. |
| SEC-07 | P1 | The platform shall be architectured to support HIPAA compliance for biometric and health data. |
| SEC-08 | P0 | API keys for all third-party services shall be stored exclusively in Doppler and injected at runtime. No secrets in source code or environment files committed to version control. |

### 4.4 Reliability & Availability

| ID | Priority | Requirement |
|----|----------|-------------|
| REL-01 | P0 | The platform shall target 99.9% uptime SLA (≤8.7 hours downtime/year). |
| REL-02 | P0 | The nutrition plan pipeline shall implement retry logic (max 3 attempts) with exponential backoff on LLM API failures. |
| REL-03 | P0 | Core features (form check, breathing player, saved meal plans) shall be accessible in offline mode using cached data. |
| REL-04 | P0 | All Supabase Edge Functions shall implement structured error handling and return standardized error payloads. |

### 4.5 Accessibility

| ID | Priority | Requirement |
|----|----------|-------------|
| ACC-01 | P1 | All interactive UI elements shall have accessible labels compliant with WCAG 2.1 AA. |
| ACC-02 | P1 | The app shall support Dynamic Type (iOS) and font scaling (Android) without layout breakage. |
| ACC-03 | P1 | All video content shall include closed captions. |

### 4.6 Platform Compatibility

| ID | Priority | Requirement |
|----|----------|-------------|
| COMPAT-01 | P0 | The mobile application shall support iOS 16+ and Android 12 (API 31)+. |
| COMPAT-02 | P0 | The web application shall support the latest 2 versions of Chrome, Safari, Firefox, and Edge. |
| COMPAT-03 | P0 | MediaPipe pose detection shall degrade gracefully on unsupported devices, displaying a "device not supported" message instead of crashing. |

---

## 5. Data Retention & Compliance

| Requirement | Detail |
|-------------|--------|
| User data deletion | Complete account and data deletion shall be fulfilled within 30 days of user request (GDPR / CCPA compliant). |
| Workout history retention | Retained for the lifetime of the account by default; user-configurable. |
| HRV time-series retention | Rolling 12-month window; older data archived to cold storage. |
| Nutrition plan history | Last 90 days retained; older plans purged automatically. |
| Genie conversation history | Last 30 days retained; summarized to embedding after 30 days. |
| Crash & error logs | 90-day retention in Sentry. |
| Analytics events | 24-month retention in PostHog. |
