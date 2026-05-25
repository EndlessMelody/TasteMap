"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiGet, apiPatch } from "@/lib/api";

export interface InboxConversation {
  partner_id: number;
  partner_name: string;
  partner_avatar: string | null;
  last_message: string;
  last_message_time: string;
  last_message_at: string;
  unread_count: number;
  is_sent_by_me: boolean;
}

const BASE_POLL_INTERVAL = 15_000;  // 15 seconds (was 5s)
const MAX_POLL_INTERVAL = 120_000;  // 2 minutes max on repeated failures
const BACKOFF_MULTIPLIER = 2;

export function useInbox() {
  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failCountRef = useRef(0);
  const mountedRef = useRef(true);

  const fetchInbox = useCallback(async () => {
    try {
      const data = await apiGet<InboxConversation[]>("/api/v1/messages/inbox");
      if (mountedRef.current) {
        setConversations(Array.isArray(data) ? data : []);
        failCountRef.current = 0; // reset on success
      }
    } catch {
      // Increment fail counter for backoff — don't log to avoid console flood
      failCountRef.current = Math.min(failCountRef.current + 1, 6);
    }
  }, []);

  // Schedule next poll with exponential backoff on failures
  const scheduleNextPoll = useCallback(() => {
    if (pollRef.current) clearTimeout(pollRef.current);
    const delay = Math.min(
      BASE_POLL_INTERVAL * Math.pow(BACKOFF_MULTIPLIER, failCountRef.current),
      MAX_POLL_INTERVAL,
    );
    pollRef.current = setTimeout(async () => {
      if (mountedRef.current) {
        await fetchInbox();
        scheduleNextPoll();
      }
    }, delay);
  }, [fetchInbox]);

  // Initial load
  useEffect(() => {
    mountedRef.current = true;
    const load = async () => {
      try {
        const data = await apiGet<InboxConversation[]>("/api/v1/messages/inbox");
        if (mountedRef.current) {
          setConversations(Array.isArray(data) ? data : []);
        }
      } catch {
        // Backend unreachable — start with empty, polling will retry
        failCountRef.current = 1;
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };
    load().then(scheduleNextPoll);

    return () => {
      mountedRef.current = false;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [fetchInbox, scheduleNextPoll]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  const markRead = useCallback(async (partnerId: number) => {
    try {
      await apiPatch(`/api/v1/messages/${partnerId}/read`, {});
      // Optimistically update local state
      setConversations((prev) =>
        prev.map((c) =>
          c.partner_id === partnerId ? { ...c, unread_count: 0 } : c,
        ),
      );
    } catch {
      // silently fail
    }
  }, []);

  return {
    conversations,
    loading,
    totalUnread,
    refresh: fetchInbox,
    markRead,
  };
}
