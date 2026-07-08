"use client";

/**
 * JourneyStats — summary row for a finished tour (stops · duration · cost · XP).
 */
import { Row, Column } from "@once-ui-system/core";
import { MapPin, Timer, Wallet, Zap } from "lucide-react";
import { GlassCard } from "@/components/primitives/GlassCard";
import { Caption } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { formatDuration, formatVnd } from "../lib";
import { useLanguage } from "@/context/LanguageContext";

interface JourneyStatsProps {
  stops: number;
  durationMin: number | null;
  estimatedCostVnd: number | null;
  xp: number;
}

export function JourneyStats({ stops, durationMin, estimatedCostVnd, xp }: JourneyStatsProps) {
  const { t } = useLanguage();
  const items = [
    { icon: <MapPin size={16} />, label: t("tour.statStops"), value: String(stops), tone: tokens.color.cool },
    { icon: <Timer size={16} />, label: t("tour.statDuration"), value: formatDuration(durationMin), tone: tokens.color.magic },
    { icon: <Wallet size={16} />, label: t("tour.statCost"), value: formatVnd(estimatedCostVnd), tone: tokens.color.warm },
    { icon: <Zap size={16} />, label: t("tour.statXp"), value: `+${xp}`, tone: tokens.color.warning },
  ];

  return (
    <GlassCard variant="glass" padding="md" radius="lg" fillWidth>
      <Row fillWidth horizontal="between" vertical="center" gap="16" s={{ direction: "column" }}>
        {items.map((it) => (
          <Column key={it.label} horizontal="center" style={{ gap: 4, flex: 1, textAlign: "center" }}>
            <Row vertical="center" style={{ gap: 6, color: it.tone }}>
              {it.icon}
              <span style={{ fontSize: tokens.type.size.h3, fontWeight: tokens.type.weight.bold, color: tokens.color.text }}>
                {it.value}
              </span>
            </Row>
            <Caption tone="muted" style={{ textTransform: "uppercase", letterSpacing: tokens.type.tracking.wide }}>
              {it.label}
            </Caption>
          </Column>
        ))}
      </Row>
    </GlassCard>
  );
}
