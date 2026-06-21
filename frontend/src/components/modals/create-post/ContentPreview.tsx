"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ImageIcon } from "lucide-react";
import { Column, Row } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";
import { ComposerType } from "@/types/contentCreation";

interface ContentPreviewProps {
  type: ComposerType;
  username?: string;
  reviewText: string;
  reelTitle: string;
  imageUrl: string;
  thumbnailUrl: string;
  rating: number;
  tags: string[];
  videoUrl: string;
}

const ratingLabels: Record<number, string> = {
  1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent",
};

export function ContentPreview({
  type,
  username,
  reviewText,
  reelTitle,
  imageUrl,
  thumbnailUrl,
  rating,
  tags,
}: ContentPreviewProps) {
  const isPost = type === "post";
  const heroImage = isPost ? imageUrl || null : thumbnailUrl || null;
  const textPreview = isPost
    ? reviewText || "Your review preview will appear here…"
    : reelTitle || "Your reel caption preview will appear here…";
  const destination = isPost ? "Foodie Feed" : "Discover Reels";

  return (
    <Column style={{ overflow: "hidden" }}>
      {/* Destination pill */}
      <Row
        horizontal="between"
        vertical="center"
        style={{
          padding: "10px 16px",
          borderBottom: `1px solid ${tokens.color.border}`,
        }}
      >
        <span style={{ fontSize: "0.75rem", fontWeight: 500, color: tokens.color.textMuted }}>Publishing to</span>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "2px 10px",
            borderRadius: "9999px",
            backgroundColor: "rgba(255,107,53,0.08)",
            color: tokens.color.warm,
          }}
        >
          {destination}
        </span>
      </Row>

      {/* Media */}
      <Column
        style={{
          position: "relative",
          overflow: "hidden",
          aspectRatio: isPost ? "4/3" : "9/16",
        }}
      >
        <AnimatePresence mode="wait">
          {heroImage ? (
            <motion.img
              key="image"
              src={heroImage}
              alt="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                background: "linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(255,107,53,0.04) 50%, rgba(255,107,53,0.1) 100%)",
              }}
            >
              <Column
                center
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "16px",
                  backgroundColor: "rgba(255,107,53,0.12)",
                }}
              >
                <ImageIcon size={20} color={tokens.color.warm} />
              </Column>
              <span style={{ fontSize: "0.75rem", fontWeight: 500, color: tokens.color.warm }}>
                {isPost ? "Post Cover" : "Reel Thumbnail"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </Column>

      {/* Content info */}
      <Column style={{ padding: "12px 16px", gap: "8px" }}>
        <p style={{ fontSize: "0.875rem", fontWeight: 700, color: tokens.color.text, margin: 0 }}>
          @{username || "creator"}
        </p>

        <p
          style={{
            fontSize: "0.75rem",
            lineHeight: 1.6,
            color: tokens.color.textSubtle,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            minHeight: "3rem",
            margin: 0,
          }}
        >
          {textPreview}
        </p>

        {isPost && rating > 0 && (
          <Row vertical="center" style={{ gap: "8px" }}>
            <Row style={{ gap: "2px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={13}
                  color={star <= rating ? tokens.color.warm : tokens.color.border}
                  fill={star <= rating ? tokens.color.warm : "none"}
                  strokeWidth={star <= rating ? 0 : 1.5}
                />
              ))}
            </Row>
            <span style={{ fontSize: "0.75rem", fontWeight: 500, color: tokens.color.warm }}>
              {ratingLabels[rating]}
            </span>
          </Row>
        )}

        {isPost && tags.length > 0 && (
          <Row style={{ flexWrap: "wrap", gap: "6px" }}>
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(255,107,53,0.08)",
                  color: tokens.color.warm,
                }}
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span style={{ fontSize: "0.6875rem", color: tokens.color.textMuted }}>+{tags.length - 3}</span>
            )}
          </Row>
        )}
      </Column>
    </Column>
  );
}
