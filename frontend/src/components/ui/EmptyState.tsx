"use client";

import React, { HTMLAttributes, ReactNode } from "react";
import { tokens } from "@/styles/tokens";
import { cn } from "@/lib/cn";
import { H3, Body } from "./typography";

interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Lucide icon node — rendered at 32px in a circular muted surface. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Action slot — typically one or two <Button>s. */
  action?: ReactNode;
  /** Compact variant for inline (in-list) empty states. */
  compact?: boolean;
}

/**
 * <EmptyState>
 * Used by every list when zero items. Hero icon + title + body + action.
 */
export const EmptyState = ({
  icon,
  title,
  description,
  action,
  compact,
  className,
  style,
  ...props
}: EmptyStateProps) => (
  <div
    className={cn("ui-empty", className)}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: tokens.space[4],
      padding: compact ? tokens.space[6] : tokens.space[12],
      ...style,
    }}
    {...props}
  >
    {icon && (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: compact ? 48 : 64,
          height: compact ? 48 : 64,
          borderRadius: tokens.radius.pill,
          background: tokens.color.surfaceMuted,
          color: tokens.color.textMuted,
        }}
      >
        {icon}
      </span>
    )}
    <div style={{ display: "flex", flexDirection: "column", gap: tokens.space[2], maxWidth: "420px" }}>
      <H3>{title}</H3>
      {description && <Body tone="muted">{description}</Body>}
    </div>
    {action && <div style={{ marginTop: tokens.space[2] }}>{action}</div>}
  </div>
);
