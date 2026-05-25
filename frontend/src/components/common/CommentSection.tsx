"use client";

import React from "react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/OnceUI";
import { apiGet, apiPost } from "@/lib/api";
import { MessageCircle, Send, X } from "lucide-react";
import { FaMedal } from "react-icons/fa";

type CommentEntityType = "post" | "reel";

interface CommentUser {
  id: number;
  display_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  title?: string | null;
  level?: number | null;
  primary_badge?: {
    id: number;
    name: string;
    icon_name: string;
    accent_color: string;
  } | null;
}

export interface CommentNode {
  id: number;
  content: string;
  parent_id?: number | null;
  created_at?: string | null;
  user?: CommentUser | null;
  replies?: CommentNode[];
}

interface CommentListResponse {
  items?: CommentNode[];
}

interface ReplyTarget {
  commentId: number;
  username: string;
}

interface CommentSectionProps {
  entityType: CommentEntityType;
  entityId: number;
  emptyMessage: string;
  onCommentAdded?: () => void;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  fixedHeader?: React.ReactNode;
  rootStyle?: React.CSSProperties;
  listStyle?: React.CSSProperties;
  inputWrapperStyle?: React.CSSProperties;
}

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=random&size=128";

function adaptTime(dateStr?: string | null) {
  if (!dateStr) return "Vừa xong";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return `${Math.max(1, Math.floor(diffMs / 60000))}p`;
  if (diffH < 24) return `${diffH}g`;
  return `${Math.floor(diffH / 24)}n`;
}

function getDisplayName(comment: CommentNode) {
  return (
    comment.user?.display_name ||
    comment.user?.username ||
    `User ${comment.user?.id ?? comment.id}`
  );
}

function getReplyUsername(comment: CommentNode) {
  return (
    comment.user?.username ||
    comment.user?.display_name ||
    `user${comment.user?.id ?? comment.id}`
  );
}

