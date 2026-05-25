"use client";

import React, { HTMLAttributes } from "react";
import { tokens } from "@/styles/tokens";
import { cn } from "@/lib/cn";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Width as a CSS value (e.g., "100%", "240px"). Defaults to 100%. */
  width?: string | number;
  /** Height as a CSS value. Defaults to a single line of body text (15px). */
  height?: string | number;
  /** Radius preset; defaults to `sm`. Use `pill` for avatar skeletons. */
  radius?: "sm" | "md" | "lg" | "pill";
}

const RADIUS = {
  sm: tokens.radius.sm,
  md: tokens.radius.md,
  lg: tokens.radius.lg,
  pill: tokens.radius.pill,
} as const;

/**
 * <Skeleton>
 * Shimmer placeholder. Pair sizes with the primitive it's standing in for.
 */
export const Skeleton = ({
  width = "100%",
  height = 16,
  radius = "sm",
  className,
  style,
  ...props
}: SkeletonProps) => (
  <div
    aria-hidden
    className={cn("ui-skeleton", className)}
    style={{
      width,
      height,
      borderRadius: RADIUS[radius],
      ...style,
    }}
    {...props}
  />
);
