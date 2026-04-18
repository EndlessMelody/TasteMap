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
  StreakInfo,
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
  onAction,
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
  const accentColor = c.challenge.accent_color || "#ff6b35";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{
        delay: index * 0.04,
        type: "spring",
        stiffness: 260,
        damping: 24,
      }}
      className="bg-white rounded-[24px] p-6 flex flex-col gap-4 relative overflow-hidden group"
      style={{
        border: "1px solid rgba(0,0,0,0.04)",
        boxShadow:
          isCompleted || isClaimed
            ? `0 12px 30px ${accentColor}1A`
            : "0 8px 24px rgba(0,0,0,0.05)",
        opacity: isUpcoming ? 0.72 : 1,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none z-0" />
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-13 h-13 rounded-[16px] flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
            style={{ backgroundColor: accentColor + "18", color: accentColor, minWidth: '52px', minHeight: '52px' }}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-black text-[#1C1C1E] tracking-tight">
                {c.challenge.title}
              </h3>
              {isClaimed && (
                <CheckCircle
                  size={15}
                  className="text-[#34C759]"
                  fill="white"
                />
              )}
              {isUpcoming && <Lock size={13} className="text-[#8E8E93]" />}
            </div>
            <p className="text-[13.5px] text-[#8E8E93] mt-1.5 leading-relaxed font-medium">
              {c.challenge.description}
            </p>
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
              Progress:{" "}
              <span className="text-[#1C1C1E]">
                {c.progress} / {c.target}
              </span>
            </span>
            <span
              style={{
                color: isCompleted || isClaimed ? "#34C759" : accentColor,
              }}
            >
              {isClaimed
                ? "Claimed"
                : isCompleted
                  ? "Reward Ready!"
                  : `${Math.round(c.percentage)}%`}
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
                background:
                  isCompleted || isClaimed
                    ? "linear-gradient(90deg, #34C759, #30D158)"
                    : `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`,
              }}
            />
          </div>
        </div>
      )}

      <div className="relative z-10 flex items-center justify-between mt-1">
        <div className="flex items-center gap-3">
          <span
            className="text-[11px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors"
            style={{ backgroundColor: diff.bg, color: diff.color }}
          >
            {diff.label}
          </span>
          {c.deadline_display && (
            <span className="flex items-center gap-1.5 text-[12.5px] text-[#8E8E93] font-bold">
              <Clock size={14} /> {c.deadline_display}
            </span>
          )}
        </div>

        {isClaimed ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-[#34C759] border border-[#34C759]/20" style={{backgroundColor: '#34C75910'}}>
            <CheckCircle size={14} /> Completed
          </div>
        ) : isCompleted ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAction("claim", c.id)}
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-extrabold text-white overflow-hidden group/btn"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
              boxShadow: `0 8px 20px ${accentColor}40`,
            }}
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <Trophy size={14} className="relative z-10" /> 
            <span className="relative z-10">Claim Reward</span>
          </motion.button>
        ) : isUpcoming ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction("join", c.challenge.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#1C1C1E] text-white shadow-xl shadow-black/10"
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
      className="flex items-center gap-4 px-4 py-3 rounded-[20px] transition-all cursor-pointer group"
      style={{
        backgroundColor: entry.is_current_user
          ? "rgba(0,122,255,0.06)"
          : "transparent",
        border: entry.is_current_user
          ? "1px solid rgba(0,122,255,0.15)"
          : "1px solid transparent",
      }}
      whileHover={{
        scale: 1.02,
        backgroundColor: "#fff",
        boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.04)"
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
          src={
            entry.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.display_name)}&background=random`
          }
          alt={entry.display_name}
          className="w-10 h-10 rounded-full object-cover border-2 shadow-sm"
          style={{ borderColor: entry.is_current_user ? "#ff6b35" : "#E5E5EA" }}
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
            <span className="text-[10px] font-bold text-[#ff6b35] bg-[#FFF0E6] px-2 py-0.5 rounded-full">
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
                  ? "linear-gradient(90deg, #ff6b35, #ff8c5f)"
                  : "linear-gradient(90deg, #D1D1D6, #A8A8AD)",
            }}
          />
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-[14px] font-extrabold text-[#1C1C1E] tabular-nums">
          {entry.xp.toLocaleString()}
        </p>
        <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
          XP
        </p>
      </div>
    </motion.div>
  );
}

function BadgeCard() {
  return (
    <div
      className="bg-white rounded-[32px] p-6 flex flex-col gap-5 shadow-xl shadow-black/5"
      style={{ border: "1px solid rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center gap-2">
        <Star size={18} className="text-[#FBBF24]" fill="#FBBF24" />
        <h3 className="text-[17px] font-black text-[#1C1C1E]">My Badges</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Spice Master",
            icon: <Flame size={16} />,
            color: "#E63946",
          },
          { label: "Night Owl", icon: <Moon size={16} />, color: "#7B2FF7" },
          { label: "Photo Pro", icon: <Camera size={16} />, color: "#2A9D8F" },
          {
            label: "Top Reviewer",
            icon: <Crown size={16} />,
            color: "#FBBF24",
          },
        ].map((b) => (
          <div
            key={b.label}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-[18px] transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: `${b.color}12`,
              border: `1px solid ${b.color}22`,
            }}
          >
            <span style={{ color: b.color }}>{b.icon}</span>
            <span
              className="text-[11px] font-bold leading-tight"
              style={{ color: b.color }}
            >
              {b.label}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[18px] bg-[#F2F2F7] border border-dashed border-[#D1D1D6] opacity-50">
          <Lock size={14} className="text-[#8E8E93]" />
          <span className="text-[11px] font-bold text-[#8E8E93]">Locked</span>
        </div>
      </div>
    </div>
  );
}

function CompactLevelCard({ user, stats }: { user: any; stats: UserGamificationInfo | null }) {
  const pct = stats?.progress_percentage || 0;
  return (
    <div
      className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 flex flex-col gap-4"
      style={{ border: "1px solid rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-[#ff6b35]" fill="#ff6b35" />
          <h3 className="text-[17px] font-black text-[#1C1C1E]">
            Level {user?.level || 1}
          </h3>
        </div>
        <span className="text-[13px] font-bold text-[#8E8E93] tabular-nums">
          {stats?.current_xp ?? 0} / {stats?.next_level_xp ?? 100} XP
        </span>
      </div>
      <div className="h-3 bg-[#F2F2F7] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #ff6b35, #ff8c5f)" }}
        />
      </div>
      <p className="text-[12px] text-[#8E8E93] font-medium">
        {stats ? Math.max(0, stats.next_level_xp - stats.current_xp) : 100} XP to Level {(user?.level || 1) + 1} ·{" "}
        <span className="font-extrabold text-[#1C1C1E]">Teenage Syndrome</span>
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChallengesPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<CatTab>("All");
  const [leaderboardPeriod, setLeaderboardPeriod] =
    useState<LeaderboardPeriod>("monthly");

  const [challenges, setChallenges] = useState<ChallengeResponse[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserGamificationInfo | null>(null);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [chRes, lbRes, statsRes, streakRes] = await Promise.all([
        apiGet<{ success: boolean; data: ChallengeResponse[] }>(
          "/api/v1/challenges/me",
        ),
        apiGet<{ success: boolean; data: LeaderboardEntry[] }>(
          `/api/v1/challenges/leaderboard?period=${leaderboardPeriod}`,
        ),
        apiGet<{ success: boolean; data: UserGamificationInfo }>(
          "/api/v1/challenges/xp/me",
        ),
        apiGet<{ success: boolean; data: StreakInfo }>(
          "/api/v1/challenges/streaks/me",
        ),
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
        const res = await apiPost<{ success: boolean }>(
          `/api/v1/challenges/${id}/join`,
          {},
        );
        if (res.success) {
          toast.success("Joined challenge!");
          fetchData();
        }
      } else {
        const res = await apiPost<{
          success: boolean;
          data: { xp_awarded: number; new_level: number };
        }>(`/api/v1/challenges/${id}/claim`, {});
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
    if (activeTab === "Upcoming")
      return c.status === "upcoming" || c.status === "requires_opt_in";
    return true;
  });

  const activeCount = challenges.filter((c) => c.status === "active").length;
  const completedCount = challenges.filter(
    (c) => c.status === "completed" || c.status === "claimed",
  ).length;

  const maxXp =
    leaderboard.length > 0 ? Math.max(...leaderboard.map((e) => e.xp)) : 0;

  const tabCounts: Record<CatTab, number> = {
    All: challenges.length,
    Active: activeCount,
    Completed: challenges.filter((c) => c.status === "completed").length,
    Claimed: challenges.filter((c) => c.status === "claimed").length,
    Upcoming: challenges.filter(
      (c) => c.status === "upcoming" || c.status === "requires_opt_in",
    ).length,
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4 bg-[#F2F2F7]">
        <Loader2 className="animate-spin text-[#ff6b35]" size={40} />
        <p className="text-[17px] font-bold text-[#1C1C1E]">
          Synchronizing TasteVault...
        </p>
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
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* ── HERO HEADER ── */}
      <div
        className="w-full shrink-0"
        style={{
          background: "linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)",
          padding: "48px 48px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.div
           animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
           style={{
             position: "absolute",
             top: -60,
             right: -60,
             width: 350,
             height: 350,
             borderRadius: "50%",
             background: "rgba(255,107,53,1)",
             filter: "blur(90px)",
             zIndex: 0,
           }}
         />
         <motion.div
           animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
           style={{
             position: "absolute",
             bottom: -40,
             left: 100,
             width: 300,
             height: 300,
             borderRadius: "50%",
             background: "rgba(0,122,255,1)",
             filter: "blur(100px)",
             zIndex: 0,
           }}
         />
 
        <div className="relative z-10 max-w-[1400px] mx-auto w-full flex flex-col">
          <div className="flex items-start justify-between mb-8 w-full">
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
                Refine your palate and climb the ranks. Every adventure brings
                you closer to becoming an Elite Foodie.
              </p>
            </div>

            {/* Streak & Level Info */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
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

              <div
                className="flex items-center gap-3 px-5 py-3 rounded-[20px] shadow-lg"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="w-10 h-10 rounded-full border-4 border-[#ff6b35] flex items-center justify-center bg-black/20">
                  <span className="text-white font-black text-xs">
                    {user?.level || 1}
                  </span>
                </div>
                <div>
                  <p className="text-[20px] font-black text-white leading-none">
                    LEVEL
                  </p>
                  <div className="mt-1.5 w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#007AFF] rounded-full" style={{ width: `${userStats?.progress_percentage || 0}%` }} />
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
                color: "#ff6b35",
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
                  minHeight: "100px",
                }}
              >
                <div
                  className="flex items-center gap-2"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {s.icon}
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    {s.label}
                  </span>
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
            <div className="flex items-center gap-2 p-1.5 bg-[#E5E5EA]/50 backdrop-blur-md rounded-2xl w-fit border border-black/5">
              {CAT_TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-colors z-10 ${isActive ? "text-white" : "text-[#8E8E93] hover:text-[#1C1C1E]"}`}
                 >
                   {isActive && (
                      <motion.div
                        layoutId="activeTabChallenges"
                        className="absolute inset-0 rounded-xl z-[-1]"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        style={{ background: "linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)", boxShadow: "0 8px 16px rgba(0,0,0,0.15)" }}
                      />
                   )}
                   <span className="relative z-10">{tab}</span>
                   <span
                     className="relative z-10 text-[11px] font-black px-2 py-0.5 rounded-lg transition-colors border border-transparent"
                     style={
                       isActive
                         ? {
                             backgroundColor: "rgba(255,255,255,0.15)",
                             borderColor: "rgba(255,255,255,0.1)",
                             color: "#fff",
                           }
                         : { backgroundColor: "white", color: "#8E8E93", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }
                     }
                   >
                     {tabCounts[tab]}
                   </span>
                 </button>
                )
              })}
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
                <ChallengeCard
                  key={c.id}
                  c={c}
                  index={i}
                  onAction={handleAction}
                />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-24 text-center bg-white rounded-[32px] border border-dashed border-gray-300">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5 bg-gray-100 text-gray-400">
                    <SearchX size={36} />
                  </div>
                  <h3 className="text-[20px] font-black text-[#1C1C1E]">
                    No adventures here
                  </h3>
                  <p className="text-[15px] text-[#8E8E93] mt-2">
                    Check back later for new limited-time challenges!
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="w-[360px] flex-shrink-0 flex flex-col gap-6">
          <div
            className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 flex flex-col gap-6"
            style={{ border: "1px solid rgba(0,0,0,0.04)" }}
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center">
                    <Award size={20} className="text-[#FBBF24]" />
                  </div>
                  <h3 className="text-[18px] font-black text-[#1C1C1E] tracking-tight">
                    Leaderboard
                  </h3>
                </div>
              </div>

              {/* Period Switcher */}
              <div className="flex p-1 bg-[#F2F2F7] rounded-xl">
                {(["weekly", "monthly", "alltime"] as LeaderboardPeriod[]).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setLeaderboardPeriod(p)}
                      className="flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all"
                      style={
                        leaderboardPeriod === p
                          ? {
                              backgroundColor: "white",
                              color: "#1C1C1E",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                            }
                          : { color: "#8E8E93" }
                      }
                    >
                      {p.replace("_", " ")}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 -mx-2">
              {leaderboard.map((entry, i) => (
                <LeaderboardRow
                  key={entry.user_id}
                  entry={entry}
                  maxXp={maxXp}
                  index={i}
                />
              ))}
              {leaderboard.length === 0 && (
                <p className="text-center py-10 text-[13px] text-[#8E8E93] font-medium">
                  Rankings will appear shortly...
                </p>
              )}
            </div>

            <button className="w-full py-4 rounded-2xl bg-[#F2F2F7] text-[13px] font-bold text-[#1C1C1E] hover:bg-[#E5E5EB] transition-colors flex items-center justify-center gap-2">
              View Global Ranks <ChevronRight size={16} />
            </button>
          </div>

          <BadgeCard />

          <CompactLevelCard user={user} stats={userStats} />

          {/* Daily Streak Card */}
          <div
            className="bg-white rounded-[32px] p-6 flex flex-col gap-4"
            style={{ border: "1px solid rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                <Star size={20} className="text-[#FF6B35]" />
              </div>
              <h4 className="text-[16px] font-black text-[#1C1C1E]">
                Daily Streak
              </h4>
            </div>
            <p className="text-[13px] text-[#8E8E93] leading-relaxed">
              Check in every day to keep your streak alive and earn more XP
              bonus! Currently at{" "}
              <span className="text-[#FF6B35] font-bold">
                {streakInfo?.current_streak} days
              </span>
              .
            </p>
            <button
              onClick={async () => {
                try {
                  await apiPost("/api/v1/challenges/streaks/checkin", {});

                  toast.success("Checked in for today!");
                  setStreakInfo((prev) => prev ? {
                    ...prev,
                    is_active_today: true,
                    current_streak: prev.current_streak + 1
                  } : null);

                  // 3. Chỉ gọi API lấy lại điểm XP (nếu check-in có thưởng điểm) 
                  // Tuyệt đối KHÔNG gọi lại fetchData() ở đây để tránh đè data cũ
                  const statsRes = await apiGet<{ success: boolean; data: UserGamificationInfo }>("/api/v1/challenges/xp/me");
                  if (statsRes.success) {
                    setUserStats(statsRes.data);
                  }

                } catch (err: any) {
                  toast.error(err.message || "Check-in thất bại!");
                }
              }}
              disabled={streakInfo?.is_active_today}
              className={`w-full py-4 rounded-2xl text-[14px] font-black transition-all ${
                streakInfo?.is_active_today
                  ? "bg-[#F2F2F7] text-[#8E8E93] cursor-default"
                  : "bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/20 hover:scale-[1.02]"
              }`}
            >
              {streakInfo?.is_active_today
                ? "Already Checked In"
                : "Daily Check-in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
