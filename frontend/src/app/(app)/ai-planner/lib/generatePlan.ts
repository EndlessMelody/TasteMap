/**
 * AI Planner — "pro" generation.
 * Thin client over POST /api/v1/planner/generate: the backend does the real
 * work (mood-boosted candidate selection + the vector-aware tour optimiser),
 * so the itinerary shown here always has real travel times, dwell, cost and
 * taste-match — and is a persisted Tour (shows on Discovery / My Tours too).
 */
import { apiPost } from "@/lib/api";
import { accentFor } from "@/components/features/tours/lib";
import type { TourDetail, JourneyStop } from "@/components/features/tours/lib";
import type { ItineraryStop } from "../components/types";

export interface PlannerAlternate {
  id: number;
  name: string;
  lat: number;
  lng: number;
  image_url: string | null;
  price_range: string | null;
  rating: number | null;
  category: string | null;
}

export interface PlannerGenerateResult {
  tour: TourDetail;
  alternates: PlannerAlternate[];
}

export interface GeneratePlanParams {
  mood: string | null;
  cuisines: string[];
  group: string | null;
  duration: string;
  budget: string;
  location: string;
  prompt?: string;
}

const DURATION_MIN: Record<string, number> = {
  "2 hours": 120,
  "4 hours": 240,
  "Half Day": 330,
  "Full Day": 600,
};

const BUDGET_VND_MAX: Record<string, number | undefined> = {
  "< 100k": 100_000,
  "100–300k": 300_000,
  "300–500k": 500_000,
  "500k+": undefined,
};

const DISTRICT_COORDS: Record<string, [number, number]> = {
  "District 1": [10.7769, 106.7009],
  "Bình Thạnh": [10.8106, 106.7091],
  "Phú Nhuận": [10.7991, 106.6803],
};

function timeContextNow(d: Date = new Date()): string {
  const h = d.getHours();
  if (h >= 5 && h < 11) return "breakfast";
  if (h >= 11 && h < 15) return "lunch";
  if (h >= 15 && h < 18) return "afternoon";
  if (h >= 18 && h < 23) return "dinner";
  return "late_night";
}

export async function generatePlan(params: GeneratePlanParams): Promise<PlannerGenerateResult> {
  const coords = DISTRICT_COORDS[params.location];
  return apiPost<PlannerGenerateResult>("/api/v1/planner/generate", {
    mood: params.mood ?? undefined,
    cuisines: params.cuisines,
    duration_min: DURATION_MIN[params.duration] ?? 240,
    budget_vnd_max: BUDGET_VND_MAX[params.budget],
    party: params.group ?? undefined,
    start_lat: coords?.[0],
    start_lng: coords?.[1],
    time_context: timeContextNow(),
    transport_mode: "walking",
    prompt: params.prompt || undefined,
  });
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=480&h=320&fit=crop";
const TRAVEL_LABEL: Record<string, string> = {
  walking: "min walk",
  driving: "min drive",
  transit: "min transit",
};

/** Maps a persisted Tour's stops → ItineraryStop[] with REAL times/cost/travel/match. */
export function tourToItineraryStops(
  tour: TourDetail,
  transportMode: string = "walking",
  startAt: Date = new Date(),
): ItineraryStop[] {
  const stops = tour.stops.filter((s): s is JourneyStop & { location: NonNullable<JourneyStop["location"]> } => !!s.location);
  let cursor = new Date(startAt);
  const travelLabel = TRAVEL_LABEL[transportMode] ?? "min";

  return stops.map((s, i) => {
    if (i > 0) {
      const prevDwell = stops[i - 1].dwell_min ?? 45;
      cursor = new Date(cursor.getTime() + (prevDwell + (s.travel_min ?? 0)) * 60_000);
    }
    const match = s.match_score ?? 50;
    const next = stops[i + 1];
    return {
      id: s.location.id,
      lat: s.location.lat,
      lng: s.location.lng,
      time: cursor.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      name: s.location.name,
      category: s.location.category ? s.location.category[0].toUpperCase() + s.location.category.slice(1) : "Food",
      emoji: "🍽️",
      address: s.location.category ?? "",
      img: s.location.image_url ?? FALLBACK_IMG,
      cost: s.location.price_range ?? "—",
      xp: Math.round(match),
      accent: accentFor(s.location.id),
      reason: `${Math.round(match)}% match for your taste profile`,
      travelToNext: next ? `${next.travel_min ?? 0} ${travelLabel}` : undefined,
    };
  });
}
