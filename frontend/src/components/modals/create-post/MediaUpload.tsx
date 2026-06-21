"use client";

import React from "react";
import { Column } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";
import { DropZone } from "./DropZone";

interface MediaUploadProps {
  label: string;
  optional?: boolean;
  accept: string;
  value: string;
  onUpload: (file: File) => void;
  onClear: () => void;
  isUploading: boolean;
  previewType: "image" | "video";
  hint?: string;
}

export function MediaUpload({
  label,
  optional = false,
  accept,
  value,
  onUpload,
  onClear,
  isUploading,
  previewType,
  hint,
}: MediaUploadProps) {
  return (
    <Column style={{ gap: 6 }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: tokens.color.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}{" "}
        {optional && <span style={{ textTransform: "none", fontWeight: 400 }}>(optional)</span>}
      </label>
      <DropZone
        accept={accept}
        value={value}
        onUpload={onUpload}
        onClear={onClear}
        isUploading={isUploading}
        previewType={previewType}
        placeholder={previewType === "image" ? "Upload cover image" : "Upload video file"}
      />
      {hint && <p style={{ fontSize: "0.6875rem", color: tokens.color.textMuted, margin: 0 }}>{hint}</p>}
    </Column>
  );
}
