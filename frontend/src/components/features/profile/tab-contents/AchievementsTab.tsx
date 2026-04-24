"use client";

import React from "react";
import { Column, Row, Heading, Text, Button } from "@/components/OnceUI";
import { Award } from "lucide-react";
import BadgeCard from "@/components/features/gamification/BadgeCard";

import { useAuth } from "@/context/AuthContext";
import { apiPut } from "@/lib/api";
import { toast } from "sonner";

interface AchievementsTabProps {
  badges: any[];
  totalBadges: number;
  badgesLoading: boolean;
  isOwner?: boolean;
}

export const AchievementsTab: React.FC<AchievementsTabProps> = ({ 
  badges, 
  totalBadges, 
  badgesLoading,
  isOwner = false
}) => {
  const { user, refreshUser } = useAuth();

  const handleEquipBadge = async (badgeId: number | null) => {
    try {
      await apiPut("/api/v1/users/me/primary-badge", { badge_id: badgeId });
      await refreshUser();
      toast.success(badgeId ? "Badge equipped!" : "Badge unequipped!");
    } catch (err) {
      toast.error("Failed to update primary badge");
    }
  };
  return (
    <Column fillWidth gap={24}>
      <Row fillWidth horizontal="center" vertical="center" paddingX="8">
        <Column gap={4}>
          <Heading variant="display-strong-s">Badge Vault</Heading>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            Collect and show off your culinary journey
          </Text>
        </Column>
        <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <Text variant="body-strong-xs">{badges.length} / {totalBadges}</Text>
        </div>
      </Row>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          width: '100%'
        }}
      >
        {badges.map((badge: any, index: number) => (
          <BadgeCard 
            key={badge.id || index} 
            badge={badge} 
            delay={index * 0.05}
            isOwner={isOwner}
            isPrimary={user?.primary_badge?.id === badge.id}
            onEquip={handleEquipBadge}
          />
        ))}

        {badges.length === 0 && !badgesLoading && (
          <Column fillWidth horizontal="center" vertical="center" padding="64" gap={16} background="neutral-alpha-weak" radius="xl" style={{ border: '2px dashed rgba(0,0,0,0.05)', gridColumn: '1 / -1' }}>
            <div style={{ opacity: 0.2 }}>
              <Award size={48} />
            </div>
            <Text variant="body-default-s" onBackground="neutral-weak">No badges yet. Join a challenge to earn your first one!</Text>
            <Button variant="secondary" size="s">Explore Challenges</Button>
          </Column>
        )}
      </div>
    </Column>
  );
};
