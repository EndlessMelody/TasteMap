/**
 * Tour Builder Design Tokens — ELITE PASTEL LIGHT MODE
 * ─────────────────────────────────────────────────────────────
 * Central source of truth for all Tour Builder styling.
 * Aligned with the Pastel Blue + White aesthetic.
 */

// ═══════════ SURFACES ═══════════
export const surface = {
  page: '#F8FAFF',
  base: '#F0F4FA',
  elevated: '#FFFFFF',
  overlay: 'rgba(255, 255, 255, 0.92)',
  glass: 'rgba(255, 255, 255, 0.75)',
  card: '#FFFFFF',
} as const;

// ═══════════ BRAND / ACCENT COLORS ═══════════
export const accent = {
  primary: '#007AFF',       // Elite Blue — main CTA, success, active
  primaryMuted: 'rgba(0, 122, 255, 0.1)',
  primaryGlow: 'rgba(0, 122, 255, 0.25)',
  
  secondary: '#8E44AD',     // Deep Purple — time, premium
  secondaryMuted: 'rgba(142, 68, 173, 0.1)',
  
  warning: '#F59E0B',       // Amber — match %, sparkles
  warningMuted: 'rgba(245, 158, 11, 0.1)',
  
  danger: '#FF3B30',        // Apple Red — discard, skip
  dangerMuted: 'rgba(255, 59, 48, 0.1)',
  
  brand: '#0066CC',         // Brand deep blue — location pin
} as const;

// ═══════════ TEXT COLORS ═══════════
export const text = {
  primary: '#1C1C1E',
  secondary: 'rgba(28, 28, 30, 0.7)',
  tertiary: 'rgba(28, 28, 30, 0.5)',
  muted: 'rgba(28, 28, 30, 0.35)',
  disabled: 'rgba(28, 28, 30, 0.2)',
} as const;

// ═══════════ BORDERS ═══════════
export const border = {
  subtle: 'rgba(0, 0, 0, 0.05)',
  weak: 'rgba(0, 0, 0, 0.08)',
  medium: 'rgba(0, 0, 0, 0.12)',
  strong: 'rgba(0, 0, 0, 0.18)',
} as const;

// ═══════════ SPACING (8px grid) ═══════════
export const spacing = {
  '2xs': 4,
  xs: 8,
  s: 12,
  m: 16,
  l: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
} as const;

// ═══════════ RADIUS ═══════════
export const radius = {
  xs: 6,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// ═══════════ SHADOWS ═══════════
export const shadow = {
  card: '0 8px 32px rgba(0, 122, 255, 0.08)',
  elevated: '0 16px 48px rgba(0, 0, 0, 0.08)',
  glow: (color: string) => `0 0 20px ${color}`,
  insetBorder: (color: string) => `inset 0 0 0 1.5px ${color}`,
} as const;

// ═══════════ TYPOGRAPHY SCALE ═══════════
export const typography = {
  // Page-level
  pageTitle: { size: '1.75rem', weight: 700, lineHeight: 1.2 },
  
  // Section-level
  sectionTitle: { size: '1.125rem', weight: 700, lineHeight: 1.3 },
  sectionSubtitle: { size: '0.875rem', weight: 500, lineHeight: 1.4 },
  
  // Card-level
  cardTitle: { size: '1.25rem', weight: 700, lineHeight: 1.2 },
  cardSubtitle: { size: '0.9rem', weight: 500, lineHeight: 1.4 },
  
  // Metadata
  label: { size: '0.75rem', weight: 600, lineHeight: 1.3 },
  caption: { size: '0.7rem', weight: 600, lineHeight: 1.3, letterSpacing: '0.04em' },
  
  // Body
  body: { size: '0.875rem', weight: 400, lineHeight: 1.5 },
  bodySmall: { size: '0.8rem', weight: 400, lineHeight: 1.5 },
} as const;

// ═══════════ ROUTE STATUS COLORS ═══════════
export const routeStatus = {
  empty: { bg: 'rgba(0, 0, 0, 0.03)', border: 'rgba(0, 0, 0, 0.08)' },
  active: { bg: 'rgba(0, 122, 255, 0.05)', border: 'rgba(0, 122, 255, 0.4)' },
  filled: (color: string) => ({ bg: `${color}10`, border: color }),
  connector: { active: accent.primary, inactive: border.weak },
} as const;

// ═══════════ CARD AMBIENT COLORS (by category) ═══════════
export const cardAmbient = {
  food: '#FF6B35',
  cafe: '#2A9D8F',
  nightlife: '#7B2FF7',
  cultural: '#E63946',
  nature: '#4ADE80',
  shopping: '#F472B6',
} as const;

// ═══════════ Z-INDEX LAYERS ═══════════
export const zIndex = {
  base: 0,
  card: 5,
  cardActive: 10,
  header: 20,
  overlay: 30,
  modal: 40,
  tooltip: 50,
} as const;

// ═══════════ MOTION ═══════════
export const motion = {
  spring: { type: 'spring', stiffness: 260, damping: 22 },
  springSnappy: { type: 'spring', stiffness: 400, damping: 25 },
  springGentle: { type: 'spring', stiffness: 180, damping: 20 },
  easeOut: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  easeInOut: { duration: 0.4, ease: 'easeInOut' },
} as const;
