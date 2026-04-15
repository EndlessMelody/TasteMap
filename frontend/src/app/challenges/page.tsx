"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Flame,
  Star,
  Zap,
  Crown,
  Lock,
  CheckCircle,
  Clock,
  ChevronRight,
  Award,
  Utensils,
  Camera,
  Users,
  Map,
  Heart,
  Coffee,
  Medal,
  Moon,
  SearchX,
} from "lucide-react";
import { MOCK_USER } from "@/constants/mock-data";

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = "easy" | "medium" | "hard";
type ChallengeStatus = "active" | "completed" | "upcoming";
type ChallengeCategory =
  | "discovery"
  | "social"
  | "review"
  | "cuisine"
  | "streak";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  xpReward: number;
  progress: number;
  target: number;
  deadline: string;
  difficulty: Difficulty;
  icon: React.ReactNode;
  accent: string;
  status: ChallengeStatus;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  badge: string;
  isCurrentUser?: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CHALLENGES: Challenge[] = [
  {
    id: "c1",
    title: "Cuisine Explorer",
    description: "Try 5 different cuisine types this week.",
    category: "cuisine",
    xpReward: 250,
    progress: 3,
    target: 5,
    deadline: "3 days left",
    difficulty: "medium",
    icon: <Utensils size={20} />,
    accent: "#FF6B35",
    status: "active",
  },
  {
    id: "c2",
    title: "Night Owl",
    description: "Visit 3 night market spots after 9 PM.",
    category: "discovery",
    xpReward: 180,
    progress: 2,
    target: 3,
    deadline: "5 days left",
    difficulty: "easy",
    icon: <Map size={20} />,
    accent: "#7B2FF7",
    status: "active",
  },
  {
    id: "c3",
    title: "Social Foodie",
    description: "Join 2 group rooms and complete the adventure.",
    category: "social",
    xpReward: 320,
    progress: 1,
    target: 2,
    deadline: "This week",
    difficulty: "medium",
    icon: <Users size={20} />,
    accent: "#007AFF",
    status: "active",
  },
  {
    id: "c4",
    title: "Photo Master",
    description: "Post 10 food photos with ratings this month.",
    category: "review",
    xpReward: 400,
    progress: 10,
    target: 10,
    deadline: "Completed!",
    difficulty: "hard",
    icon: <Camera size={20} />,
    accent: "#2A9D8F",
    status: "completed",
  },
  {
    id: "c5",
    title: "Spice Seeker",
    description: "Rate 5 spicy dishes and review them.",
    category: "cuisine",
    xpReward: 200,
    progress: 5,
    target: 5,
    deadline: "Completed!",
    difficulty: "easy",
    icon: <Flame size={20} />,
    accent: "#ED1B24",
    status: "completed",
  },
  {
    id: "c6",
    title: "Coffee Connoisseur",
    description: "Check in to 8 specialty coffee shops.",
    category: "discovery",
    xpReward: 300,
    progress: 0,
    target: 8,
    deadline: "Starts in 2 days",
    difficulty: "hard",
    icon: <Coffee size={20} />,
    accent: "#F59E0B",
    status: "upcoming",
  },
  {
    id: "c7",
    title: "Street Food Sprint",
    description: "Try 12 different street food items.",
    category: "discovery",
    xpReward: 350,
    progress: 0,
    target: 12,
    deadline: "Next week",
    difficulty: "medium",
    icon: <Utensils size={20} />,
    accent: "#10B981",
    status: "upcoming",
  },
  {
    id: "c8",
    title: "Fan Favorite",
    description: "Receive 20 likes on your food reviews.",
    category: "social",
    xpReward: 280,
    progress: 0,
    target: 20,
    deadline: "Next month",
    difficulty: "medium",
    icon: <Heart size={20} />,
    accent: "#EC4899",
    status: "upcoming",
  },
];

const LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "Ramona",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop",
    xp: 14820,
    level: 82,
    badge: "crown",
  },
  {
    rank: 2,
    name: "Kenji",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop",
    xp: 12350,
    level: 75,
    badge: "fire",
  },
  {
    rank: 3,
    name: "Melody",
    avatar: MOCK_USER.avatar,
    xp: 10240,
    level: 69,
    badge: "zap",
    isCurrentUser: true,
  },
  {
    rank: 4,
    name: "Hana",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop",
    xp: 8910,
    level: 61,
    badge: "moon",
  },
  {
    rank: 5,
    name: "Nam",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop",
    xp: 7640,
    level: 54,
    badge: "flame",
  },
  {
    rank: 6,
    name: "Vy",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop",
    xp: 6200,
    level: 48,
    badge: "coffee",
  },
  {
    rank: 7,
    name: "Tran",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop",
    xp: 5100,
    level: 41,
    badge: "camera",
  },
];

