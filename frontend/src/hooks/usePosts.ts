/**
 * usePosts — Fetches community posts (Foodie Feed) from the backend.
 * Maps to: GET /api/v1/posts
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api";
import { normalizeMediaUrl } from "@/lib/media";
import type { PostData } from "@/types/dashboard";

// ─── API Response Types ───────────────────────────────────────────────────────

interface ApiPost {
  id: number;
  content: string; // actual field name from backend
  review?: string; // fallback alias some backends use
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_bookmarked?: boolean;
  rating?: number; // direct field on post
  created_at: string;
  location: {
    id: number;
    name: string;
    city: string | null;
    rating: number | null;
  } | null;
  user: {
    id: number;
    display_name: string | null;
    username?: string; // may not always be present
    avatar_url: string | null;
  };
  tags: string[] | null;
}

interface PostsResponse {
  items: ApiPost[];
  total: number;
}

// ─── Adapter: API → PostData ──────────────────────────────────────────────────

function adaptPost(p: ApiPost): PostData {
  const now = new Date();
  const created = new Date(p.created_at);
  const diffMs = now.getTime() - created.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const timeLabel =
    diffH < 1
      ? `${Math.floor(diffMs / 60000)}m`
      : diffH < 24
        ? `${diffH}h`
        : `${Math.floor(diffH / 24)}d`;

  const authorName =
    p.user.display_name ?? p.user.username ?? `User ${p.user.id}`;
  const reviewText = p.content ?? p.review ?? "";
  const postRating = p.rating ?? p.location?.rating ?? 4.0;

  return {
    id: p.id,
    name: authorName,
    avatar:
      normalizeMediaUrl(p.user.avatar_url) ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random&size=128`,
    time: timeLabel,
    location: p.location?.city ?? "Vietnam",
    spotName: p.location?.name ?? "TasteMap Spot",
    rating: postRating,
    review: reviewText,
    img:
      normalizeMediaUrl(p.image_url) ??
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=680&h=480&fit=crop",
    tags: p.tags ?? [],
    likes: p.likes_count ?? 0,
    comments: p.comments_count ?? 0,
    isLiked: p.is_liked ?? false,
    isSaved: p.is_bookmarked ?? false,
  };
}

import { useSocialStore } from "@/store/socialStore";

interface UsePostsResult {
  posts: PostData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePosts(limit: number = 8): UsePostsResult {
  const posts = useSocialStore((state) => state.posts);
  const setPosts = useSocialStore((state) => state.setPosts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<PostsResponse>(
        `/api/v1/posts?limit=${limit}&offset=0`,
      );
      setPosts((data.items ?? []).map(adaptPost));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Lỗi ${err.status}: ${err.message}`);
      } else {
        setError("Không thể tải bài đăng");
      }
    } finally {
      setLoading(false);
    }
  }, [limit, setPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
}

// Hook to fetch posts by specific user
export function useUserPosts(
  userId: number | null,
  limit: number = 10,
): UsePostsResult {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPosts = useCallback(async () => {
    if (!userId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<PostsResponse>(
        `/api/v1/posts?user_id=${userId}&limit=${limit}&offset=0`,
      );
      setPosts((data.items ?? []).map(adaptPost));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Lỗi ${err.status}: ${err.message}`);
      } else {
        setError("Không thể tải bài đăng");
      }
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  return { posts, loading, error, refetch: fetchUserPosts };
}
