"use client";

/**
 * JourneyView — the cinematic vertical "Your Flavor Journey" scene.
 * Ambient map glow companion → hero stop cards linked by animated route lines.
 * Renders from the authoritative GET /tours/{id} payload (TourDetail).
 */
import React from "react";
import { Column, Row } from "@once-ui-system/core";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { RotateCcw, Navigation2, Sparkles } from "lucide-react";
import { Button, H2, Caption, Eyebrow } from "@/components/ui";
import { GlassCard } from "@/components/primitives/GlassCard";
import ClientOnly from "@/components/common/ClientOnly";
import { useLanguage } from "@/context/LanguageContext";
import { tokens } from "@/styles/tokens";
import { fadeUp, stagger, transitions } from "@/lib/motion";
import { JourneyStopCard } from "./JourneyStopCard";
import { RouteLine } from "./RouteLine";
import { JourneyStats } from "./JourneyStats";
import { DEFAULT_CENTER, accentFor } from "../lib";
import type { TourDetail } from "../lib";
import type { TourTransportMode } from "@/store/useTourBuilderStore";

const MapWidget = dynamic(() => import("@/components/MapWidget"), { ssr: false });

interface JourneyViewProps {
  tour: TourDetail;
  transportMode: TourTransportMode;
  onStartOver: () => void;
  onStartTour: () => void;
}

export function JourneyView({ tour, transportMode, onStartOver, onStartTour }: JourneyViewProps) {
  const { t } = useLanguage();
  const stops = tour.stops.filter((s) => s.location);
  const xp = stops.reduce((sum, s) => sum + (s.match_score ?? 0), 0);

  const routeCoords = stops
    .map((s) => (s.location ? ([s.location.lng, s.location.lat] as [number, number]) : null))
    .filter((c): c is [number, number] => !!c && (c[0] !== 0 || c[1] !== 0));

  const spotIndexMap = new Map(stops.map((s) => [s.location!.id, s.stop_order]));
  const center: [number, number] = stops[0]?.location
    ? [stops[0].location.lat, stops[0].location.lng]
    : DEFAULT_CENTER;

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
          {routeCoords.length >= 1 && (
            <motion.div variants={fadeUp}>
              <GlassCard variant="elevated" padding="none" radius="xl" fillWidth>
                <Column style={{ height: 220, width: "100%" }}>
                  <ClientOnly>
                    <MapWidget
                      mapId="tour-journey-map"
                      spots={stops.map((s) => ({
                        id: s.location!.id,
                        name: s.location!.name,
                        lat: s.location!.lat,
                        lon: s.location!.lng,
                        category: "place",
                        emoji: "📍",
                        accent: accentFor(s.location!.id),
                        rating: s.location!.rating ?? 5,
                        reviewCount: 0,
                        priceLevel: 2,
                        isOpen: true,
                        closesAt: "",
                        distance: "",
                        img: s.location!.image_url ?? "",
                        description: s.location!.category ?? "",
                        tags: [],
                      }))}
                      center={center}
                      zoom={13}
                      routeCoords={routeCoords.length >= 2 ? routeCoords : undefined}
                      planSpotIndexMap={spotIndexMap}
                      showBanner={false}
                    />
                  </ClientOnly>
                </Column>
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

          {/* Vertical hero story */}
          <Column fillWidth style={{ gap: 0, marginTop: tokens.space[2] }}>
            {stops.map((stop, i) => (
              <React.Fragment key={stop.id}>
                <JourneyStopCard stop={stop} />
                {i < stops.length - 1 && (
                  <RouteLine
                    travelMin={stops[i + 1].travel_min}
                    mode={transportMode}
                    accent={accentFor(stop.location!.id)}
                  />
                )}
              </React.Fragment>
            ))}
          </Column>

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