const BADGE_ICON: Record<string, React.ReactElement> = {
  crown: <Crown size={10} />,
  fire: <Flame size={10} />,
  zap: <Zap size={10} />,
  moon: <Moon size={10} />,
  flame: <Flame size={10} />,
  coffee: <Coffee size={10} />,
  camera: <Camera size={10} />,
};

const DIFF_CONFIG: Record<
  Difficulty,
  { label: string; color: string; bg: string }
> = {
  easy: { label: "Easy", color: "#34C759", bg: "rgba(52,199,89,0.1)" },
  medium: { label: "Medium", color: "#FF9500", bg: "rgba(255,149,0,0.1)" },
  hard: { label: "Hard", color: "#FF3B30", bg: "rgba(255,59,48,0.1)" },
};

const CAT_TABS = ["All", "Active", "Completed", "Upcoming"] as const;
type CatTab = (typeof CAT_TABS)[number];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChallengeCard({ c, index }: { c: Challenge; index: number }) {
  const diff = DIFF_CONFIG[c.difficulty];
  const pct = Math.min((c.progress / c.target) * 100, 100);
  const isCompleted = c.status === "completed";
  const isUpcoming = c.status === "upcoming";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        type: "spring",
        stiffness: 260,
        damping: 24,
      }}
      className="bg-white rounded-[22px] p-5 flex flex-col gap-4"
      style={{
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: isCompleted
          ? `0 4px 20px ${c.accent}22`
          : "0 4px 16px rgba(0,0,0,0.04)",
        opacity: isUpcoming ? 0.72 : 1,
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-[14px] flex items-center justify-center"
            style={{ backgroundColor: c.accent + "18", color: c.accent }}
          >
            {c.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-[#1C1C1E] leading-none">
                {c.title}
              </h3>
              {isCompleted && (
                <CheckCircle size={15} className="text-[#34C759]" />
              )}
              {isUpcoming && <Lock size={13} className="text-[#8E8E93]" />}
            </div>
            <p className="text-[13px] text-[#8E8E93] mt-1">{c.description}</p>
          </div>
        </div>
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold whitespace-nowrap"
          style={{ backgroundColor: "rgba(255,193,7,0.12)", color: "#CC8B00" }}
        >
          <Zap size={11} fill="currentColor" />
          {c.xpReward} XP
        </div>
      </div>

      {/* Progress */}
      {!isUpcoming && (
        <div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-[#8E8E93]">
              {c.progress} / {c.target}
            </span>
            <span
              className="font-semibold"
              style={{ color: isCompleted ? "#34C759" : c.accent }}
            >
              {isCompleted ? "Done!" : `${Math.round(pct)}%`}
            </span>
          </div>
          <div className="h-2 bg-[#F2F2F7] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{
                duration: 0.9,
                delay: index * 0.06 + 0.2,
                ease: "easeOut",
              }}
              className="h-full rounded-full"
              style={{
                background: isCompleted
                  ? "linear-gradient(90deg, #34C759, #30D158)"
                  : `linear-gradient(90deg, ${c.accent}, ${c.accent}cc)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold px-2 py-1 rounded-full"
            style={{ backgroundColor: diff.bg, color: diff.color }}
          >
            {diff.label}
          </span>
          <span className="flex items-center gap-1 text-[12px] text-[#8E8E93]">
            <Clock size={11} /> {c.deadline}
          </span>
        </div>
        {isCompleted ? (
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #34C759, #30D158)",
              boxShadow: "0 4px 10px rgba(52,199,89,0.3)",
            }}
          >
            <Trophy size={13} /> Claimed
          </motion.button>
        ) : isUpcoming ? (
          <span className="text-[12px] text-[#8E8E93] font-semibold">
            Coming soon
          </span>
        ) : (
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-bold"
            style={{ backgroundColor: c.accent + "18", color: c.accent }}
          >
            View <ChevronRight size={14} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function LeaderboardRow({
  entry,
  maxXp,
  index,
}: {
  entry: LeaderboardEntry;
  maxXp: number;
  index: number;
}) {
  const barPct = (entry.xp / maxXp) * 100;
  const isTop3 = entry.rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.07,
        type: "spring",
        stiffness: 260,
        damping: 24,
      }}
      className="flex items-center gap-4 px-4 py-3 rounded-[16px] transition-colors"
      style={{
        backgroundColor: entry.isCurrentUser
          ? "rgba(0,122,255,0.06)"
          : "transparent",
        border: entry.isCurrentUser
          ? "1px solid rgba(0,122,255,0.15)"
          : "1px solid transparent",
      }}
    >
      {/* Rank */}
      <div className="w-8 text-center flex-shrink-0">
        {entry.rank === 1 ? (
          <Crown
            size={18}
            className="text-[#FBBF24] mx-auto"
            fill="currentColor"
          />
        ) : entry.rank === 2 ? (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: "rgba(148,163,184,0.2)" }}
          >
            <Medal size={13} className="text-[#94A3B8]" />
          </div>
        ) : entry.rank === 3 ? (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: "rgba(205,127,50,0.15)" }}
          >
            <Medal size={13} className="text-[#CD7F32]" />
          </div>
        ) : (
          <span className="text-[15px] font-bold text-[#8E8E93]">
            #{entry.rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={entry.avatar}
          alt={entry.name}
          className="w-10 h-10 rounded-full object-cover border-2"
          style={{ borderColor: entry.isCurrentUser ? "#007AFF" : "#E5E5EA" }}
        />
        <span
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-white"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.12)", color: "#8E8E93" }}
        >
          {BADGE_ICON[entry.badge] ?? null}
        </span>
      </div>

      {/* Name + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[14px] font-bold text-[#1C1C1E] truncate">
            {entry.name}
            {entry.isCurrentUser && (
              <span className="ml-1.5 text-[11px] font-semibold text-[#007AFF] bg-[#EAF2FF] px-1.5 py-0.5 rounded-full">
                You
              </span>
            )}
          </span>
          <span className="text-[11px] text-[#8E8E93] font-medium">
            Lv.{entry.level}
          </span>
        </div>
        <div className="h-1.5 bg-[#F2F2F7] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${barPct}%` }}
            transition={{
              duration: 0.8,
              delay: index * 0.07 + 0.3,
              ease: "easeOut",
            }}
            className="h-full rounded-full"
            style={{
              background: isTop3
                ? "linear-gradient(90deg, #FBBF24, #F59E0B)"
                : entry.isCurrentUser
                  ? "linear-gradient(90deg, #007AFF, #0057D9)"
                  : "linear-gradient(90deg, #D1D1D6, #A8A8AD)",
            }}
          />
        </div>
      </div>

      {/* XP */}
      <div className="text-right flex-shrink-0">
        <p className="text-[14px] font-extrabold text-[#1C1C1E]">
          {entry.xp.toLocaleString()}
        </p>
        <p className="text-[11px] text-[#8E8E93]">XP</p>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<CatTab>("All");

  const filtered = CHALLENGES.filter((c) => {
    if (activeTab === "All") return true;
    if (activeTab === "Active") return c.status === "active";
    if (activeTab === "Completed") return c.status === "completed";
    if (activeTab === "Upcoming") return c.status === "upcoming";
    return true;
  });

  const activeCount = CHALLENGES.filter((c) => c.status === "active").length;
  const completedCount = CHALLENGES.filter(
    (c) => c.status === "completed",
  ).length;
  const totalXpEarned = CHALLENGES.filter(
    (c) => c.status === "completed",
  ).reduce((s, c) => s + c.xpReward, 0);
  const maxXp = Math.max(...LEADERBOARD.map((e) => e.xp));

  const tabCounts: Record<CatTab, number> = {
    All: CHALLENGES.length,
    Active: activeCount,
    Completed: completedCount,
    Upcoming: CHALLENGES.filter((c) => c.status === "upcoming").length,
  };

  return (
    <div
      className="no-scrollbar"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#F2F2F7",
        overflowY: "auto",
        overflowX: "hidden",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* ── HERO HEADER ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)",
          padding: "40px 40px 32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow blobs */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,193,7,0.12)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -20,
            left: 80,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "rgba(0,122,255,0.1)",
            filter: "blur(50px)",
          }}
        />

        <div className="relative">
          {/* Title row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #FBBF24, #F59E0B)",
                  }}
                >
                  <Trophy size={20} className="text-white" />
                </div>
                <h1 className="text-[26px] font-extrabold text-white tracking-tight">
                  Challenges
                </h1>
              </div>
              <p className="text-[14px] text-[rgba(255,255,255,0.55)]">
                Complete missions, earn XP, climb the leaderboard
              </p>
            </div>
            {/* Streak badge */}
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[16px]"
              style={{
                background: "rgba(237,107,53,0.2)",
                border: "1px solid rgba(237,107,53,0.4)",
              }}
            >
              <Flame size={18} className="text-[#FF6B35]" fill="currentColor" />
              <div>
                <p className="text-[16px] font-extrabold text-white leading-none">
                  7
                </p>
                <p className="text-[10px] text-[rgba(255,255,255,0.5)]">
                  day streak
                </p>
              </div>
            </motion.div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Active Now",
                value: activeCount,
                icon: <Zap size={14} />,
                color: "#007AFF",
              },
              {
                label: "Completed",
                value: completedCount,
                icon: <CheckCircle size={14} />,
                color: "#34C759",
              },
              {
                label: "XP Earned",
                value: `${totalXpEarned.toLocaleString()}`,
                icon: <Medal size={14} />,
                color: "#FBBF24",
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-[16px] px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p className="text-[20px] font-extrabold text-white leading-none mb-0.5 flex items-center gap-1.5">
                  <span style={{ opacity: 0.7 }}>{s.icon}</span>
                  {s.value}
                </p>
                <p
                  className="text-[12px]"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="px-8 py-6 flex gap-6">
        {/* ── LEFT COLUMN: Challenges ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Filter tabs */}
          <div className="flex items-center gap-2">
            {CAT_TABS.map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setActiveTab(tab)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[14px] font-semibold transition-colors"
                style={
                  activeTab === tab
                    ? {
                        backgroundColor: "#1C1C1E",
                        color: "#fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                      }
                    : {
                        backgroundColor: "#fff",
                        color: "#3C3C43",
                        border: "1px solid rgba(0,0,0,0.07)",
                      }
                }
              >
                {tab}
                <span
                  className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                  style={
                    activeTab === tab
                      ? {
                          backgroundColor: "rgba(255,255,255,0.2)",
                          color: "#fff",
                        }
                      : { backgroundColor: "#F2F2F7", color: "#8E8E93" }
                  }
                >
                  {tabCounts[tab]}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Challenge grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              {filtered.map((c, i) => (
                <ChallengeCard key={c.id} c={c} index={i} />
              ))}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: "rgba(142,142,147,0.1)",
                      color: "#8E8E93",
                    }}
                  >
                    <SearchX size={28} />
                  </div>
                  <p className="text-[17px] font-bold text-[#1C1C1E]">
                    No challenges here yet
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── RIGHT COLUMN: Leaderboard + Badges ── */}
        <div className="w-[320px] flex-shrink-0 flex flex-col gap-5">
          {/* Leaderboard Card */}
          <div
            className="bg-white rounded-[24px] p-5"
            style={{
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[#FBBF24]" />
                <h3 className="text-[16px] font-bold text-[#1C1C1E]">
                  Leaderboard
                </h3>
              </div>
              <span className="text-[12px] text-[#8E8E93] bg-[#F2F2F7] px-2.5 py-1 rounded-full font-semibold">
                This month
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {LEADERBOARD.map((entry, i) => (
                <LeaderboardRow
                  key={entry.rank}
                  entry={entry}
                  maxXp={maxXp}
                  index={i}
                />
              ))}
            </div>
          </div>

          {/* My Badges */}
          <div
            className="bg-white rounded-[24px] p-5"
            style={{
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Star size={17} className="text-[#FBBF24]" fill="currentColor" />
              <h3 className="text-[16px] font-bold text-[#1C1C1E]">
                My Badges
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_USER.badges.map((badge, i) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: i * 0.08,
                    type: "spring",
                    stiffness: 280,
                    damping: 22,
                  }}
                  whileHover={{ scale: 1.04 }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] cursor-default"
                  style={{
                    backgroundColor: badge.color + "12",
                    border: `1px solid ${badge.color}22`,
                  }}
                >
                  <span className="text-[22px]">{badge.icon}</span>
                  <span
                    className="text-[12px] font-semibold leading-snug"
                    style={{ color: badge.color }}
                  >
                    {badge.label}
                  </span>
                </motion.div>
              ))}
              {/* Locked badge teaser */}
              <motion.div
                whileHover={{ scale: 1.04 }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] cursor-default opacity-40"
                style={{
                  backgroundColor: "#F2F2F7",
                  border: "1px dashed #D1D1D6",
                }}
              >
                <Lock size={18} className="text-[#8E8E93]" />
                <span className="text-[12px] font-semibold text-[#8E8E93]">
                  Locked
                </span>
              </motion.div>
            </div>
          </div>

          {/* XP Progress */}
          <div
            className="bg-white rounded-[24px] p-5"
            style={{
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#007AFF]" fill="currentColor" />
                <h3 className="text-[15px] font-bold text-[#1C1C1E]">
                  Level {MOCK_USER.level}
                </h3>
              </div>
              <span className="text-[13px] font-semibold text-[#8E8E93]">
                {MOCK_USER.xp} / {MOCK_USER.nextLevelXp} XP
              </span>
            </div>
            <div className="h-2.5 bg-[#F2F2F7] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(MOCK_USER.xp / MOCK_USER.nextLevelXp) * 100}%`,
                }}
                transition={{ duration: 1.0, delay: 0.4, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #007AFF, #0057D9)",
                }}
              />
            </div>
            <p className="text-[12px] text-[#8E8E93] mt-2">
              {MOCK_USER.nextLevelXp - MOCK_USER.xp} XP to Level{" "}
              {MOCK_USER.level + 1} ·{" "}
              <span className="font-semibold text-[#1C1C1E]">
                {MOCK_USER.title}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
