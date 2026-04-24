"use client";

import React from "react";
import { Column, Text, Grid } from "@/components/OnceUI";
import { Bookmark, MapPin, PlayCircle, FileText, Star } from "lucide-react";
import { apiGet } from "@/lib/api";
import { tokens } from "@/styles/tokens";
import { GlassCard } from "@/components/primitives";

const FALLBACK_AVATAR = "https://api.dicebear.com/7.x/notionists/svg?seed=default";
const FALLBACK_IMG = "https://images.unsplash.com/photo-1544025162-d76694265947?w=520&h=360&fit=crop";

interface BookmarksTabProps {
  onItemClick?: (item: any) => void;
}

export const BookmarksTab: React.FC<BookmarksTabProps> = ({ onItemClick }) => {
  const [bookmarks, setBookmarks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const res: any = await apiGet("/api/v1/bookmarks?limit=50");
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              height: "220px",
              borderRadius: "20px",
              background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <Column
        fillWidth
        style={{
          gap: "20px",
          height: "400px",
          border: `1px solid #FFE8D6`,
          borderRadius: "32px",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFAF7",
        }}
      >
        <Bookmark size={48} color="#ff6b35" style={{ opacity: 0.15 }} />
        <Text style={{ color: "#8E8E93", fontWeight: 600, fontSize: "1rem" }}>
          Your Taste Vault is empty
        </Text>
        <Text style={{ color: "#C0C0C0", fontSize: "0.85rem" }}>
          Save spots, posts, or reels to see them here.
        </Text>
      </Column>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
      {bookmarks.map((bm) => {
        let title = "Unknown";
        let typLabel = "Other";
        let TypeIcon = Bookmark;
        let img = FALLBACK_IMG;
        let subtitle = "";
        let rating = 0;
        let authorName: string | undefined;
        let authorAvatar: string | undefined;

        if (bm.location) {
          title = bm.location.name;
          typLabel = "Location";
          TypeIcon = MapPin;
          img = bm.location.image_url || img;
          subtitle = `${bm.location.category || "Food"} • ${bm.location.price_range || "$$"}`;
          rating = bm.location.rating || 0;
        } else if (bm.post) {
          title = bm.post.spot_name || "Saved Post";
          typLabel = "Post";
          TypeIcon = FileText;
          img = bm.post.image_url || img;
          subtitle = bm.post.review || "Foodie Feed • Review";
          authorName = bm.post.author_name;
          authorAvatar = bm.post.author_avatar;
        } else if (bm.reel) {
          title = bm.reel.title || "Saved Reel";
          typLabel = "Reel";
          TypeIcon = PlayCircle;
          img = bm.reel.thumbnail_url || img;
          subtitle = "Discover • Video";
          authorName = bm.reel.author_name;
          authorAvatar = bm.reel.author_avatar;
        }

        return (
          <div
            key={bm.id}
            onClick={() => onItemClick?.(bm)}
            style={{
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
              backgroundColor: "#fff",
              border: "1px solid #F0EBE3",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)";
            }}
          >
            {/* Image */}
            <div style={{ position: "relative", width: "100%", height: "160px" }}>
              <img
                src={img}
                alt={title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Gradient */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 55%)",
                  pointerEvents: "none",
                }}
              />
              {/* Author chip — top left */}
              {authorName && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px 4px 4px",
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
                    maxWidth: "72%",
                  }}
                >
                  <img
                    src={authorAvatar || FALLBACK_AVATAR}
                    alt={authorName}
                    style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#1A1A1A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {authorName}
                  </span>
                </div>
              )}
              {/* Type badge — top right */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px",
                  borderRadius: 8,
                  backgroundColor: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <TypeIcon size={10} color="#ff6b35" />
                <span style={{ fontSize: 9, fontWeight: 700, color: "#ff6b35", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {typLabel}
                </span>
              </div>
            </div>

            {/* Text */}
            <div style={{ padding: "14px 16px" }}>
              <p style={{
                margin: 0,
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#1A1A1A",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {title}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                <p style={{
                  margin: 0,
                  fontSize: "0.78rem",
                  color: "#8E8E93",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flex: 1,
                  paddingRight: 8,
                }}>
                  {subtitle}
                </p>
                {rating > 0 && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                    <Star size={11} color="#F59E0B" fill="#F59E0B" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B" }}>
                      {rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
