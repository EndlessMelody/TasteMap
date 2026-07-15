"use client";

import React from "react";
import { motion } from "framer-motion";
import { Avatar, Column, Row } from "@once-ui-system/core";
import { apiGet, apiPost } from "@/lib/api";
import { MessageCircle, Send, X } from "lucide-react";
import { FaMedal } from "react-icons/fa";
import { tokens } from "@/styles/tokens";

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
    <Column
      style={{
        gap: "10px",
        marginTop: 0,
        marginBottom: 0,
        marginLeft: isReply ? 18 : 0,
        marginRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: isReply ? 12 : 0,
        paddingRight: 0,
        borderLeft: isReply ? "1px solid rgba(255, 107, 53, 0.16)" : "none",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}
      >
        <Avatar src={avatarSrc || DEFAULT_AVATAR} size="s" />
        <Column style={{ flex: 1 }}>
          <Column style={{ flex: 1, minWidth: 0 }}>
            <Column
              style={{
                backgroundColor: isReply ? tokens.color.surfaceWarm : tokens.color.surfaceMuted,
                borderRadius: "14px",
                borderTopLeftRadius: "4px",
                paddingTop: "8px",
                paddingBottom: "8px",
                paddingLeft: "12px",
                paddingRight: "12px",
                border: isReply ? `1px solid ${tokens.color.warm}1F` : "none",
                width: "fit-content"
              }}
            >
              <Row
                vertical="center"
                style={{
                  gap: "5px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 600,
                    color: tokens.color.text,
                  }}
                >
                  {name}
                </span>
                {(comment.user?.level || comment.user?.title) && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      color: tokens.color.warm,
                      backgroundColor: `${tokens.color.warm}14`,
                      padding: "1px 6px",
                      borderRadius: "10px",
                    }}
                  >
                    Lv.{comment.user?.level ?? 1} {comment.user?.title}
                  </span>
                )}
                {comment.user?.primary_badge && (
                  <Row
                    vertical="center"
                    style={{
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
                  </Row>
                )}
              </Row>
              <Column
                style={{
                  fontSize: "13.5px",
                  lineHeight: "1.5",
                  color: tokens.color.text,
                  marginTop: "2px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {comment.content}
              </Column>
            </Column>
          </Column>
          <Row style={{ gap: "12px", marginTop: "5px", paddingLeft: "4px" }}>
            <span style={{ color: tokens.color.textSubtle, fontSize: "0.68rem" }}>
              {adaptTime(comment.created_at)}
            </span>
            <button
              type="button"
              onClick={() => onReply(comment)}
              style={{
                color: tokens.color.textSubtle,
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
          </Row>
        </Column>

      </motion.div>

      {comment.replies?.length ? (
        <Column style={{ gap: "10px" }}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </Column>
      ) : null}
    </Column>
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
    <Column
      style={{
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        ...rootStyle,
      }}
    >
      {fixedHeader}
      <Column
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          gap: "16px",
          ...listStyle,
        }}
      >
        {header}
        {loadingComments ? (
          <Row
            vertical="center"
            style={{
              gap: "8px",
              paddingTop: "0",
              paddingBottom: "0",
              paddingLeft: "16px",
              paddingRight: "16px",
            }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: tokens.color.borderStrong }}
              />
            ))}
          </Row>
        ) : comments.length === 0 ? (
          <Column
            style={{
              textAlign: "center",
              paddingTop: "24px",
              paddingBottom: "24px",
              paddingLeft: "0",
              paddingRight: "0",
            }}
          >
            <MessageCircle size={28} color={tokens.color.borderStrong} />
            <p style={{ margin: "8px 0 0", color: tokens.color.textSubtle, fontSize: "0.8rem" }}>{emptyMessage}</p>
          </Column>
        ) : (
          <Column
            style={{
              gap: "16px",
            }}
          >
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} onReply={handleReply} />
            ))}
          </Column>
        )}
      </Column>

      {footer}

      <Column
        style={{
          paddingTop: "12px",
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingBottom: "14px",
          borderTop: `1px solid ${tokens.color.border}`,
          gap: "8px",
          backgroundColor: tokens.color.surface,
          flexShrink: 0,
          ...inputWrapperStyle,
        }}
      >
        {replyingTo ? (
          <Row
            vertical="center"
            style={{
              justifyContent: "space-between",
              gap: "12px",
              paddingTop: "0",
              paddingBottom: "0",
              paddingLeft: "4px",
              paddingRight: "4px",
            }}
          >
            <span style={{ fontSize: "0.72rem", color: tokens.color.textMuted, fontWeight: 600 }}>
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
                color: tokens.color.textMuted,
                cursor: "pointer",
                padding: 0,
                fontSize: "0.72rem",
                fontWeight: 700,
              }}
            >
              <X size={12} />
              Hủy
            </button>
          </Row>
        ) : null}

        <Row
          vertical="center"
          style={{
            gap: "8px",
            backgroundColor: tokens.color.surfaceMuted,
            borderRadius: "22px",
            paddingTop: "8px",
            paddingRight: "8px",
            paddingBottom: "8px",
            paddingLeft: "14px",
            border: `1.5px solid ${isInputFocused ? `${tokens.color.warm}59` : "transparent"
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
              color: tokens.color.text,
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
              backgroundColor: newComment.trim() ? tokens.color.warm : tokens.color.borderStrong,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: newComment.trim() ? "pointer" : "default",
              flexShrink: 0,
            }}
          >
            <Send size={14} color={tokens.color.textInverse} />
          </motion.button>
        </Row>
      </Column>
    </Column>
  );
}
