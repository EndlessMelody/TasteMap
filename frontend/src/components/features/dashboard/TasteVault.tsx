"use client";

import React, { useRef } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

import { DiscoverSection, GlassCard } from "@/components/primitives";
import { tokens } from "@/styles/tokens";
import { apiGet } from "@/lib/api";

import { VaultCardV2 } from "./vault";

// ─── Scroll controls ─────────────────────────────────────────────
const ScrollControls: React.FC<{
  onScrollLeft: () => void;
  onScrollRight: () => void;
}> = ({ onScrollLeft, onScrollRight }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: tokens.space[2],
    }}
  >
    <button
      type="button"
      onClick={onScrollLeft}
      aria-label="Scroll left"
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
    >
      <ChevronLeft size={18} strokeWidth={2.4} />
    </button>
    <button
      type="button"
      onClick={onScrollRight}
      aria-label="Scroll right"
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
    >
      <ChevronRight size={18} strokeWidth={2.4} />
    </button>
  </div>
);

// ─── Skeletons ───────────────────────────────────────────────────
const VaultSkeleton: React.FC = () => (
  <div
    style={{
      flexShrink: 0,
      width: 260,
      minWidth: 260,
      height: 210,
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

import { PostData, ReelData } from "@/types/dashboard";

// ─── Main component ──────────────────────────────────────────────
interface TasteVaultProps {
  onPostClick?: (post: PostData) => void;
  onReelClick?: (reel: ReelData) => void;
}

export const TasteVault: React.FC<TasteVaultProps> = ({ onPostClick, onReelClick }) => {
  const vaultRef = useRef<HTMLDivElement>(null);
  const [bookmarks, setBookmarks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchBookmarks = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await apiGet("/api/v1/bookmarks?limit=50");
      setBookmarks(res.items || []);
    } catch (err: any) {
      setError(err.message || "Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const scrollVault = (direction: "left" | "right") => {
    if (vaultRef.current) {
      vaultRef.current.scrollBy({
        left: direction === "left" ? -350 : 350,
        behavior: "smooth",
      });
    }
  };

  const subtitle = loading
    ? "Fetching your saved items…"
    : error
      ? "Couldn't reach the vault"
      : bookmarks.length > 0
        ? `Your curated collection · ${bookmarks.length} items`
        : "Your vault is empty — save locations, posts, or reels to see them here";

  return (
    <DiscoverSection
      eyebrow="Collection"
      title="The Taste Vault"
      subtitle={subtitle}
      icon={<Bookmark size={18} />}
      accent={tokens.color.warning}
      action={
        <ScrollControls
          onScrollLeft={() => scrollVault("left")}
          onScrollRight={() => scrollVault("right")}
        />
      }
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            gap: tokens.space[3],
            overflowX: "auto",
            paddingBottom: 4,
          }}
          className="no-scrollbar"
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <VaultSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <InlineNotice
          icon={<AlertTriangle size={18} strokeWidth={2.2} />}
          title="Couldn't load the vault"
          message={error}
          tone="danger"
        />
      ) : bookmarks.length === 0 ? (
        <InlineNotice
          icon={<Bookmark size={18} strokeWidth={2.2} />}
          title="Your vault is empty"
          message="Save interesting food spots, posts, or reels to your collection."
        />
      ) : (
        <div
          ref={vaultRef}
          style={{
            display: "flex",
            gap: tokens.space[3],
            overflowX: "auto",
            paddingBottom: 4,
          }}
          className="no-scrollbar"
        >
          {bookmarks.map((bm, i) => {
            let cardData: {
              title: string;
              xp: string;
              img: string;
              tags: string;
              rating: number;
              authorName?: string;
              authorAvatar?: string;
              authorSub?: string;
            } = {
              title: "Unknown",
              xp: "0XP",
              img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=520&h=360&fit=crop",
              tags: "Saved Item",
              rating: 0
            };

            if (bm.location) {
              cardData = {
                title: bm.location.name,
                xp: `${bm.xp_earned || 0}XP`,
                img: bm.location.image_url || cardData.img,
                tags: `${bm.location.category || "Food"} • ${bm.location.price_range || "$$"}`,
                rating: bm.location.rating || 0
              };
            } else if (bm.post) {
              cardData = {
                title: bm.post.spot_name || "Saved Post",
                xp: "Saved",
                img: bm.post.image_url || cardData.img,
                tags: bm.post.review || "Foodie Feed • Review",
                rating: 0,
                authorName: bm.post.author_name,
                authorAvatar: bm.post.author_avatar,
                authorSub: `@${bm.post.author_username || "foodie"}`,
              };
            } else if (bm.reel) {
              cardData = {
                title: bm.reel.title || "Saved Reel",
                xp: "Saved",
                img: bm.reel.thumbnail_url || cardData.img,
                tags: "Discover • Video",
                rating: 0,
                authorName: bm.reel.author_name,
                authorAvatar: bm.reel.author_avatar,
                authorSub: `@${bm.reel.author_username || "foodie"}`,
              };
            }

            const handleCardClick = () => {
              if (bm.post && onPostClick) {
                onPostClick({
                  id: bm.post.id,
                  name: bm.post.author_name || "User",
                  avatar: bm.post.author_avatar || "",
                  time: bm.post.created_at || "",
                  location: bm.post.location_name || "",
                  spotName: bm.post.spot_name || "Unknown Spot",
                  rating: bm.post.rating || 0,
                  review: bm.post.review || "",
                  img: bm.post.image_url || cardData.img,
                  tags: bm.post.tags || [],
                  likes: bm.post.likes_count || 0,
                  comments: bm.post.comments_count || 0,
                  isLiked: bm.post.is_liked,
                  isSaved: true,
                });
              } else if (bm.reel && onReelClick) {
                onReelClick({
                  id: bm.reel.id,
                  title: bm.reel.title || "",
                  user: bm.reel.author_name || "User",
                  views: bm.reel.views_count?.toString() || "0",
                  userAvatar: bm.reel.author_avatar || "",
                  img: bm.reel.thumbnail_url || cardData.img,
                  videoUrl: bm.reel.video_url,
                  likes: bm.reel.likes_count,
                  comments: bm.reel.comments_count,
                  isLiked: bm.reel.is_liked,
                  isSaved: true,
                });
              }
            };

            return (
              <VaultCardV2
                key={bm.id}
                title={cardData.title}
                xp={cardData.xp}
                img={cardData.img}
                tags={cardData.tags}
                rating={cardData.rating}
                index={i}
                authorName={cardData.authorName}
                authorAvatar={cardData.authorAvatar}
                authorSub={cardData.authorSub}
                onClick={handleCardClick}
              />
            );
          })}
        </div>
      )}
    </DiscoverSection>
  );
};
