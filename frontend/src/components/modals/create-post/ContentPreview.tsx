"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ImageIcon } from "lucide-react";
import { ComposerType } from "@/types/contentCreation";

interface ContentPreviewProps {
  type: ComposerType;
  username?: string;
  reviewText: string;
  reelTitle: string;
  imageUrl: string;
  thumbnailUrl: string;
  rating: number;
  tags: string[];
  videoUrl: string;
}

const BRAND = "#ff6b35";

const ratingLabels: Record<number, string> = {
  1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent",
};

export function ContentPreview({
  type,
  username,
  reviewText,
  reelTitle,
  imageUrl,
  thumbnailUrl,
  rating,
  tags,
}: ContentPreviewProps) {
  const isPost = type === "post";
  const heroImage = isPost ? imageUrl || null : thumbnailUrl || null;
  const textPreview = isPost
    ? reviewText || "Your review preview will appear here…"
    : reelTitle || "Your reel caption preview will appear here…";
  const destination = isPost ? "Foodie Feed" : "Discover Reels";

  return (
    <div className="overflow-hidden">
      {/* Destination pill */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <span className="text-xs font-medium text-zinc-400">Publishing to</span>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-500">
          {destination}
        </span>
      </div>

      {/* Media */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: isPost ? "4/3" : "9/16" }}
      >
        <AnimatePresence mode="wait">
          {heroImage ? (
            <motion.img
              key="image"
              src={heroImage}
              alt="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: "linear-gradient(135deg, #FFE8DC 0%, #FFF4ED 50%, #FFE8DC 100%)" }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-orange-100">
                <ImageIcon size={20} color={BRAND} />
              </div>
              <span className="text-xs font-medium text-orange-400">
                {isPost ? "Post Cover" : "Reel Thumbnail"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content info */}
      <div className="px-4 py-3 flex flex-col gap-2">
        <p className="text-sm font-bold text-zinc-800">@{username || "creator"}</p>

        <p
          className="text-xs leading-relaxed text-zinc-600 line-clamp-4 min-h-[3rem]"
        >
          {textPreview}
        </p>

        {isPost && rating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={13}
                  color={star <= rating ? BRAND : "#D1D1D6"}
                  fill={star <= rating ? BRAND : "none"}
                  strokeWidth={star <= rating ? 0 : 1.5}
                />
              ))}
            </div>
            <span className="text-xs font-medium" style={{ color: BRAND }}>
              {ratingLabels[rating]}
            </span>
          </div>
        )}

        {isPost && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-500"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[11px] text-zinc-400">+{tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
