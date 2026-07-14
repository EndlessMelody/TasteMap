"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Zap, RotateCcw, Send, Map, ChevronLeft } from "lucide-react";
import { Column, Row, Grid } from "@once-ui-system/core";
import { toast } from "sonner";
import type { ItineraryStop } from "../types";
import { StopCard } from "../StopCard";
import { useLanguage } from "@/context/LanguageContext";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { TourMap, formatDuration, formatVnd } from "@/components/features/tours";
import type { TourDetail } from "@/components/features/tours/lib";
import { tourToItineraryStops } from "../../lib/generatePlan";
import type { PlannerAlternate } from "../../lib/generatePlan";

interface StepResultProps {
  tour: TourDetail;
  alternates: PlannerAlternate[];
  stops: ItineraryStop[];
  onRegen: () => void;
  onBack: () => void;
  onTourUpdate: (tour: TourDetail) => void;
}

export function StepResult({ tour, alternates, stops: initialStops, onRegen, onBack, onTourUpdate }: StepResultProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [localTour, setLocalTour] = useState(tour);
  const [pool, setPool] = useState<PlannerAlternate[]>(alternates);
  const [stops, setStops] = useState<ItineraryStop[]>(initialStops);
  const [activeStop, setActiveStop] = useState<number | null>(null);
  const [swapping, setSwapping] = useState<number | null>(null);

  useEffect(() => {
    setLocalTour(tour);
    setStops(tourToItineraryStops(tour, "walking"));
  }, [tour]);

  const liveStops = useMemo(() => localTour.stops.filter((s) => s.location), [localTour]);
  const totalXp = stops.reduce((s, x) => s + x.xp, 0);

  const applyUpdatedTour = (detail: TourDetail) => {
    setLocalTour(detail);
    setStops(tourToItineraryStops(detail, "walking"));
    onTourUpdate(detail);
  };

  const handleSwap = async (i: number) => {
    const stopToReplace = liveStops[i];
    const alt = pool[0];
    if (!stopToReplace || !alt) {
      toast.error(t("aiPlanner.swapFailed"));
      return;
    }
    setSwapping(i);
    try {
      await apiDelete(`/api/v1/tours/${localTour.id}/stops/${stopToReplace.id}`);
      await apiPost(`/api/v1/tours/${localTour.id}/stops`, { location_id: alt.id });
      const first = liveStops[0]?.location;
      await apiPost(`/api/v1/tours/${localTour.id}/optimize`, {
        start_lat: first?.lat ?? null,
        start_lng: first?.lng ?? null,
        category: "food",
        transport_mode: "walking",
      });
      const detail = await apiGet<TourDetail>(`/api/v1/tours/${localTour.id}`);
      applyUpdatedTour(detail);
      setPool((p) => [...p.slice(1), { id: stopToReplace.location!.id, name: stopToReplace.location!.name, lat: stopToReplace.location!.lat, lng: stopToReplace.location!.lng, image_url: stopToReplace.location!.image_url, price_range: stopToReplace.location!.price_range, rating: stopToReplace.location!.rating, category: stopToReplace.location!.category }]);
    } catch {
      toast.error(t("aiPlanner.swapFailed"));
    } finally {
      setSwapping(null);
    }
  };

  const handleRemove = async (i: number) => {
    const stopToRemove = liveStops[i];
    if (!stopToRemove) return;
    try {
      await apiDelete(`/api/v1/tours/${localTour.id}/stops/${stopToRemove.id}`);
      const detail = await apiGet<TourDetail>(`/api/v1/tours/${localTour.id}`);
      applyUpdatedTour(detail);
    } catch {
      toast.error(t("aiPlanner.removeStopFailed"));
    }
  };

  return (
    <Column
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#FAF8F5",
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Result header */}
      <Row
        vertical="center"
        style={{
          flexShrink: 0,
          padding: "14px 24px",
          gap: 12,
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          backgroundColor: "rgba(250,248,245,0.92)",
          backdropFilter: "blur(20px)",
        }}
      >
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "6px 12px",
            borderRadius: 10,
            border: "1.5px solid rgba(0,0,0,0.08)",
            backgroundColor: "rgba(255,255,255,0.8)",
            color: "#636366",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          <ChevronLeft size={15} /> {t("aiPlanner.back")}
        </motion.button>

        <Column style={{ flex: 1 }}>
          <h1 style={{ fontSize: 17, fontWeight: 900, color: "#1C1C1E", margin: 0, letterSpacing: -0.3 }}>
            {t("aiPlanner.yourPlan")}
          </h1>
          <p style={{ fontSize: 11, color: "#8E8E93", margin: 0 }}>
            {t("aiPlanner.stopsCity", { n: stops.length })}
          </p>
        </Column>

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 10,
            fontWeight: 800,
            padding: "4px 10px",
            borderRadius: 20,
            background: "linear-gradient(135deg, #FF6B35, #A855F7)",
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <Sparkles size={9} /> {t("aiPlanner.aiGenerated")}
        </span>
      </Row>

      {/* Scrollable content */}
      <Column className="no-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        <Column style={{ padding: "20px 24px 40px" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Hero banner */}
            <Column
              style={{
                borderRadius: 24,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Column
                style={{
                  background: "linear-gradient(135deg, #0F0F12 0%, #1A1A2E 40%, #16213E 70%, #0F3460 100%)",
                  padding: "22px 24px",
                  position: "relative",
                }}
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1, 0.5] }}
                    transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
                    style={{
                      position: "absolute",
                      width: 3,
                      height: 3,
                      borderRadius: "50%",
                      backgroundColor: "#FFC107",
                      top: `${15 + Math.random() * 70}%`,
                      left: `${10 + Math.random() * 80}%`,
                    }}
                  />
                ))}
                <Row vertical="center" style={{ gap: 16, position: "relative", zIndex: 1 }}>
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: "linear-gradient(135deg, rgba(255,193,7,0.22), rgba(255,107,53,0.22))",
                      backdropFilter: "blur(8px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      border: "1px solid rgba(255,193,7,0.18)",
                    }}
                  >
                    <Map size={22} color="#FFC107" />
                  </motion.div>
                  <Column style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: 19,
                        fontWeight: 900,
                        color: "white",
                        lineHeight: 1.2,
                        margin: "0 0 4px",
                        letterSpacing: -0.3,
                      }}
                    >
                      {localTour.title || t("aiPlanner.yourPlan")}
                    </h3>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                      {t("aiPlanner.stopsCity", { n: stops.length })}
                    </p>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 18, fontWeight: 900, color: "white", margin: "0 0 4px" }}>
                      {formatVnd(localTour.estimated_cost)}
                    </p>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        padding: "2px 8px",
                        borderRadius: 12,
                        backgroundColor: "rgba(255,193,7,0.15)",
                        color: "#FFC107",
                        fontWeight: 800,
                        fontSize: 12,
                      }}
                    >
                      <Zap size={10} fill="currentColor" />+{totalXp} XP
                    </span>
                  </Column>
                </Row>
              </Column>
            </Column>

            {/* Two-column layout */}
            <Row style={{ gap: 16, alignItems: "flex-start" }}>
              {/* Left: timeline */}
              <Column style={{ flex: "0 0 460px" }}>
                {stops.map((stop, i) => (
                  <StopCard
                    key={stop.id ?? `${stop.name}-${i}`}
                    stop={stop}
                    index={i}
                    total={stops.length}
                    active={activeStop === i}
                    swapping={swapping === i}
                    onHover={() => setActiveStop(i)}
                    onLeave={() => setActiveStop(null)}
                    onSwap={() => handleSwap(i)}
                    onRemove={() => handleRemove(i)}
                  />
                ))}
              </Column>

              {/* Right: map + stats */}
              <Column
                style={{
                  flex: 1,
                  gap: 12,
                  position: "sticky",
                  top: 0,
                  minWidth: 0,
                }}
              >
                <Column style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)" }}>
                  <TourMap stops={liveStops} mapId="ai-planner-result-map" height={260} zoom={13} />
                </Column>

                <Grid style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: t("aiPlanner.statTotalStops"), value: t("aiPlanner.statPlaces", { n: stops.length }), color: "#ff6b35", emoji: "📍" },
                    { label: t("aiPlanner.statDuration"), value: formatDuration(localTour.estimated_duration), color: "#FF9500", emoji: "⏱️" },
                    { label: t("aiPlanner.statBudget"), value: formatVnd(localTour.estimated_cost), color: "#34C759", emoji: "💰" },
                    { label: t("aiPlanner.statXp"), value: `+${totalXp} XP`, color: "#A855F7", emoji: "⚡" },
                  ].map(({ label, value, color, emoji }) => (
                    <Column
                      key={label}
                      style={{
                        backgroundColor: "rgba(255,255,255,0.85)",
                        backdropFilter: "blur(8px)",
                        borderRadius: 16,
                        padding: "14px 16px",
                        border: "1px solid rgba(0,0,0,0.04)",
                      }}
                    >
                      <Row vertical="center" style={{ gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 13 }}>{emoji}</span>
                        <p
                          style={{
                            fontSize: 9,
                            color: "#8E8E93",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            margin: 0,
                          }}
                        >
                          {label}
                        </p>
                      </Row>
                      <p style={{ fontSize: 16, fontWeight: 900, color, margin: 0 }}>{value}</p>
                    </Column>
                  ))}
                </Grid>

                <Row
                  vertical="center"
                  style={{
                    gap: 6,
                    fontSize: 11,
                    color: "#34C759",
                    fontWeight: 700,
                    padding: "8px 12px",
                  }}
                >
                  {t("aiPlanner.savedAsTour")}
                </Row>
              </Column>
            </Row>

            {/* Actions */}
            <Row style={{ gap: 10, paddingBottom: 8 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onRegen}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 20px",
                  borderRadius: 16,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1C1C1E",
                  backgroundColor: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(8px)",
                  border: "1.5px solid rgba(0,0,0,0.06)",
                  cursor: "pointer",
                }}
              >
                <RotateCcw size={14} /> {t("aiPlanner.regenerate")}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 20px",
                  borderRadius: 16,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#636366",
                  backgroundColor: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(8px)",
                  border: "1.5px solid rgba(0,0,0,0.06)",
                  cursor: "pointer",
                }}
              >
                <Send size={14} /> {t("aiPlanner.share")}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const ids = stops.filter((s) => s.id).map((s) => s.id).join(",");
                  try { localStorage.setItem("tastemap_ai_plan", JSON.stringify(stops)); } catch {}
                  router.push(`/explore${ids ? `?spots=${ids}` : ""}`);
                }}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "13px 20px",
                  borderRadius: 16,
                  fontSize: 15,
                  fontWeight: 800,
                  color: "white",
                  background: "linear-gradient(135deg, #FF6B35, #A855F7)",
                  boxShadow: "0 8px 24px rgba(255,107,53,0.28)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Map size={15} /> {t("aiPlanner.viewOnMap")}
              </motion.button>
            </Row>
          </motion.div>
        </Column>
      </Column>
    </Column>
  );
}
