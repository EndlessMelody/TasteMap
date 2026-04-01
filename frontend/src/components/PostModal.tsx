"use client";

import React from "react";
import {
  Column,
  Row,
  Text,
  Avatar,
  IconButton,
  Input,
} from "@/components/OnceUI";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Star,
  MapPin,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BottomSheet from "@/components/BottomSheet";

export interface PostData {
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
}

interface PostModalProps {
  isOpen: boolean;
  data: PostData;
  onClose: () => void;
}

export default function PostModal({ isOpen, data, onClose }: PostModalProps) {
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
            {/* Left Block (Media) */}
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
                alt={data.spotName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Column>

            {/* Right Block (Info & Comments) */}
            <Column
              style={{
                width: "45%",
                height: "100%",
                backgroundColor: "#FFFFFF",
                borderLeft: "1px solid #E5E5EA",
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
                  borderBottom: "1px solid var(--border-medium)",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                }}
              >
                <Row style={{ alignItems: "center", gap: "12px" }}>
                  <Avatar src={data.avatar} size="m" />
                  <Column style={{ gap: "2px" }}>
                    <Text
                      style={{
                        color: "#1C1C1E",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      {data.name}
                    </Text>
                    <Row style={{ alignItems: "center", gap: "4px" }}>
                      <MapPin size={11} color="#AEAEB2" />
                      <Text style={{ color: "#AEAEB2", fontSize: "0.7rem" }}>
                        {data.spotName} • {data.location}
                      </Text>
                    </Row>
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
                  padding: "24px",
                  gap: "24px",
                }}
              >
                {/* Caption / Review */}
                <Row style={{ alignItems: "flex-start", gap: "12px" }}>
                  <Avatar src={data.avatar} size="s" />
                  <Column style={{ gap: "6px", flex: 1 }}>
                    <Text
                      style={{
                        color: "#1C1C1E",
                        fontSize: "0.85rem",
                        lineHeight: 1.5,
                      }}
                    >
                      <span style={{ fontWeight: 700, marginRight: "6px" }}>
                        {data.name}
                      </span>
                      {data.review}
                    </Text>
                    <Row style={{ gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                      {data.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            padding: "4px 10px",
                            backgroundColor: "#F2F2F7",
                            borderRadius: "16px",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            color: "#8E8E93",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </Row>
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
                      src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop",
                      name: "Đức Anh",
                      text: "Quán này ngon lắm, mình cũng hay ghé! 🔥",
                      time: "2h",
                    },
                    {
                      src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop",
                      name: "Bảo Trân",
                      text: "Save lại để cuối tuần rủ bạn bè đi 😍",
                      time: "5h",
                    },
                    {
                      src: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=64&h=64&fit=crop",
                      name: "Anh Khoa",
                      text: "Giá bao nhiêu vậy bạn?",
                      time: "1d",
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
                        {isLiked ? data.likes + 1 : data.likes}
                      </Text>
                    </Row>
                    <Row gap="8" vertical="center" style={{ cursor: "pointer" }}>
                      <MessageCircle size={24} color="var(--neutral-alpha-medium)" />
                      <Text variant="label-default-l" weight="strong" onBackground="neutral-strong">
                        {data.comments}
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
                  padding: "16px 24px",
                  borderTop: "1px solid var(--border-medium)",
                  alignItems: "center",
                  gap: "16px",
                  flexShrink: 0,
                }}
              >
                <Input
                  placeholder="Add a comment..."
                  style={{
                    flex: 1,
                    border: "none",
                    backgroundColor: "transparent",
                    padding: 0,
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
