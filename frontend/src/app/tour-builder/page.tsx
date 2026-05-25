"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Column,
  Row,
  Heading,
  Text,
  Button,
  IconButton,
} from "@/components/OnceUI";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  PanInfo,
} from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Sparkles,
  Clock,
  DollarSign,
  Undo2,
  Map as MapIcon,
  Users,
  Activity,
  X,
  Star,
  Navigation2,
  Timer,
  Zap,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { ItineraryStop } from "@/app/ai-planner/components/types";

// Tour Builder tokens & components
import { surface, accent, text, border, radius, shadow } from "./tokens";
import { StatPill, RouteChip } from "./components";
import { StopCard } from "./components/StopCard";
import { TourSkeleton, EmptyState } from "./components/TourSkeleton";
import ClientOnly from "@/components/common/ClientOnly";
import { useUserVector } from "@/context/UserVectorContext";
import { FloatingInsight, FlavorAura } from "@/components/FloatingInsight";
import { useAuth } from "@/hooks/useAuth";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { toast } from "sonner";
import { useTourBuilderStore, TourNode } from "@/store/useTourBuilderStore";

const MapWidget = dynamic(() => import("@/components/MapWidget"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: surface.page,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: radius.full,
          border: `2px solid ${border.medium}`,
          borderTopColor: accent.primary,
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  ),
});

// ──── Constants ──────────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  "Mapping your taste profile...",
  "Finding hidden gems nearby...",
  "Curating the perfect route...",
  "Calculating travel times...",
  "Personalizing your tour...",
  "Almost ready to launch!",
];

const PARTICLES = Array.from({ length: 20 }, () => ({
  x0: Math.random() * 1200 - 600,
  y0: Math.random() * 800 - 400,
  x1: Math.random() * 1200 - 600,
  y1: Math.random() * 800 - 400,
  dur: 3 + Math.random() * 4,
}));

// ──── Helpers ────────────────────────────────────────────────────────────────

/** Map raw feed card schema → TourNode for the Zustand store. */
function mapFeedCardToTourNode(card: any, index: number): TourNode {
  return {
    id: String(card.id),
    venue_id: card.id,
    title: card.name,
    subtitle: `${card.category ?? "Place"} • ${card.address ?? "HCM City"}`,
    tags: card.tags ?? [],
    match: card.match_percent ?? Math.floor(80 + (index % 19)),
    distance: card.distance_km ? `${card.distance_km.toFixed(1)}km` : "—",
    price: card.price_range ?? "$$",
    img:
      card.image_url ??
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=900&fit=crop",
    color: index % 2 === 0 ? "#FF6B35" : "#2A9D8F",
    location: [card.lat ?? 10.897, card.lng ?? 106.772],
    time_spent: 45,
    order_index: index,
    rating: card.rating,
    reviews_preview: card.reviews_preview,
  };
}

// ──── Page ───────────────────────────────────────────────────────────────────

