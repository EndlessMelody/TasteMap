"use client";

/**
 * AIPickHeroCard — Discover v3
 * ─────────────────────────────────────────────────────────────────
 * The featured AI pick card. Lives in the left 2fr cell of the
 * AIPicksSection grid.
 *
 * Anatomy:
 *   ┌───────────────────────────────────────┐
 *   │                             ┌───────┐ │
 *   │        [hero image]         │ 92    │ │  ← MatchRing (lg)
 *   │                             │ Match │ │
 *   │                             └───────┘ │
 *   │   [editorial gradient]                │
 *   ├───────────────────────────────────────┤
 *   │  ✨ Because you liked Street Food     │
 *   │  Title of the place                   │
 *   │  $$ · 1.2km · open now                │
 *   │                         [Open  →]     │
 *   └───────────────────────────────────────┘
 */
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

import { GlassCard, MatchRing } from "@/components/primitives";
import { tokens } from "@/styles/tokens";
import { lift } from "@/lib/motion";
import type { Recommendation } from "@/hooks/useRecommendations";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=720&fit=crop";

export interface AIPickHeroCardProps {
  pick: Recommendation;
  /** Trait name used to build the "Because you liked …" reasoning */
  reasoningTrait?: string | null;
}

export const AIPickHeroCard: React.FC<AIPickHeroCardProps> = ({
  pick,
  reasoningTrait,
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
    <GlassCard
      variant="elevated"
      padding="none"
      radius="xl"
      fillWidth
      interactive
      onClick={() => router.push("/tour-builder")}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 330,
      }}
      {...lift}
    >
      {/* ── Image panel ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 180,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <motion.img
          src={img}
          alt={pick.name}
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        {/* bottom gradient for title legibility if we ever overlay text */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.25) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Match ring */}
        <div
          style={{
            position: "absolute",
            top: tokens.space[4],
            right: tokens.space[4],
            padding: tokens.space[2],
            borderRadius: tokens.radius.lg,
            backgroundColor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            border: `1px solid rgba(255,255,255,0.4)`,
            boxShadow: tokens.shadow.md,
          }}
        >
          <MatchRing value={matchPct} size="lg" label="Match" />
        </div>
      </div>

      {/* ── Body ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: tokens.space[3],
          padding: tokens.space[5],
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Reasoning eyebrow */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: tokens.space[2],
          }}
        >
          <Sparkles size={13} color={tokens.color.magic} strokeWidth={2.4} />
          <span
            style={{
              fontSize: tokens.type.size.caption,
              fontWeight: tokens.type.weight.bold,
              letterSpacing: tokens.type.tracking.wide,
              textTransform: "uppercase",
              color: tokens.color.magic,
            }}
          >
            {reasoningTrait
              ? `Because you liked ${reasoningTrait}`
              : "Curated for you"}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: tokens.type.size.h2,
            fontWeight: tokens.type.weight.bold,
            letterSpacing: tokens.type.tracking.tight,
            color: tokens.color.text,
            margin: 0,
            lineHeight: 1.2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {pick.name}
        </h3>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: tokens.space[3],
            marginTop: "auto",
            paddingTop: tokens.space[2],
          }}
        >
          <span
            style={{
              fontSize: tokens.type.size.bodySm,
              fontWeight: tokens.type.weight.semibold,
              color: tokens.color.textMuted,
            }}
          >
            {pick.price_range || "Open now"}
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: tokens.space[2],
              color: tokens.color.warm,
              fontSize: tokens.type.size.bodySm,
              fontWeight: tokens.type.weight.bold,
              letterSpacing: tokens.type.tracking.normal,
            }}
          >
            Open
            <ArrowRight size={14} strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </GlassCard>
  );
};
