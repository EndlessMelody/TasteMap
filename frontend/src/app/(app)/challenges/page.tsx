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
  Rocket,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import {
  ChallengeResponse,
  Difficulty,
  LeaderboardEntry,
  UserGamificationInfo,
  StreakInfo,
} from "@/types/gamification";
import {
  Page,
  Card,
  Button,
  Pill,
  H1,
  H3,
  Body,
  BodySm,
  Caption,
  Eyebrow,
  EmptyState,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";

const ICON_MAP: Record<string, React.ReactNode> = {
  utensils: <Utensils size={20} strokeWidth={1.75} />,
  map: <Map size={20} strokeWidth={1.75} />,
  users: <Users size={20} strokeWidth={1.75} />,
  camera: <Camera size={20} strokeWidth={1.75} />,
  flame: <Flame size={20} strokeWidth={1.75} />,
  coffee: <Coffee size={20} strokeWidth={1.75} />,
  heart: <Heart size={20} strokeWidth={1.75} />,
  trophy: <Trophy size={20} strokeWidth={1.75} />,
  zap: <Zap size={20} strokeWidth={1.75} />,
  rocket: <Rocket size={20} strokeWidth={1.75} />,
};

const BADGE_ICON: Record<string, React.ReactElement> = {
  crown: <Crown size={10} strokeWidth={1.75} />,
  fire: <Flame size={10} strokeWidth={1.75} />,
  zap: <Zap size={10} strokeWidth={1.75} />,
  moon: <Moon size={10} strokeWidth={1.75} />,
  flame: <Flame size={10} strokeWidth={1.75} />,
  coffee: <Coffee size={10} strokeWidth={1.75} />,
  camera: <Camera size={10} strokeWidth={1.75} />,
};

type PillToneStrict = "success" | "warning" | "danger" | "neutral";

const DIFF_CONFIG: Record<
  Difficulty,
  { label: string; tone: PillToneStrict }
> = {
  easy: { label: "Easy", tone: "success" },
  medium: { label: "Medium", tone: "warning" },
  hard: { label: "Hard", tone: "danger" },
};

const CAT_TABS = ["All", "Active", "Completed", "Claimed", "Upcoming"] as const;
type CatTab = (typeof CAT_TABS)[number];

type LeaderboardPeriod = "weekly" | "monthly" | "alltime";

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
  const icon = ICON_MAP[c.challenge.icon] || (
    <Trophy size={20} strokeWidth={1.75} />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.32,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Card
        radius="xl"
        padding="lg"
        shadow="sm"
        interactive
        style={{
          display: "flex",
          flexDirection: "column",
          gap: tokens.space[4],
          opacity: isUpcoming ? 0.75 : 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: tokens.space[3],
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: tokens.space[3],
              flex: 1,
              minWidth: 0,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: tokens.radius.md,
                background: tokens.color.surfaceMuted,
                color: tokens.color.textMuted,
                flexShrink: 0,
              }}
            >
              {icon}
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: tokens.space[1],
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.space[2],
                  flexWrap: "wrap",
                }}
              >
                <H3>{c.challenge.title}</H3>
                {isClaimed && (
                  <CheckCircle
                    size={16}
                    strokeWidth={1.75}
                    style={{ color: tokens.color.success }}
                  />
                )}
                {isUpcoming && (
                  <Lock
                    size={13}
                    strokeWidth={1.75}
                    style={{ color: tokens.color.textSubtle }}
                  />
                )}
              </div>
              <BodySm tone="muted">{c.challenge.description}</BodySm>
            </div>
          </div>
          <Pill
            tone="warning"
            size="md"
            leftIcon={<Zap size={12} fill="currentColor" />}
          >
            {c.challenge.xp_reward} XP
          </Pill>
        </div>

        {!isUpcoming && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: tokens.space[2],
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: tokens.space[3],
              }}
            >
              <BodySm tone="muted">
                Progress:{" "}
                <span
                  style={{
                    color: tokens.color.text,
                    fontWeight: tokens.type.weight.semibold,
                  }}
                >
                  {c.progress} / {c.target}
                </span>
              </BodySm>
              <BodySm
                style={{
                  color:
                    isCompleted || isClaimed
                      ? tokens.color.success
                      : tokens.color.warm,
                  fontWeight: tokens.type.weight.semibold,
                }}
              >
                {isClaimed
                  ? "Claimed"
                  : isCompleted
                    ? "Reward ready"
                    : `${Math.round(c.percentage)}%`}
              </BodySm>
            </div>
            <div
              style={{
                height: 8,
                background: tokens.color.surfaceInset,
                borderRadius: tokens.radius.pill,
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${c.percentage}%` }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.04 + 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  height: "100%",
                  background:
                    isCompleted || isClaimed
                      ? tokens.color.success
                      : tokens.color.warm,
                }}
              />
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: tokens.space[3],
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space[2],
            }}
          >
            <Pill tone={diff.tone} size="sm">
              {diff.label}
            </Pill>
            {c.deadline_display && (
              <BodySm
                tone="muted"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: tokens.space[1],
                }}
              >
                <Clock size={13} strokeWidth={1.75} />
                {c.deadline_display}
              </BodySm>
            )}
          </div>

          {isClaimed ? (
            <Pill
              tone="success"
              size="md"
              leftIcon={<CheckCircle size={14} strokeWidth={1.75} />}
            >
              Completed
            </Pill>
          ) : isCompleted ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Trophy size={14} strokeWidth={1.75} />}
              onClick={() => onAction("claim", c.id)}
            >
              Claim reward
            </Button>
          ) : isUpcoming ? (
            <Button
              variant="secondary"
              size="sm"
              rightIcon={<ArrowRight size={14} strokeWidth={1.75} />}
              onClick={() => onAction("join", c.challenge.id)}
            >
              Join challenge
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight size={14} strokeWidth={1.75} />}
            >
              Details
            </Button>
          )}
        </div>
      </Card>
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
  const isMe = entry.is_current_user;
  const isTop3 = entry.rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.28 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: tokens.space[3],
        padding: tokens.space[3],
        borderRadius: tokens.radius.md,
        background: isMe ? tokens.color.surfaceMuted : "transparent",
        border: isMe
          ? `1px solid ${tokens.color.border}`
          : "1px solid transparent",
      }}
    >
      <div style={{ width: 32, textAlign: "center", flexShrink: 0 }}>
        {entry.rank === 1 ? (
          <Crown
            size={20}
            strokeWidth={1.75}
            style={{ color: tokens.color.warning, margin: "0 auto" }}
            fill="currentColor"
          />
        ) : entry.rank <= 3 ? (
          <Medal
            size={18}
            strokeWidth={1.75}
            style={{
              color: tokens.color.textMuted,
              margin: "0 auto",
            }}
          />
        ) : (
          <BodySm
            tone="muted"
            style={{ fontWeight: tokens.type.weight.semibold }}
          >
            #{entry.rank}
          </BodySm>
        )}
      </div>

      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={
            entry.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.display_name)}&background=random`
          }
          alt=""
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            objectFit: "cover",
            border: `2px solid ${
              isMe ? tokens.color.warm : tokens.color.border
            }`,
          }}
        />
        {entry.featured_badge && (
          <span
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: tokens.color.surface,
              border: `1px solid ${tokens.color.border}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: tokens.color.textMuted,
            }}
          >
            {BADGE_ICON[entry.featured_badge] ?? (
              <Star size={10} fill="currentColor" />
            )}
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space[2],
            marginBottom: 6,
          }}
        >
          <Body
            style={{
              fontWeight: tokens.type.weight.semibold,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {entry.display_name}
          </Body>
          {isMe && (
            <Pill tone="warm" size="sm">
              You
            </Pill>
          )}
          <Pill tone="neutral" size="sm">
            Lv {entry.level}
          </Pill>
        </div>
        <div
          style={{
            height: 4,
            background: tokens.color.surfaceInset,
            borderRadius: tokens.radius.pill,
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${barPct}%` }}
            transition={{ duration: 0.8, delay: index * 0.05 + 0.3 }}
            style={{
              height: "100%",
              background: isTop3
                ? tokens.color.warning
                : isMe
                  ? tokens.color.warm
                  : tokens.color.textSubtle,
            }}
          />
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <Body
          style={{
            fontWeight: tokens.type.weight.bold,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {entry.xp.toLocaleString()}
        </Body>
        <Caption tone="muted">XP</Caption>
      </div>
    </motion.div>
  );
}

