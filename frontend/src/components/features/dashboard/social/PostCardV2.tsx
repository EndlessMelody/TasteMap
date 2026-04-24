"use client";

/**
 * PostCardV2 — Discover v4
 * ─────────────────────────────────────────────────────────────────
 * Editorial post card for the FoodieFeed 2-column grid.
 * Vertical layout: image on top, content below with action bar.
 *
 *   ┌─────────────────────────────────┐
 *   │   [image banner, 160px]         │
 *   │   ┌─────────┐         ┌──────┐ │
 *   │   │ @user   │         │ ★4.8 │ │
 *   │   └─────────┘         └──────┘ │
 *   ├─────────────────────────────────┤
 *   │ 📍 Spot Name                    │
 *   │ Review truncated to 3 lines…    │
 *   │ #tag #tag #tag                  │
 *   │ ─────────────────────────────── │
 *   │ ❤ 24    💬 8              🔖   │
 *   └─────────────────────────────────┘
 *
 * All colors come from design tokens. Replaces the legacy PostCard
 * (which used hardcoded hex values throughout).
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Star,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { BookmarkButton } from "@/components/common/BookmarkButton";
import { GlassCard } from "@/components/primitives";
import { tokens } from "@/styles/tokens";
import type { PostData } from "@/types/dashboard";

// ─── Fallback image ─────────────────────────────────────────────
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop";

export interface PostCardV2Props {
  post: PostData;
  /** Stagger index for enter animation */
  index?: number;
  onClick?: (post: PostData) => void;
  onToggleLike?: (id: number) => void;
}

export const PostCardV2: React.FC<PostCardV2Props> = ({
  post,
  index = 0,
  onClick,
  onToggleLike,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const img = post.img?.trim() !== "" ? post.img : FALLBACK_IMG;
  const isLiked = !!post.isLiked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ width: "100%" }}
    >
      <GlassCard
        variant="elevated"
        padding="none"
        radius="xl"
        fillWidth
        interactive
        onClick={() => onClick?.(post)}
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "transform 300ms var(--dsc-ease-out)",
        }}
      >
        {/* ── Image banner ── */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 160,
            overflow: "hidden",
            backgroundColor: tokens.color.surfaceMuted,
          }}
        >
          <img
            src={img}
            alt={post.spotName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 700ms var(--dsc-ease-out)",
            }}
          />

          {/* User chip — top-left */}
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
              maxWidth: "70%",
            }}
          >
            <img
              src={post.avatar}
              alt={post.name}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: tokens.type.weight.bold,
                  color: tokens.color.text,
                  letterSpacing: tokens.type.tracking.tight,
                  lineHeight: 1.15,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {post.name}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: tokens.type.weight.medium,
                  color: tokens.color.textMuted,
                  lineHeight: 1.15,
                }}
              >
                {post.time} · {post.location}
              </span>
            </div>
          </div>

          {/* Rating badge — top-right */}
          <div
            style={{
              position: "absolute",
              top: tokens.space[3],
              right: tokens.space[3],
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              paddingTop: 4,
              paddingBottom: 4,
              paddingLeft: tokens.space[2],
              paddingRight: tokens.space[2],
              borderRadius: tokens.radius.sm,
              backgroundColor: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: `1px solid rgba(255,255,255,0.6)`,
              fontSize: 11,
              fontWeight: tokens.type.weight.bold,
              color: tokens.color.warning,
            }}
          >
            <Star
              size={11}
              fill={tokens.color.warning}
              color={tokens.color.warning}
            />
            {post.rating.toFixed(1)}
          </div>
        </div>

        {/* ── Content ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space[3],
            padding: tokens.space[4],
          }}
        >
          {/* Spot name */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: tokens.space[2],
            }}
          >
            <MapPin
              size={13}
              color={tokens.color.textMuted}
              strokeWidth={2.2}
            />
            <span
              style={{
                fontSize: tokens.type.size.bodySm,
                fontWeight: tokens.type.weight.bold,
                color: tokens.color.text,
                letterSpacing: tokens.type.tracking.tight,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {post.spotName}
            </span>
          </div>

          {/* Review */}
          <motion.p
            layout
            style={{
              margin: 0,
              fontSize: tokens.type.size.bodySm,
              lineHeight: 1.5,
              color: tokens.color.text,
              ...(isExpanded
                ? {}
                : {
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden",
                  }),
            }}
          >
            {post.review}
          </motion.p>

          {/* Expand toggle — only if review is long enough */}
          {post.review && post.review.length > 120 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((v) => !v);
              }}
              style={{
                alignSelf: "flex-start",
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                padding: 0,
                border: "none",
                background: "transparent",
                color: tokens.color.warm,
                fontSize: tokens.type.size.caption,
                fontWeight: tokens.type.weight.bold,
                letterSpacing: tokens.type.tracking.normal,
                cursor: "pointer",
              }}
            >
              {isExpanded ? "Show less" : "Read more"}
              {isExpanded ? (
                <ChevronUp size={12} strokeWidth={2.4} />
              ) : (
                <ChevronDown size={12} strokeWidth={2.4} />
              )}
            </button>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: tokens.space[2],
              }}
            >
              {post.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    paddingTop: 3,
                    paddingBottom: 3,
                    paddingLeft: tokens.space[2],
                    paddingRight: tokens.space[2],
                    borderRadius: tokens.radius.sm,
                    backgroundColor: tokens.color.surfaceMuted,
                    border: `1px solid ${tokens.color.border}`,
                    fontSize: 10,
                    fontWeight: tokens.type.weight.semibold,
                    color: tokens.color.textMuted,
                    letterSpacing: tokens.type.tracking.normal,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: tokens.space[3],
              paddingTop: tokens.space[3],
              borderTop: `1px solid ${tokens.color.border}`,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: tokens.space[4],
              }}
            >
              {/* Like */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLike?.(post.id);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: tokens.space[2],
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: isLiked ? tokens.color.danger : tokens.color.textMuted,
                  fontSize: tokens.type.size.caption,
                  fontWeight: tokens.type.weight.bold,
                  transition: "color 150ms var(--dsc-ease-out)",
                }}
              >
                <motion.span
                  animate={isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  style={{ display: "inline-flex" }}
                >
                  <Heart
                    size={16}
                    strokeWidth={2.4}
                    color={
                      isLiked ? tokens.color.danger : tokens.color.textMuted
                    }
                    fill={isLiked ? tokens.color.danger : "none"}
                  />
                </motion.span>
                {post.likes || 0}
              </button>

              {/* Comment */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: tokens.space[2],
                  color: tokens.color.textMuted,
                  fontSize: tokens.type.size.caption,
                  fontWeight: tokens.type.weight.bold,
                }}
              >
                <MessageCircle size={16} strokeWidth={2.4} />
                {post.comments || 0}
              </div>
            </div>

            {/* Save */}
            <BookmarkButton
              entityType="post"
              entityId={post.id}
              isBookmarked={post.isSaved ?? false}
              size={30}
              iconSize={16}
            />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
