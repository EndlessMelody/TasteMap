"use client";

import React, { HTMLAttributes } from "react";
import { tokens } from "@/styles/tokens";
import { cn } from "@/lib/cn";

type CardSurface = "default" | "muted" | "inset";
type CardRadius = "sm" | "md" | "lg" | "xl";
type CardShadow = "none" | "sm" | "md" | "lg";
type CardPadding = "none" | "sm" | "md" | "lg";

const SURFACE: Record<CardSurface, string> = {
  default: tokens.color.surface,
  muted: tokens.color.surfaceMuted,
  inset: tokens.color.surfaceInset,
};

const RADIUS: Record<CardRadius, string> = {
  sm: tokens.radius.sm,
  md: tokens.radius.md,
  lg: tokens.radius.lg,
  xl: tokens.radius.xl,
};

const SHADOW: Record<CardShadow, string> = {
  none: "none",
  sm: tokens.shadow.sm,
  md: tokens.shadow.md,
  lg: tokens.shadow.lg,
};

const PADDING: Record<CardPadding, string> = {
  none: "0",
  sm: tokens.space[4],
  md: tokens.space[5],
  lg: tokens.space[6],
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  surface?: CardSurface;
  radius?: CardRadius;
  shadow?: CardShadow;
  padding?: CardPadding;
  /** Adds the dsc-lift hover effect (translateY + shadow.lg). */
  interactive?: boolean;
  /** Removes the default border. */
  borderless?: boolean;
}

/**
 * <Card>
 * The default surface primitive. Defaults to white surface, `radius.lg`,
 * `shadow.sm`, `padding md`, with subtle border.
 */
export const Card = ({
  surface = "default",
  radius = "lg",
  shadow = "sm",
  padding = "md",
  interactive,
  borderless,
  className,
  style,
  children,
  ...props
}: CardProps) => (
  <div
    className={cn("ui-card", interactive && "dsc-lift", className)}
    style={{
      background: SURFACE[surface],
      borderRadius: RADIUS[radius],
      boxShadow: SHADOW[shadow],
      padding: PADDING[padding],
      border: borderless ? "none" : `1px solid ${tokens.color.border}`,
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);
