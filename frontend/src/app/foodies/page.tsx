"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Column, Row, Heading, Text, Avatar } from "@/components/OnceUI";
import { motion } from "framer-motion";

// ── Premium Icons (lucide-react) ──
import {
  Users,
  Search,
  X,
  Plus,
  Flame,
  Send,
  Clock,
  Crosshair,
  MailOpen,
  SearchX,
  Sparkles,
  HeartPulse,
  TrendingUp,
  MoonStar,
} from "lucide-react";

import { FriendRow, Friend } from "@/components/features/foodies/FriendRow";
import { useChat } from "@/context/ChatContext";
import { useFoodies } from "@/hooks/useFoodies";
import type { PendingRequest, SentRequest } from "@/hooks/useFoodies";
import { AddFriendSearch } from "@/components/features/foodies/AddFriendSearch";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80";
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop";

function mapSentToFriend(s: SentRequest): Friend {
  return {
    id: s.id,
    name: s.display_name || s.username,
    status: s.title || s.bio || "TasteMap Explorer",
    note: s.location || "Vietnam",
    avatar: s.avatar_url || DEFAULT_AVATAR,
    cover: s.cover_url || DEFAULT_COVER,
    match: s.match_score,
    isOnline: false,
    friendshipId: s.friendship_id,
  };
}

// ── Pending Request Card ──
function PendingRequestCard({
  req,
  onAccept,
  onDecline,
  index,
}: {
  req: PendingRequest;
  onAccept: () => void;
  onDecline: () => void;
  index: number;
}) {
  const [busy, setBusy] = React.useState(false);
  const handle = async (fn: () => Promise<void> | void) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  const matchColor =
    req.match_score >= 80
      ? "var(--dsc-accent-success)"
      : req.match_score >= 55
        ? "#D97706"
        : "var(--dsc-text-subtle)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div
        className="dsc-lift"
        style={{
          backgroundColor: "var(--dsc-surface)",
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid rgba(255,107,53,0.12)",
          boxShadow: "var(--dsc-shadow-sm)",
          display: "flex",
          flexDirection: "column",
          transition:
            "box-shadow 0.3s var(--dsc-ease-out), transform 0.3s var(--dsc-ease-out)",
        }}
      >
        {/* Cover strip */}
        <div
          style={{
            height: 64,
            background: req.cover_url
              ? `url(${req.cover_url}) center/cover`
              : "linear-gradient(135deg, #ff6b35 0%, #e65721 50%, #a855f7 100%)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 40%, rgba(255,255,255,0.3) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 12,
              padding: "3px 9px",
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              fontSize: 11,
              fontWeight: 700,
              color: matchColor,
              border: "1px solid rgba(255,255,255,0.4)",
            }}
          >
            {req.match_score}% match
          </div>
        </div>
        <div style={{ padding: "0 16px 16px", marginTop: -22 }}>
          <Avatar
            src={req.avatar_url}
            name={req.display_name || req.username}
            size="l"
            style={{
              border: "3px solid var(--dsc-surface)",
              boxShadow: "0 2px 10px rgba(255,107,53,0.10)",
            }}
          />
          <div style={{ marginTop: 8 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--dsc-text)",
              }}
            >
              {req.display_name || req.username}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "var(--dsc-text-subtle)",
                marginTop: 1,
              }}
            >
              @{req.username}
            </Text>
            {(req.title || req.bio) && (
              <Text
                style={{
                  fontSize: 12,
                  color: "var(--dsc-text-muted)",
                  marginTop: 5,
                  lineHeight: 1.4,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {req.title || req.bio}
              </Text>
            )}
          </div>
          <Row style={{ gap: 8, marginTop: 14 }}>
            <button
              disabled={busy}
              onClick={() => handle(onAccept)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 12,
                border: "none",
                background: busy
                  ? "rgba(255,107,53,0.3)"
                  : "linear-gradient(135deg, #ff6b35, #e65721)",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                cursor: busy ? "default" : "pointer",
                transition: "all 0.18s",
                boxShadow: busy ? "none" : "0 2px 8px rgba(255,107,53,0.25)",
              }}
            >
              Accept
            </button>
            <button
              disabled={busy}
              onClick={() => handle(onDecline)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 12,
                border: "1.5px solid var(--dsc-border)",
                backgroundColor: "transparent",
                color: "var(--dsc-text-subtle)",
                fontSize: 13,
                fontWeight: 600,
                cursor: busy ? "default" : "pointer",
                transition: "all 0.18s",
              }}
            >
              Decline
            </button>
          </Row>
        </div>
      </div>
    </motion.div>
  );
}

