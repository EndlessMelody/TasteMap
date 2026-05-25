/**
 * Discover V2 — Shared Framer Motion Presets
 * ─────────────────────────────────────────────────────────────────
 * Centralized variants + transitions. Every new Discover component
 * should import from here instead of inventing its own timings.
 *
 * Usage:
 *   import { fadeUp, stagger, lift, ease } from "@/lib/motion";
 *
 *   <motion.div variants={stagger} initial="hidden" animate="show">
 *     <motion.div variants={fadeUp}>…</motion.div>
 *   </motion.div>
 */
import type { Variants, Transition } from "framer-motion";
import { tokens } from "@/styles/tokens";

// ─── Easing curves (matches tokens.motion.easeCurve) ─────────────
export const ease = tokens.motion.easeCurve;

// ─── Durations (seconds, for Framer) ─────────────────────────────
export const duration = tokens.motion.durationMs;

// ─── Base transitions ────────────────────────────────────────────
export const transitions = {
  smooth: {
    duration: duration.base,
    ease: ease.out,
  } satisfies Transition,

  snappy: {
    duration: duration.fast,
    ease: ease.out,
  } satisfies Transition,

  cinematic: {
    duration: duration.slow,
    ease: ease.out,
  } satisfies Transition,

  spring: {
    type: "spring" as const,
    stiffness: 220,
    damping: 24,
    mass: 0.8,
  } satisfies Transition,

  bounce: {
    type: "spring" as const,
    stiffness: 320,
    damping: 18,
    mass: 0.7,
  } satisfies Transition,
};

// ─── Variants ────────────────────────────────────────────────────

/** Fade + slide up — for section reveals, cards on mount */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

/** Fade + slide down — for dropdowns, ribbons */
export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -12 },
  show: {
    opacity: 1,
    y: 0,
    transition: transitions.snappy,
  },
};

/** Scale in from 0.95 — for modals, overlays */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
};

/** Fade only — for loading swaps */
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: transitions.smooth,
  },
};

/**
 * Stagger container — apply to a parent, children inherit stagger.
 * Works with any child variants that have hidden/show states.
 */
export const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

/** Slower stagger for hero sections */
export const staggerHero: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

// ─── Hover interaction presets ───────────────────────────────────

/**
 * Standard "lift" on hover — use via whileHover on motion.div.
 * Matches the `.dsc-lift` CSS utility for cards that don't need motion.
 */
export const lift = {
  whileHover: {
    y: -4,
    transition: transitions.smooth,
  },
  whileTap: {
    y: -1,
    scale: 0.99,
    transition: transitions.snappy,
  },
} as const;

/** Gentle scale — for interactive chips, badges */
export const pressable = {
  whileHover: { scale: 1.03, transition: transitions.snappy },
  whileTap: { scale: 0.97, transition: transitions.snappy },
} as const;

/** Hero image parallax pre-set (use with useScroll + useTransform) */
export const heroImageZoom = {
  initial: { scale: 1.08 },
  animate: {
    scale: 1,
    transition: { duration: 1.2, ease: ease.out },
  },
} as const;

// ─── Scroll-reveal viewport config ───────────────────────────────
export const viewportOnce = {
  once: true,
  amount: 0.2 as const,
};
