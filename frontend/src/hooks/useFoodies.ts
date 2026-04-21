"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { Friend } from "@/components/features/foodies/FriendRow";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80";
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop";

export interface PendingRequest {
  friendship_id: number;
  id: number;
  username: string;
  display_name?: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  title?: string;
  match_score: number;
  created_at: string;
}

export interface SentRequest {
  friendship_id: number;
  id: number;
  username: string;
  display_name?: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  title?: string;
  match_score: number;
  created_at: string;
}

export interface FoodieFriendRaw {
  id: number;
  username: string;
  display_name?: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  title?: string;
  match_score: number;
  friendship_id?: number;
  last_message_at?: string;
}

function mapToFriend(f: FoodieFriendRaw): Friend {
  return {
    id: f.id,
    name: f.display_name || f.username,
    status: f.title || f.bio || "TasteMap Explorer",
    note: f.location || "Vietnam",
    avatar: f.avatar_url || DEFAULT_AVATAR,
    cover: f.cover_url || DEFAULT_COVER,
    match: f.match_score,
    isOnline: false,
    friendshipId: f.friendship_id,
    lastMessageAt: f.last_message_at,
  };
}

export function useFoodies() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [discover, setDiscover] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSent = useCallback(async () => {
    try {
      const res = await apiGet<{ items: SentRequest[] }>("/api/v1/friends/sent");
      setSentRequests(res.items ?? []);
    } catch (e) {
      console.error("Failed to load sent requests", e);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [friendsRes, discoverRes, pendingRes, sentRes] = await Promise.all([
        apiGet<{ items: FoodieFriendRaw[] }>("/api/v1/friends/foodies"),
        apiGet<{ items: FoodieFriendRaw[] }>("/api/v1/friends/discover"),
        apiGet<{ items: PendingRequest[] }>("/api/v1/friends/requests"),
        apiGet<{ items: SentRequest[] }>("/api/v1/friends/sent"),
      ]);
      setFriends((friendsRes.items ?? []).map(mapToFriend));
      setDiscover((discoverRes.items ?? []).map(mapToFriend));
      setPendingRequests(pendingRes.items ?? []);
      setSentRequests(sentRes.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load foodies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sendRequest = useCallback(
    async (targetUserId: number) => {
      await apiPost("/api/v1/friends/request", { friend_id: targetUserId });
      // Xóa khỏi discover ngay lập tức
      setDiscover((prev) => prev.filter((f) => f.id !== targetUserId));
      // Tải lại danh sách sent mà không set loading toàn cục
      loadSent();
    },
    [loadSent],
  );

  const acceptRequest = useCallback(
    async (friendshipId: number) => {
      await apiPatch(`/api/v1/friends/${friendshipId}/accept`);
      setPendingRequests((prev) =>
        prev.filter((r) => r.friendship_id !== friendshipId),
      );
      load();
    },
    [load],
  );

  const declineRequest = useCallback(async (friendshipId: number) => {
    await apiDelete(`/api/v1/friends/${friendshipId}`);
    setPendingRequests((prev) =>
      prev.filter((r) => r.friendship_id !== friendshipId),
    );
  }, []);

  const cancelRequest = useCallback(async (friendshipId: number) => {
    await apiDelete(`/api/v1/friends/${friendshipId}`);
    setSentRequests((prev) =>
      prev.filter((r) => r.friendship_id !== friendshipId),
    );
  }, []);

  const unfriend = useCallback(
    async (friendshipId: number, friendId: number) => {
      await apiDelete(`/api/v1/friends/${friendshipId}`);
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
    },
    [],
  );

  return {
    friends,
    discover,
    pendingRequests,
    sentRequests,
    loading,
    error,
    refresh: load,
    sendRequest,
    acceptRequest,
    declineRequest,
    cancelRequest,
    unfriend,
  };
}
