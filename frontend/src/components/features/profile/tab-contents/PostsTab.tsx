"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ImageIcon,
  Utensils,
  MapPin,
  Star,
  Heart,
  MessageCircle,
} from "lucide-react";
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

export interface PostItem {
  id: number;
  user_id?: number;
  user?: {
    id: number;
    display_name?: string;
    avatar_url?: string;
    title?: string;
    level?: number;
    primary_badge?: {
      id: number;
      name: string;
      icon_name: string;
      accent_color: string;
    } | null;
  };
  location_id?: number;
  location?: {
    id: number;
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  review: string;
  rating?: number | null;
  image_url?: string | null;
  tags?: string[] | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at?: string;
  updated_at?: string;
}

interface PostsTabProps {
  postsLoading: boolean;
  userPosts: PostItem[];
  onPostClick?: (post: PostItem) => void;
}

export const PostsTab: React.FC<PostsTabProps> = ({
  postsLoading,
  userPosts,
  onPostClick,
}) => {
  if (postsLoading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: tokens.space[5],
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} radius="lg" padding="none" shadow="sm">
            <Skeleton width="100%" height={160} radius="sm" />
            <div
              style={{
                padding: tokens.space[4],
                display: "flex",
                flexDirection: "column",
                gap: tokens.space[2],
              }}
            >
              <Skeleton width="60%" height={14} />
              <Skeleton width="90%" height={12} />
              <Skeleton width="75%" height={12} />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (userPosts.length === 0) {
    return (
      <Card radius="xl" padding="lg" shadow="none" surface="muted">
        <EmptyState
          icon={<ImageIcon size={32} strokeWidth={1.5} />}
          title="No posts yet"
          description="Share your first culinary experience."
        />
      </Card>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: tokens.space[5],
      }}
    >
      {userPosts.map((post, idx) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card
            radius="lg"
            padding="none"
            shadow="sm"
            interactive
            onClick={() => onPostClick?.(post)}
            style={{ cursor: "pointer", overflow: "hidden" }}
          >
            {post.image_url ? (
              <div
                style={{
                  position: "relative",
                  height: 180,
                  overflow: "hidden",
                }}
              >
                <img
                  src={post.image_url}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {post.rating != null && (
                  <div
                    style={{
                      position: "absolute",
                      top: tokens.space[3],
                      right: tokens.space[3],
                    }}
                  >
                    <Pill tone="warm" size="sm" solid>
                      <Star size={11} fill="currentColor" />
                      {post.rating.toFixed(1)}
                    </Pill>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  height: 120,
                  background: tokens.color.surfaceMuted,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: tokens.color.textSubtle,
                }}
              >
                <Utensils size={32} strokeWidth={1.5} />
              </div>
            )}

            <div
              style={{
                padding: tokens.space[4],
                display: "flex",
                flexDirection: "column",
                gap: tokens.space[2],
              }}
            >
              {post.location && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: tokens.space[1],
                    color: tokens.color.textMuted,
                  }}
                >
                  <MapPin size={12} strokeWidth={1.75} />
                  <Caption tone="muted">{post.location.name}</Caption>
                </div>
              )}

              <Body
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {post.review}
              </Body>

              {post.tags && post.tags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: tokens.space[1],
                  }}
                >
                  {post.tags.slice(0, 3).map((tag) => (
                    <Pill key={tag} tone="neutral" size="sm">
                      {tag}
                    </Pill>
                  ))}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: `1px solid ${tokens.color.border}`,
                  paddingTop: tokens.space[2],
                  marginTop: tokens.space[1],
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: tokens.space[3],
                    color: tokens.color.textMuted,
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: tokens.type.size.caption,
                      fontWeight: tokens.type.weight.semibold,
                    }}
                  >
                    <Heart
                      size={13}
                      strokeWidth={1.75}
                      fill={post.is_liked ? tokens.color.warm : "none"}
                      color={post.is_liked ? tokens.color.warm : "currentColor"}
                    />
                    {post.likes_count}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: tokens.type.size.caption,
                      fontWeight: tokens.type.weight.semibold,
                    }}
                  >
                    <MessageCircle size={13} strokeWidth={1.75} />
                    {post.comments_count}
                  </span>
                </div>
                {post.created_at && (
                  <BodySm tone="subtle">
                    {new Date(post.created_at).toLocaleDateString("vi-VN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </BodySm>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default PostsTab;
