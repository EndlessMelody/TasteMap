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
import { apiGet, apiPost } from "@/lib/api";
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
      state.posts.find((p) => p.id === initialData.id),
    ) || initialData;
  const [isSaved, setIsSaved] = React.useState(false);
  const [commentsList, setCommentsList] = React.useState<any[]>([]);
  const [loadingComments, setLoadingComments] = React.useState(false);
  const [newComment, setNewComment] = React.useState("");

  React.useEffect(() => {
    if (isOpen && data.id) {
      setLoadingComments(true);
      apiGet(`/api/v1/posts/${data.id}/comments`)
        .then((res: any) => {
          if (res && res.items) {
            setCommentsList(res.items);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingComments(false));
    } else {
      setCommentsList([]);
    }
  }, [isOpen, data.id]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !data.id) return;
    try {
      const res = await apiPost(`/api/v1/posts/${data.id}/comments`, {
        content: newComment,
      });
      setCommentsList((prev) => [res, ...prev]);
      setNewComment("");
      updatePost(data.id, { comments: (data.comments || 0) + 1 });
    } catch (err) {
      console.error(err);
    }
  };

  const adaptTime = (dateStr: string) => {
    if (!dateStr) return "Just now";
    const now = new Date();
    const created = new Date(dateStr);
    const diffMs = now.getTime() - created.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return `${Math.floor(diffMs / 60000)}m`;
    if (diffH < 24) return `${diffH}h`;
    return `${Math.floor(diffH / 24)}d`;
  };

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
                  icon={
                    <Text style={{ fontSize: "20px", color: "#1C1C1E" }}>
                      ×
                    </Text>
                  }
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
                    <Row
                      style={{ gap: "8px", flexWrap: "wrap", marginTop: "4px" }}
                    >
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

                {/* Real Comments */}
                <Column style={{ gap: "16px" }}>
                  {loadingComments ? (
                    <Text style={{ color: "#AEAEB2", fontSize: "0.85rem" }}>
                      Đang tải bình luận...
                    </Text>
                  ) : commentsList.length === 0 ? (
                    <Text style={{ color: "#AEAEB2", fontSize: "0.85rem" }}>
                      Chưa có bình luận nào.
                    </Text>
                  ) : (
                    commentsList.map((c) => {
                      const name =
                        c.user?.display_name ||
                        c.user?.username ||
                        `User ${c.user?.id || ""}`;
                      const avatarSrc =
                        c.user?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;
                      return (
                        <Row
                          key={c.id}
                          style={{ gap: "12px", alignItems: "flex-start" }}
                        >
                          <Avatar src={avatarSrc} size="s" />
                          <Column style={{ gap: "4px" }}>
                            <Text
                              style={{
                                color: "#1C1C1E",
                                fontSize: "0.8rem",
                                lineHeight: 1.6,
                              }}
                            >
                              <span
                                style={{ fontWeight: 700, marginRight: "6px" }}
                              >
                                {name}
                              </span>
                              {c.content}
                            </Text>
                            <Row style={{ gap: "12px", alignItems: "center" }}>
                              <Text
                                style={{ color: "#AEAEB2", fontSize: "0.7rem" }}
                              >
                                {adaptTime(c.created_at)}
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
                            style={{
                              marginLeft: "auto",
                              cursor: "pointer",
                              marginTop: "4px",
                            }}
                          />
                        </Row>
                      );
                    })
                  )}
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
                      onClick={async () => {
                        const newIsLiked = !data.isLiked;
                        const newLikes = newIsLiked
                          ? data.likes + 1
                          : Math.max(0, data.likes - 1);
                        updatePost(data.id, {
                          isLiked: newIsLiked,
                          likes: newLikes,
                        });
                        try {
                          await apiPost(`/api/v1/posts/${data.id}/like`, {});
                        } catch (e) {
                          updatePost(data.id, {
                            isLiked: data.isLiked,
                            likes: data.likes,
                          });
                        }
                      }}
                    >
                      <Heart
                        size={24}
                        color={
                          data.isLiked
                            ? "var(--brand-solid-strong)"
                            : "var(--neutral-alpha-medium)"
                        }
                        fill={
                          data.isLiked ? "var(--brand-solid-strong)" : "none"
                        }
                      />
                      <Text
                        variant="label-default-l"
                        weight="strong"
                        onBackground="neutral-strong"
                      >
                        {data.likes || 0}
                      </Text>
                    </Row>
                    <Row
                      gap="8"
                      vertical="center"
                      style={{ cursor: "pointer" }}
                    >
                      <MessageCircle
                        size={24}
                        color="var(--neutral-alpha-medium)"
                      />
                      <Text
                        variant="label-default-l"
                        weight="strong"
                        onBackground="neutral-strong"
                      >
                        {data.comments || 0}
                      </Text>
                    </Row>
                  </Row>
                  <Row
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsSaved(!isSaved)}
                  >
                    <Bookmark
                      size={24}
                      color={
                        isSaved
                          ? "var(--brand-solid-strong)"
                          : "var(--neutral-alpha-medium)"
                      }
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
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlePostComment();
                  }}
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
                  onClick={handlePostComment}
                  style={{
                    color: newComment.trim() ? "#ff6b35" : "#AEAEB2",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: newComment.trim() ? "pointer" : "default",
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
