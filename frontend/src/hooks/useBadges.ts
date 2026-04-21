"use client";

import { useEffect, useMemo } from "react";
import { useBadgeStore } from "@/store/badgeStore";

export function useBadges(userId?: number) {
  const { badgesByUser, loading, error, fetchUserBadges } = useBadgeStore();

  useEffect(() => {
    // Only fetch if we don't have data for this user
    const key = userId || -1;
    if (!badgesByUser[key]) {
      fetchUserBadges(userId);
    }
  }, [userId, fetchUserBadges, badgesByUser]);

  const badges = useMemo(() => {
    const key = userId || -1;
    return badgesByUser[key] || [];
  }, [userId, badgesByUser]);

  return {
    badges,
    totalBadges: badges.length, // Or use a static value if there's a global pool
    loading,
    error,
    refresh: () => fetchUserBadges(userId)
  };
}
