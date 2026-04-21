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
} from "@/components/features/profile";
import {
  ChevronLeft,
  Camera,
  X,
  Save,
  Lock,
  Utensils,
  Award,
  Edit3,
  MessageCircle,
  UserPlus,
  Image as ImageIcon,
  Map as MapIcon,
  TrendingUp,
  Cake,
  Gem,
  Feather,
  PartyPopper,
  Users,
  Handshake,
  Share2,
  Link2,
  QrCode,
  Settings,
  Shield,
  Medal,
  Trophy,
  Heart,
} from "lucide-react";
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

const StatItem = ({
  value,
  label,
  delay,
}: {
  value: number | string;
  label: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: delay / 1000 }}
    style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
  >
    <Text
      style={{
        color: "#1C1C1E",
        fontSize: "1.4rem",
        fontWeight: 800,
        letterSpacing: "-0.5px",
      }}
    >
      {typeof value === "number" && value >= 1000
        ? `${(value / 1000).toFixed(1)}K`
        : value}
    </Text>
    <Text
      style={{
        color: "#8E8E93",
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginTop: "2px",
      }}
    >
      {label}
    </Text>
  </motion.div>
);

// ─── Friend item from /api/v1/friends/foodies ───
export interface FriendItem {
  id: number;
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  title?: string | null;
  match_score: number;
  friendship_id?: number | null;
}

// ─── Type for a single post/review item ───
export interface PostItem {
  id: number;
  user?: { id: number; display_name?: string; avatar_url?: string };
  location?: { id: number; name: string };
  review: string;
  rating?: number | null;
  image_url?: string | null;
  tags?: string[] | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at?: string;
}

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
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: 0,
          overflow: "visible",
        }}
      >
        <AnimatePresence>
          {showSticky && (
            <motion.div
              initial={{ y: -72, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -72, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingLeft: "40px",
                paddingRight: "40px",
                height: "64px",
                backgroundColor: "rgba(255,255,255,0.90)",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              }}
            >
              <Row style={{ gap: "14px", alignItems: "center" }}>
                <Avatar
                  src={user?.avatar_url || ""}
                  size="s"
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    border: "2px solid rgba(255,107,53,0.2)",
                  }}
                />
                <Column style={{ gap: "1px" }}>
                  <Text
                    style={{
                      color: "#1C1C1E",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      lineHeight: 1,
                    }}
                  >
                    {user?.display_name || user?.username || ""}
                  </Text>
                  <Text
                    style={{
                      color: "#8E8E93",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                    }}
                  >
                    @{user?.username || ""}
                  </Text>
                </Column>
              </Row>
              <Row style={{ gap: "10px" }}>
                <motion.button
                  onClick={handleComingSoon}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "9px 18px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #ff6b35, #e65721)",
                    border: "none",
                    cursor: "pointer",
                    color: "white",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(255,107,53,0.28)",
                  }}
                >
                  <UserPlus size={15} /> Follow
                </motion.button>
                <motion.button
                  onClick={handleComingSoon}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "9px 18px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(255,107,53,0.07)",
                    border: "1px solid rgba(255,107,53,0.12)",
                    cursor: "pointer",
                    color: "#ff6b35",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  <MessageCircle size={15} /> Message
                </motion.button>
              </Row>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ COVER PHOTO ═══ */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "320px",
          flexShrink: 0,
        }}
      >
        <img
          src={
            user?.cover_url ||
            "https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&q=80"
          }
          alt="Cover"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.52) 100%)",
          }}
        />

        {/* Back Button */}
        <Link
          href="/"
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            display: "flex",
          }}
        >
          <IconButton
            icon={<ChevronLeft size={20} color="#1C1C1E" />}
            style={{
              backgroundColor: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(12px)",
              borderRadius: "14px",
              width: "44px",
              height: "44px",
              cursor: "pointer",
              borderTopWidth: "1px",
              borderBottomWidth: "1px",
              borderLeftWidth: "1px",
              borderRightWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(0,0,0,0.05)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          />
        </Link>

        {/* Header Actions */}
        <Row
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <Button
            size="s"
            onClick={() => setIsEditModalOpen(true)}
            style={{
              backgroundColor: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(12px)",
              borderRadius: "14px",
              color: "#1C1C1E",
              fontWeight: 700,
              paddingTop: "10px",
              paddingBottom: "10px",
              paddingLeft: "20px",
              paddingRight: "20px",
              cursor: "pointer",
              borderTopWidth: "1px",
              borderBottomWidth: "1px",
              borderLeftWidth: "1px",
              borderRightWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(0,0,0,0.05)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Row style={{ gap: "8px", alignItems: "center" }}>
              <Edit3 size={16} color="#ff6b35" />
              <Text style={{ fontSize: "0.85rem" }}>Edit Profile</Text>
            </Row>
          </Button>
          <IconButton
            icon={<Heart size={20} color="#ff6b35" />}
            onClick={handleComingSoon}
            style={{
              backgroundColor: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(12px)",
              borderRadius: "14px",
              width: "44px",
              height: "44px",
              cursor: "pointer",
              borderTopWidth: "1px",
              borderBottomWidth: "1px",
              borderLeftWidth: "1px",
              borderRightWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(0,0,0,0.05)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          />
        </Row>
      </div>

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
          <div style={{ position: "relative", padding: "6px" }}>
            {/* Animated Gradient Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: "50%",
                background:
                  "conic-gradient(from 0deg, #ff6b35, #ff8c5a, #ffaa7a, #ff6b35)",
                padding: "4px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  backgroundColor: "#FFFFFF",
                }}
              />
            </motion.div>

            {/* Glow Effect */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(255,107,53,0.3)",
                  "0 0 40px rgba(255,107,53,0.5)",
                  "0 0 20px rgba(255,107,53,0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: "-4px",
                left: "-4px",
                right: "-4px",
                bottom: "-4px",
                borderRadius: "50%",
                zIndex: -1,
              }}
            />

            <Avatar
              src={user?.avatar_url || ""}
              size="xl"
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                border: "4px solid #FFFFFF",
                position: "relative",
                zIndex: 1,
              }}
            />

            {/* Level Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                delay: 0.5,
              }}
              style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
                borderRadius: "14px",
                padding: "6px 12px",
                border: "3px solid #FFFFFF",
                boxShadow: "0 4px 16px rgba(255,107,53,0.4)",
                zIndex: 2,
              }}
            >
              <Text
                style={{ color: "white", fontSize: "0.75rem", fontWeight: 800 }}
              >
                LV {user?.level || 1}
              </Text>
            </motion.div>
          </div>
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
            <QuickActionsCard onAction={handleComingSoon} />

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
