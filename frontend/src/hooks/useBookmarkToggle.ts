"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ApiError, apiPost } from "@/lib/api";
import { useSocialStore } from "@/store/socialStore";

export type BookmarkEntityType = "post" | "reel";

interface UseBookmarkToggleOptions {
  entityType: BookmarkEntityType;
  entityId: number;
  isBookmarked: boolean;
}

interface ToggleBookmarkResponse {
  action?: "created" | "deleted";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Không thể cập nhật mục đã lưu. Vui lòng thử lại.";
}

export function useBookmarkToggle({
  entityType,
  entityId,
  isBookmarked,
}: UseBookmarkToggleOptions) {
  const updatePost = useSocialStore((state) => state.updatePost);
  const updateReel = useSocialStore((state) => state.updateReel);
  const [optimisticValue, setOptimisticValue] = useState<boolean | null>(null);
  const [isPending, setIsPending] = useState(false);

  const resolvedIsBookmarked = optimisticValue ?? isBookmarked;

  useEffect(() => {
    if (!isPending) {
      setOptimisticValue(null);
    }
  }, [entityId, isBookmarked, isPending]);

  const syncEntityState = (nextValue: boolean) => {
    if (entityType === "post") {
      updatePost(entityId, { isSaved: nextValue });
      return;
    }

    updateReel(entityId, { isSaved: nextValue });
  };

  const toggleBookmark = async () => {
    if (isPending) return;

    const previousValue = resolvedIsBookmarked;
    const nextValue = !previousValue;

    setOptimisticValue(nextValue);
    syncEntityState(nextValue);
    setIsPending(true);

    try {
      const payload =
        entityType === "post" ? { post_id: entityId } : { reel_id: entityId };
      const response = await apiPost<ToggleBookmarkResponse>(
        "/api/v1/bookmarks/toggle",
        payload,
      );
      const confirmedValue = response.action === "created";

      setOptimisticValue(confirmedValue);
      syncEntityState(confirmedValue);
    } catch (error) {
      setOptimisticValue(previousValue);
      syncEntityState(previousValue);
      toast.error(getErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  };

  return {
    isBookmarked: resolvedIsBookmarked,
    isPending,
    toggleBookmark,
  };
}
