"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, LocateFixed, Loader2, AlertCircle, X, CheckCircle2 } from "lucide-react";
import { RatingInput } from "./RatingInput";
import { TagInput } from "./TagInput";
import { MediaUpload } from "./MediaUpload";
import { useLocation } from "@/hooks/useLocation";

interface PostFormProps {
  review: string;
  onReviewChange: (value: string) => void;
  rating: number;
  onRatingChange: (value: number) => void;
  locationName: string;
  onLocationNameChange: (value: string) => void;
  imageUrl: string;
  isUploadingImage: boolean;
  onImageUpload: (file: File) => void;
  onImageClear: () => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const MAX_REVIEW_LENGTH = 600;

export function PostForm({
  review,
  onReviewChange,
  rating,
  onRatingChange,
  locationName,
  onLocationNameChange,
  imageUrl,
  isUploadingImage,
  onImageUpload,
  onImageClear,
  tags,
  onTagsChange,
}: PostFormProps) {
  const { status, error, detect, reset } = useLocation();
  const isDetecting = status === "acquiring" || status === "geocoding";

  const handleDetectLocation = async () => {
    const result = await detect();
    if (result) {
      onLocationNameChange(result.address.formatted);
    }
  };

  const handleClearLocation = () => {
    onLocationNameChange("");
    reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.16 }}
      className="flex flex-col gap-4 w-full"
    >
      {/* Review */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Your Review
          </label>
          <span className="text-[11px] text-zinc-400">
            {review.length}/{MAX_REVIEW_LENGTH}
          </span>
        </div>
        <textarea
          rows={4}
          placeholder="What's your food story?"
          value={review}
          onChange={(e) => {
            if (e.target.value.length <= MAX_REVIEW_LENGTH) {
              onReviewChange(e.target.value);
            }
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-zinc-800 placeholder-zinc-300 resize-none outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-shadow leading-relaxed"
        />
      </div>

      {/* Rating */}
      <RatingInput value={rating} onChange={onRatingChange} />

      {/* Cover Image */}
      <MediaUpload
        label="Cover Image"
        optional
        accept="image/jpeg,image/png,image/webp"
        value={imageUrl}
        onUpload={onImageUpload}
        onClear={onImageClear}
        isUploading={isUploadingImage}
        previewType="image"
        hint="JPG, PNG, WEBP up to 10MB"
      />

      {/* Location — GPS-powered */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Location{" "}
          <span className="normal-case font-normal text-zinc-400">(optional)</span>
        </label>

        <div className="relative flex items-center gap-2">
          {/* Text input */}
          <div className="relative flex-1">
            <MapPin
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: locationName ? "#ff6b35" : "#a1a1aa" }}
            />
            <input
              type="text"
              placeholder="Where did you eat?"
              value={locationName}
              onChange={(e) => onLocationNameChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 py-2.5 text-sm text-zinc-800 placeholder-zinc-300 outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-shadow"
            />
            {locationName && (
              <button
                onClick={handleClearLocation}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-slate-100 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* GPS detect button */}
          <motion.button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            whileHover={!isDetecting ? { scale: 1.06 } : undefined}
            whileTap={!isDetecting ? { scale: 0.94 } : undefined}
            title={isDetecting ? "Đang xác định…" : "Tự động xác định vị trí"}
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isDetecting
                ? "bg-orange-50 text-orange-300 cursor-wait"
                : "bg-orange-500 text-white shadow-md shadow-orange-200 hover:bg-orange-600"
            }`}
          >
            {isDetecting ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <LocateFixed size={17} />
            )}
          </motion.button>
        </div>

        {/* Status feedback */}
        <AnimatePresence mode="wait">
          {status === "success" && locationName && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-1.5 px-1"
            >
              <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0 text-emerald-500" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-emerald-600">
                  High-precision fix acquired
                </span>
                <span className="text-[10px] text-zinc-400 leading-snug">
                  {locationName}
                </span>
              </div>
            </motion.div>
          )}
          {status === "error" && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-1.5 px-1"
            >
              <AlertCircle size={13} className="mt-0.5 flex-shrink-0 text-red-400" />
              <span className="text-[11px] text-red-500 leading-snug">{error}</span>
            </motion.div>
          )}
          {isDetecting && (
            <motion.div
              key="detecting"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 px-1"
            >
              <span className="text-[11px] text-orange-500 font-medium">
                {status === "acquiring"
                  ? "Đang xác định vị trí…"
                  : "Resolving Vietnamese address…"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tags */}
      <TagInput tags={tags} onTagsChange={onTagsChange} />
    </motion.div>
  );
}
