"use client";

/**
 * JourneyStopCard — full-bleed hero card for one stop in the cinematic journey.
 * Image banner + gradient, numbered node, MatchRing, and meta pills.
 */
import { Column, Row } from "@once-ui-system/core";
import { motion } from "framer-motion";
import { Clock, DollarSign, Star } from "lucide-react";
import { GlassCard } from "@/components/primitives/GlassCard";
import { MatchRing } from "@/components/primitives/MatchRing";
import { H3 } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { accentFor } from "../lib";
import type { JourneyStop } from "../lib";
import { useLanguage } from "@/context/LanguageContext";

interface JourneyStopCardProps {
  stop: JourneyStop;
}

function MetaPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Row
      vertical="center"
      style={{
        gap: 5,
        padding: "5px 10px",
        borderRadius: tokens.radius.pill,
        background: "rgba(255,255,255,0.16)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.25)",
        color: "#fff",
        fontSize: tokens.type.size.caption,
        fontWeight: tokens.type.weight.semibold,
      }}
    >
      {icon}
      {label}
    </Row>
  );
}

export function JourneyStopCard({ stop }: JourneyStopCardProps) {
  const { t } = useLanguage();
  const loc = stop.location;
  const accent = accentFor(loc?.id ?? stop.stop_order);
  const match = stop.match_score ?? 0;

  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} style={{ width: "100%" }}>
      <GlassCard variant="elevated" padding="none" radius="xl" fillWidth>
        {/* Image banner */}
        <Column style={{ position: "relative", height: 208, width: "100%" }}>
          <img
            src={loc?.image_url ?? ""}
            alt={loc?.name ?? "Stop"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Legibility gradient */}
          <Column
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(10,6,4,0.86) 0%, rgba(10,6,4,0.25) 48%, rgba(10,6,4,0.05) 100%)",
            }}
          />

          {/* Numbered node (top-left) */}
          <Row
            horizontal="center"
            vertical="center"
            style={{
              position: "absolute",
              top: tokens.space[4],
              left: tokens.space[4],
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: accent,
              color: "#fff",
              fontSize: tokens.type.size.body,
              fontWeight: tokens.type.weight.black,
              boxShadow: `0 6px 18px -4px ${accent}`,
              border: "2px solid rgba(255,255,255,0.85)",
            }}
          >
            {stop.stop_order}
          </Row>

          {/* Match ring (top-right) */}
          {match > 0 && (
            <Column
              style={{
                position: "absolute",
                top: tokens.space[3],
                right: tokens.space[3],
                padding: 4,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <MatchRing value={match} size="md" />
            </Column>
          )}

          {/* Identity + meta (bottom) */}
          <Column
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              padding: tokens.space[5],
              gap: tokens.space[2],
            }}
          >
            <H3 tone="inverse" style={{ lineHeight: 1.1 }}>
              {loc?.name ?? "Unknown stop"}
            </H3>
            <Row style={{ gap: tokens.space[2], flexWrap: "wrap" }}>
              {loc?.category && (
                <MetaPill icon={<Star size={11} />} label={loc.category[0].toUpperCase() + loc.category.slice(1)} />
              )}
              {stop.dwell_min ? <MetaPill icon={<Clock size={11} />} label={t("tour.minHere", { n: stop.dwell_min })} /> : null}
              {loc?.price_range && <MetaPill icon={<DollarSign size={11} />} label={loc.price_range} />}
            </Row>
          </Column>
        </Column>
      </GlassCard>
    </motion.div>
  );
}
