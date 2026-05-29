import Link from 'next/link';

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-400">Become</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-white font-medium">Features</Link>
            <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</Link>
            <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/pricing" className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-lg font-semibold text-sm transition-colors">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center">
        <h1 className="text-5xl font-bold">The Complete AI Wellness Engine</h1>
        <p className="text-slate-400 text-xl mt-4 max-w-2xl mx-auto">
          Five integrated systems working together to optimize your body and mind.
        </p>
      </section>

      {/* Feature 1: 3D AI Form Check */}
      <section className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-950/50 border border-indigo-800/30 rounded-full px-3 py-1 mb-4">
              <span className="text-indigo-300 text-xs font-semibold">CORE FEATURE</span>
            </div>
            <h2 className="text-4xl font-bold">3D AI Form Check Engine</h2>
            <p className="text-slate-400 mt-4 text-lg leading-relaxed">
              Split-screen interface with a premium 3D character demonstrating perfect form on the left,
              and your live camera with skeletal tracking on the right.
            </p>
            <ul className="mt-6 space-y-3">
              <FeaturePoint text="33-point skeletal tracking via MediaPipe (100% on-device)" />
              <FeaturePoint text="Real-time 0-100 score with color-coded arc gauge" />
              <FeaturePoint text="Live corrective cues: Knee Cave, Deficient Depth, Forward Lean" />
              <FeaturePoint text="Automatic rep counting (validated quality threshold)" />
              <FeaturePoint text="4 launch exercises: Air Squat, Push-Up, Sit-Up, KB Swing" />
            </ul>
            <div className="mt-6 bg-slate-900 border border-slate-800 rounded-lg p-3 inline-block">
              <span className="text-emerald-400 text-sm font-medium">Privacy: Zero video data ever leaves your device</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-xl p-6 text-center border border-slate-700">
                <div className="text-4xl mb-2">🏋️</div>
                <div className="text-white font-semibold">3D Model</div>
                <div className="text-slate-500 text-xs mt-1">Perfect form reference</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-6 text-center border border-slate-700">
                <div className="text-4xl mb-2">📷</div>
                <div className="text-white font-semibold">Live Camera</div>
                <div className="text-slate-500 text-xs mt-1">Skeletal overlay</div>
              </div>
              <div className="bg-indigo-950/50 border border-indigo-800/30 rounded-xl p-6 text-center col-span-2">
                <div className="text-5xl font-bold text-indigo-400">92</div>
                <div className="text-slate-400 text-sm mt-1">Live Form Score</div>
                <div className="w-full bg-slate-700 h-2 rounded-full mt-3">
                  <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Guided Breathing */}
      <section className="py-20 px-6 border-t border-slate-800 bg-gradient-to-b from-slate-950 to-indigo-950/10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <div className="w-40 h-40 mx-auto rounded-full border-4 border-indigo-500/60 flex items-center justify-center mb-6">
              <div className="w-28 h-28 rounded-full bg-indigo-600/20 flex items-center justify-center">
                <span className="text-indigo-300 text-lg font-medium">Inhale</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button className="bg-slate-800 border border-slate-700 rounded-full px-6 py-2 text-sm">⟲ Replay</button>
              <button className="bg-indigo-600 rounded-full px-6 py-2 text-sm font-semibold">▶ Play</button>
              <button className="bg-slate-800 border border-slate-700 rounded-full px-6 py-2 text-sm">⏹ Stop</button>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="inline-flex items-center gap-2 bg-emerald-950/50 border border-emerald-800/30 rounded-full px-3 py-1 mb-4">
              <span className="text-emerald-300 text-xs font-semibold">MIND & BODY</span>
            </div>
            <h2 className="text-4xl font-bold">Guided Breathing Engine</h2>
            <p className="text-slate-400 mt-4 text-lg leading-relaxed">
              AI-generated HD video sessions with a premium custom media player.
              Cached locally for instant, offline-capable playback.
            </p>
            <ul className="mt-6 space-y-3">
              <FeaturePoint text="HD AI-generated breathing videos (Runway AI)" />
              <FeaturePoint text="Custom player: Play, Pause, Replay with auto-hide controls" />
              <FeaturePoint text="Prefetched + cached on device (works offline)" />
              <FeaturePoint text="Loop mode for continuous guided breathing" />
              <FeaturePoint text="HRV-driven: auto-recommended when readiness is low" />
            </ul>
          </div>
        </div>
      </section>

      {/* Feature 3: Readiness Intelligence */}
      <section className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-950/50 border border-amber-800/30 rounded-full px-3 py-1 mb-4">
              <span className="text-amber-300 text-xs font-semibold">BIOMETRIC INTELLIGENCE</span>
            </div>
            <h2 className="text-4xl font-bold">Readiness Score</h2>
            <p className="text-slate-400 mt-4 text-lg leading-relaxed">
              Pulls HRV, resting heart rate, and sleep data from Apple HealthKit / Google Health Connect.
              Computes a daily 0-100 score that adapts your entire wellness plan.
            </p>
            <ul className="mt-6 space-y-3">
              <FeaturePoint text="HRV (40%), Resting HR (25%), Sleep (35%) — weighted model" />
              <FeaturePoint text="7-day rolling baselines personalized to your body" />
              <FeaturePoint text="Stressed → auto-routes to breathing + recovery nutrition" />
              <FeaturePoint text="Recovered → suggests challenging form-check workouts" />
            </ul>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-emerald-400">86</div>
              <div className="text-slate-400 mt-1">Today&apos;s Readiness</div>
              <div className="text-emerald-400 text-sm font-medium mt-1">Recovered</div>
            </div>
            <div className="space-y-3">
              <FactorBar label="HRV" value={92} color="bg-indigo-500" />
              <FactorBar label="Heart Rate" value={78} color="bg-amber-500" />
              <FactorBar label="Sleep" value={85} color="bg-emerald-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature 4: Nutrition + Genie */}
      <section className="py-20 px-6 border-t border-slate-800 bg-gradient-to-b from-slate-950 to-indigo-950/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">Plus Two More Powerhouses</h2>
            <p className="text-slate-400 mt-4 text-lg max-w-2xl mx-auto">
              An AI nutrition engine and a conversational coach that ties everything together.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <div className="text-3xl mb-4">🥗</div>
              <h3 className="text-2xl font-bold">Whole-Food Nutrition Pipeline</h3>
              <p className="text-slate-400 mt-3 leading-relaxed">
                GPT-4o generates daily meal plans from 100% whole, unprocessed ingredients.
                No protein bars, no powders, no supplements — ever.
              </p>
              <div className="mt-4 bg-emerald-950/30 border border-emerald-800/20 rounded-lg p-3">
                <span className="text-emerald-400 text-sm">Brand guardrail enforced at 3 levels</span>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <div className="text-3xl mb-4">🧞</div>
              <h3 className="text-2xl font-bold">Genie AI Coach</h3>
              <p className="text-slate-400 mt-3 leading-relaxed">
                Persistent floating button on every screen. Natural language in, action buttons out.
                &ldquo;I&apos;m tired&rdquo; → routes to meditation. &ldquo;Show me squats&rdquo; → opens form check.
              </p>
              <div className="mt-4 bg-indigo-950/30 border border-indigo-800/20 rounded-lg p-3">
                <span className="text-indigo-400 text-sm">Context-aware: knows your HRV, goals & history</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold">Experience the full platform</h2>
          <p className="text-slate-400 mt-4 text-lg">Start your 7-day free trial today.</p>
          <Link href="/pricing" className="inline-block mt-8 bg-indigo-600 hover:bg-indigo-700 px-10 py-4 rounded-xl font-semibold text-lg transition-colors">
            View Pricing
          </Link>
        </div>
      </section>
    </main>
  );
}

function FeaturePoint({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-indigo-400 mt-0.5 font-bold text-sm">✓</span>
      <span className="text-slate-300">{text}</span>
    </li>
  );
}

function FactorBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>
      <div className="w-full bg-slate-700 h-2 rounded-full">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
