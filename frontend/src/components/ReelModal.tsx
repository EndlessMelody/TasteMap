"use client";

import React from "react";
import { Avatar } from "@/components/OnceUI";
import { Heart, MessageCircle, Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ReelData } from "@/types/dashboard";
import { apiGet, apiPost } from "@/lib/api";
import { BookmarkButton } from "@/components/common/BookmarkButton";
import { CommentSection } from "@/components/common/CommentSection";
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
  const updateReel = useSocialStore((state) => state.updateReel);
  const data =
    useSocialStore((state) =>
      state.reels.find((reel) => reel.id === initialData.id),
    ) || initialData;

  React.useEffect(() => {
    if (isOpen && data?.id) {
      apiGet(`/api/v1/reels/${data.id}`).catch(console.error);
    }
  }, [isOpen, data?.id]);

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
            onClick={(event) => event.stopPropagation()}
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
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              ) : (
                <>
                  <img
                    src={data.img}
                    alt={data.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        width: "54px",
                        height: "54px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.92)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
                      }}
                    >
                      <Play size={22} color="#ff6b35" fill="#ff6b35" style={{ marginLeft: 2 }} />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div
              style={{
                width: "44%",
                height: "100%",
                backgroundColor: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  padding: "18px 20px 14px",
                  borderBottom: "1px solid #F0F0F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                  <Avatar src={data.userAvatar} size="m" />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "#1C1C1E",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {data.user}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "#8E8E93" }}>
                      Discover Reel
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "#F5F5F5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={15} color="#555" />
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                  overflow: "hidden",
                }}
              >
                <CommentSection
                  entityType="reel"
                  entityId={data.id}
                  emptyMessage="Hãy là người đầu tiên bình luận!"
                  onCommentAdded={() =>
                    updateReel(data.id, { comments: (data.comments || 0) + 1 })
                  }
                  rootStyle={{ flex: 1 }}
                  listStyle={{ padding: "16px 20px" }}
                  fixedHeader={
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #F0F0F0", backgroundColor: "#FFFFFF" }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <Avatar src={data.userAvatar} size="s" />
                        <p style={{ margin: 0, fontSize: "0.83rem", lineHeight: 1.55, color: "#1C1C1E", flex: 1 }}>
                          <span style={{ fontWeight: 700, marginRight: "5px" }}>{data.user}</span>
                          {data.title}
                        </p>
                      </div>
                    </div>
                  }
                  footer={
                    <div
                      style={{
                        padding: "12px 20px",
                        borderTop: "1px solid #F0F0F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        backgroundColor: "#FFFFFF",
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
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
                            backgroundColor: data.isLiked ? "#FFF0EA" : "transparent",
                            transition: "background 0.2s",
                          }}
                          onClick={async () => {
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
                          <span
                            style={{
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              color: data.isLiked ? "#ff6b35" : "#888",
                            }}
                          >
                            {data.likes || 0}
                          </span>
                        </motion.button>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px" }}>
                          <MessageCircle size={20} color="#C0C0C0" />
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#888" }}>
                            {data.comments || 0}
                          </span>
                        </div>
                      </div>

                      <BookmarkButton
                        entityType="reel"
                        entityId={data.id}
                        isBookmarked={data.isSaved ?? false}
                        size={36}
                        iconSize={20}
                        inactiveColor="#C0C0C0"
                      />
                    </div>
                  }
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
