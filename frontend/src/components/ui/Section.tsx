"use client";

import React, { HTMLAttributes, ReactNode } from "react";
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
  <section
    className={cn("ui-section", className)}
    style={{
      display: "flex",
      flexDirection: "column",
      gap: tokens.space[5],
      marginBottom: tokens.space[gap],
      ...style,
    }}
    {...props}
  >
    {(eyebrow || title || description || actions) && (
      <header
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: tokens.space[4],
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: tokens.space[1] }}>
          {eyebrow && <Eyebrow tone="muted">{eyebrow}</Eyebrow>}
          {title && <H2>{title}</H2>}
          {description && <Body tone="muted">{description}</Body>}
        </div>
        {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
      </header>
    )}
    {children}
  </section>
);
