import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-400">Become</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-slate-300 hover:text-white">Features</Link>
            <Link href="/pricing" className="text-slate-300 hover:text-white">Pricing</Link>
            <Link href="/dashboard" className="text-white font-medium">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-6xl mx-auto">
        <DashHeader />
        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <ReadinessCard />
          <MealPlanCard />
          <GenieCard />
        </div>
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <WorkoutHistoryCard />
          <HRVTrendCard />
        </div>
      </div>
    </main>
  );
}


function DashHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Good morning, Athlete</h1>
        <p className="text-slate-400 mt-1">Here&apos;s your daily wellness snapshot</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
          Premium Active
        </span>
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
          B
        </div>
      </div>
    </div>
  );
}

function ReadinessCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Readiness</h3>
        <span className="text-emerald-400 text-xs font-semibold bg-emerald-950/50 px-2 py-0.5 rounded-full">Recovered</span>
      </div>
      <div className="text-center">
        <div className="text-6xl font-bold text-emerald-400">86</div>
        <div className="text-slate-500 text-sm mt-1">/100</div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-6">
        <MiniStat label="HRV" value="92" color="text-indigo-400" />
        <MiniStat label="HR" value="78" color="text-amber-400" />
        <MiniStat label="Sleep" value="85" color="text-emerald-400" />
      </div>
      <div className="mt-4 bg-indigo-950/30 border border-indigo-800/20 rounded-lg p-3">
        <p className="text-indigo-300 text-xs">Your body is recovered — great day for a challenge!</p>
      </div>
    </div>
  );
}

function MealPlanCard() {
  const meals = [
    { type: 'Breakfast', name: 'Spinach & Feta Omelette', cal: 420 },
    { type: 'Lunch', name: 'Grilled Salmon Bowl', cal: 580 },
    { type: 'Dinner', name: 'Herb Chicken & Quinoa', cal: 620 },
    { type: 'Snack', name: 'Greek Yogurt & Berries', cal: 180 },
  ];
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Today&apos;s Nutrition</h3>
        <span className="text-white text-sm font-bold">1,800 kcal</span>
      </div>
      <div className="space-y-3">
        {meals.map((meal) => (
          <div key={meal.type} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
            <div>
              <div className="text-slate-500 text-xs">{meal.type}</div>
              <div className="text-white text-sm font-medium">{meal.name}</div>
            </div>
            <span className="text-slate-400 text-xs">{meal.cal} cal</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-4 justify-center text-center">
        <div><span className="text-indigo-400 font-bold text-sm">142g</span><br/><span className="text-slate-500 text-xs">Protein</span></div>
        <div><span className="text-amber-400 font-bold text-sm">180g</span><br/><span className="text-slate-500 text-xs">Carbs</span></div>
        <div><span className="text-rose-400 font-bold text-sm">62g</span><br/><span className="text-slate-500 text-xs">Fat</span></div>
      </div>
    </div>
  );
}

function GenieCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Genie Coach</h3>
        <span className="text-2xl">🧞</span>
      </div>
      <div className="space-y-3">
        <ChatBubble role="user" text="I feel great today, what should I do?" />
        <ChatBubble role="assistant" text="Your readiness is 86 — let's push it! How about an Air Squat form check?" />
        <div className="flex gap-2 mt-2">
          <span className="bg-indigo-600/20 border border-indigo-500/40 rounded-full px-3 py-1 text-xs text-indigo-300">🏋️ Start Air Squat</span>
          <span className="bg-indigo-600/20 border border-indigo-500/40 rounded-full px-3 py-1 text-xs text-indigo-300">🥗 View Meal Plan</span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <input className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500" placeholder="Ask Genie anything..." readOnly />
        <button className="bg-indigo-600 rounded-lg px-3 py-2 text-sm font-semibold">↑</button>
      </div>
    </div>
  );
}

