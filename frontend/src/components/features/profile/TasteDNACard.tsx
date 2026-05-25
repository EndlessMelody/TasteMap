"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, H3, BodySm, Button, Eyebrow } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import ClientOnly from "@/components/common/ClientOnly";

interface TasteDNACardProps {
  radarData: unknown[];
}

/**
 * Taste DNA — the only AI-output surface on /profile.
 * Uses the `magic` accent per DESIGN.md §2 (magic purple is AI-only).
 */
export const TasteDNACard: React.FC<TasteDNACardProps> = ({ radarData }) => {
  return (
    <Card
      radius="xl"
      padding="lg"
      shadow="sm"
      style={{
        flexGrow: 1.2,
        flexShrink: 1,
        flexBasis: "0%",
        height: 420,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: tokens.space[3],
          marginBottom: tokens.space[5],
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
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: tokens.radius.md,
              background: "rgba(168, 85, 247, 0.1)",
              color: tokens.color.magic,
              flexShrink: 0,
            }}
          >
            <Sparkles size={20} strokeWidth={1.75} />
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <H3>Taste DNA</H3>
            <Eyebrow tone="muted">AI · Your unique flavor profile</Eyebrow>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          View insights
        </Button>
      </div>

      <div style={{ flex: 1, width: "100%", minHeight: 280 }}>
        <ClientOnly>
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={100}
            debounce={50}
          >
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="72%"
              data={radarData as object[]}
            >
              <PolarGrid stroke="rgba(168, 85, 247, 0.12)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: tokens.color.textMuted,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
              <Radar
                name="Taste"
                dataKey="A"
                stroke={tokens.color.magic}
                fill={tokens.color.magic}
                fillOpacity={0.18}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ClientOnly>
      </div>

      {/* Silence the unused-import warning if BodySm is dropped later */}
      <BodySm style={{ display: "none" }} aria-hidden />
    </Card>
  );
};

export default TasteDNACard;
