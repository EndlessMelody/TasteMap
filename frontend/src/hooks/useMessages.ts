"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiGet, apiPost } from "@/lib/api";

export interface ChatMessage {
  id: number;
  client_key?: string;
  text: string | null;
  sender: "me" | "them";
  sender_id: number;
  time: string;
  is_read: boolean;
  created_at: string;
  content_type: "text" | "image" | "voice" | "video" | "file";
  media_url?: string;
  media_meta?: {
    duration?: number;
    width?: number;
    height?: number;
    size_bytes?: number;
  };
  is_edited: boolean;
  is_deleted: boolean;
  is_pending?: boolean;
  reply_to?: {
    id: number;
    text: string | null;
    sender_id: number;
    content_type: string;
  };
  reactions?: Array<{
    emoji: string;
    count: number;
    user_ids: number[];
    has_reacted: boolean;
  }>;
}

type SendMessageResponse =
  | ChatMessage
  | {
      success?: boolean;
      data?: ChatMessage;
    };

function unwrapSentMessage(response: SendMessageResponse): ChatMessage | null {
  if (!response || typeof response !== "object") return null;

  if (
    "id" in response &&
    typeof response.id === "number" &&
    "sender" in response
  ) {
    return response as ChatMessage;
  }

  if (
    "data" in response &&
    response.data &&
    typeof response.data.id === "number"
  ) {
    return response.data;
  }

  return null;
}

function normalizeMessageText(text: string | null | undefined): string {
  return (text ?? "").trim();
}

function parseMessageTimeMs(createdAt: string | undefined): number | null {
  if (!createdAt) return null;
  const parsed = Date.parse(createdAt);
  return Number.isFinite(parsed) ? parsed : null;
}

function sortByCreatedAt(a: ChatMessage, b: ChatMessage): number {
  const timeA = parseMessageTimeMs(a.created_at) ?? 0;
  const timeB = parseMessageTimeMs(b.created_at) ?? 0;
  return timeA - timeB;
}

function areLikelySameMessage(
  local: ChatMessage,
  server: ChatMessage,
): boolean {
  if (local.sender !== "me" || server.sender !== "me") return false;
  if (local.content_type !== server.content_type) return false;

  if (local.media_url && server.media_url) {
    return local.media_url === server.media_url;
  }

  if (normalizeMessageText(local.text) !== normalizeMessageText(server.text)) {
    return false;
  }

  const localTime = parseMessageTimeMs(local.created_at);
  const serverTime = parseMessageTimeMs(server.created_at);
  if (localTime === null || serverTime === null) return true;

  // Allow small backend timestamp drift when reconciling optimistic records.
  return Math.abs(localTime - serverTime) <= 30_000;
}

export function useMessages(otherUserId: number | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const otherIdRef = useRef(otherUserId);
  otherIdRef.current = otherUserId;

  const fetchMessages = useCallback(async () => {
    const id = otherIdRef.current;
    if (!id) return;

    try {
      const data = await apiGet<ChatMessage[]>(`/api/v1/messages/${id}`);
      if (otherIdRef.current !== id) return;

      const serverMessages = Array.isArray(data) ? data : [];
      setMessages((prev) => {
        const stableClientKeysById = new Map<number, string>();
        for (const message of prev) {
          if (message.id > 0 && message.client_key) {
            stableClientKeysById.set(message.id, message.client_key);
          }
        }

        const serverMessagesWithKeys = serverMessages.map((serverMessage) => ({
          ...serverMessage,
          is_pending: false,
          client_key: stableClientKeysById.get(serverMessage.id),
        }));

        const optimisticPending = prev.filter(
          (message) => message.id < 0 || message.is_pending,
        );

        const stillPending = optimisticPending.filter(
          (localMessage) =>
            !serverMessagesWithKeys.some((serverMessage) =>
              areLikelySameMessage(localMessage, serverMessage),
            ),
        );

        const merged = [...serverMessagesWithKeys, ...stillPending];
        merged.sort(sortByCreatedAt);
        return merged;
      });
    } catch {
      // silently fail on poll errors
    }
  }, []);

  useEffect(() => {
    if (!otherUserId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    fetchMessages().finally(() => setLoading(false));

    pollRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [otherUserId, fetchMessages]);

  const sendMessage = useCallback(
    async (
      text: string,
      options?: {
        content_type?: "text" | "image" | "voice" | "video" | "file";
        media_url?: string;
        media_meta?: {
          duration?: number;
          width?: number;
          height?: number;
          size_bytes?: number;
        };
        reply_to_id?: number;
      },
    ) => {
      const id = otherIdRef.current;
      if (!id) return;

      const optimisticId = -Date.now();
      const optimisticClientKey = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date();
      const timeStr = now
        .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        .replace(/^0/, "");

      const optimistic: ChatMessage = {
        id: optimisticId,
        client_key: optimisticClientKey,
        text: text || null,
        sender: "me",
        sender_id: 0,
        time: timeStr,
        is_read: false,
        created_at: now.toISOString(),
        content_type: options?.content_type || "text",
        media_url: options?.media_url,
        media_meta: options?.media_meta,
        is_edited: false,
        is_deleted: false,
        is_pending: true,
        reactions: [],
        reply_to: undefined,
      };

      setMessages((prev) => [...prev, optimistic]);
      setSending(true);

      try {
        const response = await apiPost<SendMessageResponse>(
          `/api/v1/messages/${id}`,
          {
            text: text || "",
            ...options,
          },
        );

        const sent = unwrapSentMessage(response);
        if (!sent) {
          await fetchMessages();
          return;
        }

        const sentMessage: ChatMessage = {
          ...sent,
          is_pending: false,
          client_key: optimisticClientKey,
        };

        setMessages((prev) => {
          const hasOptimistic = prev.some((m) => m.id === optimisticId);
          if (hasOptimistic) {
            return prev.map((m) => (m.id === optimisticId ? sentMessage : m));
          }

          if (prev.some((m) => m.id === sentMessage.id)) {
            return prev;
          }

          const merged = [...prev, sentMessage];
          merged.sort(sortByCreatedAt);
          return merged;
        });
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      } finally {
        setSending(false);
      }
    },
    [fetchMessages],
  );

  return { messages, loading, sending, sendMessage, refetch: fetchMessages };
}