export default function TourBuilderPage() {
  const {
    deckQueue: deck,
    tourDraft,
    nextCursor,
    hasMore,
    lastDiscarded,
    appendDeckQueue,
    setDeckQueue,
    setNextCursor,
    setHasMore,
    popDeckQueue,
    setLastDiscarded,
    undoDiscard,
    addToTourDraft,
    removeFromTourDraft,
    status,
    setStatus,
    resetTour,
  } = useTourBuilderStore();

  const router = useRouter();
  const { user } = useAuth();
  const { radarData, isPulsing, updateVector, flushSwipeQueue } = useUserVector();

  const [isTourReady, setIsTourReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [discardDir, setDiscardDir] = useState<"left" | "right" | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Card Fetching ──

  const fetchCards = useCallback(
    async (cursor: string | null = null) => {
      if (!hasMore && cursor !== null) return;
      try {
        if (!cursor) setStatus("loading");
        const url = `/api/v1/feed/cards?category=food&limit=10${cursor ? `&cursor=${cursor}` : ""}`;
        const res = await apiGet<{ cards: any[]; next_cursor: string | null; has_more: boolean }>(url);
        const mapped = res.cards.map((c, i) => mapFeedCardToTourNode(c, (deck.length || 0) + i));

        if (cursor) {
          appendDeckQueue(mapped);
        } else {
          setDeckQueue(mapped);
        }

        setNextCursor(res.next_cursor);
        setHasMore(res.has_more);
        setStatus("idle");
      } catch (error: any) {
        setStatus("error");
        toast.error("Failed to fetch venues: " + (error?.message ?? "Unknown error"));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasMore]
  );

  // Initial load
  useEffect(() => {
    if (deck.length === 0 && status === "idle") {
      fetchCards(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-fetch when deck is running low
  useEffect(() => {
    if (deck.length < 5 && hasMore && status === "idle") {
      fetchCards(nextCursor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck.length, hasMore, status]);

  // ── Swipe Actions ──

  const activeCard = deck[0] ?? null;
  const activeColor = activeCard?.color ?? "#ff6b35";

  // Auto-dismiss undo toast after 5s
  useEffect(() => {
    if (lastDiscarded) {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => setLastDiscarded(null), 5000);
    }
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, [lastDiscarded, setLastDiscarded]);

  const handleUndo = useCallback(() => {
    if (!lastDiscarded) return;
    undoDiscard();
  }, [lastDiscarded, undoDiscard]);

  /**
   * Skip: swipe LEFT — vector learns −α·P. Card not added to draft.
   */
  const handleSkip = useCallback(() => {
    if (!activeCard) return;
    const card = activeCard;
    updateVector(card.venue_id, card.tags, "skip");
    setDiscardDir("left");
    setTimeout(() => {
      popDeckQueue();
      setDiscardDir(null);
      setLastDiscarded(card);
    }, 300);
  }, [activeCard, updateVector, popDeckQueue, setLastDiscarded]);

  /**
   * Like: swipe RIGHT — vector learns +α·P. Card not added to draft.
   */
  const handleLike = useCallback(() => {
    if (!activeCard) return;
    const card = activeCard;
    updateVector(card.venue_id, card.tags, "select");
    setDiscardDir("right");
    setTimeout(() => {
      popDeckQueue();
      setDiscardDir(null);
    }, 300);
  }, [activeCard, updateVector, popDeckQueue]);

  /**
   * Super Like (★): vector learns +α·P AND adds to tourDraft.
   * Doc ref: discovery_swipe.md §3.1 — Super Like IS a Like.
   */
  const handleSuperLike = useCallback(() => {
    if (!activeCard) return;
    const card = activeCard;
    updateVector(card.venue_id, card.tags, "select"); // same as Like
    addToTourDraft(card);
    setDiscardDir("right");
    setTimeout(() => {
      popDeckQueue();
      setDiscardDir(null);
    }, 300);
    toast.success(`★ ${card.title} added to your tour!`);
  }, [activeCard, updateVector, addToTourDraft, popDeckQueue]);

  // Drag gesture
  const x = useMotionValue(0);
  const leftGlowOpacity = useTransform(x, [0, -150], [0, 1]);
  const rightGlowOpacity = useTransform(x, [0, 150], [0, 1]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      const THRESHOLD = 140;
      if (offset.x > THRESHOLD || velocity.x > 500) {
        handleLike();
        return;
      }
      if (offset.x < -THRESHOLD || velocity.x < -500) {
        handleSkip();
        return;
      }
    },
    [handleLike, handleSkip]
  );

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGenerating || isTourReady) return;
      if (e.key === "ArrowRight") handleLike();
      if (e.key === "ArrowLeft") handleSkip();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleLike, handleSkip, isGenerating, isTourReady]);

  // ── Tour Finalization ──

  /**
   * Build My Tour:
   * 1. Flush pending swipe batch
   * 2. POST /api/v1/tours/
   * 3. POST /api/v1/tours/{id}/stops concurrently via Promise.all()
   * 4. POST /api/v1/tours/{id}/optimize
   * 5. Render tour map view
   *
   * Doc ref: discovery_swipe.md §4.1
   */
  const handleFinalizeTour = useCallback(async () => {
    if (tourDraft.length === 0) {
      toast.warning("Star at least 1 location to build a tour! ★");
      return;
    }

    setIsGenerating(true);

    try {
      // Step 1: Flush remaining swipes before saving tour
      await flushSwipeQueue();

      // Step 2: Create tour entity
      const tour = await apiPost<{ id: number }>("/api/v1/tours/", {});

      // Step 3: Add all stops CONCURRENTLY — Promise.all avoids N×round-trip waterfall
      await Promise.all(
        tourDraft.map((stop) =>
          apiPost(`/api/v1/tours/${tour.id}/stops`, { location_id: stop.venue_id })
        )
      );

      // Step 4: Optimize route
      await apiPost(`/api/v1/tours/${tour.id}/optimize`, {
        start_lat: tourDraft[0]?.location[0] ?? 10.897,
        start_lng: tourDraft[0]?.location[1] ?? 106.772,
      });

      // Step 5: Render result
      setIsGenerating(false);
      setIsTourReady(true);
    } catch (error: any) {
      setIsGenerating(false);
      toast.error("Failed to build tour: " + (error?.message ?? "Unknown error"));
    }
  }, [tourDraft, flushSwipeQueue]);

  // Rotate loading messages
  useEffect(() => {
    if (!isGenerating) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // ── Tour DNA (based on tourDraft tags) ──

  const tourDNA = React.useMemo(() => {
    if (tourDraft.length === 0)
      return [{ label: "Empty", value: 100, color: "rgba(0,0,0,0.05)" }];

    const tagCounts: Record<string, number> = {};
    tourDraft.forEach((node) => {
      node.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const total = Object.values(tagCounts).reduce((a, b) => a + b, 0);
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([label, count], i) => ({
        label,
        value: (count / total) * 100,
        color: i === 0 ? accent.primary : i === 1 ? accent.secondary : accent.warning,
      }));
  }, [tourDraft]);

  // ────────────────────────────────────────────────────────────────────────────
  // TOUR READY VIEW
  // ────────────────────────────────────────────────────────────────────────────

  if (isTourReady) {
    const stops = tourDraft;
    const totalMinutes = stops.length * 45;
    // Route line: [lon, lat] order for Mapbox
    const tourRouteCoords: [number, number][] = stops.map((n) => [n.location[1], n.location[0]]);
    const tourSpotIndexMap = new Map(stops.map((n, i) => [n.venue_id, i + 1]));
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const durationLabel = hrs > 0 ? `${hrs}h ${mins > 0 ? `${mins}m` : ""}` : `${mins}m`;
    const totalXP = stops.reduce((sum, s) => sum + s.match, 0);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          backgroundColor: surface.page,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Row
          fillWidth
          vertical="center"
          style={{
            padding: "16px 28px",
            justifyContent: "space-between",
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(32px)",
            borderBottom: `1px solid ${border.subtle}`,
            flexShrink: 0,
          }}
        >
          <Row vertical="center" style={{ gap: 12 }}>
            <button
              onClick={() => {
                setIsTourReady(false);
                resetTour();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 12,
                backgroundColor: "rgba(0,0,0,0.05)",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                color: text.primary,
                fontFamily: "inherit",
              }}
            >
              <RotateCcw size={14} /> Start Over
            </button>
          </Row>
          <Heading variant="heading-strong-m" style={{ color: text.primary }}>
            🗺 Your Flavor Journey
          </Heading>
          <Row style={{ gap: 10 }}>
            <button
              onClick={() => {
                const ids = stops.map((n) => n.venue_id).join(",");
                const planData: ItineraryStop[] = stops.map((n) => ({
                  id: n.venue_id,
                  name: n.title,
                  lat: n.location[0],
                  lng: n.location[1],
                  category: n.subtitle,
                  emoji: "📍",
                  xp: n.match,
                  time: "",
                  accent: n.color,
                  cost: n.price,
                  address: n.subtitle,
                  img: n.img,
                  reason: n.subtitle,
                  travelToNext: n.distance,
                }));
                try { localStorage.setItem("tastemap_ai_plan", JSON.stringify(planData)); } catch {}
                router.push(`/explore?spots=${ids}`);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 24px",
                borderRadius: 12,
                background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})`,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 800,
                color: "white",
                boxShadow: `0 4px 16px ${accent.primary}50`,
              }}
            >
              <Navigation2 size={14} /> Start Tour
            </button>
          </Row>
        </Row>

        {/* Body: Map + Sidebar */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Map */}
          <div style={{ flex: "1 1 60%", position: "relative", minWidth: 0 }}>
            <ClientOnly>
              <MapWidget
                mapId="tour-final-map"
                spots={stops.map((n) => ({
                  id: n.venue_id,
                  name: n.title,
                  lat: n.location[0],
                  lon: n.location[1],
                  category: "place",
                  emoji: "📍",
                  accent: n.color,
                  rating: n.rating ?? 5,
                  reviewCount: 0,
                  priceLevel: 2,
                  isOpen: true,
                  closesAt: "",
                  distance: n.distance,
                  img: n.img,
                  description: n.subtitle,
                  tags: n.tags
                }))}
                center={(stops[0]?.location ?? [10.897, 106.772]) as [number, number]}
                zoom={13}
                routeCoords={tourRouteCoords.length >= 2 ? tourRouteCoords : undefined}
                planSpotIndexMap={tourSpotIndexMap.size > 0 ? tourSpotIndexMap : undefined}
              />
            </ClientOnly>
            {/* Stat pills */}
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: 20,
                display: "flex",
                gap: 8,
                zIndex: 10,
              }}
            >
              {[
                { icon: <MapPin size={13} />, label: `${stops.length} Stops` },
                { icon: <Timer size={13} />, label: durationLabel },
                { icon: <Zap size={13} />, label: `+${totalXP} XP` },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "6px 12px",
                    borderRadius: 20,
                    backgroundColor: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(16px)",
                    border: `1px solid ${border.subtle}`,
                    fontSize: 11,
                    fontWeight: 800,
                    color: text.primary,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  {s.icon}
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
            style={{
              width: 360,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              backgroundColor: surface.elevated,
              borderLeft: `1px solid ${border.subtle}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 24px 14px",
                borderBottom: `1px solid ${border.subtle}`,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  fontWeight: 900,
                  color: accent.primary,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                }}
              >
                Route Itinerary
              </p>
              <h3
                style={{
                  margin: "4px 0 0",
                  fontSize: 16,
                  fontWeight: 900,
                  color: text.primary,
                  letterSpacing: "-0.4px",
                }}
              >
                Today&apos;s Flavor Journey
              </h3>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              {stops.map((stop, i) => (
                <React.Fragment key={stop.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      padding: "12px 0",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: stop.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: 12,
                        fontWeight: 900,
                        color: "white",
                        marginTop: 4,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 12,
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={stop.img}
                        alt={stop.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          fontWeight: 800,
                          color: text.primary,
                          letterSpacing: "-0.3px",
                        }}
                      >
                        {stop.title}
                      </p>
                      <p
                        style={{ margin: "2px 0 6px", fontSize: 11, color: text.tertiary }}
                      >
                        {stop.subtitle}
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            fontSize: 10,
                            fontWeight: 700,
                            color: text.secondary,
                          }}
                        >
                          <Clock size={10} /> ~45m
                        </span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            fontSize: 10,
                            fontWeight: 700,
                            color: accent.warning,
                          }}
                        >
                          <Sparkles size={10} /> {stop.match}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                  {i < stops.length - 1 && (
                    <div
                      style={{
                        marginLeft: 14,
                        width: 1,
                        height: 16,
                        background: `linear-gradient(to bottom, ${border.medium}, transparent)`,
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div
              style={{
                padding: "16px 24px",
                borderTop: `1px solid ${border.subtle}`,
                backgroundColor: surface.base,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {[
                  { label: "Duration", value: durationLabel, color: accent.secondary },
                  { label: "Stops", value: `${stops.length}`, color: "#059669" },
                  { label: "XP Earned", value: `+${totalXP}`, color: accent.warning },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: s.color }}>
                      {s.value}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: 9,
                        fontWeight: 700,
                        color: text.muted,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // SWIPE ENGINE VIEW
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <Column
      fillHeight
      gap={0}
      style={{
        flex: 1,
        backgroundColor: "#F8FAFF",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        paddingBottom: "0",
        paddingTop: "0",
        justifyContent: "space-between",
      }}
    >
      {/* Ambient colour glow from current card */}
      <AnimatePresence>
        <motion.div
          key={activeColor}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 50% 50%, ${activeColor}, transparent 70%)`,
            filter: "blur(100px)",
            pointerEvents: "none",
          }}
        />
      </AnimatePresence>

      {/* ── TOP BAR ── */}
      <div style={{ width: "100%", zIndex: 100, flexShrink: 0 }}>
        <Row
          fillWidth
          vertical="center"
          style={{
            height: "80px",
            justifyContent: "space-between",
            paddingLeft: "40px",
            paddingRight: "40px",
            backgroundColor: "rgba(255, 255, 255, 0.65)",
            backdropFilter: "blur(32px) saturate(180%)",
            borderBottom: `1px solid rgba(0,122,255,0.08)`,
            borderRadius: "0 0 32px 32px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.02)",
            gap: "24px",
          }}
        >
          {/* Left: Back nav */}
          <Row style={{ flex: 1, alignItems: "center", gap: "16px" }}>
            <Link href="/discover">
              <Row
                vertical="center"
                style={{
                  height: "44px",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  borderRadius: "16px",
                  backgroundColor: "rgba(255,255,255,0.4)",
                  border: `1px solid rgba(0,122,255,0.1)`,
                  cursor: "pointer",
                  gap: "8px",
                }}
              >
                <ChevronLeft size={18} color={accent.primary} strokeWidth={2.5} />
                <Text style={{ fontWeight: 800, color: accent.primary, fontSize: "0.9rem" }}>
                  Discover
                </Text>
              </Row>
            </Link>
          </Row>

          {/* Centre: AI pill */}
          <Row horizontal="center" style={{ flex: 2, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "6px 28px 6px 14px",
                backgroundColor: "rgba(255,255,255,0.45)",
                borderRadius: "100px",
                border: `1px solid rgba(0,122,255,0.15)`,
                width: "100%",
                maxWidth: "560px",
                boxShadow: "0 4px 20px rgba(0,122,255,0.08)",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                <ClientOnly>
                  <FlavorAura data={radarData} isPulsing={isPulsing} size={30} />
                </ClientOnly>
              </div>
              <Column style={{ gap: "1px", minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: "0.6rem",
                    fontWeight: 900,
                    color: accent.primary,
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                  }}
                >
                  AI Thought Engine · Learning
                </Text>
                <Text
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: text.primary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {tourDraft.length === 0
                    ? "Swipe to start training your taste profile..."
                    : `${tourDraft.length} stop${tourDraft.length > 1 ? "s" : ""} pinned — keep swiping!`}
                </Text>
              </Column>
            </div>
          </Row>

          {/* Right: user info */}
          <Row horizontal="end" style={{ flex: 1, alignItems: "center", gap: "16px" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "50%",
                  padding: "2px",
                  background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})`,
                  boxShadow: "0 4px 12px rgba(0,122,255,0.2)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid white",
                  }}
                >
                  <img
                    src={user?.avatar_url || ""}
                    alt={user?.display_name || "User"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>
            </div>
          </Row>
        </Row>
      </div>

      {/* ── SWIPE STAGE ── */}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          flexGrow: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* Skip glow (left) */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background: "radial-gradient(circle at left, rgba(255,100,100,0.35) 0%, transparent 55%)",
            opacity: leftGlowOpacity,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingLeft: "80px",
            pointerEvents: "none",
          }}
        >
          <Column horizontal="center" style={{ gap: 16 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "rgba(255,100,100,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgba(255,100,100,0.25)",
              }}
            >
              <X size={40} color="rgba(255,100,100,0.8)" strokeWidth={3} />
            </div>
            <Text style={{ fontSize: "1rem", fontWeight: 900, color: "rgba(255,100,100,0.8)", letterSpacing: "4px" }}>
              SKIP
            </Text>
          </Column>
        </motion.div>

        {/* Like glow (right) */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background: `radial-gradient(circle at right, ${accent.primary}25 0%, transparent 55%)`,
            opacity: rightGlowOpacity,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: "80px",
            pointerEvents: "none",
          }}
        >
          <Column horizontal="center" style={{ gap: 16 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: `${accent.primary}10`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${accent.primary}25`,
              }}
            >
              <Star size={40} color={accent.primary} fill={accent.primary} strokeWidth={2.5} />
            </div>
            <Text style={{ fontSize: "1rem", fontWeight: 900, color: accent.primary, letterSpacing: "4px" }}>
              LIKE
            </Text>
          </Column>
        </motion.div>

        {/* Card + Star overlay */}
        <motion.div
          drag="x"
          style={{ x, zIndex: 10, position: "relative", width: "760px", height: "480px" }}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          onDragEnd={handleDragEnd}
        >
          <AnimatePresence>
            {status === "loading" ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
              >
                <TourSkeleton />
              </motion.div>
            ) : deck.length > 0 ? (
              <div
                key="cards"
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Next card (slightly behind) */}
                {deck[1] && (
                  <motion.div
                    key={`bg-${deck[1].id}`}
                    initial={{ scale: 0.94, opacity: 0 }}
                    animate={{ scale: 0.94, y: -20, opacity: 0.15 }}
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      zIndex: 1,
                      borderRadius: "48px",
                      overflow: "hidden",
                      backgroundColor: "white",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                    }}
                  >
                    <StopCard card={deck[1] as any} />
                    <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.4)", backdropFilter: "blur(4px)" }} />
                  </motion.div>
                )}

                {/* Top card with Star button overlay */}
                <div
                  style={{
                    perspective: "2000px",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 5,
                    position: "relative",
                  }}
                >
                  <StopCard card={deck[0] as any} />

                  {/* ★ Star / Super Like button — Option B: overlaid on card */}
                  <motion.button
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSuperLike();
                    }}
                    style={{
                      position: "absolute",
                      bottom: 24,
                      right: 24,
                      zIndex: 20,
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `linear-gradient(135deg, #F59E0B, #D97706)`,
                      boxShadow: "0 6px 24px rgba(245,158,11,0.45)",
                      fontFamily: "inherit",
                    }}
                    title="Super Like — Add to Tour"
                  >
                    <Star size={22} color="white" fill="white" />
                  </motion.button>

                  {/* Undo toast */}
                  <AnimatePresence>
                    {lastDiscarded && (
                      <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 24 }}
                        style={{
                          position: "absolute",
                          bottom: 24,
                          left: "50%",
                          transform: "translateX(-50%)",
                          zIndex: 30,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 18px",
                          borderRadius: 100,
                          backgroundColor: "rgba(30,30,30,0.9)",
                          backdropFilter: "blur(12px)",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                          cursor: "pointer",
                        }}
                        onClick={handleUndo}
                      >
                        <Undo2 size={14} color="white" />
                        <Text style={{ color: "white", fontSize: "0.8rem", fontWeight: 700 }}>
                          Undo skip
                        </Text>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EmptyState filledCount={tourDraft.length} totalCount={0} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── FOOTER CONTROLS ── */}
      <div
        style={{
          width: "100%",
          zIndex: 100,
          flexShrink: 0,
          padding: "8px 60px",
          backgroundColor: "white",
          borderTop: `1px solid rgba(0,0,0,0.08)`,
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 -10px 40px rgba(0,0,0,0.04)",
        }}
      >
        <Row
          fillWidth
          vertical="center"
          style={{ height: "100px", gap: "48px", justifyContent: "space-between" }}
        >
          {/* Left: Tour Draft counter */}
          <Row style={{ gap: "20px", alignItems: "center", width: "380px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                padding: "8px 20px",
                backgroundColor: tourDraft.length > 0 ? "#FFF7ED" : "#F0F9FF",
                borderRadius: "16px",
                border: `1px solid ${tourDraft.length > 0 ? "#F59E0B20" : `${accent.primary}20`}`,
              }}
            >
              <Row vertical="center" style={{ gap: "8px" }}>
                <Star size={16} color={tourDraft.length > 0 ? "#D97706" : accent.primary} fill={tourDraft.length > 0 ? "#D97706" : "none"} />
                <Text
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 900,
                    color: tourDraft.length > 0 ? "#D97706" : accent.primary,
                  }}
                >
                  {tourDraft.length} PINNED
                </Text>
              </Row>
              <Text
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: "rgba(0,0,0,0.4)",
                  textAlign: "center",
                }}
              >
                TOUR DRAFT
              </Text>
            </div>
            <div style={{ width: "1px", height: "32px", backgroundColor: "rgba(0,0,0,0.08)" }} />
            <Column style={{ gap: "4px" }}>
              <Text style={{ fontSize: "0.85rem", fontWeight: 900, color: text.primary }}>
                {deck.length} CARDS LEFT
              </Text>
              <Text style={{ fontSize: "0.6rem", fontWeight: 600, color: "rgba(0,0,0,0.4)", textTransform: "uppercase" }}>
                Open-ended Exploration
              </Text>
            </Column>
          </Row>

          {/* Centre: Action buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "8px 16px",
              backgroundColor: "rgba(0,0,0,0.03)",
              borderRadius: "100px",
              border: "2px solid rgba(0,0,0,0.05)",
            }}
          >
            {/* Undo */}
            <IconButton
              icon={<Undo2 size={22} color="white" />}
              onClick={handleUndo}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: lastDiscarded ? "#64748B" : "rgba(0,0,0,0.12)",
                cursor: lastDiscarded ? "pointer" : "default",
                padding: 0,
              }}
            />
            {/* Skip */}
            <Button
              onClick={handleSkip}
              style={{
                borderRadius: "30px",
                backgroundColor: "#F3E8FF",
                color: "#7E22CE",
                border: "none",
                fontWeight: 900,
                padding: "0 28px",
                height: "48px",
              }}
            >
              SKIP
            </Button>
            {/* Like */}
            <Button
              onClick={handleLike}
              style={{
                borderRadius: "30px",
                backgroundColor: accent.primary,
                color: "white",
                fontWeight: 900,
                padding: "0 28px",
                height: "48px",
              }}
            >
              LIKE
            </Button>
            {/* Build Tour */}
            <motion.button
              whileHover={tourDraft.length > 0 ? { scale: 1.04 } : {}}
              onClick={handleFinalizeTour}
              style={{
                padding: "0 20px",
                height: "48px",
                borderRadius: "30px",
                border: "none",
                cursor: tourDraft.length > 0 ? "pointer" : "default",
                fontSize: 13,
                fontWeight: 900,
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: 7,
                background:
                  tourDraft.length > 0
                    ? `linear-gradient(135deg, #10B981, #059669)`
                    : "rgba(0,0,0,0.1)",
                boxShadow: tourDraft.length > 0 ? "0 4px 16px rgba(16,185,129,0.4)" : "none",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              <CheckCircle2 size={16} />
              BUILD TOUR
            </motion.button>
          </div>

          {/* Right: Tour DNA bar */}
          <Row style={{ gap: "24px", alignItems: "center", width: "380px", justifyContent: "flex-end" }}>
            <Column style={{ gap: "8px", width: "180px" }}>
              <Row vertical="center" style={{ width: "100%", justifyContent: "space-between" }}>
                <Text style={{ fontSize: "0.65rem", fontWeight: 850 }}>TOUR DNA PROFILE</Text>
                <Text style={{ fontSize: "0.6rem", color: accent.secondary, fontWeight: 800 }}>LIVE</Text>
              </Row>
              <div
                style={{
                  width: "100%",
                  height: "12px",
                  backgroundColor: "rgba(0,0,0,0.05)",
                  borderRadius: "6px",
                  overflow: "hidden",
                  display: "flex",
                }}
              >
                {tourDNA.map((seg) => (
                  <motion.div
                    key={seg.label}
                    initial={{ width: 0 }}
                    animate={{ width: `${seg.value}%` }}
                    style={{ height: "100%", backgroundColor: seg.color }}
                  />
                ))}
              </div>
            </Column>
            <div
              style={{
                width: "150px",
                height: "80px",
                borderRadius: "16px",
                backgroundColor: "#F8FAFF",
                border: `1px solid rgba(0,0,0,0.06)`,
                overflow: "hidden",
              }}
            >
              <ClientOnly>
                <MapWidget
                  mapId="tour-curation-footer"
                  spots={tourDraft.map((n) => ({
                    id: n.venue_id,
                    name: n.title,
                    lat: n.location[0],
                    lon: n.location[1],
                    category: "place",
                    emoji: "📍",
                    accent: n.color,
                    rating: 5,
                    reviewCount: 0,
                    priceLevel: 2,
                    isOpen: true,
                    closesAt: "",
                    distance: n.distance,
                    img: n.img,
                    description: n.subtitle,
                    tags: n.tags
                  }))}
                  center={(activeCard ? activeCard.location : [10.897, 106.772]) as [number, number]}
                  zoom={14}
                  showBanner={false}
                />
              </ClientOnly>
            </div>
          </Row>
        </Row>
      </div>

      {/* ── GENERATING OVERLAY ── */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)", transition: { duration: 0.8 } }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(80px) saturate(180%)",
              overflow: "hidden",
            }}
          >
            {PARTICLES.map((p, i) => (
              <motion.div
                key={i}
                initial={{ x: p.x0, y: p.y0, opacity: 0 }}
                animate={{ x: [null, p.x1], y: [null, p.y1], opacity: [0, 0.4, 0] }}
                transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  backgroundColor: accent.primary,
                  boxShadow: `0 0 10px ${accent.primary}`,
                  zIndex: 0,
                }}
              />
            ))}
            <div style={{ position: "relative", zIndex: 10 }}>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Activity size={64} color={accent.primary} style={{ filter: `drop-shadow(0 0 20px ${accent.primary}40)` }} />
              </motion.div>
            </div>
            <Column horizontal="center" style={{ gap: "16px", marginTop: "40px", zIndex: 10, width: "100vw" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={loadingMessage}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Heading
                    variant="display-strong-s"
                    style={{
                      textAlign: "center",
                      background: `linear-gradient(90deg, ${text.primary}, ${accent.primary}, ${text.primary})`,
                      backgroundSize: "200% auto",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {loadingMessage}
                  </Heading>
                </motion.div>
              </AnimatePresence>
            </Column>
          </motion.div>
        )}
      </AnimatePresence>
    </Column>
  );
}
