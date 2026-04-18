"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Column,
  Row,
  Heading,
  Text,
  Avatar,
  IconButton,
  Input,
} from "@/components/OnceUI";
import {
  PanelRightClose,
  MessageSquare,
  Phone,
  Video,
  MoreVertical,
  Plus,
  Smile,
  Send,
  Mic,
  Image as ImageIcon,
  CheckCheck,
} from "lucide-react";
import { Friend } from "./FriendRow";
import { useMessages } from "@/hooks/useMessages";

interface MessagingSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeUser: Friend | null;
}

// ─── Helpers ───────────────────────────────────────────
function isYesterday(time: string) {
  return time.toLowerCase().includes("yesterday");
}

function getDateLabel(time: string): string {
  if (isYesterday(time)) return "Yesterday";
  return "Today";
}

// border-radius per position in consecutive group
function bubbleRadius(
  sender: "me" | "them",
  pos: "single" | "first" | "middle" | "last",
): string {
  const R = 18;
  const t = 4; // tight corner
  if (sender === "me") {
    if (pos === "single") return `${R}px ${R}px ${t}px ${R}px`;
    if (pos === "first") return `${R}px ${R}px ${t}px ${R}px`;
    if (pos === "middle") return `${R}px ${t}px ${t}px ${R}px`;
    return `${R}px ${t}px ${R}px ${R}px`;
  } else {
    if (pos === "single") return `${R}px ${R}px ${R}px ${t}px`;
    if (pos === "first") return `${R}px ${R}px ${R}px ${t}px`;
    if (pos === "middle") return `${t}px ${R}px ${R}px ${t}px`;
    return `${t}px ${R}px ${R}px ${R}px`;
  }
}

// ─── Date separator ────────────────────────────────────
const DateSeparator: React.FC<{ label: string }> = ({ label }) => (
  <Row style={{ alignItems: "center", gap: 12, padding: "4px 0" }}>
    <div style={{ flex: 1, height: 1, backgroundColor: "rgba(0,0,0,0.06)" }} />
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "rgba(0,0,0,0.35)",
        backgroundColor: "#F5F5F7",
        padding: "4px 12px",
        borderRadius: 20,
        border: "1px solid rgba(0,0,0,0.06)",
        whiteSpace: "nowrap",
        letterSpacing: "0.3px",
      }}
    >
      {label}
    </span>
    <div style={{ flex: 1, height: 1, backgroundColor: "rgba(0,0,0,0.06)" }} />
  </Row>
);

