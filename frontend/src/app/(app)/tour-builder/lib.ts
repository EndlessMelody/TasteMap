/**
 * Tour Builder — shared types + helpers.
 * Theme-aware: all colour comes from @/styles/tokens; decorative accents are a
 * small fixed palette so each stop reads distinctly in the cinematic journey.
 */
import { tokens } from "@/styles/tokens";
import type { TourNode } from "@/store/useTourBuilderStore";

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
  status: string;
  total_distance: number | null;
  estimated_cost: number | null;
  estimated_duration: number | null;
  stops: JourneyStop[];
}

// ─── Saved place (GET /api/v1/bookmarks) ─────────────────────────────────────

export interface SavedPlace {
  id: number; // location id
  name: string;
  image_url: string | null;
  rating: number | null;
  category: string | null;
  price_range: string | null;
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

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop";

// ─── Time-of-day → optimiser time_context ────────────────────────────────────

export function timeContextNow(d: Date = new Date()): string {
  const h = d.getHours();
  if (h >= 5 && h < 11) return "breakfast";
  if (h >= 11 && h < 15) return "lunch";
  if (h >= 15 && h < 18) return "afternoon";
  if (h >= 18 && h < 23) return "dinner";
  return "late_night";
}

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

// ─── Mappers ─────────────────────────────────────────────────────────────────

export function savedToTourNode(p: SavedPlace, index: number): TourNode {
  return {
    id: `saved-${p.id}`,
    venue_id: p.id,
    title: p.name,
    subtitle: p.category ? p.category[0].toUpperCase() + p.category.slice(1) : "Saved place",
    tags: p.category ? [p.category] : [],
    match: p.rating ? Math.round(p.rating * 20) : 80,
    distance: "—",
    price: p.price_range ?? "$$",
    img: p.image_url ?? FALLBACK_IMG,
    color: accentFor(p.id),
    location: [0, 0], // coords resolved server-side at optimise / via GET tour
    time_spent: 45,
    order_index: index,
    rating: p.rating ?? undefined,
    source: "saved",
  };
}

/** Raw feed card (GET /feed/cards) → TourNode for the swipe-assist drawer. */
export function feedCardToTourNode(card: any, index: number): TourNode {
  return {
    id: `assist-${card.id}`,
    venue_id: card.id,
    title: card.name,
    subtitle: `${card.category ?? "Place"} • ${card.address ?? "HCM City"}`,
    tags: card.tags ?? [],
    match: card.match_percent ?? 0,
    distance: card.distance_km != null ? `${card.distance_km.toFixed(1)}km` : "—",
    price: card.price_range ?? "$$",
    img: card.image_url ?? FALLBACK_IMG,
    color: accentFor(card.id),
    location: [card.lat ?? DEFAULT_CENTER[0], card.lng ?? DEFAULT_CENTER[1]],
    time_spent: 45,
    order_index: index,
    rating: card.rating ?? undefined,
    reviews_preview: card.reviews_preview,
    source: "assist",
  };
}

/** Pick a start point: first draft node with real coords, else default. */
export function bestStart(draft: TourNode[]): { lat: number; lng: number } {
  const withCoords = draft.find((n) => n.location[0] !== 0 || n.location[1] !== 0);
  if (withCoords) return { lat: withCoords.location[0], lng: withCoords.location[1] };
  return { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] };
}
