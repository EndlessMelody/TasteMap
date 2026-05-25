"use client";

/**
 * FoodieFeed — Discover v4 (orchestrator)
 * ─────────────────────────────────────────────────────────────────
 * Composes Fold 5 — COMMUNITY:
 *
 *   ┌─ COMMUNITY · Foodie Feed ─────── [Filter]  [Local: Dĩ An] ─┐
 *   │  Reviews & stories from foodies near you                    │
 *   │  ─────────────────────────────────────────────────────────  │
 *   │  ┌───────────────┐  ┌───────────────┐                      │
 *   │  │ PostCardV2    │  │ PostCardV2    │                      │
 *   │  └───────────────┘  └───────────────┘                      │
 *   │  ┌───────────────┐  ┌───────────────┐                      │
 *   │  │ PostCardV2    │  │ PostCardV2    │                      │
 *   │  └───────────────┘  └───────────────┘                      │
 *   └───────────────────────────────────────────────────────────────┘
 *
 * Switched from horizontal scroll → 2-column editorial grid. Posts
 * are read-optimized content; grid layout is more scannable than a
 * scroller and shows more social activity per-fold.
 */
import React from "react";
import { SlidersHorizontal, MessageCircle, AlertTriangle, Zap } from "lucide-react";
import Link from "next/link";


import { DiscoverSection, GlassCard } from "@/components/primitives";
import { tokens } from "@/styles/tokens";
import { usePosts } from "@/hooks/usePosts";
import { useSocialStore } from "@/store/socialStore";
import { apiPost } from "@/lib/api";
import type { PostData } from "@/types/dashboard";

import { PostCardV2 } from "./social";

// ─── Props ───────────────────────────────────────────────────────
interface FoodieFeedProps {
  onPostClick: (post: PostData) => void;
  isLoading?: boolean;
}

// ─── Inline toolbar actions ──────────────────────────────────────
const FilterButton: React.FC = () => (
  <button
    type="button"
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.color.surfaceMuted,
      border: `1px solid ${tokens.color.border}`,
      color: tokens.color.textMuted,
      cursor: "pointer",
      transition: "background-color 150ms var(--dsc-ease-out)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = tokens.color.surfaceInset;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = tokens.color.surfaceMuted;
    }}
    aria-label="Filter feed"
  >
    <SlidersHorizontal size={14} strokeWidth={2.4} />
  </button>
);

const LocalPill: React.FC<{ location?: string }> = ({
  location = "Dĩ An",
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: tokens.space[2],
      paddingTop: 6,
      paddingBottom: 6,
      paddingLeft: tokens.space[3],
      paddingRight: tokens.space[3],
      borderRadius: tokens.radius.pill,
      backgroundColor: tokens.color.surfaceMuted,
      border: `1px solid ${tokens.color.border}`,
      color: tokens.color.text,
      fontSize: tokens.type.size.caption,
      fontWeight: tokens.type.weight.bold,
      letterSpacing: tokens.type.tracking.wide,
      textTransform: "uppercase",
    }}
  >
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        backgroundColor: tokens.color.success,
        boxShadow: `0 0 6px ${tokens.color.success}`,
      }}
    />
    Local · {location}
  </span>
);

const SurfingButton: React.FC = () => (
  <Link
    href="/feed"
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.space[2],
      paddingTop: 6,
      paddingBottom: 6,
      paddingLeft: tokens.space[4],
      paddingRight: tokens.space[4],
      borderRadius: tokens.radius.pill,
      backgroundColor: tokens.color.warm,
      border: `1px solid ${tokens.color.warm}`,
      color: "white",
      fontSize: tokens.type.size.caption,
      fontWeight: tokens.type.weight.bold,
      cursor: "pointer",
      textDecoration: "none",
      transition: "transform 150ms var(--dsc-ease-out), opacity 150ms",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-1px)";
      e.currentTarget.style.opacity = "0.9";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.opacity = "1";
    }}
  >
    <Zap size={13} fill="currentColor" />
    Lướt Ngay
  </Link>
);


