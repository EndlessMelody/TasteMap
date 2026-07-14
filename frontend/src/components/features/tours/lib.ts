/**
 * Tours — shared types + map/coordinate helpers.
 *
 * Coordinate conventions used across this module (centralised here to avoid
 * repeating the lat/lng vs lat/lon vs lng/lat mismatch across call sites):
 *   - `Spot` (explore/types.ts)         → { lat, lon }
 *   - `MapWidget.center` / `tourCenter` → [lat, lon]
 *   - `MapWidget.routeCoords`           → [lng, lat][] (GeoJSON LineString order)
 */
import { tokens } from "@/styles/tokens";
import type { Spot } from "@/app/(app)/explore/types";

// ─── Authoritative tour detail (GET /api/v1/tours/{id}) ──────────────────────

export interface JourneyStopLocation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  image_url: string | null;
  price_range: string | null;
  rating: number | null;
  category: string | null;
}

export interface JourneyStop {
  id: number;
  stop_order: number;
  match_score: number | null;
  dwell_min: number | null;
  travel_min: number | null;
  location: JourneyStopLocation | null;
}

export interface TourDetail {
  id: number;
  title?: string | null;
  status: string;
  total_distance: number | null;
  estimated_cost: number | null;
  estimated_duration: number | null;
  created_at?: string | null;
  stops: JourneyStop[];
}

export interface TourSummary {
  id: number;
  title?: string | null;
  status: string;
  total_distance: number | null;
  estimated_cost: number | null;
  estimated_duration: number | null;
  created_at?: string | null;
}

// ─── Decorative accents (theme-invariant, for per-stop colour variety) ───────

export const DECOR_ACCENTS = [
  tokens.color.warm,
  tokens.color.magic,
  tokens.color.cool,
  tokens.color.success,
  tokens.color.warning,
] as const;

export function accentFor(seed: number): string {
  return DECOR_ACCENTS[Math.abs(seed) % DECOR_ACCENTS.length];
}

export const DEFAULT_CENTER: [number, number] = [10.7769, 106.7009]; // HCMC fallback

// ─── Formatting ──────────────────────────────────────────────────────────────

export function formatDuration(min: number | null | undefined): string {
  if (!min || min <= 0) return "—";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h <= 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatVnd(v: number | null | undefined): string {
  if (!v || v <= 0) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}k`;
  return String(v);
}

// ─── Map data helpers ──────────────────────────────────────────────────────

function hasRealCoords(stop: JourneyStop): stop is JourneyStop & { location: JourneyStopLocation } {
  return !!stop.location && (stop.location.lat !== 0 || stop.location.lng !== 0);
}

/** JourneyStop[] → Spot[] for MapWidget markers. Drops stops with no/zero coords. */
export function journeyStopsToSpots(stops: JourneyStop[]): Spot[] {
  return stops.filter(hasRealCoords).map((s) => ({
    id: s.location.id,
    name: s.location.name,
    lat: s.location.lat,
    lon: s.location.lng,
    category: "place",
    emoji: "📍",
    accent: accentFor(s.location.id),
    rating: s.location.rating ?? 5,
    reviewCount: 0,
    priceLevel: 2,
    isOpen: true,
    closesAt: "",
    distance: "",
    img: s.location.image_url ?? "",
    description: s.location.category ?? "",
    tags: [],
  }));
}

/** Ordered [lng, lat] route coords for MapWidget's route polyline. Drops zero/missing coords. */
export function toRouteCoords(stops: JourneyStop[]): [number, number][] {
  return stops.filter(hasRealCoords).map((s) => [s.location.lng, s.location.lat]);
}

/** Map centre = first real-coord stop, else HCMC default. [lat, lon]. */
export function tourCenter(stops: JourneyStop[]): [number, number] {
  const first = stops.find(hasRealCoords);
  return first ? [first.location.lat, first.location.lng] : DEFAULT_CENTER;
}

/** location id → 1-based stop_order, for MapWidget's numbered badges. */
export function stopIndexMap(stops: JourneyStop[]): Map<number, number> {
  return new Map(stops.filter(hasRealCoords).map((s) => [s.location.id, s.stop_order]));
}
