"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Column, Row, Heading, Text, Avatar } from "@/components/OnceUI";
import {
  Search,
  Users,
  Wifi,
  Flame,
  X,
  TrendingUp,
  UserPlus,
  Clock,
  Send,
  AlertTriangle,
  SearchX,
  Target,
  Moon,
  MailOpen,
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

// ── Pending Request Card ──────────────────────────────────────────────────────
function PendingRequestCard({
  req,
  onAccept,
  onDecline,
}: {
  req: PendingRequest;
  onAccept: () => void;
  onDecline: () => void;
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
      ? "#34C759"
      : req.match_score >= 55
        ? "#FF9500"
        : "#8E8E93";

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid rgba(255,149,0,0.15)",
        boxShadow: "0 2px 12px rgba(255,149,0,0.06)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Cover strip */}
      <div
        style={{
          height: 64,
          background: req.cover_url
            ? `url(${req.cover_url}) center/cover`
            : "linear-gradient(135deg, #FF9500 0%, #FF6B6B 100%)",
          position: "relative",
        }}
      >
        {/* Match badge */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            padding: "3px 9px",
            borderRadius: 20,
            backgroundColor: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            fontSize: 11,
            fontWeight: 700,
            color: matchColor,
          }}
        >
          {req.match_score}% match
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "0 16px 16px", marginTop: -22 }}>
        <Avatar
          src={req.avatar_url}
          name={req.display_name || req.username}
          size="l"
          style={{
            border: "3px solid white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
          }}
        />
        <div style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: 700, color: "#1C1C1E" }}>
            {req.display_name || req.username}
          </Text>
          <Text style={{ fontSize: 12, color: "#8E8E93", marginTop: 1 }}>
            @{req.username}
          </Text>
          {(req.title || req.bio) && (
            <Text
              style={{
                fontSize: 12,
                color: "#6C6C70",
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

        {/* Buttons */}
        <Row style={{ gap: 8, marginTop: 14 }}>
          <button
            disabled={busy}
            onClick={() => handle(onAccept)}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 12,
              border: "none",
              backgroundColor: busy ? "#FFD4A3" : "#ff6b35",
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              cursor: busy ? "default" : "pointer",
              transition: "background 0.15s",
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
              border: "1.5px solid #E5E5EA",
              backgroundColor: "transparent",
              color: "#8E8E93",
              fontSize: 13,
              fontWeight: 600,
              cursor: busy ? "default" : "pointer",
            }}
          >
            Decline
          </button>
        </Row>
      </div>
    </div>
  );
}

type FilterTab = "all" | "online" | "high-match" | "sent";

