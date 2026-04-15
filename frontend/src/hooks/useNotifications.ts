"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPatch, apiDelete, ApiError } from "@/lib/api";

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  reference_type: string | null;
  reference_id: number | null;
  created_at: string;
}

interface NotificationsResponse {
  items: AppNotification[];
  unread_count: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<NotificationsResponse>(
        "/api/v1/notifications/?limit=30",
      );
      setNotifications(data.items ?? []);
      setUnreadCount(data.unread_count ?? 0);
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: number) => {
    try {
      await apiPatch(`/api/v1/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await apiPatch("/api/v1/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  const acceptFriendRequest = useCallback(
    async (friendshipId: number, notifId: number) => {
      await apiPatch(`/api/v1/friends/${friendshipId}/accept`);
      await markRead(notifId);
      await fetchNotifications();
    },
    [markRead, fetchNotifications],
  );

  const declineFriendRequest = useCallback(
    async (friendshipId: number, notifId: number) => {
      await apiDelete(`/api/v1/friends/${friendshipId}`);
      await markRead(notifId);
      await fetchNotifications();
    },
    [markRead, fetchNotifications],
  );

  return {
    notifications,
    unreadCount,
    loading,
    refresh: fetchNotifications,
    markRead,
    markAllRead,
    acceptFriendRequest,
    declineFriendRequest,
  };
}
