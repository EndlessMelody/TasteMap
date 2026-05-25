"use client";

import React from "react";
import { motion } from "framer-motion";
import { MediaUpload } from "./MediaUpload";

interface ReelFormProps {
  title: string;
  onTitleChange: (value: string) => void;
  videoUrl: string;
  onVideoUpload: (file: File) => void;
  onVideoClear: () => void;
  isUploadingVideo: boolean;
  thumbnailUrl: string;
  onThumbnailUpload: (file: File) => void;
  onThumbnailClear: () => void;
  isUploadingThumbnail: boolean;
}

const MAX_REEL_TITLE_LENGTH = 120;

export function ReelForm({
  title,
  onTitleChange,
  videoUrl,
  onVideoUpload,
  onVideoClear,
  isUploadingVideo,
  thumbnailUrl,
  onThumbnailUpload,
  onThumbnailClear,
  isUploadingThumbnail,
}: ReelFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.16 }}
      className="flex flex-col gap-4 w-full"
    >
      {/* Caption */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Caption
          </label>
          <span className="text-[11px] text-zinc-400">
            {title.length}/{MAX_REEL_TITLE_LENGTH}
          </span>
        </div>
        <input
          placeholder="Add a hook for Discover…"
          value={title}
          onChange={(e) => {
            if (e.target.value.length <= MAX_REEL_TITLE_LENGTH) {
              onTitleChange(e.target.value);
            }
          }}
          className="w-full h-12 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-zinc-800 placeholder-zinc-300 outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-shadow"
        />
      </div>

      {/* Video */}
      <MediaUpload
        label="Video"
        accept="video/mp4,video/webm"
        value={videoUrl}
        onUpload={onVideoUpload}
        onClear={onVideoClear}
        isUploading={isUploadingVideo}
        previewType="video"
        hint="MP4, WEBM up to 100MB"
      />

      {/* Thumbnail */}
      <MediaUpload
        label="Thumbnail"
        optional
        accept="image/jpeg,image/png,image/webp"
        value={thumbnailUrl}
        onUpload={onThumbnailUpload}
        onClear={onThumbnailClear}
        isUploading={isUploadingThumbnail}
        previewType="image"
        hint="JPG, PNG, WEBP up to 10MB"
      />
    </motion.div>
  );
}
