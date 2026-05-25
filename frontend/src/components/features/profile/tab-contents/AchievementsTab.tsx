"use client";

import React from "react";
import { Award } from "lucide-react";
import {
  Card,
  H2,
  BodySm,
  Pill,
  Button,
  EmptyState,
} from "@/components/ui";
import BadgeCard from "@/components/features/gamification/BadgeCard";
import { useAuth } from "@/context/AuthContext";
import { apiPut } from "@/lib/api";
import { toast } from "sonner";
import { tokens } from "@/styles/tokens";
import { BadgeSummary } from "@/types/gamification";

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

  const handleEquipBadge = async (badgeId: number | null) => {
    try {
      await apiPut("/api/v1/users/me/primary-badge", { badge_id: badgeId });
      await refreshUser();
      toast.success(badgeId ? "Badge equipped!" : "Badge unequipped!");
    } catch {
      toast.error("Failed to update primary badge");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: tokens.space[6],
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: tokens.space[4],
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space[1],
          }}
        >
          <H2>Badge vault</H2>
          <BodySm tone="muted">
            Collect and show off your culinary journey
          </BodySm>
        </div>
        <Pill tone="neutral" size="md">
          {badges.length} / {totalBadges}
        </Pill>
      </div>

      <div
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
      </div>
    </div>
  );
};

export default AchievementsTab;
