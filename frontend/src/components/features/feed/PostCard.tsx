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
import { Column, Row } from "@once-ui-system/core";
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
        <Row
          horizontal="between"
          vertical="center"
          onClick={() => onOpen(post)}
          style={{
            paddingTop: tokens.space[4],
            paddingRight: tokens.space[4],
            paddingBottom: tokens.space[4],
            paddingLeft: tokens.space[4],
            cursor: "pointer",
            gap: tokens.space[3],
          }}
        >
          <Row vertical="center" style={{ gap: tokens.space[3], minWidth: 0 }}>
            <Column style={{ flexShrink: 0 }}>
              <Avatar src={avatar} name={name} size="lg" />
              {userLevel != null && (
                <Column
                  center
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    background: tokens.color.warm,
                    color: tokens.color.textInverse,
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    border: `2px solid ${tokens.color.surface}`,
                    fontSize: 9,
                    fontWeight: tokens.type.weight.bold,
                  }}
                >
                  {userLevel}
                </Column>
              )}
            </Column>
            <Column style={{ gap: 2, minWidth: 0 }}>
              <Row vertical="center" style={{ gap: tokens.space[2], flexWrap: "wrap" }}>
                <Body style={{ fontWeight: tokens.type.weight.semibold }}>
                  {name}
                </Body>
                {userTitle && (
                  <Pill tone="warm" size="sm">
                    {userTitle}
                  </Pill>
                )}
              </Row>
              <Row vertical="center" style={{ gap: tokens.space[1], color: tokens.color.textMuted }}>
                <Caption tone="muted">{time}</Caption>
                {location && (
                  <>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <MapPin size={10} strokeWidth={1.75} />
                    <Caption tone="muted">{location}</Caption>
                  </>
                )}
              </Row>
            </Column>
          </Row>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="More"
            icon={<MoreHorizontal size={18} strokeWidth={1.75} />}
          />
        </Row>

        <Column
          fillWidth
          onClick={() => onOpen(post)}
          style={{
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
          <Column
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
          </Column>
        </Column>

        <Row
          horizontal="between"
          vertical="center"
          style={{
            paddingTop: tokens.space[2],
            paddingRight: tokens.space[4],
            paddingBottom: tokens.space[2],
            paddingLeft: tokens.space[4],
          }}
        >
          <Row vertical="center" style={{ gap: tokens.space[3] }}>
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
          </Row>

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
        </Row>

        <Column
          style={{
            paddingTop: 0,
            paddingRight: tokens.space[4],
            paddingBottom: tokens.space[4],
            paddingLeft: tokens.space[4],
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
            <Row style={{ gap: tokens.space[1], flexWrap: "wrap" }}>
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
            </Row>
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
        </Column>
      </Card>
    </motion.div>
  );
}
