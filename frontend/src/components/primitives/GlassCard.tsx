"use client";

/**
 * GlassCard — unified card primitive for the Discover page.
 * ─────────────────────────────────────────────────────────────────
 * Variants:
 *   - "elevated": white surface, subtle border + md shadow (default)
 *   - "flat":     muted surface, no shadow, thin border
 *   - "glass":    translucent + backdrop blur (for overlays / hero)
 *   - "feature":  elevated + signature gradient border (for AI moments)
 *
 * Padding sizes: sm (12px) / md (16px) / lg (24px) / xl (32px)
 *
 * Usage:
 *   <GlassCard variant="elevated" padding="lg" interactive onClick={...}>
 *     content
 *   </GlassCard>
 */
import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { tokens } from "@/styles/tokens";
import { lift } from "@/lib/motion";

export type GlassCardVariant = "elevated" | "flat" | "glass" | "feature";
export type GlassCardPadding = "none" | "sm" | "md" | "lg" | "xl";
export type GlassCardRadius = "sm" | "md" | "lg" | "xl";

export interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  variant?: GlassCardVariant;
  padding?: GlassCardPadding;
  radius?: GlassCardRadius;
  /** Adds hover lift + cursor pointer */
  interactive?: boolean;
  /** Fills the parent width */
  fillWidth?: boolean;
  children?: React.ReactNode;
}

const PADDING_MAP: Record<GlassCardPadding, string> = {
  none: "0",
  sm: tokens.space[3],
  md: tokens.space[4],
  lg: tokens.space[6],
  xl: tokens.space[8],
};

const RADIUS_MAP: Record<GlassCardRadius, string> = {
  sm: tokens.radius.sm,
  md: tokens.radius.md,
  lg: tokens.radius.lg,
  xl: tokens.radius.xl,
};

function getVariantStyle(variant: GlassCardVariant): React.CSSProperties {
  switch (variant) {
    case "flat":
      return {
        backgroundColor: tokens.color.surfaceMuted,
        border: `1px solid ${tokens.color.border}`,
        boxShadow: "none",
      };
    case "glass":
      return {
        backgroundColor: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: `1px solid rgba(255, 255, 255, 0.4)`,
        boxShadow: tokens.shadow.md,
      };
    case "feature":
      return {
        backgroundColor: tokens.color.surface,
        // Gradient border effect via background-origin trick
        backgroundImage: `linear-gradient(${tokens.color.surface}, ${tokens.color.surface}), ${tokens.gradient.signature}`,
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        border: "1px solid transparent",
        boxShadow: tokens.shadow.glowMagic,
      };
    case "elevated":
    default:
      return {
        backgroundColor: tokens.color.surface,
        border: `1px solid ${tokens.color.border}`,
        boxShadow: tokens.shadow.md,
      };
  }
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = "elevated",
      padding = "md",
      radius = "lg",
      interactive = false,
      fillWidth = false,
      children,
      style,
      ...rest
    },
    ref,
  ) => {
    const variantStyle = getVariantStyle(variant);
    const interactiveProps = interactive ? lift : {};

    return (
      <motion.div
        ref={ref}
        {...interactiveProps}
        {...rest}
        style={{
          ...variantStyle,
          padding: PADDING_MAP[padding],
          borderRadius: RADIUS_MAP[radius],
          width: fillWidth ? "100%" : undefined,
          cursor: interactive ? "pointer" : undefined,
          overflow: "hidden",
          position: "relative",
          ...style,
        }}
      >
        {children}
      </motion.div>
    );
  },
);

GlassCard.displayName = "GlassCard";
