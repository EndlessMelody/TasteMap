/**
 * useFeedCards — Fetches swipe-able location cards from the backend.
 * Maps to: GET /api/v1/feed/cards
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiGet, ApiError } from "@/lib/api";
import { normalizeImageUrl } from "@/lib/image-utils";

// ─── API Response Types ───────────────────────────────────────────────────────

export interface FeedCard {
  id: number;
  name: string;
  image_url: string | null;
  tags: string[] | null;
  price_range: string | null;
  rating: number | null;
  distance_km: number | null;
  match_percent: number | null;
  address?: string | null;
  open_hours?: string | null;
  category: "food" | "place";
  photos?: string[];
  reviews_preview?: string[];
  lat?: number;
  lng?: number;
}

interface FeedCardsResponse {
  cards: FeedCard[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseFeedCardsOptions {
  type?: "food" | "place";
  limit?: number;
  lat?: number;
  lng?: number;
  userId?: string;
}

interface UseFeedCardsResult {
  cards: FeedCard[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFeedCards({
  type = "place",
  limit = 10,
  lat,
  lng,
  userId,
}: UseFeedCardsOptions = {}): UseFeedCardsResult {
  const [cards, setCards] = useState<FeedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchCount = useRef(0);

  const fetchCards = useCallback(async () => {
    const currentFetch = ++fetchCount.current;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        category: type,
        limit: String(limit),
      });
      if (lat !== undefined) params.set("lat", String(lat));
      if (lng !== undefined) params.set("lng", String(lng));
      if (userId) params.set("user_id", userId);

      const data = await apiGet<FeedCardsResponse>(
        `/api/v1/feed/cards?${params}`,
      );

      // Ignore stale responses
      if (currentFetch !== fetchCount.current) return;
      setCards(
        (data.cards ?? []).map((card) => ({
          ...card,
          image_url: normalizeImageUrl(card.image_url, {
            id: card.id,
            category: card.category,
          }),
          photos: (card.photos ?? [])
            .map((photo) =>
              normalizeImageUrl(photo, {
                id: card.id,
                category: card.category,
              }),
            )
            .filter((photo): photo is string => !!photo),
        })),
      );
    } catch (err) {
      if (currentFetch !== fetchCount.current) return;
      if (err instanceof ApiError) {
        setError(`Lỗi ${err.status}: ${err.message}`);
      } else {
        setError("Không thể tải thẻ địa điểm");
      }
    } finally {
      if (currentFetch === fetchCount.current) setLoading(false);
    }
  }, [type, limit, lat, lng, userId]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return { cards, loading, error, refetch: fetchCards };
}
