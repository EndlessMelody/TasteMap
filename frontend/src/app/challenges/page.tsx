"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Target,
  Rocket,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import {
  ChallengeStatus,
  ChallengeCategory,
  Difficulty,
  ChallengeResponse,
  LeaderboardEntry,
  UserGamificationInfo,
  StreakInfo
} from "@/types/gamification";

// ─── Config & Mappings ───────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
  utensils: <Utensils size={20} />,
  map: <Map size={20} />,
  users: <Users size={20} />,
  camera: <Camera size={20} />,
  flame: <Flame size={20} />,
  coffee: <Coffee size={20} />,
  heart: <Heart size={20} />,
  trophy: <Trophy size={20} />,
  zap: <Zap size={20} />,
  rocket: <Rocket size={20} />,
};

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

const CAT_TABS = ["All", "Active", "Completed", "Claimed", "Upcoming"] as const;
type CatTab = (typeof CAT_TABS)[number];

type LeaderboardPeriod = "weekly" | "monthly" | "alltime";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChallengeCard({
  c,
  index,
  onAction
}: {
  c: ChallengeResponse;
  index: number;
  onAction: (action: "join" | "claim", id: string) => void;
}) {
  const diff = DIFF_CONFIG[c.challenge.difficulty] || DIFF_CONFIG.medium;
  const isCompleted = c.status === "completed";
  const isClaimed = c.status === "claimed";
  const isUpcoming = c.status === "upcoming" || c.status === "requires_opt_in";

  const icon = ICON_MAP[c.challenge.icon] || <Trophy size={20} />;
  const accentColor = c.challenge.accent_color || "#007AFF";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.04,
        type: "spring",
        stiffness: 260,
        damping: 24,
      }}
      className="bg-white rounded-[22px] p-5 flex flex-col gap-4"
      style={{
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: (isCompleted || isClaimed)
          ? `0 4px 20px ${accentColor}22`
          : "0 4px 16px rgba(0,0,0,0.04)",
        opacity: isUpcoming ? 0.72 : 1,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-[16px] flex items-center justify-center transition-transform hover:scale-105"
            style={{ backgroundColor: accentColor + "18", color: accentColor }}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-[#1C1C1E] leading-none">
                {c.challenge.title}
              </h3>
              {isClaimed && (
                <CheckCircle size={15} className="text-[#34C759]" fill="white" />
              )}
              {isUpcoming && <Lock size={13} className="text-[#8E8E93]" />}
            </div>
            <p className="text-[13px] text-[#8E8E93] mt-1.5 leading-relaxed">{c.challenge.description}</p>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap"
          style={{ backgroundColor: "rgba(255,193,7,0.12)", color: "#CC8B00" }}
        >
          <Zap size={12} fill="currentColor" />
          {c.challenge.xp_reward} XP
        </div>
      </div>

      {!isUpcoming && (
        <div className="mt-1">
          <div className="flex justify-between text-[12px] mb-2 font-medium">
            <span className="text-[#8E8E93]">
              Progress: <span className="text-[#1C1C1E]">{c.progress} / {c.target}</span>
            </span>
            <span
              style={{ color: (isCompleted || isClaimed) ? "#34C759" : accentColor }}
            >
              {isClaimed ? "Claimed" : isCompleted ? "Reward Ready!" : `${Math.round(c.percentage)}%`}
            </span>
          </div>
          <div className="h-2.5 bg-[#F2F2F7] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${c.percentage}%` }}
              transition={{
                duration: 1,
                delay: index * 0.04 + 0.2,
                ease: "circOut",
              }}
              className="h-full rounded-full"
              style={{
                background: (isCompleted || isClaimed)
                  ? "linear-gradient(90deg, #34C759, #30D158)"
                  : `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`,
              }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3">
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
            style={{ backgroundColor: diff.bg, color: diff.color }}
          >
            {diff.label}
          </span>
          {c.deadline_display && (
            <span className="flex items-center gap-1.5 text-[12px] text-[#8E8E93] font-medium">
              <Clock size={12} /> {c.deadline_display}
            </span>
          )}
        </div>

        {isClaimed ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-bold text-[#34C759] bg-[#EAF9EE]">
            <CheckCircle size={14} /> Completed
          </div>
        ) : isCompleted ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction("claim", c.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-extrabold text-white shadow-lg"
            style={{
              background: "linear-gradient(135deg, #34C759, #30D158)",
              boxShadow: "0 6px 15px rgba(52,199,89,0.3)",
            }}
          >
            <Trophy size={14} /> Claim Reward
          </motion.button>
        ) : isUpcoming ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction("join", c.challenge.id)}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-bold bg-[#1C1C1E] text-white shadow-md"
          >
            Join Challenge <ArrowRight size={14} />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ x: 3 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold"
            style={{ color: accentColor }}
          >
            Details <ChevronRight size={15} />
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
  const barPct = maxXp > 0 ? (entry.xp / maxXp) * 100 : 0;
  const isTop3 = entry.rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 260,
        damping: 24,
      }}
      className="flex items-center gap-4 px-4 py-3 rounded-[18px] transition-all hover:bg-black/5"
      style={{
        backgroundColor: entry.is_current_user
          ? "rgba(0,122,255,0.06)"
          : "transparent",
        border: entry.is_current_user
          ? "1px solid rgba(0,122,255,0.15)"
          : "1px solid transparent",
      }}
    >
      <div className="w-8 text-center flex-shrink-0">
        {entry.rank === 1 ? (
          <Crown
            size={20}
            className="text-[#FBBF24] mx-auto filter drop-shadow-sm"
            fill="currentColor"
          />
        ) : entry.rank === 2 ? (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: "rgba(148,163,184,0.2)" }}
          >
            <Medal size={14} className="text-[#94A3B8]" />
          </div>
        ) : entry.rank === 3 ? (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: "rgba(205,127,50,0.15)" }}
          >
            <Medal size={14} className="text-[#CD7F32]" />
          </div>
        ) : (
          <span className="text-[15px] font-bold text-[#8E8E93]">
            #{entry.rank}
          </span>
        )}
      </div>

      <div className="relative flex-shrink-0">
        <img
          src={entry.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.display_name)}&background=random`}
          alt={entry.display_name}
          className="w-10 h-10 rounded-full object-cover border-2 shadow-sm"
          style={{ borderColor: entry.is_current_user ? "#007AFF" : "#E5E5EA" }}
        />
        {entry.featured_badge && (
          <span
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-white shadow-sm"
            style={{ color: "#8E8E93" }}
          >
            {BADGE_ICON[entry.featured_badge] ?? <Star size={10} />}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[14px] font-bold text-[#1C1C1E] truncate">
            {entry.display_name}
          </span>
          {entry.is_current_user && (
            <span className="text-[10px] font-bold text-[#007AFF] bg-[#EAF2FF] px-2 py-0.5 rounded-full">
              YOU
            </span>
          )}
          <span className="text-[11px] text-[#8E8E93] font-bold bg-[#F2F2F7] px-1.5 py-0.5 rounded">
            Lv{entry.level}
          </span>
        </div>
        <div className="h-1.5 bg-[#F2F2F7] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${barPct}%` }}
            transition={{
              duration: 1,
              delay: index * 0.05 + 0.3,
              ease: "circOut",
            }}
            className="h-full rounded-full"
            style={{
              background: isTop3
                ? "linear-gradient(90deg, #FBBF24, #F59E0B)"
                : entry.is_current_user
                  ? "linear-gradient(90deg, #007AFF, #0057D9)"
                  : "linear-gradient(90deg, #D1D1D6, #A8A8AD)",
            }}
          />
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-[14px] font-extrabold text-[#1C1C1E] tabular-nums">
          {entry.xp.toLocaleString()}
        </p>
        <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">XP</p>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChallengesPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<CatTab>("All");
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>("monthly");

  const [challenges, setChallenges] = useState<ChallengeResponse[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserGamificationInfo | null>(null);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [chRes, lbRes, statsRes, streakRes] = await Promise.all([
        apiGet<{ success: boolean; data: ChallengeResponse[] }>("/api/v1/challenges/me"),
        apiGet<{ success: boolean; data: LeaderboardEntry[] }>(`/api/v1/challenges/leaderboard?period=${leaderboardPeriod}`),
        apiGet<{ success: boolean; data: UserGamificationInfo }>("/api/v1/challenges/xp/me"),
        apiGet<{ success: boolean; data: StreakInfo }>("/api/v1/challenges/streaks/me")
      ]);

      if (chRes.success) setChallenges(chRes.data);
      if (lbRes.success) setLeaderboard(lbRes.data);
      if (statsRes.success) setUserStats(statsRes.data);
      if (streakRes.success) setStreakInfo(streakRes.data);
    } catch (err) {
      console.error("Failed to load challenges data:", err);
      toast.error("Failed to sync with game servers");
    } finally {
      setIsLoading(false);
    }
  }, [leaderboardPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (action: "join" | "claim", id: string) => {
    try {
      if (action === "join") {
        const res = await apiPost<{ success: boolean }>(`/api/v1/challenges/${id}/join`, {});
        if (res.success) {
          toast.success("Joined challenge!");
          fetchData();
        }
      } else {
        const res = await apiPost<{ success: boolean; data: { xp_awarded: number; new_level: number } }>(`/api/v1/challenges/${id}/claim`, {});
        if (res.success) {
          toast.success(`Claimed reward! +${res.data.xp_awarded} XP`);
          refreshUser(); // Global sync
          fetchData(); // Local refresh
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to perform action");
    }
  };

  const filtered = challenges.filter((c) => {
    if (activeTab === "All") return true;
    if (activeTab === "Active") return c.status === "active";
    if (activeTab === "Completed") return c.status === "completed";
    if (activeTab === "Claimed") return c.status === "claimed";
    if (activeTab === "Upcoming") return c.status === "upcoming" || c.status === "requires_opt_in";
    return true;
  });

  const activeCount = challenges.filter((c) => c.status === "active").length;
  const completedCount = challenges.filter((c) => c.status === "completed" || c.status === "claimed").length;

  const maxXp = leaderboard.length > 0 ? Math.max(...leaderboard.map((e) => e.xp)) : 0;

  const tabCounts: Record<CatTab, number> = {
    All: challenges.length,
    Active: activeCount,
    Completed: challenges.filter((c) => c.status === "completed").length,
    Claimed: challenges.filter((c) => c.status === "claimed").length,
    Upcoming: challenges.filter((c) => c.status === "upcoming" || c.status === "requires_opt_in").length,
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4 bg-[#F2F2F7]">
        <Loader2 className="animate-spin text-[#007AFF]" size={40} />
        <p className="text-[17px] font-bold text-[#1C1C1E]">Synchronizing TasteVault...</p>
      </div>
    );
  }

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
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* ── HERO HEADER ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)",
          padding: "48px 48px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(251,191,36,0.15)",
            filter: "blur(70px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: 100,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(0,122,255,0.12)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative max-w-[1400px] mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div
                  className="w-12 h-12 rounded-[18px] flex items-center justify-center shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, #FBBF24, #F59E0B)",
                  }}
                >
                  <Trophy size={24} className="text-white" />
                </div>
                <h1 className="text-[32px] font-black text-white tracking-tight">
                  Challenges
                </h1>
              </div>
              <p className="text-[15px] text-[rgba(255,255,255,0.6)] font-medium max-w-md">
                Refine your palate and climb the ranks. Every adventure brings you closer to becoming an Elite Foodie.
              </p>
            </div>

            {/* Streak & Level Info */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-3 px-5 py-3 rounded-[20px] shadow-lg"
                style={{
                  background: "rgba(237,107,53,0.15)",
                  border: "1px solid rgba(237,107,53,0.3)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Flame size={22} className="text-[#FF6B35]" fill="#FF6B35" />
                <div>
                  <p className="text-[20px] font-black text-white leading-none">
                    {streakInfo?.current_streak || 0}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-[rgba(255,107,53,0.8)] tracking-wider mt-1">
                    Day Streak
                  </p>
                </div>
              </motion.div>

              <div className="flex items-center gap-3 px-5 py-3 rounded-[20px] shadow-lg"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="w-10 h-10 rounded-full border-4 border-[#007AFF] flex items-center justify-center bg-black/20">
                  <span className="text-white font-black text-xs">{user?.level || 1}</span>
                </div>
                <div>
                  <p className="text-[20px] font-black text-white leading-none">
                    LEVEL
                  </p>
                  <div className="mt-1.5 w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#007AFF] rounded-full" style={{ width: `${(userStats?.xp || 0) / (userStats?.next_level_xp || 1000) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: "Current Rank",
                value: userStats?.rank ? `#${userStats.rank}` : "---",
                icon: <Medal size={16} />,
                color: "#FBBF24",
              },
              {
                label: "Active Missions",
                value: activeCount,
                icon: <Zap size={16} />,
                color: "#007AFF",
              },
              {
                label: "Completed",
                value: completedCount,
                icon: <CheckCircle size={16} />,
                color: "#34C759",
              },
              {
                label: "Total XP",
                value: userStats?.total_xp_earned.toLocaleString() || "0",
                icon: <Trophy size={16} />,
                color: "#FF6B35",
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-[20px] px-5 py-4 flex flex-col justify-between"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  minHeight: "100px"
                }}
              >
                <div className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {s.icon}
                  <span className="text-[11px] font-bold uppercase tracking-widest">{s.label}</span>
                </div>
                <p className="text-[26px] font-black text-white leading-none mt-2">
                  {s.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full px-12 py-10 flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {CAT_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all"
                  style={
                    activeTab === tab
                      ? {
                        backgroundColor: "#1C1C1E",
                        color: "#fff",
                        boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                      }
                      : {
                        backgroundColor: "transparent",
                        color: "#8E8E93",
                      }
                  }
                >
                  {tab}
                  <span
                    className="text-[11px] font-black px-2 py-0.5 rounded-lg"
                    style={
                      activeTab === tab
                        ? { backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }
                        : { backgroundColor: "#E5E5EB", color: "#8E8E93" }
                    }
                  >
                    {tabCounts[tab]}
                  </span>
                </button>
              ))}
            </div>
            <div className="text-[13px] text-[#8E8E93] font-semibold flex items-center gap-2">
              <Target size={15} /> All progress is synced across devices
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-1 gap-5"
            >
              {filtered.map((c, i) => (
                <ChallengeCard key={c.id} c={c} index={i} onAction={handleAction} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-24 text-center bg-white rounded-[32px] border border-dashed border-gray-300">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5 bg-gray-100 text-gray-400">
                    <SearchX size={36} />
                  </div>
                  <h3 className="text-[20px] font-black text-[#1C1C1E]">No adventures here</h3>
                  <p className="text-[15px] text-[#8E8E93] mt-2">Check back later for new limited-time challenges!</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="w-[360px] flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 flex flex-col gap-6"
            style={{ border: "1px solid rgba(0,0,0,0.04)" }}
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center">
                    <Award size={20} className="text-[#FBBF24]" />
                  </div>
                  <h3 className="text-[18px] font-black text-[#1C1C1E] tracking-tight">Leaderboard</h3>
                </div>
              </div>

              {/* Period Switcher */}
              <div className="flex p-1 bg-[#F2F2F7] rounded-xl">
                {(["weekly", "monthly", "alltime"] as LeaderboardPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setLeaderboardPeriod(p)}
                    className="flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all"
                    style={leaderboardPeriod === p
                      ? { backgroundColor: "white", color: "#1C1C1E", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }
                      : { color: "#8E8E93" }
                    }
                  >
                    {p.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 -mx-2">
              {leaderboard.map((entry, i) => (
                <LeaderboardRow key={entry.user_id} entry={entry} maxXp={maxXp} index={i} />
              ))}
              {leaderboard.length === 0 && (
                <p className="text-center py-10 text-[13px] text-[#8E8E93] font-medium">Rankings will appear shortly...</p>
              )}
            </div>

            <button className="w-full py-4 rounded-2xl bg-[#F2F2F7] text-[13px] font-bold text-[#1C1C1E] hover:bg-[#E5E5EB] transition-colors flex items-center justify-center gap-2">
              View Global Ranks <ChevronRight size={16} />
            </button>
          </div>

          {/* Daily Streak Card */}
          <div className="bg-white rounded-[32px] p-6 flex flex-col gap-4" style={{ border: "1px solid rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                <Star size={20} className="text-[#FF6B35]" />
              </div>
              <h4 className="text-[16px] font-black text-[#1C1C1E]">Daily Streak</h4>
            </div>
            <p className="text-[13px] text-[#8E8E93] leading-relaxed">
              Check in every day to keep your streak alive and earn more XP bonus! Currently at <span className="text-[#FF6B35] font-bold">{streakInfo?.current_streak} days</span>.
            </p>
            <button
              onClick={async () => {
                const res = await apiPost<{ success: boolean; data: any }>("/api/v1/challenges/streaks/checkin", {});
                if (res.success) {
                  toast.success("Checked in for today!");
                  fetchData();
                }
              }}
              disabled={streakInfo?.is_active_today}
              className={`w-full py-4 rounded-2xl text-[14px] font-black transition-all ${streakInfo?.is_active_today
                  ? "bg-[#F2F2F7] text-[#8E8E93] cursor-default"
                  : "bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/20 hover:scale-[1.02]"
                }`}
            >
              {streakInfo?.is_active_today ? "Already Checked In" : "Daily Check-in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
