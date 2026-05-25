"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ItineraryStop } from "@/app/ai-planner/components/types";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  LocateFixed,
  Minus,
  Plus,
  Search,
  SearchX,
  SlidersHorizontal,
  Star,
  X,
  Layers,
  Map as MapIcon,
  Maximize,
  Minimize,
  Building2,
} from "lucide-react";

import { useFeedCards, FeedCard } from "@/hooks/useFeedCards";
import { CATEGORIES, PRICE_ICONS } from "./data";
import type { Spot } from "./types";
import { CATEGORY_ICONS } from "./ui-constants";
import SpotCard from "./components/SpotCard";
import DetailOverlay from "./components/DetailOverlay";
import { tokens } from "@/styles/tokens";
import { H3, Body, BodySm, Caption } from "@/components/ui";

const MapWidget = dynamic(() => import("@/components/MapWidget"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#F2F2F7] flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-[#E5E5EA] border-t-[#ff6b35] animate-spin" />
    </div>
  ),
});

const FALLBACK_CENTER: [number, number] = [10.899, 106.774];
const MIN_MAP_ZOOM = 3;
const MAX_MAP_ZOOM = 19;
const RIGHT_PANEL_WIDTH = 360;
const RIGHT_PANEL_COLLAPSED_WIDTH = 48;
const RIGHT_PANEL_OPEN_SHADOW = "-12px 0 28px rgba(15,23,42,0.14)";
const RIGHT_PANEL_COLLAPSED_SHADOW = "-8px 0 18px rgba(15,23,42,0.1)";

function toLocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission denied.";
    case error.POSITION_UNAVAILABLE:
      return "GPS signal unavailable.";
    case error.TIMEOUT:
      return "Location request timed out.";
    default:
      return "Could not determine your location.";
  }
}

// Helper to transform FeedCard to Spot format
function feedCardToSpot(card: FeedCard): Spot {
  return {
    id: card.id,
    name: card.name,
    category: card.category === "food" ? "Vietnamese" : "Place", // Simplified mapping
    emoji: card.category === "food" ? "🍜" : "📍",
    accent: "#ff6b35",
    lat: card.lat ?? 10.897,
    lon: card.lng ?? 106.772,
    rating: card.rating ?? 0,
    reviewCount: 0, // Not available from feed API
    priceLevel: card.price_range?.includes("$") ? 2 : 1,
    isOpen: true, // Not available from feed API
    closesAt: card.open_hours || "Unknown",
    distance: card.distance_km ? `${card.distance_km.toFixed(1)} km` : "Nearby",
    img: card.image_url || "",
    description:
      card.reviews_preview?.[0] || card.address || "Explore this location",
    tags: card.tags || [card.category || "spot"],
  };
}

