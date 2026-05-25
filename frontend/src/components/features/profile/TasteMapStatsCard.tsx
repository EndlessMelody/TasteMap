"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { Card, H3, Body, Caption } from "@/components/ui";
import { tokens } from "@/styles/tokens";

interface TasteMapStatsCardProps {
  user: {
    stats?: {
      followers?: number;
      following?: number;
      reviews?: number;
      visited?: number;
    };
  } | null;
}

function formatStat(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

export const TasteMapStatsCard: React.FC<TasteMapStatsCardProps> = ({
  user,
}) => {
  const stats = [
    { label: "Followers", value: user?.stats?.followers ?? 0 },
    { label: "Following", value: user?.stats?.following ?? 0 },
    { label: "Reviews", value: user?.stats?.reviews ?? 0 },
    { label: "Visited", value: user?.stats?.visited ?? 0 },
  ];

  return (
    <Card radius="xl" padding="md" shadow="sm" style={{ flex: 1 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: tokens.space[2],
          marginBottom: tokens.space[4],
        }}
      >
        <TrendingUp
          size={18}
          strokeWidth={1.75}
          style={{ color: tokens.color.textMuted }}
        />
        <H3>TasteMap stats</H3>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: tokens.space[2],
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: tokens.color.surfaceMuted,
              borderRadius: tokens.radius.md,
              padding: tokens.space[4],
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: tokens.space[1],
            }}
          >
            <Body
              style={{
                fontSize: "1.5rem",
                fontWeight: tokens.type.weight.bold,
                lineHeight: 1.1,
              }}
            >
              {formatStat(stat.value)}
            </Body>
            <Caption tone="muted">{stat.label}</Caption>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TasteMapStatsCard;
