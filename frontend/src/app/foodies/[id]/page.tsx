"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Column,
  Row,
  Heading,
  Text,
  Avatar,
  Button,
} from "@/components/OnceUI";

// ── Premium Icons (lucide-react) ──
import {
  MessageCircle,
  UserPlus,
  UserCheck,
  Clock,
  MapPin,
  Medal,
  Users,
  BookOpen,
  Layers,
  Sparkles,
  ChevronLeft,
  Dna,
  Trophy,
} from "lucide-react";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ClientOnly from "@/components/common/ClientOnly";
import { motion, AnimatePresence } from "framer-motion";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useUserVector } from "@/context/UserVectorContext";
import { useChat } from "@/context/ChatContext";
import type { Friend } from "@/components/features/foodies/FriendRow";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: number;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  cover_url?: string;
  location?: string;
  title?: string;
  xp: number;
  level: number;
  created_at?: string;
  stats: {
    reviews: number;
    visited: number;
    followers: number;
    following: number;
  };
  badges: { icon: string; label: string; color: string }[];
}

interface MutualFriend {
  id: number;
  username: string;
  display_name?: string;
  avatar_url?: string;
}

interface SocialContext {
  friendship_status: string;
  friendship_id?: number;
  food_vector?: number[];
  mutual_friends_count: number;
  mutual_friends: MutualFriend[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80";
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop";
const RADAR_SUBJECTS = [
  "Street Food",
  "Spicy",
  "Sweet",
  "Luxury",
  "Quiet",
  "Group",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer-slide {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .sk {
          background: linear-gradient(90deg, var(--dsc-surface-muted) 25%, var(--dsc-surface) 50%, var(--dsc-surface-muted) 75%);
          background-size: 200% 100%;
          animation: shimmer-slide 1.4s ease-in-out infinite;
        }
      `}</style>
      <Column
        fillHeight
        style={{
          width: "100%",
          overflowY: "auto",
          backgroundColor: "var(--dsc-bg)",
        }}
      >
        <div className="sk" style={{ height: 220, flexShrink: 0 }} />
        <div
          style={{
            maxWidth: 860,
            width: "100%",
            margin: "0 auto",
            padding: "0 40px 64px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 20,
              marginTop: -50,
              marginBottom: 20,
            }}
          >
            <div
              className="sk"
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "4px solid var(--dsc-bg)",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                paddingBottom: 6,
              }}
            >
              <div
                className="sk"
                style={{ height: 22, borderRadius: 8, width: "52%" }}
              />
              <div
                className="sk"
                style={{ height: 13, borderRadius: 6, width: "28%" }}
              />
            </div>
          </div>
          <div
            className="sk"
            style={{ height: 88, borderRadius: 16, marginBottom: 12 }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
              marginBottom: 12,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="sk"
                style={{ height: 62, borderRadius: 16 }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <div
              className="sk"
              style={{ height: 42, width: 108, borderRadius: 12 }}
            />
            <div
              className="sk"
              style={{ height: 42, width: 108, borderRadius: 12 }}
            />
          </div>
          <div className="sk" style={{ height: 320, borderRadius: 20 }} />
        </div>
      </Column>
    </>
  );
}

function MatchGauge({ pct }: { pct: number }) {
  const size = 64,
    sw = 5,
    r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const color = pct >= 80 ? "#16A34A" : pct >= 60 ? "#D97706" : "#9CA3AF";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={sw}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "white",
            lineHeight: 1,
          }}
        >
          {pct}
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          %
        </span>
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  color = "white",
  bg = "#ff6b35",
  border,
  boxShadow,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  color?: string;
  bg?: string;
  border?: string;
  boxShadow?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "11px 20px",
        borderRadius: 12,
        border: border ?? "none",
        backgroundColor: bg,
        color,
        fontSize: 14,
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        whiteSpace: "nowrap",
        fontFamily: "inherit",
        boxShadow: boxShadow,
        transition: "box-shadow 0.2s",
      }}
    >
      {children}
    </motion.button>
  );
}

// ─── Glassmorphic Card ──────────────────────────────────────────────────────
function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="dsc-lift"
        style={{
          backgroundColor: "var(--dsc-surface)",
          borderRadius: 20,
          border: "1px solid var(--dsc-border)",
          padding: 24,
          boxShadow: "var(--dsc-shadow-sm)",
          marginBottom: 16,
          transition:
            "box-shadow 0.3s var(--dsc-ease-out), transform 0.3s var(--dsc-ease-out)",
          ...style,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({
  icon,
  label,
  color = "var(--dsc-accent-warm)",
  iconBg,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  color?: string;
  iconBg?: string;
  badge?: React.ReactNode;
}) {
  return (
    <Row style={{ alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          background:
            iconBg ?? `linear-gradient(135deg, ${color}14, ${color}22)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <Text
        style={{
          fontSize: 15,
          fontWeight: 800,
          color: "var(--dsc-text)",
          letterSpacing: "-0.3px",
        }}
      >
        {label}
      </Text>
      {badge}
    </Row>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FoodieProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { radarData: myRadarData } = useUserVector();
  const { setActiveFriend, setIsChatOpen } = useChat();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [social, setSocial] = useState<SocialContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const userId = parseInt(id, 10);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prof, ctx] = await Promise.all([
        apiGet<UserProfile>(`/api/v1/users/${userId}`),
        apiGet<SocialContext>(`/api/v1/users/${userId}/social-context`),
      ]);
      setProfile(prof);
      setSocial(ctx);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const withBusy = async (fn: () => Promise<void>) => {
    setActionBusy(true);
    try {
      await fn();
      await load();
    } catch {
    } finally {
      setActionBusy(false);
    }
  };

  const handleAddFriend = () =>
    withBusy(() => apiPost("/api/v1/friends/request", { friend_id: userId }));

  const handleCancel = () =>
    withBusy(() => apiDelete(`/api/v1/friends/${social?.friendship_id}`));

  const handleAccept = () =>
    withBusy(() => apiPatch(`/api/v1/friends/${social?.friendship_id}/accept`));

  const handleUnfriend = () =>
    withBusy(() => apiDelete(`/api/v1/friends/${social?.friendship_id}`));

  const handleMessage = () => {
    if (!profile) return;
    const friend: Friend = {
      id: profile.id,
      name: profile.display_name || profile.username,
      status: profile.title || profile.bio || "TasteMap Explorer",
      note: profile.location || "",
      avatar: profile.avatar_url || DEFAULT_AVATAR,
      cover: profile.cover_url || DEFAULT_COVER,
    };
    setActiveFriend(friend);
    setIsChatOpen(true);
    router.push("/foodies");
  };

  // ── Render states ──
  if (loading) return <ProfileSkeleton />;

  if (error || !profile) {
    return (
      <Column
        fillHeight
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          backgroundColor: "var(--dsc-bg)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background:
              "linear-gradient(135deg, rgba(255,107,53,0.08), rgba(255,107,53,0.16))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--dsc-accent-warm)",
          }}
        >
          <Sparkles size={28} strokeWidth={2} />
        </div>
        <Heading
          variant="heading-strong-m"
          style={{ color: "var(--dsc-text)" }}
        >
          Profile not found
        </Heading>
        <Text
          variant="body-default-s"
          style={{ color: "var(--dsc-text-subtle)" }}
        >
          {error}
        </Text>
        <Button
          variant="secondary"
          onClick={() => router.push("/foodies")}
          style={{ marginTop: 8, borderRadius: 12 }}
        >
          ← Back to Foodies
        </Button>
      </Column>
    );
  }

