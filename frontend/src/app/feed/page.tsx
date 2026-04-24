"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flex, Column, Row, Text } from "@/components/OnceUI";
import PostCard from "@/components/features/feed/PostCard";
import PostModal from "@/components/PostModal";
import { usePosts } from "@/hooks/usePosts";
import { useSocialStore } from "@/store/socialStore";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import type { PostData } from "@/types/dashboard";


// ---------------------------------------------------------------------------
// Story ring component
// ---------------------------------------------------------------------------
function StoryRing({ avatar, name }: { avatar: string; name: string }) {
  return (
    <motion.div
      whileTap={{ scale: 0.92 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flexShrink: 0, cursor: "pointer" }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          padding: "2.5px",
          background: "linear-gradient(135deg, #E2775A 0%, #9B72CF 100%)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "var(--color-background-primary)",
            padding: "2px",
          }}
        >
          <img
            src={avatar}
            alt={name}
            style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = "none";
              const fb = el.nextSibling as HTMLElement;
              if (fb) fb.style.display = "flex";
            }}
          />
          <div
            style={{
              display: "none",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "#EEEDFE",
              color: "#7F77DD",
              fontSize: "14px",
              fontWeight: 600,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
      <Text
        variant="label-default-xs"
        onBackground="neutral-weak"
        style={{ maxWidth: "56px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {name.split(" ").slice(-1)[0]}
      </Text>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Filter chip
// ---------------------------------------------------------------------------
const FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "nearby", label: "Gần đây" },
  { id: "hot", label: "🔥 Đang hot" },
  { id: "friends", label: "Bạn bè" },
  { id: "following", label: "Đang theo dõi" },
];

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------
function SkeletonCard() {
  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        borderRadius: "var(--border-radius-xl)",
        border: "1px solid var(--color-border-tertiary)",
        overflow: "hidden",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          height: "220px",
          background: "var(--color-background-secondary)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "var(--color-background-secondary)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: "13px", width: "40%", borderRadius: "6px", background: "var(--color-background-secondary)", marginBottom: "6px", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: "11px", width: "60%", borderRadius: "6px", background: "var(--color-background-secondary)", animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
        </div>
        <div style={{ height: "12px", borderRadius: "6px", background: "var(--color-background-secondary)", marginBottom: "8px", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: "12px", width: "80%", borderRadius: "6px", background: "var(--color-background-secondary)", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
    </div>
  );
}

// ─── Main Feed Page ──────────────────────────────────────────────
export default function FeedPage() {
  const { posts, loading: isLoading, error } = usePosts(20);
  const updatePost = useSocialStore((state) => state.updatePost);
  const [activeFilter, setActiveFilter] = useState("all");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Modal state for immersive viewing
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);

  const handleOpenPost = (post: PostData) => setSelectedPost(post);
  const handleClosePost = () => setSelectedPost(null);

  const handleLike = async (id: number) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    const newIsLiked = !post.isLiked;
    const newLikes = newIsLiked ? post.likes + 1 : Math.max(0, post.likes - 1);
    updatePost(id, { isLiked: newIsLiked, likes: newLikes });
    try {
      await apiPost(`/api/v1/posts/${id}/like`, {});
    } catch {
      updatePost(id, { isLiked: post.isLiked, likes: post.likes });
      toast.error("Không thể thích bài viết");
    }
  };

  const handleSave = async (id: number) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    const newIsSaved = !post.isSaved;
    updatePost(id, { isSaved: newIsSaved });
    try {
      await apiPost(`/api/v1/posts/${id}/bookmark`, {});
      toast.success(newIsSaved ? "Đã lưu vào Taste Vault" : "Đã xóa khỏi Taste Vault");
    } catch {
      updatePost(id, { isSaved: post.isSaved });
      toast.error("Không thể lưu bài viết");
    }
  };

  const handleComment = (id: number) => {
    toast.info("Tính năng bình luận đang được phát triển");
  };

  const handleShare = (id: number) => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${id}`);
    toast.success("Đã sao chép liên kết");
  };



  // Infinite scroll sentinel (stubbed)
  useEffect(() => {
    // Future: Implement load more logic here
  }, []);

  if (isLoading && (!posts || posts.length === 0)) {
    return (
      <Column fillWidth fillHeight align="center" justify="center" style={{ minHeight: '80vh' }}>
        <Text variant="body-default-m" onBackground="neutral-weak">Đang tải bài viết...</Text>
      </Column>
    );
  }

  if (error && (!posts || posts.length === 0)) {
    return (
      <Column fillWidth fillHeight align="center" justify="center" style={{ minHeight: '80vh' }}>
        <Text variant="body-default-m" onBackground="neutral-weak">{error}</Text>
      </Column>
    );
  }

  // Unique authors for story row (deduplicated, max 8)
  const storyAuthors = Array.from(
    new Map(posts.map((p) => [p.name, p])).values()
  ).slice(0, 8);

  return (
    <Column style={{ maxWidth: "480px", margin: "0 auto", width: "100%" }}>
      {/* ── Header ── */}


      {/* ── Stories ── */}
      {storyAuthors.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            padding: "12px 16px",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {storyAuthors.map((p) => (
            <StoryRing key={p.id} avatar={p.avatar} name={p.name} />
          ))}
          <style>{`.story-scroll::-webkit-scrollbar{display:none}`}</style>
        </div>
      )}

      {/* ── Filter chips ── */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "6px 16px 12px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {FILTERS.map((f) => (
          <motion.button
            key={f.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => setActiveFilter(f.id)}
            style={{
              flexShrink: 0,
              fontSize: "12px",
              fontWeight: activeFilter === f.id ? 600 : 400,
              padding: "5px 14px",
              borderRadius: "20px",
              border: activeFilter === f.id ? "none" : "1px solid var(--color-border-secondary)",
              background: activeFilter === f.id ? "#E2775A" : "transparent",
              color: activeFilter === f.id ? "#fff" : "var(--color-text-secondary)",
              cursor: "pointer",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      {/* ── Feed ── */}
      <div style={{ padding: "0 12px" }}>
        <AnimatePresence mode="popLayout">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <PostCard
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onSave={handleSave}
                onShare={handleShare}
                onOpen={handleOpenPost}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Skeleton while loading */}
        {isLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={loadMoreRef} style={{ height: "1px" }} />

        {/* End of feed */}
        {!isLoading && posts.length > 0 && (
          <Text
            variant="label-default-xs"
            onBackground="neutral-weak"
            style={{ textAlign: "center", padding: "16px 0 32px", opacity: 0.6 }}
          >
            ✦ Đã xem hết bài viết mới nhất ✦
          </Text>
        )}
      </div>

      {/* ── Post Modal Overlay ── */}
      {selectedPost && (
        <PostModal
          isOpen={!!selectedPost}
          data={selectedPost}
          onClose={handleClosePost}
        />
      )}
    </Column>
  );
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------
const iconBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "34px",
  height: "34px",
  borderRadius: "10px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "var(--color-text-secondary)",
};