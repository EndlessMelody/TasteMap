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
import {
  ChevronLeft,
  MessageSquare,
  UserPlus,
  UserCheck,
  Clock,
  MapPin,
  Award,
  Users,
  BookOpen,
  Layers,
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
        .sk { background: linear-gradient(90deg, #ebebeb 25%, #d6d6d6 50%, #ebebeb 75%); background-size: 200% 100%; animation: shimmer-slide 1.4s ease-in-out infinite; }
      `}</style>
      <Column
        fillHeight
        style={{ width: "100%", overflowY: "auto", backgroundColor: "#F2F2F7" }}
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
                border: "4px solid #F2F2F7",
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
  color = "#007AFF",
  bg,
  border,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  color?: string;
  bg?: string;
  border?: string;
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
        backgroundColor: bg ?? color,
        color: bg ? color : "white",
        fontSize: 14,
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </motion.button>
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
          gap: 12,
          backgroundColor: "#F2F2F7",
        }}
      >
        <Text style={{ fontSize: "2.5rem" }}>🍽️</Text>
        <Heading variant="heading-strong-m" style={{ color: "#1C1C1E" }}>
          Profile not found
        </Heading>
        <Text variant="body-default-s" style={{ color: "rgba(0,0,0,0.4)" }}>
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

  return (
    <Column
      fillHeight
      className="no-scrollbar"
      style={{ width: "100%", overflowY: "auto", backgroundColor: "#F2F2F7" }}
    >
      {/* ══ Cover Banner ══ */}
      <div style={{ position: "relative", height: 220, flexShrink: 0 }}>
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.5) 100%)",
          }}
        />
        {/* Back nav */}
        <button
          onClick={() => router.push("/foodies")}
          style={{
            position: "absolute",
            top: 18,
            left: 22,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={15} />
          Foodies
        </button>
        {/* Match badge */}
        {matchScore !== null && (
          <div style={{ position: "absolute", top: 18, right: 22 }}>
            <MatchGauge pct={matchScore} />
          </div>
        )}
        {/* Name overlay at bottom of cover */}
        <div style={{ position: "absolute", bottom: 16, left: 30 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "1.2px",
              color: "rgba(255,255,255,0.75)",
              textTransform: "uppercase",
            }}
          >
            Foodie Profile
          </Text>
        </div>
      </div>

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
                border: "4px solid white",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
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
                backgroundColor: "#34C759",
                border: "2.5px solid white",
              }}
            />
          </div>
          <Column style={{ gap: 3, paddingBottom: 6, flex: 1 }}>
            <Heading
              variant="heading-strong-l"
              style={{ color: "#1C1C1E", letterSpacing: "-0.8px" }}
            >
              {displayName}
            </Heading>
            <Row style={{ alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <Text
                variant="body-default-s"
                style={{ color: "rgba(0,0,0,0.4)" }}
              >
                @{profile.username}
              </Text>
              {profile.location && (
                <Row style={{ alignItems: "center", gap: 4 }}>
                  <MapPin size={12} color="rgba(0,0,0,0.35)" />
                  <Text
                    variant="body-default-xs"
                    style={{ color: "rgba(0,0,0,0.4)" }}
                  >
                    {profile.location}
                  </Text>
                </Row>
              )}
            </Row>
          </Column>
        </Row>

        {/* Title + Bio */}
        {(profile.title || profile.bio) && (
          <Column
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.05)",
              padding: "18px 20px",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {profile.title && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 20,
                  backgroundColor: "rgba(255,149,0,0.08)",
                  border: "1px solid rgba(255,149,0,0.2)",
                  width: "fit-content",
                }}
              >
                <Award size={13} color="#D97706" />
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
                style={{ color: "rgba(0,0,0,0.6)", lineHeight: 1.6 }}
              >
                {profile.bio}
              </Text>
            )}
          </Column>
        )}

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginBottom: 16,
          }}
        >
          {[
            {
              label: "Posts",
              value: profile.stats.reviews,
              icon: <BookOpen size={13} />,
            },
            {
              label: "Visited",
              value: profile.stats.visited,
              icon: <MapPin size={13} />,
            },
            {
              label: "Foodies",
              value: profile.stats.followers,
              icon: <Users size={13} />,
            },
            {
              label: "Level",
              value: `Lv.${profile.level}`,
              icon: <Award size={13} />,
            },
          ].map((s) => (
            <Column
              key={s.label}
              style={{
                alignItems: "center",
                padding: "14px 8px",
                backgroundColor: "white",
                borderRadius: 16,
                border: "1px solid rgba(0,0,0,0.05)",
                gap: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#1C1C1E",
                  letterSpacing: "-0.5px",
                }}
              >
                {s.value}
              </Text>
              <Row
                style={{
                  alignItems: "center",
                  gap: 4,
                  color: "rgba(0,0,0,0.4)",
                }}
              >
                {s.icon}
                <Text
                  variant="body-default-xs"
                  style={{ color: "rgba(0,0,0,0.4)", fontWeight: 500 }}
                >
                  {s.label}
                </Text>
              </Row>
            </Column>
          ))}
        </div>

        {/* Action bar */}
        <Row style={{ gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
          <ActionButton
            onClick={handleMessage}
            bg="white"
            color="#1C1C1E"
            border="1.5px solid rgba(0,0,0,0.1)"
          >
            <MessageSquare size={16} />
            Message
          </ActionButton>

          <ActionButton
            onClick={() => router.push("/group-rooms")}
            bg="rgba(175,82,222,0.07)"
            color="#AF52DE"
            border="1.5px solid rgba(175,82,222,0.2)"
          >
            <Layers size={16} />
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
                  bg="#007AFF"
                >
                  <UserPlus size={16} />
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
                  bg="white"
                  color="rgba(0,0,0,0.5)"
                  border="1.5px solid rgba(0,0,0,0.1)"
                >
                  <Clock size={16} />
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
                  bg="#34C759"
                >
                  <UserCheck size={16} />
                  Accept Request
                </ActionButton>
                <ActionButton
                  onClick={handleCancel}
                  disabled={actionBusy}
                  bg="white"
                  color="rgba(0,0,0,0.5)"
                  border="1.5px solid rgba(0,0,0,0.1)"
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
                  border="1.5px solid rgba(52,199,89,0.3)"
                >
                  <UserCheck size={16} />
                  Friends · Unfriend
                </ActionButton>
              </motion.div>
            )}
          </AnimatePresence>
        </Row>

        {/* ── Taste DNA ── */}
        <Column
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            border: "1px solid rgba(0,0,0,0.05)",
            padding: "24px",
            gap: 4,
            marginBottom: 16,
          }}
        >
          <Row style={{ alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "#1C1C1E",
                letterSpacing: "-0.3px",
              }}
            >
              🍄 Taste DNA
            </Text>
            {matchScore !== null && (
              <div
                style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  backgroundColor:
                    matchScore >= 80
                      ? "rgba(52,199,89,0.1)"
                      : "rgba(255,149,0,0.1)",
                  border: `1px solid ${
                    matchScore >= 80
                      ? "rgba(52,199,89,0.25)"
                      : "rgba(255,149,0,0.25)"
                  }`,
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
            )}
          </Row>
          <ClientOnly>
            <ResponsiveContainer width="100%" height={270}>
              <RadarChart
                data={radarChartData}
                margin={{ top: 8, right: 24, bottom: 8, left: 24 }}
              >
                <PolarGrid stroke="rgba(0,0,0,0.07)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{
                    fill: "rgba(0,0,0,0.55)",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                <Radar
                  name="You"
                  dataKey="you"
                  stroke="#007AFF"
                  fill="#007AFF"
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
                        color: "rgba(0,0,0,0.55)",
                      }}
                    >
                      {value}
                    </span>
                  )}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ClientOnly>
        </Column>

        {/* ── Mutual Foodies ── */}
        {social && social.mutual_friends_count > 0 && (
          <Column
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              border: "1px solid rgba(0,0,0,0.05)",
              padding: "24px",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <Row style={{ alignItems: "center", gap: 8 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#1C1C1E",
                  letterSpacing: "-0.3px",
                }}
              >
                🤝 Mutual Foodies
              </Text>
              <div
                style={{
                  padding: "2px 10px",
                  borderRadius: 20,
                  backgroundColor: "rgba(0,122,255,0.08)",
                  border: "1px solid rgba(0,122,255,0.15)",
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: 700, color: "#007AFF" }}
                >
                  {social.mutual_friends_count}
                </Text>
              </div>
            </Row>
            <Row style={{ gap: 20, flexWrap: "wrap" }}>
              {social.mutual_friends.map((mf) => (
                <button
                  key={mf.id}
                  onClick={() => router.push(`/foodies/${mf.id}`)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 10px",
                    borderRadius: 12,
                    transition: "background 0.15s",
                  }}
                >
                  <Avatar
                    src={mf.avatar_url || DEFAULT_AVATAR}
                    name={mf.display_name || mf.username}
                    size="l"
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#1C1C1E",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {(mf.display_name || mf.username).split(" ")[0]}
                  </Text>
                </button>
              ))}
            </Row>
          </Column>
        )}

        {/* ── Badges ── */}
        {profile.badges.length > 0 && (
          <Column
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              border: "1px solid rgba(0,0,0,0.05)",
              padding: "24px",
              gap: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "#1C1C1E",
                letterSpacing: "-0.3px",
              }}
            >
              🏆 Achievements
            </Text>
            <Row style={{ gap: 10, flexWrap: "wrap" }}>
              {profile.badges.map((badge, i) => (
                <Row
                  key={i}
                  style={{
                    alignItems: "center",
                    gap: 7,
                    padding: "8px 14px",
                    borderRadius: 20,
                    backgroundColor: `${badge.color}18`,
                    border: `1.5px solid ${badge.color}30`,
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
              ))}
            </Row>
          </Column>
        )}
      </div>
    </Column>
  );
}