// ─── Skeletons ───────────────────────────────────────────────────
const PostSkeleton: React.FC = () => (
  <div
    style={{
      width: "100%",
      height: 320,
      borderRadius: tokens.radius.xl,
      backgroundImage:
        "linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.07) 50%, rgba(0,0,0,0.04) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s ease-in-out infinite",
    }}
  />
);

// ─── Inline notice ───────────────────────────────────────────────
const InlineNotice: React.FC<{
  icon: React.ReactNode;
  title: string;
  message: string;
  tone?: "danger" | "muted";
}> = ({ icon, title, message, tone = "muted" }) => {
  const accent =
    tone === "danger" ? tokens.color.danger : tokens.color.textMuted;
  return (
    <GlassCard
      variant="flat"
      padding="lg"
      radius="lg"
      fillWidth
      style={{
        display: "flex",
        alignItems: "center",
        gap: tokens.space[4],
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: tokens.radius.md,
          backgroundColor: `${accent}14`,
          border: `1px solid ${accent}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: accent,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: tokens.type.size.bodySm,
            fontWeight: tokens.type.weight.bold,
            color: tokens.color.text,
            marginBottom: 2,
          }}
        >
          {title}
        </span>
        <span
          style={{
            display: "block",
            fontSize: tokens.type.size.caption,
            color: tokens.color.textMuted,
          }}
        >
          {message}
        </span>
      </div>
    </GlassCard>
  );
};

// ─── Grid wrapper ────────────────────────────────────────────────
const PostGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: tokens.space[4],
      width: "100%",
    }}
  >
    {children}
  </div>
);

// ─── Main component ──────────────────────────────────────────────
export const FoodieFeed: React.FC<FoodieFeedProps> = ({ onPostClick }) => {
  const { posts, loading, error } = usePosts(8);
  const updatePost = useSocialStore((state) => state.updatePost);

  const handleToggleLike = async (id: number) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    const newIsLiked = !post.isLiked;
    const newLikes = newIsLiked
      ? post.likes + 1
      : Math.max(0, post.likes - 1);
    // Optimistic update
    updatePost(id, { isLiked: newIsLiked, likes: newLikes });
    try {
      await apiPost(`/api/v1/posts/${id}/like`, {});
    } catch {
      // Revert on failure
      updatePost(id, { isLiked: post.isLiked, likes: post.likes });
    }
  };

  const subtitle = loading
    ? "Fetching the freshest reviews…"
    : error
      ? "Couldn't reach the community feed"
      : posts.length > 0
        ? `Reviews & stories from foodies near you · ${posts.length} posts`
        : "No posts yet — be the first to share a spot";

  const toolbar = (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: tokens.space[2],
      }}
    >
      <SurfingButton />
      <FilterButton />
      <LocalPill />
    </div>
  );

  return (
    <DiscoverSection
      eyebrow="Community"
      title="TasteMap Feed"
      subtitle={subtitle}
      icon={<MessageCircle size={18} />}
      accent={tokens.color.danger}
      action={toolbar}
    >
      {loading ? (
        <PostGrid>
          {[0, 1, 2, 3].map((i) => (
            <PostSkeleton key={i} />
          ))}
        </PostGrid>
      ) : error ? (
        <InlineNotice
          icon={<AlertTriangle size={18} strokeWidth={2.2} />}
          title="Couldn't load the feed"
          message={error}
          tone="danger"
        />
      ) : posts.length === 0 ? (
        <InlineNotice
          icon={<MessageCircle size={18} strokeWidth={2.2} />}
          title="The feed is quiet"
          message="Be the first foodie to drop a review."
        />
      ) : (
        <PostGrid>
          {posts.map((post, i) => (
            <PostCardV2
              key={post.id}
              post={post}
              index={i}
              onClick={onPostClick}
              onToggleLike={handleToggleLike}
            />
          ))}
        </PostGrid>
      )}
    </DiscoverSection>
  );
};
