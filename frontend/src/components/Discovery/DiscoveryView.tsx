"use client";

import React, { useRef } from "react";
import { Column, Heading, Text } from "@/components/OnceUI";
import { CardStack } from "./CardStack";
import { ActionControls } from "./ActionControls";
import { LocationData } from "./SwipeCard";
import { useFeedCards, FeedCard } from "@/hooks/useFeedCards";
import { apiPost } from "@/lib/api";

// ─── Adapter: FeedCard → LocationData ────────────────────────────────────────

function adaptCard(card: FeedCard): LocationData {
  const tags = card.tags ?? [];
  const meta = [
    card.price_range,
    card.distance_km != null ? `${card.distance_km.toFixed(1)} km` : null,
    card.match_percent != null ? `${card.match_percent}% match` : null,
    card.rating != null && card.rating > 0 ? `⭐ ${card.rating}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const fallbackImage =
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1200&fit=crop";

  return {
    id: String(card.id),
    title: card.name,
    description:
      meta ||
      (tags.length > 0 ? tags.join(", ") : null) ||
      card.address ||
      card.open_hours ||
      card.category ||
      "Địa điểm TasteMap",
    imageUrl:
      card.image_url && card.image_url.trim() !== ""
        ? card.image_url
        : fallbackImage,
  };
}


// ─── Swipe batch sender ───────────────────────────────────────────────────────

interface SwipeAction {
  place_id: number;
  direction: "RIGHT" | "LEFT";
  client_timestamp: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const DiscoveryView: React.FC = () => {
  const { cards, loading, error } = useFeedCards({ type: "place", limit: 10 });

  // Accumulate swipe actions and flush in batch
  const pendingSwipes = useRef<SwipeAction[]>([]);
  const flushTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushSwipes = async (domain: string = "place") => {
    if (pendingSwipes.current.length === 0) return;
    const batch = [...pendingSwipes.current];
    pendingSwipes.current = [];
    try {
      await apiPost("/api/v1/interactions/swipe-batch", {
        // Guest session — use a stable device key stored in sessionStorage
        user_id:
          typeof window !== "undefined"
            ? (sessionStorage.getItem("guest_id") ?? "guest-anon")
            : "guest-anon",
        domain,
        actions: batch,
      });
    } catch {
      // Non-critical — silently ignore swipe sync failures
    }
  };

  const queueSwipe = (id: string, direction: "RIGHT" | "LEFT") => {
    pendingSwipes.current.push({
      place_id: Number(id),
      direction,
      client_timestamp: Date.now(),
    });

    // Debounce flush: send batch after 1.5s of inactivity
    if (flushTimeout.current) clearTimeout(flushTimeout.current);
    flushTimeout.current = setTimeout(() => flushSwipes("place"), 1500);
  };

  // ─── Render States ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <Column align="center" justify="center" fillHeight fillWidth background="page" gap="16">
        <div
          style={{
            width: 48,
            height: 48,
            border: "3px solid var(--border-medium)",
            borderTopColor: "var(--brand-solid-strong)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <Text variant="body-default-m" style={{ color: "var(--text-tertiary)" }}>
          Đang tải địa điểm...
        </Text>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </Column>
    );
  }

  if (error) {
    return (
      <Column align="center" justify="center" fillHeight fillWidth background="page" gap="8">
        <Text variant="heading-strong-s" style={{ color: "var(--danger-on-solid)" }}>
          Không thể kết nối API
        </Text>
        <Text variant="body-default-s" style={{ color: "var(--text-tertiary)" }}>
          {error}
        </Text>
      </Column>
    );
  }

  if (cards.length === 0) {
    return (
      <Column align="center" justify="center" fillHeight fillWidth background="page" gap="12">
        <Heading variant="display-default-xs" padding="16">
          Không có địa điểm nào
        </Heading>
        <Text variant="body-default-m" style={{ color: "var(--text-tertiary)" }}>
          Hãy nhờ Admin thêm dữ liệu vào hệ thống nhé!
        </Text>
      </Column>
    );
  }

  const locationCards = cards.map(adaptCard);

  return (
    <Column align="center" justify="center" fillHeight fillWidth background="page">
      <Heading variant="display-default-xs" padding="16">
        Khám Phá
      </Heading>

      <Column
        align="center"
        justify="center"
        gap="16"
        style={{ width: "100%", maxWidth: "400px", flex: 1 }}
      >
        <CardStack
          items={locationCards}
          onSwipeRight={(id) => queueSwipe(id, "RIGHT")}
          onSwipeLeft={(id) => queueSwipe(id, "LEFT")}
        />

        <ActionControls
          onPass={() => {
            const topCard = locationCards[locationCards.length - 1];
            if (topCard) queueSwipe(topCard.id, "LEFT");
          }}
          onLike={() => {
            const topCard = locationCards[locationCards.length - 1];
            if (topCard) queueSwipe(topCard.id, "RIGHT");
          }}
        />
      </Column>
    </Column>
  );
};
