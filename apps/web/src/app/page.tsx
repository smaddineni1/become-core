import { SUBSCRIPTION_CONFIG } from '@become/shared';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <h1 className="text-6xl font-bold tracking-tight">
          <span className="text-indigo-400">Become</span> your best self
        </h1>
        <p className="text-xl text-slate-400 mt-6 max-w-2xl">
          AI-powered fitness coaching, whole-food nutrition, and mindfulness —
          all in one platform that adapts to your body.
        </p>

        <div className="mt-10 flex gap-4">
          <a
            href="#download"
            className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            Start Free Trial
          </a>
          <a
            href="#features"
            className="border border-slate-700 hover:border-slate-500 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            See Features
          </a>
        </div>

        <p className="text-slate-500 text-sm mt-4">
          {SUBSCRIPTION_CONFIG.trialDays}-day free trial · No credit card required
        </p>
      </section>
    </main>
  );
}