function WorkoutHistoryCard() {
  const sessions = [
    { exercise: 'Air Squat', score: 94, reps: 12, date: 'Today' },
    { exercise: 'Push-Up', score: 87, reps: 15, date: 'Yesterday' },
    { exercise: 'KB Swing', score: 91, reps: 10, date: '2 days ago' },
    { exercise: 'Sit-Up', score: 82, reps: 20, date: '3 days ago' },
  ];
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Recent Form Check Sessions</h3>
      <div className="space-y-3">
        {sessions.map((s, i) => (
          <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-lg">🏋️</span>
              <div>
                <div className="text-white font-medium text-sm">{s.exercise}</div>
                <div className="text-slate-500 text-xs">{s.reps} reps · {s.date}</div>
              </div>
            </div>
            <div className="text-right">
              <span className={`font-bold ${s.score >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{s.score}</span>
              <span className="text-slate-500 text-xs">/100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HRVTrendCard() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const values = [42, 48, 38, 55, 62, 58, 64];
  const max = Math.max(...values);
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">7-Day HRV Trend</h3>
      <div className="flex items-end justify-between gap-2 h-32">
        {days.map((day, i) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-slate-400 text-xs">{values[i]}</span>
            <div className="w-full bg-slate-700 rounded-t-md relative" style={{ height: `${(values[i]! / max) * 100}%` }}>
              <div className="absolute inset-0 bg-indigo-500/80 rounded-t-md" />
            </div>
            <span className="text-slate-500 text-xs">{day}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-slate-400 text-sm">Baseline: <span className="text-white font-semibold">52ms</span></span>
        <span className="text-emerald-400 text-sm font-medium">↑ 23% above baseline today</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-2 text-center">
      <div className="text-slate-500 text-xs">{label}</div>
      <div className={`font-bold ${color}`}>{value}</div>
    </div>
  );
}

function ChatBubble({ role, text }: { role: 'user' | 'assistant'; text: string }) {
  return (
    <div className={`${role === 'user' ? 'ml-8' : 'mr-8'}`}>
      <div className={`rounded-xl px-3 py-2 text-sm ${
        role === 'user' ? 'bg-indigo-600 text-white ml-auto' : 'bg-slate-800 border border-slate-700 text-slate-200'
      }`}>
        {text}
      </div>
    </div>
  );
}



function DashHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Good morning, Athlete</h1>
        <p className="text-slate-400 mt-1">Here&apos;s your daily wellness snapshot</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">Premium Active</span>
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold">B</div>
      </div>
    </div>
  );
}

function ReadinessCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Readiness</h3>
        <span className="text-emerald-400 text-xs font-semibold bg-emerald-950/50 px-2 py-0.5 rounded-full">Recovered</span>
      </div>
      <div className="text-center">
        <div className="text-6xl font-bold text-emerald-400">86</div>
        <div className="text-slate-500 text-sm mt-1">/100</div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-6">
        <MiniStat label="HRV" value="92" color="text-indigo-400" />
        <MiniStat label="HR" value="78" color="text-amber-400" />
        <MiniStat label="Sleep" value="85" color="text-emerald-400" />
      </div>
      <div className="mt-4 bg-indigo-950/30 border border-indigo-800/20 rounded-lg p-3">
        <p className="text-indigo-300 text-xs">Your body is recovered — great day for a challenge!</p>
      </div>
    </div>
  );
}

function MealPlanCard() {
  const meals = [
    { type: 'Breakfast', name: 'Spinach & Feta Omelette', cal: 420 },
    { type: 'Lunch', name: 'Grilled Salmon Bowl', cal: 580 },
    { type: 'Dinner', name: 'Herb Chicken & Quinoa', cal: 620 },
    { type: 'Snack', name: 'Greek Yogurt & Berries', cal: 180 },
  ];
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Today&apos;s Nutrition</h3>
        <span className="text-white text-sm font-bold">1,800 kcal</span>
      </div>
      <div className="space-y-3">
        {meals.map((meal) => (
          <div key={meal.type} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
            <div>
              <div className="text-slate-500 text-xs">{meal.type}</div>
              <div className="text-white text-sm font-medium">{meal.name}</div>
            </div>
            <span className="text-slate-400 text-xs">{meal.cal} cal</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-4 justify-center text-center">
        <div><span className="text-indigo-400 font-bold text-sm">142g</span><br/><span className="text-slate-500 text-xs">Protein</span></div>
        <div><span className="text-amber-400 font-bold text-sm">180g</span><br/><span className="text-slate-500 text-xs">Carbs</span></div>
        <div><span className="text-rose-400 font-bold text-sm">62g</span><br/><span className="text-slate-500 text-xs">Fat</span></div>
      </div>
    </div>
  );
}

function GenieCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Genie Coach</h3>
        <span className="text-2xl">🧞</span>
      </div>
      <div className="space-y-3">
        <ChatBubble role="user" text="I feel great today, what should I do?" />
        <ChatBubble role="assistant" text="Your readiness is 86 — let's push it! How about an Air Squat form check?" />
        <div className="flex gap-2 mt-2">
          <span className="bg-indigo-600/20 border border-indigo-500/40 rounded-full px-3 py-1 text-xs text-indigo-300">🏋️ Start Air Squat</span>
          <span className="bg-indigo-600/20 border border-indigo-500/40 rounded-full px-3 py-1 text-xs text-indigo-300">🥗 View Meal Plan</span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <input className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500" placeholder="Ask Genie anything..." readOnly />
        <button className="bg-indigo-600 rounded-lg px-3 py-2 text-sm font-semibold">↑</button>
      </div>
    </div>
  );
}

function WorkoutHistoryCard() {
  const sessions = [
    { exercise: 'Air Squat', score: 94, reps: 12, date: 'Today' },
    { exercise: 'Push-Up', score: 87, reps: 15, date: 'Yesterday' },
    { exercise: 'KB Swing', score: 91, reps: 10, date: '2 days ago' },
    { exercise: 'Sit-Up', score: 82, reps: 20, date: '3 days ago' },
  ];
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Recent Sessions</h3>
      <div className="space-y-3">
        {sessions.map((s, i) => (
          <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-lg">🏋️</span>
              <div>
                <div className="text-white font-medium text-sm">{s.exercise}</div>
                <div className="text-slate-500 text-xs">{s.reps} reps · {s.date}</div>
              </div>
            </div>
            <div className="text-right">
              <span className={`font-bold ${s.score >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{s.score}</span>
              <span className="text-slate-500 text-xs">/100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HRVTrendCard() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const values = [42, 48, 38, 55, 62, 58, 64];
  const max = Math.max(...values);
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">7-Day HRV Trend</h3>
      <div className="flex items-end justify-between gap-2 h-32">
        {days.map((day, i) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-slate-400 text-xs">{values[i]}</span>
            <div className="w-full rounded-t-md relative" style={{ height: `${((values[i] ?? 0) / max) * 100}%` }}>
              <div className="absolute inset-0 bg-indigo-500/80 rounded-t-md" />
            </div>
            <span className="text-slate-500 text-xs">{day}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-slate-400 text-sm">Baseline: <span className="text-white font-semibold">52ms</span></span>
        <span className="text-emerald-400 text-sm font-medium">↑ 23% above baseline</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-2 text-center">
      <div className="text-slate-500 text-xs">{label}</div>
      <div className={`font-bold ${color}`}>{value}</div>
    </div>
  );
}

function ChatBubble({ role, text }: { role: 'user' | 'assistant'; text: string }) {
  return (
    <div className={`${role === 'user' ? 'ml-8' : 'mr-8'}`}>
      <div className={`rounded-xl px-3 py-2 text-sm ${
        role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-200'
      }`}>{text}</div>
    </div>
  );
}
