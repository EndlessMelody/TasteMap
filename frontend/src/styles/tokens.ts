/**
 * Discover V2 Design Tokens
 * ─────────────────────────────────────────────────────────────────
 * Single source of truth for Discover-page design values.
 * Mirrors the `--dsc-*` CSS variables in `globals.css`, but exposed
 * as a typed JS object so components can consume them via style={}.
 *
 * Usage:
 *   import { tokens } from "@/styles/tokens";
 *   style={{ color: tokens.text.primary, padding: tokens.space[4] }}
 *
 * Rules:
 *   - Never hard-code colors/spacings in Discover components.
 *   - If a new value is needed, add it here first (+ CSS var).
 *   - The `raw` field references the CSS var for SSR-safe runtime reads.
 */

// ─── Color palette ───────────────────────────────────────────────
export const palette = {
  // Surfaces
  bg: "var(--dsc-bg)",
  surface: "var(--dsc-surface)",
  surfaceMuted: "var(--dsc-surface-muted)",
  surfaceInset: "var(--dsc-surface-inset)",

  // Borders
  border: "var(--dsc-border)",
  borderStrong: "var(--dsc-border-strong)",
  borderFocus: "var(--dsc-border-focus)",

  // Text
  text: "var(--dsc-text)",
  textMuted: "var(--dsc-text-muted)",
  textSubtle: "var(--dsc-text-subtle)",
  textInverse: "var(--dsc-text-inverse)",

  // Accents (use sparingly)
  warm: "var(--dsc-accent-warm)",
  cool: "var(--dsc-accent-cool)",
  magic: "var(--dsc-accent-magic)",
  success: "var(--dsc-accent-success)",
  warning: "var(--dsc-accent-warning)",
  danger: "var(--dsc-accent-danger)",
} as const;

// ─── Gradients (reserved for AI / magic moments) ─────────────────
export const gradients = {
  signature: "var(--dsc-gradient-signature)",
  signatureSoft: "var(--dsc-gradient-signature-soft)",
} as const;

// ─── Shadows ─────────────────────────────────────────────────────
export const shadows = {
  sm: "var(--dsc-shadow-sm)",
  md: "var(--dsc-shadow-md)",
  lg: "var(--dsc-shadow-lg)",
  glowMagic: "var(--dsc-shadow-glow-magic)",
  glowWarm: "var(--dsc-shadow-glow-warm)",
} as const;

// ─── Radii ───────────────────────────────────────────────────────
export const radius = {
  xs: "var(--dsc-radius-xs)",
  sm: "var(--dsc-radius-sm)",
  md: "var(--dsc-radius-md)",
  lg: "var(--dsc-radius-lg)",
  xl: "var(--dsc-radius-xl)",
  pill: "var(--dsc-radius-pill)",
} as const;

// ─── Spacing (4px base) ──────────────────────────────────────────
export const space = {
  1: "var(--dsc-space-1)",
  2: "var(--dsc-space-2)",
  3: "var(--dsc-space-3)",
  4: "var(--dsc-space-4)",
  5: "var(--dsc-space-5)",
  6: "var(--dsc-space-6)",
  8: "var(--dsc-space-8)",
  10: "var(--dsc-space-10)",
  12: "var(--dsc-space-12)",
  16: "var(--dsc-space-16)",
} as const;

// ─── Typography ──────────────────────────────────────────────────
export const typography = {
  size: {
    display: "var(--dsc-font-display)",
    h1: "var(--dsc-font-h1)",
    h2: "var(--dsc-font-h2)",
    h3: "var(--dsc-font-h3)",
    body: "var(--dsc-font-body)",
    bodySm: "var(--dsc-font-body-sm)",
    caption: "var(--dsc-font-caption)",
  },
  tracking: {
    tight: "var(--dsc-tracking-tight)",
    normal: "var(--dsc-tracking-normal)",
    wide: "var(--dsc-tracking-wide)",
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 800,
  },
} as const;

// ─── Motion ──────────────────────────────────────────────────────
export const motion = {
  ease: {
    out: "var(--dsc-ease-out)",
    inOut: "var(--dsc-ease-in-out)",
    spring: "var(--dsc-ease-spring)",
  },
  duration: {
    fast: "var(--dsc-duration-fast)",
    base: "var(--dsc-duration-base)",
    slow: "var(--dsc-duration-slow)",
  },
  // Raw numeric values for Framer Motion (which doesn't read CSS vars)
  durationMs: {
    fast: 0.15,
    base: 0.28,
    slow: 0.48,
  },
  easeCurve: {
    out: [0.22, 1, 0.36, 1] as [number, number, number, number],
    inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
    spring: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  },
} as const;

// ─── Z-index ─────────────────────────────────────────────────────
export const z = {
  base: 1,
  sticky: 40,
  overlay: 50,
  modal: 60,
  toast: 70,
} as const;

// ─── Unified export ──────────────────────────────────────────────
export const tokens = {
  color: palette,
  gradient: gradients,
  shadow: shadows,
  radius,
  space,
  type: typography,
  motion,
  z,
} as const;

// ─── Helpers ─────────────────────────────────────────────────────
/**
 * Pick the right match-score accent based on percentage.
 * Used by MatchRing + AIPickDeckCard.
 */
export function matchTone(pct: number): string {
  if (pct >= 90) return palette.success;
  if (pct >= 75) return palette.warning;
  return palette.danger;
}

export type Tokens = typeof tokens;