function BadgesCard() {
  const items = [
    { label: "Spice Master", icon: <Flame size={16} strokeWidth={1.75} /> },
    { label: "Night Owl", icon: <Moon size={16} strokeWidth={1.75} /> },
    { label: "Photo Pro", icon: <Camera size={16} strokeWidth={1.75} /> },
    { label: "Top Reviewer", icon: <Crown size={16} strokeWidth={1.75} /> },
  ];
  return (
    <Card radius="xl" padding="md" shadow="sm">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: tokens.space[2],
          marginBottom: tokens.space[4],
        }}
      >
        <Star
          size={18}
          fill="currentColor"
          style={{ color: tokens.color.warning }}
        />
        <H3>My badges</H3>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: tokens.space[2],
        }}
      >
        {items.map((b) => (
          <div
            key={b.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space[2],
              padding: tokens.space[3],
              borderRadius: tokens.radius.md,
              background: tokens.color.surfaceMuted,
            }}
          >
            <span style={{ color: tokens.color.textMuted }}>{b.icon}</span>
            <BodySm style={{ fontWeight: tokens.type.weight.semibold }}>
              {b.label}
            </BodySm>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space[2],
            padding: tokens.space[3],
            borderRadius: tokens.radius.md,
            background: "transparent",
            border: `1px dashed ${tokens.color.border}`,
            opacity: 0.6,
          }}
        >
          <Lock
            size={14}
            strokeWidth={1.75}
            style={{ color: tokens.color.textSubtle }}
          />
          <BodySm tone="subtle">Locked</BodySm>
        </div>
      </div>
    </Card>
  );
}

