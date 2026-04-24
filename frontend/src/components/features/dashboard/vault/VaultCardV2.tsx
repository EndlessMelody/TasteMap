"use client";

/**
 * VaultCardV2 — Discover v5
 * ─────────────────────────────────────────────────────────────────
 * Collection card for TasteVault. Horizontal scroll friendly.
 * Highlights XP value with animated glow badge.
 * Shows author chip on top-left (like TasteMap Feed cards).
 *
 *   ┌─────────────────────┐
 *   │ @user     ✨ 85XP   │
 *   │                     │
 *   │ Title of spot       │
 *   │ Food • $$           │
 *   └─────────────────────┘
 */
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";

import { GlassCard } from "@/components/primitives";
import { tokens } from "@/styles/tokens";

export interface VaultCardV2Props {
  title: string;
  xp: string;
  img: string;
  tags: string;
  rating: number;
  index?: number;
  onClick?: () => void;
  // Author chip
  authorName?: string;
  authorAvatar?: string;
  authorSub?: string;
}

const FALLBACK_AVATAR = "https://api.dicebear.com/7.x/notionists/svg?seed=default";

export const VaultCardV2: React.FC<VaultCardV2Props> = ({
  title,
  xp,
  img,
  tags,
  rating,
  index = 0,
  onClick,
  authorName,
  authorAvatar,
  authorSub,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.05,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      style={{ flexShrink: 0, cursor: "pointer" }}
      onClick={onClick}
    >
      <GlassCard
        variant="elevated"
        padding="none"
        radius="xl"
        style={{
          width: 260,
          minWidth: 260,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Image area ── */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 150,
            overflow: "hidden",
            backgroundColor: tokens.color.surfaceMuted,
          }}
        >
          <img
            src={img}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 700ms var(--dsc-ease-out)",
            }}
          />

          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "60%",
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Author chip — top-left (like TasteMap Feed) */}
          {authorName && (
            <div
              style={{
                position: "absolute",
                top: tokens.space[3],
                left: tokens.space[3],
                display: "inline-flex",
                alignItems: "center",
                gap: tokens.space[2],
                paddingTop: 4,
                paddingBottom: 4,
                paddingLeft: 4,
                paddingRight: tokens.space[3],
                borderRadius: tokens.radius.pill,
                backgroundColor: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: `1px solid rgba(255,255,255,0.6)`,
                boxShadow: tokens.shadow.sm,
                maxWidth: "75%",
                zIndex: 3,
              }}
            >
              <img
                src={authorAvatar || FALLBACK_AVATAR}
                alt={authorName}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: tokens.type.weight.bold,
                    color: tokens.color.text,
                    letterSpacing: tokens.type.tracking.tight,
                    lineHeight: 1.15,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {authorName}
                </span>
                {authorSub && (
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: tokens.type.weight.medium,
                      color: tokens.color.textMuted,
                      lineHeight: 1.15,
                    }}
                  >
                    {authorSub}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* XP badge — top-right when author present, top-left otherwise */}
          <motion.div
            animate={{
              boxShadow: [
                `0 0 0px rgba(251,191,36,0)`,
                `0 0 14px rgba(251,191,36,0.55)`,
                `0 0 0px rgba(251,191,36,0)`,
              ],
            }}
            transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
            style={{
              position: "absolute",
              top: tokens.space[3],
              right: tokens.space[3],
              zIndex: 3,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              paddingTop: 4,
              paddingBottom: 4,
              paddingLeft: tokens.space[2],
              paddingRight: tokens.space[3],
              borderRadius: tokens.radius.sm,
              backgroundColor: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: `1px solid rgba(255,255,255,0.6)`,
            }}
          >
            <Sparkles
              size={10}
              color={tokens.color.warning}
              strokeWidth={2.4}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: tokens.type.weight.bold,
                color: tokens.color.warning,
              }}
            >
              {xp}
            </span>
          </motion.div>

          {/* Rating badge — only show if rating > 0 */}
          {rating > 0 && !authorName && (
            <div
              style={{
                position: "absolute",
                top: tokens.space[3],
                right: tokens.space[3],
                zIndex: 3,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                paddingTop: 4,
                paddingBottom: 4,
                paddingLeft: tokens.space[2],
                paddingRight: tokens.space[2],
                borderRadius: tokens.radius.sm,
                backgroundColor: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: `1px solid rgba(255,255,255,0.6)`,
              }}
            >
              <Star
                size={11}
                color={tokens.color.warning}
                fill={tokens.color.warning}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: tokens.type.weight.bold,
                  color: tokens.color.warning,
                }}
              >
                {rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* ── Text area ── */}
        <div
          style={{
            padding: tokens.space[4],
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <span
            style={{
              fontSize: tokens.type.size.body,
              fontWeight: tokens.type.weight.bold,
              color: tokens.color.text,
              letterSpacing: tokens.type.tracking.tight,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: tokens.type.size.caption,
              fontWeight: tokens.type.weight.medium,
              color: tokens.color.textMuted,
            }}
          >
            {tags}
          </span>
        </div>
      </GlassCard>
    </motion.div>
  );
};
