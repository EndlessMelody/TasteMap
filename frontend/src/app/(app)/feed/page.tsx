"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PostCard from "@/components/features/feed/PostCard";
import PostModal from "@/components/PostModal";
import { usePosts } from "@/hooks/usePosts";
import { useSocialStore } from "@/store/socialStore";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import type { PostData } from "@/types/dashboard";
import { Column, Row } from "@once-ui-system/core";
import {
  Avatar,
  Caption,
  Body,
  BodySm,
  EmptyState,
  Skeleton,
  Card,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "nearby", label: "Nearby" },
  { id: "hot", label: "Trending" },
  { id: "friends", label: "Friends" },
  { id: "following", label: "Following" },
];

function StoryRing({ avatar, name }: { avatar: string; name: string }) {
  return (
    <button
      type="button"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: tokens.space[1],
        flexShrink: 0,
        cursor: "pointer",
        background: "transparent",
        border: "none",
        padding: 0,
      }}
    >
      <Avatar src={avatar} name={name} size="lg" ring="warm" />
      <Caption
        tone="muted"
        style={{
          maxWidth: 64,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name.split(" ").slice(-1)[0]}
      </Caption>
    </button>
  );
}

function SkeletonCard() {
  return (
    <Card
      radius="xl"
      padding="none"
      shadow="sm"
      style={{
        overflow: "hidden",
        marginBottom: tokens.space[4],
      }}
    >
      <Skeleton height={220} radius="sm" />
      <Column
        style={{
          paddingTop: tokens.space[4],
          paddingBottom: tokens.space[4],
          paddingLeft: tokens.space[4],
          paddingRight: tokens.space[4],
          gap: tokens.space[2],
        }}
      >
        <Row
          style={{
            gap: tokens.space[2],
            marginBottom: tokens.space[2],
          }}
        >
          <Skeleton width={38} height={38} radius="pill" />
          <Column flex="1" style={{ gap: 6 }}>
            <Skeleton width="40%" height={13} />
            <Skeleton width="60%" height={11} />
          </Column>
        </Row>
        <Skeleton width="100%" height={12} />
        <Skeleton width="80%" height={12} />
      </Column>
    </Card>
  );
}

export default function FeedPage() {
  const { posts, loading: isLoading, error } = usePosts(20);
  const updatePost = useSocialStore((state) => state.updatePost);
  const [activeFilter, setActiveFilter] = useState("all");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);

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
      toast.error("Could not like post.");
    }
  };

  const handleSave = async (id: number) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    const newIsSaved = !post.isSaved;
    updatePost(id, { isSaved: newIsSaved });
    try {
      await apiPost(`/api/v1/posts/${id}/bookmark`, {});
      toast.success(newIsSaved ? "Saved to Taste Vault." : "Removed from Taste Vault.");
    } catch {
      updatePost(id, { isSaved: post.isSaved });
      toast.error("Could not save post.");
    }
  };

  const handleComment = (_id: number) => {
    toast.info("Comments are coming soon.");
  };

  const handleShare = (id: number) => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${id}`);
    toast.success("Link copied to clipboard.");
  };

  if (error && (!posts || posts.length === 0)) {
    return (
      <Column
        center
        style={{
          minHeight: "80vh",
          background: tokens.color.bg,
          paddingTop: tokens.space[6],
          paddingBottom: tokens.space[6],
          paddingLeft: tokens.space[6],
          paddingRight: tokens.space[6],
        }}
      >
        <Card radius="xl" padding="lg" shadow="sm" style={{ maxWidth: 480 }}>
          <EmptyState
            title="Something went wrong"
            description={error}
          />
        </Card>
      </Column>
    );
  }

  const storyAuthors = Array.from(
    new Map(posts.map((p) => [p.name, p])).values(),
  ).slice(0, 8);

  return (
    <Column
      fillWidth
      style={{
        background: tokens.color.bg,
        color: tokens.color.text,
        minHeight: "100%",
      }}
    >
      <Column
        fillWidth
        style={{
          maxWidth: 520,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: "auto",
          marginRight: "auto",
          paddingTop: tokens.space[4],
          paddingBottom: tokens.space[4],
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        {storyAuthors.length > 0 && (
          <Row
            className="no-scrollbar"
            style={{
              gap: tokens.space[3],
              paddingTop: tokens.space[2],
              paddingBottom: tokens.space[2],
              paddingLeft: tokens.space[4],
              paddingRight: tokens.space[4],
              overflowX: "auto",
            }}
          >
            {storyAuthors.map((p) => (
              <StoryRing key={p.id} avatar={p.avatar} name={p.name} />
            ))}
          </Row>
        )}

        <Row
          className="no-scrollbar"
          style={{
            gap: tokens.space[2],
            paddingTop: tokens.space[2],
            paddingLeft: tokens.space[4],
            paddingRight: tokens.space[4],
            paddingBottom: tokens.space[3],
            overflowX: "auto",
          }}
        >
          {FILTERS.map((f) => {
            const active = f.id === activeFilter;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                style={{
                  flexShrink: 0,
                  fontSize: tokens.type.size.bodySm,
                  fontWeight: active
                    ? tokens.type.weight.semibold
                    : tokens.type.weight.medium,
                  padding: `${tokens.space[1]} ${tokens.space[3]}`,
                  borderRadius: tokens.radius.pill,
                  border: active
                    ? "1px solid transparent"
                    : `1px solid ${tokens.color.border}`,
                  background: active ? tokens.color.text : "transparent",
                  color: active
                    ? tokens.color.textInverse
                    : tokens.color.textMuted,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </Row>

        <Column style={{ paddingTop: 0, paddingBottom: 0, paddingLeft: tokens.space[3], paddingRight: tokens.space[3] }}>
          {isLoading && (!posts || posts.length === 0) ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <AnimatePresence mode="popLayout">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.32,
                    delay: i * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <PostCard
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    onSave={handleSave}
                    onShare={handleShare}
                    onOpen={setSelectedPost}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {isLoading && posts && posts.length > 0 && <SkeletonCard />}

          <Column ref={loadMoreRef} style={{ height: 1 }} />

          {!isLoading && posts.length > 0 && (
            <BodySm
              tone="subtle"
              style={{
                textAlign: "center",
                paddingTop: tokens.space[4],
                paddingLeft: 0,
                paddingRight: 0,
                paddingBottom: tokens.space[8],
              }}
            >
              You're all caught up.
            </BodySm>
          )}
        </Column>
      </Column>

      {selectedPost && (
        <PostModal
          isOpen={!!selectedPost}
          data={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </Column>
  );
}