type FilterTab = "all" | "online" | "high-match" | "sent";

const TAB_CONFIG: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: <Users size={13} strokeWidth={2.25} /> },
  {
    id: "online",
    label: "Online",
    icon: <HeartPulse size={13} strokeWidth={2.25} />,
  },
  {
    id: "high-match",
    label: "High Match",
    icon: <Flame size={13} strokeWidth={2.25} />,
  },
  { id: "sent", label: "Sent", icon: <Send size={13} strokeWidth={2.25} /> },
];

export default function FoodiesPage() {
  const { isChatOpen, setIsChatOpen, setActiveFriend } = useChat();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const {
    friends,
    discover,
    pendingRequests,
    sentRequests,
    loading,
    error,
    sendRequest,
    acceptRequest,
    declineRequest,
    cancelRequest,
    unfriend,
  } = useFoodies();

  const handleMessageUser = (friend: Friend) => {
    setActiveFriend(friend);
    setIsChatOpen(true);
  };

  const onlineCount = friends.filter((f) => f.isOnline).length;

  const filtered = useMemo(() => {
    if (activeTab === "sent") return [];
    let list = friends;
    if (activeTab === "online") list = list.filter((f) => f.isOnline);
    if (activeTab === "high-match")
      list = list.filter((f) => (f.match ?? 0) >= 80);
    if (debouncedQuery.trim())
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          f.status.toLowerCase().includes(debouncedQuery.toLowerCase()),
      );
    return list;
  }, [debouncedQuery, activeTab, friends]);

  /* ── Compact (chat-open) mode ── */
  if (isChatOpen) {
    return (
      <Column
        fillHeight
        flexGrow={0}
        flexShrink={0}
        className="no-scrollbar"
        style={{
          width: "320px",
          minWidth: "320px",
          maxWidth: "320px",
          overflowY: "auto",
          backgroundColor: "var(--dsc-surface-muted)",
          borderRight: "1px solid var(--dsc-border)",
          transition: "all 0.4s ease",
        }}
      >
        <Column style={{ padding: "20px 16px 0", gap: "12px", flexShrink: 0 }}>
          <Heading
            variant="heading-strong-l"
            style={{ letterSpacing: "-1px", color: "var(--dsc-text)" }}
          >
            Chats
          </Heading>
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              color="var(--dsc-text-subtle)"
              strokeWidth={2.25}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px 10px 8px 32px",
                borderRadius: "10px",
                border: "1px solid var(--dsc-border)",
                backgroundColor: "var(--dsc-surface)",
                fontSize: "13px",
                color: "var(--dsc-text)",
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.18s",
              }}
              onFocusCapture={(e) =>
                (e.currentTarget.style.borderColor = "var(--dsc-border-focus)")
              }
              onBlurCapture={(e) =>
                (e.currentTarget.style.borderColor = "var(--dsc-border)")
              }
            />
          </div>
          <div
            style={{
              height: "1px",
              backgroundColor: "var(--dsc-border)",
              margin: "4px 0",
            }}
          />
        </Column>
        <Column style={{ padding: "4px 4px 16px", gap: "2px" }}>
          {filtered.map((f) => (
            <FriendRow
              key={f.id}
              friend={f}
              isCompact
              onMessage={() => handleMessageUser(f)}
              onInvite={(f2) => alert(`Invited ${f2.name}!`)}
            />
          ))}
          {filtered.length === 0 && (
            <Column
              style={{ alignItems: "center", padding: "32px 16px", gap: "8px" }}
            >
              <Text
                variant="body-default-s"
                style={{ color: "var(--dsc-text-subtle)" }}
              >
                No results
              </Text>
            </Column>
          )}
        </Column>
      </Column>
    );
  }

  /* ── Full (expanded) mode ── */
  const onlineFriends = friends.filter((f) => f.isOnline);
  const highMatchCount = friends.filter((f) => (f.match ?? 0) >= 80).length;
  const avgMatch =
    friends.length > 0
      ? Math.round(
          friends.reduce((s, f) => s + (f.match ?? 0), 0) / friends.length,
        )
      : 0;

  if (loading) {
    return (
      <Column
        fillHeight
        className="no-scrollbar"
        style={{
          width: "100%",
          overflowY: "auto",
          backgroundColor: "var(--dsc-bg)",
        }}
      >
        <Column style={{ padding: "40px", gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                height: 120,
                borderRadius: 20,
                backgroundColor: "var(--dsc-surface-muted)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </Column>
      </Column>
    );
  }

  if (error) {
    return (
      <Column
        fillHeight
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          backgroundColor: "var(--dsc-bg)",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background:
              "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.15))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#e63946",
          }}
        >
          <Sparkles size={24} strokeWidth={2} />
        </div>
        <Heading
          variant="heading-strong-s"
          style={{ color: "var(--dsc-text)" }}
        >
          Could not load foodies
        </Heading>
        <Text
          variant="body-default-s"
          style={{ color: "var(--dsc-text-subtle)", textAlign: "center" }}
        >
          {error}
        </Text>
      </Column>
    );
  }

  const STATS = [
    {
      icon: <Users size={15} strokeWidth={2.25} />,
      label: "Total Foodies",
      value: friends.length,
      color: "#ff6b35",
    },
    {
      icon: <HeartPulse size={15} strokeWidth={2.25} />,
      label: "Online Now",
      value: onlineCount,
      color: "var(--dsc-accent-success)",
    },
    {
      icon: <Flame size={15} strokeWidth={2.25} />,
      label: "High Match",
      value: highMatchCount,
      color: "#D97706",
    },
    {
      icon: <TrendingUp size={15} strokeWidth={2.25} />,
      label: "Avg Match",
      value: `${avgMatch}%`,
      color: "var(--dsc-accent-magic)",
    },
    {
      icon: <Clock size={15} strokeWidth={2.25} />,
      label: "Sent",
      value: sentRequests.length,
      color: "var(--dsc-text-muted)",
    },
  ];

  return (
    <Column
      fillHeight
      className="no-scrollbar"
      style={{
        width: "100%",
        overflowY: "auto",
        backgroundColor: "var(--dsc-bg)",
      }}
    >
      {/* ══ HERO HEADER BAR ══ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          style={{
            position: "relative",
            backgroundColor: "var(--dsc-surface)",
            borderBottom: "1px solid var(--dsc-border)",
            padding: "32px 40px 24px",
            overflow: "hidden",
          }}
        >
          {/* Signature gradient wash — top-right, editorial */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -120,
              right: -80,
              width: 460,
              height: 320,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(168,85,247,0.08) 0%, rgba(255,107,53,0.06) 35%, transparent 72%)",
              filter: "blur(12px)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Title row */}
            <Row
              style={{
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <Column style={{ gap: 4 }}>
                <Heading
                  variant="display-strong-m"
                  style={{ letterSpacing: "-1.5px", color: "var(--dsc-text)" }}
                >
                  Foodies
                </Heading>
                <Text
                  variant="body-default-s"
                  style={{ color: "var(--dsc-text-subtle)" }}
                >
                  Find foodies with matching taste vectors — invite them to a
                  tour.
                </Text>
              </Column>
              {/* Online pill */}
              <Row
                style={{
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 20,
                  backgroundColor: "rgba(52,199,89,0.06)",
                  border: "1px solid rgba(52,199,89,0.2)",
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "var(--dsc-accent-success)",
                    boxShadow: "0 0 0 3px rgba(52,199,89,0.2)",
                    animation: "dsc-pulse-live 2s ease-in-out infinite",
                  }}
                />
                <Text
                  variant="body-default-xs"
                  style={{ color: "#16A34A", fontWeight: 700 }}
                >
                  {onlineCount} online now
                </Text>
              </Row>
            </Row>

            {/* ── Stat pills with glassmorphism ── */}
            <Row style={{ gap: 12, flexWrap: "wrap" }}>
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.05 + 0.1,
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ flex: "1 1 160px" }}
                >
                  <Row
                    className="dsc-lift"
                    style={{
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 18px",
                      backgroundColor: "var(--dsc-surface-muted)",
                      border: "1px solid var(--dsc-border)",
                      borderRadius: 14,
                      transition:
                        "box-shadow 0.3s var(--dsc-ease-out), transform 0.3s var(--dsc-ease-out)",
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: `linear-gradient(135deg, ${s.color}14, ${s.color}22)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: s.color,
                        flexShrink: 0,
                      }}
                    >
                      {s.icon}
                    </div>
                    <Column style={{ gap: 0 }}>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: "var(--dsc-text)",
                          lineHeight: 1.1,
                          letterSpacing: "-0.5px",
                        }}
                      >
                        {s.value}
                      </Text>
                      <Text
                        variant="body-default-xs"
                        style={{
                          color: "var(--dsc-text-subtle)",
                          fontWeight: 500,
                        }}
                      >
                        {s.label}
                      </Text>
                    </Column>
                  </Row>
                </motion.div>
              ))}
            </Row>

            {/* ── Add friend by username ── */}
            <div
              id="foodies-add-friend"
              style={{ marginTop: 20, maxWidth: 480 }}
            >
              <AddFriendSearch onRequestSent={() => {}} />
            </div>
          </div>
        </div>
      </motion.div>

      <Column style={{ padding: "28px 40px 48px", gap: 28 }}>
        {/* ── Friend Requests section ── */}
        {pendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Column style={{ gap: 14 }}>
              <Row style={{ alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "var(--dsc-accent-warm)",
                    boxShadow: "0 0 0 3px rgba(255,107,53,0.2)",
                    animation: "dsc-pulse-live 2s ease-in-out infinite",
                  }}
                />
                <Heading
                  variant="heading-strong-s"
                  style={{ color: "var(--dsc-text)" }}
                >
                  Friend Requests
                </Heading>
                <div
                  style={{
                    padding: "2px 10px",
                    borderRadius: 20,
                    backgroundColor: "rgba(255,107,53,0.08)",
                    border: "1px solid rgba(255,107,53,0.2)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--dsc-accent-warm)",
                    }}
                  >
                    {pendingRequests.length}
                  </Text>
                </div>
              </Row>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 14,
                }}
              >
                {pendingRequests.map((req: PendingRequest, idx) => (
                  <PendingRequestCard
                    key={req.friendship_id}
                    req={req}
                    index={idx}
                    onAccept={() => acceptRequest(req.friendship_id)}
                    onDecline={() => declineRequest(req.friendship_id)}
                  />
                ))}
              </div>
            </Column>
          </motion.div>
        )}

        {/* ── Online Now spotlight strip ── */}
        {onlineFriends.length > 0 && (
          <Column style={{ gap: 12 }}>
            <Row style={{ alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "var(--dsc-accent-success)",
                  boxShadow: "0 0 0 3px rgba(52,199,89,0.2)",
                  animation: "dsc-pulse-live 2s ease-in-out infinite",
                }}
              />
              <Text
                variant="body-default-xs"
                style={{
                  color: "#16A34A",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Online Now
              </Text>
            </Row>
            <Row
              style={{
                gap: 12,
                overflowX: "auto",
                paddingBottom: 4,
                scrollSnapType: "x proximity",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%)",
              }}
              className="no-scrollbar"
            >
              {onlineFriends.map((f, i) => (
                <motion.button
                  key={f.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  whileHover={{ y: -3 }}
                  onClick={() => handleMessageUser(f)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    padding: "16px 20px",
                    backgroundColor: "var(--dsc-surface)",
                    border: "1px solid var(--dsc-border)",
                    borderRadius: 16,
                    cursor: "pointer",
                    flexShrink: 0,
                    minWidth: 100,
                    transition: "box-shadow 0.2s var(--dsc-ease-out)",
                    boxShadow: "var(--dsc-shadow-sm)",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Avatar
                      src={f.avatar}
                      name={f.name}
                      size="l"
                      style={{
                        border: "2px solid rgba(52,199,89,0.3)",
                        display: "block",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 2,
                        right: 2,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: "var(--dsc-accent-success)",
                        border: "2px solid var(--dsc-surface)",
                      }}
                    />
                  </div>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--dsc-text)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.name.split(" ")[0]}
                  </Text>
                  {f.match !== undefined && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: f.match >= 85 ? "#16A34A" : "#D97706",
                        backgroundColor:
                          f.match >= 85
                            ? "rgba(52,199,89,0.08)"
                            : "rgba(245,158,11,0.08)",
                        padding: "2px 8px",
                        borderRadius: 10,
                      }}
                    >
                      {f.match}%
                    </span>
                  )}
                </motion.button>
              ))}
            </Row>
          </Column>
        )}

        {/* ── Search + Filter bar ── */}
        <Column style={{ gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              color="var(--dsc-text-subtle)"
              strokeWidth={2.25}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or activity…"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 40px 13px 42px",
                borderRadius: 14,
                border: "1.5px solid var(--dsc-border)",
                backgroundColor: "var(--dsc-surface)",
                fontSize: 14,
                color: "var(--dsc-text)",
                outline: "none",
                fontFamily: "inherit",
                boxShadow: "var(--dsc-shadow-sm)",
                transition: "border-color 0.18s, box-shadow 0.18s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--dsc-border-focus)";
                e.target.style.boxShadow =
                  "0 0 0 4px rgba(255,107,53,0.08), var(--dsc-shadow-sm)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--dsc-border)";
                e.target.style.boxShadow = "var(--dsc-shadow-sm)";
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  color: "var(--dsc-text-subtle)",
                  display: "flex",
                }}
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Filter tabs with animated indicator */}
          <Row
            style={{
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
              position: "relative",
            }}
          >
            {TAB_CONFIG.map((tab) => {
              const isActive = activeTab === tab.id;
              const count =
                tab.id === "all"
                  ? friends.length
                  : tab.id === "online"
                    ? friends.filter((f) => f.isOnline).length
                    : tab.id === "high-match"
                      ? friends.filter((f) => (f.match ?? 0) >= 80).length
                      : sentRequests.length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: isActive
                      ? "1.5px solid var(--dsc-accent-warm)"
                      : "1.5px solid var(--dsc-border)",
                    backgroundColor: isActive
                      ? "rgba(255,107,53,0.06)"
                      : "var(--dsc-surface)",
                    color: isActive
                      ? "var(--dsc-accent-warm)"
                      : "var(--dsc-text-muted)",
                    cursor: "pointer",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    transition: "all 0.2s var(--dsc-ease-out)",
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                    position: "relative",
                  }}
                >
                  {/* Animated pill highlight */}
                  {isActive && (
                    <motion.div
                      layoutId="foodies-tab-pill"
                      style={{
                        position: "absolute",
                        inset: -1,
                        borderRadius: 10,
                        border: "1.5px solid var(--dsc-accent-warm)",
                        backgroundColor: "rgba(255,107,53,0.06)",
                        zIndex: -1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  {tab.icon}
                  {tab.label}
                  <span
                    style={{
                      padding: "1px 7px",
                      borderRadius: 10,
                      backgroundColor: isActive
                        ? "rgba(255,107,53,0.12)"
                        : "var(--dsc-surface-muted)",
                      fontSize: 11,
                      fontWeight: 700,
                      color: isActive
                        ? "var(--dsc-accent-warm)"
                        : "var(--dsc-text-subtle)",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
            <Text
              variant="body-default-xs"
              style={{ marginLeft: "auto", color: "var(--dsc-text-subtle)" }}
            >
              {activeTab === "sent" ? sentRequests.length : filtered.length}{" "}
              result
              {(activeTab === "sent"
                ? sentRequests.length
                : filtered.length) !== 1
                ? "s"
                : ""}
            </Text>
          </Row>
        </Column>

        {/* ══ Sent Requests Grid ══ */}
        {activeTab === "sent" && (
          <Column style={{ gap: 14 }}>
            <Row style={{ alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "var(--dsc-text-subtle)",
                  boxShadow: "0 0 0 3px rgba(174,174,178,0.2)",
                }}
              />
              <Heading
                variant="heading-strong-s"
                style={{ color: "var(--dsc-text)" }}
              >
                Sent Requests
              </Heading>
              <div
                style={{
                  padding: "2px 10px",
                  borderRadius: 20,
                  backgroundColor: "rgba(174,174,178,0.08)",
                  border: "1px solid rgba(174,174,178,0.2)",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--dsc-text-subtle)",
                  }}
                >
                  {sentRequests.length}
                </Text>
              </div>
            </Row>
            {sentRequests.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 16,
                }}
              >
                {sentRequests.map((req) => (
                  <FriendRow
                    key={req.friendship_id}
                    friend={mapSentToFriend(req)}
                    variant="sent"
                    isCompact={false}
                    onMessage={() => handleMessageUser(mapSentToFriend(req))}
                    onCancel={(f) => cancelRequest(f.friendshipId!)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<MailOpen size={24} strokeWidth={2} />}
                iconBg="linear-gradient(135deg, rgba(174,174,178,0.08), rgba(174,174,178,0.15))"
                iconColor="var(--dsc-text-subtle)"
                title="No sent requests"
                subtitle="Add some foodies to grow your network!"
              />
            )}
          </Column>
        )}

        {/* ══ Friend Grid ══ */}
        {activeTab !== "sent" && filtered.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {filtered.map((friend) => (
              <FriendRow
                key={friend.id}
                friend={friend}
                variant="friend"
                isCompact={false}
                onMessage={() => handleMessageUser(friend)}
                onInvite={(f) => alert(`Invited ${f.name} to a new Food Tour!`)}
                onUnfriend={(f) =>
                  f.friendshipId ? unfriend(f.friendshipId, f.id) : undefined
                }
              />
            ))}
          </div>
        )}

        {/* ══ Empty states ══ */}
        {activeTab !== "sent" &&
          filtered.length === 0 &&
          (() => {
            if (activeTab === "online")
              return (
                <EmptyState
                  icon={<MoonStar size={24} strokeWidth={2} />}
                  iconBg="linear-gradient(135deg, rgba(52,199,89,0.06), rgba(52,199,89,0.14))"
                  iconColor="var(--dsc-accent-success)"
                  title="No one online right now"
                  subtitle="Check back later to see who's active."
                />
              );
            if (activeTab === "high-match")
              return (
                <EmptyState
                  icon={<Crosshair size={24} strokeWidth={2} />}
                  iconBg="linear-gradient(135deg, rgba(168,85,247,0.06), rgba(168,85,247,0.14))"
                  iconColor="var(--dsc-accent-magic)"
                  title="No high-match foodies yet"
                  subtitle="Discover and add foodies to find your taste twins!"
                />
              );
            if (query.trim())
              return (
                <EmptyState
                  icon={<SearchX size={24} strokeWidth={2} />}
                  iconBg="linear-gradient(135deg, rgba(174,174,178,0.06), rgba(174,174,178,0.14))"
                  iconColor="var(--dsc-text-subtle)"
                  title={<>No results for &ldquo;{query}&rdquo;</>}
                  subtitle="Try a different name or clear the search."
                />
              );
            return (
              <EmptyState
                icon={<Users size={24} strokeWidth={2} />}
                iconBg="linear-gradient(135deg, rgba(255,107,53,0.06), rgba(255,107,53,0.14))"
                iconColor="var(--dsc-accent-warm)"
                title="Your foodies list is empty"
                subtitle="Search by username above to add your first foodie!"
                actionLabel="Add your first foodie"
                onAction={() => {
                  const el = document.getElementById("foodies-add-friend");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    const input = el.querySelector<HTMLInputElement>("input");
                    setTimeout(() => input?.focus(), 400);
                  }
                }}
              />
            );
          })()}

        {/* ══ Discover Section ══ */}
        {activeTab !== "sent" && discover.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Column style={{ gap: 16 }}>
              <Row style={{ alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: "var(--dsc-gradient-signature-soft)",
                    border: "1px solid rgba(168,85,247,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--dsc-accent-magic)",
                  }}
                >
                  <Sparkles size={14} strokeWidth={2.5} />
                </div>
                <Column style={{ gap: 0 }}>
                  <Row style={{ alignItems: "center", gap: 8 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--dsc-text)",
                        letterSpacing: "-0.2px",
                      }}
                    >
                      Discover Foodies
                    </Text>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.8px",
                        textTransform: "uppercase",
                        color: "var(--dsc-accent-magic)",
                        background:
                          "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(255,107,53,0.08))",
                        border: "1px solid rgba(168,85,247,0.18)",
                        padding: "2px 8px",
                        borderRadius: 20,
                      }}
                    >
                      AI-matched
                    </span>
                  </Row>
                  <Text
                    variant="body-default-xs"
                    style={{ color: "var(--dsc-text-subtle)" }}
                  >
                    People with matching taste vectors you haven&apos;t
                    connected with yet
                  </Text>
                </Column>
              </Row>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 16,
                }}
              >
                {discover.map((person) => (
                  <FriendRow
                    key={person.id}
                    friend={person}
                    variant="discover"
                    isCompact={false}
                    onMessage={() => handleMessageUser(person)}
                    onInvite={(f) => sendRequest(f.id)}
                  />
                ))}
              </div>
            </Column>
          </motion.div>
        )}
      </Column>
    </Column>
  );
}

// ── Reusable Empty State Component ──
function EmptyState({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: React.ReactNode;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Column
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 24px",
          gap: 12,
          backgroundColor: "var(--dsc-surface)",
          borderRadius: 20,
          border: "1px solid var(--dsc-border)",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
          }}
        >
          {icon}
        </div>
        <Heading
          variant="heading-strong-s"
          style={{ color: "var(--dsc-text)" }}
        >
          {title}
        </Heading>
        <Text
          variant="body-default-s"
          style={{ color: "var(--dsc-text-subtle)", textAlign: "center" }}
        >
          {subtitle}
        </Text>
        {actionLabel && onAction && (
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAction}
            style={{
              marginTop: 6,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 18px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #ff6b35, #e65721)",
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(255,107,53,0.28)",
              fontFamily: "inherit",
            }}
          >
            <Plus size={14} strokeWidth={2.75} />
            {actionLabel}
          </motion.button>
        )}
      </Column>
    </motion.div>
  );
}
