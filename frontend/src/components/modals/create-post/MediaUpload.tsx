"use client";

import React from "react";
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
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        {label}{" "}
        {optional && <span className="normal-case font-normal text-zinc-400">(optional)</span>}
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
      {hint && <p className="text-[11px] text-zinc-400">{hint}</p>}
    </div>
  );
}
