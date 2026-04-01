"use client";

import React from "react";
import { Column, Row, Text, Avatar, IconButton, Input } from "@/components/OnceUI";
import { Heart, Share2, MessageCircle, Play, Send, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ReelData {
  title: string;
  user: string;
  userAvatar: string;
  views: string;
  img: string;
}

interface ReelModalProps {
  isOpen: boolean;
  data: ReelData;
  onClose: () => void;
}

export default function ReelModal({ isOpen, data, onClose }: ReelModalProps) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 200,
            backgroundColor: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "20px",
            paddingBottom: "20px",
            paddingLeft: "20px",
            paddingRight: "20px",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "1100px",
              height: "85vh",
              backgroundColor: "#FFFFFF",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "row",
            }}
          >
            {/* Left Block (Media Theater) */}
            <Column
              style={{
                width: "55%",
                height: "100%",
                backgroundColor: "#000000",
                position: "relative",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={data.img}
                alt={data.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
              {/* Center play button overlay */}
              <motion.div
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "rgba(255,255,255,0.25)",
                }}
              >
                <Play size={26} color="white" fill="white" />
              </motion.div>
            </Column>

            {/* Right Block (Info & Comments) */}
            <Column
              style={{
                width: "45%",
                height: "100%",
                backgroundColor: "#FFFFFF",
                borderLeftWidth: "1px",
                borderLeftStyle: "solid",
                borderLeftColor: "#E5E5EA",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <Row
                 style={{
                  paddingTop: "18px",
                  paddingBottom: "18px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  borderBottomWidth: "1px",
                  borderBottomStyle: "solid",
                  borderBottomColor: "var(--border-medium)",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                }}
              >
                <Row style={{ alignItems: "center", gap: "12px" }}>
                  <Avatar src={data.userAvatar} size="m" />
                  <Column style={{ gap: "2px" }}>
                    <Text
                      style={{
                        color: "#1C1C1E",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      {data.user}
                    </Text>
                    <Text style={{ color: "#AEAEB2", fontSize: "0.7rem" }}>
                      {data.views} views
                    </Text>
                  </Column>
                </Row>
                <IconButton
                  icon={<Text style={{ fontSize: "20px", color: "#1C1C1E" }}>×</Text>}
                  variant="tertiary"
                  onClick={onClose}
                  style={{ width: "36px", height: "36px", borderRadius: "50%" }}
                />
              </Row>

              {/* Scrollable Content (Caption + Comments) */}
              <Column
                className="no-scrollbar"
                 style={{
                  flex: 1,
                  overflowY: "auto",
                  paddingTop: "24px",
                  paddingBottom: "24px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  gap: "24px",
                }}
              >
                {/* Caption / Title */}
                <Row style={{ alignItems: "flex-start", gap: "12px" }}>
                  <Avatar src={data.userAvatar} size="s" />
                  <Column style={{ gap: "6px", flex: 1 }}>
                    <Text
                      style={{
                        color: "#1C1C1E",
                        fontSize: "0.85rem",
                        lineHeight: 1.5,
                      }}
                    >
                      <span style={{ fontWeight: 700, marginRight: "6px" }}>
                        {data.user}
                      </span>
                      {data.title}
                    </Text>
                  </Column>
                </Row>

                <div
                  style={{
                    height: "1px",
                    backgroundColor: "#F2F2F7",
                  }}
                />

                {/* Mock Comments */}
                <Column style={{ gap: "16px" }}>
                  {[
                    {
                      src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop",
                      name: "Minh Thu",
                      text: "Video đẹp quá, mình cũng muốn đi!",
                      time: "1h",
                    },
                    {
                      src: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=64&h=64&fit=crop",
                      name: "Hoàng Long",
                      text: "Góc quay chấn động 😂",
                      time: "3h",
                    },
                    {
                      src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop",
                      name: "Thảo Vy",
                      text: "Lưu lại làm checklist tháng này ❤️",
                      time: "4h",
                    },
                  ].map((c) => (
                    <Row
                      key={c.name}
                      style={{ gap: "12px", alignItems: "flex-start" }}
                    >
                      <Avatar src={c.src} size="s" />
                      <Column style={{ gap: "4px" }}>
                        <Text
                          style={{
                            color: "#1C1C1E",
                            fontSize: "0.8rem",
                            lineHeight: 1.6,
                          }}
                        >
                          <span style={{ fontWeight: 700, marginRight: "6px" }}>
                            {c.name}
                          </span>
                          {c.text}
                        </Text>
                        <Row style={{ gap: "12px", alignItems: "center" }}>
                          <Text style={{ color: "#AEAEB2", fontSize: "0.7rem" }}>
                            {c.time}
                          </Text>
                          <Text
                            style={{
                              color: "#AEAEB2",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Reply
                          </Text>
                        </Row>
                      </Column>
                      <Heart
                        size={12}
                        color="#AEAEB2"
                        style={{ marginLeft: "auto", cursor: "pointer", marginTop: "4px" }}
                      />
                    </Row>
                  ))}
                </Column>
              </Column>

              {/* Action Bar (Icons) */}
              <Column
                padding="l"
                borderTop="neutral-alpha-weak"
                gap="12"
                style={{ flexShrink: 0 }}
              >
                <Row fillWidth horizontal="between" vertical="center">
                  <Row gap="24" vertical="center">
                    <Row
                      gap="8"
                      vertical="center"
                      style={{ cursor: "pointer" }}
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart
                        size={24}
                        color={isLiked ? "var(--brand-solid-strong)" : "var(--neutral-alpha-medium)"}
                        fill={isLiked ? "var(--brand-solid-strong)" : "none"}
                      />
                      <Text variant="label-default-l" weight="strong" onBackground="neutral-strong">
                        {isLiked ? "12.5K" : "12.4K"}
                      </Text>
                    </Row>
                    <Row gap="8" vertical="center" style={{ cursor: "pointer" }}>
                      <MessageCircle size={24} color="var(--neutral-alpha-medium)" />
                      <Text variant="label-default-l" weight="strong" onBackground="neutral-strong">
                        324
                      </Text>
                    </Row>
                  </Row>
                  <Row style={{ cursor: "pointer" }} onClick={() => setIsSaved(!isSaved)}>
                    <Bookmark
                      size={24}
                      color={isSaved ? "var(--brand-solid-strong)" : "var(--neutral-alpha-medium)"}
                      fill={isSaved ? "var(--brand-solid-strong)" : "none"}
                    />
                  </Row>
                </Row>
              </Column>

              {/* Input Footer */}
               <Row
                style={{
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  borderTopWidth: "1px",
                  borderTopStyle: "solid",
                  borderTopColor: "var(--border-medium)",
                  alignItems: "center",
                  gap: "16px",
                  flexShrink: 0,
                }}
              >
                 <Input
                  placeholder="Add a comment..."
                  style={{
                    flex: 1,
                    borderWidth: 0,
                    borderStyle: "none",
                    backgroundColor: "transparent",
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                    fontSize: "0.85rem",
                  }}
                />
                <Text
                  style={{
                    color: "#007AFF",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Post
                </Text>
              </Row>
            </Column>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
