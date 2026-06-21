"use client";

import React from "react";
import { Avatar, Column, Row } from "@once-ui-system/core";
import { Heart, MapPin, MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { apiPost } from "@/lib/api";
import { tokens } from "@/styles/tokens";
import { BookmarkButton } from "@/components/common/BookmarkButton";
import { CommentSection } from "@/components/common/CommentSection";
import { useSocialStore } from "@/store/socialStore";
import { PostData } from "@/types/dashboard";

interface PostModalProps {
  isOpen: boolean;
  data: PostData;
  onClose: () => void;
}

export default function PostModal({
  isOpen,
  data: initialData,
  onClose,
}: PostModalProps) {
  const updatePost = useSocialStore((state) => state.updatePost);
  const data =
    useSocialStore((state) =>
      state.posts.find((post) => post.id === initialData.id),
    ) || initialData;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "1080px",
              height: "88vh",
              backgroundColor: tokens.color.surface,
              borderRadius: "28px",
              overflow: "hidden",
              boxShadow: "0 40px 100px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Column
              center
              style={{
                width: "56%",
                height: "100%",
                backgroundColor: tokens.color.bg,
                overflow: "hidden",
              }}
            >
              <Column
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.45) 100%)",
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              />
              <img
                src={data.img}
                alt={data.spotName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Column>

            <Column
              style={{
                width: "44%",
                height: "100%",
                backgroundColor: tokens.color.surface,
                minWidth: 0,
              }}
            >
              <Column
                style={{
                  padding: "20px",
                  borderBottom: `1px solid ${tokens.color.border}`,
                  gap: "16px",
                  flexShrink: 0,
                }}
              >
                <Row horizontal="between" vertical="center">
                  <Row vertical="center" style={{ gap: "12px", minWidth: 0 }}>
                    <Avatar src={data.avatar} size="m" />
                    <Column style={{ minWidth: 0 }}>
                      <Row
                        vertical="center"
                        style={{
                          gap: "8px",
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: tokens.color.text,
                        }}
                      >
                        {data.name}
                        {data.primaryBadge && (
                          <Column
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              color: data.primaryBadge.accent_color,
                              backgroundColor: "rgba(0,0,0,0.03)",
                              padding: "2px 8px",
                              borderRadius: "8px",
                              border: `1px solid ${data.primaryBadge.accent_color}33`,
                            }}
                          >
                            {data.primaryBadge.name}
                          </Column>
                        )}
                      </Row>
                      <Column
                        style={{
                          fontSize: "0.75rem",
                          color: tokens.color.textMuted,
                          marginTop: "2px",
                        }}
                      >
                        {data.time} — {data.location}
                      </Column>
                    </Column>
                  </Row>

                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: "none",
                      backgroundColor: tokens.color.surfaceMuted,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <X size={16} color={tokens.color.text} />
                  </button>
                </Row>

                <Column style={{ paddingLeft: "2px" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                      color: tokens.color.text,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {data.review}
                  </p>

                  {data.tags?.length ? (
                    <Row style={{ flexWrap: "wrap", gap: "8px", marginTop: "14px" }}>
                      {data.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            padding: "4px 12px",
                            backgroundColor: tokens.color.surfaceMuted,
                            borderRadius: "10px",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            color: tokens.color.warm,
                            border: `1px solid ${tokens.color.border}`,
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </Row>
                  ) : null}
                </Column>
              </Column>

              <Column style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                <CommentSection
                  entityType="post"
                  entityId={data.id}
                  emptyMessage="Chưa có bình luận nào"
                  onCommentAdded={() =>
                    updatePost(data.id, { comments: (data.comments || 0) + 1 })
                  }
                  rootStyle={{ flex: 1 }}
                  listStyle={{ padding: "16px 20px" }}
                  fixedHeader={null}
                  footer={
                    <Row
                      horizontal="between"
                      vertical="center"
                      style={{
                        padding: "12px 20px",
                        borderTop: `1px solid ${tokens.color.border}`,
                        gap: "12px",
                        backgroundColor: tokens.color.surface,
                        flexShrink: 0,
                      }}
                    >
                      <Row vertical="center" style={{ gap: "20px" }}>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.85 }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 10px",
                            borderRadius: "20px",
                            backgroundColor: data.isLiked
                              ? "rgba(255,107,53,0.08)"
                              : "transparent",
                            transition: "background 0.2s",
                          }}
                          onClick={async () => {
                            const newIsLiked = !data.isLiked;
                            const newLikes = newIsLiked
                              ? data.likes + 1
                              : Math.max(0, data.likes - 1);
                            updatePost(data.id, { isLiked: newIsLiked, likes: newLikes });
                            try {
                              await apiPost(`/api/v1/posts/${data.id}/like`, {});
                            } catch {
                              updatePost(data.id, { isLiked: data.isLiked, likes: data.likes });
                            }
                          }}
                        >
                          <Heart
                            size={20}
                            color={data.isLiked ? tokens.color.warm : tokens.color.textMuted}
                            fill={data.isLiked ? tokens.color.warm : "none"}
                            strokeWidth={data.isLiked ? 2.5 : 2}
                          />
                          <span
                            style={{
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              color: data.isLiked ? tokens.color.warm : tokens.color.textMuted,
                            }}
                          >
                            {data.likes || 0}
                          </span>
                        </motion.button>

                        <Row vertical="center" style={{ gap: "6px", padding: "6px 10px" }}>
                          <MessageCircle size={20} color={tokens.color.textMuted} />
                          <span
                            style={{
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              color: tokens.color.textMuted,
                            }}
                          >
                            {data.comments || 0}
                          </span>
                        </Row>
                      </Row>

                      <BookmarkButton
                        entityType="post"
                        entityId={data.id}
                        isBookmarked={data.isSaved ?? false}
                        size={36}
                        iconSize={20}
                        inactiveColor={tokens.color.textMuted}
                      />
                    </Row>
                  }
                />
              </Column>
            </Column>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
