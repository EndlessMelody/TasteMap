"use client";

import React, { HTMLAttributes, ReactNode } from "react";
import { Column, Row } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";
import { cn } from "@/lib/cn";
import { Eyebrow, H2, Body } from "./typography";

interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Slot for actions in the section header (e.g., "See all" link). */
  actions?: ReactNode;
  /** Vertical spacing between sections — default `space[10]` (40px). */
  gap?: keyof typeof tokens.space;
}

/**
 * <Section>
 * Vertical rhythm primitive. Wraps a content block with an optional
 * eyebrow + title + description + actions header.
 */
export const Section = ({
  eyebrow,
  title,
  description,
  actions,
  gap = 10,
  className,
  style,
  children,
  ...props
}: SectionProps) => (
  <Column
    as="section"
    className={cn("ui-section", className)}
    style={{
      gap: tokens.space[5],
      marginBottom: tokens.space[gap],
      ...style,
    }}
    {...props}
  >
    {(eyebrow || title || description || actions) && (
      <Row as="header" horizontal="between" vertical="end" style={{ gap: tokens.space[4] }}>
        <Column style={{ gap: tokens.space[1] }}>
          {eyebrow && <Eyebrow tone="muted">{eyebrow}</Eyebrow>}
          {title && <H2>{title}</H2>}
          {description && <Body tone="muted">{description}</Body>}
        </Column>
        {actions && <Row style={{ flexShrink: 0 }}>{actions}</Row>}
      </Row>
    )}
    {children}
  </Column>
);
