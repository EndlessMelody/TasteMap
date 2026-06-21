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
        style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: previewType === "video" ? "16/9" : "16/10" }}
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
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "none",
            backgroundColor: "rgba(0,0,0,0.5)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.7)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.5)"; }}
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
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "32px 24px",
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: "dashed",
        cursor: "pointer",
        textAlign: "center",
        transition: "border-color 0.15s, background-color 0.15s",
        borderColor: isDragOver ? "#FB923C" : "#E2E8F0",
        backgroundColor: isDragOver ? "rgba(255,247,237,0.5)" : "#FFFFFF",
      }}
      onMouseEnter={(e) => {
        if (!isDragOver) {
          e.currentTarget.style.borderColor = "#FDBA74";
          e.currentTarget.style.backgroundColor = "rgba(255,247,237,0.3)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragOver) {
          e.currentTarget.style.borderColor = "#E2E8F0";
          e.currentTarget.style.backgroundColor = "#FFFFFF";
        }
      }}
    >
      <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} style={{ display: "none" }} />

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
      <p style={{ fontSize: 14, fontWeight: 600, color: "#3F3F46", margin: 0 }}>
        {isUploading ? "Uploading…" : placeholder}
      </p>
      <p style={{ fontSize: 12, color: "#A1A1AA", margin: 0 }}>Click or drag files here</p>
    </motion.div>
  );
}