const TAB_CONFIG: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: <Users size={13} /> },
  { id: "online", label: "Online", icon: <Wifi size={13} /> },
  { id: "high-match", label: "High Match", icon: <Flame size={13} /> },
  { id: "sent", label: "Sent", icon: <Send size={13} /> },
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

  /* ── Compact (chat-open) mode keeps the old behaviour ── */
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
          backgroundColor: "#F8F8FA",
          borderRight: "1px solid rgba(0,0,0,0.06)",
          transition: "all 0.4s ease",
        }}
      >
        {/* Compact header */}
        <Column style={{ padding: "20px 16px 0", gap: "12px", flexShrink: 0 }}>
          <Heading
            variant="heading-strong-l"
            style={{ letterSpacing: "-1px", color: "#1C1C1E" }}
          >
            Chats
          </Heading>
          {/* Compact search */}
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              color="rgba(0,0,0,0.3)"
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
                border: "1px solid rgba(0,0,0,0.07)",
                backgroundColor: "rgba(0,0,0,0.03)",
                fontSize: "13px",
                color: "#1C1C1E",
                outline: "none",
              }}
            />
          </div>
          <div
            style={{
              height: "1px",
              backgroundColor: "rgba(0,0,0,0.06)",
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
                style={{ color: "rgba(0,0,0,0.3)" }}
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
        style={{ width: "100%", overflowY: "auto", backgroundColor: "#F2F2F7" }}
      >
        <Column style={{ padding: "40px", gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                height: 120,
                borderRadius: 20,
                backgroundColor: "rgba(0,0,0,0.05)",
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
          backgroundColor: "#F2F2F7",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: "rgba(255,59,48,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FF3B30",
          }}
        >
          <AlertTriangle size={24} />
        </div>
        <Heading variant="heading-strong-s" style={{ color: "#1C1C1E" }}>
          Could not load foodies
        </Heading>
        <Text
          variant="body-default-s"
          style={{ color: "rgba(0,0,0,0.4)", textAlign: "center" }}
        >
          {error}
        </Text>
      </Column>
    );
  }

  const STATS = [
    {
      icon: <Users size={14} />,
      label: "Total Foodies",
      value: friends.length,
      color: "#ff6b35",
    },
    {
      icon: <Wifi size={14} />,
      label: "Online Now",
      value: onlineCount,
      color: "#34C759",
    },
    {
      icon: <Flame size={14} />,
      label: "High Match",
      value: highMatchCount,
      color: "#FF9500",
    },
    {
      icon: <TrendingUp size={14} />,
      label: "Avg Match",
      value: `${avgMatch}%`,
      color: "#AF52DE",
    },
    {
      icon: <Clock size={14} />,
      label: "Sent",
      value: sentRequests.length,
      color: "#6C6C70",
    },
  ];

  return (
    <Column
      fillHeight
      className="no-scrollbar"
      style={{ width: "100%", overflowY: "auto", backgroundColor: "#F2F2F7" }}
    >
      {/* ══ HERO HEADER BAR ══ */}
      <div
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "32px 40px 24px",
        }}
      >
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
              style={{ letterSpacing: "-1.5px", color: "#1C1C1E" }}
            >
              Foodies
            </Heading>
            <Text variant="body-default-s" style={{ color: "rgba(0,0,0,0.4)" }}>
              Find foodies with matching taste vectors — invite them to a tour.
            </Text>
          </Column>
          {/* Online pill */}
          <Row
            style={{
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 20,
              backgroundColor: "rgba(52,199,89,0.08)",
              border: "1px solid rgba(52,199,89,0.2)",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#34C759",
                boxShadow: "0 0 0 3px rgba(52,199,89,0.2)",
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

        {/* ── Stat pills ── */}
        <Row style={{ gap: 12, flexWrap: "wrap" }}>
          {STATS.map((s) => (
            <Row
              key={s.label}
              style={{
                alignItems: "center",
                gap: 10,
                padding: "12px 18px",
                backgroundColor: "#F8F8FA",
                border: "1px solid rgba(0,0,0,0.05)",
                borderRadius: 14,
                flex: "1 1 160px",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: `${s.color}14`,
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
                    color: "#1C1C1E",
                    lineHeight: 1.1,
                  }}
                >
                  {s.value}
                </Text>
                <Text
                  variant="body-default-xs"
                  style={{ color: "rgba(0,0,0,0.4)", fontWeight: 500 }}
                >
                  {s.label}
                </Text>
              </Column>
            </Row>
          ))}
        </Row>

        {/* ── Add friend by username ── */}
        <div style={{ marginTop: 20, maxWidth: 480 }}>
          <AddFriendSearch onRequestSent={() => {}} />
        </div>
      </div>

      <Column style={{ padding: "28px 40px 48px", gap: 28 }}>
        {/* ── Friend Requests section ── */}
        {pendingRequests.length > 0 && (
          <Column style={{ gap: 14 }}>
            <Row style={{ alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#FF9500",
                  boxShadow: "0 0 0 3px rgba(255,149,0,0.2)",
                }}
              />
              <Heading variant="heading-strong-s" style={{ color: "#1C1C1E" }}>
                Friend Requests
              </Heading>
              <div
                style={{
                  padding: "2px 10px",
                  borderRadius: 20,
                  backgroundColor: "rgba(255,149,0,0.1)",
                  border: "1px solid rgba(255,149,0,0.25)",
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: 700, color: "#D97706" }}
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
              {pendingRequests.map((req: PendingRequest) => (
                <PendingRequestCard
                  key={req.friendship_id}
                  req={req}
                  onAccept={() => acceptRequest(req.friendship_id)}
                  onDecline={() => declineRequest(req.friendship_id)}
                />
              ))}
            </div>
          </Column>
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
                  backgroundColor: "#34C759",
                  boxShadow: "0 0 0 3px rgba(52,199,89,0.2)",
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
              style={{ gap: 12, overflowX: "auto", paddingBottom: 4 }}
              className="no-scrollbar"
            >
              {onlineFriends.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleMessageUser(f)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    padding: "16px 20px",
                    backgroundColor: "white",
                    border: "1px solid rgba(0,0,0,0.05)",
                    borderRadius: 16,
                    cursor: "pointer",
                    flexShrink: 0,
                    minWidth: 100,
                    transition: "box-shadow 0.18s",
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
                        backgroundColor: "#34C759",
                        border: "2px solid white",
                      }}
                    />
                  </div>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#1C1C1E",
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
                            ? "rgba(52,199,89,0.1)"
                            : "rgba(245,158,11,0.1)",
                        padding: "2px 8px",
                        borderRadius: 10,
                      }}
                    >
                      {f.match}%
                    </span>
                  )}
                </button>
              ))}
            </Row>
          </Column>
        )}

        {/* ── Search + Filter bar ── */}
        <Column style={{ gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              color="rgba(0,0,0,0.3)"
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
                border: "1.5px solid rgba(0,0,0,0.07)",
                backgroundColor: "#FFFFFF",
                fontSize: 14,
                color: "#1C1C1E",
                outline: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(0,122,255,0.4)";
                e.target.style.boxShadow =
                  "0 0 0 4px rgba(0,122,255,0.08), 0 2px 8px rgba(0,0,0,0.04)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(0,0,0,0.07)";
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
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
                  color: "rgba(0,0,0,0.3)",
                  display: "flex",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <Row style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}>
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
                      ? "1.5px solid #ff6b35"
                      : "1.5px solid rgba(0,0,0,0.07)",
                    backgroundColor: isActive
                      ? "rgba(255,107,53,0.06)"
                      : "#FFFFFF",
                    color: isActive ? "#ff6b35" : "rgba(0,0,0,0.5)",
                    cursor: "pointer",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    transition: "all 0.16s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.icon}
                  {tab.label}
                  <span
                    style={{
                      padding: "1px 7px",
                      borderRadius: 10,
                      backgroundColor: isActive
                        ? "rgba(255,107,53,0.12)"
                        : "rgba(0,0,0,0.05)",
                      fontSize: 11,
                      fontWeight: 700,
                      color: isActive ? "#ff6b35" : "rgba(0,0,0,0.4)",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
            <Text
              variant="body-default-xs"
              style={{ marginLeft: "auto", color: "rgba(0,0,0,0.3)" }}
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
                  backgroundColor: "#8E8E93",
                  boxShadow: "0 0 0 3px rgba(142,142,147,0.2)",
                }}
              />
              <Heading variant="heading-strong-s" style={{ color: "#1C1C1E" }}>
                Sent Requests
              </Heading>
              <div
                style={{
                  padding: "2px 10px",
                  borderRadius: 20,
                  backgroundColor: "rgba(142,142,147,0.1)",
                  border: "1px solid rgba(142,142,147,0.2)",
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: 700, color: "#8E8E93" }}
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
              <Column
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "64px 24px",
                  gap: 12,
                  backgroundColor: "white",
                  borderRadius: 20,
                  border: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: "rgba(142,142,147,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#8E8E93",
                  }}
                >
                  <MailOpen size={24} />
                </div>
                <Heading
                  variant="heading-strong-s"
                  style={{ color: "#1C1C1E" }}
                >
                  No sent requests
                </Heading>
                <Text
                  variant="body-default-s"
                  style={{ color: "rgba(0,0,0,0.4)", textAlign: "center" }}
                >
                  Add some foodies to grow your network!
                </Text>
              </Column>
            )}
          </Column>
        )}

        {/* ══ Friend Grid — 3 columns on wide screens ══ */}
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
        {activeTab !== "sent" &&
          filtered.length === 0 &&
          (() => {
            const base = {
              alignItems: "center" as const,
              justifyContent: "center" as const,
              padding: "64px 24px",
              gap: 12,
              backgroundColor: "white",
              borderRadius: 20,
              border: "1px solid rgba(0,0,0,0.04)",
            };
            if (activeTab === "online")
              return (
                <Column style={base}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      backgroundColor: "rgba(52,199,89,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#34C759",
                    }}
                  >
                    <Moon size={24} />
                  </div>
                  <Heading
                    variant="heading-strong-s"
                    style={{ color: "#1C1C1E" }}
                  >
                    No one online right now
                  </Heading>
                  <Text
                    variant="body-default-s"
                    style={{ color: "rgba(0,0,0,0.4)", textAlign: "center" }}
                  >
                    Check back later to see who&apos;s active.
                  </Text>
                </Column>
              );
            if (activeTab === "high-match")
              return (
                <Column style={base}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      backgroundColor: "rgba(175,82,222,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#AF52DE",
                    }}
                  >
                    <Target size={24} />
                  </div>
                  <Heading
                    variant="heading-strong-s"
                    style={{ color: "#1C1C1E" }}
                  >
                    No high-match foodies yet
                  </Heading>
                  <Text
                    variant="body-default-s"
                    style={{ color: "rgba(0,0,0,0.4)", textAlign: "center" }}
                  >
                    Discover and add foodies to find your taste twins!
                  </Text>
                </Column>
              );
            if (query.trim())
              return (
                <Column style={base}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      backgroundColor: "rgba(142,142,147,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#8E8E93",
                    }}
                  >
                    <SearchX size={24} />
                  </div>
                  <Heading
                    variant="heading-strong-s"
                    style={{ color: "#1C1C1E" }}
                  >
                    No results for &ldquo;{query}&rdquo;
                  </Heading>
                  <Text
                    variant="body-default-s"
                    style={{ color: "rgba(0,0,0,0.4)", textAlign: "center" }}
                  >
                    Try a different name or clear the search.
                  </Text>
                </Column>
              );
            return (
              <Column style={base}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,107,53,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ff6b35",
                  }}
                >
                  <Users size={24} />
                </div>
                <Heading
                  variant="heading-strong-s"
                  style={{ color: "#1C1C1E" }}
                >
                  Your foodies list is empty
                </Heading>
                <Text
                  variant="body-default-s"
                  style={{ color: "rgba(0,0,0,0.4)", textAlign: "center" }}
                >
                  Search by username above to add your first foodie!
                </Text>
              </Column>
            );
          })()}

        {/* ══ Discover Section ══ */}
        {activeTab !== "sent" && discover.length > 0 && (
          <Column style={{ gap: 16 }}>
            <Row style={{ alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: "rgba(175,82,222,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#AF52DE",
                }}
              >
                <UserPlus size={14} />
              </div>
              <Column style={{ gap: 0 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1C1C1E",
                    letterSpacing: "-0.2px",
                  }}
                >
                  Discover Foodies
                </Text>
                <Text
                  variant="body-default-xs"
                  style={{ color: "rgba(0,0,0,0.4)" }}
                >
                  People with matching taste vectors you haven’t connected with
                  yet
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
        )}
      </Column>
    </Column>
  );
}
