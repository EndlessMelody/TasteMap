/**
 * useRecommendations — Fetches AI-powered recommendations from the backend.
 * Maps to: POST /api/v1/recommendations
 * Falls back to GET /api/v1/feed/cards when recommendations return empty.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { apiPost, apiGet, ApiError } from "@/lib/api";
import { normalizeMediaUrl } from "@/lib/media";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Recommendation {
  place_id: number;
  name: string;
  match_score: number; // 0-100 float
  lat: number;
  lng: number;
  vector: number[];
  image_url?: string | null;
  price_range?: string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseRecommendationsResult {
  picks: Recommendation[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Neutral start vector (all 0.5) — used before user has swiped anything
const NEUTRAL_VECTOR = Array(15).fill(0.5);

async function fetchFeedFallback(topN: number, domain: string): Promise<Recommendation[]> {
  const params = new URLSearchParams({ category: domain, limit: String(topN) });
  const data: any = await apiGet(`/api/v1/feed/cards?${params}`);
  const cards: any[] = data?.cards ?? [];
  return cards.map((card) => ({
    place_id: card.id,
    name: card.name,
    match_score: card.match_percent ?? Math.floor(55 + Math.random() * 30),
    lat: card.lat ?? 0,
    lng: card.lng ?? 0,
    vector: NEUTRAL_VECTOR,
    image_url: card.image_url ?? null,
    price_range: card.price_range ?? null,
  }));
}

export function useRecommendations(
  topN: number = 4,
  userVector: number[] = NEUTRAL_VECTOR,
  domain: string = "food",
): UseRecommendationsResult {
  const [picks, setPicks] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPicks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data: any = await apiPost("/api/v1/recommendations", {
        user_vector: userVector,
        top_n: topN,
        category: domain,
      });
      let results: Recommendation[] = Array.isArray(data?.recommendations)
        ? data.recommendations.map((item: Recommendation) => ({
            ...item,
            image_url: normalizeMediaUrl(item.image_url),
          }))
        : [];

      // If recommendations returned empty, pull random cards from the feed as fallback
      if (results.length === 0) {
        results = await fetchFeedFallback(topN, domain);
      }

      setPicks(results);
    } catch (err) {
      // Primary endpoint failed — try feed fallback before showing error
      try {
        const fallback = await fetchFeedFallback(topN, domain);
        setPicks(fallback);
      } catch {
        if (err instanceof ApiError) {
          setError(`Lỗi ${err.status}: ${err.message}`);
        } else {
          setError("Không thể lấy gợi ý AI");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [topN, domain, JSON.stringify(userVector)]);

  useEffect(() => {
    fetchPicks();
  }, [fetchPicks]);

  return { picks, loading, error, refetch: fetchPicks };
}
