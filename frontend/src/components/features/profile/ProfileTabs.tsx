"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Row, Column, Text } from "@/components/OnceUI";
import { PostsTab, PostItem } from "./tab-contents/PostsTab";
import { ReviewsTab } from "./tab-contents/ReviewsTab";
import { AchievementsTab } from "./tab-contents/AchievementsTab";
import { BookmarksTab } from "./tab-contents/BookmarksTab";
import PostModal from "@/components/PostModal";
import ReelModal from "@/components/ReelModal";
import { PostData, ReelData } from "@/types/dashboard";
import { toast } from "sonner";

interface ProfileTabsProps {
  postsLoading: boolean;
  userPosts: PostItem[];
  badges: any[];
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
  const [activeTab, setActiveTab] = useState("Posts");

  // Modal States
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedReel, setSelectedReel] = useState<ReelData | null>(null);
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);

  const handlePostClick = (post: PostItem) => {
    const mappedPost: PostData = {
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
    };
    setSelectedPost(mappedPost);
    setIsPostModalOpen(true);
  };

  const handleBookmarkClick = (item: any) => {
    if (item.post) {
      const p = item.post;
      const mappedPost: PostData = {
        id: p.id,
        name: p.author_name || "User",
        avatar: p.author_avatar || "",
        time: p.created_at || "",
        location: p.location_name || "",
        spotName: p.spot_name || "Unknown Spot",
        rating: p.rating || 0,
        review: p.review || "",
        img: p.image_url || "",
        tags: p.tags || [],
        likes: p.likes_count || 0,
        comments: p.comments_count || 0,
        isLiked: p.is_liked,
        isSaved: true,
      };
      setSelectedPost(mappedPost);
      setIsPostModalOpen(true);
    } else if (item.reel) {
      const r = item.reel;
      const mappedReel: ReelData = {
        id: r.id,
        title: r.title || "",
        user: r.author_name || "User",
        views: r.views_count?.toString() || "0",
        userAvatar: r.author_avatar || "",
        img: r.thumbnail_url || "",
        videoUrl: r.video_url,
        likes: r.likes_count,
        comments: r.comments_count,
        isLiked: r.is_liked,
        isSaved: true,
      };
      setSelectedReel(mappedReel);
      setIsReelModalOpen(true);
    } else if (item.location) {
      toast.info(`Opening ${item.location.name} details... (Coming Soon)`);
    }
  };

  return (
    <Column fillWidth style={{ marginBottom: "64px" }}>
      {/* Tab Headers */}
      <Row
        style={{
          gap: "32px",
          borderTopWidth: "0px",
          borderLeftWidth: "0px",
          borderRightWidth: "0px",
          borderBottomWidth: "2px",
          borderBottomStyle: "solid",
          borderBottomColor: "#FFE8D6",
          paddingBottom: "12px",
          marginBottom: "32px",
        }}
      >
        {["Posts", "Reviews", "Achievements", "Taste Vault"].map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              position: "relative",
              cursor: "pointer",
              paddingTop: "8px",
              paddingBottom: "8px",
              paddingLeft: "4px",
              paddingRight: "4px",
            }}
          >
            <Text
              style={{
                color: activeTab === tab ? "#ff6b35" : "#8E8E93",
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: "1rem",
                transition: "color 0.2s",
              }}
            >
              {tab}
            </Text>
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                style={{
                  position: "absolute",
                  bottom: "-13px",
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
                  borderRadius: "3px",
                }}
              />
            )}
          </div>
        ))}
      </Row>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
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

      {/* Modals */}
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
    </Column>
  );
};
