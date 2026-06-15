"use client";

import React, { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
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
  PostItem,
} from "@/components/features/profile";
import { useAuth } from "@/hooks/useAuth";
import { useUserVector } from "@/context/UserVectorContext";
import {
  CreatePostModal,
  CreatePostCard,
} from "@/components/modals/CreatePostModal";
import { apiGet } from "@/lib/api";
import { useBadges } from "@/hooks/useBadges";
import { tokens } from "@/styles/tokens";

export default function ProfilePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  const handleScroll = useCallback(() => {
    if (scrollRef.current) setShowSticky(scrollRef.current.scrollTop > 320);
  }, []);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const { user, refetch } = useAuth();
  const { radarData } = useUserVector();
  const { badges, totalBadges, loading: badgesLoading } = useBadges();

  const [friendsList, setFriendsList] = useState<FriendItem[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [userPosts, setUserPosts] = useState<PostItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  React.useEffect(() => {
    const fetchFriends = async () => {
      setFriendsLoading(true);
      try {
        const data = await apiGet<{ items: FriendItem[] }>(
          "/api/v1/friends/foodies",
        );
        setFriendsList(data?.items || []);
      } catch (err) {
        console.error("Failed to fetch friends", err);
      } finally {
        setFriendsLoading(false);
      }
    };
    fetchFriends();
  }, []);

  React.useEffect(() => {
    if (!user?.id) return;
    const fetchUserPosts = async () => {
      setPostsLoading(true);
      try {
        const data = await apiGet<{ items: PostItem[]; total: number }>(
          `/api/v1/posts/?user_id=${user.id}&limit=50&offset=0`,
        );
        setUserPosts(data?.items || []);
      } catch (err) {
        console.error("Failed to fetch user posts", err);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchUserPosts();
  }, [user?.id]);

  const handleComingSoon = () =>
    toast("Will be updated in the next version.");

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="no-scrollbar"
      style={{
        width: "100%",
        height: "100%",
        background: tokens.color.bg,
        color: tokens.color.text,
        position: "relative",
        overflowY: "auto",
        overflowX: "hidden",
        paddingBottom: tokens.space[16],
      }}
    >
      <ProfileStickyHeader
        showSticky={showSticky}
        user={user}
        onComingSoon={handleComingSoon}
      />

      <ProfileCover
        user={user}
        onEditProfile={() => setIsEditModalOpen(true)}
        onComingSoon={handleComingSoon}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          paddingLeft: tokens.space[10],
          paddingRight: tokens.space[10],
          marginTop: "-80px",
          zIndex: 10,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: tokens.space[8] }}>
          <ProfileAvatarGroup user={user} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: tokens.space[6],
            alignItems: "stretch",
            marginBottom: tokens.space[12],
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: tokens.space[5],
            }}
          >
            <ProfileIdentityCard user={user} />
            <FlavorProfileCard />
            <FriendsListCard
              friendsList={friendsList}
              friendsLoading={friendsLoading}
              onSeeAll={handleComingSoon}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: tokens.space[5],
            }}
          >
            <CreatePostCard onOpenCreatePost={() => setIsCreatePostOpen(true)} />
            <QuickActionsCard
              user={user}
              onSettingsClick={() => toast("Opening settings…")}
            />
            <TasteMapStatsCard user={user} />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: tokens.space[6],
            marginBottom: tokens.space[12],
          }}
        >
          <TasteDNACard radarData={radarData} />
          <TopHighlightsCard radarData={radarData} />
        </div>

        <ProfileTabs
          postsLoading={postsLoading}
          userPosts={userPosts}
          badges={badges}
          totalBadges={totalBadges}
          badgesLoading={badgesLoading}
          isOwner={true}
        />
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSuccess={refetch}
      />

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={(event) => {
          if (event.type === "post") {
            toast.success("Foodie Feed post published successfully.");
            return;
          }
          toast.success(
            "Discover reel published. Open Discover to view it.",
          );
        }}
      />
    </div>
  );
}
