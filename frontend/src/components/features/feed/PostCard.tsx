"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Column, Row, Text, Avatar, IconButton, Flex } from "@/components/OnceUI";
import { PostCardProps } from "@/types/dashboard";
import { cn } from "@/lib/cn";

/**
 * PostCard Component
 * 
 * A premium, detailed card for the social feed.
 * Features:
 * - Interactive user header with location and badges
 * - Immersive content display (image)
 * - Optimized action bar for high engagement
 * - Structured caption with tags and review details
 */
export default function PostCard({ post, onLike, onComment, onSave, onShare, onOpen }: PostCardProps) {
  const {
    id,
    name,
    avatar,
    time,
    location,
    spotName,
    rating,
    review,
    img,
    tags,
    likes,
    comments,
    isLiked,
    isSaved,
    userTitle,
    userLevel,
  } = post;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ width: "100%", marginBottom: "20px" }}
    >
      <Column
        fillWidth
        background="surface"
        radius="xl"
        border="neutral-alpha-weak"
        style={{
          boxShadow: "0 4px 24px -1px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        className="hover:shadow-lg"
      >
        {/* ── Header ── */}
        <Row
          padding="m"
          align="center"
          justify="between"
          onClick={() => onOpen(post)}
          style={{ cursor: "pointer" }}
        >
          <Row gap={12} align="center">
            <div style={{ position: "relative" }}>
              <Avatar src={avatar} name={name} size="l" />
              {userLevel && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    right: "-2px",
                    background: "linear-gradient(135deg, #E2775A 0%, #9B72CF 100%)",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid var(--surface-base)",
                  }}
                >
                  <Text variant="body-default-xs" style={{ fontSize: "9px", fontWeight: 800, color: "white" }}>
                    {userLevel}
                  </Text>
                </div>
              )}
            </div>
            <Column gap={2}>
              <Row gap={6} align="center">
                <Text variant="body-default-m" style={{ fontWeight: 600 }}>
                  {name}
                </Text>
                {userTitle && (
                  <Row
                    paddingX="8"
                    paddingY="2"
                    radius="s"
                    style={{ background: "rgba(226, 119, 90, 0.1)", border: "1px solid rgba(226, 119, 90, 0.2)" }}
                  >
                    <Text variant="body-default-xs" style={{ color: "#E2775A", fontWeight: 600, fontSize: "10px" }}>
                      {userTitle}
                    </Text>
                  </Row>
                )}
              </Row>
              <Row gap={4} align="center">
                <Text variant="body-default-xs" style={{ color: "var(--color-text-weak)", opacity: 0.8 }}>
                  {time}
                </Text>
                <div style={{ width: "2px", height: "2px", borderRadius: "50%", background: "var(--color-text-weak)", opacity: 0.4 }} />
                <Text variant="body-default-xs" style={{ color: "#E2775A", fontWeight: 500 }}>
                  {location}
                </Text>
              </Row>
            </Column>
          </Row>
          <IconButton
            variant="tertiary"
            size="s"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            }
          />
        </Row>

        {/* ── Content ── */}
        <div
          onClick={() => onOpen(post)}
          style={{
            position: "relative",
            width: "100%",
            containerType: "inline-size",
            background: "var(--color-background-secondary)",
            display: "flex",
            cursor: "pointer"
          }}
        >
          <img
            src={img}
            alt={spotName}
            style={{ width: "100%", height: "auto", maxHeight: "150cqi", objectFit: "cover" }}
          />

          {/* Rating Badge Overlay */}
          <div
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(8px)",
              padding: "6px 12px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <Text variant="body-default-s" style={{ color: "white", fontWeight: 700 }}>
              {rating.toFixed(1)}
            </Text>
          </div>


        </div>

        {/* ── Action Bar ── */}
        <Row paddingX="m" paddingY="s" justify="between" align="center">
          <Row gap={8}>
            <Row align="center" gap={4}>
              <IconButton
                onClick={() => onLike(id)}
                variant="tertiary"
                className={cn("transition-all", isLiked && "text-[#ff4757]")}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                }
              />
              {likes > 0 && (
                <Text variant="body-default-s" style={{ fontWeight: 600 }}>
                  {likes}
                </Text>
              )}
            </Row>

            <Row align="center" gap={4}>
              <IconButton
                onClick={() => onOpen(post)}
                variant="tertiary"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                }
              />
              {comments > 0 && (
                <Text variant="body-default-s" style={{ fontWeight: 600 }}>
                  {comments}
                </Text>
              )}
            </Row>

            {/* <IconButton
              onClick={() => onShare(id)}
              variant="tertiary"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              }
            /> */}
          </Row>

          <IconButton
            onClick={() => onSave(id)}
            variant="tertiary"
            className={cn("transition-all", isSaved && "text-[#E2775A]")}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            }
          />
        </Row>

        {/* ── Details ── */}
        <Column paddingX="m" paddingBottom="m" gap={8}>
          {/* Review text */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Text variant="body-default-s" style={{ lineHeight: "1.5", color: "var(--color-text-default)" }}>
              <span style={{ fontWeight: 700, marginRight: "6px" }}>{name}</span>
              {review}
            </Text>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <Row gap={6} style={{ flexWrap: "wrap", marginTop: "4px" }}>
              {tags.map((tag) => (
                <Text
                  key={tag}
                  variant="body-default-xs"
                  style={{
                    color: "#9B72CF",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  #{tag}
                </Text>
              ))}
            </Row>
          )}

          {/* View all comments link */}
          {comments > 0 && (
            <Text
              variant="body-default-xs"
              style={{
                color: "var(--color-text-weak)",
                marginTop: "4px",
                cursor: "pointer",
                fontWeight: 500
              }}
              onClick={() => onOpen(post)}
            >
              Xem tất cả {comments} bình luận
            </Text>
          )}
        </Column>
      </Column>
    </motion.div>
  );
}
