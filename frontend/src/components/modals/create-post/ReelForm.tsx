"use client";

import React from "react";
import { motion } from "framer-motion";
import { Column, Row } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";
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
      style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}
    >
      {/* Caption */}
      <Column style={{ gap: 6 }}>
        <Row horizontal="between" vertical="center">
          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: tokens.color.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Caption
          </label>
          <span style={{ fontSize: "0.6875rem", color: tokens.color.textMuted }}>
            {title.length}/{MAX_REEL_TITLE_LENGTH}
          </span>
        </Row>
        <input
          placeholder="Add a hook for Discover…"
          value={title}
          onChange={(e) => {
            if (e.target.value.length <= MAX_REEL_TITLE_LENGTH) {
              onTitleChange(e.target.value);
            }
          }}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 12,
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "0 14px",
            fontSize: 14,
            color: "#27272A",
            outline: "none",
            transition: "box-shadow 0.15s, border-color 0.15s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = "0 0 0 2px #FDBA74";
            e.currentTarget.style.borderColor = "#FB923C";
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.borderColor = "#E2E8F0";
          }}
        />
      </Column>

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
