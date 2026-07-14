/**
 * Tour Builder — page-local types + helpers.
 * Shared tour/map types and formatting live in @/components/features/tours/lib
 * (re-exported below so existing imports keep working).
 */
import type { TourNode } from "@/store/useTourBuilderStore";

export type {
  JourneyStopLocation,
  JourneyStop,
  TourDetail,
  TourSummary,
} from "@/components/features/tours/lib";
export {
  DECOR_ACCENTS,
  accentFor,
  DEFAULT_CENTER,
  formatDuration,
  formatVnd,
} from "@/components/features/tours/lib";
import { accentFor, DEFAULT_CENTER } from "@/components/features/tours/lib";

// ─── Saved place (GET /api/v1/bookmarks) ─────────────────────────────────────

export interface SavedPlace {
  id: number; // location id
  name: string;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  rating: number | null;
  category: string | null;
  price_range: string | null;
}

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
    location: p.lat != null && p.lng != null ? [p.lat, p.lng] : [0, 0],
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

/** Pick a start point: first draft node with real coords, else null (server defaults to first stop). */
export function bestStart(draft: TourNode[]): { lat: number; lng: number } | null {
  const withCoords = draft.find((n) => n.location[0] !== 0 || n.location[1] !== 0);
  if (withCoords) return { lat: withCoords.location[0], lng: withCoords.location[1] };
  return null;
}
