"use client";

import React from "react";
import { motion } from "framer-motion";
import { Column, Row, Text, Avatar } from "../OnceUI";
import { Heart, MessageCircle, Bookmark, Star, MapPin } from "lucide-react";

export function PostCard({
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
  delay,
  isLiked = false,
  onToggleLike,
}: {
  id: number;
  name: string;
  avatar: string;
  time: string;
  location: string;
  spotName: string;
  rating: number;
  review: string;
  img: string;
  tags: string[];
  likes: number;
  comments: number;
  delay: number;
  isLiked?: boolean;
  onToggleLike?: (id: number) => void;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  return (
    <motion.div layout style={{ borderRadius: "16px", flexShrink: 0 }}>
      <motion.div
        layout
        whileHover={{
          scale: 1.02,
          y: -4,
          boxShadow: "0 12px 40px rgba(0, 122, 255, 0.08)",
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          layout: { duration: 0.3, type: "spring", bounce: 0.2 },
          duration: 0.4,
          delay,
        }}
        style={{
          minWidth: "340px",
          maxWidth: "340px",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          borderTopWidth: "1px",
          borderBottomWidth: "1px",
          borderLeftWidth: "1px",
          borderRightWidth: "1px",
          borderStyle: "solid",
          borderColor: "#E5E5EA",
          overflow: "hidden",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          transform: "translateZ(0)",
        }}
        className="group"
      >
        {/* Top Half — Image with overlays */}
        <Column
          className="overflow-hidden relative"
          style={{ height: "200px", width: "100%", position: "relative" }}
        >
          <img
            src={img}
            alt={spotName}
            className="transition-transform duration-[700ms] ease-out group-hover:scale-[1.03]"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          {/* User info overlay — top left */}
          <Row
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              zIndex: 3,
              backgroundColor: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(10px)",
              paddingTop: "5px",
              paddingBottom: "5px",
              paddingLeft: "10px",
              paddingRight: "10px",
              borderRadius: "10px",
              gap: "8px",
              alignItems: "center",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(255,255,255,0.5)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Avatar src={avatar} size="s" />
            <Column>
              <Text
                style={{
                  color: "#1C1C1E",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                }}
              >
                {name}
              </Text>
              <Text style={{ color: "#8E8E93", fontSize: "0.6rem" }}>
                {time} • {location}
              </Text>
            </Column>
          </Row>

          {/* Rating — top right */}
          <Row
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              zIndex: 3,
              backgroundColor: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              paddingTop: "4px",
              paddingBottom: "4px",
              paddingLeft: "8px",
              paddingRight: "8px",
              borderRadius: "8px",
              gap: "3px",
              alignItems: "center",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(255,255,255,0.5)",
            }}
          >
            <Star size={11} color="#FBBF24" fill="#FBBF24" />
            <Text
              style={{ fontSize: "0.7rem", fontWeight: 700, color: "#FBBF24" }}
            >
              {rating}
            </Text>
          </Row>
        </Column>

        {/* Bottom Half — Content */}
        <Column
          style={{
            paddingTop: "16px",
            paddingBottom: "16px",
            paddingLeft: "16px",
            paddingRight: "16px",
            gap: "12px",
          }}
        >
          {/* Location */}
          <Row style={{ alignItems: "center", gap: "6px" }}>
            <MapPin size={14} color="#AEAEB2" />
            <Text
              style={{ color: "#1C1C1E", fontWeight: 700, fontSize: "0.85rem" }}
            >
              {spotName}
            </Text>
          </Row>

          {/* Truncated Review */}
          <motion.div layout>
            <Text
              style={{
                color: "#1C1C1E",
                fontSize: "0.8rem",
                lineHeight: 1.5,
                ...(isExpanded
                  ? {}
                  : {
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden",
                  }),
              }}
            >
              {review}
            </Text>
          </motion.div>

          {/* Xem thêm Toggle */}
          <Text
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            style={{
              color: "#ff6b35",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: "-4px",
            }}
          >
            {isExpanded ? "Ẩn bớt" : "Xem thêm"}
          </Text>

          {/* Tags */}
          <Row style={{ gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  paddingTop: "3px",
                  paddingBottom: "3px",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  backgroundColor: "#F2F2F7",
                  borderTopWidth: "1px",
                  borderBottomWidth: "1px",
                  borderLeftWidth: "1px",
                  borderRightWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "#E5E5EA",
                  borderRadius: "6px",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: "#8E8E93",
                }}
              >
                {tag}
              </span>
            ))}
          </Row>

          {/* Action Bar */}
          <Row
            fillWidth
            horizontal="between"
            vertical="center"
            paddingY="12"
            borderTop="neutral-alpha-weak"
          >
            <Row gap="24" vertical="center">
              <Row
                gap="8"
                vertical="center"
                style={{ cursor: "pointer" }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onToggleLike?.(id);
                }}
              >
                <Heart
                  size={20}
                  color={isLiked ? "#ED1B24" : "#8E8E93"}
                  fill={isLiked ? "#ED1B24" : "none"}
                />
                <Text
                  variant="label-default-m"
                  weight="strong"
                  style={{ color: "var(--neutral-strong)" }}
                >
                  {likes || 0}
                </Text>
              </Row>
              <Row gap="8" vertical="center" style={{ cursor: "pointer" }}>
                <MessageCircle size={20} color="#8E8E93" />
                <Text
                  variant="label-default-m"
                  weight="strong"
                  style={{ color: "var(--neutral-strong)" }}
                >
                  {comments || 0}
                </Text>
              </Row>
            </Row>
            <Row
              style={{ cursor: "pointer" }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setIsSaved(!isSaved);
              }}
            >
              <Bookmark
                size={20}
                color={isSaved ? "#ff6b35" : "#8E8E93"}
                fill={isSaved ? "#ff6b35" : "none"}
              />
            </Row>
          </Row>
        </Column>
      </motion.div>
    </motion.div>
  );
}
