"use client";

import React from "react";
import { motion } from "framer-motion";
import { ImageIcon, Utensils, MapPin, Star, Heart, MessageCircle } from "lucide-react";
import { Text } from "@/components/OnceUI";

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
  onPostClick 
}) => {
  if (postsLoading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid #F2F2F7",
              background: "#FAFAFA",
            }}
          >
            <div
              style={{
                height: "160px",
                background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ height: "14px", borderRadius: "7px", background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", width: "60%" }} />
              <div style={{ height: "12px", borderRadius: "6px", background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", width: "90%" }} />
              <div style={{ height: "12px", borderRadius: "6px", background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", width: "75%" }} />
            </div>
          </div>
        ))}
        <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
      </div>
    );
  }

  if (userPosts.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 40px",
          gap: "16px",
          background: "#FAFAFA",
          borderRadius: "24px",
          border: "2px dashed #FFE8D6",
        }}
      >
        <div style={{ opacity: 0.25 }}>
          <ImageIcon size={48} color="#ff6b35" />
        </div>
        <Text style={{ color: "#8E8E93", fontWeight: 600, fontSize: "0.95rem" }}>
          Chưa có bài đăng nào
        </Text>
        <Text style={{ color: "#C7C7CC", fontSize: "0.8rem", textAlign: "center" }}>
          Chia sẻ trải nghiệm ẩm thực đầu tiên của bạn!
        </Text>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "20px",
      }}
    >
      {userPosts.map((post, idx) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          onClick={() => onPostClick?.(post)}
          style={{
            borderRadius: "20px",
            overflow: "hidden",
            border: "1px solid #F2F2F7",
            background: "#FFFFFF",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            cursor: "pointer",
            transition: "box-shadow 0.2s, transform 0.2s",
          }}
          whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(255,107,53,0.12)" }}
        >
          {/* Post image */}
          {post.image_url ? (
            <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
              <img
                src={post.image_url}
                alt="post"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {post.rating != null && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "rgba(255,107,53,0.9)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "10px",
                    padding: "4px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Star size={12} color="white" fill="white" />
                  <span style={{ color: "white", fontSize: "0.8rem", fontWeight: 700 }}>
                    {post.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                height: "120px",
                background: "linear-gradient(135deg, #FFF5F0, #FFE8D6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Utensils size={32} color="#FFB399" />
            </div>
          )}

          {/* Post body */}
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Location */}
            {post.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={12} color="#ff6b35" />
                <span style={{ color: "#ff6b35", fontSize: "0.75rem", fontWeight: 600 }}>
                  {post.location.name}
                </span>
              </div>
            )}

            {/* Review text */}
            <p
              style={{
                color: "#1C1C1E",
                fontSize: "0.875rem",
                lineHeight: 1.5,
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {post.review}
            </p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: "#FFF5F0",
                      color: "#ff6b35",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      border: "1px solid #FFE8D6",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer: likes, comments, date */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid #F2F2F7",
                paddingTop: "10px",
                marginTop: "4px",
              }}
            >
              <div style={{ display: "flex", gap: "12px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#8E8E93", fontSize: "0.75rem" }}>
                  <Heart size={13} color={post.is_liked ? "#ff6b35" : "#C7C7CC"} fill={post.is_liked ? "#ff6b35" : "none"} />
                  {post.likes_count}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#8E8E93", fontSize: "0.75rem" }}>
                  <MessageCircle size={13} color="#C7C7CC" />
                  {post.comments_count}
                </span>
              </div>
              {post.created_at && (
                <span style={{ color: "#C7C7CC", fontSize: "0.7rem" }}>
                  {new Date(post.created_at).toLocaleDateString("vi-VN", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
