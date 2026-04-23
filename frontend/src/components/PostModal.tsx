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
  MapPin,
  Send,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
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
  const [isSaved, setIsSaved] = React.useState(data.isSaved || false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [commentsList, setCommentsList] = React.useState<any[]>([]);
  const [loadingComments, setLoadingComments] = React.useState(false);
  const [newComment, setNewComment] = React.useState("");
  const [isPostingComment, setIsPostingComment] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && data.id) {
      setLoadingComments(true);
      apiGet(`/api/v1/posts/${data.id}/comments`)
        .then((res: any) => {
          if (res && res.items) setCommentsList(res.items);
        })
        .catch(console.error)
        .finally(() => setLoadingComments(false));

      // Fetch bookmark status for this post
      apiGet(`/api/v1/bookmarks?limit=100`)
        .then((res: any) => {
          const found = res.items?.find((b: any) => b.post?.id === data.id);
          if (found) setIsSaved(true);
        })
        .catch(console.error);
    } else {
      setCommentsList([]);
    }
  }, [isOpen, data.id]);

  const handleToggleSave = async () => {
    if (isSaving) return;
    // Optimistic flip — instant feedback
    setIsSaved((prev) => !prev);
    setIsSaving(true);
    try {
      const res: any = await apiPost(`/api/v1/bookmarks/toggle`, { post_id: data.id });
      // Correct state from server truth
      setIsSaved(res.action === "created");
    } catch (err) {
      // Revert on error
      setIsSaved((prev) => !prev);
      console.error("Failed to toggle bookmark:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !data.id || isPostingComment) return;
    const content = newComment.trim();
    setIsPostingComment(true);
    setNewComment("");
    try {
      const res = await apiPost(`/api/v1/posts/${data.id}/comments`, { content });
      setCommentsList((prev) => [res, ...prev]);
      updatePost(data.id, { comments: (data.comments || 0) + 1 });
    } catch (err) {
      console.error(err);
      setNewComment(content);
    } finally {
      setIsPostingComment(false);
    }
  };

  const adaptTime = (dateStr: string) => {
    if (!dateStr) return "Vừa xong";
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return `${Math.floor(diffMs / 60000)}p`;
    if (diffH < 24) return `${diffH}g`;
    return `${Math.floor(diffH / 24)}n`;
  };

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
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "1080px",
              height: "88vh",
              backgroundColor: "#FFFFFF",
              borderRadius: "28px",
              overflow: "hidden",
              boxShadow: "0 40px 100px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "row",
            }}
          >
            {/* ── Left: Media ── */}
            <div
              style={{
                width: "56%",
                height: "100%",
                backgroundColor: "#0a0a0a",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {/* Subtle gradient vignette */}
              <div
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
                  objectFit: "contain",
                  display: "block",
                }}
              />
              {/* Bottom location badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "20px",
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "20px",
                  padding: "6px 12px",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <MapPin size={12} color="rgba(255,255,255,0.85)" />
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.02em" }}>
                  {data.spotName}
                </span>
              </div>
            </div>

            {/* ── Right: Info & Comments ── */}
            <Column
              style={{
                width: "44%",
                height: "100%",
                backgroundColor: "#FAFAFA",
                borderLeft: "1px solid #EBEBEB",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "18px 20px 16px",
                  borderBottom: "1px solid #F0F0F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                  <div style={{ position: "relative" }}>
                    <Avatar src={data.avatar} size="m" />
                    {/* Online dot */}
                    <div style={{
                      position: "absolute",
                      bottom: 1,
                      right: 1,
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                      border: "2px solid #FFFFFF",
                    }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#111", letterSpacing: "-0.01em" }}>
                      {data.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                      <MapPin size={10} color="#C0C0C0" />
                      <span style={{ color: "#AEAEB2", fontSize: "0.68rem", fontWeight: 500 }}>
                        {data.location}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: "1px solid #E8E8E8",
                    backgroundColor: "#F5F5F5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#EBEBEB")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F5F5F5")}
                >
                  <X size={15} color="#555" />
                </button>
              </div>

              {/* Scrollable: Caption + Comments */}
              <div
                className="no-scrollbar"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {/* Caption */}
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <Avatar src={data.avatar} size="s" />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "0.83rem", lineHeight: 1.55, color: "#1C1C1E" }}>
                      <span style={{ fontWeight: 700, marginRight: "5px" }}>{data.name}</span>
                      {data.review}
                    </p>
                    {data.tags?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                        {data.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              padding: "3px 10px",
                              backgroundColor: "#FFF0EA",
                              borderRadius: "20px",
                              fontSize: "0.68rem",
                              fontWeight: 600,
                              color: "#ff6b35",
                              border: "1px solid rgba(255,107,53,0.15)",
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", backgroundColor: "#F0F0F0" }} />

                {/* Comments */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {loadingComments ? (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                          style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#D0D0D0" }}
                        />
                      ))}
                    </div>
                  ) : commentsList.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 0" }}>
                      <MessageCircle size={28} color="#E0E0E0" />
                      <p style={{ margin: "8px 0 0", color: "#C0C0C0", fontSize: "0.8rem" }}>Chưa có bình luận nào</p>
                    </div>
                  ) : (
                    commentsList.map((c, idx) => {
                      const name = c.user?.display_name || c.user?.username || `User`;
                      const avatarSrc = c.user?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;
                      return (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}
                        >
                          <Avatar src={avatarSrc} size="s" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                backgroundColor: "#F5F5F7",
                                borderRadius: "14px",
                                borderTopLeftRadius: "4px",
                                padding: "8px 12px",
                              }}
                            >
                              <p style={{ margin: 0, fontSize: "0.8rem", lineHeight: 1.5, color: "#1C1C1E" }}>
                                <span style={{ fontWeight: 700, marginRight: "5px" }}>{name}</span>
                                {(c.user?.title || c.user?.level) && (
                                  <span
                                    style={{
                                      backgroundColor: c.user?.title ? "rgba(255, 107, 53, 0.12)" : "rgba(0, 0, 0, 0.05)",
                                      color: c.user?.title ? "#ff6b35" : "#888",
                                      padding: "2px 6px",
                                      borderRadius: "6px",
                                      fontSize: "0.6rem",
                                      fontWeight: 700,
                                      marginRight: "6px",
                                      textTransform: c.user?.title ? "uppercase" : "none",
                                      letterSpacing: "0.4px",
                                      display: "inline-block",
                                      verticalAlign: "middle",
                                      lineHeight: "1",
                                      marginTop: "-2px",
                                      border: c.user?.title ? "1px solid rgba(255, 107, 53, 0.2)" : "1px solid rgba(0, 0, 0, 0.08)"
                                    }}
                                  >
                                    {c.user?.title || `Lv. ${c.user?.level || 1}`}
                                  </span>
                                )}
                                <span>{c.content}</span>
                              </p>
                            </div>
                            <div style={{ display: "flex", gap: "12px", marginTop: "5px", paddingLeft: "4px" }}>
                              <span style={{ color: "#C0C0C0", fontSize: "0.68rem" }}>{adaptTime(c.created_at)}</span>
                              <span style={{ color: "#C0C0C0", fontSize: "0.68rem", fontWeight: 600, cursor: "pointer" }}>
                                Trả lời
                              </span>
                            </div>
                          </div>
                          <button
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", marginTop: "2px" }}
                          >
                            <Heart size={13} color="#D0D0D0" />
                          </button>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div
                style={{
                  padding: "12px 20px",
                  borderTop: "1px solid #F0F0F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#FFFFFF",
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                  {/* Like */}
                  <motion.button
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
                      backgroundColor: data.isLiked ? "#FFF0EA" : "transparent",
                      transition: "background 0.2s",
                    }}
                    onClick={async () => {
                      const newIsLiked = !data.isLiked;
                      const newLikes = newIsLiked ? data.likes + 1 : Math.max(0, data.likes - 1);
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
                      color={data.isLiked ? "#ff6b35" : "#C0C0C0"}
                      fill={data.isLiked ? "#ff6b35" : "none"}
                      strokeWidth={data.isLiked ? 2.5 : 2}
                    />
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: data.isLiked ? "#ff6b35" : "#888" }}>
                      {data.likes || 0}
                    </span>
                  </motion.button>

                  {/* Comment count */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px" }}>
                    <MessageCircle size={20} color="#C0C0C0" />
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#888" }}>
                      {data.comments || 0}
                    </span>
                  </div>
                </div>

                {/* Save */}
                <motion.button
                  whileTap={isSaving ? {} : { scale: 0.85 }}
                  animate={isSaving ? { opacity: 0.5 } : { opacity: 1 }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    padding: "6px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "opacity 0.15s",
                  }}
                  onClick={handleToggleSave}
                  disabled={isSaving}
                >
                  <motion.span
                    animate={isSaved ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ display: "inline-flex" }}
                  >
                    <Bookmark
                      size={20}
                      color={isSaved ? "#ff6b35" : "#C0C0C0"}
                      fill={isSaved ? "#ff6b35" : "none"}
                      strokeWidth={isSaved ? 2.5 : 2}
                    />
                  </motion.span>
                </motion.button>
              </div>

              {/* Comment Input Footer */}
              <div
                style={{
                  padding: "12px 16px 14px",
                  borderTop: "1px solid #F0F0F0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor: "#FFFFFF",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#F5F5F7",
                    borderRadius: "22px",
                    padding: "8px 8px 8px 14px",
                    border: "1.5px solid transparent",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e: React.FocusEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = "rgba(255,107,53,0.35)")}
                  onBlur={(e: React.FocusEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = "transparent")}
                >
                  <Input
                    value={newComment}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewComment(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") handlePostComment(); }}
                    placeholder="Thêm bình luận..."
                    disabled={isPostingComment}
                    style={{
                      flex: 1,
                      border: "none",
                      backgroundColor: "transparent",
                      padding: 0,
                      fontSize: "0.83rem",
                      height: "auto",
                      outline: "none",
                      color: "#1C1C1E",
                    }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePostComment}
                    disabled={!newComment.trim() || isPostingComment}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      border: "none",
                      backgroundColor: newComment.trim() ? "#ff6b35" : "#E5E5EA",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: newComment.trim() ? "pointer" : "default",
                      flexShrink: 0,
                      transition: "background 0.2s",
                    }}
                  >
                    <Send size={14} color={newComment.trim() ? "#fff" : "#AEAEB2"} />
                  </motion.button>
                </div>
              </div>
            </Column>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}