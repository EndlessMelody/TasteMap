import { apiGet } from "@/lib/api";
import { normalizeMediaUrl } from "@/lib/media";
import type { ItineraryStop } from "../components/types";

// ─── Cuisine mapping ─────────────────────────────────────────────────────────

const CUISINE_META: Record<string, { color: string; emoji: string; desc: string }> = {
  Vietnamese:   { color: "#ED1B24", emoji: "🍜", desc: "Authentic Vietnamese flavours" },
  Cafe:         { color: "#8B6914", emoji: "☕", desc: "Great coffee & atmosphere" },
  "Street Food":{ color: "#F59E0B", emoji: "🥖", desc: "Bold street-food kick" },
  BBQ:          { color: "#DC2626", emoji: "🔥", desc: "Smoky grilled goodness" },
  Japanese:     { color: "#E11D48", emoji: "🍣", desc: "Refined Japanese flavours" },
  Dessert:      { color: "#A855F7", emoji: "🍰", desc: "Sweet finish to your tour" },
  Ramen:        { color: "#F97316", emoji: "🍥", desc: "Rich, warming ramen" },
  Healthy:      { color: "#22C55E", emoji: "🥗", desc: "Light & nutritious pick" },
};

const FALLBACK_IMAGES: Record<string, string> = {
  Vietnamese:    "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=480&h=320&fit=crop",
  Cafe:          "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=480&h=320&fit=crop",
  "Street Food": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=480&h=320&fit=crop",
  BBQ:           "https://images.unsplash.com/photo-1544025162-d76694265947?w=480&h=320&fit=crop",
  Japanese:      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=480&h=320&fit=crop",
  Dessert:       "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=480&h=320&fit=crop",
  Ramen:         "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=480&h=320&fit=crop",
  Healthy:       "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=480&h=320&fit=crop",
  default:       "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=480&h=320&fit=crop",
};

// ─── Start times by duration ─────────────────────────────────────────────────

const START_HOURS: Record<string, number> = {
  "2 hours":  14, // 2 PM
  "4 hours":  13, // 1 PM
  "Half Day": 10, // 10 AM
  "Full Day":  8, // 8 AM
};

const STOP_COUNT: Record<string, number> = {
  "2 hours":  2,
  "4 hours":  4,
  "Half Day": 5,
  "Full Day": 7,
};

// ─── API types ────────────────────────────────────────────────────────────────

interface LocationApiItem {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address?: string | null;
  city?: string | null;
  category?: string | null;
  image_url?: string | null;
  price_range?: string | null;
  open_hours?: string | null;
  rating?: number | null;
  characteristics?: Record<string, string> | null;
}

interface LocationListResponse {
  items: LocationApiItem[];
  total: number;
}

// ─── Mapping helper ───────────────────────────────────────────────────────────

function detectCuisine(loc: LocationApiItem): string {
  const fromCharacteristics = loc.characteristics?.cuisine ?? loc.characteristics?.type;
  if (fromCharacteristics && CUISINE_META[fromCharacteristics]) return fromCharacteristics;

  const nameLower = loc.name.toLowerCase();
  if (/phở|bún|cơm|bánh|gỏi|chả|nem|cuốn/.test(nameLower)) return "Vietnamese";
  if (/cafe|cà phê|coffee|trà sữa|milk tea/.test(nameLower)) return "Cafe";
  if (/ramen|tonkotsu|soba/.test(nameLower)) return "Ramen";
  if (/bbq|nướng|lẩu|hotpot/.test(nameLower)) return "BBQ";
  if (/sushi|sashimi|nhật/.test(nameLower)) return "Japanese";
  if (/chè|kem|dessert|bánh ngọt/.test(nameLower)) return "Dessert";
  if (/salad|healthy|organic/.test(nameLower)) return "Healthy";
  return "Street Food";
}

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

function mapToStop(
  loc: LocationApiItem,
  index: number,
  total: number,
  startHour: number,
): ItineraryStop {
  const cuisine = detectCuisine(loc);
  const meta = CUISINE_META[cuisine] ?? CUISINE_META["Street Food"];
  const fallbackImg = FALLBACK_IMAGES[cuisine] ?? FALLBACK_IMAGES.default;

  // Spread stops evenly (avg ~50-60 min per stop)
  const gapMinutes = index * 55;
  const hour = startHour + Math.floor(gapMinutes / 60);
  const minute = gapMinutes % 60;

  const xp = Math.round((loc.rating ?? 3.5) * 22);

  const reason =
    loc.characteristics?.reason ??
    `${meta.desc} · ${loc.open_hours ?? "Open now"} · ${loc.rating ? `Rated ${loc.rating.toFixed(1)}★` : "Local favourite"}`;

  return {
    id: loc.id,
    lat: loc.lat,
    lng: loc.lng,
    time: formatTime(hour, minute),
    name: loc.name,
    category: cuisine,
    emoji: meta.emoji,
    address: [loc.address, loc.city].filter(Boolean).join(", ") || "Ho Chi Minh City",
    img: normalizeMediaUrl(loc.image_url) ?? fallbackImg,
    cost: loc.price_range ?? "50,000đ",
    xp,
    accent: meta.color,
    reason,
    travelToNext: index < total - 1 ? `${5 + index * 2} min` : undefined,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface ItineraryParams {
  mood: string | null;
  cuisines: string[];
  duration: string;
  budget: string;
}

export async function generateItinerary(params: ItineraryParams): Promise<ItineraryStop[]> {
  const targetCount = STOP_COUNT[params.duration] ?? 4;
  const startHour = START_HOURS[params.duration] ?? 13;

  // Fetch a wider pool so we can filter
  const fetchLimit = Math.min(targetCount * 4, 40);
  const qs = new URLSearchParams({ category: "food", limit: String(fetchLimit) });
  const data: LocationListResponse = await apiGet(`/api/v1/locations/?${qs}`);
  let pool: LocationApiItem[] = data?.items ?? [];

  // Prefer locations matching selected cuisines
  if (params.cuisines.length > 0) {
    const preferred = pool.filter((loc) => {
      const cuisine = detectCuisine(loc);
      return params.cuisines.includes(cuisine);
    });
    // Keep preferred first, pad with others if needed
    const others = pool.filter((loc) => !preferred.includes(loc));
    pool = [...preferred, ...others];
  }

  // Deduplicate by id and take target count
  const seen = new Set<number>();
  const selected: LocationApiItem[] = [];
  for (const loc of pool) {
    if (!seen.has(loc.id) && selected.length < targetCount) {
      seen.add(loc.id);
      selected.push(loc);
    }
  }

  return selected.map((loc, i) => mapToStop(loc, i, selected.length, startHour));
}
