"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  MessageCircle,
  UserPlus,
  UserCheck,
  Clock,
  Layers,
  Sparkles,
  ChevronLeft,
  Dna,
  X,
} from "lucide-react";

import { Column, Row, Grid } from "@once-ui-system/core";
import {
  ProfileIdentityCard,
  FlavorProfileCard,
  FriendsListCard,
  ProfileTabs,
  TasteMapStatsCard,
  TopHighlightsCard,
  ProfileAvatarGroup,
  PostItem,
} from "@/components/features/profile";
import {
  Card,
  Button,
  H2,
  H3,
  Body,
  BodySm,
  Caption,
  Pill,
  Skeleton,
  EmptyState,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";

import ClientOnly from "@/components/common/ClientOnly";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useUserVector } from "@/context/UserVectorContext";
import { BadgeSummary } from "@/types/gamification";
import { useBadges } from "@/hooks/useBadges";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import type { Friend } from "@/components/features/foodies/FriendRow";

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

function ProfileSkeleton() {
  return (
    <Column
      className="no-scrollbar"
      style={{
        width: "100%",
        minHeight: "100%",
        background: tokens.color.bg,
        overflowY: "auto",
      }}
    >
      <Skeleton width="100%" height={220} radius="sm" />
      <Column
        style={{
          maxWidth: 1200,
          width: "100%",
          marginTop: 0,
          marginBottom: 0,
          marginLeft: "auto",
          marginRight: "auto",
          paddingTop: 0,
          paddingLeft: tokens.space[6],
          paddingRight: tokens.space[6],
          paddingBottom: tokens.space[16],
        }}
      >
        <Row
          style={{
            alignItems: "flex-end",
            gap: tokens.space[5],
            marginTop: -50,
            marginBottom: tokens.space[5],
          }}
        >
          <Skeleton width={80} height={80} radius="pill" />
          <Column
            style={{
              flex: 1,
              gap: tokens.space[2],
              paddingBottom: 6,
            }}
          >
            <Skeleton width="52%" height={22} radius="sm" />
            <Skeleton width="28%" height={13} radius="sm" />
          </Column>
        </Row>
        <Skeleton width="100%" height={88} radius="md" />
        <Grid
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: tokens.space[2],
            marginTop: tokens.space[3],
            marginBottom: tokens.space[3],
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={62} radius="md" />
          ))}
        </Grid>
        <Skeleton width="100%" height={320} radius="lg" />
      </Column>
    </Column>
  );
}

function MatchGauge({ pct }: { pct: number }) {
  const size = 64;
  const sw = 5;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const color =
    pct >= 80
      ? tokens.color.success
      : pct >= 60
      ? tokens.color.warning
      : tokens.color.textSubtle;
  return (
    <Column style={{ position: "relative", width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255, 255, 255, 0.35)"
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
      <Column
        horizontal="center"
        vertical="center"
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: tokens.type.weight.bold,
            color: tokens.color.textInverse,
            lineHeight: 1,
          }}
        >
          {pct}
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: tokens.type.weight.semibold,
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          %
        </span>
      </Column>
    </Column>
  );
}

interface SocialActionRowProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onClick: () => void;
  disabled?: boolean;
}

