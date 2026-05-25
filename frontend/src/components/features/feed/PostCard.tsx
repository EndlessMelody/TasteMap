"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Star,
  MapPin,
} from "lucide-react";
import { Card, Body, BodySm, Caption, Pill, Avatar, IconButton } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { PostCardProps } from "@/types/dashboard";

export default function PostCard({
  post,
  onLike,
  onComment,
  onSave,
  onShare,
  onOpen,
}: PostCardProps) {
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
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: "100%", marginBottom: tokens.space[5] }}
    >
      <Card radius="xl" padding="none" shadow="sm" style={{ overflow: "hidden" }}>
        <div
          onClick={() => onOpen(post)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: tokens.space[4],
            cursor: "pointer",
            gap: tokens.space[3],
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space[3],
              minWidth: 0,
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar src={avatar} name={name} size="lg" />
              {userLevel != null && (
                <div
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    background: tokens.color.warm,
                    color: tokens.color.textInverse,
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `2px solid ${tokens.color.surface}`,
                    fontSize: 9,
                    fontWeight: tokens.type.weight.bold,
                  }}
                >
                  {userLevel}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.space[2],
                  flexWrap: "wrap",
                }}
              >
                <Body style={{ fontWeight: tokens.type.weight.semibold }}>
                  {name}
                </Body>
                {userTitle && (
                  <Pill tone="warm" size="sm">
                    {userTitle}
                  </Pill>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.space[1],
                  color: tokens.color.textMuted,
                }}
              >
                <Caption tone="muted">{time}</Caption>
                {location && (
                  <>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <MapPin size={10} strokeWidth={1.75} />
                    <Caption tone="muted">{location}</Caption>
                  </>
                )}
              </div>
            </div>
          </div>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="More"
            icon={<MoreHorizontal size={18} strokeWidth={1.75} />}
          />
        </div>

        <div
          onClick={() => onOpen(post)}
          style={{
            position: "relative",
            width: "100%",
            background: tokens.color.surfaceMuted,
            cursor: "pointer",
          }}
        >
          <img
            src={img}
            alt={spotName}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: 500,
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: tokens.space[4],
              right: tokens.space[4],
            }}
          >
            <Pill
              tone="neutral"
              size="md"
              leftIcon={<Star size={12} fill="currentColor" />}
              style={{
                background: "rgba(10, 10, 10, 0.55)",
                color: tokens.color.textInverse,
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              {rating.toFixed(1)}
            </Pill>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: `${tokens.space[2]} ${tokens.space[4]}`,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: tokens.space[3],
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={() => onLike(id)}
              aria-label={isLiked ? "Unlike" : "Like"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: tokens.space[1],
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: tokens.space[1],
                color: isLiked ? tokens.color.danger : tokens.color.text,
              }}
            >
              <Heart
                size={22}
                strokeWidth={1.75}
                fill={isLiked ? "currentColor" : "none"}
              />
              {likes > 0 && (
                <BodySm style={{ fontWeight: tokens.type.weight.semibold }}>
                  {likes}
                </BodySm>
              )}
            </button>

            <button
              type="button"
              onClick={() => onOpen(post)}
              aria-label="Comment"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: tokens.space[1],
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: tokens.space[1],
                color: tokens.color.text,
              }}
            >
              <MessageCircle size={22} strokeWidth={1.75} />
              {comments > 0 && (
                <BodySm style={{ fontWeight: tokens.type.weight.semibold }}>
                  {comments}
                </BodySm>
              )}
            </button>
          </div>

          <IconButton
            variant="ghost"
            size="md"
            aria-label={isSaved ? "Unsave" : "Save"}
            onClick={() => onSave(id)}
            icon={
              <Bookmark
                size={22}
                strokeWidth={1.75}
                fill={isSaved ? "currentColor" : "none"}
                style={{
                  color: isSaved ? tokens.color.warm : tokens.color.text,
                }}
              />
            }
          />
        </div>

        <div
          style={{
            padding: `0 ${tokens.space[4]} ${tokens.space[4]}`,
            display: "flex",
            flexDirection: "column",
            gap: tokens.space[2],
          }}
        >
          <Body style={{ lineHeight: 1.5 }}>
            <span
              style={{
                fontWeight: tokens.type.weight.semibold,
                marginRight: 6,
              }}
            >
              {name}
            </span>
            {review}
          </Body>

          {tags && tags.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: tokens.space[1],
                flexWrap: "wrap",
              }}
            >
              {tags.map((tag) => (
                <BodySm
                  key={tag}
                  style={{
                    color: tokens.color.magic,
                    fontWeight: tokens.type.weight.medium,
                    cursor: "pointer",
                  }}
                >
                  #{tag}
                </BodySm>
              ))}
            </div>
          )}

          {comments > 0 && (
            <BodySm
              tone="muted"
              style={{ cursor: "pointer" }}
              onClick={() => onOpen(post)}
            >
              View all {comments} comments
            </BodySm>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
