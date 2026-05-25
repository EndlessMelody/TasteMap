"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "magic"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface CommonButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    CommonButtonProps {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * <Button>
 * Five variants — primary (warm), secondary (neutral), ghost (transparent),
 * magic (AI features only), danger (destructive only).
 * Sizes sm/md/lg. Styles live in ui.css under `.ui-btn`.
 */
export const Button = ({
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) => (
  <button
    type={props.type ?? "button"}
    className={cn(
      "ui-btn",
      `ui-btn--${variant}`,
      `ui-btn--${size}`,
      fullWidth && "ui-btn--full",
      loading && "ui-btn--loading",
      className,
    )}
    disabled={disabled || loading}
    {...props}
  >
    {leftIcon && <span className="ui-btn__icon">{leftIcon}</span>}
    <span className="ui-btn__label">{children}</span>
    {rightIcon && <span className="ui-btn__icon">{rightIcon}</span>}
  </button>
);

interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    CommonButtonProps {
  icon: ReactNode;
  /** Required for a11y when there's no text. */
  "aria-label": string;
}

/**
 * <IconButton>
 * Square icon-only button. Same variants as <Button>. Requires aria-label.
 */
export const IconButton = ({
  variant = "ghost",
  size = "md",
  icon,
  disabled,
  loading,
  className,
  ...props
}: IconButtonProps) => (
  <button
    type={props.type ?? "button"}
    className={cn(
      "ui-icon-btn",
      `ui-btn--${variant}`,
      `ui-icon-btn--${size}`,
      loading && "ui-btn--loading",
      className,
    )}
    disabled={disabled || loading}
    {...props}
  >
    {icon}
  </button>
);
