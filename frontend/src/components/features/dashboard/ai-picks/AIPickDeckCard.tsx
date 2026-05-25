"use client";

/**
 * AIPickDeckCard — Discover v3
 * ─────────────────────────────────────────────────────────────────
 * Compact horizontal pick card. Sits in the right column of the
 * AIPicksSection grid, stacked 3-at-a-time beside the hero card.
 *
 * Anatomy:
 *   ┌─────────────────────────────────────────────────┐
 *   │ ┌──────┐  Title of the place           ┌─────┐ │
 *   │ │      │  $$ · 1.2km                   │ 87  │ │  ← MatchRing sm
 *   │ │ img  │                               └─────┘ │
 *   │ └──────┘                                        │
 *   └─────────────────────────────────────────────────┘
 *
 * Hover: subtle surface tint + slide.
 */
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { GlassCard, MatchRing } from "@/components/primitives";
import { tokens } from "@/styles/tokens";
import type { Recommendation } from "@/hooks/useRecommendations";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop";

export interface AIPickDeckCardProps {
  pick: Recommendation;
  /** Index in the deck (0-based) — used for stagger animation */
  index?: number;
}

export const AIPickDeckCard: React.FC<AIPickDeckCardProps> = ({
  pick,
  index = 0,
}) => {
  const router = useRouter();

  const img =
    pick.image_url && pick.image_url.trim() !== ""
      ? pick.image_url
      : FALLBACK_IMG;

  const matchPct =
    pick.match_score > 1
      ? Math.round(pick.match_score)
      : Math.round(pick.match_score * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.07,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ width: "100%" }}
    >
      <GlassCard
        variant="elevated"
        padding="none"
        radius="lg"
        fillWidth
        interactive
        onClick={() => router.push("/tour-builder")}
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: tokens.space[3],
          padding: tokens.space[2],
          width: "100%",
        }}
      >
        {/* ── Thumbnail ── */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: tokens.radius.md,
            overflow: "hidden",
            flexShrink: 0,
            backgroundColor: tokens.color.surfaceMuted,
            position: "relative",
          }}
        >
          <img
            src={img}
            alt={pick.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        {/* ── Body ── */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: tokens.space[1],
            paddingTop: tokens.space[2],
            paddingBottom: tokens.space[2],
          }}
        >
          <span
            style={{
              fontSize: tokens.type.size.bodySm,
              fontWeight: tokens.type.weight.bold,
              color: tokens.color.text,
              letterSpacing: tokens.type.tracking.tight,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.25,
            }}
          >
            {pick.name}
          </span>
          <span
            style={{
              fontSize: tokens.type.size.caption,
              fontWeight: tokens.type.weight.medium,
              color: tokens.color.textMuted,
              lineHeight: 1.3,
            }}
          >
            {pick.price_range || "AI recommendation"}
          </span>
        </div>

        {/* ── Match ring ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingRight: tokens.space[3],
            flexShrink: 0,
          }}
        >
          <MatchRing value={matchPct} size="sm" />
        </div>
      </GlassCard>
    </motion.div>
  );
};
