"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PostsTab, PostItem } from "./tab-contents/PostsTab";
import { ReviewsTab } from "./tab-contents/ReviewsTab";
import { AchievementsTab } from "./tab-contents/AchievementsTab";
import { BookmarksTab, BookmarkRecord } from "./tab-contents/BookmarksTab";
import PostModal from "@/components/PostModal";
import ReelModal from "@/components/ReelModal";
import { PostData, ReelData } from "@/types/dashboard";
import { BadgeSummary } from "@/types/gamification";
import { toast } from "sonner";
import { tokens } from "@/styles/tokens";

const TABS = ["Posts", "Reviews", "Achievements", "Taste Vault"] as const;
type Tab = (typeof TABS)[number];

interface ProfileTabsProps {
  postsLoading: boolean;
  userPosts: PostItem[];
  badges: BadgeSummary[];
  totalBadges: number;
  badgesLoading: boolean;
  isOwner?: boolean;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  postsLoading,
  userPosts,
  badges,
  totalBadges,
  badgesLoading,
  isOwner = false,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("Posts");

  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedReel, setSelectedReel] = useState<ReelData | null>(null);
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);

  const handlePostClick = (post: PostItem) => {
    setSelectedPost({
      id: post.id,
      name: post.user?.display_name || "User",
      avatar: post.user?.avatar_url || "",
      time: post.created_at || "",
      location: post.location?.address || "",
      spotName: post.location?.name || "Unknown Spot",
      rating: post.rating || 0,
      review: post.review,
      img: post.image_url || "",
      tags: post.tags || [],
      likes: post.likes_count,
      comments: post.comments_count,
      isLiked: post.is_liked,
      userTitle: post.user?.title,
      userLevel: post.user?.level,
      primaryBadge: post.user?.primary_badge,
    });
    setIsPostModalOpen(true);
  };

  const handleBookmarkClick = (item: BookmarkRecord) => {
    if (item.post) {
      const p = item.post as Record<string, unknown>;
      setSelectedPost({
        id: p.id as number,
        name: (p.author_name as string) || "User",
        avatar: (p.author_avatar as string) || "",
        time: (p.created_at as string) || "",
        location: (p.location_name as string) || "",
        spotName: (p.spot_name as string) || "Unknown Spot",
        rating: (p.rating as number) || 0,
        review: (p.review as string) || "",
        img: (p.image_url as string) || "",
        tags: (p.tags as string[]) || [],
        likes: (p.likes_count as number) || 0,
        comments: (p.comments_count as number) || 0,
        isLiked: p.is_liked as boolean,
        isSaved: true,
      });
      setIsPostModalOpen(true);
    } else if (item.reel) {
      const r = item.reel as Record<string, unknown>;
      setSelectedReel({
        id: r.id as number,
        title: (r.title as string) || "",
        user: (r.author_name as string) || "User",
        views: r.views_count?.toString() || "0",
        userAvatar: (r.author_avatar as string) || "",
        img: (r.thumbnail_url as string) || "",
        videoUrl: r.video_url as string,
        likes: r.likes_count as number,
        comments: r.comments_count as number,
        isLiked: r.is_liked as boolean,
        isSaved: true,
      });
      setIsReelModalOpen(true);
    } else if (item.location) {
      toast.info(`Opening ${item.location.name} details… (Coming Soon)`);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginBottom: tokens.space[16],
      }}
    >
      <div
        role="tablist"
        style={{
          display: "flex",
          gap: tokens.space[8],
          borderBottom: `1px solid ${tokens.color.border}`,
          marginBottom: tokens.space[8],
        }}
      >
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab)}
              style={{
                position: "relative",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: `${tokens.space[2]} ${tokens.space[1]}`,
                fontSize: tokens.type.size.body,
                fontWeight: active
                  ? tokens.type.weight.semibold
                  : tokens.type.weight.medium,
                letterSpacing: tokens.type.tracking.normal,
                color: active ? tokens.color.text : tokens.color.textMuted,
                transition: "color 0.2s",
              }}
            >
              {tab}
              {active && (
                <motion.div
                  layoutId="profileActiveTab"
                  style={{
                    position: "absolute",
                    bottom: -1,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: tokens.color.warm,
                    borderRadius: tokens.radius.pill,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === "Posts" && (
            <PostsTab
              postsLoading={postsLoading}
              userPosts={userPosts}
              onPostClick={handlePostClick}
            />
          )}
          {activeTab === "Reviews" && (
            <ReviewsTab
              postsLoading={postsLoading}
              userPosts={userPosts}
              onReviewClick={handlePostClick}
            />
          )}
          {activeTab === "Achievements" && (
            <AchievementsTab
              badges={badges}
              totalBadges={totalBadges}
              badgesLoading={badgesLoading}
              isOwner={isOwner}
            />
          )}
          {activeTab === "Taste Vault" && (
            <BookmarksTab onItemClick={handleBookmarkClick} />
          )}
        </motion.div>
      </AnimatePresence>

      {selectedPost && (
        <PostModal
          isOpen={isPostModalOpen}
          data={selectedPost}
          onClose={() => setIsPostModalOpen(false)}
        />
      )}
      {selectedReel && (
        <ReelModal
          isOpen={isReelModalOpen}
          data={selectedReel}
          onClose={() => setIsReelModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfileTabs;
