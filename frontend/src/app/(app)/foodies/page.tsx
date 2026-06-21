"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  X,
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
import { Column, Row, Grid } from "@once-ui-system/core";
import { FriendRow, Friend } from "@/components/features/foodies/FriendRow";
import { useChat } from "@/context/ChatContext";
import { useFoodies } from "@/hooks/useFoodies";
import type { PendingRequest, SentRequest } from "@/hooks/useFoodies";
import { AddFriendSearch } from "@/components/features/foodies/AddFriendSearch";
import {
  Card,
  Button,
  IconButton,
  Field,
  Avatar,
  Pill,
  H1,
  H2,
  H3,
  Body,
  BodySm,
  Caption,
  Eyebrow,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";

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

  const matchTone =
    req.match_score >= 80 ? "success" : req.match_score >= 55 ? "warning" : "neutral";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.32,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Card
        radius="lg"
        padding="none"
        shadow="sm"
        interactive
        style={{ overflow: "hidden" }}
      >
        <Column
          style={{
            height: 64,
            position: "relative",
            background: req.cover_url
              ? `url(${req.cover_url}) center/cover`
              : tokens.color.surfaceMuted,
          }}
        >
          <Column
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to bottom, transparent 40%, ${tokens.color.surface} 100%)`,
            }}
          />
          <Column
            style={{
              position: "absolute",
              top: tokens.space[2],
              right: tokens.space[2],
            }}
          >
            <Pill
              tone={matchTone}
              size="sm"
              style={{
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(8px)",
              }}
            >
              {req.match_score}% match
            </Pill>
          </Column>
        </Column>
        <Column
          style={{
            padding: `0 ${tokens.space[4]} ${tokens.space[4]}`,
            marginTop: -22,
          }}
        >
          <Avatar
            src={req.avatar_url}
            name={req.display_name || req.username}
            size="lg"
            style={{
              border: `3px solid ${tokens.color.surface}`,
              boxShadow: tokens.shadow.sm,
            }}
          />
          <Column
            style={{
              marginTop: tokens.space[2],
              gap: tokens.space[1],
            }}
          >
            <Body style={{ fontWeight: tokens.type.weight.semibold }}>
              {req.display_name || req.username}
            </Body>
            <Caption tone="subtle">@{req.username}</Caption>
            {(req.title || req.bio) && (
              <BodySm
                tone="muted"
                style={{
                  marginTop: tokens.space[1],
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {req.title || req.bio}
              </BodySm>
            )}
          </Column>
          <Row
            style={{
              gap: tokens.space[2],
              marginTop: tokens.space[4],
            }}
          >
            <Button
              variant="primary"
              size="sm"
              fullWidth
              loading={busy}
              onClick={() => handle(onAccept)}
            >
              Accept
            </Button>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              disabled={busy}
              onClick={() => handle(onDecline)}
            >
              Decline
            </Button>
          </Row>
        </Column>
      </Card>
    </motion.div>
  );
}

type FilterTab = "all" | "online" | "high-match" | "sent";

const TAB_CONFIG: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: <Users size={13} strokeWidth={1.75} /> },
  { id: "online", label: "Online", icon: <HeartPulse size={13} strokeWidth={1.75} /> },
  { id: "high-match", label: "High match", icon: <Flame size={13} strokeWidth={1.75} /> },
  { id: "sent", label: "Sent", icon: <Send size={13} strokeWidth={1.75} /> },
];

export default function FoodiesPage() {
  const { isChatOpen, setIsChatOpen, activeFriend, setActiveFriend } = useChat();
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
    let list = [...friends];
    if (activeTab === "online") list = list.filter((f) => f.isOnline);
    if (activeTab === "high-match")
      list = list.filter((f) => (f.match ?? 0) >= 80);
    if (debouncedQuery.trim())
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          f.status.toLowerCase().includes(debouncedQuery.toLowerCase()),
      );
    return list.sort((a, b) => {
      const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      if (dateA !== dateB) return dateB - dateA;
      return (b.match ?? 0) - (a.match ?? 0);
    });
  }, [debouncedQuery, activeTab, friends]);

  if (isChatOpen) {
    return (
      <Column
        className="no-scrollbar"
        style={{
          width: 320,
          minWidth: 320,
          maxWidth: 320,
          height: "100%",
          overflowY: "auto",
          background: tokens.color.surfaceMuted,
          borderRight: `1px solid ${tokens.color.border}`,
        }}
      >
        <Column
          style={{
            padding: `${tokens.space[5]} ${tokens.space[4]} ${tokens.space[3]}`,
            gap: tokens.space[3],
            flexShrink: 0,
          }}
        >
          <H2>Chats</H2>
          <Field
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            leading={<Search size={14} strokeWidth={1.75} />}
          />
          <Column style={{ height: 1, background: tokens.color.border }} />
        </Column>
        <Column
          style={{
            padding: `${tokens.space[1]} 0 ${tokens.space[4]}`,
            gap: 2,
          }}
        >
          {filtered.map((f) => (
            <FriendRow
              key={f.id}
              friend={f}
              isCompact
              isActive={activeFriend?.id === f.id}
              onMessage={() => handleMessageUser(f)}
              onInvite={(f2) => alert(`Invited ${f2.name}!`)}
            />
          ))}
          {filtered.length === 0 && (
            <Column
              style={{
                padding: `${tokens.space[8]} ${tokens.space[4]}`,
                textAlign: "center",
              }}
            >
              <BodySm tone="muted">No results</BodySm>
            </Column>
          )}
        </Column>
      </Column>
    );
  }

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
        className="no-scrollbar"
        style={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
          background: tokens.color.bg,
        }}
      >
        <Column
          style={{
            padding: tokens.space[10],
            gap: tokens.space[4],
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} height={120} radius="lg" />
          ))}
        </Column>
      </Column>
    );
  }

  if (error) {
    return (
      <Column
        horizontal="center"
        vertical="center"
        style={{
          width: "100%",
          height: "100%",
          background: tokens.color.bg,
          padding: tokens.space[6],
        }}
      >
        <Card radius="xl" padding="lg" shadow="sm" style={{ maxWidth: 480 }}>
          <EmptyState
            icon={<Sparkles size={32} strokeWidth={1.5} />}
            title="Could not load foodies"
            description={error}
          />
        </Card>
      </Column>
    );
  }

  const STATS: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
  }[] = [
    { icon: <Users size={15} strokeWidth={1.75} />, label: "Total foodies", value: friends.length },
    { icon: <HeartPulse size={15} strokeWidth={1.75} />, label: "Online now", value: onlineCount },
    { icon: <Flame size={15} strokeWidth={1.75} />, label: "High match", value: highMatchCount },
    { icon: <TrendingUp size={15} strokeWidth={1.75} />, label: "Avg match", value: `${avgMatch}%` },
    { icon: <Clock size={15} strokeWidth={1.75} />, label: "Sent", value: sentRequests.length },
  ];

  return (
    <Column
      className="no-scrollbar"
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        background: tokens.color.bg,
        color: tokens.color.text,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: tokens.color.surface,
          borderBottom: `1px solid ${tokens.color.border}`,
          padding: `${tokens.space[8]} ${tokens.space[10]} ${tokens.space[6]}`,
        }}
      >
        <Row
          horizontal="between"
          style={{
            alignItems: "flex-end",
            marginBottom: tokens.space[5],
            gap: tokens.space[4],
            flexWrap: "wrap",
          }}
        >
          <Column style={{ gap: tokens.space[1] }}>
            <H1>Foodies</H1>
            <Body tone="muted">
              Find foodies with matching taste vectors — invite them to a tour.
            </Body>
          </Column>
          <Pill tone="success" size="md" dot>
            {onlineCount} online now
          </Pill>
        </Row>

        <Grid
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: tokens.space[3],
          }}
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 + 0.05, duration: 0.28 }}
            >
              <Card radius="md" padding="sm" shadow="sm" surface="muted">
                <Row vertical="center" style={{ gap: tokens.space[3] }}>
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: tokens.radius.sm,
                      background: tokens.color.surface,
                      color: tokens.color.textMuted,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {s.icon}
                  </span>
                  <Column>
                    <Body
                      style={{
                        fontSize: 18,
                        fontWeight: tokens.type.weight.bold,
                        lineHeight: 1.1,
                      }}
                    >
                      {s.value}
                    </Body>
                    <Caption tone="muted">{s.label}</Caption>
                  </Column>
                </Row>
              </Card>
            </motion.div>
          ))}
        </Grid>

        <Column
          id="foodies-add-friend"
          style={{ marginTop: tokens.space[5], maxWidth: 480 }}
        >
          <AddFriendSearch onRequestSent={() => {}} />
        </Column>
      </motion.div>

      <Column
        style={{
          padding: `${tokens.space[6]} ${tokens.space[10]} ${tokens.space[12]}`,
          gap: tokens.space[8],
        }}
      >
        {pendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.28, delay: 0.1 }}
          >
            <Row vertical="center" style={{ gap: tokens.space[2], marginBottom: tokens.space[3] }}>
              <H3>Friend requests</H3>
              <Pill tone="warm" size="sm">
                {pendingRequests.length}
              </Pill>
            </Row>
            <Grid
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: tokens.space[3],
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
            </Grid>
          </motion.div>
        )}

        {onlineFriends.length > 0 && (
          <Column style={{ gap: tokens.space[3] }}>
            <Eyebrow tone="muted">Online now</Eyebrow>
            <Row
              className="no-scrollbar"
              style={{
                gap: tokens.space[3],
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {onlineFriends.map((f, i) => (
                <motion.button
                  key={f.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.24 }}
                  onClick={() => handleMessageUser(f)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: tokens.space[2],
                    padding: `${tokens.space[4]} ${tokens.space[5]}`,
                    background: tokens.color.surface,
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.md,
                    cursor: "pointer",
                    flexShrink: 0,
                    minWidth: 110,
                    fontFamily: "inherit",
                    boxShadow: tokens.shadow.sm,
                  }}
                >
                  <Column style={{ position: "relative" }}>
                    <Avatar src={f.avatar} name={f.name} size="lg" ring="success" />
                  </Column>
                  <BodySm style={{ fontWeight: tokens.type.weight.semibold }}>
                    {f.name.split(" ")[0]}
                  </BodySm>
                  {f.match !== undefined && (
                    <Pill
                      tone={f.match >= 85 ? "success" : "warning"}
                      size="sm"
                    >
                      {f.match}%
                    </Pill>
                  )}
                </motion.button>
              ))}
            </Row>
          </Column>
        )}

        <Column style={{ gap: tokens.space[3] }}>
          <Field
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or activity…"
            leading={<Search size={16} strokeWidth={1.75} />}
            trailing={
              query ? (
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label="Clear"
                  onClick={() => setQuery("")}
                  icon={<X size={14} strokeWidth={1.75} />}
                />
              ) : undefined
            }
          />

          <Row
            vertical="center"
            style={{
              gap: tokens.space[2],
              flexWrap: "wrap",
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
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: tokens.space[2],
                    padding: `${tokens.space[2]} ${tokens.space[4]}`,
                    borderRadius: tokens.radius.sm,
                    border: isActive
                      ? `1px solid ${tokens.color.warm}`
                      : `1px solid ${tokens.color.border}`,
                    background: isActive
                      ? "rgba(255, 107, 53, 0.08)"
                      : tokens.color.surface,
                    color: isActive
                      ? tokens.color.warm
                      : tokens.color.textMuted,
                    fontSize: tokens.type.size.bodySm,
                    fontWeight: isActive
                      ? tokens.type.weight.semibold
                      : tokens.type.weight.medium,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s ease",
                  }}
                >
                  {tab.icon}
                  {tab.label}
                  <Pill
                    tone={isActive ? "warm" : "neutral"}
                    size="sm"
                  >
                    {count}
                  </Pill>
                </button>
              );
            })}
            <Caption tone="subtle" style={{ marginLeft: "auto" }}>
              {activeTab === "sent" ? sentRequests.length : filtered.length} result
              {(activeTab === "sent" ? sentRequests.length : filtered.length) !== 1
                ? "s"
                : ""}
            </Caption>
          </Row>
        </Column>

        {activeTab === "sent" && (
          <Column style={{ gap: tokens.space[3] }}>
            <Row vertical="center" style={{ gap: tokens.space[2] }}>
              <H3>Sent requests</H3>
              <Pill tone="neutral" size="sm">
                {sentRequests.length}
              </Pill>
            </Row>
            {sentRequests.length > 0 ? (
              <Grid
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: tokens.space[4],
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
              </Grid>
            ) : (
              <Card radius="xl" padding="lg" shadow="none" surface="muted">
                <EmptyState
                  icon={<MailOpen size={32} strokeWidth={1.5} />}
                  title="No sent requests"
                  description="Add some foodies to grow your network."
                />
              </Card>
            )}
          </Column>
        )}

        {activeTab !== "sent" && filtered.length > 0 && (
          <Grid
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: tokens.space[4],
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
          </Grid>
        )}

        {activeTab !== "sent" &&
          filtered.length === 0 &&
          (() => {
            const focusAddFriend = () => {
              const el = document.getElementById("foodies-add-friend");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                const input = el.querySelector<HTMLInputElement>("input");
                setTimeout(() => input?.focus(), 400);
              }
            };
            if (activeTab === "online")
              return (
                <Card radius="xl" padding="lg" shadow="none" surface="muted">
                  <EmptyState
                    icon={<MoonStar size={32} strokeWidth={1.5} />}
                    title="No one online right now"
                    description="Check back later to see who's active."
                  />
                </Card>
              );
            if (activeTab === "high-match")
              return (
                <Card radius="xl" padding="lg" shadow="none" surface="muted">
                  <EmptyState
                    icon={<Crosshair size={32} strokeWidth={1.5} />}
                    title="No high-match foodies yet"
                    description="Discover and add foodies to find your taste twins."
                  />
                </Card>
              );
            if (query.trim())
              return (
                <Card radius="xl" padding="lg" shadow="none" surface="muted">
                  <EmptyState
                    icon={<SearchX size={32} strokeWidth={1.5} />}
                    title={`No results for "${query}"`}
                    description="Try a different name or clear the search."
                  />
                </Card>
              );
            return (
              <Card radius="xl" padding="lg" shadow="none" surface="muted">
                <EmptyState
                  icon={<Users size={32} strokeWidth={1.5} />}
                  title="Your foodies list is empty"
                  description="Search by username above to add your first foodie."
                  action={
                    <Button
                      variant="primary"
                      size="md"
                      onClick={focusAddFriend}
                    >
                      Add your first foodie
                    </Button>
                  }
                />
              </Card>
            );
          })()}

        {activeTab !== "sent" && discover.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <Column style={{ gap: tokens.space[4] }}>
              <Row vertical="center" style={{ gap: tokens.space[2] }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: tokens.radius.sm,
                    background: "rgba(168, 85, 247, 0.1)",
                    color: tokens.color.magic,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={14} strokeWidth={1.75} />
                </span>
                <Column style={{ gap: 2 }}>
                  <Row vertical="center" style={{ gap: tokens.space[2] }}>
                    <H3>Discover foodies</H3>
                    <Pill tone="magic" size="sm">
                      AI-matched
                    </Pill>
                  </Row>
                  <Caption tone="muted">
                    People with matching taste vectors you haven&apos;t
                    connected with yet
                  </Caption>
                </Column>
              </Row>
              <Grid
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: tokens.space[4],
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
              </Grid>
            </Column>
          </motion.div>
        )}
      </Column>
    </Column>
  );
}
