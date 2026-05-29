import Link from 'next/link';
import { SUBSCRIPTION_CONFIG, FREE_TIER_LIMITS } from '@become/shared';

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-400">Become</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-slate-300 hover:text-white transition-colors">Features</Link>
            <Link href="/pricing" className="text-white font-medium">Pricing</Link>
            <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-6 text-center">
        <h1 className="text-5xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-slate-400 text-xl mt-4 max-w-2xl mx-auto">
          One plan. Every feature. {SUBSCRIPTION_CONFIG.trialDays}-day free trial.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Free Tier */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-slate-300">Free</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-slate-400 ml-1">/forever</span>
            </div>
            <p className="text-slate-400 mt-3 text-sm">Try the platform with daily limits.</p>
            <div className="mt-6 space-y-3">
              <PricingFeature included text={`${FREE_TIER_LIMITS.formCheckSessionsPerDay} form check session / day`} />
              <PricingFeature included text={`${FREE_TIER_LIMITS.genieMessagesPerDay} Genie messages / day`} />
              <PricingFeature included text={`${FREE_TIER_LIMITS.nutritionRegenerationsPerDay} meal plan regeneration / day`} />
              <PricingFeature included text="Manual HRV entry" />
              <PricingFeature included={false} text="Unlimited form check sessions" />
              <PricingFeature included={false} text="Apple HealthKit / Health Connect" />
              <PricingFeature included={false} text="Full breathing video library" />
              <PricingFeature included={false} text="Readiness-driven recommendations" />
            </div>
            <button className="w-full mt-8 border border-slate-700 hover:border-slate-500 rounded-xl py-3 font-semibold transition-colors">
              Get Started
            </button>
          </div>

          {/* Premium Tier */}
          <div className="bg-gradient-to-b from-indigo-950/50 to-slate-900 border-2 border-indigo-500/50 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 px-4 py-1 rounded-full text-xs font-semibold">
              MOST POPULAR
            </div>
            <h3 className="text-xl font-semibold text-white">{SUBSCRIPTION_CONFIG.name}</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold text-white">${SUBSCRIPTION_CONFIG.priceRange.min}</span>
              <span className="text-slate-400 ml-1">/month</span>
            </div>
            <p className="text-indigo-300 mt-3 text-sm font-medium">
              {SUBSCRIPTION_CONFIG.trialDays}-day free trial included
            </p>
            <div className="mt-6 space-y-3">
              {SUBSCRIPTION_CONFIG.features.map((feature, idx) => (
                <PricingFeature key={idx} included text={feature} />
              ))}
              <PricingFeature included text="Priority support" />
              <PricingFeature included text="All future premium content" />
            </div>
            <button className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 rounded-xl py-3 font-semibold transition-colors">
              Start Free Trial
            </button>
            <p className="text-slate-500 text-xs text-center mt-3">
              Cancel anytime · No credit card to start trial
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <FAQ q="What happens after my 7-day free trial?" a="Your subscription auto-renews at $14.99/month. You can cancel anytime before the trial ends and won't be charged." />
            <FAQ q="Is my video data stored or transmitted?" a="Never. All pose detection runs 100% on your device using MediaPipe. No video frames ever leave your phone." />
            <FAQ q="What makes your nutrition different?" a="We exclusively recommend whole, unprocessed foods. No protein bars, powders, or supplements — our AI is guardrailed to never suggest them." />
            <FAQ q="Which devices are supported?" a="iOS 16+ and Android 12+. We support Apple HealthKit and Google Health Connect for biometric data." />
            <FAQ q="Can I cancel anytime?" a="Yes. Cancel through your App Store or Play Store subscription settings. You keep premium access until the end of your billing period." />
          </div>
        </div>
      </section>
    </main>
  );
}

function PricingFeature({ included, text }: { included: boolean; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-bold ${included ? 'text-indigo-400' : 'text-slate-600'}`}>
        {included ? '✓' : '✕'}
      </span>
      <span className={included ? 'text-slate-300' : 'text-slate-500'}>{text}</span>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h4 className="text-white font-semibold">{q}</h4>
      <p className="text-slate-400 mt-2 text-sm leading-relaxed">{a}</p>
    </div>
  );
}
