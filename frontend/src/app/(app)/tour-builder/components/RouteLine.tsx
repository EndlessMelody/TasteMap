"use client";

/**
 * RouteLine — animated connector drawn between two journey stops.
 * The line "draws in" on scroll-reveal and carries a travel-time chip.
 */
import { Column, Row } from "@once-ui-system/core";
import { motion } from "framer-motion";
import { Footprints, Car, Bus } from "lucide-react";
import { tokens } from "@/styles/tokens";
import type { TourTransportMode } from "@/store/useTourBuilderStore";
import { useLanguage } from "@/context/LanguageContext";

const MODE_ICON: Record<TourTransportMode, typeof Car> = {
  walking: Footprints,
  driving: Car,
  transit: Bus,
};

interface RouteLineProps {
  travelMin?: number | null;
  mode?: TourTransportMode;
  accent?: string;
}

export function RouteLine({ travelMin, mode = "driving", accent = tokens.color.warm }: RouteLineProps) {
  const { t } = useLanguage();
  const Icon = MODE_ICON[mode] ?? Car;
  const label = travelMin && travelMin > 0 ? t("tour.minShort", { n: travelMin }) : t("tour.nearby");

  return (
    <Row vertical="center" horizontal="center" style={{ position: "relative", height: 56, width: "100%" }}>
      {/* Vertical line that draws in */}
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.4, ease: tokens.motion.easeCurve.out }}
        style={{
          position: "absolute",
          width: 2,
          height: "100%",
          transformOrigin: "top",
          background: `linear-gradient(to bottom, ${accent}, ${tokens.color.border})`,
          borderRadius: tokens.radius.pill,
        }}
      />
      {/* Travel chip */}
      <Row
        vertical="center"
        style={{
          gap: tokens.space[1],
          padding: "4px 10px",
          borderRadius: tokens.radius.pill,
          background: tokens.color.surface,
          border: `1px solid ${tokens.color.border}`,
          boxShadow: tokens.shadow.sm,
          zIndex: 1,
          color: tokens.color.textMuted,
          fontSize: tokens.type.size.caption,
          fontWeight: tokens.type.weight.semibold,
        }}
      >
        <Icon size={12} color={accent} />
        {label}
      </Row>
    </Row>
  );
}