  // ── Radar data ──
  const theirVec = social?.food_vector ?? [];
  const radarChartData = RADAR_SUBJECTS.map((subject, i) => ({
    subject,
    you: myRadarData.find((r) => r.subject === subject)?.A ?? 75,
    them: Math.round((theirVec[i] ?? 0.5) * 150),
    fullMark: 150,
  }));

  const matchScore = social?.food_vector
    ? (() => {
        const a = myRadarData.map((r) => r.A / 150);
        const b = social.food_vector!;
        const dot = a.reduce((s, v, i) => s + v * (b[i] ?? 0.5), 0);
        const na = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
        const nb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
        return na && nb ? Math.round((dot / (na * nb)) * 100) : 0;
      })()
    : null;

  const fs = social?.friendship_status ?? "none";
  const displayName = profile.display_name || profile.username;

  const STAT_TILES = [
    {
      label: "Posts",
      value: profile.stats.reviews,
      icon: <BookOpen size={13} strokeWidth={2.25} />,
      color: "#ff6b35",
    },
    {
      label: "Visited",
      value: profile.stats.visited,
      icon: <MapPin size={13} strokeWidth={2.25} />,
      color: "#D97706",
    },
    {
      label: "Foodies",
      value: profile.stats.followers,
      icon: <Users size={13} strokeWidth={2.25} />,
      color: "var(--dsc-accent-success)",
    },
    {
      label: `Lv.${profile.level}`,
      value: `${profile.xp} XP`,
      icon: <Medal size={13} strokeWidth={2.25} />,
      color: "var(--dsc-accent-magic)",
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
      {/* ══ Cover Banner ══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ position: "relative", height: 220, flexShrink: 0 }}
      >
        <img
          src={profile.cover_url || DEFAULT_COVER}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        {/* Warm wash — editorial color tint */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(255,107,53,0.05) 0%, transparent 40%, rgba(168,85,247,0.08) 100%)",
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }}
        />
        {/* Bottom fade — blends into page surface */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.65) 100%)",
          }}
        />

        {/* Back nav */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/foodies")}
          style={{
            position: "absolute",
            top: 18,
            left: 22,
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "8px 14px",
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
          Foodies
        </motion.button>

        {/* Match badge */}
        {matchScore !== null && (
          <div style={{ position: "absolute", top: 18, right: 22 }}>
            <MatchGauge pct={matchScore} />
          </div>
        )}

        {/* Label at bottom */}
        <div style={{ position: "absolute", bottom: 16, left: 30 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "1.2px",
              color: "rgba(255,255,255,0.7)",
              textTransform: "uppercase",
            }}
          >
            Foodie Profile
          </Text>
        </div>
      </motion.div>

      {/* ══ Content ══ */}
      <div
        style={{
          maxWidth: 860,
          width: "100%",
          margin: "0 auto",
          padding: "0 40px 64px",
        }}
      >
        {/* Avatar row — overlaps cover */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Row
            style={{
              alignItems: "flex-end",
              gap: 20,
              marginTop: -50,
              marginBottom: 20,
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar
                src={profile.avatar_url || DEFAULT_AVATAR}
                name={displayName}
                size="xl"
                style={{
                  border: "4px solid var(--dsc-bg)",
                  boxShadow: "0 4px 20px rgba(255,107,53,0.12)",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 5,
                  right: 5,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  backgroundColor: "var(--dsc-accent-success)",
                  border: "2.5px solid var(--dsc-bg)",
                }}
              />
            </div>
            <Column style={{ gap: 3, paddingBottom: 6, flex: 1 }}>
              <Heading
                variant="heading-strong-l"
                style={{ color: "var(--dsc-text)", letterSpacing: "-0.8px" }}
              >
                {displayName}
              </Heading>
              <Row style={{ alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <Text
                  variant="body-default-s"
                  style={{ color: "var(--dsc-text-subtle)" }}
                >
                  @{profile.username}
                </Text>
                {profile.location && (
                  <Row style={{ alignItems: "center", gap: 4 }}>
                    <MapPin
                      size={12}
                      strokeWidth={2.25}
                      color="var(--dsc-text-subtle)"
                    />
                    <Text
                      variant="body-default-xs"
                      style={{ color: "var(--dsc-text-subtle)" }}
                    >
                      {profile.location}
                    </Text>
                  </Row>
                )}
              </Row>
            </Column>
          </Row>
        </motion.div>

        {/* Title + Bio */}
        {(profile.title || profile.bio) && (
          <Card>
            <Column style={{ gap: 10 }}>
              {profile.title && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 12px",
                    borderRadius: 20,
                    backgroundColor: "rgba(217,119,6,0.06)",
                    border: "1px solid rgba(217,119,6,0.18)",
                    width: "fit-content",
                  }}
                >
                  <Medal size={12} strokeWidth={2.25} color="#D97706" />
                  <Text
                    style={{ fontSize: 12, fontWeight: 700, color: "#D97706" }}
                  >
                    {profile.title}
                  </Text>
                </div>
              )}
              {profile.bio && (
                <Text
                  variant="body-default-s"
                  style={{ color: "var(--dsc-text-muted)", lineHeight: 1.6 }}
                >
                  {profile.bio}
                </Text>
              )}
            </Column>
          </Card>
        )}

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {STAT_TILES.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.28, delay: i * 0.06 }}
              >
                <Column
                  className="dsc-lift"
                  style={{
                    alignItems: "center",
                    padding: "16px 8px",
                    backgroundColor: "var(--dsc-surface)",
                    borderRadius: 16,
                    border: "1px solid var(--dsc-border)",
                    gap: 4,
                    boxShadow: "var(--dsc-shadow-sm)",
                    transition:
                      "box-shadow 0.3s var(--dsc-ease-out), transform 0.3s var(--dsc-ease-out)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "var(--dsc-text)",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {s.value}
                  </Text>
                  <Row style={{ alignItems: "center", gap: 4, color: s.color }}>
                    {s.icon}
                    <Text
                      variant="body-default-xs"
                      style={{
                        color: "var(--dsc-text-subtle)",
                        fontWeight: 500,
                      }}
                    >
                      {s.label}
                    </Text>
                  </Row>
                </Column>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Row style={{ gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            <ActionButton
              onClick={handleMessage}
              bg="var(--dsc-surface)"
              color="var(--dsc-text)"
              border="1.5px solid var(--dsc-border)"
              boxShadow="var(--dsc-shadow-sm)"
            >
              <MessageCircle size={16} strokeWidth={2.25} />
              Message
            </ActionButton>

            <ActionButton
              onClick={() => router.push("/group-rooms")}
              bg="rgba(168,85,247,0.06)"
              color="var(--dsc-accent-magic)"
              border="1.5px solid rgba(168,85,247,0.2)"
            >
              <Layers size={16} strokeWidth={2.25} />
              Food Tour
            </ActionButton>

            <AnimatePresence mode="wait">
              {fs === "none" && (
                <motion.div
                  key="add"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <ActionButton
                    onClick={handleAddFriend}
                    disabled={actionBusy}
                    bg="linear-gradient(135deg, #ff6b35, #e65721)"
                    color="white"
                    boxShadow="0 4px 14px rgba(255,107,53,0.28)"
                  >
                    <UserPlus size={16} strokeWidth={2.5} />
                    Add Friend
                  </ActionButton>
                </motion.div>
              )}

              {fs === "pending_sent" && (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <ActionButton
                    onClick={handleCancel}
                    disabled={actionBusy}
                    bg="var(--dsc-surface)"
                    color="var(--dsc-text-subtle)"
                    border="1.5px solid var(--dsc-border)"
                  >
                    <Clock size={16} strokeWidth={2.5} />
                    Pending · Cancel
                  </ActionButton>
                </motion.div>
              )}

              {fs === "pending_received" && (
                <motion.div
                  key="received"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  style={{ display: "flex", gap: 10 }}
                >
                  <ActionButton
                    onClick={handleAccept}
                    disabled={actionBusy}
                    bg="linear-gradient(135deg, #16A34A, #15803d)"
                    color="white"
                    boxShadow="0 4px 14px rgba(22,163,74,0.22)"
                  >
                    <UserCheck size={16} strokeWidth={2.5} />
                    Accept Request
                  </ActionButton>
                  <ActionButton
                    onClick={handleCancel}
                    disabled={actionBusy}
                    bg="var(--dsc-surface)"
                    color="var(--dsc-text-subtle)"
                    border="1.5px solid var(--dsc-border)"
                  >
                    Decline
                  </ActionButton>
                </motion.div>
              )}

              {fs === "accepted" && (
                <motion.div
                  key="friends"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <ActionButton
                    onClick={handleUnfriend}
                    disabled={actionBusy}
                    bg="rgba(52,199,89,0.06)"
                    color="#16A34A"
                    border="1.5px solid rgba(52,199,89,0.25)"
                  >
                    <UserCheck size={16} strokeWidth={2.5} />
                    Friends · Unfriend
                  </ActionButton>
                </motion.div>
              )}
            </AnimatePresence>
          </Row>
        </motion.div>

        {/* ── Taste DNA Chart ── */}
        <Card>
          <SectionLabel
            icon={<Dna size={15} strokeWidth={2.25} />}
            label="Taste DNA"
            color="var(--dsc-accent-warm)"
            badge={
              matchScore !== null ? (
                <div
                  style={{
                    padding: "3px 10px",
                    borderRadius: 20,
                    backgroundColor:
                      matchScore >= 80
                        ? "rgba(52,199,89,0.08)"
                        : "rgba(255,149,0,0.08)",
                    border: `1px solid ${matchScore >= 80 ? "rgba(52,199,89,0.22)" : "rgba(255,149,0,0.22)"}`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: matchScore >= 80 ? "#16A34A" : "#D97706",
                    }}
                  >
                    {matchScore}% match
                  </Text>
                </div>
              ) : undefined
            }
          />
          <ClientOnly>
            <ResponsiveContainer width="100%" height={270}>
              <RadarChart
                data={radarChartData}
                margin={{ top: 8, right: 24, bottom: 8, left: 24 }}
              >
                <PolarGrid stroke="var(--dsc-border)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{
                    fill: "var(--dsc-text-subtle)",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                <Radar
                  name="You"
                  dataKey="you"
                  stroke="#ff6b35"
                  fill="#ff6b35"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
                <Radar
                  name={displayName}
                  dataKey="them"
                  stroke="#FF9500"
                  fill="#FF9500"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
                <Legend
                  formatter={(value) => (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--dsc-text-muted)",
                      }}
                    >
                      {value}
                    </span>
                  )}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ClientOnly>
        </Card>

        {/* ── Mutual Foodies ── */}
        {social && social.mutual_friends_count > 0 && (
          <Card>
            <SectionLabel
              icon={<Users size={15} strokeWidth={2.25} />}
              label="Mutual Foodies"
              color="var(--dsc-accent-success)"
              badge={
                <div
                  style={{
                    padding: "2px 10px",
                    borderRadius: 20,
                    backgroundColor: "rgba(255,107,53,0.06)",
                    border: "1px solid rgba(255,107,53,0.15)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--dsc-accent-warm)",
                    }}
                  >
                    {social.mutual_friends_count}
                  </Text>
                </div>
              }
            />
            {/* Compact stacked-avatar row with +N overflow */}
            <Row vertical="center" style={{ gap: 14, flexWrap: "wrap" }}>
              <Row
                vertical="center"
                style={{
                  paddingLeft: 10,
                  flexShrink: 0,
                }}
              >
                {social.mutual_friends.slice(0, 5).map((mf, i) => (
                  <motion.button
                    key={mf.id}
                    initial={{ opacity: 0, scale: 0.8, x: -8 }}
                    whileInView={{ opacity: 1, scale: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    whileHover={{ y: -4, zIndex: 10 }}
                    onClick={() => router.push(`/foodies/${mf.id}`)}
                    title={mf.display_name || mf.username}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      marginLeft: i === 0 ? 0 : -12,
                      display: "flex",
                      position: "relative",
                      zIndex: 5 - i,
                      borderRadius: "50%",
                      transition: "transform 0.2s var(--dsc-ease-out)",
                    }}
                  >
                    <Avatar
                      src={mf.avatar_url || DEFAULT_AVATAR}
                      name={mf.display_name || mf.username}
                      size="l"
                      style={{
                        border: "3px solid var(--dsc-surface)",
                        boxShadow: "0 2px 8px rgba(10,10,10,0.08)",
                      }}
                    />
                  </motion.button>
                ))}
                {social.mutual_friends_count > 5 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    style={{
                      marginLeft: -12,
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, rgba(255,107,53,0.10), rgba(168,85,247,0.10))",
                      border: "3px solid var(--dsc-surface)",
                      boxShadow: "0 2px 8px rgba(10,10,10,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                      color: "var(--dsc-accent-warm)",
                      letterSpacing: "-0.3px",
                      zIndex: 0,
                    }}
                  >
                    +{social.mutual_friends_count - 5}
                  </motion.div>
                )}
              </Row>
              <Column style={{ gap: 2, minWidth: 0, flex: 1 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--dsc-text)",
                    letterSpacing: "-0.2px",
                  }}
                >
                  {social.mutual_friends
                    .slice(0, 2)
                    .map((mf) => (mf.display_name || mf.username).split(" ")[0])
                    .join(", ")}
                  {social.mutual_friends_count > 2 && (
                    <span
                      style={{
                        color: "var(--dsc-text-muted)",
                        fontWeight: 500,
                      }}
                    >
                      {" "}
                      and {social.mutual_friends_count - 2} other
                      {social.mutual_friends_count - 2 === 1 ? "" : "s"}
                    </span>
                  )}
                </Text>
                <Text
                  variant="body-default-xs"
                  style={{ color: "var(--dsc-text-subtle)" }}
                >
                  Also connected with {displayName}
                </Text>
              </Column>
            </Row>
          </Card>
        )}

        {/* ── Badges ── */}
        {profile.badges.length > 0 && (
          <Card>
            <SectionLabel
              icon={<Trophy size={15} strokeWidth={2.25} />}
              label="Achievements"
              color="#D97706"
            />
            <Row style={{ gap: 10, flexWrap: "wrap" }}>
              {profile.badges.map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <Row
                    style={{
                      alignItems: "center",
                      gap: 7,
                      padding: "8px 14px",
                      borderRadius: 20,
                      backgroundColor: `${badge.color}10`,
                      border: `1.5px solid ${badge.color}28`,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{badge.icon}</span>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: badge.color,
                      }}
                    >
                      {badge.label}
                    </Text>
                  </Row>
                </motion.div>
              ))}
            </Row>
          </Card>
        )}
      </div>
    </Column>
  );
}
