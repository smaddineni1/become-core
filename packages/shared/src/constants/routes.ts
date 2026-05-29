/**
 * App routes — used by Genie for navigation and deep linking
 */
export const APP_ROUTES = {
  // Auth
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',

  // Onboarding
  quiz: '/onboarding/quiz',
  scan: '/onboarding/scan',

  // Main tabs
  home: '/(tabs)/home',
  formCheck: '/(tabs)/form-check',
  formCheckExercise: (exercise: string) => `/(tabs)/form-check/${exercise}` as const,
  mindBody: '/(tabs)/mind-body',
  mindBodyBreathing: '/(tabs)/mind-body/breathing',
  mindBodyHRV: '/(tabs)/mind-body/hrv',
  nutrition: '/(tabs)/nutrition',
  profile: '/(tabs)/profile',
  profileHistory: '/(tabs)/profile/history',
} as const;

/**
 * Genie route mapping — maps intent keywords to routes
 */
export const GENIE_INTENT_ROUTES: Record<string, string> = {
  rest_recovery: APP_ROUTES.mindBody + '?tab=meditation',
  form_check: APP_ROUTES.formCheck,
  meditation_yoga: APP_ROUTES.mindBody + '?tab=meditation',
  nutrition: APP_ROUTES.nutrition,
  hrv_stress: APP_ROUTES.mindBodyHRV,
};
