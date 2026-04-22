"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/OnceUI";
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

const TABS: { value: ComposerType; label: string; icon: React.ElementType }[] =
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
          className="fixed inset-0 z-[1000] flex items-center justify-center px-6 pt-20 pb-20 bg-black/70 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* ── HEADER (Fixed) ── */}
            <div
              className="relative flex items-center justify-between px-6 py-5 flex-shrink-0 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #fff7f3 0%, #fff1e8 40%, #fde8d8 100%)",
                borderBottom: "1px solid rgba(255,107,53,0.12)",
              }}
            >
              {/* Decorative blurred orbs */}
              <div
                className="absolute -top-6 -left-6 w-28 h-28 rounded-full opacity-30 pointer-events-none"
                style={{ background: "radial-gradient(circle, #ff8c5a, transparent 70%)", filter: "blur(18px)" }}
              />
              <div
                className="absolute -bottom-8 left-40 w-36 h-36 rounded-full opacity-20 pointer-events-none"
                style={{ background: "radial-gradient(circle, #ffb347, transparent 70%)", filter: "blur(24px)" }}
              />
              <div
                className="absolute -top-4 right-20 w-24 h-24 rounded-full opacity-25 pointer-events-none"
                style={{ background: "radial-gradient(circle, #ff6b35, transparent 70%)", filter: "blur(20px)" }}
              />

              {/* Left: avatar + identity */}
              <div className="relative flex items-center gap-3">
                <div className="relative">
                  <Avatar
                    src={user?.avatar_url}
                    alt={user?.display_name || user?.username}
                    size="m"
                  />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
                    style={{ backgroundColor: "#22c55e" }}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-800 leading-tight">
                    {user?.display_name || user?.username || "You"}
                  </p>
                  <p className="text-xs font-medium leading-tight" style={{ color: "#ff6b35" }}>
                    @{user?.username || "creator"}
                  </p>
                </div>

                <div className="ml-3 flex items-center gap-2">
                  <span className="text-slate-300 select-none">·</span>
                  {/* Branded pill badge */}
                  <span
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-extrabold text-white tracking-wide"
                    style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", boxShadow: "0 4px 14px rgba(255,107,53,0.45)" }}
                  >
                    <span className="text-lg leading-none">✦</span>
                    Create Post
                  </span>
                </div>
              </div>

              {/* Right: close */}
              <button
                onClick={onClose}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ color: "#ff6b35", backgroundColor: "rgba(255,107,53,0.08)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,107,53,0.16)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,107,53,0.08)")}
              >
                <X size={18} />
              </button>
            </div>

            {/* ── BODY (Scrollable) ── */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              <div className="grid grid-cols-[1fr_320px] gap-6 h-full">

                {/* Left Bento Card */}
                <div className="bg-slate-50 rounded-2xl p-5 flex flex-col gap-5">

                  {/* Segmented Control */}
                  <div className="relative flex bg-slate-200/60 rounded-full p-1 gap-1">
                    <motion.div
                      className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm"
                      style={{
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
                          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full text-sm font-semibold transition-colors duration-150 ${isActive ? "text-orange-500" : "text-zinc-400 hover:text-zinc-600"
                            }`}
                        >
                          <Icon size={15} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

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
                </div>

                {/* Right Bento Card — Live Preview */}
                <div className="bg-orange-50/50 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                      Live Preview
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
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
                  </div>
                </div>
              </div>
            </div>

            {/* ── FOOTER (Fixed) ── */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
              {/* Completion indicator */}
              <div className="flex flex-col gap-1.5 w-44">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">
                    {isUploadingMedia ? "Uploading…" : "Completion"}
                  </span>
                  <span className="text-xs font-semibold text-zinc-500">
                    {Math.round(completionPercentage)}%
                  </span>
                </div>
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${canSubmit ? "bg-orange-500" : "bg-slate-400"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-[11px] text-zinc-400">
                  {isUploadingMedia ? "Wait for upload to finish" : destinationHint}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isUploadingMedia || !canSubmit}
                  whileHover={canSubmit ? { scale: 1.03 } : undefined}
                  whileTap={canSubmit ? { scale: 0.97 } : undefined}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${canSubmit && !isSubmitting && !isUploadingMedia
                      ? "bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200"
                      : "bg-slate-300 cursor-not-allowed"
                    }`}
                >
                  {submitLabel}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