function getAvatarSrc(comment: CommentNode) {
  const name = getDisplayName(comment);
  return (
    comment.user?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`
  );
}

function insertComment(
  items: CommentNode[],
  nextComment: CommentNode,
  parentId?: number | null,
): CommentNode[] {
  if (!parentId) {
    return [nextComment, ...items];
  }

  return items.map((item) => {
    if (item.id === parentId) {
      return {
        ...item,
        replies: [...(item.replies ?? []), nextComment],
      };
    }

    if (item.replies?.length) {
      return {
        ...item,
        replies: insertComment(item.replies, nextComment, parentId),
      };
    }

    return item;
  });
}

function CommentItem({
  comment,
  depth = 0,
  onReply,
}: {
  comment: CommentNode;
  depth?: number;
  onReply: (comment: CommentNode) => void;
}) {
  const name = getDisplayName(comment);
  const avatarSrc = getAvatarSrc(comment);
  const isReply = depth > 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginLeft: isReply ? 18 : 0,
        paddingLeft: isReply ? 12 : 0,
        borderLeft: isReply ? "1px solid rgba(255, 107, 53, 0.16)" : "none",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}
      >
        <Avatar src={avatarSrc || DEFAULT_AVATAR} size="s" name={name} />
        <div style={{ flex: 1 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                backgroundColor: isReply ? "#FFF7F2" : "#F5F5F7",
                borderRadius: "14px",
                borderTopLeftRadius: "4px",
                padding: "8px 12px",
                border: isReply ? "1px solid rgba(255, 107, 53, 0.12)" : "none",
                width: "fit-content"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 600,
                    color: "#1d1d1f",
                  }}
                >
                  {name}
                </span>
                {(comment.user?.level || comment.user?.title) && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "#e76c3fff",
                      backgroundColor: "rgba(254, 142, 72, 0.08)",
                      padding: "1px 6px",
                      borderRadius: "10px",
                    }}
                  >
                    Lv.{comment.user?.level ?? 1} {comment.user?.title}
                  </span>
                )}
                {comment.user?.primary_badge && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: comment.user.primary_badge.accent_color,
                      backgroundColor: `${comment.user.primary_badge.accent_color}12`,
                      padding: "1px 6px",
                      borderRadius: "10px",
                      border: `1px solid ${comment.user.primary_badge.accent_color}33`,
                    }}
                    title={comment.user.primary_badge.name}
                  >
                    <FaMedal />
                    {comment.user.primary_badge.name}
                  </div>
                )}
              </div>
              <div
                style={{
                  fontSize: "13.5px",
                  lineHeight: "1.5",
                  color: "#333",
                  marginTop: "2px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {comment.content}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "5px", paddingLeft: "4px" }}>
            <span style={{ color: "#C0C0C0", fontSize: "0.68rem" }}>
              {adaptTime(comment.created_at)}
            </span>
            <button
              type="button"
              onClick={() => onReply(comment)}
              style={{
                color: "#A3A3A3",
                fontSize: "0.68rem",
                fontWeight: 700,
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              Trả lời
            </button>
          </div>
        </div>

      </motion.div>

      {comment.replies?.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CommentSection({
  entityType,
  entityId,
  emptyMessage,
  onCommentAdded,
  footer,
  header,
  fixedHeader,
  rootStyle,
  listStyle,
  inputWrapperStyle,
}: CommentSectionProps) {
  const [comments, setComments] = React.useState<CommentNode[]>([]);
  const [loadingComments, setLoadingComments] = React.useState(false);
  const [newComment, setNewComment] = React.useState("");
  const [isPostingComment, setIsPostingComment] = React.useState(false);
  const [replyingTo, setReplyingTo] = React.useState<ReplyTarget | null>(null);
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!entityId) return;

    const path =
      entityType === "post"
        ? `/api/v1/posts/${entityId}/comments`
        : `/api/v1/reels/${entityId}/comments`;

    setLoadingComments(true);
    apiGet<CommentListResponse>(path)
      .then((res) => setComments(res.items || []))
      .catch(console.error)
      .finally(() => setLoadingComments(false));
  }, [entityId, entityType]);

  const handleReply = (comment: CommentNode) => {
    const username = getReplyUsername(comment);
    setReplyingTo({
      commentId: comment.id,
      username,
    });
    setNewComment(`@${username} `);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length,
      );
    });
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setNewComment("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleSubmit = async () => {
    const content = newComment.trim();
    if (!content || isPostingComment) return;

    const path =
      entityType === "post"
        ? `/api/v1/posts/${entityId}/comments`
        : `/api/v1/reels/${entityId}/comments`;

    setIsPostingComment(true);
    try {
      const nextComment = await apiPost<CommentNode>(path, {
        content,
        parent_id: replyingTo?.commentId,
      });
      setComments((prev) =>
        insertComment(prev, nextComment, nextComment.parent_id),
      );
      setNewComment("");
      setReplyingTo(null);
      onCommentAdded?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPostingComment(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        ...rootStyle,
      }}
    >
      {fixedHeader}
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          ...listStyle,
        }}
      >
        {header}
        {loadingComments ? (
          <div style={{ display: "flex", gap: "8px", alignItems: "center", padding: "0 16px" }}>
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
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <MessageCircle size={28} color="#E0E0E0" />
            <p style={{ margin: "8px 0 0", color: "#C0C0C0", fontSize: "0.8rem" }}>{emptyMessage}</p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} onReply={handleReply} />
            ))}
          </div>
        )}
      </div>

      {footer}

      <div
        style={{
          padding: "12px 16px 14px",
          borderTop: "1px solid #F0F0F0",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          backgroundColor: "#FFFFFF",
          flexShrink: 0,
          ...inputWrapperStyle,
        }}
      >
        {replyingTo ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              padding: "0 4px",
            }}
          >
            <span style={{ fontSize: "0.72rem", color: "#8A8A8A", fontWeight: 600 }}>
              Đang trả lời @{replyingTo.username}
            </span>
            <button
              type="button"
              onClick={handleCancelReply}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                border: "none",
                background: "none",
                color: "#A0A0A0",
                cursor: "pointer",
                padding: 0,
                fontSize: "0.72rem",
                fontWeight: 700,
              }}
            >
              <X size={12} />
              Hủy
            </button>
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#F5F5F7",
            borderRadius: "22px",
            padding: "8px 8px 8px 14px",
            border: `1.5px solid ${isInputFocused ? "rgba(255,107,53,0.35)" : "transparent"
              }`,
            transition: "border-color 0.2s",
          }}
        >
          <input
            ref={inputRef}
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSubmit();
              }
            }}
            placeholder={
              replyingTo
                ? `Trả lời @${replyingTo.username}...`
                : "Thêm bình luận..."
            }
            disabled={isPostingComment}
            style={{
              flex: 1,
              border: "none",
              backgroundColor: "transparent",
              padding: 0,
              fontSize: "0.83rem",
              outline: "none",
              color: "#1C1C1E",
            }}
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => void handleSubmit()}
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
            }}
          >
            <Send size={14} color="#fff" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
