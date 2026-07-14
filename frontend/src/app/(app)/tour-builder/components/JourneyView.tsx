"use client";

/**
 * JourneyView — the cinematic vertical "Your Flavor Journey" scene.
 * Ambient map glow companion → hero stop cards linked by animated route lines.
 * Renders from the authoritative GET /tours/{id} payload (TourDetail).
 */
import React, { useEffect, useState } from "react";
import { Column, Row } from "@once-ui-system/core";
import { motion, Reorder } from "framer-motion";
import { RotateCcw, Navigation2, Sparkles, GripVertical, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button, H2, Caption, Eyebrow, BodySm } from "@/components/ui";
import { GlassCard } from "@/components/primitives/GlassCard";
import { useLanguage } from "@/context/LanguageContext";
import { tokens } from "@/styles/tokens";
import { fadeUp, stagger, transitions } from "@/lib/motion";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { JourneyStopCard } from "./JourneyStopCard";
import { RouteLine } from "./RouteLine";
import { JourneyStats } from "./JourneyStats";
import { accentFor, timeContextNow } from "../lib";
import type { TourDetail, JourneyStop } from "../lib";
import { TourMap } from "@/components/features/tours";
import type { TourTransportMode, OptimizeResult } from "@/store/useTourBuilderStore";

interface JourneyViewProps {
  tour: TourDetail;
  transportMode: TourTransportMode;
  onStartOver: () => void;
  onStartTour: () => void;
  onTourUpdate: (tour: TourDetail) => void;
}

