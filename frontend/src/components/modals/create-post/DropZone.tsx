"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, X, ImageIcon } from "lucide-react";
import { Column } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";

interface DropZoneProps {
  accept: string;
  value?: string;
  onUpload: (file: File) => void;
  onClear: () => void;
  isUploading?: boolean;
  placeholder?: string;
  previewType?: "image" | "video";
}

export function DropZone({
  accept,
  value,
  onUpload,
  onClear,
  isUploading,
  placeholder = "Drag & drop or click to upload",
  previewType = "image",
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); }, []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) onUpload(file);
    },
    [onUpload],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  if (value) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl overflow-hidden"
        style={{ aspectRatio: previewType === "video" ? "16/9" : "16/10" }}
      >
        {previewType === "image" ? (
          <img src={value} alt="preview" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Column center style={{ position: "absolute", inset: 0, backgroundColor: tokens.color.bg }}>
            <span style={{ fontSize: "0.875rem", color: tokens.color.textMuted }}>Video uploaded ✓</span>
          </Column>
        )}
        <button
          onClick={onClear}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <X size={14} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`flex flex-col items-center justify-center gap-2 py-8 px-6 rounded-xl border-2 border-dashed cursor-pointer text-center transition-colors ${
        isDragOver ? "border-orange-400 bg-orange-50/50" : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30"
      }`}
    >
      <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />

      <Column
        center
        style={{
          width: 44,
          height: 44,
          borderRadius: "12px",
          background: `linear-gradient(135deg, ${tokens.color.warm}, rgba(255,107,53,0.7))`,
          color: "white",
          boxShadow: "0 4px 12px rgba(255,107,53,0.3)",
          flexShrink: 0,
        }}
      >
        {isUploading ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <Upload size={18} />
          </motion.div>
        ) : (
          <ImageIcon size={18} />
        )}
      </Column>
      <p className="text-sm font-semibold text-zinc-700">
        {isUploading ? "Uploading…" : placeholder}
      </p>
      <p className="text-xs text-zinc-400">Click or drag files here</p>
    </motion.div>
  );
}
