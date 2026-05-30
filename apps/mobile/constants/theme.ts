export const COLORS = {
  brand: '#6366F1', brandDark: '#4F46E5', brandLight: '#818CF8',
  bg: { primary: '#0F172A', secondary: '#1E293B', card: '#1E293B', elevated: '#334155' },
  text: { primary: '#FFFFFF', secondary: '#94A3B8', muted: '#64748B', disabled: '#475569' },
  score: { excellent: '#34D399', good: '#6366F1', fair: '#FBBF24', poor: '#F87171' },
  status: { success: '#34D399', warning: '#FBBF24', error: '#F87171', info: '#6366F1' },
  border: { subtle: '#1E293B', medium: '#334155', strong: '#475569' },
} as const;

export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32, '3xl': 48 } as const;
export const BORDER_RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 9999 } as const;
export const ANIMATION = { duration: { fast: 150, normal: 300, slow: 500 } } as const;

export function getScoreColor(score: number): string {
  if (score >= 80) return COLORS.score.excellent;
  if (score >= 60) return COLORS.score.good;
  if (score >= 40) return COLORS.score.fair;
  return COLORS.score.poor;
}

export function getReadinessColor(classification: 'recovered' | 'balanced' | 'stressed'): string {
  switch (classification) {
    case 'recovered': return COLORS.score.excellent;
    case 'balanced': return COLORS.score.fair;
    case 'stressed': return COLORS.score.poor;
  }
}
