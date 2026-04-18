/**
 * useGroups — Fetches active group lobbies from the backend.
 * Maps to: GET /api/v1/groups
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api";
import { normalizeMediaUrl } from "@/lib/media";
import type { LobbyData } from "@/components/features/lobby/types";

// ─── API Response Types ───────────────────────────────────────────────────────

interface ApiGroupMember {
  user_id: number;
  display_name: string;
  avatar_url: string | null;
  is_ready: boolean;
}

interface ApiGroup {
  id: number;
  name: string;
  route_description: string | null;
  scheduled_time: string | null;
  max_spots: number;
  cover_image_url: string | null;
  accent_color: string | null;
  members: ApiGroupMember[];
  spots_remaining: number;
}

interface GroupsResponse {
  items: ApiGroup[];
}

// ─── Adapter: API → LobbyData ────────────────────────────────────────────────

function adaptGroup(g: ApiGroup): LobbyData {
  return {
    id: g.id,
    name: g.name,
    route: g.route_description ?? "Chưa có lộ trình",
    time: g.scheduled_time
      ? new Date(g.scheduled_time).toLocaleString("vi-VN", {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Thời gian TBD",
    spots: g.max_spots,
    bg:
      normalizeMediaUrl(g.cover_image_url) ??
      "https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&h=320&fit=crop",
    accent: g.accent_color ?? "#ff6b35",
    members: (g.members ?? []).map((m) => ({
      name: m.display_name,
      avatar:
        normalizeMediaUrl(m.avatar_url) ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(m.display_name)}&background=random`,
      ready: m.is_ready,
      user_id: m.user_id,
    })),
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseGroupsResult {
  lobbies: LobbyData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGroups(status: string = "active"): UseGroupsResult {
  const [lobbies, setLobbies] = useState<LobbyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<GroupsResponse>(
        `/api/v1/groups?status=${status}&limit=10`,
      );
      setLobbies((data.items ?? []).map(adaptGroup));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Lỗi ${err.status}: ${err.message}`);
      } else {
        setError("Không thể tải danh sách lobby");
      }
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { lobbies, loading, error, refetch: fetchGroups };
}
