"use client";

import React from "react";
import { Bookmark, MapPin, PlayCircle, FileText, Star } from "lucide-react";
import {
  Card,
  Body,
  BodySm,
  Caption,
  Pill,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { apiGet } from "@/lib/api";

const FALLBACK_AVATAR =
  "https://api.dicebear.com/7.x/notionists/svg?seed=default";
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=520&h=360&fit=crop";

interface BookmarkPost {
  spot_name?: string;
  image_url?: string;
  review?: string;
  author_name?: string;
  author_avatar?: string;
}

interface BookmarkReel {
  title?: string;
  thumbnail_url?: string;
  author_name?: string;
  author_avatar?: string;
}

interface BookmarkLocation {
  name: string;
  category?: string;
  price_range?: string;
  rating?: number;
  image_url?: string;
}

export interface BookmarkRecord {
  id: number;
  location?: BookmarkLocation;
  post?: BookmarkPost;
  reel?: BookmarkReel;
}

interface BookmarksTabProps {
  onItemClick?: (item: BookmarkRecord) => void;
}

export const BookmarksTab: React.FC<BookmarksTabProps> = ({ onItemClick }) => {
  const [bookmarks, setBookmarks] = React.useState<BookmarkRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const res = await apiGet<{ items: BookmarkRecord[] }>(
          "/api/v1/bookmarks?limit=50",
        );
        setBookmarks(res.items || []);
      } catch (err) {
        console.error("Failed to fetch bookmarks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: tokens.space[5],
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} height={220} radius="lg" />
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <Card radius="xl" padding="lg" shadow="none" surface="muted">
        <EmptyState
          icon={<Bookmark size={32} strokeWidth={1.5} />}
          title="Your Taste Vault is empty"
          description="Save spots, posts, or reels to see them here."
        />
      </Card>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: tokens.space[5],
      }}
    >
      {bookmarks.map((bm) => {
        let title = "Unknown";
        let typeLabel = "Other";
        let TypeIcon = Bookmark;
        let img = FALLBACK_IMG;
        let subtitle = "";
        let rating = 0;
        let authorName: string | undefined;
        let authorAvatar: string | undefined;

        if (bm.location) {
          title = bm.location.name;
          typeLabel = "Location";
          TypeIcon = MapPin;
          img = bm.location.image_url || img;
          subtitle = `${bm.location.category || "Food"} · ${bm.location.price_range || "$$"}`;
          rating = bm.location.rating || 0;
        } else if (bm.post) {
          title = bm.post.spot_name || "Saved Post";
          typeLabel = "Post";
          TypeIcon = FileText;
          img = bm.post.image_url || img;
          subtitle = bm.post.review || "Foodie Feed · Review";
          authorName = bm.post.author_name;
          authorAvatar = bm.post.author_avatar;
        } else if (bm.reel) {
          title = bm.reel.title || "Saved Reel";
          typeLabel = "Reel";
          TypeIcon = PlayCircle;
          img = bm.reel.thumbnail_url || img;
          subtitle = "Discover · Video";
          authorName = bm.reel.author_name;
          authorAvatar = bm.reel.author_avatar;
        }

        return (
          <Card
            key={bm.id}
            radius="lg"
            padding="none"
            shadow="sm"
            interactive
            onClick={() => onItemClick?.(bm)}
            style={{ cursor: "pointer", overflow: "hidden" }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 160,
              }}
            >
              <img
                src={img}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to bottom, rgba(10,10,10,0.18) 0%, transparent 55%)",
                  pointerEvents: "none",
                }}
              />
              {authorName && (
                <div
                  style={{
                    position: "absolute",
                    top: tokens.space[2],
                    left: tokens.space[2],
                    display: "inline-flex",
                    alignItems: "center",
                    gap: tokens.space[1],
                    padding: `4px 10px 4px 4px`,
                    borderRadius: tokens.radius.pill,
                    background: "rgba(255, 255, 255, 0.92)",
                    backdropFilter: "blur(10px)",
                    boxShadow: tokens.shadow.sm,
                    maxWidth: "72%",
                  }}
                >
                  <img
                    src={authorAvatar || FALLBACK_AVATAR}
                    alt=""
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                  <Caption>{authorName}</Caption>
                </div>
              )}
              <div
                style={{
                  position: "absolute",
                  top: tokens.space[2],
                  right: tokens.space[2],
                }}
              >
                <Pill
                  tone="neutral"
                  size="sm"
                  leftIcon={<TypeIcon size={10} strokeWidth={1.75} />}
                  style={{
                    background: "rgba(255, 255, 255, 0.92)",
                    color: tokens.color.text,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {typeLabel}
                </Pill>
              </div>
            </div>

            <div
              style={{
                padding: tokens.space[4],
                display: "flex",
                flexDirection: "column",
                gap: tokens.space[1],
              }}
            >
              <Body
                style={{
                  fontWeight: tokens.type.weight.semibold,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {title}
              </Body>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: tokens.space[2],
                }}
              >
                <BodySm
                  tone="muted"
                  style={{
                    flex: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {subtitle}
                </BodySm>
                {rating > 0 && (
                  <Pill tone="warning" size="sm" leftIcon={<Star size={10} fill="currentColor" />}>
                    {rating.toFixed(1)}
                  </Pill>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default BookmarksTab;
