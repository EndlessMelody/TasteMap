"use client";

import React from "react";
import {
  Heart,
  Flame,
  Cookie,
  Leaf,
  Salad,
  Soup,
  Drumstick,
} from "lucide-react";
import { Card, H3, BodySm, Caption } from "@/components/ui";
import { tokens } from "@/styles/tokens";

interface TasteItem {
  icon: React.ReactNode;
  label: string;
  value: number;
}

const TASTE_DATA: TasteItem[] = [
  { icon: <Flame size={16} strokeWidth={1.75} />, label: "Spicy", value: 85 },
  { icon: <Cookie size={16} strokeWidth={1.75} />, label: "Sweet", value: 60 },
  { icon: <Leaf size={16} strokeWidth={1.75} />, label: "Vegan", value: 40 },
  { icon: <Salad size={16} strokeWidth={1.75} />, label: "Savory", value: 72 },
  { icon: <Drumstick size={16} strokeWidth={1.75} />, label: "Crispy", value: 55 },
  { icon: <Soup size={16} strokeWidth={1.75} />, label: "Umami", value: 68 },
];

export const FlavorProfileCard: React.FC = () => {
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
        <Heart size={18} strokeWidth={1.75} style={{ color: tokens.color.warm }} />
        <H3>Flavor profile</H3>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: tokens.space[2],
        }}
      >
        {TASTE_DATA.map((taste) => (
          <div
            key={taste.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space[3],
              padding: tokens.space[3],
              borderRadius: tokens.radius.md,
              background: tokens.color.surfaceMuted,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: tokens.radius.sm,
                background: tokens.color.surface,
                color: tokens.color.textMuted,
                flexShrink: 0,
              }}
            >
              {taste.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: tokens.space[1],
                }}
              >
                <BodySm style={{ fontWeight: tokens.type.weight.semibold }}>
                  {taste.label}
                </BodySm>
                <Caption tone="muted">{taste.value}%</Caption>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 4,
                  background: tokens.color.surfaceInset,
                  borderRadius: tokens.radius.pill,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${taste.value}%`,
                    height: "100%",
                    background: tokens.color.text,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default FlavorProfileCard;
