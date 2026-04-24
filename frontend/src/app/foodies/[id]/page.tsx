"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Column,
  Row,
  Heading,
  Text,
  Avatar,
  Button,
  Grid,
} from "@/components/OnceUI";

import {
  ProfileIdentityCard,
  FlavorProfileCard,
  FriendsListCard,
  ProfileTabs,
  QuickActionsCard,
  TasteMapStatsCard,
  TasteDNACard,
  TopHighlightsCard,
  EditProfileModal,
  ProfileStickyHeader,
  ProfileCover,
  ProfileAvatarGroup,
  FriendItem,
  PostItem
} from "@/components/features/profile";

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
  Paperclip,
  ImageIcon,
  Smile,
  X,
  Pause,
  StopCircle,
  ThumbsUp,
  Play // Nhớ check xem có Play chưa
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
import { BadgeSummary } from "@/types/gamification";
import BadgeCard from "@/components/features/gamification/BadgeCard";
import { useBadges } from "@/hooks/useBadges";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import type { Friend } from "@/components/features/foodies/FriendRow";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";


// 2. THÊM VÀO KHU VỰC HELPERS (trên component VoicePlayer)
function normalizeMimeType(mimeType: string): string {
  return mimeType.split(";", 1)[0]?.trim()?.toLowerCase() || "application/octet-stream";
}

function getAudioFileExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/mp4": "mp4",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
  };
  return map[mimeType] ?? mimeType.split("/")[1] ?? "webm";
}

