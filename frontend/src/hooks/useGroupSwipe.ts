"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { apiPost, apiGet } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GroupCard {
  id: number;
  name: string;
  match_score: number;
  distance_km?: number;
  image_url?: string;
  price_range?: string;
  reason?: string;
  /** Card forced by a teammate's Star action */
  is_starred_by_teammate?: boolean;
}

export interface GroupSyncData {
  group_vector: number[];
  vault_count: number;
  starred_cards: {
    location_id: number;
    starred_by: number;
    name?: string;
  }[];
  members_status: {
    user_id: number;
    swipe_count: number;
    is_ready: boolean;
  }[];
}

export interface VaultItem {
  location_id: number;
  name: string;
  image_url?: string;
  votes: number;
  voters: number[];
}

export interface FinishResult {
  location_id: number;
  name: string;
  group_score: number;
  image_url?: string;
  member_scores?: { user_id: number; score: number }[];
  in_vault: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseGroupSwipeOptions {
  groupId: string;
  enabled: boolean;
  lat?: number;
  lng?: number;
}

export function useGroupSwipe({
  groupId,
  enabled,
  lat = 10.762622,
  lng = 106.660172,
}: UseGroupSwipeOptions) {
  // Card state
  const [cards, setCards] = useState<GroupCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  // Sync state (polled every 3s)
  const [groupVector, setGroupVector] = useState<number[]>([]);
  const [vaultCount, setVaultCount] = useState(0);
  const [starredCards, setStarredCards] = useState<GroupSyncData["starred_cards"]>([]);

  // Swiping state
  const [swiping, setSwiping] = useState(false);

  // Finish results
  const [results, setResults] = useState<FinishResult[] | null>(null);
  const [finishing, setFinishing] = useState(false);

  // Vault
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [loadingVault, setLoadingVault] = useState(false);

  // Track which starred cards we've already inserted (to avoid duplicates on poll)
  const seenStarredRef = useRef<Set<number>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch next batch of cards from Minimax Referee ──
  const fetchCards = useCallback(async () => {
    if (!groupId || !enabled) return;
    setLoadingCards(true);
    try {
      // Backend returns { place_id, name, group_score, image_url, ... }
      // Map to GroupCard { id, name, match_score, ... }
      const res = await apiPost<{ recommendations: Record<string, unknown>[] }>(
        `/api/v1/groups/${groupId}/recommend`,
        { lat, lng, category: "food", top_n: 10 },
      );
      const rawRecs = res?.recommendations ?? [];
      const recs: GroupCard[] = rawRecs.map((r) => ({
        id: (r.place_id ?? r.id) as number,
        name: (r.name ?? "Unknown") as string,
        match_score: Math.round(((r.group_score as number) ?? 0) * 100),
        image_url: (r.image_url as string) ?? undefined,
        price_range: (r.price_range as string) ?? undefined,
        distance_km: (r.distance_km as number) ?? undefined,
        reason: (r.compensation_note as string) ?? undefined,
      }));
      setCards((prev) => {
        // Merge: keep existing cards that haven't been swiped, add new ones
        const existingIds = new Set(prev.map((c) => c.id));
        const newCards = recs.filter((c) => !existingIds.has(c.id));
        return [...prev, ...newCards];
      });
    } catch (err) {
      console.error("[useGroupSwipe] fetchCards error:", err);
    } finally {
      setLoadingCards(false);
    }
  }, [groupId, enabled, lat, lng]);

  // ── Swipe action ──
  const swipe = useCallback(
    async (locationId: number, action: "LIKED" | "SKIPPED" | "STARRED") => {
      if (swiping) return;
      setSwiping(true);
      try {
        await apiPost(`/api/v1/groups/${groupId}/swipe`, {
          location_id: locationId,
          action,
        });
        // Remove card from local deck
        setCards((prev) => prev.filter((c) => c.id !== locationId));
      } catch (err) {
        console.error("[useGroupSwipe] swipe error:", err);
      } finally {
        setSwiping(false);
      }
    },
    [groupId, swiping],
  );

  const swipeRight = useCallback(
    (locationId: number) => swipe(locationId, "LIKED"),
    [swipe],
  );

  const swipeLeft = useCallback(
    (locationId: number) => swipe(locationId, "SKIPPED"),
    [swipe],
  );

  const star = useCallback(
    (locationId: number) => swipe(locationId, "STARRED"),
    [swipe],
  );

  // ── Undo ──
  const undo = useCallback(async () => {
    try {
      const res = await apiPost<{
        status: string;
        undone_interaction_id?: number;
        reverted_vector?: number[];
      }>(`/api/v1/groups/${groupId}/undo`);
      if (res?.status === "undone") {
        // Refetch cards to include the undone card
        await fetchCards();
      }
    } catch (err) {
      console.error("[useGroupSwipe] undo error:", err);
    }
  }, [groupId, fetchCards]);

  // ── Sync (poll) ──
  const sync = useCallback(async () => {
    if (!groupId || !enabled) return;
    try {
      const res = await apiGet<GroupSyncData>(
        `/api/v1/groups/${groupId}/sync`,
      );
      if (!res) return;

      setGroupVector(res.group_vector ?? []);
      setVaultCount(res.vault_count ?? 0);

      // Check for new starred cards from teammates
      const newStarred = (res.starred_cards ?? []).filter(
        (sc) => !seenStarredRef.current.has(sc.location_id),
      );
      if (newStarred.length > 0) {
        setStarredCards(res.starred_cards);
        // Insert starred cards at the front of the deck
        for (const sc of newStarred) {
          seenStarredRef.current.add(sc.location_id);
          setCards((prev) => {
            // Don't duplicate if already in deck
            if (prev.some((c) => c.id === sc.location_id)) return prev;
            return [
              {
                id: sc.location_id,
                name: sc.name ?? "Starred Place",
                match_score: 100,
                is_starred_by_teammate: true,
              },
              ...prev,
            ];
          });
        }
      }
    } catch {
      // silently ignore sync errors
    }
  }, [groupId, enabled]);

  // ── Fetch Vault ──
  const fetchVault = useCallback(async () => {
    setLoadingVault(true);
    try {
      const res = await apiGet<{ vault: VaultItem[] }>(
        `/api/v1/groups/${groupId}/vault`,
      );
      setVault(res?.vault ?? []);
    } catch {
      // ignore
    } finally {
      setLoadingVault(false);
    }
  }, [groupId]);

  // ── Finish (Host only) ──
  const finish = useCallback(
    async (topN: number = 5) => {
      setFinishing(true);
      try {
        // Backend returns { final_resolutions: [...] } with place_id
        const res = await apiPost<{ final_resolutions?: Record<string, unknown>[] }>(
          `/api/v1/groups/${groupId}/finish`,
          { top_n: topN },
        );
        const raw = res?.final_resolutions ?? [];
        const mapped: FinishResult[] = raw.map((r) => ({
          location_id: (r.place_id ?? r.location_id) as number,
          name: (r.name ?? "Unknown") as string,
          group_score: Math.round(((r.group_score as number) ?? 0) * 100),
          image_url: (r.image_url as string) ?? undefined,
          member_scores: (r.member_scores as { user_id: number; score: number }[]) ?? [],
          in_vault: (r.in_vault as boolean) ?? false,
        }));
        setResults(mapped);
        return mapped;
      } catch (err) {
        console.error("[useGroupSwipe] finish error:", err);
        return [];
      } finally {
        setFinishing(false);
      }
    },
    [groupId],
  );

  // ── Auto-fetch cards on mount + auto-poll sync ──
  useEffect(() => {
    if (!enabled) return;

    fetchCards();

    // Poll sync every 3 seconds
    pollRef.current = setInterval(sync, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [enabled, fetchCards, sync]);

  // ── Auto-refetch when cards run low ──
  useEffect(() => {
    if (enabled && cards.length <= 2 && !loadingCards) {
      fetchCards();
    }
  }, [cards.length, enabled, loadingCards, fetchCards]);

  return {
    // Cards
    cards,
    loadingCards,
    fetchCards,

    // Swipe actions
    swipeRight,
    swipeLeft,
    star,
    undo,
    swiping,

    // Sync data
    groupVector,
    vaultCount,
    starredCards,

    // Vault
    vault,
    loadingVault,
    fetchVault,

    // Finish
    results,
    finishing,
    finish,
  };
}