export default function ExploreClient() {
  const searchParams = useSearchParams();

  // IDs passed from AI Planner ("?spots=1,2,3")
  const planSpotIds = useMemo(() => {
    const raw = searchParams.get("spots");
    if (!raw) return new Set<number>();
    return new Set(raw.split(",").map(Number).filter(Boolean));
  }, [searchParams]);

  // Use real locations from API
  const {
    cards: feedCards,
    loading: cardsLoading,
    error: cardsError,
  } = useFeedCards({
    type: "food",
    limit: 50,
  });

  // Transform to Spot format
  const spots = useMemo(() => feedCards.map(feedCardToSpot), [feedCards]);

  // Plan spots loaded from localStorage (saved by StepResult before navigation)
  const [planSpots, setPlanSpots] = useState<Spot[]>([]);

  useEffect(() => {
    if (planSpotIds.size === 0) { setPlanSpots([]); return; }
    try {
      const raw = localStorage.getItem("tastemap_ai_plan");
      if (!raw) return;
      const stops = JSON.parse(raw) as ItineraryStop[];
      const ordered = stops
        .filter((s) => s.id && planSpotIds.has(s.id) && s.lat != null && s.lng != null)
        .map((s): Spot => ({
          id: s.id!,
          name: s.name,
          category: s.category,
          emoji: s.emoji,
          accent: "#ff6b35",
          lat: s.lat!,
          lon: s.lng!,
          rating: +(s.xp / 22).toFixed(1),
          reviewCount: 0,
          priceLevel: 1,
          isOpen: true,
          closesAt: s.time,
          distance: s.travelToNext ?? "",
          img: s.img,
          description: s.reason,
          tags: [s.category],
        }));
      setPlanSpots(ordered);
    } catch {}
  }, [planSpotIds]);

  // Fallback: if localStorage had no matching data (group results flow),
  // match against API spots by ID so pins still appear on the map.
  const effectivePlanSpots = useMemo(() => {
    if (planSpots.length > 0) return planSpots;
    if (planSpotIds.size === 0) return [];
    return spots.filter((s) => planSpotIds.has(s.id));
  }, [planSpots, planSpotIds, spots]);

  // Route coordinates and index map derived from effective plan spots
  const planRouteCoords = useMemo(
    (): [number, number][] => effectivePlanSpots.map((s) => [s.lon, s.lat]),
    [effectivePlanSpots],
  );
  const planSpotIndexMap = useMemo(
    () => new Map(effectivePlanSpots.map((s, i) => [s.id, i + 1])),
    [effectivePlanSpots],
  );

  // Extract all unique tags from real data
  const ALL_TAGS = useMemo(
    () => Array.from(new Set(spots.flatMap((s: Spot) => s.tags))).sort(),
    [spots],
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [openOnly, setOpenOnly] = useState(false);
  const [priceMax, setPriceMax] = useState<1 | 2 | 3>(3);
  const [selected, setSelected] = useState<Spot | null>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [userLocationError, setUserLocationError] = useState<string | null>(
    null,
  );
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"recommended" | "rating" | "reviews">(
    "recommended",
  );
  const [hoveredSpotId, setHoveredSpotId] = useState<number | null>(null);
  const didAutoSelectPlan = useRef(false);

  // Map Settings State
  const [mapStyleType, setMapStyleType] = useState<
    "dark" | "satellite" | "light" | "streets"
  >("streets");
  const [show3D, setShow3D] = useState(false);
  const [isMapSettingsOpen, setIsMapSettingsOpen] = useState(false);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (category !== "All") count++;
    if (openOnly) count++;
    if (priceMax !== 3) count++;
    if (selectedTags.size > 0) count++;
    if (minRating > 0) count++;
    if (sortBy !== "recommended") count++;
    return count;
  }, [category, openOnly, priceMax, selectedTags, minRating, sortBy]);

  const clearAllFilters = useCallback(() => {
    setCategory("All");
    setOpenOnly(false);
    setPriceMax(3);
    setSelectedTags(new Set());
    setMinRating(0);
    setSortBy("recommended");
  }, []);

  const getCurrentPosition = useCallback(
    (options: PositionOptions) =>
      new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      }),
    [],
  );

  const detectUserLocation = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setUserLocationError("GPS is unavailable in this browser.");
      return;
    }

    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1";

    if (!window.isSecureContext && !isLocalhost) {
      setUserLocationError("Location requires HTTPS (or localhost).");
      return;
    }

    setIsLocatingUser(true);
    setUserLocationError(null);

    try {
      // First attempt: precise GPS fix.
      const precise = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      setSelected(null);
      setUserLocation([precise.coords.latitude, precise.coords.longitude]);
      setIsLocatingUser(false);
      return;
    } catch (firstError) {
      const geoError = firstError as GeolocationPositionError;

      if (
        geoError.code === geoError.PERMISSION_DENIED ||
        geoError.code === geoError.POSITION_UNAVAILABLE
      ) {
        try {
          // Fallback: less strict + cached location can still place user on map.
          const fallback = await getCurrentPosition({
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 5 * 60 * 1000,
          });

          setSelected(null);
          setUserLocation([
            fallback.coords.latitude,
            fallback.coords.longitude,
          ]);
          setIsLocatingUser(false);
          return;
        } catch (fallbackError) {
          setUserLocationError(
            toLocationErrorMessage(fallbackError as GeolocationPositionError),
          );
          setIsLocatingUser(false);
          return;
        }
      }

      setUserLocationError(toLocationErrorMessage(geoError));
      setIsLocatingUser(false);
    }
  }, [getCurrentPosition]);

  const handleLocateUser = useCallback(() => {
    setSelected(null);
    setManualZoom(MAX_MAP_ZOOM);
    void detectUserLocation();
  }, [detectUserLocation]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void detectUserLocation();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [detectUserLocation]);

  useEffect(() => {
    if (selected) {
      const el = document.getElementById(`spot-card-${selected.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selected]);

  // Auto-select the first plan spot and zoom to plan area
  useEffect(() => {
    if (!didAutoSelectPlan.current && effectivePlanSpots.length > 0) {
      didAutoSelectPlan.current = true;
      setSelected(effectivePlanSpots[0]);
      setManualZoom(14);
    }
  }, [effectivePlanSpots]);

  const filtered = useMemo(() => {
    let result = spots.filter((spot: Spot) => {
      const matchCat = category === "All" || spot.category === category;
      const matchOpen = !openOnly || spot.isOpen;
      const matchPrice = spot.priceLevel <= priceMax;
      const matchRating = spot.rating >= minRating;
      const matchTags =
        selectedTags.size === 0 ||
        spot.tags.some((t: string) => selectedTags.has(t));
      const query = search.trim().toLowerCase();
      const matchQuery =
        !query ||
        spot.name.toLowerCase().includes(query) ||
        spot.category.toLowerCase().includes(query) ||
        spot.tags.some((t: string) => t.toLowerCase().includes(query));

      return (
        matchCat &&
        matchOpen &&
        matchPrice &&
        matchRating &&
        matchTags &&
        matchQuery
      );
    });

    if (sortBy === "rating") {
      result.sort((a: Spot, b: Spot) => b.rating - a.rating);
    } else if (sortBy === "reviews") {
      result.sort((a: Spot, b: Spot) => b.reviewCount - a.reviewCount);
    }

    return result;
  }, [
    category,
    openOnly,
    priceMax,
    minRating,
    selectedTags,
    search,
    sortBy,
    spots,
  ]);

  // Plan spots always visible on map (deduped against filtered)
  const mapSpots = useMemo(() => {
    if (effectivePlanSpots.length === 0) return filtered;
    const planIds = new Set(effectivePlanSpots.map((s) => s.id));
    return [...effectivePlanSpots, ...filtered.filter((s) => !planIds.has(s.id))];
  }, [filtered, effectivePlanSpots]);

  const mapCenter: [number, number] = selected
    ? [selected.lat, selected.lon]
    : (userLocation ?? FALLBACK_CENTER);
  const mapZoomFromContext = selected ? 17 : userLocation ? 16 : 15;
  const mapZoom = Math.max(
    MIN_MAP_ZOOM,
    Math.min(MAX_MAP_ZOOM, manualZoom ?? mapZoomFromContext),
  );

  const setZoomLevel = useCallback((value: number) => {
    const clamped = Math.max(MIN_MAP_ZOOM, Math.min(MAX_MAP_ZOOM, value));
    setManualZoom(clamped);
  }, []);
  const stepZoom = useCallback(
    (delta: number) => {
      setManualZoom((previous) => {
        const base = previous ?? mapZoomFromContext;
        return Math.max(MIN_MAP_ZOOM, Math.min(MAX_MAP_ZOOM, base + delta));
      });
    },
    [mapZoomFromContext],
  );
  const zoomLabel = Number.isInteger(mapZoom)
    ? String(mapZoom)
    : mapZoom.toFixed(2);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <MapWidget
          mapId="explore-main"
          spots={mapSpots}
          center={mapCenter}
          zoom={mapZoom}
          minZoom={MIN_MAP_ZOOM}
          maxZoom={MAX_MAP_ZOOM}
          userLocation={userLocation}
          showBanner={false}
          enableClustering
          mapStyleType={mapStyleType}
          show3D={show3D}
          selectedSpotId={selected?.id ?? null}
          hoveredSpotId={hoveredSpotId}
          onMarkerClick={(spot) => setSelected(spot)}
          onMarkerHover={(spot) => setHoveredSpotId(spot ? spot.id : null)}
          routeCoords={planRouteCoords.length >= 2 ? planRouteCoords : undefined}
          planSpotIndexMap={planSpotIndexMap.size > 0 ? planSpotIndexMap : undefined}
        />

        <AnimatePresence>
          {selected && (
            <DetailOverlay spot={selected} onClose={() => setSelected(null)} />
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          onClick={handleLocateUser}
          className="absolute top-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full"
          style={{
            left: "calc(var(--explore-left-sidebar-width, 0px) + 16px)",
            backgroundColor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            border: userLocationError
              ? "1px solid rgba(220,38,38,0.25)"
              : "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <LocateFixed
            size={14}
            className={isLocatingUser ? "animate-spin" : undefined}
            color={
              userLocationError
                ? "#dc2626"
                : userLocation
                  ? "#0A84FF"
                  : "#8E8E93"
            }
          />
          <span className="text-[12px] font-bold text-[#1C1C1E]">
            {isLocatingUser
              ? "Locating..."
              : userLocationError
                ? userLocationError
                : userLocation
                  ? "You are here"
                  : "Use my location"}
          </span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="absolute z-40 flex flex-col gap-2"
          style={{
            left: "calc(var(--explore-left-sidebar-width, 0px) + 16px)",
            top: "66px",
          }}
        >
          {/* Map Layer Settings Button */}
          <button
            type="button"
            onClick={() => setIsMapSettingsOpen((prev) => !prev)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white relative transition-all"
            title="Map Settings"
            style={{
              backgroundColor: isMapSettingsOpen
                ? "rgba(17,24,39,0.95)"
                : "rgba(17,24,39,0.78)",
              border: "1px solid rgba(255,255,255,0.22)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            }}
          >
            {isMapSettingsOpen ? <X size={18} /> : <Layers size={18} />}
          </button>

          <AnimatePresence>
            {isMapSettingsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -10 }}
                className="absolute left-12 top-0 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 flex flex-row gap-6"
                style={{
                  width: "340px",
                  backdropFilter: "blur(20px)",
                  backgroundColor: "rgba(255,255,255,0.95)",
                }}
              >
                {/* Visual Settings Column */}
                <div className="flex-1 flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-widest">
                      Map Style
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["dark", "light", "streets", "satellite"] as const).map(
                        (style) => (
                          <button
                            key={style}
                            onClick={() => setMapStyleType(style)}
                            className="px-2 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 capitalize transition-all"
                            style={
                              mapStyleType === style
                                ? {
                                    backgroundColor: "#111827",
                                    color: "white",
                                    borderColor: "#111827",
                                  }
                                : {
                                    backgroundColor: "transparent",
                                    color: "#4B5563",
                                    borderColor: "#E5E7EB",
                                  }
                            }
                          >
                            <MapIcon size={12} /> {style}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-widest">
                      Layers
                    </p>
                    <button
                      onClick={() => setShow3D((v) => !v)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between border transition-all"
                      style={
                        show3D
                          ? {
                              backgroundColor: "#ff6b35",
                              color: "white",
                              borderColor: "#ff6b35",
                              boxShadow: "0 4px 10px rgba(255,107,53,0.3)",
                            }
                          : {
                              backgroundColor: "#F9FAFB",
                              color: "#4B5563",
                              borderColor: "#E5E7EB",
                            }
                      }
                    >
                      <span className="flex items-center gap-2">
                        <Building2 size={14} /> 3D Buildings
                      </span>
                      <span className="text-[10px] uppercase">
                        {show3D ? "ON" : "OFF"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-[1px] bg-gray-200" />

                {/* Zoom Controls Column */}
                <div className="flex flex-col items-center justify-between py-1">
                  <button
                    onClick={() => setZoomLevel(MAX_MAP_ZOOM)}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                    title="Max Zoom"
                  >
                    <Maximize size={12} />
                  </button>
                  <button
                    onClick={() => stepZoom(1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 text-white hover:bg-gray-700 transition"
                  >
                    <Plus size={14} />
                  </button>

                  <div className="flex-1 flex items-center justify-center relative my-2 min-h-[60px]">
                    <div className="absolute font-bold text-[10px] text-gray-400 -left-6">
                      z{zoomLabel}
                    </div>
                    <input
                      type="range"
                      min={MIN_MAP_ZOOM}
                      max={MAX_MAP_ZOOM}
                      step={0.25}
                      value={mapZoom}
                      onChange={(e) => setZoomLevel(Number(e.target.value))}
                      className="zoom-slider"
                      style={{
                        transform: "rotate(-90deg)",
                        width: "80px",
                        accentColor: "#111827",
                        cursor: "pointer",
                      }}
                    />
                  </div>

                  <button
                    onClick={() => stepZoom(-1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 text-white hover:bg-gray-700 transition"
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    onClick={() => setZoomLevel(MIN_MAP_ZOOM)}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                    title="Min Zoom"
                  >
                    <Minimize size={12} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <style jsx>{`
          .zoom-slider {
            -webkit-appearance: none;
            background: transparent;
          }
          .zoom-slider::-webkit-slider-runnable-track {
            height: 4px;
            border-radius: 999px;
            background: #e5e7eb;
          }
          .zoom-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #fff;
            border: 3px solid #111827;
            margin-top: -5px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        `}</style>

        {/* ── Floating Filter Panel ── */}
        <AnimatePresence>
          {isFilterPanelOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsFilterPanelOpen(false)}
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.18)",
                  zIndex: 30,
                }}
              />

              {/* Filter Panel (Positioned next to right bar) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: "-47%", x: 20 }}
                animate={{ opacity: 1, scale: 1, y: "-50%", x: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: "-47%", x: 20 }}
                transition={{ type: "spring", damping: 28, stiffness: 340 }}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: `${(isRightPanelOpen ? RIGHT_PANEL_WIDTH : RIGHT_PANEL_COLLAPSED_WIDTH) + 20}px`,
                  width: "min(480px, 90%)",
                  maxHeight: "85vh",
                  overflowY: "auto",
                  zIndex: 35,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(15,23,42,0.08)",
                  boxShadow:
                    "0 20px 60px rgba(15,23,42,0.18), 0 4px 16px rgba(15,23,42,0.08)",
                  padding: "20px",
                }}
                className="no-scrollbar"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background:
                          "linear-gradient(135deg, #ff6b35 0%, #ff8f5e 100%)",
                        boxShadow: "0 4px 12px rgba(255,107,53,0.3)",
                      }}
                    >
                      <SlidersHorizontal size={15} color="#fff" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#111827]">
                        Filters
                      </p>
                      <p className="text-[11px] text-[#94A3B8] font-medium">
                        {filtered.length} spots match
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-[11px] font-semibold text-[#ff6b35] hover:text-[#e55a28] transition-colors px-2 py-1"
                      >
                        Reset
                      </button>
                    )}
                    <button
                      onClick={() => setIsFilterPanelOpen(false)}
                      className="flex items-center justify-center"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: "rgba(15,23,42,0.06)",
                        color: "#64748B",
                        transition: "all 0.15s",
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Categories Grid */}
                <div className="mb-5">
                  <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#94A3B8] mb-2.5 px-0.5">
                    Category
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => (
                      <motion.button
                        key={cat}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCategory(cat)}
                        className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-[11px] font-semibold border transition-all"
                        style={
                          category === cat
                            ? {
                                background:
                                  "linear-gradient(180deg, #111827 0%, #1F2937 100%)",
                                borderColor: "rgba(255,255,255,0.2)",
                                color: "#fff",
                                boxShadow: "0 6px 16px rgba(17,24,39,0.2)",
                              }
                            : {
                                backgroundColor: "rgba(255,255,255,0.8)",
                                borderColor: "rgba(15,23,42,0.08)",
                                color: "#334155",
                                boxShadow: "0 2px 6px rgba(15,23,42,0.04)",
                              }
                        }
                      >
                        <span style={{ fontSize: 18 }}>
                          {CATEGORY_ICONS[cat]}
                        </span>
                        {cat}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{
                    height: 1,
                    background: "rgba(15,23,42,0.06)",
                    margin: "0 -4px 16px",
                  }}
                />

                {/* Availability & Price Row */}
                <div className="flex items-start gap-3 mb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#94A3B8] mb-2 px-0.5">
                      Hours
                    </p>
                    <button
                      onClick={() => setOpenOnly((v) => !v)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold border transition-all"
                      style={
                        openOnly
                          ? {
                              background:
                                "linear-gradient(180deg, #16A34A 0%, #15803D 100%)",
                              borderColor: "rgba(255,255,255,0.22)",
                              color: "#fff",
                              boxShadow: "0 6px 14px rgba(21,128,61,0.2)",
                            }
                          : {
                              backgroundColor: "rgba(255,255,255,0.8)",
                              borderColor: "rgba(15,23,42,0.08)",
                              color: "#334155",
                              boxShadow: "0 2px 6px rgba(15,23,42,0.04)",
                            }
                      }
                    >
                      <Clock size={13} /> Open Now
                    </button>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#94A3B8] mb-2 px-0.5">
                      Budget
                    </p>
                    <div
                      className="flex gap-1 p-1 rounded-xl"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.8)",
                        border: "1px solid rgba(15,23,42,0.08)",
                        boxShadow: "0 2px 6px rgba(15,23,42,0.04)",
                      }}
                    >
                      {([1, 2, 3] as const).map((price) => (
                        <button
                          key={price}
                          onClick={() => setPriceMax(price)}
                          className="px-3.5 py-2 rounded-lg text-[12px] font-bold border transition-all"
                          style={
                            priceMax === price
                              ? {
                                  background:
                                    "linear-gradient(180deg, #111827 0%, #1F2937 100%)",
                                  borderColor: "rgba(255,255,255,0.18)",
                                  color: "#fff",
                                }
                              : {
                                  backgroundColor: "transparent",
                                  borderColor: "transparent",
                                  color: "#64748B",
                                }
                          }
                        >
                          {PRICE_ICONS[price]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{
                    height: 1,
                    background: "rgba(15,23,42,0.06)",
                    margin: "0 -4px 16px",
                  }}
                />

                {/* Rating Filter */}
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#94A3B8] mb-2 px-0.5">
                    Minimum Rating
                  </p>
                  <div className="flex gap-1.5">
                    {[0, 3.5, 4.0, 4.5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setMinRating(r)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all"
                        style={
                          minRating === r
                            ? {
                                background:
                                  "linear-gradient(180deg, #111827 0%, #1F2937 100%)",
                                borderColor: "rgba(255,255,255,0.18)",
                                color: "#fff",
                                boxShadow: "0 4px 12px rgba(17,24,39,0.18)",
                              }
                            : {
                                backgroundColor: "rgba(255,255,255,0.8)",
                                borderColor: "rgba(15,23,42,0.08)",
                                color: "#334155",
                                boxShadow: "0 2px 6px rgba(15,23,42,0.04)",
                              }
                        }
                      >
                        <Star
                          size={11}
                          fill={minRating === r && r > 0 ? "#FBBF24" : "none"}
                          color={minRating === r ? "#FBBF24" : "#94A3B8"}
                        />
                        {r === 0 ? "Any" : `${r}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{
                    height: 1,
                    background: "rgba(15,23,42,0.06)",
                    margin: "0 -4px 16px",
                  }}
                />

                {/* Tag Filtering */}
                <div className="mb-5">
                  <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#94A3B8] mb-2.5 px-0.5">
                    Tags{" "}
                    {selectedTags.size > 0 && (
                      <span className="text-[#ff6b35] normal-case">
                        ({selectedTags.size})
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_TAGS.map((tag) => (
                      <motion.button
                        key={tag}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTag(tag)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all"
                        style={
                          selectedTags.has(tag)
                            ? {
                                background:
                                  "linear-gradient(180deg, #111827 0%, #1F2937 100%)",
                                borderColor: "rgba(255,255,255,0.18)",
                                color: "#fff",
                                boxShadow: "0 3px 10px rgba(17,24,39,0.16)",
                              }
                            : {
                                backgroundColor: "rgba(255,255,255,0.8)",
                                borderColor: "rgba(15,23,42,0.08)",
                                color: "#64748B",
                              }
                        }
                      >
                        {tag}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{
                    height: 1,
                    background: "rgba(15,23,42,0.06)",
                    margin: "0 -4px 16px",
                  }}
                />

                {/* Sort By section */}
                <div className="mb-5">
                  <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#94A3B8] mb-2.5 px-0.5">
                    Sort By
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "recommended", label: "Recommended" },
                      { id: "rating", label: "Highest Rated" },
                      { id: "reviews", label: "Most Reviews" },
                    ].map((opt) => {
                      const isActive = sortBy === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setSortBy(opt.id as any)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all"
                          style={
                            isActive
                              ? {
                                  background:
                                    "linear-gradient(180deg, #111827 0%, #1F2937 100%)",
                                  borderColor: "rgba(255,255,255,0.18)",
                                  color: "#fff",
                                  boxShadow: "0 3px 10px rgba(17,24,39,0.16)",
                                }
                              : {
                                  backgroundColor: "rgba(255,255,255,0.8)",
                                  borderColor: "rgba(15,23,42,0.08)",
                                  color: "#64748B",
                                }
                          }
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Apply Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="w-full py-3 rounded-xl text-[13px] font-bold transition-all"
                  style={{
                    background:
                      "linear-gradient(180deg, #111827 0%, #1F2937 100%)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 8px 20px rgba(17,24,39,0.22)",
                  }}
                >
                  Show {filtered.length} spots
                </motion.button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div
        className="no-scrollbar"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: isRightPanelOpen
            ? `${RIGHT_PANEL_WIDTH}px`
            : `${RIGHT_PANEL_COLLAPSED_WIDTH}px`,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.95) 100%)",
          backdropFilter: "blur(14px)",
          borderLeft: "1px solid rgba(15,23,42,0.08)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 20,
          pointerEvents: "auto",
          boxShadow: isRightPanelOpen
            ? RIGHT_PANEL_OPEN_SHADOW
            : RIGHT_PANEL_COLLAPSED_SHADOW,
          transition: "width 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {isRightPanelOpen ? (
          <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
            <div
              style={{
                padding: "16px 18px 14px",
                borderBottom: "1px solid rgba(15,23,42,0.06)",
                background: "rgba(255,255,255,0.92)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setIsRightPanelOpen(false)}
                  className="flex items-center justify-center"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: "rgba(15,23,42,0.05)",
                    border: "1px solid rgba(15,23,42,0.06)",
                    color: "#94A3B8",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(15,23,42,0.1)";
                    e.currentTarget.style.color = "#334155";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(15,23,42,0.05)";
                    e.currentTarget.style.color = "#94A3B8";
                  }}
                  aria-label="Collapse right panel"
                  title="Hide panel"
                >
                  <ChevronRight size={14} />
                </button>

                <div className="flex items-center gap-2.5 flex-row-reverse text-right">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background:
                        "linear-gradient(135deg, #ff6b35 0%, #ff8f5e 100%)",
                      boxShadow: "0 3px 10px rgba(255,107,53,0.25)",
                    }}
                  >
                    <Search size={14} color="#fff" />
                  </div>
                  <div className="leading-tight">
                    <h1 className="text-[17px] font-extrabold text-[#111827] tracking-tight">
                      Explore
                    </h1>
                    <p className="text-[10px] font-semibold tracking-[0.14em] text-[#94A3B8] uppercase">
                      City Discovery
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="relative mt-3"
                style={{ position: "relative", zIndex: 1 }}
              >
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search spots, cuisines..."
                  className="w-full pl-9 pr-9 py-2.5 text-[14px] outline-none transition-all"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.92)",
                    border: `1.5px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.md,
                    color: tokens.color.text,
                    boxShadow: tokens.shadow.sm,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = tokens.color.warm;
                    e.currentTarget.style.boxShadow =
                      "0 0 0 4px rgba(255,107,53,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = tokens.color.border;
                    e.currentTarget.style.boxShadow =
                      tokens.shadow.sm;
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Trigger Bar */}
            <div
              className="px-3 py-2.5"
              style={{
                borderBottom: "1px solid rgba(15,23,42,0.06)",
                background: "rgba(255,255,255,0.62)",
              }}
            >
              <button
                onClick={() => setIsFilterPanelOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                style={{
                  backgroundColor: isFilterPanelOpen
                    ? "rgba(255,107,53,0.08)"
                    : "rgba(255,255,255,0.9)",
                  border: isFilterPanelOpen
                    ? "1.5px solid rgba(255,107,53,0.25)"
                    : "1.5px solid rgba(15,23,42,0.08)",
                  color: "#334155",
                  boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-[#94A3B8]" />
                  <span className="truncate">
                    {activeFilterCount > 0 ? (
                      <>
                        {category !== "All" && (
                          <span className="text-[#111827]">{category}</span>
                        )}
                        {openOnly && (
                          <span className="text-[#16A34A]"> · Open</span>
                        )}
                        {priceMax !== 3 && (
                          <span className="text-[#64748B]">
                            {" "}
                            · {PRICE_ICONS[priceMax]}
                          </span>
                        )}
                        {minRating > 0 && (
                          <span className="text-[#FBBF24]">
                            {" "}
                            · ★{minRating}+
                          </span>
                        )}
                        {selectedTags.size > 0 && (
                          <span className="text-[#8B5CF6]">
                            {" "}
                            · {selectedTags.size} tags
                          </span>
                        )}
                      </>
                    ) : (
                      "All categories"
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {activeFilterCount > 0 && (
                    <span
                      className="flex items-center justify-center text-[10px] font-bold text-white"
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 6,
                        background: "linear-gradient(135deg, #ff6b35, #ff8f5e)",
                      }}
                    >
                      {activeFilterCount}
                    </span>
                  )}
                  <SlidersHorizontal size={13} className="text-[#94A3B8]" />
                </div>
              </button>
            </div>

            <div
              className="flex flex-col px-3 py-3 gap-2"
              style={{
                background:
                  "linear-gradient(180deg, rgba(250,252,255,0.76) 0%, rgba(248,250,252,0.88) 100%)",
              }}
            >
              {/* Plan spots from AI Planner / Tour Builder / Group results */}
              {effectivePlanSpots.length > 0 && (
                <div className="flex flex-col gap-2 mb-1">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex items-center justify-center"
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 6,
                          background: "linear-gradient(135deg, #ff6b35, #a855f7)",
                        }}
                      >
                        <span style={{ fontSize: 10 }}>✨</span>
                      </span>
                      <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#ff6b35]">
                        Your Plan
                      </p>
                    </div>
                    <span
                      className="text-[11px] font-semibold px-2 py-1 rounded-full"
                      style={{
                        color: "#ff6b35",
                        backgroundColor: "rgba(255,107,53,0.08)",
                        border: "1px solid rgba(255,107,53,0.2)",
                      }}
                    >
                      {effectivePlanSpots.length}
                    </span>
                  </div>
                  {effectivePlanSpots.map((spot, index) => (
                    <motion.div
                      key={`plan-${spot.id}`}
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300, delay: index * 0.06 }}
                      style={{ position: "relative" }}
                    >
                      {/* Stop number badge */}
                      <div
                        style={{
                          position: "absolute",
                          top: 8, left: 8, zIndex: 10,
                          width: 22, height: 22,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #ff6b35, #a855f7)",
                          color: "white",
                          fontSize: 11, fontWeight: 900,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          border: "2px solid white",
                          boxShadow: "0 2px 8px rgba(255,107,53,0.4)",
                          pointerEvents: "none",
                        }}
                      >
                        {index + 1}
                      </div>
                      <SpotCard
                        spot={spot}
                        selected={selected?.id === spot.id}
                        onClick={() => setSelected((prev) => prev?.id === spot.id ? null : spot)}
                        onMouseEnter={() => setHoveredSpotId(spot.id)}
                        onMouseLeave={() => setHoveredSpotId(null)}
                      />
                    </motion.div>
                  ))}
                  <div style={{ height: 1, background: "rgba(255,107,53,0.12)", margin: "4px 4px 0" }} />
                </div>
              )}

              <div className="flex items-center justify-between px-1">
                <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#64748B]">
                  {effectivePlanSpots.length > 0 ? "All spots" : "Top picks"}
                </p>
                <span
                  className="text-[11px] font-semibold px-2 py-1 rounded-full"
                  style={{
                    color: "#334155",
                    backgroundColor: "rgba(255,255,255,0.86)",
                    border: "1px solid rgba(15,23,42,0.08)",
                  }}
                >
                  {filtered.length}
                </span>
              </div>

              <AnimatePresence mode="popLayout">
                {filtered.map((spot, index) => (
                  <motion.div
                    key={spot.id}
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{
                      type: "spring",
                      damping: 25,
                      stiffness: 300,
                      delay: index * 0.04,
                    }}
                    layout
                  >
                    <SpotCard
                      spot={spot}
                      selected={selected?.id === spot.id}
                      onClick={() =>
                        setSelected((prev) =>
                          prev?.id === spot.id ? null : spot,
                        )
                      }
                      onMouseEnter={() => setHoveredSpotId(spot.id)}
                      onMouseLeave={() => setHoveredSpotId(null)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {filtered.length === 0 && (
                <div className="flex flex-col items-center py-16 text-center gap-2">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: tokens.color.surfaceMuted,
                      color: tokens.color.textMuted,
                    }}
                  >
                    <SearchX size={28} />
                  </div>
                  <Body
                    style={{
                      fontSize: 15,
                      fontWeight: tokens.type.weight.bold,
                      color: tokens.color.text,
                    }}
                  >
                    No spots match
                  </Body>
                  <BodySm tone="muted">
                    Try clearing some filters
                  </BodySm>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              paddingTop: "18px",
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRightPanelOpen(true)}
                className="flex items-center justify-center"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "12px",
                  background: "rgba(15,23,42,0.06)",
                  border: "1px solid rgba(15,23,42,0.08)",
                  color: "#64748B",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(15,23,42,0.1)";
                  e.currentTarget.style.color = "#334155";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(15,23,42,0.06)";
                  e.currentTarget.style.color = "#64748B";
                }}
                aria-label="Expand right panel"
                title="Show panel"
              >
                <ChevronLeft size={16} />
              </button>

              <div
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  letterSpacing: "0.22em",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#94A3B8",
                  userSelect: "none",
                }}
              >
                EXPLORE
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
