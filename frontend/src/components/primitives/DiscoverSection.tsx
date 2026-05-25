"use client";

/**
 * DiscoverSection — standardized section shell for the Discover page.
 * ─────────────────────────────────────────────────────────────────
 * Every Discover section should use this to guarantee consistent:
 *   - Header layout (eyebrow, title, subtitle, right-action slot)
 *   - Typography hierarchy (via design tokens)
 *   - Scroll-reveal animation (fadeUp)
 *   - Vertical rhythm (spacing between header & body)
 *
 * Example:
 *   <DiscoverSection
 *     eyebrow="For you"
 *     title="Get ready for your tour"
 *     subtitle="AI-curated picks based on your taste signature"
 *     action={<button>View all</button>}
 *     icon={<Sparkles size={18} />}
 *   >
 *     <MyCarousel />
 *   </DiscoverSection>
 */
import React from "react";
import { motion } from "framer-motion";
import { tokens } from "@/styles/tokens";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { H2, BodySm, Caption } from "@/components/ui";

export interface DiscoverSectionProps {
  /** Small uppercase label above the title (e.g., "FOR YOU") */
  eyebrow?: string;
  /** Main section heading */
  title: string;
  /** Optional one-line subtitle under the title */
  subtitle?: string;
  /** Optional icon rendered before the title */
  icon?: React.ReactNode;
  /** Right-aligned action (button, link, refresh, etc.) */
  action?: React.ReactNode;
  /** Accent color for eyebrow + icon — defaults to warm */
  accent?: string;
  /** Body content */
  children: React.ReactNode;
  /** Disable the scroll-reveal animation (useful inside already-animated parents) */
  noReveal?: boolean;
}

export const DiscoverSection: React.FC<DiscoverSectionProps> = ({
  eyebrow,
  title,
  subtitle,
  icon,
  action,
  accent = tokens.color.warm,
  children,
  noReveal = false,
}) => {
  const Wrapper = noReveal ? "div" : motion.div;
  const wrapperProps = noReveal
    ? {}
    : {
        variants: fadeUp,
        initial: "hidden" as const,
        whileInView: "show" as const,
        viewport: viewportOnce,
      };

  return (
    <Wrapper
      {...wrapperProps}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: tokens.space[4],
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: tokens.space[4],
          width: "100%",
          paddingLeft: tokens.space[4],
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space[1],
            minWidth: 0,
            flex: 1,
          }}
        >
          {eyebrow && (
            <Caption style={{ color: accent }}>{eyebrow}</Caption>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space[3],
            }}
          >
            {icon && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: accent,
                  flexShrink: 0,
                }}
              >
                {icon}
              </span>
            )}
            <H2>{title}</H2>
          </div>

          {subtitle && <BodySm tone="muted">{subtitle}</BodySm>}
        </div>

        {action && (
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
            {action}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ width: "100%" }}>{children}</div>
    </Wrapper>
  );
};
