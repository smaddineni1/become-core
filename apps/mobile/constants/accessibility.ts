/**
 * Accessibility Labels & Hints (WCAG 2.1 AA)
 */
export const A11Y = {
  nav: {
    home: { label: 'Home tab', hint: 'View your daily wellness summary' },
    formCheck: { label: 'Form Check tab', hint: 'Start an AI-powered exercise session' },
    mindBody: { label: 'Mind and Body tab', hint: 'Access yoga, meditation, and breathing' },
    nutrition: { label: 'Nutrition tab', hint: 'View your daily meal plan' },
    profile: { label: 'Profile tab', hint: 'Manage your account and settings' },
  },
  genie: {
    fab: { label: 'Open Genie coach', hint: 'Ask your AI wellness coach for help' },
    close: { label: 'Close Genie', hint: 'Dismiss the chat overlay' },
    input: { label: 'Message input', hint: 'Type a question for Genie' },
    send: { label: 'Send message', hint: 'Send your question to Genie' },
  },
  formCheck: {
    startSession: { label: 'Start session', hint: 'Begin AI form analysis' },
    endSession: { label: 'End session', hint: 'Stop and see results' },
    score: (score: number) => ({ label: `Form score: ${score} out of 100` }),
    reps: (count: number) => ({ label: `${count} reps completed` }),
    cue: (msg: string) => ({ label: `Correction: ${msg}` }),
  },
  nutrition: {
    generate: { label: 'Generate meal plan', hint: 'Create a personalized plan' },
    regenerate: { label: 'Regenerate meal plan', hint: 'Get a different plan' },
    markComplete: (meal: string) => ({ label: `Mark ${meal} complete`, hint: 'Log this meal' }),
    expandMeal: (name: string) => ({ label: `Expand ${name}`, hint: 'View ingredients and method' }),
  },
  mindBody: {
    play: { label: 'Play', hint: 'Start breathing session' },
    pause: { label: 'Pause', hint: 'Pause session' },
    replay: { label: 'Replay', hint: 'Restart from beginning' },
  },
  hrv: {
    logReading: { label: 'Log HRV', hint: 'Save your measurement' },
    score: (score: number, cls: string) => ({ label: `Readiness: ${score}/100, ${cls}` }),
  },
  auth: {
    signIn: { label: 'Sign in', hint: 'Log into your account' },
    signUp: { label: 'Create account', hint: 'Register a new account' },
    appleSignIn: { label: 'Continue with Apple' },
    googleSignIn: { label: 'Continue with Google' },
  },
  profile: {
    signOut: { label: 'Sign out', hint: 'Log out' },
    upgrade: { label: 'Upgrade to premium', hint: 'Start 7-day free trial' },
  },
} as const;
