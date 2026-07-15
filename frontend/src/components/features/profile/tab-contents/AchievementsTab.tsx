"use client";

import React, { useEffect, useState } from "react";
import { Award, Sparkles, Zap } from "lucide-react";
import {
  Card,
  H2,
  H3,
  BodySm,
  Pill,
  Button,
  EmptyState,
} from "@/components/ui";
import BadgeCard from "@/components/features/gamification/BadgeCard";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { toast } from "sonner";
import { Column, Row } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";
import { BadgeSummary } from "@/types/gamification";

interface BadgeProgressionItem {
  badge_id: number;
  name: string;
  icon_name: string;
  rarity: string;
  progress_percent: number;
  current_value: number;
  target_value: number;
  ai_advice: string;
  is_earned: boolean;
}

interface BadgeRoadmapResponse {
  total_earned: number;
  total_available: number;
  foodie_rank_title: string;
  rarity_score: number;
  next_milestone_advice: string;
  progressions: BadgeProgressionItem[];
}

interface AchievementsTabProps {
  badges: BadgeSummary[];
  totalBadges: number;
  badgesLoading: boolean;
  isOwner?: boolean;
}

export const AchievementsTab: React.FC<AchievementsTabProps> = ({
  badges,
  totalBadges,
  badgesLoading,
  isOwner = false,
}) => {
  const { user, refreshUser } = useAuth();
  const [roadmap, setRoadmap] = useState<BadgeRoadmapResponse | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const fetchRoadmap = async () => {
    if (!isOwner) return;
    try {
      const data = await apiGet<BadgeRoadmapResponse>("/api/v1/badges/progression");
      setRoadmap(data);
    } catch {
      // ignore silently if guest
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [isOwner, badges.length]);

  const handleEquipBadge = async (badgeId: number | null) => {
    try {
      await apiPut("/api/v1/users/me/primary-badge", { badge_id: badgeId });
      await refreshUser();
      toast.success(badgeId ? "Badge equipped!" : "Badge unequipped!");
    } catch {
      toast.error("Failed to update primary badge");
    }
  };

  const handleAutoEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await apiPost<{ success: boolean; data: { newly_awarded_count: number; new_badges: string[] } }>(
        "/api/v1/badges/auto-evaluate",
        {}
      );
      if (res?.data?.newly_awarded_count > 0) {
        toast.success(`🎉 Mở khóa thành công ${res.data.newly_awarded_count} huy hiệu mới: ${res.data.new_badges.join(", ")}!`);
        await refreshUser();
        await fetchRoadmap();
      } else {
        toast.info("💡 Chưa có thêm huy hiệu nào đạt 100%. Tiếp tục khám phá ẩm thực nhé!");
      }
    } catch {
      toast.error("Lỗi khi đánh giá thành tựu tự động");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <Column style={{ gap: tokens.space[6] }}>
      {/* ── AI Roadmap Banner (Only for Owner) ── */}
      {isOwner && roadmap && (
        <Card
          radius="xl"
          padding="lg"
          style={{
            background: `linear-gradient(135deg, ${tokens.color.surfaceMuted} 0%, ${tokens.color.warning}14 100%)`,
            border: `1px solid ${tokens.color.border}`,
          }}
        >
          <Column style={{ gap: tokens.space[4] }}>
            <Row horizontal="between" vertical="center" style={{ flexWrap: "wrap", gap: tokens.space[3] }}>
              <Row vertical="center" style={{ gap: tokens.space[3] }}>
                <Row
                  horizontal="center"
                  vertical="center"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: tokens.radius.pill,
                    background: `${tokens.color.warning}26`,
                    color: tokens.color.warning,
                  }}
                >
                  <Sparkles size={24} />
                </Row>
                <Column>
                  <Row vertical="center" style={{ gap: tokens.space[2] }}>
                    <H3>{roadmap.foodie_rank_title}</H3>
                    <Pill tone="warning" size="sm">
                      {roadmap.rarity_score} pts
                    </Pill>
                  </Row>
                  <BodySm tone="muted">{roadmap.next_milestone_advice}</BodySm>
                </Column>
              </Row>

              <Button
                variant="primary"
                size="sm"
                onClick={handleAutoEvaluate}
                disabled={evaluating}
              >
                <Zap size={16} style={{ marginRight: 6 }} />
                {evaluating ? "Đang tính toán AI..." : "Tự động nhận huy hiệu"}
              </Button>
            </Row>

            {/* Closest unearned progressions */}
            <Column style={{ gap: tokens.space[3], marginTop: tokens.space[2] }}>
              <BodySm style={{ fontWeight: 600, color: tokens.color.text }}>
                Lộ trình chinh phục tiếp theo (AI Advised):
              </BodySm>
              <Column
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: tokens.space[3],
                }}
              >
                {roadmap.progressions
                  .filter((p) => !p.is_earned)
                  .slice(0, 3)
                  .map((prog) => (
                    <Column
                      key={prog.badge_id}
                      style={{
                        paddingTop: tokens.space[3],
                        paddingRight: tokens.space[3],
                        paddingBottom: tokens.space[3],
                        paddingLeft: tokens.space[3],
                        borderRadius: tokens.radius.lg,
                        background: tokens.color.surface,
                        border: `1px solid ${tokens.color.border}`,
                        gap: tokens.space[2],
                      }}
                    >
                      <Row horizontal="between" vertical="center">
                        <span style={{ fontWeight: 600, fontSize: tokens.type.size.bodySm }}>{prog.name}</span>
                        <Pill tone="neutral" size="sm">
                          {prog.current_value}/{prog.target_value}
                        </Pill>
                      </Row>
                      {/* Progress bar */}
                      <Column
                        style={{
                          width: "100%",
                          height: 6,
                          background: tokens.color.surfaceMuted,
                          borderRadius: tokens.radius.pill,
                          overflow: "hidden",
                        }}
                      >
                        <Column
                          style={{
                            width: `${prog.progress_percent}%`,
                            height: "100%",
                            background: prog.progress_percent >= 80 ? tokens.color.success : tokens.color.cool,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </Column>
                      <BodySm tone="subtle" style={{ fontSize: tokens.type.size.caption, fontStyle: "italic" }}>
                        💡 {prog.ai_advice}
                      </BodySm>
                    </Column>
                  ))}
              </Column>
            </Column>
          </Column>
        </Card>
      )}

      <Row horizontal="between" vertical="center" style={{ gap: tokens.space[4] }}>
        <Column style={{ gap: tokens.space[1] }}>
          <H2>Badge vault</H2>
          <BodySm tone="muted">
            Collect and show off your culinary journey
          </BodySm>
        </Column>
        <Pill tone="neutral" size="md">
          {badges.length} / {totalBadges}
        </Pill>
      </Row>

      <Column
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: tokens.space[5],
        }}
      >
        {badges.map((badge, index) => (
          <BadgeCard
            key={badge.id ?? index}
            badge={badge}
            delay={index * 0.04}
            isOwner={isOwner}
            isPrimary={user?.primary_badge?.id === badge.id}
            onEquip={handleEquipBadge}
          />
        ))}

        {badges.length === 0 && !badgesLoading && (
          <Card
            radius="xl"
            padding="lg"
            shadow="none"
            surface="muted"
            style={{ gridColumn: "1 / -1" }}
          >
            <EmptyState
              icon={<Award size={32} strokeWidth={1.5} />}
              title="No badges yet"
              description="Join a challenge to earn your first one."
              action={
                <Button variant="secondary" size="sm">
                  Explore challenges
                </Button>
              }
            />
          </Card>
        )}
      </Column>
    </Column>
  );
};

export default AchievementsTab;