// ─── Main Component ─────────────────────────────────────
export const MessagingSidebar: React.FC<MessagingSidebarProps> = ({
  isOpen,
  onToggle,
  activeUser,
}) => {
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const {
    messages: chatHistory,
    sending,
    sendMessage,
  } = useMessages(activeUser?.id ?? null);

  const handleSend = async () => {
    const text = message.trim();
    if (!text || sending) return;
    setMessage("");
    await sendMessage(text);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, activeUser]);

  if (!isOpen) return null;

  // ── Build enriched message list with group positions & date separators ──
  type EnrichedMsg = (typeof chatHistory)[number] & {
    pos: "single" | "first" | "middle" | "last";
    showDate: string | null;
    isLastMe: boolean;
  };

  const enriched: EnrichedMsg[] = chatHistory.map((msg, i, arr) => {
    const prev = arr[i - 1];
    const next = arr[i + 1];
    const sameAsPrev = prev?.sender === msg.sender;
    const sameAsNext = next?.sender === msg.sender;

    let pos: EnrichedMsg["pos"];
    if (!sameAsPrev && !sameAsNext) pos = "single";
    else if (!sameAsPrev && sameAsNext) pos = "first";
    else if (sameAsPrev && sameAsNext) pos = "middle";
    else pos = "last";

    // date separator: show when time label changes between messages
    const showDate =
      i === 0 || getDateLabel(msg.time) !== getDateLabel(arr[i - 1].time)
        ? getDateLabel(msg.time)
        : null;

    const isLastMe = msg.sender === "me" && (!next || next.sender !== "me");

    return { ...msg, pos, showDate, isLastMe };
  });

  return (
    <Column
      fillHeight
      fillWidth
      style={{
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "0%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "white",
        borderLeft: "1px solid rgba(0,0,0,0.06)",
        borderTopRightRadius: 32,
        borderBottomRightRadius: 32,
      }}
    >
      {/* ── HEADER ── */}
      <Row
        fillWidth
        vertical="center"
        style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          backgroundColor: "white",
          justifyContent: "space-between",
          flexShrink: 0,
          zIndex: 10,
          boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
        }}
      >
        <Row vertical="center" style={{ gap: 12 }}>
          <IconButton
            icon={<PanelRightClose size={18} />}
            onClick={onToggle}
            style={{
              borderRadius: 10,
              backgroundColor: "#E8E8ED",
              width: 36,
              height: 36,
              color: "#3C3C43",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          />
          {activeUser ? (
            <Row vertical="center" style={{ gap: 12 }}>
              <div style={{ position: "relative" }}>
                <Avatar
                  src={activeUser.avatar}
                  size="m"
                  style={{
                    border: "2.5px solid white",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
                    display: "block",
                  }}
                />
                {activeUser.isOnline && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 1,
                      right: 1,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "#34C759",
                      border: "2px solid white",
                    }}
                  />
                )}
              </div>
              <Column style={{ gap: 1 }}>
                <Row style={{ alignItems: "center", gap: 6 }}>
                  <Heading
                    variant="heading-strong-s"
                    style={{ letterSpacing: "-0.3px", color: "#1C1C1E" }}
                  >
                    {activeUser.name}
                  </Heading>
                  {activeUser.match !== undefined && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: activeUser.match >= 85 ? "#16A34A" : "#D97706",
                        backgroundColor:
                          activeUser.match >= 85
                            ? "rgba(52,199,89,0.1)"
                            : "rgba(245,158,11,0.1)",
                        padding: "2px 7px",
                        borderRadius: 10,
                      }}
                    >
                      {activeUser.match}%
                    </span>
                  )}
                </Row>
                <Text
                  variant="body-default-xs"
                  style={{
                    color: activeUser.isOnline ? "#34C759" : "rgba(0,0,0,0.35)",
                    fontWeight: 600,
                  }}
                >
                  {activeUser.isOnline ? "Active now" : "Last seen recently"}
                </Text>
              </Column>
            </Row>
          ) : (
            <Text variant="body-default-s" style={{ color: "rgba(0,0,0,0.4)" }}>
              Select a conversation
            </Text>
          )}
        </Row>

        <Row vertical="center" style={{ gap: 6 }}>
          <IconButton
            icon={<Phone size={17} />}
            style={{
              borderRadius: "50%",
              width: 36,
              height: 36,
              color: "#ff6b35",
              backgroundColor: "rgba(255,107,53,0.07)",
            }}
          />
          <IconButton
            icon={<Video size={17} />}
            style={{
              borderRadius: "50%",
              width: 36,
              height: 36,
              color: "#ff6b35",
              backgroundColor: "rgba(255,107,53,0.07)",
            }}
          />
          <IconButton
            icon={<MoreVertical size={17} />}
            style={{
              borderRadius: "50%",
              width: 36,
              height: 36,
              color: "#8E8E93",
              backgroundColor: "#F2F2F7",
            }}
          />
        </Row>
      </Row>

      {/* ── CHAT AREA ── */}
      <Column
        fillWidth
        flexGrow={1}
        flexShrink={1}
        flexBasis="0%"
        className="no-scrollbar"
        style={{
          minHeight: 0,
          overflowY: "auto",
          padding: "24px 32px",
          gap: 2,
          backgroundColor: "#FAFAFA",
        }}
      >
        {!activeUser ? (
          /* ── Empty state ── */
          <Column
            horizontal="center"
            vertical="center"
            fillHeight
            style={{ gap: 16 }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(255,107,53,0.12), rgba(255,107,53,0.04))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid rgba(255,107,53,0.12)",
              }}
            >
              <MessageSquare size={32} color="rgba(255,107,53,0.5)" />
            </div>
            <Column style={{ alignItems: "center", gap: 6 }}>
              <Text style={{ fontWeight: 700, fontSize: 15, color: "#1C1C1E" }}>
                No conversation selected
              </Text>
              <Text
                variant="body-default-s"
                style={{
                  color: "rgba(0,0,0,0.38)",
                  textAlign: "center",
                  maxWidth: 220,
                }}
              >
                Pick a foodie from the list to start syncing taste
              </Text>
            </Column>
          </Column>
        ) : (
          <>
            {enriched.map((msg, idx) => {
              const isMe = msg.sender === "me";
              const showAvatar =
                !isMe && (msg.pos === "single" || msg.pos === "last");
              // gap above: smaller within a group, larger between groups
              const marginTop =
                idx === 0
                  ? 0
                  : msg.pos === "first" || msg.pos === "single"
                    ? 16
                    : 3;

              return (
                <React.Fragment key={msg.id}>
                  {/* Date separator */}
                  {msg.showDate && (
                    <div style={{ margin: "12px 0 8px" }}>
                      <DateSeparator label={msg.showDate} />
                    </div>
                  )}

                  {/* Message row */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMe ? "row-reverse" : "row",
                      alignItems: "flex-end",
                      gap: 8,
                      marginTop,
                    }}
                  >
                    {/* Avatar placeholder (keeps alignment for grouped messages) */}
                    <div style={{ width: 28, flexShrink: 0 }}>
                      {showAvatar && (
                        <Avatar
                          src={activeUser.avatar}
                          size="s"
                          style={{
                            display: "block",
                            border: "1.5px solid white",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                          }}
                        />
                      )}
                    </div>

                    {/* Bubble */}
                    <div style={{ maxWidth: "68%" }}>
                      <div
                        style={{
                          padding: "11px 16px",
                          borderRadius: bubbleRadius(msg.sender, msg.pos),
                          background: isMe
                            ? "linear-gradient(135deg, #1A7AFF 0%, #0057D9 100%)"
                            : "white",
                          color: isMe ? "white" : "#1C1C1E",
                          border: isMe ? "none" : "1px solid rgba(0,0,0,0.08)",
                          boxShadow: isMe
                            ? "0 4px 16px rgba(0,100,255,0.22), 0 1px 4px rgba(0,80,200,0.15)"
                            : "0 1px 6px rgba(0,0,0,0.05)",
                        }}
                      >
                        <Text
                          variant="body-default-m"
                          style={{
                            color: isMe ? "white" : "#1C1C1E",
                            lineHeight: 1.55,
                          }}
                        >
                          {msg.text}
                        </Text>
                      </div>

                      {/* Time + read receipt (only on last in group) */}
                      {(msg.pos === "single" || msg.pos === "last") && (
                        <Row
                          style={{
                            justifyContent: isMe ? "flex-end" : "flex-start",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 4px 0",
                          }}
                        >
                          <Text
                            variant="body-default-xs"
                            style={{ color: "rgba(0,0,0,0.32)", fontSize: 11 }}
                          >
                            {msg.time}
                          </Text>
                          {isMe && (
                            <CheckCheck
                              size={13}
                              color="#ff6b35"
                              strokeWidth={2.5}
                            />
                          )}
                        </Row>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </Column>

      {/* ── INPUT FOOTER ── */}
      <Row
        fillWidth
        vertical="center"
        style={{
          padding: "12px 20px",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          backgroundColor: "white",
          flexShrink: 0,
          zIndex: 10,
          gap: 10,
        }}
      >
        <IconButton
          icon={<Plus size={19} />}
          variant="tertiary"
          style={{
            color: "rgba(0,0,0,0.4)",
            width: 36,
            height: 36,
            flexShrink: 0,
          }}
        />

        <Row
          vertical="center"
          style={{
            flex: 1,
            gap: 8,
            backgroundColor: "#F2F2F7",
            borderRadius: 22,
            padding: "6px 8px 6px 16px",
            border: "1.5px solid transparent",
            transition: "border-color 0.18s",
          }}
        >
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setMessage(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              padding: "6px 0",
              boxShadow: "none",
              outline: "none",
              fontSize: 14,
              color: "#1C1C1E",
            }}
          />
          <Row style={{ gap: 2, flexShrink: 0 }}>
            <IconButton
              icon={<ImageIcon size={18} />}
              variant="tertiary"
              style={{ width: 32, height: 32, color: "rgba(0,0,0,0.38)" }}
            />
            <IconButton
              icon={<Smile size={18} />}
              variant="tertiary"
              style={{ width: 32, height: 32, color: "rgba(0,0,0,0.38)" }}
            />
          </Row>
        </Row>

        <motion.div
          whileTap={{ scale: 0.82 }}
          whileHover={{ scale: message.trim() ? 1.1 : 1.04 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          style={{ flexShrink: 0 }}
        >
          <IconButton
            icon={message.trim() ? <Send size={17} /> : <Mic size={17} />}
            onClick={handleSend}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: message.trim()
                ? "linear-gradient(135deg, #ff6b35, #e65721)"
                : "#F2F2F7",
              color: message.trim() ? "white" : "rgba(0,0,0,0.4)",
              boxShadow: message.trim()
                ? "0 4px 12px rgba(255,107,53,0.3)"
                : "none",
              transition: "background 0.2s, box-shadow 0.2s",
              cursor: message.trim() && !sending ? "pointer" : "default",
              opacity: sending ? 0.6 : 1,
            }}
          />
        </motion.div>
      </Row>
    </Column>
  );
};
