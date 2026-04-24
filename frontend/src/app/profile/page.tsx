"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Column,
  Row,
  Heading,
  Text,
  Button,
  IconButton,
  Input,
  Avatar,
  Grid,
} from "@/components/OnceUI";
import { motion, AnimatePresence } from "framer-motion";
import {
  ProfileIdentityCard,
  FlavorProfileCard,
  FriendsListCard,
  ProfileTabs,
  QuickActionsCard,
  TasteMapStatsCard,
  TasteDNACard,
  TopHighlightsCard,
  EditProfileModal,
  ProfileStickyHeader,
  ProfileCover,
  ProfileAvatarGroup,
  FriendItem,
  PostItem
} from "@/components/features/profile";
import Link from "next/link";
import { toast } from "sonner";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import ClientOnly from "@/components/common/ClientOnly";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useUserVector } from "@/context/UserVectorContext";
import { CreatePostModal, CreatePostCard } from "@/components/modals/CreatePostModal";
import { apiGet, apiUploadMedia, ApiError } from "@/lib/api";
import { useBadges } from "@/hooks/useBadges";
import BadgeCard from "@/components/features/gamification/BadgeCard";

// ═══════════ PROFILE PAGE ═══════════ //

export default function ProfilePage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  const handleScroll = useCallback(() => {
    if (scrollRef.current) setShowSticky(scrollRef.current.scrollTop > 360);
  }, []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user, refetch } = useAuth();
  const { radarData } = useUserVector();
  const { badges, totalBadges, loading: badgesLoading } = useBadges();
  const [friendsList, setFriendsList] = useState<FriendItem[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [userPosts, setUserPosts] = useState<PostItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsTotal, setPostsTotal] = useState(0);


  React.useEffect(() => {
    const fetchFriends = async () => {
      setFriendsLoading(true);
      try {
        // /api/v1/friends/foodies — bạn bè accepted + taste match score
        const data = await apiGet<{ items: FriendItem[] }>("/api/v1/friends/foodies");
        setFriendsList(data?.items || []);
      } catch (err) {
        console.error("Failed to fetch friends", err);
      } finally {
        setFriendsLoading(false);
      }
    };
    fetchFriends();
  }, []);

  // Fetch user's posts/reviews from backend
  React.useEffect(() => {
    if (!user?.id) return;
    const fetchUserPosts = async () => {
      setPostsLoading(true);
      try {
        const data = await apiGet<{ items: PostItem[]; total: number }>(
          `/api/v1/posts/?user_id=${user.id}&limit=50&offset=0`
        );
        setUserPosts(data?.items || []);
        setPostsTotal(data?.total || 0);
      } catch (err) {
        console.error("Failed to fetch user posts", err);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchUserPosts();
  }, [user?.id]);

  const handleComingSoon = () =>
    toast("Will be updated in the next version 🚀");


  // Create Content Modal state
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const handleOpenCreatePost = () => setIsCreatePostOpen(true);
  const handleCloseCreatePost = () => setIsCreatePostOpen(false);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="no-scrollbar"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#FFFFFF",
        position: "relative",
        overflowY: "auto",
        overflowX: "hidden",
        paddingBottom: "120px",
      }}
    >
      {/* ── STICKY FLOATING BAR ── */}
      <ProfileStickyHeader
        showSticky={showSticky}
        user={user}
        onComingSoon={handleComingSoon}
      />

      {/* ═══ COVER PHOTO ═══ */}
      <ProfileCover
        user={user}
        onEditProfile={() => setIsEditModalOpen(true)}
        onComingSoon={handleComingSoon}
      />

      {/* ═══ PROFILE HEADER ═══ */}
      <Column
        fillWidth
        style={{
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "40px",
          paddingRight: "40px",
          marginTop: "-100px",
          zIndex: 10,
        }}
      >
        {/* Avatar Area with Animated Gradient Frame */}
        <Row fillWidth style={{ marginBottom: "32px" }}>
          <ProfileAvatarGroup user={user} />
        </Row>


        {/* ── STATS ROW ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "24px",
            alignItems: "stretch",
            marginBottom: "48px",
          }}
        >
          {/* ══ LEFT/CENTER COLUMN (col-span-2) ══ */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Profile Identity (Name, Bio, Bento Pills) */}
            <ProfileIdentityCard user={user} />

            {/* Flavor Profile Card */}
            <FlavorProfileCard />

            <FriendsListCard
              friendsList={friendsList}
              friendsLoading={friendsLoading}
              onSeeAll={handleComingSoon}
            />

          </div>

          {/* ══ RIGHT COLUMN ══ */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Create Post Card */}
            <CreatePostCard onOpenCreatePost={handleOpenCreatePost} />

            {/* Quick Actions Card */}
            <QuickActionsCard
              user={user}
              onSettingsClick={() => {
                toast("Đang mở Settings...");
              }}
            />

            {/* TasteMap Stats Card */}
            <TasteMapStatsCard user={user} />


          </div>
        </div>

        {/* ═══ TASTE DNA SECTION ═══ */}
        <Row fillWidth style={{ gap: "24px", marginBottom: "48px" }}>
          {/* Radar Chart Card */}
          <TasteDNACard radarData={radarData} />

          {/* Top Traits Card */}
          <TopHighlightsCard radarData={radarData} />
        </Row>

        {/* ═══ TABS SECTION ═══ */}
        <ProfileTabs
          postsLoading={postsLoading}
          userPosts={userPosts}
          badges={badges}
          totalBadges={totalBadges}
          badgesLoading={badgesLoading}
          isOwner={true}
        />
      </Column>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSuccess={refetch}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={handleCloseCreatePost}
        onPostCreated={(event) => {
          if (event.type === "post") {
            toast.success("Foodie Feed post published successfully.");
            return;
          }
          toast.success("Discover reel published. Open Discover to view it.");
        }}
      />
    </div>
  );
}
