"use client";

import React, { HTMLAttributes } from "react";
import { Column } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";
import { cn } from "@/lib/cn";

interface PageProps extends HTMLAttributes<HTMLDivElement> {
  /** When true, removes the max-width container (full-bleed). */
  bleed?: boolean;
  /** Removes the default horizontal padding (rare — use for canvas pages). */
  flush?: boolean;
  /** Vertically + horizontally centers children (Auth/Status archetype). */
  center?: boolean;
}

/**
 * <Page>
 * The root wrapper for every route. One per page.
 * Sets the ivory background, centers content in a 1200px container,
 * and applies responsive horizontal padding.
 */
export const Page = ({
  bleed,
  flush,
  center,
  className,
  style,
  children,
  ...props
}: PageProps) => (
  <Column
    fillWidth
    className={cn("ui-page", className)}
    horizontal={center ? "center" : undefined}
    vertical={center ? "center" : undefined}
    style={{
      minHeight: "100vh",
      background: tokens.color.bg,
      color: tokens.color.text,
      ...(center && { padding: tokens.space[6] }),
      ...style,
    }}
    {...props}
  >
    {center ? (
      children
    ) : (
      <Column
        fillWidth
        style={{
          maxWidth: bleed ? "none" : "1200px",
          margin: "0 auto",
          paddingLeft: flush ? 0 : "var(--ui-page-px, 16px)",
          paddingRight: flush ? 0 : "var(--ui-page-px, 16px)",
          paddingTop: tokens.space[6],
          paddingBottom: tokens.space[12],
        }}
      >
        {children}
      </Column>
    )}
  </Column>
);
