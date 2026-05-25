"use client";

import React from "react";
import {
  Utensils,
  Flame,
  Cake,
  Gem,
  Feather,
  PartyPopper,
} from "lucide-react";
import { Card, H3, Body, BodySm } from "@/components/ui";
import { tokens } from "@/styles/tokens";

interface RadarPoint {
  subject: string;
  A: number;
  fullMark?: number;
}

interface TopHighlightsCardProps {
  radarData: RadarPoint[];
}

const TRAIT_META: Record<
  string,
  { icon: React.ReactNode; label: string; desc: string }
> = {
  "Street Food": {
    icon: <Utensils size={18} strokeWidth={1.75} />,
    label: "Street Food Guru",
    desc: "Local street eats enthusiast",
  },
  Spicy: {
    icon: <Flame size={18} strokeWidth={1.75} />,
    label: "Spice Specialist",
    desc: "Loves bold, fiery flavors",
  },
  Sweet: {
    icon: <Cake size={18} strokeWidth={1.75} />,
    label: "Sweet Tooth",
    desc: "Desserts & café connoisseur",
  },
  Luxury: {
    icon: <Gem size={18} strokeWidth={1.75} />,
    label: "Fine Dining Fan",
    desc: "Premium culinary experiences",
  },
  Quiet: {
    icon: <Feather size={18} strokeWidth={1.75} />,
    label: "Peaceful Eater",
    desc: "Cozy & calm dining spots",
  },
  Group: {
    icon: <PartyPopper size={18} strokeWidth={1.75} />,
    label: "Social Foodie",
    desc: "Food is better with friends",
  },
};

export const TopHighlightsCard: React.FC<TopHighlightsCardProps> = ({
  radarData,
}) => {
  const topTraits = [...(radarData ?? [])].sort((a, b) => b.A - a.A).slice(0, 3);

  return (
    <Card
      radius="xl"
      padding="lg"
      shadow="sm"
      style={{
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "0%",
        height: 420,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <H3 style={{ marginBottom: tokens.space[5] }}>Top highlights</H3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: tokens.space[2],
        }}
      >
        {topTraits.length > 0 ? (
          topTraits.map((trait) => {
            const meta = TRAIT_META[trait.subject] ?? {
              icon: <Utensils size={18} strokeWidth={1.75} />,
              label: trait.subject,
              desc: "A key taste preference",
            };
            const pct = Math.round(
              (trait.A / (trait.fullMark ?? 100)) * 100,
            );
            return (
              <div
                key={trait.subject}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.space[4],
                  padding: tokens.space[4],
                  borderRadius: tokens.radius.md,
                  background: tokens.color.surfaceMuted,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: tokens.radius.sm,
                    background: tokens.color.surface,
                    color: tokens.color.textMuted,
                    flexShrink: 0,
                  }}
                >
                  {meta.icon}
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    minWidth: 0,
                  }}
                >
                  <Body style={{ fontWeight: tokens.type.weight.semibold }}>
                    {meta.label}
                  </Body>
                  <BodySm tone="muted">
                    {meta.desc} · {pct}%
                  </BodySm>
                </div>
              </div>
            );
          })
        ) : (
          <BodySm tone="muted">
            Complete the taste quiz to unlock your top traits.
          </BodySm>
        )}
      </div>

      <div style={{ flex: 1 }} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: tokens.space[4],
          borderRadius: tokens.radius.md,
          background: tokens.color.surfaceMuted,
        }}
      >
        <BodySm tone="muted" style={{ fontWeight: tokens.type.weight.semibold }}>
          Taste match with friends
        </BodySm>
        <Body
          style={{
            color: tokens.color.warm,
            fontWeight: tokens.type.weight.bold,
          }}
        >
          88%
        </Body>
      </div>
    </Card>
  );
};

export default TopHighlightsCard;
