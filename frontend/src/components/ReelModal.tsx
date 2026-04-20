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
  Share2,
  MessageCircle,
  Play,
  Send,
  Bookmark,
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
      // Trigger API to increment view count natively
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
    setNewComment(""); // Clear immediately

    try {
      const res = await apiPost(`/api/v1/reels/${data.id}/comments`, {
        content: content,
      });
      setComments([res, ...comments]);
      updateReel(data.id, { comments: (data.comments || 0) + 1 });
    } catch (err) {
      console.error(err);
      setNewComment(content); // Restore on error
    } finally {
      setIsPostingComment(false);
    }
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
                </>
              )}
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

                {/* Comments List */}
                <Column style={{ gap: "16px" }}>
                  {isLoadingComments ? (
                    <Text style={{ color: "#AEAEB2", fontSize: "0.85rem" }}>
                      Loading comments...
                    </Text>
                  ) : comments.length > 0 ? (
                    comments.map((c: any) => (
                      <Row
                        key={c.id || Math.random()}
                        style={{ gap: "12px", alignItems: "flex-start" }}
                      >
                        <Avatar
                          src={
                            c.user?.avatar_url ||
                            "https://i.pinimg.com/736x/46/83/99/46839974515f6ca59a6023ef5e061d3e.jpg"
                          }
                          size="s"
                          name={c.user?.display_name || c.user?.username}
                        />
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
                              {c.user?.display_name ||
                                c.user?.username ||
                                "Unknown"}
                            </span>
                            {c.content}
                          </Text>
                          <Row style={{ gap: "12px", alignItems: "center" }}>
                            <Text
                              style={{ color: "#AEAEB2", fontSize: "0.7rem" }}
                            >
                              {c.created_at
                                ? new Date(c.created_at).toLocaleDateString()
                                : "Just now"}
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
                    ))
                  ) : (
                    <Text style={{ color: "#AEAEB2", fontSize: "0.85rem" }}>
                      No comments yet. Be the first!
                    </Text>
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
                        if (!data?.id) return;
                        const newIsLiked = !data.isLiked;
                        const newLikes = newIsLiked
                          ? (data.likes || 0) + 1
                          : Math.max(0, (data.likes || 0) - 1);

                        updateReel(data.id, {
                          isLiked: newIsLiked,
                          likes: newLikes,
                        });
                        try {
                          await apiPost(`/api/v1/reels/${data.id}/like`, {});
                        } catch (err) {
                          updateReel(data.id, {
                            isLiked: data.isLiked,
                            likes: data.likes,
                          });
                          console.error(err);
                        }
                      }}
                    >
                      <Heart
                        size={24}
                        color={
                          data.isLiked
                            ? "#ff6b35"
                            : "#AEAEB2"
                        }
                        fill={
                          data.isLiked ? "#ff6b35" : "none"
                        }
                      />
                      <Text
                        variant="label-default-l"
                        weight="strong"
                        style={{ color: "#1C1C1E" }}
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
                        color="#AEAEB2"
                      />
                      <Text
                        variant="label-default-l"
                        weight="strong"
                        style={{ color: "#1C1C1E" }}
                      >
                        {comments.length}
                      </Text>
                    </Row>
                  </Row>
                  <IconButton
                    icon={
                      <Bookmark
                        size={22}
                        color={
                          isSaved
                            ? "#ff6b35"
                            : "#AEAEB2"
                        }
                        fill={isSaved ? "#ff6b35" : "none"}
                      />
                    }
                    variant="tertiary"
                    onClick={() => setIsSaved(!isSaved)}
                  />
                </Row>
              </Column>

              {/* Input Footer */}
              <Row
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid var(--border-medium)",
                  alignItems: "center",
                  gap: "12px",
                  flexShrink: 0,
                }}
              >
                <Row
                  fillWidth
                  paddingX="m"
                  paddingY="xs"
                  radius="xl"
                  align="center"
                  style={{ backgroundColor: "#F2F2F7" }}
                >
                  <Input
                    value={newComment}
                    onChange={(e: any) => setNewComment(e.target.value)}
                    onKeyDown={(e: any) => {
                      if (e.key === "Enter") handlePostComment();
                    }}
                    placeholder="Add a comment..."
                    disabled={isPostingComment}
                    style={{
                      flex: 1,
                      border: "none",
                      backgroundColor: "transparent",
                      padding: 0,
                      fontSize: "0.85rem",
                      height: "auto"
                    }}
                  />
                  <IconButton
                    icon={isPostingComment ? <Text>...</Text> : <Send size={18} />}
                    variant="ghost"
                    onClick={handlePostComment}
                    disabled={!newComment.trim() || isPostingComment}
                    style={{
                      color: newComment.trim() ? "#ff6b35" : "#AEAEB2",
                      cursor: newComment.trim() ? "pointer" : "default",
                      width: "32px",
                      height: "32px"
                    }}
                  />
                </Row>
              </Row>
            </Column>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