function SocialActionRow({
  icon,
  label,
  subtitle,
  onClick,
  disabled,
}: SocialActionRowProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: tokens.space[3],
        padding: tokens.space[3],
        borderRadius: tokens.radius.md,
        background: "transparent",
        border: "none",
        textAlign: "left",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled)
          e.currentTarget.style.background = tokens.color.surfaceMuted;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: tokens.radius.md,
          background: tokens.color.surfaceMuted,
          color: tokens.color.textMuted,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <Column style={{ minWidth: 0 }}>
        <Body style={{ fontWeight: tokens.type.weight.semibold }}>{label}</Body>
        {subtitle && <Caption tone="muted">{subtitle}</Caption>}
      </Column>
    </button>
  );
}

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

  const [userPosts, setUserPosts] = useState<PostItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

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
      setProfile({ ...prof, badges: [] });
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
        `/api/v1/posts/?user_id=${userId}&limit=50&offset=0`,
      );
      setUserPosts(data?.items || []);
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
      /* surfaced upstream */
    } finally {
      setActionBusy(false);
    }
  };

  const handleAddFriend = () =>
    withBusy(() => apiPost("/api/v1/friends/request", { friend_id: userId }));
  const handleCancel = () =>
    withBusy(() => apiDelete(`/api/v1/friends/${social?.friendship_id}`));
  const handleAccept = () =>
    withBusy(() =>
      apiPatch(`/api/v1/friends/${social?.friendship_id}/accept`),
    );
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

  if (loading) return <ProfileSkeleton />;

  if (error || !profile) {
    return (
      <Column
        className="no-scrollbar"
        horizontal="center"
        vertical="center"
        style={{
          width: "100%",
          minHeight: "100%",
          background: tokens.color.bg,
          paddingTop: tokens.space[6],
          paddingBottom: tokens.space[6],
          paddingLeft: tokens.space[6],
          paddingRight: tokens.space[6],
        }}
      >
        <Card radius="xl" padding="lg" shadow="sm" style={{ maxWidth: 480 }}>
          <EmptyState
            icon={<Sparkles size={32} strokeWidth={1.5} />}
            title="Profile not found"
            description={error || "We couldn't load this profile."}
            action={
              <Button
                variant="secondary"
                size="md"
                onClick={() => router.push("/foodies")}
                leftIcon={<ChevronLeft size={16} strokeWidth={1.75} />}
              >
                Back to Foodies
              </Button>
            }
          />
        </Card>
      </Column>
    );
  }

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
      className="no-scrollbar"
      style={{
        width: "100%",
        height: "100%",
        background: tokens.color.bg,
        color: tokens.color.text,
        overflowY: "auto",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "relative",
          height: 240,
          flexShrink: 0,
        }}
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
        <Column
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.05) 0%, rgba(10,10,10,0.35) 60%, rgba(10,10,10,0.55) 100%)",
          }}
        />

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<ChevronLeft size={16} strokeWidth={1.75} />}
          onClick={() => router.push("/foodies")}
          style={{
            position: "absolute",
            top: tokens.space[5],
            left: tokens.space[6],
            background: "rgba(255, 255, 255, 0.18)",
            backdropFilter: "blur(14px) saturate(180%)",
            WebkitBackdropFilter: "blur(14px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            color: tokens.color.textInverse,
          }}
        >
          Foodies
        </Button>

        {matchScore !== null && (
          <Column
            style={{
              position: "absolute",
              top: tokens.space[5],
              right: tokens.space[6],
            }}
          >
            <MatchGauge pct={matchScore} />
          </Column>
        )}

        <Column
          style={{
            position: "absolute",
            bottom: tokens.space[4],
            left: tokens.space[8],
          }}
        >
          <Caption tone="inverse" style={{ opacity: 0.8 }}>
            Foodie profile
          </Caption>
        </Column>
      </motion.div>

      <Column
        style={{
          maxWidth: 1200,
          width: "100%",
          marginTop: 0,
          marginBottom: 0,
          marginLeft: "auto",
          marginRight: "auto",
          paddingTop: 0,
          paddingLeft: tokens.space[6],
          paddingRight: tokens.space[6],
          paddingBottom: tokens.space[16],
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: tokens.space[5],
            marginTop: -64,
            marginBottom: tokens.space[6],
          }}
        >
          <ProfileAvatarGroup user={profile} />
        </motion.div>

        <Grid
          style={{
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
            gap: tokens.space[6],
            alignItems: "start",
          }}
        >
          <Column style={{ gap: tokens.space[6] }}>
            <ProfileIdentityCard user={profile} />

            <Card radius="xl" padding="md" shadow="sm">
              <Row
                horizontal="between"
                vertical="center"
                style={{
                  gap: tokens.space[3],
                  marginBottom: tokens.space[5],
                }}
              >
                <Row vertical="center" style={{ gap: tokens.space[3] }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: tokens.radius.md,
                      background: "rgba(168, 85, 247, 0.1)",
                      color: tokens.color.magic,
                    }}
                  >
                    <Dna size={18} strokeWidth={1.75} />
                  </span>
                  <H3>Taste DNA compare</H3>
                </Row>
                {matchScore !== null && (
                  <Pill
                    tone={matchScore >= 80 ? "success" : "warning"}
                    size="md"
                  >
                    {matchScore}% match
                  </Pill>
                )}
              </Row>

              <Column style={{ height: 320, width: "100%" }}>
                <ClientOnly>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={radarChartData}
                      margin={{ top: 8, right: 30, bottom: 8, left: 30 }}
                    >
                      <PolarGrid stroke={tokens.color.border} />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{
                          fill: tokens.color.textMuted,
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      />
                      <Radar
                        name="You"
                        dataKey="you"
                        stroke={tokens.color.warm}
                        fill={tokens.color.warm}
                        fillOpacity={0.14}
                        strokeWidth={2}
                      />
                      <Radar
                        name={displayName}
                        dataKey="them"
                        stroke={tokens.color.magic}
                        fill={tokens.color.magic}
                        fillOpacity={0.14}
                        strokeWidth={2}
                      />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{
                          fontSize: 12,
                          color: tokens.color.textMuted,
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </ClientOnly>
              </Column>
            </Card>

            <FlavorProfileCard />

            <FriendsListCard
              friendsList={(social?.mutual_friends || []).map((f) => ({
                id: f.id,
                username: f.username,
                display_name: f.display_name,
                avatar_url: f.avatar_url,
                match_score: 0,
              }))}
              friendsLoading={loading}
              onSeeAll={() => {}}
            />
          </Column>

          <Column style={{ gap: tokens.space[6] }}>
            <Card radius="xl" padding="md" shadow="sm">
              <H3 style={{ marginBottom: tokens.space[4] }}>
                Social connections
              </H3>
              <Column style={{ gap: tokens.space[1] }}>
                <SocialActionRow
                  icon={<MessageCircle size={18} strokeWidth={1.75} />}
                  label="Send message"
                  onClick={handleMessage}
                />
                <SocialActionRow
                  icon={<Layers size={18} strokeWidth={1.75} />}
                  label="Create food tour"
                  onClick={() => router.push("/group-rooms")}
                />

                {fs === "none" && (
                  <SocialActionRow
                    icon={<UserPlus size={18} strokeWidth={1.75} />}
                    label="Add friend"
                    onClick={handleAddFriend}
                    disabled={actionBusy}
                  />
                )}
                {fs === "pending_sent" && (
                  <SocialActionRow
                    icon={<Clock size={18} strokeWidth={1.75} />}
                    label="Cancel request"
                    onClick={handleCancel}
                    disabled={actionBusy}
                  />
                )}
                {fs === "pending_received" && (
                  <>
                    <SocialActionRow
                      icon={<UserCheck size={18} strokeWidth={1.75} />}
                      label="Confirm request"
                      onClick={handleAccept}
                      disabled={actionBusy}
                    />
                    <SocialActionRow
                      icon={<X size={18} strokeWidth={1.75} />}
                      label="Decline request"
                      onClick={handleCancel}
                      disabled={actionBusy}
                    />
                  </>
                )}
                {fs === "accepted" && (
                  <SocialActionRow
                    icon={<UserCheck size={18} strokeWidth={1.75} />}
                    label="Connected"
                    subtitle="Click to unfriend"
                    onClick={handleUnfriend}
                    disabled={actionBusy}
                  />
                )}
              </Column>
            </Card>

            <TasteMapStatsCard user={profile} />

            <TopHighlightsCard
              radarData={radarChartData.map((d) => ({
                subject: d.subject,
                A: d.them,
                fullMark: d.fullMark,
              }))}
            />
          </Column>
        </Grid>

        <Column style={{ marginTop: tokens.space[12] }}>
          <ProfileTabs
            postsLoading={postsLoading}
            userPosts={userPosts}
            badges={badges}
            totalBadges={totalBadges}
            badgesLoading={badgesLoading}
            isOwner={user?.id === profile.id}
          />
        </Column>
      </Column>
    </Column>
  );
}
