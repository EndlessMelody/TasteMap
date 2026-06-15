"use client";

import React, { HTMLAttributes, ReactNode } from "react";
import { Column, Row } from "@once-ui-system/core";
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
  <Column
    horizontal="center"
    align="center"
    className={cn("ui-empty", className)}
    style={{
      gap: tokens.space[4],
      padding: compact ? tokens.space[6] : tokens.space[12],
      ...style,
    }}
    {...props}
  >
    {icon && (
      <Row
        horizontal="center"
        vertical="center"
        style={{
          width: compact ? 48 : 64,
          height: compact ? 48 : 64,
          borderRadius: tokens.radius.pill,
          background: tokens.color.surfaceMuted,
          color: tokens.color.textMuted,
        }}
      >
        {icon}
      </Row>
    )}
    <Column style={{ gap: tokens.space[2], maxWidth: "420px" }}>
      <H3>{title}</H3>
      {description && <Body tone="muted">{description}</Body>}
    </Column>
    {action && <Row style={{ marginTop: tokens.space[2] }}>{action}</Row>}
  </Column>
);