function formatVoiceDuration(seconds: unknown): string {
  const s = typeof seconds === "number" ? seconds : Number(seconds);
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const r = Math.round(s);
  return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, "0")}`;
}

function getDateLabel(createdAt?: string): string {
  if (!createdAt) return "Today";
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return "Today";
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesStart = new Date(todayStart);
  yesStart.setDate(todayStart.getDate() - 1);
  if (d >= todayStart) return "Today";
  if (d >= yesStart) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function bubbleRadius(sender: "me" | "them", pos: "single" | "first" | "middle" | "last"): string {
  const R = 18, t = 4;
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

const EMOJI_LIST = [
  "😀", "😂", "😍", "😎", "🤔", "🥺", "🙏", "👏", "🔥", "✨", "🎉", "💯",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "👍", "👎", "👌", "🤣", "😇", "🫡",
  "😋", "🤤", "🥳", "😴", "🍔", "🍜", "🍣", "🍕", "🧋", "☕", "🍰", "🥗",
];

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
  badges: BadgeSummary[];
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

// function DateSeparator({ label }: { label: string }) {
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
//       <div style={{ flex: 1, height: 1, backgroundColor: "#E5E5EA" }} />
//       <span
//         style={{
//           fontSize: 11, fontWeight: 600, color: "#8E8E93",
//           backgroundColor: "#F9F9FB", padding: "3px 10px",
//           borderRadius: 20, border: "1px solid #E5E5EA", whiteSpace: "nowrap",
//         }}
//       >
//         {label}
//       </span>
//       <div style={{ flex: 1, height: 1, backgroundColor: "#E5E5EA" }} />
//     </div>
//   );
// }

// function VoicePlayer({ src, isMe, durationHint }: { src: string; isMe: boolean; durationHint?: number }) {
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);

//   const total = duration > 0 ? duration : (durationHint ?? 0);

//   useEffect(() => {
//     const a = audioRef.current;
//     return () => { a?.pause(); };
//   }, []);

//   const toggle = () => {
//     const a = audioRef.current;
//     if (!a) return;
//     if (a.paused) { void a.play(); setIsPlaying(true); }
//     else { a.pause(); setIsPlaying(false); }
//   };

//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 200 }}>
//       <audio
//         ref={audioRef}
//         src={src}
//         preload="metadata"
//         onLoadedMetadata={() => { const d = audioRef.current?.duration ?? 0; if (isFinite(d) && d > 0) setDuration(d); }}
//         onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
//         onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
//         style={{ display: "none" }}
//       />
//       <button
//         onClick={toggle}
//         style={{
//           width: 28, height: 28, borderRadius: "50%", border: "none", cursor: "pointer",
//           display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
//           background: isMe ? "rgba(255,255,255,0.2)" : "rgba(255,107,53,0.14)",
//           color: isMe ? "#fff" : "#ff6b35",
//         }}
//       >
//         {isPlaying ? <Pause size={13} /> : <Play size={13} />}
//       </button>
//       <input
//         type="range" min={0} max={Math.max(total, 0.1)} step={0.05}
//         value={Math.min(currentTime, Math.max(total, 0.1))}
//         onChange={(e) => {
//           const t = Number(e.target.value);
//           if (audioRef.current) audioRef.current.currentTime = t;
//           setCurrentTime(t);
//         }}
//         style={{ flex: 1, accentColor: isMe ? "#fff" : "#ff6b35" }}
//       />
//       <span style={{ fontSize: 11, color: isMe ? "rgba(255,255,255,0.85)" : "#8E8E93", whiteSpace: "nowrap" }}>
//         {formatVoiceDuration(currentTime)} / {formatVoiceDuration(total)}
//       </span>
//     </div>
//   );
// }

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

function SocialActionItem({ 
  icon, 
  label, 
  color, 
  onClick, 
  disabled, 
  subtitle 
}: { 
  icon: React.ReactNode; 
  label: string; 
  color: string; 
  onClick: () => void; 
  disabled?: boolean;
  subtitle?: string;
}) {
  return (
    <motion.div
      whileHover={disabled ? {} : { x: 4, backgroundColor: "#F9F9FB" }}
      onClick={!disabled ? onClick : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px",
        borderRadius: "12px",
        cursor: disabled ? "default" : "pointer",
        transition: "all 0.2s",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div style={{ 
        color, 
        backgroundColor: `${color}14`, 
        width: 32, 
        height: 32, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        borderRadius: 8
      }}>
        {icon}
      </div>
      <Column style={{ gap: "2px" }}>
        <Text style={{ color: "#1C1C1E", fontWeight: 600, fontSize: "0.88rem" }}>
          {label}
        </Text>
        {subtitle && (
          <Text style={{ color: "#8E8E93", fontSize: "0.75rem" }}>
            {subtitle}
          </Text>
        )}
      </Column>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FoodieProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { radarData: myRadarData } = useUserVector();
  const { setActiveFriend, setIsChatOpen } = useChat();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [social, setSocial] = useState<SocialContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  // ── States for ProfileTabs (Posts/Reviews/Achievements) ──
  const [userPosts, setUserPosts] = useState<PostItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsTotal, setPostsTotal] = useState(0);

  const userId = parseInt(id, 10);
  const { badges, loading: badgesLoading, totalBadges } = useBadges(userId);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prof, ctx] = await Promise.all([
        apiGet<UserProfile>(`/api/v1/users/${userId}`),
        apiGet<SocialContext>(`/api/v1/users/${userId}/social-context`),
      ]);
      setProfile({ ...prof, badges: [] }); // badges are now handled by useBadges hook
      setSocial(ctx);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchUserPosts = useCallback(async () => {
    if (!userId) return;
    setPostsLoading(true);
    try {
      const data = await apiGet<{ items: PostItem[]; total: number }>(
        `/api/v1/posts/?user_id=${userId}&limit=50&offset=0`
      );
      setUserPosts(data?.items || []);
      setPostsTotal(data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch foodie posts", err);
    } finally {
      setPostsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
    fetchUserPosts();
  }, [load, fetchUserPosts]);

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
          maxWidth: 1200, // Widened for 2 columns
          width: "100%",
          margin: "0 auto",
          padding: "0 24px 64px",
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
            <ProfileAvatarGroup user={profile as any} />
          </Row>
        </motion.div>

        {/* ── Main Layout Grid ── */}
        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", 
            gap: "24px",
            alignItems: "start"
          }}
        >
          {/* ══ LEFT COLUMN ══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Identity Card */}
            <ProfileIdentityCard user={profile as any} />

            {/* Taste DNA Comparison Card (Signature Feature) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid #F2F2F7",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <Row
                style={{
                  gap: "8px",
                  alignItems: "center",
                  marginBottom: "20px",
                  justifyContent: "space-between",
                }}
              >
                <Row style={{ gap: "8px", alignItems: "center" }}>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
                      padding: "6px",
                      borderRadius: "8px",
                    }}
                  >
                    <Dna size={16} color="white" />
                  </div>
                  <Text style={{ color: "#1C1C1E", fontWeight: 700, fontSize: "1rem" }}>
                    Taste DNA Compare
                  </Text>
                </Row>
                {matchScore !== null && (
                  <div
                    style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      backgroundColor: matchScore >= 80 ? "#EAFBEF" : "#FFF7E6",
                      color: matchScore >= 80 ? "#16A34A" : "#D97706",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                    }}
                  >
                    {matchScore}% Compatibility
                  </div>
                )}
              </Row>

              <div style={{ height: 320, width: "100%" }}>
                <ClientOnly>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={radarChartData}
                      margin={{ top: 8, right: 30, bottom: 8, left: 30 }}
                    >
                      <PolarGrid stroke="#F2F2F7" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{
                          fill: "#8E8E93",
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      />
                      <Radar
                        name="You"
                        dataKey="you"
                        stroke="#ff6b35"
                        fill="#ff6b35"
                        fillOpacity={0.12}
                        strokeWidth={2.5}
                      />
                      <Radar
                        name={displayName}
                        dataKey="them"
                        stroke="#FF9500"
                        fill="#FF9500"
                        fillOpacity={0.12}
                        strokeWidth={2.5}
                      />
                      <Legend verticalAlign="bottom" />
                    </RadarChart>
                  </ResponsiveContainer>
                </ClientOnly>
              </div>
            </motion.div>

            {/* Flavor Profile Details */}
            <FlavorProfileCard />

            {/* Mutual Friends Section */}
            <FriendsListCard 
              friendsList={(social?.mutual_friends || []).map(f => ({
                id: f.id,
                username: f.username,
                display_name: f.display_name,
                avatar_url: f.avatar_url,
                match_score: 0, // Score not available for mutual list usually
              }))}
              friendsLoading={loading}
              onSeeAll={() => {}} // Could link to a mutuals modal
            />
          </div>

          {/* ══ RIGHT COLUMN ══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Social Quick Actions Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid #F2F2F7",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <Text style={{ color: "#1C1C1E", fontWeight: 700, fontSize: "0.95rem", marginBottom: "16px" }}>
                Social Connections
              </Text>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Message Action */}
                <SocialActionItem 
                  icon={<MessageCircle size={18} />} 
                  label="Send Message" 
                  color="#007AFF" 
                  onClick={handleMessage} 
                />

                {/* Food Tour Action */}
                <SocialActionItem 
                  icon={<Layers size={18} />} 
                  label="Create Food Tour" 
                  color="#A855F7" 
                  onClick={() => router.push("/group-rooms")} 
                />

                {/* Friendship Logic Actions */}
                {fs === "none" && (
                  <SocialActionItem 
                    icon={<UserPlus size={18} />} 
                    label="Add Friend" 
                    color="#ff6b35" 
                    onClick={handleAddFriend}
                    disabled={actionBusy}
                  />
                )}
                {fs === "pending_sent" && (
                  <SocialActionItem 
                    icon={<Clock size={18} />} 
                    label="Cancel Request" 
                    color="#8E8E93" 
                    onClick={handleCancel}
                    disabled={actionBusy}
                  />
                )}
                {fs === "pending_received" && (
                  <>
                    <SocialActionItem 
                      icon={<UserCheck size={18} />} 
                      label="Confirm Request" 
                      color="#34C759" 
                      onClick={handleAccept}
                      disabled={actionBusy}
                    />
                    <SocialActionItem 
                      icon={<X size={18} />} 
                      label="Decline Request" 
                      color="#FF3B30" 
                      onClick={handleCancel}
                      disabled={actionBusy}
                    />
                  </>
                )}
                {fs === "accepted" && (
                  <SocialActionItem 
                    icon={<UserCheck size={18} />} 
                    label="Connected" 
                    color="#34C759" 
                    onClick={handleUnfriend}
                    disabled={actionBusy}
                    subtitle="Click to unfriend"
                  />
                )}
              </div>
            </motion.div>

            {/* Profile Statistics Card */}
            <TasteMapStatsCard user={profile as any} />

            {/* Top Highlights (Contextual) */}
            <TopHighlightsCard 
              radarData={radarChartData.map(d => ({ ...d, A: d.them }))} 
            />
          </div>
        </div>

        {/* ── Main Profile Tabs (Posts, Reviews, Badges) ── */}
        <div style={{ marginTop: "48px" }}>
          <ProfileTabs 
            postsLoading={postsLoading}
            userPosts={userPosts}
            badges={badges}
            totalBadges={totalBadges}
            badgesLoading={badgesLoading}
            isOwner={user?.id === profile.id}
          />
        </div>
      </div>
    </Column>
  );
}
