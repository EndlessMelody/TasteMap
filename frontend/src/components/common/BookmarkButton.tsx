"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";

import { useBookmarkToggle, type BookmarkEntityType } from "@/hooks/useBookmarkToggle";
import { tokens } from "@/styles/tokens";

interface BookmarkButtonProps {
  entityType: BookmarkEntityType;
  entityId: number;
  isBookmarked?: boolean;
  size?: number;
  iconSize?: number;
  inactiveColor?: string;
  activeColor?: string;
  stopPropagation?: boolean;
  title?: string;
  ariaLabel?: string;
  style?: React.CSSProperties;
}

export function BookmarkButton({
  entityType,
  entityId,
  isBookmarked = false,
  size = 32,
  iconSize = 16,
  inactiveColor = tokens.color.textMuted,
  activeColor = tokens.color.warm,
  stopPropagation = true,
  title,
  ariaLabel,
  style,
}: BookmarkButtonProps) {
  const {
    isBookmarked: resolvedIsBookmarked,
    isPending,
    toggleBookmark,
  } = useBookmarkToggle({
    entityType,
    entityId,
    isBookmarked,
  });

  return (
    <motion.button
      type="button"
      whileTap={isPending ? {} : { scale: 0.92 }}
      animate={
        resolvedIsBookmarked
          ? {
              scale: [1, 1.08, 1],
            }
          : { scale: 1 }
      }
      transition={{ duration: 0.22, ease: "easeOut" }}
      onClick={(event) => {
        if (stopPropagation) {
          event.stopPropagation();
        }
        void toggleBookmark();
      }}
      disabled={isPending}
      title={title}
      aria-label={
        ariaLabel ??
        (resolvedIsBookmarked ? "Bỏ lưu mục này" : "Lưu mục này")
      }
      aria-pressed={resolvedIsBookmarked}
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "999px",
        border: `1px solid ${
          resolvedIsBookmarked ? `${activeColor}33` : "transparent"
        }`,
        backgroundColor: resolvedIsBookmarked ? `${activeColor}18` : "transparent",
        color: resolvedIsBookmarked ? activeColor : inactiveColor,
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.6 : 1,
        pointerEvents: isPending ? "none" : "auto",
        transition:
          "background-color 150ms var(--dsc-ease-out), color 150ms var(--dsc-ease-out), border-color 150ms var(--dsc-ease-out), opacity 150ms var(--dsc-ease-out)",
        ...style,
      }}
    >
      <Bookmark
        size={iconSize}
        strokeWidth={resolvedIsBookmarked ? 2.4 : 2.2}
        color="currentColor"
        fill={resolvedIsBookmarked ? "currentColor" : "none"}
      />
    </motion.button>
  );
}