interface LevelUser {
  level?: number;
}

function CompactLevelCard({
  user,
  stats,
}: {
  user: LevelUser | null;
  stats: UserGamificationInfo | null;
}) {
  const pct = stats?.progress_percentage || 0;
  const remaining = stats ? Math.max(0, stats.next_level_xp - stats.current_xp) : 100;
  return (
    <Card radius="xl" padding="md" shadow="sm">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: tokens.space[3],
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space[2],
            }}
          >
            <Zap
              size={18}
              fill="currentColor"
              style={{ color: tokens.color.warm }}
            />
            <H3>Level {user?.level || 1}</H3>
          </div>
          <BodySm
            tone="muted"
            style={{
              fontWeight: tokens.type.weight.semibold,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {stats?.current_xp ?? 0} / {stats?.next_level_xp ?? 100} XP
          </BodySm>
        </div>
        <div
          style={{
            height: 8,
            background: tokens.color.surfaceInset,
            borderRadius: tokens.radius.pill,
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8 }}
            style={{ height: "100%", background: tokens.color.warm }}
          />
        </div>
        <BodySm tone="muted">
          {remaining} XP to Level {(user?.level || 1) + 1}
        </BodySm>
      </div>
    </Card>
  );
}

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
      toast.error("Failed to sync with game servers.");
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
          toast.success("Joined challenge.");
          fetchData();
        }
      } else {
        const res = await apiPost<{
          success: boolean;
          data: { xp_awarded: number; new_level: number };
        }>(`/api/v1/challenges/${id}/claim`, {});
        if (res.success) {
          toast.success(`Claimed reward. +${res.data.xp_awarded} XP`);
          refreshUser();
          fetchData();
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to perform action";
      toast.error(msg);
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
      <Page center>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: tokens.space[4],
          }}
        >
          <Loader2
            size={32}
            strokeWidth={1.75}
            style={{
              color: tokens.color.warm,
              animation: "spin 0.8s linear infinite",
            }}
          />
          <BodySm tone="muted">Synchronizing Taste Vault…</BodySm>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Page>
    );
  }

  const stats = [
    {
      label: "Current rank",
      value: userStats?.rank ? `#${userStats.rank}` : "—",
      icon: <Medal size={16} strokeWidth={1.75} />,
    },
    {
      label: "Active missions",
      value: activeCount,
      icon: <Zap size={16} strokeWidth={1.75} />,
    },
    {
      label: "Completed",
      value: completedCount,
      icon: <CheckCircle size={16} strokeWidth={1.75} />,
    },
    {
      label: "Total XP",
      value: userStats?.total_xp_earned.toLocaleString() || "0",
      icon: <Trophy size={16} strokeWidth={1.75} />,
    },
  ];

  return (
    <Page bleed>
      <div style={{ maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space[6],
            marginBottom: tokens.space[10],
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: tokens.space[4],
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: tokens.space[2],
                maxWidth: 480,
              }}
            >
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
                    background: tokens.color.warm,
                    color: tokens.color.textInverse,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Trophy size={20} strokeWidth={1.75} />
                </span>
                <H1>Challenges</H1>
              </div>
              <Body tone="muted">
                Refine your palate and climb the ranks. Every adventure brings
                you closer to becoming an Elite Foodie.
              </Body>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: tokens.space[3],
              }}
            >
              <Card radius="lg" padding="md" shadow="sm">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: tokens.space[3],
                  }}
                >
                  <Flame
                    size={22}
                    strokeWidth={1.75}
                    fill="currentColor"
                    style={{ color: tokens.color.warm }}
                  />
                  <div>
                    <Body
                      style={{
                        fontWeight: tokens.type.weight.bold,
                        fontSize: 18,
                        lineHeight: 1.1,
                      }}
                    >
                      {streakInfo?.current_streak || 0}
                    </Body>
                    <Caption tone="muted">Day streak</Caption>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: tokens.space[4],
            }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card radius="lg" padding="md" shadow="sm">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: tokens.space[2],
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: tokens.space[2],
                        color: tokens.color.textMuted,
                      }}
                    >
                      {s.icon}
                      <Eyebrow tone="muted">{s.label}</Eyebrow>
                    </div>
                    <Body
                      style={{
                        fontSize: 24,
                        fontWeight: tokens.type.weight.bold,
                        lineHeight: 1.1,
                      }}
                    >
                      {s.value}
                    </Body>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 360px",
            gap: tokens.space[8],
            alignItems: "start",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: tokens.space[5],
            }}
          >
            <div
              style={{
                display: "flex",
                gap: tokens.space[1],
                padding: tokens.space[1],
                background: tokens.color.surfaceMuted,
                borderRadius: tokens.radius.md,
                width: "fit-content",
                border: `1px solid ${tokens.color.border}`,
              }}
            >
              {CAT_TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: tokens.space[2],
                      padding: `${tokens.space[2]} ${tokens.space[4]}`,
                      borderRadius: tokens.radius.sm,
                      border: "none",
                      cursor: "pointer",
                      background: "transparent",
                      color: isActive
                        ? tokens.color.textInverse
                        : tokens.color.textMuted,
                      fontSize: tokens.type.size.bodySm,
                      fontWeight: tokens.type.weight.semibold,
                      fontFamily: "inherit",
                      zIndex: 1,
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabChallenges"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: tokens.color.text,
                          borderRadius: tokens.radius.sm,
                          zIndex: -1,
                        }}
                        transition={{
                          duration: 0.28,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    )}
                    <span style={{ position: "relative", zIndex: 1 }}>
                      {tab}
                    </span>
                    <Pill
                      tone="neutral"
                      size="sm"
                      style={
                        isActive
                          ? {
                              background: "rgba(255,255,255,0.15)",
                              color: tokens.color.textInverse,
                            }
                          : undefined
                      }
                    >
                      {tabCounts[tab]}
                    </Pill>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: "grid",
                  gap: tokens.space[5],
                }}
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
                  <Card radius="xl" padding="lg" shadow="none" surface="muted">
                    <EmptyState
                      icon={<SearchX size={32} strokeWidth={1.5} />}
                      title="No adventures here"
                      description="Check back later for new limited-time challenges."
                    />
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: tokens.space[5],
            }}
          >
            <Card radius="xl" padding="md" shadow="sm">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: tokens.space[4],
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: tokens.space[2],
                    }}
                  >
                    <Award
                      size={18}
                      strokeWidth={1.75}
                      style={{ color: tokens.color.warning }}
                    />
                    <H3>Leaderboard</H3>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    padding: 4,
                    background: tokens.color.surfaceMuted,
                    borderRadius: tokens.radius.sm,
                  }}
                >
                  {(["weekly", "monthly", "alltime"] as LeaderboardPeriod[]).map(
                    (p) => {
                      const active = leaderboardPeriod === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setLeaderboardPeriod(p)}
                          style={{
                            flex: 1,
                            padding: tokens.space[2],
                            borderRadius: tokens.radius.xs,
                            border: "none",
                            background: active
                              ? tokens.color.surface
                              : "transparent",
                            color: active
                              ? tokens.color.text
                              : tokens.color.textMuted,
                            fontSize: tokens.type.size.caption,
                            fontWeight: tokens.type.weight.semibold,
                            letterSpacing: tokens.type.tracking.wide,
                            textTransform: "uppercase",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            boxShadow: active ? tokens.shadow.sm : "none",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {p === "alltime" ? "All time" : p}
                        </button>
                      );
                    },
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: tokens.space[1],
                  }}
                >
                  {leaderboard.map((entry, i) => (
                    <LeaderboardRow
                      key={entry.user_id}
                      entry={entry}
                      maxXp={maxXp}
                      index={i}
                    />
                  ))}
                  {leaderboard.length === 0 && (
                    <BodySm
                      tone="muted"
                      style={{
                        textAlign: "center",
                        padding: tokens.space[8],
                      }}
                    >
                      Rankings will appear shortly.
                    </BodySm>
                  )}
                </div>

                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  rightIcon={<ChevronRight size={16} strokeWidth={1.75} />}
                >
                  View global ranks
                </Button>
              </div>
            </Card>

            <BadgesCard />

            <CompactLevelCard user={user} stats={userStats} />

            <Card radius="xl" padding="md" shadow="sm">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: tokens.space[3],
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: tokens.space[2],
                  }}
                >
                  <Star
                    size={18}
                    strokeWidth={1.75}
                    style={{ color: tokens.color.warm }}
                  />
                  <H3>Daily streak</H3>
                </div>
                <BodySm tone="muted">
                  Check in every day to keep your streak alive and earn bonus
                  XP. Currently at{" "}
                  <span
                    style={{
                      color: tokens.color.warm,
                      fontWeight: tokens.type.weight.bold,
                    }}
                  >
                    {streakInfo?.current_streak || 0} days
                  </span>
                  .
                </BodySm>
                <Button
                  variant={
                    streakInfo?.is_active_today ? "secondary" : "primary"
                  }
                  size="md"
                  fullWidth
                  disabled={streakInfo?.is_active_today}
                  onClick={async () => {
                    try {
                      await apiPost("/api/v1/challenges/streaks/checkin", {});
                      toast.success("Checked in for today.");
                      setStreakInfo((prev) =>
                        prev
                          ? {
                              ...prev,
                              is_active_today: true,
                              current_streak: prev.current_streak + 1,
                            }
                          : null,
                      );
                      const statsRes = await apiGet<{
                        success: boolean;
                        data: UserGamificationInfo;
                      }>("/api/v1/challenges/xp/me");
                      if (statsRes.success) setUserStats(statsRes.data);
                    } catch (err) {
                      const msg =
                        err instanceof Error ? err.message : "Check-in failed.";
                      toast.error(msg);
                    }
                  }}
                >
                  {streakInfo?.is_active_today
                    ? "Already checked in"
                    : "Daily check-in"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Page>
  );
}
