import { tokens } from "@/styles/tokens";
import type { MembershipTier } from "@/types/membership";

/** Maps a frame's `style_key` slug prefix to the tier whose identity it should render. */
export function tierFromStyleKey(styleKey: string): MembershipTier {
  if (styleKey.startsWith("omakase")) return "omakase";
  if (styleKey.startsWith("feast")) return "feast";
  return "savor";
}

interface TierIdentity {
  /** CSS background for the avatar frame ring. */
  ring: string;
  /** box-shadow glow paired with the ring. */
  glow: string;
  pill: { bg: string; color: string; border: string; glow?: string };
}

/** Single source of truth for tier→color/gradient identity (avatar frames, tier pills). */
export const TIER_IDENTITY: Record<MembershipTier, TierIdentity> = {
  bite: {
    ring: `conic-gradient(${tokens.color.warm}, #ffb088, ${tokens.color.warm})`,
    glow: tokens.shadow.glowWarm,
    pill: { bg: tokens.color.surfaceMuted, color: tokens.color.textMuted, border: tokens.color.border },
  },
  savor: {
    ring: `conic-gradient(${tokens.color.warm}, #ffb088, ${tokens.color.warm})`,
    glow: tokens.shadow.glowWarm,
    pill: { bg: "rgba(255,107,53,0.12)", color: tokens.color.warm, border: "rgba(255,107,53,0.3)" },
  },
  feast: {
    ring: tokens.gradient.signature,
    glow: tokens.shadow.glowFeast,
    pill: { bg: "rgba(123,47,247,0.12)", color: tokens.color.tierFeast, border: "rgba(123,47,247,0.3)" },
  },
  omakase: {
    ring: `conic-gradient(from 0deg, ${tokens.color.tierGold}, #f8edc8, ${tokens.color.tierGold}, #f5c542, ${tokens.color.tierGold})`,
    glow: tokens.shadow.glowGold,
    pill: {
      bg: "rgba(212,160,23,0.14)",
      color: tokens.color.tierGold,
      border: "rgba(212,160,23,0.35)",
      glow: tokens.shadow.glowGold,
    },
  },
};
