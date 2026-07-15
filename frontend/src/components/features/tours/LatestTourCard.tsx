"use client";

/**
 * LatestTourCard — Discovery dashboard slot showing the user's most recent
 * ready tour on a real Mapbox route, with quick links to reopen it or start it.
 */
import React from "react";
import { useRouter } from "next/navigation";
import { Map as MapIcon, ArrowUpRight, Navigation2, Sparkles } from "lucide-react";
import { Column, Row } from "@once-ui-system/core";

import { GlassCard } from "@/components/primitives";
import { Button, BodySm, Caption } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { apiGet } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { TourMap } from "./TourMap";
import { formatDuration, formatVnd } from "./lib";
import type { TourDetail, TourSummary } from "./lib";

export const LatestTourCard: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [tour, setTour] = React.useState<TourDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await apiGet<{ items: TourSummary[] }>("/api/v1/tours?status=ready&limit=1");
        const latest = list.items?.[0];
        if (!latest) {
          if (alive) setLoading(false);
          return;
        }
        const detail = await apiGet<TourDetail>(`/api/v1/tours/${latest.id}`);
        if (!alive) return;
        setTour(detail);
      } catch {
        if (alive) setFailed(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <GlassCard variant="elevated" padding="none" radius="lg" fillWidth>
        <Column style={{ height: 220, background: tokens.color.surfaceMuted }} />
      </GlassCard>
    );
  }

  if (failed || !tour) {
    return (
      <GlassCard variant="elevated" padding="lg" radius="lg" fillWidth>
        <Column
          horizontal="center"
          style={{
            gap: tokens.space[3],
            textAlign: "center",
            paddingTop: tokens.space[4],
            paddingRight: tokens.space[4],
            paddingBottom: tokens.space[4],
            paddingLeft: tokens.space[4],
          }}
        >
          <MapIcon size={22} color={tokens.color.textMuted} strokeWidth={1.8} />
          <BodySm style={{ fontWeight: tokens.type.weight.semibold }}>{t("tour.emptyTitle")}</BodySm>
          <Button variant="primary" size="sm" leftIcon={<Sparkles size={14} />} onClick={() => router.push("/tour-builder")}>
            {t("tour.emptyCta")}
          </Button>
        </Column>
      </GlassCard>
    );
  }

  const stopCount = tour.stops.length;
  const ids = tour.stops.map((s) => s.location?.id).filter(Boolean).join(",");

  return (
    <GlassCard
      variant="elevated"
      padding="none"
      radius="lg"
      fillWidth
      style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      <Row
        vertical="center"
        style={{
          justifyContent: "space-between",
          gap: tokens.space[3],
          paddingTop: tokens.space[3],
          paddingRight: tokens.space[4],
          paddingBottom: tokens.space[3],
          paddingLeft: tokens.space[4],
          borderBottom: `1px solid ${tokens.color.border}`,
        }}
      >
        <Row vertical="center" style={{ gap: tokens.space[2] }}>
          <span
            style={{
              width: 22, height: 22, borderRadius: tokens.radius.sm,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              backgroundColor: `${tokens.color.warm}14`, border: `1px solid ${tokens.color.warm}30`,
            }}
          >
            <MapIcon size={12} color={tokens.color.warm} strokeWidth={2.4} />
          </span>
          <span
            style={{
              fontSize: tokens.type.size.caption, fontWeight: tokens.type.weight.bold,
              letterSpacing: tokens.type.tracking.wide, textTransform: "uppercase",
              color: tokens.color.textSubtle,
            }}
          >
            {t("tour.latestTourEyebrow")}
          </span>
        </Row>
        <BodySm style={{ fontWeight: tokens.type.weight.bold }}>
          {tour.title || `Tour #${tour.id}`}
        </BodySm>
      </Row>

      <TourMap stops={tour.stops} mapId="discover-latest-tour" height={160} zoom={12} />

      <Row
        vertical="center"
        style={{
          justifyContent: "space-between",
          paddingTop: tokens.space[3],
          paddingRight: tokens.space[4],
          paddingBottom: tokens.space[3],
          paddingLeft: tokens.space[4],
          borderTop: `1px solid ${tokens.color.border}`,
          gap: tokens.space[2],
        }}
      >
        <Caption tone="muted">
          {stopCount === 1 ? t("tour.stopSingular", { n: stopCount }) : t("tour.stopPlural", { n: stopCount })}
          {" · "}
          {formatDuration(tour.estimated_duration)}
          {" · "}
          {formatVnd(tour.estimated_cost)}
        </Caption>
      </Row>

      <Row
        style={{
          paddingTop: 0,
          paddingRight: tokens.space[4],
          paddingBottom: tokens.space[4],
          paddingLeft: tokens.space[4],
          gap: tokens.space[2],
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          leftIcon={<ArrowUpRight size={14} />}
          onClick={() => router.push(`/tour-builder?tour=${tour.id}`)}
        >
          {t("tour.viewJourney")}
        </Button>
        <Button
          variant="primary"
          size="sm"
          fullWidth
          leftIcon={<Navigation2 size={14} />}
          onClick={() => router.push(`/explore?spots=${ids}`)}
        >
          {t("tour.startTour")}
        </Button>
      </Row>
    </GlassCard>
  );
};
