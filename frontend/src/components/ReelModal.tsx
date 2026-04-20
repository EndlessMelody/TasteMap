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
  Play,
  Send,
  X,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ReelData } from "@/types/dashboard";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useSocialStore } from "@/store/socialStore";

interface ReelModalProps {
  isOpen: boolean;
  data: ReelData;
  onClose: () => void;
}

export default function ReelModal({
  isOpen,
  data: initialData,
  onClose,
}: ReelModalProps) {
  const { user: currentUser } = useAuth();
  const updateReel = useSocialStore((state) => state.updateReel);
  const data =
    useSocialStore((state) =>
      state.reels.find((r) => r.id === initialData.id),
    ) || initialData;

  const [isSaved, setIsSaved] = React.useState(false);
  const [comments, setComments] = React.useState<any[]>([]);
  const [newComment, setNewComment] = React.useState("");
  const [isLoadingComments, setIsLoadingComments] = React.useState(false);
  const [isPostingComment, setIsPostingComment] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && data?.id) {
      apiGet(`/api/v1/reels/${data.id}`).catch(console.error);
      setIsLoadingComments(true);
      apiGet(`/api/v1/reels/${data.id}/comments`)
        .then((res: any) => setComments(res.items || []))
        .catch(console.error)
        .finally(() => setIsLoadingComments(false));
    }
  }, [isOpen, data?.id]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !data?.id || isPostingComment) return;
    const content = newComment.trim();
    setIsPostingComment(true);
    setNewComment("");
    try {
      const res = await apiPost(`/api/v1/reels/${data.id}/comments`, { content });
      setComments([res, ...comments]);
      updateReel(data.id, { comments: (data.comments || 0) + 1 });
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
            backgroundColor: "rgba(0,0,0,0.82)",
            backdropFilter: "blur(20px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.93, y: 28, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.93, y: 28, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "1080px",
              height: "88vh",
              backgroundColor: "#111",
              borderRadius: "28px",
              overflow: "hidden",
              boxShadow: "0 48px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "row",
            }}
          >
            {/* ── Left: Video / Thumbnail ── */}
            <div
              style={{
                width: "56%",
                height: "100%",
                backgroundColor: "#000",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {data.videoUrl ? (
                <video
                  src={data.videoUrl}
                  autoPlay
                  loop
                  muted
                  controls
                  style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                />
              ) : (
                <>
                  <img
                    src={data.img}
                    alt={data.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  {/* Gradient overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)",
                      pointerEvents: "none",
                    }}
                  />
                  {/* Play button */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(14px)",
                      border: "1.5px solid rgba(255,255,255,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Play size={28} color="white" fill="white" style={{ marginLeft: 3 }} />
                  </motion.div>
                </>
              )}

              {/* Views badge bottom-left */}
              <div
                style={{
                  position: "absolute",
                  bottom: "18px",
                  left: "18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  backgroundColor: "rgba(0,0,0,0.45)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "20px",
                  padding: "5px 11px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  zIndex: 2,
                }}
              >
                <Eye size={11} color="rgba(255,255,255,0.8)" />
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.7rem", fontWeight: 600 }}>
                  {data.views?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            {/* ── Right: Info & Comments ── */}
            <div
              style={{
                width: "44%",
                height: "100%",
                backgroundColor: "#FAFAFA",
                borderLeft: "1px solid rgba(0,0,0,0.06)",
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
                    <Avatar src={data.userAvatar} size="m" />
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
                      {data.user}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                      <Eye size={10} color="#C0C0C0" />
                      <span style={{ color: "#AEAEB2", fontSize: "0.68rem", fontWeight: 500 }}>
                        {data.views?.toLocaleString() || 0} lượt xem
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

              {/* Title / Caption */}
              <div style={{ padding: "16px 20px 0", flexShrink: 0, backgroundColor: "#FFFFFF" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <Avatar src={data.userAvatar} size="s" />
                  <p style={{ margin: 0, fontSize: "0.83rem", lineHeight: 1.55, color: "#1C1C1E", flex: 1 }}>
                    <span style={{ fontWeight: 700, marginRight: "5px" }}>{data.user}</span>
                    {data.title}
                  </p>
                </div>
                <div style={{ height: "1px", backgroundColor: "#F0F0F0", marginTop: "16px" }} />
              </div>

              {/* Scrollable Comments */}
              <div
                className="no-scrollbar"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px 20px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  backgroundColor: "#FAFAFA",
                }}
              >
                {isLoadingComments ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", padding: "8px 0" }}>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                        style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#D0D0D0" }}
                      />
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <MessageCircle size={30} color="#E0E0E0" />
                    <p style={{ margin: "8px 0 0", color: "#C0C0C0", fontSize: "0.8rem" }}>
                      Hãy là người đầu tiên bình luận!
                    </p>
                  </div>
                ) : (
                  comments.map((c: any, idx: number) => {
                    const name = c.user?.display_name || c.user?.username || "Unknown";
                    const avatarSrc = c.user?.avatar_url ||
                      "https://i.pinimg.com/736x/46/83/99/46839974515f6ca59a6023ef5e061d3e.jpg";
                    return (
                      <motion.div
                        key={c.id || Math.random()}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}
                      >
                        <Avatar src={avatarSrc} size="s" name={name} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              backgroundColor: "#F0F0F3",
                              borderRadius: "14px",
                              borderTopLeftRadius: "4px",
                              padding: "8px 12px",
                            }}
                          >
                            <p style={{ margin: 0, fontSize: "0.8rem", lineHeight: 1.5, color: "#1C1C1E" }}>
                              <span style={{ fontWeight: 700, marginRight: "5px" }}>{name}</span>
                              {c.content}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: "12px", marginTop: "5px", paddingLeft: "4px" }}>
                            <span style={{ color: "#C0C0C0", fontSize: "0.68rem" }}>
                              {adaptTime(c.created_at)}
                            </span>
                            <span style={{ color: "#C0C0C0", fontSize: "0.68rem", fontWeight: 600, cursor: "pointer" }}>
                              Trả lời
                            </span>
                          </div>
                        </div>
                        <button style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", marginTop: "2px" }}>
                          <Heart size={13} color="#D0D0D0" />
                        </button>
                      </motion.div>
                    );
                  })
                )}
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
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
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
                      if (!data?.id) return;
                      const newIsLiked = !data.isLiked;
                      const newLikes = newIsLiked
                        ? (data.likes || 0) + 1
                        : Math.max(0, (data.likes || 0) - 1);
                      updateReel(data.id, { isLiked: newIsLiked, likes: newLikes });
                      try {
                        await apiPost(`/api/v1/reels/${data.id}/like`, {});
                      } catch {
                        updateReel(data.id, { isLiked: data.isLiked, likes: data.likes });
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

                  {/* Comments count */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px" }}>
                    <MessageCircle size={20} color="#C0C0C0" />
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#888" }}>
                      {comments.length}
                    </span>
                  </div>
                </div>

                {/* Save */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "6px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => setIsSaved(!isSaved)}
                >
                  <Bookmark
                    size={20}
                    color={isSaved ? "#ff6b35" : "#C0C0C0"}
                    fill={isSaved ? "#ff6b35" : "none"}
                    strokeWidth={isSaved ? 2.5 : 2}
                  />
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
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,107,53,0.35)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
                >
                  <Input
                    value={newComment}
                    onChange={(e: any) => setNewComment(e.target.value)}
                    onKeyDown={(e: any) => { if (e.key === "Enter") handlePostComment(); }}
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 