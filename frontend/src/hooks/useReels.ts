/**
 * useReels — Fetches trending reels from the backend.
 * Maps to: GET /api/v1/reels?sort=trending
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api";
import { normalizeMediaUrl } from "@/lib/media";
import type { ReelData } from "@/types/dashboard";

// ─── API Response Types ───────────────────────────────────────────────────────

interface ApiReel {
  id: number;
  title: string;
  video_url: string | null;
  thumbnail_url: string | null;
  views_count: number;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  created_at: string;
  user: {
    id: number;
    display_name: string | null;
    username?: string;
    avatar_url: string | null;
  };
  location?: {
    id: number;
    name: string;
  } | null;
}

interface ReelsResponse {
  items?: ApiReel[];
  // Some backends return array directly
  [key: number]: ApiReel;
  length?: number;
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function adaptReel(r: ApiReel): ReelData {
  const authorName =
    r.user.display_name ?? r.user.username ?? `User ${r.user.id}`;
  return {
    id: r.id,
    title: r.title,
    user: `@${r.user.username ?? authorName.toLowerCase().replace(/\s+/g, "_")}`,
    views: formatViews(r.views_count),
    userAvatar:
      normalizeMediaUrl(r.user.avatar_url) ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random&size=64`,
    img:
      normalizeMediaUrl(r.thumbnail_url) ??
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=700&fit=crop",
    videoUrl: normalizeMediaUrl(r.video_url) || undefined,
    likes: r.likes_count,
    comments: r.comments_count,
    isLiked: r.is_liked ?? false,
    isSaved: r.is_bookmarked ?? false,
  };
}

import { useSocialStore } from "@/store/socialStore";

interface UseReelsResult {
  reels: ReelData[];
  loading: boolean;
  error: string | null;
}

export function useReels(limit: number = 8): UseReelsResult {
  const reels = useSocialStore((state) => state.reels);
  const setReels = useSocialStore((state) => state.setReels);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend may return { items: [...] } or a bare array
      const data = await apiGet<ReelsResponse | ApiReel[]>(
        `/api/v1/reels/?sort=trending&limit=${limit}`,
      );
      let items: ApiReel[] = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data && "items" in data && Array.isArray(data.items)) {
        items = data.items;
      }
      setReels(items.map(adaptReel));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Lỗi ${err.status}: ${err.message}`);
      } else {
        setError("Không thể tải reels");
      }
    } finally {
      setLoading(false);
    }
  }, [limit, setReels]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  return { reels, loading, error };
}
