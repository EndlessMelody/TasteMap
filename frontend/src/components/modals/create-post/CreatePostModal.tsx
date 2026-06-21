"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Column, Row } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";

const WARM_GRADIENT = { light: "#ff8c5a" };
const ORB_COLORS = { coral: "#ff8c5a", amber: "#ffb347" };
import { getInitials } from "@/lib/avatar";
import { X, Utensils, Clapperboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiPost, apiUploadMedia, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import type {
  ComposerType,
  ContentCreatedEvent,
  CreatePostPayload,
  CreateReelPayload,
  CreatedPostResponse,
  CreatedReelResponse,
} from "@/types/contentCreation";

import { PostForm } from "./PostForm";
import { ReelForm } from "./ReelForm";
import { ContentPreview } from "./ContentPreview";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_REEL_VIDEO_BYTES = 100 * 1024 * 1024;

export interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (event: ContentCreatedEvent) => void;
  initialType?: ComposerType;
}

const TABS: { value: ComposerType; label: string; icon: React.FC<{ size?: number }> }[] =
  [
    { value: "post", label: "Foodie Feed", icon: Utensils },
    { value: "reel", label: "Discover Reel", icon: Clapperboard },
  ];

export function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
  initialType = "post",
}: CreatePostModalProps) {
  const { user } = useAuth();

  const [postType, setPostType] = useState<ComposerType>(initialType);

  // Sync postType when modal opens or initialType changes
  useEffect(() => {
    if (isOpen) {
      setPostType(initialType);
    }
  }, [isOpen, initialType]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [review, setReview] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [locationName, setLocationName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [reelTitle, setReelTitle] = useState("");
  const [reelVideoUrl, setReelVideoUrl] = useState("");
  const [reelThumbnailUrl, setReelThumbnailUrl] = useState("");

  const [isUploadingPostImage, setIsUploadingPostImage] = useState(false);
  const [isUploadingReelVideo, setIsUploadingReelVideo] = useState(false);
  const [isUploadingReelThumbnail, setIsUploadingReelThumbnail] =
    useState(false);

  const isUploadingMedia =
    isUploadingPostImage || isUploadingReelVideo || isUploadingReelThumbnail;

  const completionPercentage = useMemo(() => {
    if (postType === "post") {
      let completed = 0;
      let total = 1;
      if (review.trim().length > 10) completed++;
      if (rating > 0) { total++; completed++; }
      if (imageUrl) { total++; completed++; }
      if (locationName) { total++; completed++; }
      if (tags.length > 0) { total++; completed++; }
      return (completed / total) * 100;
    } else {
      let completed = 0;
      let total = 2;
      if (reelTitle.trim().length > 0) completed++;
      if (reelVideoUrl) completed++;
      if (reelThumbnailUrl) { total++; completed++; }
      return (completed / total) * 100;
    }
  }, [postType, review, rating, imageUrl, locationName, tags, reelTitle, reelVideoUrl, reelThumbnailUrl]);

  const canSubmit = useMemo(() => {
    if (isUploadingMedia) return false;
    if (postType === "post") return review.trim().length > 0;
    return reelTitle.trim().length > 0 && reelVideoUrl.length > 0;
  }, [isUploadingMedia, postType, review, reelTitle, reelVideoUrl]);

  const submitLabel = useMemo(() => {
    if (isUploadingMedia) return "Uploading...";
    if (isSubmitting) return "Publishing...";
    return postType === "post" ? "Publish Post" : "Publish Reel";
  }, [isUploadingMedia, isSubmitting, postType]);

  const destinationHint =
    postType === "post" ? "Appears in Foodie Feed" : "Appears in Discover Reels";

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setPostType("post");
        setReview("");
        setRating(0);
        setLocationName("");
        setImageUrl("");
        setTags([]);
        setReelTitle("");
        setReelVideoUrl("");
        setReelThumbnailUrl("");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleUploadImage = async (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { toast.error("Only JPG, PNG, or WEBP images are supported"); return; }
    if (file.size > MAX_IMAGE_BYTES) { toast.error("Image must be 10MB or smaller"); return; }
    setIsUploadingPostImage(true);
    try {
      const result = await apiUploadMedia(file, "post");
      setImageUrl(result.url);
      toast.success("Cover image uploaded");
    } catch (error) {
      toast.error(error instanceof ApiError ? `Upload failed (${error.status}): ${error.message}` : "Failed to upload image");
    } finally {
      setIsUploadingPostImage(false);
    }
  };

  const handleUploadVideo = async (file: File) => {
    const allowed = ["video/mp4", "video/webm"];
    if (!allowed.includes(file.type)) { toast.error("Only MP4 or WEBM videos are supported"); return; }
    if (file.size > MAX_REEL_VIDEO_BYTES) { toast.error("Video must be 100MB or smaller"); return; }
    setIsUploadingReelVideo(true);
    try {
      const result = await apiUploadMedia(file, "reel");
      setReelVideoUrl(result.url);
      toast.success("Video uploaded");
    } catch (error) {
      toast.error(error instanceof ApiError ? `Upload failed (${error.status}): ${error.message}` : "Failed to upload video");
    } finally {
      setIsUploadingReelVideo(false);
    }
  };

  const handleUploadThumbnail = async (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { toast.error("Only JPG, PNG, or WEBP images are supported"); return; }
    if (file.size > MAX_IMAGE_BYTES) { toast.error("Image must be 10MB or smaller"); return; }
    setIsUploadingReelThumbnail(true);
    try {
      const result = await apiUploadMedia(file, "post");
      setReelThumbnailUrl(result.url);
      toast.success("Thumbnail uploaded");
    } catch (error) {
      toast.error(error instanceof ApiError ? `Upload failed (${error.status}): ${error.message}` : "Failed to upload thumbnail");
    } finally {
      setIsUploadingReelThumbnail(false);
    }
  };

  const handleSubmit = async () => {
    if (isUploadingMedia) { toast.error("Please wait until media upload finishes"); return; }

    if (postType === "post") {
      if (!review.trim()) { toast.error("Please write your food review before publishing"); return; }
    } else {
      if (!reelTitle.trim()) { toast.error("Please add a reel title or caption"); return; }
      if (!reelVideoUrl.trim()) { toast.error("Please add a video URL for your reel"); return; }
    }

    setIsSubmitting(true);
    try {
      if (postType === "post") {
        const payload: CreatePostPayload = {
          review: review.trim(),
          rating: rating || null,
          location_id: null,
          image_url: imageUrl.trim() || null,
          tags: tags.length > 0 ? tags : null,
        };
        const created = await apiPost<CreatedPostResponse>("/api/v1/posts", payload);
        if (typeof created.id !== "number") throw new Error("Invalid post response: missing id");
        toast.success("Foodie Feed post published successfully!");
        onPostCreated?.({ type: "post", destination: "foodie-feed", id: created.id, createdAt: created.created_at ?? null });
      } else {
        const payload: CreateReelPayload = {
          title: reelTitle.trim(),
          video_url: reelVideoUrl.trim(),
          thumbnail_url: reelThumbnailUrl.trim() || null,
        };
        const created = await apiPost<CreatedReelResponse>("/api/v1/reels", payload);
        if (typeof created.id !== "number") throw new Error("Invalid reel response: missing id");
        toast.success("Discover reel published successfully!");
        onPostCreated?.({ type: "reel", destination: "discover-reels", id: created.id, createdAt: created.created_at ?? null });
      }
      onClose();
    } catch (error) {
      toast.error(error instanceof ApiError
        ? `Failed to publish (${error.status}): ${error.message}`
        : `Failed to publish: ${(error as Error).message || "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeIndex = TABS.findIndex((t) => t.value === postType);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 24px",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(12px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "896px",
              maxHeight: "90vh",
              backgroundColor: tokens.color.surface,
              borderRadius: "24px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* ── HEADER (Fixed) ── */}
            <Row
              fillWidth
              horizontal="between"
              vertical="center"
              style={{
                position: "relative",
                padding: "20px 24px",
                flexShrink: 0,
                overflow: "hidden",
                background: `linear-gradient(135deg, rgba(255,107,53,0.06) 0%, rgba(255,107,53,0.03) 40%, rgba(255,107,53,0.08) 100%)`,
                borderBottom: `1px solid ${tokens.color.border}`,
              }}
            >
              {/* Decorative blurred orbs */}
              <Column style={{ position: "absolute", top: -24, left: -24, width: 112, height: 112, borderRadius: "50%", opacity: 0.3, pointerEvents: "none", background: `radial-gradient(circle, ${ORB_COLORS.coral}, transparent 70%)`, filter: "blur(18px)" }} />
              <Column style={{ position: "absolute", bottom: -32, left: 160, width: 144, height: 144, borderRadius: "50%", opacity: 0.2, pointerEvents: "none", background: `radial-gradient(circle, ${ORB_COLORS.amber}, transparent 70%)`, filter: "blur(24px)" }} />
              <Column style={{ position: "absolute", top: -16, right: 80, width: 96, height: 96, borderRadius: "50%", opacity: 0.25, pointerEvents: "none", background: `radial-gradient(circle, ${tokens.color.warm}, transparent 70%)`, filter: "blur(20px)" }} />

              {/* Left: avatar + identity */}
              <Row vertical="center" style={{ gap: "12px" }}>
                <Column style={{ position: "relative" }}>
                  <Avatar
                    src={user?.avatar_url}
                    value={getInitials(user?.display_name || user?.username)}
                    size="m"
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: `2px solid ${tokens.color.surface}`,
                      backgroundColor: tokens.color.success,
                    }}
                  />
                </Column>
                <Column style={{ gap: 2 }}>
                  <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: tokens.color.text, lineHeight: 1.2 }}>
                    {user?.display_name || user?.username || "You"}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 500, lineHeight: 1.2, color: tokens.color.warm }}>
                    @{user?.username || "creator"}
                  </p>
                </Column>

                <Row vertical="center" style={{ marginLeft: "12px", gap: "8px" }}>
                  <span style={{ color: tokens.color.border, userSelect: "none" }}>·</span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      fontWeight: 800,
                      color: "white",
                      letterSpacing: "0.025em",
                      background: `linear-gradient(135deg, ${tokens.color.warm}, ${WARM_GRADIENT.light})`,
                      boxShadow: "0 4px 14px rgba(255,107,53,0.45)",
                    }}
                  >
                    <span style={{ fontSize: "1.125rem", lineHeight: 1 }}>✦</span>
                    Create Post
                  </span>
                </Row>
              </Row>

              {/* Right: close */}
              <button
                onClick={onClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  color: tokens.color.warm,
                  backgroundColor: "rgba(255,107,53,0.08)",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,107,53,0.16)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,107,53,0.08)")}
              >
                <X size={18} />
              </button>
            </Row>

            {/* ── BODY (Scrollable) ── */}
            <Column
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                minHeight: 0,
              }}
            >
              <Column
                fillWidth
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 320px",
                  gap: "24px",
                  height: "100%",
                }}
              >
                {/* Left Bento Card */}
                <Column
                  style={{
                    backgroundColor: tokens.color.surfaceMuted,
                    borderRadius: "16px",
                    padding: "20px",
                    gap: "20px",
                  }}
                >
                  {/* Segmented Control */}
                  <Row
                    style={{
                      position: "relative",
                      backgroundColor: tokens.color.border,
                      borderRadius: "9999px",
                      padding: "4px",
                      gap: "4px",
                    }}
                  >
                    <motion.div
                      style={{
                        position: "absolute",
                        top: "4px",
                        bottom: "4px",
                        borderRadius: "9999px",
                        backgroundColor: tokens.color.surface,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        width: `calc(${100 / TABS.length}% - 4px)`,
                        left: `calc(${(100 / TABS.length) * activeIndex}% + 4px)`,
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                      layout
                    />
                    {TABS.map((tab) => {
                      const isActive = tab.value === postType;
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.value}
                          type="button"
                          onClick={() => setPostType(tab.value)}
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            padding: "8px 12px",
                            borderRadius: "9999px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: isActive ? tokens.color.warm : tokens.color.textMuted,
                            position: "relative",
                            zIndex: 1,
                            transition: "color 0.15s ease",
                          }}
                        >
                          <Icon size={15} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </Row>

                  {/* Form */}
                  <AnimatePresence mode="wait">
                    {postType === "post" ? (
                      <PostForm
                        key="post"
                        review={review}
                        onReviewChange={setReview}
                        rating={rating}
                        onRatingChange={setRating}
                        locationName={locationName}
                        onLocationNameChange={setLocationName}
                        imageUrl={imageUrl}
                        isUploadingImage={isUploadingPostImage}
                        onImageUpload={handleUploadImage}
                        onImageClear={() => setImageUrl("")}
                        tags={tags}
                        onTagsChange={setTags}
                      />
                    ) : (
                      <ReelForm
                        key="reel"
                        title={reelTitle}
                        onTitleChange={setReelTitle}
                        videoUrl={reelVideoUrl}
                        onVideoUpload={handleUploadVideo}
                        onVideoClear={() => setReelVideoUrl("")}
                        isUploadingVideo={isUploadingReelVideo}
                        thumbnailUrl={reelThumbnailUrl}
                        onThumbnailUpload={handleUploadThumbnail}
                        onThumbnailClear={() => setReelThumbnailUrl("")}
                        isUploadingThumbnail={isUploadingReelThumbnail}
                      />
                    )}
                  </AnimatePresence>
                </Column>

                {/* Right Bento Card — Live Preview */}
                <Column
                  style={{
                    backgroundColor: "rgba(255,107,53,0.04)",
                    borderRadius: "16px",
                    padding: "16px",
                    gap: "12px",
                  }}
                >
                  <Row vertical="center" style={{ gap: "8px" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: tokens.color.warm, flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 600, color: tokens.color.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Live Preview
                    </p>
                  </Row>
                  <Column
                    style={{
                      backgroundColor: tokens.color.surface,
                      borderRadius: "16px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      overflow: "hidden",
                    }}
                  >
                    <ContentPreview
                      type={postType}
                      username={user?.username}
                      reviewText={review.trim()}
                      reelTitle={reelTitle.trim()}
                      imageUrl={imageUrl}
                      thumbnailUrl={reelThumbnailUrl}
                      rating={rating}
                      tags={tags}
                      videoUrl={reelVideoUrl}
                    />
                  </Column>
                </Column>
              </Column>
            </Column>

            {/* ── FOOTER (Fixed) ── */}
            <Row
              fillWidth
              horizontal="between"
              vertical="center"
              style={{
                padding: "16px 24px",
                borderTop: `1px solid ${tokens.color.border}`,
                backgroundColor: tokens.color.surface,
                flexShrink: 0,
              }}
            >
              {/* Completion indicator */}
              <Column style={{ gap: 6, width: 176 }}>
                <Row horizontal="between" vertical="center">
                  <span style={{ fontSize: "0.75rem", fontWeight: 500, color: tokens.color.textMuted }}>
                    {isUploadingMedia ? "Uploading…" : "Completion"}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: tokens.color.textSubtle }}>
                    {Math.round(completionPercentage)}%
                  </span>
                </Row>
                <Column style={{ height: 4, backgroundColor: tokens.color.border, borderRadius: 2, overflow: "hidden" }}>
                  <motion.div
                    style={{
                      height: "100%",
                      background: canSubmit ? tokens.color.warm : tokens.color.textMuted,
                      borderRadius: 2,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </Column>
                <span style={{ fontSize: "0.6875rem", color: tokens.color.textMuted }}>
                  {isUploadingMedia ? "Wait for upload to finish" : destinationHint}
                </span>
              </Column>

              {/* Actions */}
              <Row vertical="center" style={{ gap: "12px" }}>
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "12px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: tokens.color.textMuted,
                    backgroundColor: tokens.color.surfaceMuted,
                    border: "none",
                    cursor: "pointer",
                    opacity: isSubmitting ? 0.5 : 1,
                    transition: "background-color 0.2s",
                  }}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isUploadingMedia || !canSubmit}
                  whileHover={canSubmit ? { scale: 1.03 } : undefined}
                  whileTap={canSubmit ? { scale: 0.97 } : undefined}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "12px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "white",
                    background: canSubmit && !isSubmitting && !isUploadingMedia
                      ? tokens.color.warm
                      : tokens.color.textMuted,
                    border: "none",
                    cursor: canSubmit && !isSubmitting && !isUploadingMedia ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    boxShadow: canSubmit && !isSubmitting && !isUploadingMedia
                      ? "0 4px 12px rgba(255,107,53,0.3)"
                      : "none",
                  }}
                >
                  {submitLabel}
                </motion.button>
              </Row>
            </Row>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
