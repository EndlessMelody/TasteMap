/**
 * Discover V2 Design Tokens
 * ─────────────────────────────────────────────────────────────────
 * Single source of truth for Discover-page design values, exposed
 * as a typed JS object so components can consume them via style={}.
 *
 * Usage:
 *   import { tokens } from "@/styles/tokens";
 *   style={{ color: tokens.text.primary, padding: tokens.space[4] }}
 *
 * Colors are backed by @once-ui-system/core's CSS variables (theme-aware,
 * flips automatically with data-theme via ThemeContext). Radius/space/
 * typography are theme-invariant literals. Motion still uses the
 * dsc-ease and dsc-duration CSS vars defined in globals.css.
 */

// ─── Color palette (Once UI semantic vars — dark-mode aware) ─────
export const palette = {
  // Surfaces
  bg: "var(--page-background)",
  surface: "var(--surface-background)",
  surfaceMuted: "var(--neutral-background-weak)",
  surfaceInset: "var(--neutral-background-medium)",

  // Borders
  border: "var(--neutral-alpha-weak)",
  borderStrong: "var(--neutral-alpha-medium)",
  borderFocus: "var(--brand-alpha-strong)",

  // Text
  text: "var(--neutral-on-background-strong)",
  textMuted: "var(--neutral-on-background-medium)",
  textSubtle: "var(--neutral-on-background-weak)",
  textInverse: "var(--neutral-on-solid-strong)",

  // Accents (use sparingly) — theme-invariant brand hex (never had a dark
  // variant), kept literal since several call sites append a hex alpha
  // suffix (e.g. `${tokens.color.warm}30`), which only works on hex strings.
  warm: "#ff6b35",
  cool: "#0a84ff",
  magic: "#a855f7",
  success: "#34c759",
  warning: "#fbbf24",
  danger: "#e63946",
} as const;

// ─── Gradients (reserved for AI / magic moments — decorative, theme-invariant) ─
export const gradients = {
  signature: "linear-gradient(135deg, #ff6b35 0%, #e63946 50%, #7b2ff7 100%)",
  signatureSoft:
    "linear-gradient(135deg, rgba(255, 107, 53, 0.12) 0%, rgba(230, 57, 70, 0.1) 50%, rgba(123, 47, 247, 0.12) 100%)",
} as const;

// ─── Shadows ─────────────────────────────────────────────────────
export const shadows = {
  sm: "var(--shadow-card)",
  md: "var(--shadow-card)",
  lg: "var(--shadow-elevated)",
  glowMagic: "0 8px 32px -8px rgba(168, 85, 247, 0.35)",
  glowWarm: "0 8px 32px -8px rgba(255, 107, 53, 0.35)",
} as const;

// ─── Radii (theme-invariant) ──────────────────────────────────────
export const radius = {
  xs: "6px",
  sm: "10px",
  md: "14px",
  lg: "20px",
  xl: "28px",
  pill: "9999px",
} as const;

// ─── Spacing (4px base, theme-invariant) ─────────────────────────
export const space = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
} as const;

// ─── Typography (theme-invariant) ────────────────────────────────
export const typography = {
  size: {
    display: "3rem",
    h1: "2rem",
    h2: "1.375rem",
    h3: "1.125rem",
    body: "0.9375rem",
    bodySm: "0.8125rem",
    caption: "0.6875rem",
  },
  tracking: {
    tight: "-0.02em",
    normal: "-0.005em",
    wide: "0.06em",
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
