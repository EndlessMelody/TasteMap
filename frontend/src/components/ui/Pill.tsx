"use client";

import React, { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type PillTone =
  | "neutral"
  | "warm"
  | "magic"
  | "cool"
  | "success"
  | "warning"
  | "danger";
export type PillSize = "sm" | "md";

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: PillTone;
  size?: PillSize;
  /** Solid fill instead of subtle tinted background. */
  solid?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Renders a small dot before the label (status indicator). */
  dot?: boolean;
}

/**
 * <Pill>
 * Status / filter / tag chip. Use semantic `tone` — never decorative color.
 * Styles live in ui.css under `.ui-pill`.
 */
export const Pill = ({
  tone = "neutral",
  size = "sm",
  solid,
  dot,
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}: PillProps) => (
  <span
    className={cn(
      "ui-pill",
      `ui-pill--${tone}`,
      `ui-pill--${size}`,
      solid && "ui-pill--solid",
      className,
    )}
    {...props}
  >
    {dot && <span className="ui-pill__dot" aria-hidden />}
    {leftIcon && <span className="ui-pill__icon">{leftIcon}</span>}
    <span>{children}</span>
    {rightIcon && <span className="ui-pill__icon">{rightIcon}</span>}
  </span>
);

/** Alias — `<Chip>` and `<Pill>` are the same primitive. */
export const Chip = Pill;