export function JourneyView({ tour, transportMode, onStartOver, onStartTour, onTourUpdate }: JourneyViewProps) {
  const { t } = useLanguage();
  const [orderedStops, setOrderedStops] = useState<JourneyStop[]>(() => tour.stops.filter((s) => s.location));
  const [reordering, setReordering] = useState(false);
  const [reoptimizing, setReoptimizing] = useState(false);

  useEffect(() => {
    setOrderedStops(tour.stops.filter((s) => s.location));
  }, [tour]);

  const stops = orderedStops;
  const xp = stops.reduce((sum, s) => sum + (s.match_score ?? 0), 0);
  const hasMapStops = stops.some(
    (s) => s.location && (s.location.lat !== 0 || s.location.lng !== 0)
  );
  const needsReoptimize = stops.length > 1 && stops.some((s) => s.match_score == null);

  const handleReorder = async (newOrder: JourneyStop[]) => {
    setOrderedStops(newOrder);
    setReordering(true);
    try {
      const updated = await apiPut<TourDetail>(`/api/v1/tours/${tour.id}/stops/order`, {
        stop_ids: newOrder.map((s) => s.id),
      });
      onTourUpdate(updated);
    } catch {
      toast.error(t("tour.reoptimizeFailed"));
    } finally {
      setReordering(false);
    }
  };

  const handleReoptimize = async () => {
    setReoptimizing(true);
    try {
      const first = orderedStops[0]?.location;
      await apiPost<OptimizeResult>(`/api/v1/tours/${tour.id}/optimize`, {
        start_lat: first?.lat ?? null,
        start_lng: first?.lng ?? null,
        category: "food",
        time_context: timeContextNow(),
        transport_mode: transportMode,
      });
      const detail = await apiGet<TourDetail>(`/api/v1/tours/${tour.id}`);
      onTourUpdate(detail);
    } catch {
      toast.error(t("tour.reoptimizeFailed"));
    } finally {
      setReoptimizing(false);
    }
  };

  return (
    <Column fillWidth fillHeight style={{ background: tokens.color.bg, overflow: "hidden", position: "relative" }}>
      {/* Sticky header */}
      <Row
        fillWidth
        vertical="center"
        horizontal="between"
        style={{
          padding: `${tokens.space[4]} ${tokens.space[8]}`,
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: `1px solid ${tokens.color.border}`,
          position: "sticky",
          top: 0,
          zIndex: tokens.z.sticky,
          flexShrink: 0,
        }}
      >
        <Button variant="ghost" size="md" leftIcon={<RotateCcw size={15} />} onClick={onStartOver}>
          {t("tour.startOver")}
        </Button>
        <Row vertical="center" style={{ gap: 8 }}>
          <Sparkles size={16} color={tokens.color.warm} />
          <H2 style={{ fontSize: tokens.type.size.h3 }}>{t("tour.flavorJourney")}</H2>
        </Row>
        <Button variant="primary" size="md" leftIcon={<Navigation2 size={15} />} onClick={onStartTour}>
          {t("tour.startTour")}
        </Button>
      </Row>

      {/* Scroll area */}
      <Column
        className="no-scrollbar"
        fillWidth
        style={{ flex: 1, overflowY: "auto", position: "relative" }}
      >
        {/* Ambient signature glow */}
        <Column
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: tokens.gradient.signatureSoft,
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 660,
            margin: "0 auto",
            padding: `${tokens.space[8]} ${tokens.space[5]} ${tokens.space[16]}`,
            display: "flex",
            flexDirection: "column",
            gap: tokens.space[5],
          }}
        >
          {/* Intro */}
          <motion.div variants={fadeUp}>
            <Column style={{ gap: 4 }}>
              <Eyebrow style={{ color: tokens.color.warm }}>{t("tour.optimisedRoute", { n: stops.length })}</Eyebrow>
              <Caption tone="muted">
                {transportMode ? t("tour.personalisedBy", { mode: transportMode }) : t("tour.personalised")}
              </Caption>
            </Column>
          </motion.div>

          {/* Ambient map companion */}
          {hasMapStops && (
            <motion.div variants={fadeUp}>
              <GlassCard variant="elevated" padding="none" radius="xl" fillWidth>
                <TourMap stops={stops} mapId="tour-journey-map" height={220} zoom={13} />
              </GlassCard>
            </motion.div>
          )}

          {/* Stats */}
          <motion.div variants={fadeUp}>
            <JourneyStats
              stops={stops.length}
              durationMin={tour.estimated_duration}
              estimatedCostVnd={tour.estimated_cost}
              xp={xp}
            />
          </motion.div>

          {/* Reorder hint / re-optimize */}
          <motion.div variants={fadeUp}>
            <Row
              horizontal="between"
              vertical="center"
              style={{
                gap: tokens.space[2],
                padding: `${tokens.space[2]} ${tokens.space[3]}`,
                borderRadius: tokens.radius.md,
                background: needsReoptimize ? `${tokens.color.warm}10` : tokens.color.surfaceMuted,
                border: `1px solid ${needsReoptimize ? `${tokens.color.warm}40` : tokens.color.border}`,
              }}
            >
              <BodySm tone="muted">{t("tour.reorderHint")}</BodySm>
              <Button
                variant={needsReoptimize ? "primary" : "ghost"}
                size="sm"
                leftIcon={<Wand2 size={13} />}
                loading={reoptimizing}
                onClick={handleReoptimize}
              >
                {reoptimizing ? t("tour.reoptimizing") : t("tour.reoptimize")}
              </Button>
            </Row>
          </motion.div>

          {/* Vertical hero story — drag to reorder */}
          <Reorder.Group
            axis="y"
            values={stops}
            onReorder={handleReorder}
            as="div"
            style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: tokens.space[2], opacity: reordering ? 0.7 : 1 }}
          >
            {stops.map((stop, i) => (
              <Reorder.Item key={stop.id} value={stop} as="div" style={{ position: "relative" }}>
                <Row
                  vertical="center"
                  style={{
                    position: "absolute",
                    top: tokens.space[4],
                    right: tokens.space[4],
                    zIndex: 2,
                    cursor: "grab",
                    color: "#fff",
                    background: "rgba(0,0,0,0.35)",
                    borderRadius: tokens.radius.pill,
                    padding: 6,
                  }}
                >
                  <GripVertical size={14} />
                </Row>
                <JourneyStopCard stop={stop} />
                {i < stops.length - 1 && (
                  <RouteLine
                    travelMin={stops[i + 1].travel_min}
                    mode={transportMode}
                    accent={accentFor(stop.location!.id)}
                  />
                )}
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {/* Footer CTA */}
          <motion.div variants={fadeUp} transition={transitions.smooth}>
            <Button variant="primary" size="lg" fullWidth leftIcon={<Navigation2 size={16} />} onClick={onStartTour}>
              {t("tour.startThisTour")}
            </Button>
          </motion.div>
        </motion.div>
      </Column>
    </Column>
  );
}
