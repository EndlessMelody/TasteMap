"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Utensils, MapPin, Heart } from "lucide-react";
import { Text } from "@/components/OnceUI";
import { PostItem } from "@/app/profile/page";

interface ReviewsTabProps {
  postsLoading: boolean;
  userPosts: PostItem[];
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({ postsLoading, userPosts }) => {
  const reviews = userPosts.filter((p) => p.rating != null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Header summary */}
      {reviews.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
              padding: "8px 16px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Star size={14} color="white" fill="white" />
            <span style={{ color: "white", fontWeight: 700, fontSize: "0.85rem" }}>
              {reviews.length} đánh giá
            </span>
          </div>
          <span style={{ color: "#8E8E93", fontSize: "0.8rem" }}>
            Điểm trung bình:{" "}
            <strong style={{ color: "#ff6b35" }}>
              {(reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length).toFixed(1)}
            </strong>
            {" "}/ 5
          </span>
        </div>
      )}

      {postsLoading ? (
        // ── Skeleton list ──
        [1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              borderRadius: "18px",
              border: "1px solid #F2F2F7",
              padding: "20px",
              background: "#FAFAFA",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ height: "16px", borderRadius: "8px", background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", width: "40%" }} />
            <div style={{ height: "13px", borderRadius: "6px", background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", width: "85%" }} />
            <div style={{ height: "13px", borderRadius: "6px", background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", width: "70%" }} />
          </div>
        ))
      ) : reviews.length === 0 ? (
        // ── Empty state ──
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
            <Star size={48} color="#ff6b35" />
          </div>
          <Text style={{ color: "#8E8E93", fontWeight: 600, fontSize: "0.95rem" }}>
            Chưa có đánh giá nào
          </Text>
          <Text style={{ color: "#C7C7CC", fontSize: "0.8rem", textAlign: "center" }}>
            Đăng bài với rating để thấy reviews tại đây!
          </Text>
        </div>
      ) : (
        // ── Review rows ──
        reviews.map((review, idx) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            style={{
              borderRadius: "18px",
              border: "1px solid #F2F2F7",
              padding: "20px 24px",
              background: "#FFFFFF",
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
              cursor: "pointer",
              transition: "box-shadow 0.2s",
            }}
          >
            {/* Image thumbnail */}
            {review.image_url ? (
              <img
                src={review.image_url}
                alt="review"
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "12px",
                  objectFit: "cover",
                  flexShrink: 0,
                  border: "1px solid #F2F2F7",
                }}
              />
            ) : (
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #FFF5F0, #FFE8D6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Utensils size={24} color="#FFB399" />
              </div>
            )}

            {/* Review content */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              {/* Top row: location + rating + date */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {review.location && (
                    <span style={{ display: "flex", alignItems: "center", gap: "3px", color: "#1C1C1E", fontWeight: 700, fontSize: "0.9rem" }}>
                      <MapPin size={13} color="#ff6b35" />
                      {review.location.name}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {/* Star rating */}
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        color="#ff6b35"
                        fill={s <= Math.round(review.rating ?? 0) ? "#ff6b35" : "none"}
                      />
                    ))}
                  </div>
                  <span style={{ color: "#ff6b35", fontWeight: 700, fontSize: "0.85rem" }}>
                    {(review.rating ?? 0).toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Review text */}
              <p
                style={{
                  color: "#636366",
                  fontSize: "0.875rem",
                  lineHeight: 1.55,
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {review.review}
              </p>

              {/* Tags + footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {(review.tags ?? []).slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: "#FFF5F0",
                        color: "#ff6b35",
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "6px",
                        border: "1px solid #FFE8D6",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "3px", color: "#C7C7CC", fontSize: "0.72rem" }}>
                    <Heart size={12} color={review.is_liked ? "#ff6b35" : "#C7C7CC"} fill={review.is_liked ? "#ff6b35" : "none"} />
                    {review.likes_count}
                  </span>
                  {review.created_at && (
                    <span style={{ color: "#C7C7CC", fontSize: "0.72rem" }}>
                      {new Date(review.created_at).toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))
      )}
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
    </div>
  );
};
