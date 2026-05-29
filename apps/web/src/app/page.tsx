import Link from 'next/link';
import { SUBSCRIPTION_CONFIG } from '../lib/shared-constants';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-400">Become</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-slate-300 hover:text-white transition-colors">Features</Link>
            <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</Link>
            <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/pricing" className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-lg font-semibold text-sm transition-colors">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20">
        <div className="inline-flex items-center gap-2 bg-indigo-950/50 border border-indigo-800/30 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
          <span className="text-indigo-300 text-sm font-medium">AI-Powered Wellness Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl leading-tight">
          <span className="text-indigo-400">Become</span> the best version of yourself
        </h1>
        <p className="text-xl text-slate-400 mt-6 max-w-2xl leading-relaxed">
          Real-time AI form coaching, whole-food nutrition intelligence, and adaptive mindfulness —
          all personalized to your body&apos;s daily readiness.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="/pricing" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
            Start {SUBSCRIPTION_CONFIG.trialDays}-Day Free Trial
          </Link>
          <Link href="/features" className="border border-slate-700 hover:border-slate-500 px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
            Explore Features
          </Link>
        </div>

        <p className="text-slate-500 text-sm mt-4">
          No credit card required · Cancel anytime
        </p>

        {/* Hero Visual */}
        <div className="mt-16 w-full max-w-4xl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-indigo-600/5">
            <div className="grid grid-cols-3 gap-6">
              <FeaturePreview icon="🏋️" label="AI Form Check" value="97/100" />
              <FeaturePreview icon="🧬" label="Readiness Score" value="86" />
              <FeaturePreview icon="🥗" label="Meal Plan" value="Ready" />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-500 text-sm uppercase tracking-wider mb-8">Powered by</p>
          <div className="flex flex-wrap justify-center gap-8 text-slate-400">
            <span className="text-lg">MediaPipe AI</span>
            <span className="text-slate-700">|</span>
            <span className="text-lg">GPT-4o</span>
            <span className="text-slate-700">|</span>
            <span className="text-lg">Three.js</span>
            <span className="text-slate-700">|</span>
            <span className="text-lg">Apple HealthKit</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-950 to-indigo-950/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold">Ready to transform your wellness?</h2>
          <p className="text-slate-400 mt-4 text-lg">
            Join thousands who trust Become for AI-powered fitness coaching.
          </p>
          <Link href="/pricing" className="inline-block mt-8 bg-indigo-600 hover:bg-indigo-700 px-10 py-4 rounded-xl font-semibold text-lg transition-colors">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm">
            &copy; 2026 Become. All rights reserved.
          </div>
          <div className="flex gap-6 text-slate-400 text-sm">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Terms of Service</Link>
            <Link href="#" className="hover:text-white">Support</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeaturePreview({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-center">
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-slate-400 text-sm">{label}</div>
      <div className="text-white text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
