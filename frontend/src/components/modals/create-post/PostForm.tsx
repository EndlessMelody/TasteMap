"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, LocateFixed, Loader2, AlertCircle, X, CheckCircle2 } from "lucide-react";
import { Column, Row } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";
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
      style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}
    >
      {/* Review */}
      <Column style={{ gap: 6 }}>
        <Row horizontal="between" vertical="center">
          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: tokens.color.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Your Review
          </label>
          <span style={{ fontSize: "0.6875rem", color: tokens.color.textMuted }}>
            {review.length}/{MAX_REVIEW_LENGTH}
          </span>
        </Row>
        <textarea
          rows={4}
          placeholder="What's your food story?"
          value={review}
          onChange={(e) => {
            if (e.target.value.length <= MAX_REVIEW_LENGTH) {
              onReviewChange(e.target.value);
            }
          }}
          style={{
            width: "100%",
            borderRadius: 12,
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "12px 14px",
            fontSize: 14,
            color: "#27272A",
            resize: "none",
            outline: "none",
            transition: "box-shadow 0.15s, border-color 0.15s",
            lineHeight: 1.6,
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
      <Column style={{ gap: 6 }}>
        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: tokens.color.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Location{" "}
          <span style={{ textTransform: "none", fontWeight: 400 }}>(optional)</span>
        </label>

        <Row vertical="center" style={{ gap: "8px" }}>
          {/* Text input */}
          <Column style={{ flex: 1 }}>
            <MapPin
              size={15}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: locationName ? tokens.color.warm : tokens.color.textMuted,
              }}
            />
            <input
              type="text"
              placeholder="Where did you eat?"
              value={locationName}
              onChange={(e) => onLocationNameChange(e.target.value)}
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
                paddingLeft: 36,
                paddingRight: 36,
                paddingTop: 10,
                paddingBottom: 10,
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
            {locationName && (
              <button
                onClick={handleClearLocation}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: "none",
                  background: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#A1A1AA",
                  cursor: "pointer",
                  transition: "background-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#52525B";
                  e.currentTarget.style.backgroundColor = "#F1F5F9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#A1A1AA";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <X size={12} />
              </button>
            )}
          </Column>

          {/* GPS detect button */}
          <motion.button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            whileHover={!isDetecting ? { scale: 1.06 } : undefined}
            whileTap={!isDetecting ? { scale: 0.94 } : undefined}
            title={isDetecting ? "Đang xác định…" : "Tự động xác định vị trí"}
            style={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: 12,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              ...(isDetecting
                ? { backgroundColor: "#FFF7ED", color: "#FDBA74", cursor: "wait" }
                : { backgroundColor: "#F97316", color: "#FFFFFF", boxShadow: "0 4px 6px -1px #FED7AA", cursor: "pointer" }),
            }}
            onMouseEnter={(e) => { if (!isDetecting) e.currentTarget.style.backgroundColor = "#EA580C"; }}
            onMouseLeave={(e) => { if (!isDetecting) e.currentTarget.style.backgroundColor = "#F97316"; }}
          >
            {isDetecting ? (
              <Loader2 size={17} style={{ animation: "spin 0.8s linear infinite" }} />
            ) : (
              <LocateFixed size={17} />
            )}
          </motion.button>
        </Row>

        {/* Status feedback */}
        <AnimatePresence mode="wait">
          {status === "success" && locationName && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "0 4px" }}
            >
              <CheckCircle2 size={13} style={{ marginTop: 2, flexShrink: 0, color: "#10B981" }} />
              <Column style={{ gap: 2 }}>
                <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: tokens.color.success }}>
                  High-precision fix acquired
                </span>
                <span style={{ fontSize: "0.625rem", color: tokens.color.textMuted, lineHeight: 1.4 }}>
                  {locationName}
                </span>
              </Column>
            </motion.div>
          )}
          {status === "error" && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "0 4px" }}
            >
              <AlertCircle size={13} style={{ marginTop: 2, flexShrink: 0, color: "#F87171" }} />
              <span style={{ fontSize: 11, color: "#EF4444", lineHeight: 1.4 }}>{error}</span>
            </motion.div>
          )}
          {isDetecting && (
            <motion.div
              key="detecting"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 4px" }}
            >
              <span style={{ fontSize: 11, color: "#F97316", fontWeight: 500 }}>
                {status === "acquiring"
                  ? "Đang xác định vị trí…"
                  : "Resolving Vietnamese address…"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </Column>

      {/* Tags */}
      <TagInput tags={tags} onTagsChange={onTagsChange} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
