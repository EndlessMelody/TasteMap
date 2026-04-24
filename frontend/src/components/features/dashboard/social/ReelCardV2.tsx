"use client";

/**
 * ReelCardV2 — Discover v4
 * ─────────────────────────────────────────────────────────────────
 * Cinematic, vertically-oriented reel card used in TrendingReels.
 * Full-bleed thumbnail with a bottom gradient for title/author legibility
 * and a pulsing play button at center. Top-right shows glass-styled view
 * count; top-left optionally shows a rank badge for top-3 trending reels.
 *
 *   ┌─────────────┐
 *   │ [#1]  👁 4.2K│
 *   │             │
 *   │   [▶ pulse] │
 *   │             │
 *   │ title…      │
 *   │ @user       │
 *   └─────────────┘
 */
import React from "react";
import { motion } from "framer-motion";
import { Eye, Play, Flame } from "lucide-react";

import { BookmarkButton } from "@/components/common/BookmarkButton";
import { tokens } from "@/styles/tokens";
import type { ReelData } from "@/types/dashboard";

export interface ReelCardV2Props {
  reel: ReelData;
  /** Rank in the trending list (1-based). Shows medal badge for 1–3. */
  rank?: number;
  /** Stagger index for enter animation */
  index?: number;
  onClick?: (reel: ReelData) => void;
}

export const ReelCardV2: React.FC<ReelCardV2Props> = ({
  reel,
  rank,
  index = 0,
  onClick,
}) => {
  const showRank = rank !== undefined && rank >= 1 && rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      onClick={() => onClick?.(reel)}
      style={{
        position: "relative",
        flexShrink: 0,
        width: 180,
        minWidth: 180,
        height: 260,
        borderRadius: tokens.radius.xl,
        overflow: "hidden",
        cursor: "pointer",
        backgroundColor: tokens.color.surfaceMuted,
        border: `1px solid ${tokens.color.border}`,
        boxShadow: tokens.shadow.sm,
      }}
      className="group"
    >
      {/* ── Background image ── */}
      <motion.img
        src={reel.img}
        alt={reel.title}
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="transition-transform duration-700 ease-out group-hover:scale-110"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />

      {/* ── Dark gradient for bottom text legibility ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.85) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Rank badge (top-left, 1–3 only) ── */}
      {showRank && (
        <div
          style={{
            position: "absolute",
            top: tokens.space[3],
            left: tokens.space[3],
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: tokens.space[2],
            paddingRight: tokens.space[3],
            borderRadius: tokens.radius.pill,
            backgroundImage: `linear-gradient(135deg, ${tokens.color.warm}, ${tokens.color.danger})`,
            color: tokens.color.textInverse,
            fontSize: 10,
            fontWeight: tokens.type.weight.bold,
            letterSpacing: tokens.type.tracking.wide,
            textTransform: "uppercase",
            boxShadow: tokens.shadow.md,
          }}
        >
          <Flame size={10} strokeWidth={2.6} />#{rank}
        </div>
      )}

      {/* ── Views badge (top-right) ── */}
      <div
        style={{
          position: "absolute",
          top: tokens.space[3],
          right: tokens.space[3],
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        <BookmarkButton
          entityType="reel"
          entityId={reel.id}
          isBookmarked={reel.isSaved ?? false}
          size={32}
          iconSize={16}
          inactiveColor="rgba(255,255,255,0.78)"
          style={{
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        />
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: tokens.space[2],
            paddingRight: tokens.space[2],
            borderRadius: tokens.radius.sm,
            backgroundColor: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: `1px solid rgba(255,255,255,0.12)`,
            color: "#fff",
            fontSize: 10,
            fontWeight: tokens.type.weight.bold,
            letterSpacing: tokens.type.tracking.normal,
          }}
        >
          <Eye size={10} strokeWidth={2.4} />
          {reel.views}
        </div>
      </div>

      {/* ── Pulsing play button (center) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{
            repeat: Infinity,
            duration: 2.4,
            ease: "easeInOut",
          }}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid rgba(255,255,255,0.6)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 20px rgba(0,0,0,0.35)`,
          }}
        >
          <Play
            size={18}
            color={tokens.color.warm}
            fill={tokens.color.warm}
            style={{ marginLeft: 2 }}
          />
        </motion.div>
      </div>

      {/* ── Bottom text panel ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: tokens.space[3],
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <span
          style={{
            color: "#fff",
            fontSize: tokens.type.size.bodySm,
            fontWeight: tokens.type.weight.bold,
            lineHeight: 1.25,
            letterSpacing: tokens.type.tracking.tight,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}
        >
          {reel.title}
        </span>
        <span
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 10,
            fontWeight: tokens.type.weight.medium,
            letterSpacing: tokens.type.tracking.normal,
          }}
        >
          {reel.user}
        </span>
      </div>
    </motion.div>
  );
};
