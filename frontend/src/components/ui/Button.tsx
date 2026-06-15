"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { Button as CoreButton, IconButton as CoreIconButton, Row } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "magic" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_MAP: Record<ButtonVariant, "primary" | "secondary" | "tertiary" | "danger"> = {
  primary: "primary",
  secondary: "secondary",
  ghost: "tertiary",
  magic: "primary",
  danger: "danger",
};

const ICON_VARIANT_MAP: Record<ButtonVariant, "primary" | "secondary" | "tertiary" | "danger" | "ghost"> = {
  primary: "primary",
  secondary: "secondary",
  ghost: "ghost",
  magic: "primary",
  danger: "danger",
};

const SIZE_MAP: Record<ButtonSize, "s" | "m" | "l"> = {
  sm: "s",
  md: "m",
  lg: "l",
};

const MAGIC_STYLE: React.CSSProperties = {
  background: tokens.gradient.signature,
  border: "none",
};

interface CommonButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, CommonButtonProps {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * <Button>
 * Thin wrapper around the real OnceUI Button preserving TasteMap's
 * variant/size vocabulary (primary/secondary/ghost/magic/danger, sm/md/lg).
 */
export const Button = ({
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  leftIcon,
  rightIcon,
  className,
  children,
  style,
  type,
  ...props
}: ButtonProps) => (
  <CoreButton
    type={type ?? "button"}
    variant={VARIANT_MAP[variant]}
    size={SIZE_MAP[size]}
    fillWidth={fullWidth}
    loading={loading}
    className={className}
    style={variant === "magic" ? { ...MAGIC_STYLE, ...style } : style}
    {...props}
  >
    {leftIcon || rightIcon ? (
      <Row gap="8" vertical="center">
        {leftIcon}
        {children}
        {rightIcon}
      </Row>
    ) : (
      children
    )}
  </CoreButton>
);

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, CommonButtonProps {
  icon: ReactNode;
  /** Required for a11y when there's no text. */
  "aria-label": string;
}

/**
 * <IconButton>
 * Square icon-only button. Same variant/size vocabulary as <Button>.
 */
export const IconButton = ({
  variant = "ghost",
  size = "md",
  icon,
  loading,
  className,
  style,
  type,
  ...props
}: IconButtonProps) => (
  <CoreIconButton
    type={type ?? "button"}
    variant={ICON_VARIANT_MAP[variant]}
    size={SIZE_MAP[size]}
    loading={loading}
    className={className}
    style={variant === "magic" ? { ...MAGIC_STYLE, ...style } : style}
    {...props}
  >
    {icon}
  </CoreIconButton>
);
