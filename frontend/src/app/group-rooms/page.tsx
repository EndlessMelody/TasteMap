"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronLeft,
  Plus,
  Search,
  MapPin,
  Clock,
  Crown,
  Zap,
  Lock,
  Globe,
  KeyRound,
  Check,
  X,
  Save,
  Flame,
  Coffee,
  Utensils,
  Gem,
  Moon,
  Sunrise,
  Soup,
  IceCreamCone,
  Sparkles,
  Home,
  Users,
  AlertTriangle,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { LobbyDetailModal, AvatarStack } from "@/components/features/lobby";
import type {
  LobbyData,
  LobbyCategory,
  LobbyStatus,
} from "@/components/features/lobby/types";
import {
  Card,
  Button,
  IconButton,
  Field,
  Pill,
  H1,
  H2,
  H3,
  Body,
  BodySm,
  Caption,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";

interface ApiMember {
  user_id: number;
  display_name?: string | null;
  avatar_url?: string | null;
  is_host: boolean;
  is_ready: boolean;
}

interface ApiRoom {
  id: number;
  name: string;
  status: string;
  route_description?: string | null;
  scheduled_time?: string | null;
  max_spots: number;
  cover_image_url?: string | null;
  accent_color?: string | null;
  is_public: boolean;
  invite_code?: string | null;
  members: ApiMember[];
  spots_remaining: number;
}

function mapApiRoom(r: ApiRoom): LobbyData {
  const host = r.members.find((m) => m.is_host);
  const status: LobbyStatus =
    r.spots_remaining === 0
      ? "full"
      : r.status === "in_progress" || r.status === "in-progress"
        ? "in-progress"
        : "waiting";
  return {
    id: r.id,
    name: r.name,
    route: r.route_description ?? "—",
    time: r.scheduled_time
      ? new Date(r.scheduled_time).toLocaleString([], {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "TBD",
    spots: r.max_spots,
    bg:
      r.cover_image_url ??
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=320&fit=crop",
    accent: r.accent_color ?? tokens.color.warm,
    is_public: r.is_public,
    invite_code: r.invite_code ?? undefined,
    status,
    members: r.members.map((m) => ({
      user_id: m.user_id,
      name: m.display_name ?? "Member",
      avatar:
        m.avatar_url ??
        `https://api.dicebear.com/9.x/thumbs/svg?seed=${m.user_id}`,
      ready: m.is_ready,
    })),
    host: host
      ? {
          name: host.display_name ?? "Host",
          avatar:
            host.avatar_url ??
            `https://api.dicebear.com/9.x/thumbs/svg?seed=${host.user_id}`,
        }
      : undefined,
  };
}

const STATUS_TABS = ["All", "Waiting", "In Progress", "Full"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const ALL_CATEGORIES: Array<LobbyCategory | "All"> = [
  "All",
  "Food Challenge",
  "Coffee Tour",
  "Street Food",
  "Hidden Gems",
  "Night Market",
  "Brunch",
  "Ramen Hunt",
  "Dessert Crawl",
];

const CATEGORY_ICON: Record<string, React.ReactElement> = {
  "Food Challenge": <Flame size={12} strokeWidth={1.75} />,
  "Coffee Tour": <Coffee size={12} strokeWidth={1.75} />,
  "Street Food": <Utensils size={12} strokeWidth={1.75} />,
  "Hidden Gems": <Gem size={12} strokeWidth={1.75} />,
  "Night Market": <Moon size={12} strokeWidth={1.75} />,
  Brunch: <Sunrise size={12} strokeWidth={1.75} />,
  "Ramen Hunt": <Soup size={12} strokeWidth={1.75} />,
  "Dessert Crawl": <IceCreamCone size={12} strokeWidth={1.75} />,
  All: <Sparkles size={12} strokeWidth={1.75} />,
};

type StatusToneMap = "success" | "warm" | "danger";
const STATUS_TONE: Record<LobbyStatus, StatusToneMap> = {
  waiting: "success",
  "in-progress": "warm",
  full: "danger",
};
const STATUS_LABEL: Record<LobbyStatus, string> = {
  waiting: "Waiting",
  "in-progress": "Live",
  full: "Full",
};

function JoinByCodeModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) {
      toast.error("Please enter an invite code.");
      return;
    }
    setLoading(true);
    try {
      const room = await apiPost<ApiRoom>("/api/v1/groups/join-by-code", {
        invite_code: code.trim().toUpperCase(),
      });
      toast.success(`Joined "${room.name}".`);
      onClose();
      router.push(`/group-rooms/${room.id}`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Invalid or expired invite code.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: tokens.z.modal,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10, 10, 10, 0.4)",
        backdropFilter: "blur(8px)",
        padding: tokens.space[4],
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 400 }}
      >
        <Card radius="xl" padding="none" shadow="lg" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: tokens.space[6],
              background: tokens.color.surfaceMuted,
              position: "relative",
            }}
          >
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Close"
              icon={<X size={16} strokeWidth={1.75} />}
              onClick={onClose}
              style={{
                position: "absolute",
                top: tokens.space[3],
                right: tokens.space[3],
              }}
            />
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: tokens.radius.md,
                background: tokens.color.surface,
                color: tokens.color.text,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: tokens.space[3],
              }}
            >
              <KeyRound size={22} strokeWidth={1.75} />
            </span>
            <H2>Join private room</H2>
            <BodySm tone="muted" style={{ marginTop: tokens.space[1] }}>
              Enter the invite code from your host.
            </BodySm>
          </div>
          <div
            style={{
              padding: tokens.space[6],
              display: "flex",
              flexDirection: "column",
              gap: tokens.space[4],
            }}
          >
            <Field
              label="Invite code"
              placeholder="FEAST-4X2K"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={10}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              style={{
                fontFamily: "monospace",
                textAlign: "center",
                letterSpacing: "0.1em",
                fontSize: 17,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            />
            <div style={{ display: "flex", gap: tokens.space[3] }}>
              <Button variant="ghost" size="md" fullWidth onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                loading={loading}
                leftIcon={<KeyRound size={14} strokeWidth={1.75} />}
                onClick={handleJoin}
              >
                Join room
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function RoomCard({
  lobby,
  onClick,
}: {
  lobby: LobbyData;
  onClick: () => void;
}) {
  const { user } = useAuth();
  const isJoined = Boolean(
    user && lobby.members.some((m) => m.user_id === user.id),
  );
  const router = useRouter();
  const spotsLeft = lobby.spots - lobby.members.length;
  const status = lobby.status ?? "waiting";
  const fillPct = Math.round((lobby.members.length / lobby.spots) * 100);

  return (
    <Card
      radius="lg"
      padding="none"
      shadow="sm"
      interactive
      onClick={onClick}
      style={{ overflow: "hidden", cursor: "pointer", userSelect: "none" }}
    >
      <div
        style={{
          position: "relative",
          height: 156,
          overflow: "hidden",
        }}
      >
        <img
          src={lobby.bg}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(10, 10, 10, 0.65) 0%, rgba(10, 10, 10, 0.1) 55%, transparent 100%)",
          }}
        />

        {lobby.category && (
          <div
            style={{
              position: "absolute",
              top: tokens.space[3],
              left: tokens.space[3],
            }}
          >
            <Pill
              tone="neutral"
              size="sm"
              leftIcon={CATEGORY_ICON[lobby.category]}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: tokens.color.textInverse,
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
              }}
            >
              {lobby.category}
            </Pill>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: tokens.space[3],
            right: tokens.space[3],
          }}
        >
          <Pill
            tone={lobby.is_public === false ? "magic" : "success"}
            size="sm"
            solid
            leftIcon={
              lobby.is_public === false ? (
                <Lock size={9} strokeWidth={1.75} />
              ) : (
                <Globe size={9} strokeWidth={1.75} />
              )
            }
          >
            {lobby.is_public === false ? "Private" : "Public"}
          </Pill>
        </div>

        <div
          style={{
            position: "absolute",
            top: tokens.space[3],
            right: tokens.space[3],
          }}
        >
          <Pill
            tone={STATUS_TONE[status]}
            size="sm"
            solid
            leftIcon={
              status === "in-progress" ? (
                <Zap size={11} fill="currentColor" />
              ) : status === "full" ? (
                <Lock size={11} strokeWidth={1.75} />
              ) : undefined
            }
            dot={status === "waiting"}
          >
            {STATUS_LABEL[status]}
          </Pill>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: `0 ${tokens.space[4]} ${tokens.space[3]}`,
          }}
        >
          <H3
            style={{
              color: tokens.color.textInverse,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {lobby.name}
          </H3>
        </div>
      </div>

      <div style={{ padding: tokens.space[4] }}>
        {lobby.description && (
          <BodySm
            tone="muted"
            style={{
              marginBottom: tokens.space[3],
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {lobby.description}
          </BodySm>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: `${tokens.space[1]} ${tokens.space[4]}`,
            marginBottom: tokens.space[3],
            color: tokens.color.textMuted,
          }}
        >
          <BodySm
            tone="muted"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <MapPin size={12} strokeWidth={1.75} />
            {lobby.route}
          </BodySm>
          <BodySm
            tone="muted"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Clock size={12} strokeWidth={1.75} />
            {lobby.time}
          </BodySm>
        </div>

        {lobby.tags && lobby.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: tokens.space[1],
              marginBottom: tokens.space[3],
            }}
          >
            {lobby.tags.map((tag) => (
              <Pill key={tag} tone="warm" size="sm">
                {tag}
              </Pill>
            ))}
          </div>
        )}

        <div style={{ marginBottom: tokens.space[3] }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: tokens.space[1],
            }}
          >
            <Caption tone="muted">
              {lobby.members.length} / {lobby.spots} joined
            </Caption>
            {spotsLeft > 0 ? (
              <Caption
                style={{
                  color: tokens.color.warm,
                  fontWeight: tokens.type.weight.semibold,
                }}
              >
                {spotsLeft} spot{spotsLeft > 1 ? "s" : ""} left
              </Caption>
            ) : (
              <Caption
                style={{
                  color: tokens.color.danger,
                  fontWeight: tokens.type.weight.semibold,
                }}
              >
                Full
              </Caption>
            )}
          </div>
          <div
            style={{
              height: 6,
              background: tokens.color.surfaceInset,
              borderRadius: tokens.radius.pill,
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPct}%` }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{
                height: "100%",
                background: tokens.color.warm,
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {lobby.host && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: tokens.space[1],
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={lobby.host.avatar}
                  alt=""
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: `2px solid ${tokens.color.surface}`,
                    objectFit: "cover",
                  }}
                />
                <Crown
                  size={9}
                  strokeWidth={1.75}
                  fill="currentColor"
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    color: tokens.color.warning,
                  }}
                />
              </div>
              <Caption tone="muted">{lobby.host.name}</Caption>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space[2],
            }}
          >
            <AvatarStack members={lobby.members.slice(0, 4)} spotsLeft={0} />
            <Button
              variant={
                status === "full"
                  ? "ghost"
                  : status === "in-progress"
                    ? "secondary"
                    : "primary"
              }
              size="sm"
              disabled={status === "full"}
              onClick={(e) => {
                e.stopPropagation();
                if (status !== "full" && lobby.id) {
                  router.push(`/group-rooms/${lobby.id}`);
                } else {
                  onClick();
                }
              }}
            >
              {status === "full"
                ? "Full"
                : status === "in-progress"
                  ? "Watch"
                  : isJoined
                    ? "Enter"
                    : "Join"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CreateRoomModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (room: LobbyData) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [route, setRoute] = useState("");
  const [time, setTime] = useState("");
  const [spots, setSpots] = useState(4);
  const [category, setCategory] = useState<LobbyCategory>("Food Challenge");
  const [isPublic, setIsPublic] = useState(true);
  const [pendingCode, setPendingCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !route.trim()) {
      toast.error("Room name and route are required.");
      return;
    }
    if (!isPublic && !pendingCode) {
      setPendingCode(true);
      return;
    }
    setLoading(true);
    try {
      const body = {
        name: name.trim(),
        route_description: route.trim(),
        max_spots: spots,
        is_public: isPublic,
        ...(description.trim() ? { description: description.trim() } : {}),
      };
      const created = await apiPost<ApiRoom>("/api/v1/groups/", body);
      const mapped = mapApiRoom(created);
      onCreated(mapped);
      toast.success(`Room "${name}" created.`);
      onClose();
      router.push(`/group-rooms/${created.id}`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to create room.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: tokens.z.modal,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10, 10, 10, 0.4)",
        backdropFilter: "blur(8px)",
        padding: tokens.space[4],
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 560 }}
      >
        <Card
          radius="xl"
          padding="none"
          shadow="lg"
          style={{ overflow: "hidden" }}
        >
          <div
            style={{
              padding: tokens.space[6],
              background: tokens.color.surfaceMuted,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <H2>Create a room</H2>
              <BodySm tone="muted" style={{ marginTop: tokens.space[1] }}>
                Host a new group food adventure.
              </BodySm>
            </div>
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Close"
              icon={<X size={18} strokeWidth={1.75} />}
              onClick={onClose}
            />
          </div>

          <div
            className="no-scrollbar"
            style={{
              padding: tokens.space[6],
              display: "flex",
              flexDirection: "column",
              gap: tokens.space[4],
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            <Field
              label="Room name"
              placeholder="e.g. Spicy Noodle Challenge"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Field
              multiline
              label="Description"
              placeholder="Tell others what the vibe is…"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: tokens.space[2],
              }}
            >
              <BodySm style={{ fontWeight: tokens.type.weight.semibold }}>
                Category
              </BodySm>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: tokens.space[2],
                }}
              >
                {(ALL_CATEGORIES.slice(1) as LobbyCategory[]).map((cat) => {
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: `${tokens.space[1]} ${tokens.space[3]}`,
                        borderRadius: tokens.radius.pill,
                        border: `1px solid ${active ? tokens.color.warm : tokens.color.border}`,
                        background: active
                          ? tokens.color.warm
                          : tokens.color.surface,
                        color: active
                          ? tokens.color.textInverse
                          : tokens.color.textMuted,
                        fontSize: tokens.type.size.bodySm,
                        fontWeight: tokens.type.weight.semibold,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {CATEGORY_ICON[cat]} {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <Field
              label="Route / location"
              placeholder="e.g. District 1 → Bến Thành"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              leading={<MapPin size={16} strokeWidth={1.75} />}
            />

            <div style={{ display: "flex", gap: tokens.space[3] }}>
              <div style={{ flex: 1 }}>
                <Field
                  label="Time"
                  placeholder="Tonight at 8 PM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  leading={<Clock size={15} strokeWidth={1.75} />}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: tokens.space[2],
                }}
              >
                <BodySm style={{ fontWeight: tokens.type.weight.semibold }}>
                  Max spots
                </BodySm>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: tokens.space[2],
                  }}
                >
                  <IconButton
                    variant="secondary"
                    size="sm"
                    aria-label="Decrease spots"
                    onClick={() => setSpots(Math.max(2, spots - 1))}
                    icon={<span style={{ fontSize: 18 }}>−</span>}
                  />
                  <span
                    style={{
                      fontSize: 17,
                      fontWeight: tokens.type.weight.bold,
                      width: 24,
                      textAlign: "center",
                    }}
                  >
                    {spots}
                  </span>
                  <IconButton
                    variant="secondary"
                    size="sm"
                    aria-label="Increase spots"
                    onClick={() => setSpots(Math.min(12, spots + 1))}
                    icon={<span style={{ fontSize: 18 }}>+</span>}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: tokens.space[2],
              }}
            >
              <BodySm style={{ fontWeight: tokens.type.weight.semibold }}>
                Room visibility
              </BodySm>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: tokens.space[2],
                }}
              >
                {([true, false] as const).map((pub) => {
                  const active = isPublic === pub;
                  return (
                    <button
                      key={String(pub)}
                      type="button"
                      onClick={() => {
                        setIsPublic(pub);
                        setPendingCode(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: tokens.space[2],
                        padding: tokens.space[4],
                        borderRadius: tokens.radius.md,
                        background: active
                          ? tokens.color.surface
                          : tokens.color.surfaceMuted,
                        border: `1px solid ${active ? (pub ? tokens.color.success : tokens.color.magic) : tokens.color.border}`,
                        color: active ? tokens.color.text : tokens.color.textMuted,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textAlign: "left",
                      }}
                    >
                      {pub ? (
                        <Globe
                          size={16}
                          strokeWidth={1.75}
                          style={{
                            color: active ? tokens.color.success : tokens.color.textMuted,
                          }}
                        />
                      ) : (
                        <Lock
                          size={16}
                          strokeWidth={1.75}
                          style={{
                            color: active ? tokens.color.magic : tokens.color.textMuted,
                          }}
                        />
                      )}
                      <div>
                        <BodySm
                          style={{
                            fontWeight: tokens.type.weight.semibold,
                            lineHeight: 1,
                          }}
                        >
                          {pub ? "Public" : "Private"}
                        </BodySm>
                        <Caption tone="muted" style={{ marginTop: 2 }}>
                          {pub ? "Anyone can join" : "Invite code only"}
                        </Caption>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {pendingCode && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card radius="md" padding="sm" shadow="none" surface="muted">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: tokens.space[2],
                    }}
                  >
                    <KeyRound
                      size={15}
                      strokeWidth={1.75}
                      style={{
                        color: tokens.color.magic,
                        marginTop: 2,
                        flexShrink: 0,
                      }}
                    />
                    <BodySm tone="muted">
                      An invite code will be generated for you automatically.
                      Share it with friends after creation.
                    </BodySm>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          <div
            style={{
              padding: `${tokens.space[3]} ${tokens.space[6]} ${tokens.space[6]}`,
              display: "flex",
              gap: tokens.space[3],
            }}
          >
            <Button variant="ghost" size="md" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={pendingCode ? "primary" : "primary"}
              size="md"
              fullWidth
              loading={loading}
              leftIcon={
                pendingCode ? (
                  <Check size={16} strokeWidth={1.75} />
                ) : (
                  <Save size={16} strokeWidth={1.75} />
                )
              }
              onClick={handleCreate}
            >
              {pendingCode ? "Confirm & create" : "Create room"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function GroupRoomsPage() {
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("All");
  const [activeCategory, setActiveCategory] = useState<LobbyCategory | "All">(
    "All",
  );
  const router = useRouter();
  const { user } = useAuth();

  const [rooms, setRooms] = useState<LobbyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedLobby, setSelectedLobby] = useState<LobbyData | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoinByCode, setShowJoinByCode] = useState(false);

  const handleLobbyClick = (lobby: LobbyData) => {
    const isJoined = Boolean(
      user && lobby.members.some((m) => m.user_id === user.id),
    );
    if (isJoined && lobby.id) {
      router.push(`/group-rooms/${lobby.id}`);
    } else {
      setSelectedLobby(lobby);
    }
  };

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await apiGet<{ items: ApiRoom[] }>(
        "/api/v1/groups/?status=active&limit=50&public_only=false",
      );
      setRooms(data.items.map(mapApiRoom));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load rooms.";
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleRoomCreated = (room: LobbyData) => {
    setRooms((prev) => [room, ...prev]);
  };

  const counts = useMemo(
    () => ({
      All: rooms.length,
      Waiting: rooms.filter((l) => (l.status ?? "waiting") === "waiting").length,
      "In Progress": rooms.filter((l) => l.status === "in-progress").length,
      Full: rooms.filter((l) => l.status === "full").length,
    }),
    [rooms],
  );

  const filtered = useMemo(() => {
    return rooms.filter((l) => {
      const s = l.status ?? "waiting";
      const matchStatus =
        statusTab === "All" ||
        (statusTab === "Waiting" && s === "waiting") ||
        (statusTab === "In Progress" && s === "in-progress") ||
        (statusTab === "Full" && s === "full");
      const matchCat =
        activeCategory === "All" || l.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.route.toLowerCase().includes(q) ||
        (l.description ?? "").toLowerCase().includes(q);
      return matchStatus && matchCat && matchSearch;
    });
  }, [rooms, statusTab, activeCategory, search]);

  const totalMembers = rooms.reduce((s, l) => s + l.members.length, 0);
  const inProgressCount = rooms.filter((l) => l.status === "in-progress").length;

  return (
    <div
      className="no-scrollbar"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: tokens.color.bg,
        color: tokens.color.text,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: tokens.z.sticky,
          background: "rgba(250, 250, 247, 0.88)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: `1px solid ${tokens.color.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `${tokens.space[4]} ${tokens.space[8]}`,
            gap: tokens.space[3],
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space[4],
            }}
          >
            <Link
              href="/discover"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: tokens.space[1],
                color: tokens.color.warm,
                textDecoration: "none",
                fontSize: tokens.type.size.body,
                fontWeight: tokens.type.weight.semibold,
              }}
            >
              <ChevronLeft size={20} strokeWidth={1.75} />
              Discover
            </Link>
            <div
              style={{
                width: 1,
                height: 20,
                background: tokens.color.border,
              }}
            />
            <div>
              <H1 style={{ fontSize: 22, lineHeight: 1 }}>Group rooms</H1>
              <Caption tone="muted" style={{ marginTop: 2 }}>
                {counts.All} active · {totalMembers} explorers online
              </Caption>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space[2],
            }}
          >
            <Button
              variant="secondary"
              size="md"
              leftIcon={<KeyRound size={15} strokeWidth={1.75} />}
              onClick={() => setShowJoinByCode(true)}
            >
              Join with code
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus size={16} strokeWidth={1.75} />}
              onClick={() => setShowCreate(true)}
            >
              Create room
            </Button>
          </div>
        </div>
      </div>

      <div
        style={{ padding: `${tokens.space[6]} ${tokens.space[8]} ${tokens.space[12]}` }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: tokens.space[4],
            marginBottom: tokens.space[6],
          }}
        >
          {[
            {
              label: "Active rooms",
              value: counts.All,
              icon: <Home size={20} strokeWidth={1.75} />,
            },
            {
              label: "Explorers online",
              value: totalMembers,
              icon: <Users size={20} strokeWidth={1.75} />,
            },
            {
              label: "In progress now",
              value: inProgressCount,
              icon: <Zap size={20} strokeWidth={1.75} />,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card radius="lg" padding="md" shadow="sm">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: tokens.space[3],
                  }}
                >
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: tokens.radius.md,
                      background: tokens.color.surfaceMuted,
                      color: tokens.color.textMuted,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {stat.icon}
                  </span>
                  <div>
                    <Body
                      style={{
                        fontSize: 24,
                        fontWeight: tokens.type.weight.bold,
                        lineHeight: 1.1,
                      }}
                    >
                      {stat.value}
                    </Body>
                    <Caption tone="muted">{stat.label}</Caption>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space[2],
            marginBottom: tokens.space[4],
            flexWrap: "wrap",
          }}
        >
          {STATUS_TABS.map((tab) => {
            const isActive = statusTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusTab(tab)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: tokens.space[1],
                  padding: `${tokens.space[2]} ${tokens.space[4]}`,
                  borderRadius: tokens.radius.pill,
                  border: isActive
                    ? "1px solid transparent"
                    : `1px solid ${tokens.color.border}`,
                  background: isActive ? tokens.color.warm : tokens.color.surface,
                  color: isActive
                    ? tokens.color.textInverse
                    : tokens.color.textMuted,
                  fontSize: tokens.type.size.bodySm,
                  fontWeight: tokens.type.weight.semibold,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.18s ease",
                }}
              >
                {tab}
                <Pill
                  tone={isActive ? "warm" : "neutral"}
                  size="sm"
                  style={
                    isActive
                      ? {
                          background: "rgba(255, 255, 255, 0.25)",
                          color: tokens.color.textInverse,
                        }
                      : undefined
                  }
                >
                  {counts[tab as keyof typeof counts]}
                </Pill>
              </button>
            );
          })}

          <div style={{ marginLeft: "auto", width: 220 }}>
            <Field
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rooms…"
              leading={<Search size={15} strokeWidth={1.75} />}
              trailing={
                search ? (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label="Clear"
                    onClick={() => setSearch("")}
                    icon={<X size={14} strokeWidth={1.75} />}
                  />
                ) : undefined
              }
            />
          </div>
        </div>

        <div
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: tokens.space[2],
            overflowX: "auto",
            paddingBottom: 4,
            marginBottom: tokens.space[6],
          }}
        >
          {ALL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: tokens.space[1],
                  padding: `${tokens.space[1]} ${tokens.space[3]}`,
                  borderRadius: tokens.radius.pill,
                  border: `1px solid ${isActive ? tokens.color.text : tokens.color.border}`,
                  background: isActive
                    ? tokens.color.text
                    : tokens.color.surface,
                  color: isActive
                    ? tokens.color.textInverse
                    : tokens.color.textMuted,
                  fontSize: tokens.type.size.bodySm,
                  fontWeight: tokens.type.weight.semibold,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {CATEGORY_ICON[cat]}
                {cat === "All" ? "All categories" : cat}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: tokens.space[5],
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={280} radius="lg" />
              ))}
            </motion.div>
          ) : fetchError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card radius="xl" padding="lg" shadow="none" surface="muted">
                <EmptyState
                  icon={<AlertTriangle size={32} strokeWidth={1.5} />}
                  title="Could not load rooms"
                  description={fetchError}
                  action={
                    <Button variant="primary" size="md" onClick={fetchRooms}>
                      Retry
                    </Button>
                  }
                />
              </Card>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card radius="xl" padding="lg" shadow="none" surface="muted">
                <EmptyState
                  icon={<SearchX size={32} strokeWidth={1.5} />}
                  title="No rooms found"
                  description="Try a different filter or create your own."
                  action={
                    <Button
                      variant="primary"
                      size="md"
                      leftIcon={<Plus size={15} strokeWidth={1.75} />}
                      onClick={() => setShowCreate(true)}
                    >
                      Create a room
                    </Button>
                  }
                />
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: tokens.space[5],
              }}
            >
              {filtered.map((lobby, idx) => (
                <motion.div
                  key={lobby.id ?? lobby.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: idx * 0.04,
                    duration: 0.32,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <RoomCard
                    lobby={lobby}
                    onClick={() => handleLobbyClick(lobby)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedLobby && (
          <LobbyDetailModal
            lobby={selectedLobby}
            onClose={() => setSelectedLobby(null)}
          />
        )}
        {showCreate && (
          <CreateRoomModal
            onClose={() => setShowCreate(false)}
            onCreated={handleRoomCreated}
          />
        )}
        {showJoinByCode && (
          <JoinByCodeModal onClose={() => setShowJoinByCode(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
