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
  ChevronLeft,
  Camera,
  X,
  Save,
  Lock,
  MapPin,
  Calendar,
  Star,
  Utensils,
  Award,
  Heart,
  Edit3,
  MessageCircle,
  UserPlus,
  Image as ImageIcon,
  Map as MapIcon,
  TrendingUp,
  Flame,
  Cake,
  Gem,
  Feather,
  PartyPopper,
  Users,
  Handshake,
  Shield,
  Medal,
  Trophy,
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

export default function ProfilePage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  const handleScroll = useCallback(() => {
    if (scrollRef.current) setShowSticky(scrollRef.current.scrollTop > 360);
  }, []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Posts");
  const { user, loading, refetch } = useAuth();
  const { radarData } = useUserVector();

  // Form state
  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formEmail, setFormEmail] = useState("guest@email.com");
  const [formPhone, setFormPhone] = useState("+84 901 234 567");
  const [formLocation, setFormLocation] = useState("");

  // File upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Refs for hidden inputs
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user) {
      setFormName(user.display_name || user.username || "");
      setFormUsername(user.username || "");
      setFormBio(user.bio || "");
      setFormEmail(user.email || "");
      setFormPhone(user.phone || "");
      setFormLocation(user.location || "");

      // Cleanup Object URLs on unmount/user change if modal was closed dirty
      return () => {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        if (coverPreview) URL.revokeObjectURL(coverPreview);
      };
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Avatar must be JPEG, PNG, or WEBP (No GIFs).");
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar size must be less than 2MB.");
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      return;
    }

    setAvatarFile(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Cover must be JPEG, PNG, WEBP, or GIF.");
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Cover size must be less than 5MB.");
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }

    setCoverFile(file);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const formData = new FormData();
      formData.append("display_name", formName);
      formData.append("username", formUsername);
      formData.append("bio", formBio);
      formData.append("phone", formPhone);
      if (formLocation) formData.append("location", formLocation);
      // NOTE: emails aren't naturally edited in simple patches unless your backend explicitly supports it

      if (avatarFile) formData.append("avatar_file", avatarFile);
      if (coverFile) formData.append("cover_file", coverFile);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
        "http://127.0.0.1:8000";

      const res = await fetch(`${API_URL}/api/v1/users/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        let errMessage = "Unknown error";
        try {
          const errJson = await res.json();
          errMessage = errJson.detail || errMessage;
        } catch { }
        throw new Error(errMessage);
      }

      await refetch();

      toast.success("Profile updated successfully! ✨");
      setIsEditModalOpen(false);

      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setAvatarFile(null);
      setCoverFile(null);
      setAvatarPreview(null);
      setCoverPreview(null);
    } catch (e: any) {
      toast.error(`Update failed: ${e.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleComingSoon = () =>
    toast("Will be updated in the next version 🚀");

  const TRAIT_META: Record<
    string,
    {
      icon: React.ReactNode;
      label: string;
      desc: string;
      bg: string;
      iconColor: string;
    }
  > = {
    "Street Food": {
      icon: <Utensils size={20} />,
      label: "Street Food Guru",
      desc: "Local street eats enthusiast",
      bg: "#FDFCF2",
      iconColor: "#B45309",
    },
    Spicy: {
      icon: <Flame size={20} />,
      label: "Spice Specialist",
      desc: "Loves bold, fiery flavors",
      bg: "#FFF5F5",
      iconColor: "#DC2626",
    },
    Sweet: {
      icon: <Cake size={20} />,
      label: "Sweet Tooth",
      desc: "Desserts & café connoisseur",
      bg: "#FFF0F6",
      iconColor: "#DB2777",
    },
    Luxury: {
      icon: <Gem size={20} />,
      label: "Fine Dining Fan",
      desc: "Premium culinary experiences",
      bg: "#F5F3FF",
      iconColor: "#7C3AED",
    },
    Quiet: {
      icon: <Feather size={20} />,
      label: "Peaceful Eater",
      desc: "Cozy & calm dining spots",
      bg: "#F0FFF4",
      iconColor: "#059669",
    },
    Group: {
      icon: <PartyPopper size={20} />,
      label: "Social Foodie",
      desc: "Food is better with friends",
      bg: "#FFF8E1",
      iconColor: "#D97706",
    },
  };
  const topTraits = [...radarData].sort((a, b) => b.A - a.A).slice(0, 3);

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
                    border: "2px solid rgba(0,122,255,0.2)",
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
                    background: "linear-gradient(135deg, #1A7AFF, #0057D9)",
                    border: "none",
                    cursor: "pointer",
                    color: "white",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(0,122,255,0.28)",
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
                    backgroundColor: "rgba(0,122,255,0.07)",
                    border: "1px solid rgba(0,122,255,0.12)",
                    cursor: "pointer",
                    color: "#007AFF",
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
              <Edit3 size={16} color="#007AFF" />
              <Text style={{ fontSize: "0.85rem" }}>Edit Profile</Text>
            </Row>
          </Button>
          <IconButton
            icon={<Heart size={20} color="#007AFF" />}
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
        {/* Avatar Area */}
        <Row fillWidth style={{ marginBottom: "32px" }}>
          <div style={{ position: "relative" }}>
            <Avatar
              src={user?.avatar_url || ""}
              size="xl"
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                borderTopWidth: "6px",
                borderBottomWidth: "6px",
                borderLeftWidth: "6px",
                borderRightWidth: "6px",
                borderStyle: "solid",
                borderColor: "#FFFFFF",
                boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
              }}
            />
            {/* Level Badge */}
            <div
              style={{
                position: "absolute",
                bottom: "8px",
                right: "8px",
                backgroundColor: "#007AFF",
                borderRadius: "14px",
                paddingTop: "6px",
                paddingBottom: "6px",
                paddingLeft: "12px",
                paddingRight: "12px",
                borderTopWidth: "4px",
                borderBottomWidth: "4px",
                borderLeftWidth: "4px",
                borderRightWidth: "4px",
                borderStyle: "solid",
                borderColor: "#FFFFFF",
                boxShadow: "0 4px 12px rgba(0,122,255,0.3)",
              }}
            >
              <Text
                style={{ color: "white", fontSize: "0.75rem", fontWeight: 800 }}
              >
                LV {user?.level || 1}
              </Text>
            </div>
          </div>
        </Row>

        {/* Name + Info */}
        <Column style={{ gap: "10px", marginBottom: "32px" }}>
          <Heading
            variant="display-strong-s"
            style={{ color: "#1C1C1E", fontSize: "2.5rem" }}
          >
            {user?.display_name || user?.username || "Guest"}
          </Heading>

          <Row style={{ gap: "12px", alignItems: "center" }}>
            <Text
              style={{ color: "#007AFF", fontWeight: 600, fontSize: "1rem" }}
            >
              @{user?.username || "guest"} • {user?.title || "Taste Explorer"}
            </Text>
          </Row>

          <Text
            style={{
              color: "#636366",
              fontSize: "1rem",
              lineHeight: 1.6,
              maxWidth: "720px",
            }}
          >
            {user?.bio || "Enjoying the food exploration journey!"}
          </Text>

          {/* Level Progress Bar */}
          <Column style={{ gap: "8px", maxWidth: "320px", marginTop: "8px" }}>
            <Row style={{ justifyContent: "space-between" }}>
              <Text
                style={{
                  color: "#8E8E93",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                Level {user?.level || 1} Progress
              </Text>
              <Text
                style={{
                  color: "#1C1C1E",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {/* user.xp = XP trong level này (relative), user.next_level_xp = XP cần cho level này */}
                {user?.xp ?? 0} / {user?.next_level_xp ?? 100} XP
              </Text>
            </Row>
            <div
              style={{
                width: "100%",
                height: "6px",
                backgroundColor: "#EAF2FF",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  // Backend trả về giá trị tương đối — công thức này luôn đúng
                  width: `${Math.min(((user?.xp ?? 0) / (user?.next_level_xp || 1)) * 100, 100)}%`,
                }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{
                  height: "100%",
                  backgroundColor: "#007AFF",
                  borderRadius: "3px",
                }}
              />
            </div>
          </Column>

          <Row style={{ gap: "24px", marginTop: "16px" }}>
            <Row style={{ gap: "8px", alignItems: "center" }}>
              <MapPin size={16} color="#8E8E93" />
              <Text style={{ color: "#8E8E93", fontSize: "0.9rem" }}>
                {user?.location || "Khám phá"}
              </Text>
            </Row>
            <Row style={{ gap: "8px", alignItems: "center" }}>
              <Calendar size={16} color="#8E8E93" />
              <Text style={{ color: "#8E8E93", fontSize: "0.9rem" }}>
                Joined{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "March 2025"}
              </Text>
            </Row>
          </Row>
        </Column>

        {/* ── STATS ROW ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          {[
            {
              label: "Followers",
              value: user?.stats?.followers ?? 0,
              icon: <Users size={18} />,
              color: "#007AFF",
            },
            {
              label: "Following",
              value: user?.stats?.following ?? 0,
              icon: <Handshake size={18} />,
              color: "#34C759",
            },
            {
              label: "Reviews",
              value: user?.stats?.reviews ?? 0,
              icon: <Star size={18} />,
              color: "#FBBF24",
            },
            {
              label: "Visited",
              value: user?.stats?.visited ?? 0,
              icon: <MapPin size={18} />,
              color: "#FF3B30",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "16px 8px",
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid rgba(0,0,0,0.05)",
                gap: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <span style={{ color: s.color }}>{s.icon}</span>
              <Text
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "#1C1C1E",
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                }}
              >
                {typeof s.value === "number" && s.value >= 1000
                  ? `${(s.value / 1000).toFixed(1)}K`
                  : s.value}
              </Text>
              <Text
                style={{
                  color: "rgba(0,0,0,0.4)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {s.label}
              </Text>
            </div>
          ))}
        </div>

        {/* ═══ TASTE DNA SECTION ═══ */}
        <Row fillWidth style={{ gap: "24px", marginBottom: "48px" }}>
          {/* Radar Chart Card */}
          <Column
            style={{
              flexGrow: 1.2,
              flexShrink: 1,
              flexBasis: "0%",
              backgroundColor: "#EAF2FF",
              borderRadius: "32px",
              paddingTop: "40px",
              paddingRight: "40px",
              paddingBottom: "40px",
              paddingLeft: "40px",
              borderTopWidth: "1px",
              borderBottomWidth: "1px",
              borderLeftWidth: "1px",
              borderRightWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(0,122,255,0.08)",
              boxShadow: "0 12px 40px rgba(0,122,255,0.04)",
              height: "420px",
              position: "relative",
            }}
          >
            <Row
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <Row style={{ gap: "12px", alignItems: "center" }}>
                <div
                  style={{
                    backgroundColor: "#007AFF",
                    paddingTop: "10px",
                    paddingBottom: "10px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    borderRadius: "12px",
                  }}
                >
                  <TrendingUp size={20} color="white" />
                </div>
                <Column>
                  <Heading
                    variant="heading-strong-m"
                    style={{ color: "#1C1C1E", fontSize: "1.25rem" }}
                  >
                    Taste DNA
                  </Heading>
                  <Text
                    style={{
                      color: "#007AFF",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    Your Unique Flavor Profile
                  </Text>
                </Column>
              </Row>
              <Button
                size="s"
                variant="secondary"
                style={{ backgroundColor: "white", borderRadius: "12px" }}
              >
                View Insights
              </Button>
            </Row>

            <div
              style={{
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: "0%",
                width: "100%",
                minHeight: "280px",
              }}
            >
              <ClientOnly>
                <ResponsiveContainer
                  width="100%"
                  height={280}
                  minWidth={100}
                  debounce={50}
                >
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    data={radarData}
                  >
                    <PolarGrid stroke="rgba(0,122,255,0.1)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "#8E8E93", fontSize: 12, fontWeight: 600 }}
                    />
                    <Radar
                      name="Taste"
                      dataKey="A"
                      stroke="#007AFF"
                      fill="#007AFF"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </ClientOnly>
            </div>
          </Column>

          {/* Top Traits Card */}
          <Column
            style={{
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: "0%",
              backgroundColor: "#FFFFFF",
              borderRadius: "32px",
              paddingTop: "32px",
              paddingBottom: "32px",
              paddingLeft: "32px",
              paddingRight: "32px",
              borderTopWidth: "1px",
              borderBottomWidth: "1px",
              borderLeftWidth: "1px",
              borderRightWidth: "1px",
              borderStyle: "solid",
              borderColor: "#F2F2F7",
              boxShadow: "0 8px 32px rgba(0,0,0,0.02)",
              height: "420px",
            }}
          >
            <Heading
              variant="heading-strong-m"
              style={{ color: "#1C1C1E", marginBottom: "24px" }}
            >
              Top Highlights
            </Heading>
            <Column style={{ gap: "12px" }}>
              {topTraits.length > 0 ? (
                topTraits.map((trait) => {
                  const meta = TRAIT_META[trait.subject] ?? {
                    icon: <Utensils size={20} />,
                    label: trait.subject,
                    desc: "A key taste preference",
                    bg: "#F9F9FB",
                    iconColor: "#8E8E93",
                  };
                  return (
                    <Row
                      key={trait.subject}
                      style={{
                        paddingTop: "16px",
                        paddingBottom: "16px",
                        paddingLeft: "20px",
                        paddingRight: "20px",
                        backgroundColor: "#FFFFFF",
                        borderRadius: "18px",
                        gap: "16px",
                        alignItems: "center",
                        borderTopWidth: "1px",
                        borderBottomWidth: "1px",
                        borderLeftWidth: "1px",
                        borderRightWidth: "1px",
                        borderStyle: "solid",
                        borderColor: meta.bg,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          backgroundColor: meta.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: meta.iconColor,
                        }}
                      >
                        {meta.icon}
                      </div>
                      <Column style={{ gap: "2px" }}>
                        <Text
                          style={{
                            color: "#1C1C1E",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                          }}
                        >
                          {meta.label}
                        </Text>
                        <Text
                          style={{
                            color: "#8E8E93",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                          }}
                        >
                          {meta.desc} ·{" "}
                          {Math.round(
                            (trait.A / (trait.fullMark ?? 100)) * 100,
                          )}
                          %
                        </Text>
                      </Column>
                    </Row>
                  );
                })
              ) : (
                <Text
                  style={{
                    color: "#8E8E93",
                    fontSize: "0.85rem",
                    paddingTop: "12px",
                  }}
                >
                  Complete the taste quiz to unlock your top traits!
                </Text>
              )}
            </Column>
            <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }} />
            <Row
              style={{
                backgroundColor: "#F9F9FB",
                paddingTop: "16px",
                paddingBottom: "16px",
                paddingLeft: "20px",
                paddingRight: "20px",
                borderRadius: "18px",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#636366",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                Taste Match with Friends
              </Text>
              <Text style={{ color: "#007AFF", fontWeight: 800 }}>88%</Text>
            </Row>
          </Column>
        </Row>

        {/* ═══ TABS SECTION ═══ */}
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
              borderBottomColor: "#EAF2FF",
              paddingBottom: "12px",
              marginBottom: "32px",
            }}
          >
            {["Posts", "Reviews", "Achievements", "Visited"].map((tab) => (
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
                    color: activeTab === tab ? "#007AFF" : "#8E8E93",
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
                      backgroundColor: "#007AFF",
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "40px",
                  }}
                >
                  <Text style={{ color: "#8E8E93" }}>No posts yet.</Text>
                </div>
              )}

              {activeTab === "Achievements" && (
                <Column fillWidth gap="24">
                  <Row fillWidth horizontal="between" vertical="center" paddingX="8">
                    <Column gap="4">
                      <Heading variant="display-strong-s">Kho Huy Hiệu</Heading>
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        Sưu tập và phô diễn hành trình ẩm thực của bạn
                      </Text>
                    </Column>
                    <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <Text variant="body-strong-xs">{(user?.badges || []).length} / 50</Text>
                    </div>
                  </Row>

                  <Grid columns={3} gap="20" s={{ columns: 2 }} m={{ columns: 3 }}>
                    {(user?.badges || []).map((badge: any, index: number) => (
                      <BadgeCard key={badge.id || index} badge={badge} delay={index * 0.05} />
                    ))}
                    {(!user?.badges || user.badges.length === 0) && (
                      <Column fillWidth horizontal="center" vertical="center" padding="64" gap="16" background="neutral-alpha-weak" radius="xl" style={{ border: '2px dashed rgba(0,0,0,0.05)', gridColumn: 'span 3' }}>
                        <div style={{ opacity: 0.2 }}>
                          <Award size={48} />
                        </div>
                        <Text variant="body-default-s" onBackground="neutral-weak">Chưa có huy hiệu nào. Hãy tham gia thử thách ngay!</Text>
                        <Button variant="secondary" size="s">Khám phá thử thách</Button>
                      </Column>
                    )}
                  </Grid>
                </Column>
              )}

              {activeTab === "Reviews" && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "40px",
                  }}
                >
                  <Text style={{ color: "#8E8E93" }}>No reviews yet.</Text>
                </div>
              )}

              {activeTab === "Visited" && (
                <Column
                  style={{
                    gap: "20px",
                    height: "400px",
                    backgroundColor: "#FFFFFF",
                    borderTopWidth: "1px",
                    borderBottomWidth: "1px",
                    borderLeftWidth: "1px",
                    borderRightWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#EAF2FF",
                    borderRadius: "32px",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MapIcon size={48} color="#007AFF" style={{ opacity: 0.2 }} />
                  <Text
                    style={{ color: "#007AFF", fontWeight: 600, opacity: 0.5 }}
                  >
                    Interactive Map Coming Soon 🗺️
                  </Text>
                  <Button variant="secondary" size="s">
                    View List instead
                  </Button>
                </Column>
              )}
            </motion.div>
          </AnimatePresence>
        </Column>
      </Column>

      {/* ═══════════ EDIT PROFILE MODAL ═══════════ */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsEditModalOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              backgroundColor: "rgba(28, 28, 30, 0.4)",
              backdropFilter: "blur(16px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{
                width: "640px",
                maxWidth: "95vw",
                maxHeight: "90vh",
                backgroundColor: "#FFFFFF",
                borderTopWidth: "1px",
                borderBottomWidth: "1px",
                borderLeftWidth: "1px",
                borderRightWidth: "1px",
                borderTopStyle: "solid",
                borderBottomStyle: "solid",
                borderLeftStyle: "solid",
                borderRightStyle: "solid",
                borderTopColor: "rgba(0, 122, 255, 0.1)",
                borderBottomColor: "rgba(0, 122, 255, 0.1)",
                borderLeftColor: "rgba(0, 122, 255, 0.1)",
                borderRightColor: "rgba(0, 122, 255, 0.1)",
                borderRadius: "28px",
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Modal Header */}
              <Row
                style={{
                  paddingTop: "24px",
                  paddingRight: "32px",
                  paddingBottom: "24px",
                  paddingLeft: "32px",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#EAF2FF",
                  borderTopWidth: "0px",
                  borderLeftWidth: "0px",
                  borderRightWidth: "0px",
                  borderBottomWidth: "1px",
                  borderBottomStyle: "solid",
                  borderBottomColor: "rgba(0, 122, 255, 0.08)",
                  flexShrink: 0,
                }}
              >
                <Column style={{ gap: "4px" }}>
                  <Heading
                    variant="heading-strong-m"
                    style={{ color: "#1C1C1E" }}
                  >
                    Edit Profile
                  </Heading>
                  <Text
                    style={{
                      color: "#007AFF",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    Personalize your TasteMap identity
                  </Text>
                </Column>
                <IconButton
                  icon={<X size={20} color="#007AFF" />}
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "14px",
                    width: "44px",
                    height: "44px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0, 122, 255, 0.1)",
                    borderTopWidth: "1px",
                    borderBottomWidth: "1px",
                    borderLeftWidth: "1px",
                    borderRightWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "rgba(0, 122, 255, 0.05)",
                  }}
                />
              </Row>

              {/* Scrollable Body */}
              <div
                style={{
                  flexGrow: 1,
                  flexShrink: 1,
                  flexBasis: "0%",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Cover + Avatar Visual */}
                <Column
                  style={{
                    paddingTop: "32px",
                    paddingRight: "32px",
                    paddingBottom: "0",
                    paddingLeft: "32px",
                    gap: "20px",
                  }}
                >
                  {/* Cover Photo */}
                  <div
                    style={{
                      position: "relative",
                      height: "140px",
                      borderRadius: "18px",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={
                        coverPreview ||
                        user?.cover_url ||
                        "https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&q=80"
                      }
                      alt="Cover"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.1)",
                      }}
                    />
                    <div
                      onClick={() => coverInputRef.current?.click()}
                      style={{
                        position: "absolute",
                        bottom: "12px",
                        right: "12px",
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(8px)",
                        borderTopWidth: "1px",
                        borderBottomWidth: "1px",
                        borderLeftWidth: "1px",
                        borderRightWidth: "1px",
                        borderStyle: "solid",
                        borderColor: "rgba(255,255,255,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Camera size={18} color="#1C1C1E" />
                    </div>
                  </div>

                  {/* Avatar */}
                  <Row
                    style={{
                      marginTop: "-54px",
                      marginLeft: "24px",
                      zIndex: 2,
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <Avatar
                        src={avatarPreview || user?.avatar_url || ""}
                        size="xl"
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          borderTopWidth: "4px",
                          borderBottomWidth: "4px",
                          borderLeftWidth: "4px",
                          borderRightWidth: "4px",
                          borderStyle: "solid",
                          borderColor: "#FFFFFF",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                        }}
                      />
                      <div
                        onClick={() => avatarInputRef.current?.click()}
                        style={{
                          position: "absolute",
                          bottom: "2px",
                          right: "2px",
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          backgroundColor: "#007AFF",
                          borderTopWidth: "3px",
                          borderBottomWidth: "3px",
                          borderLeftWidth: "3px",
                          borderRightWidth: "3px",
                          borderStyle: "solid",
                          borderColor: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(0,122,255,0.3)",
                        }}
                      >
                        <Camera size={14} color="white" />
                      </div>
                    </div>
                  </Row>
                </Column>

                {/* Form Fields */}
                <Column
                  style={{
                    paddingTop: "24px",
                    paddingRight: "32px",
                    paddingBottom: "48px",
                    paddingLeft: "32px",
                    gap: "24px",
                  }}
                >
                  {/* Public Info */}
                  <Column style={{ gap: "24px" }}>
                    <Row style={{ gap: "10px", alignItems: "center" }}>
                      <div
                        style={{
                          width: "4px",
                          height: "16px",
                          backgroundColor: "#007AFF",
                          borderRadius: "2px",
                        }}
                      />
                      <Text
                        style={{
                          color: "#007AFF",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        Public Information
                      </Text>
                    </Row>

                    {/* Display Name */}
                    <Column style={{ gap: "8px" }}>
                      <Text
                        style={{
                          color: "#1C1C1E",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        Display Name
                      </Text>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        style={{
                          width: "100%",
                          paddingTop: "14px",
                          paddingRight: "20px",
                          paddingBottom: "14px",
                          paddingLeft: "20px",
                          backgroundColor: "#F9F9FB",
                          borderTopWidth: "1px",
                          borderBottomWidth: "1px",
                          borderLeftWidth: "1px",
                          borderRightWidth: "1px",
                          borderStyle: "solid",
                          borderColor: "#E5E5EA",
                          borderRadius: "16px",
                          color: "#1C1C1E",
                          fontSize: "0.95rem",
                          outline: "none",
                          transition: "all 0.2s",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#007AFF";
                          e.target.style.backgroundColor = "#FFFFFF";
                          e.target.style.boxShadow =
                            "0 0 0 4px rgba(0, 122, 255, 0.1)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#E5E5EA";
                          e.target.style.backgroundColor = "#F9F9FB";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </Column>

                    {/* Username */}
                    <Column style={{ gap: "8px" }}>
                      <Text
                        style={{
                          color: "#1C1C1E",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        Username
                      </Text>
                      <Row
                        style={{
                          backgroundColor: "#F9F9FB",
                          borderTopWidth: "1px",
                          borderBottomWidth: "1px",
                          borderLeftWidth: "1px",
                          borderRightWidth: "1px",
                          borderStyle: "solid",
                          borderColor: "#E5E5EA",
                          borderRadius: "14px",
                          overflow: "hidden",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            paddingTop: "14px",
                            paddingBottom: "14px",
                            paddingLeft: "20px",
                            paddingRight: "0px",
                            color: "#8E8E93",
                            fontSize: "0.95rem",
                            userSelect: "none",
                          }}
                        >
                          @
                        </span>
                        <input
                          type="text"
                          value={formUsername}
                          onChange={(e) => setFormUsername(e.target.value)}
                          style={{
                            flexGrow: 1,
                            flexShrink: 1,
                            flexBasis: "0%",
                            paddingTop: "14px",
                            paddingBottom: "14px",
                            paddingLeft: "8px",
                            paddingRight: "20px",
                            backgroundColor: "transparent",
                            borderTopWidth: "0px",
                            borderBottomWidth: "0px",
                            borderLeftWidth: "0px",
                            borderRightWidth: "0px",
                            borderStyle: "none",
                            color: "#1C1C1E",
                            fontSize: "0.95rem",
                            outline: "none",
                          }}
                        />
                      </Row>
                    </Column>

                    {/* Bio */}
                    <Column style={{ gap: "8px" }}>
                      <Text
                        style={{
                          color: "#1C1C1E",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        Bio
                      </Text>
                      <textarea
                        value={formBio}
                        onChange={(e) => setFormBio(e.target.value)}
                        rows={3}
                        style={{
                          width: "100%",
                          paddingTop: "16px",
                          paddingRight: "20px",
                          paddingBottom: "16px",
                          paddingLeft: "20px",
                          backgroundColor: "#F9F9FB",
                          borderTopWidth: "1px",
                          borderBottomWidth: "1px",
                          borderLeftWidth: "1px",
                          borderRightWidth: "1px",
                          borderStyle: "solid",
                          borderColor: "#E5E5EA",
                          borderRadius: "16px",
                          color: "#1C1C1E",
                          fontSize: "0.95rem",
                          outline: "none",
                          resize: "none",
                          fontFamily: "inherit",
                          lineHeight: 1.6,
                          transition: "all 0.2s",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#007AFF";
                          e.target.style.backgroundColor = "#FFFFFF";
                          e.target.style.boxShadow =
                            "0 0 0 4px rgba(0, 122, 255, 0.1)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#E5E5EA";
                          e.target.style.backgroundColor = "#F9F9FB";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </Column>

                    {/* Location */}
                    <Column style={{ gap: "8px" }}>
                      <Text
                        style={{
                          color: "#1C1C1E",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        Location
                      </Text>
                      <input
                        type="text"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder="e.g. Ho Chi Minh City"
                        style={{
                          width: "100%",
                          paddingTop: "14px",
                          paddingRight: "20px",
                          paddingBottom: "14px",
                          paddingLeft: "20px",
                          backgroundColor: "#F9F9FB",
                          borderTopWidth: "1px",
                          borderBottomWidth: "1px",
                          borderLeftWidth: "1px",
                          borderRightWidth: "1px",
                          borderStyle: "solid",
                          borderColor: "#E5E5EA",
                          borderRadius: "16px",
                          color: "#1C1C1E",
                          fontSize: "0.95rem",
                          outline: "none",
                          transition: "all 0.2s",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#007AFF";
                          e.target.style.backgroundColor = "#FFFFFF";
                          e.target.style.boxShadow =
                            "0 0 0 4px rgba(0, 122, 255, 0.1)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#E5E5EA";
                          e.target.style.backgroundColor = "#F9F9FB";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </Column>
                  </Column>

                  {/* Divider */}
                  <div style={{ height: "1px", backgroundColor: "#F2F2F7" }} />

                  {/* Private Info */}
                  <Column style={{ gap: "20px" }}>
                    <Row style={{ gap: "10px", alignItems: "center" }}>
                      <Lock size={16} color="#AEAEB2" />
                      <Text
                        style={{
                          color: "#AEAEB2",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        Account Information
                      </Text>
                    </Row>

                    {/* Email */}
                    <Column style={{ gap: "8px" }}>
                      <Text
                        style={{
                          color: "#1C1C1E",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        Email Address
                      </Text>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        style={{
                          width: "100%",
                          paddingTop: "14px",
                          paddingRight: "20px",
                          paddingBottom: "14px",
                          paddingLeft: "20px",
                          backgroundColor: "#F9F9FB",
                          borderTopWidth: "1px",
                          borderBottomWidth: "1px",
                          borderLeftWidth: "1px",
                          borderRightWidth: "1px",
                          borderStyle: "solid",
                          borderColor: "#E5E5EA",
                          borderRadius: "16px",
                          color: "#1C1C1E",
                          fontSize: "0.95rem",
                          outline: "none",
                        }}
                      />
                    </Column>

                    {/* Phone */}
                    <Column style={{ gap: "8px" }}>
                      <Text
                        style={{
                          color: "#1C1C1E",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        Phone Number
                      </Text>
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        style={{
                          width: "100%",
                          paddingTop: "14px",
                          paddingRight: "20px",
                          paddingBottom: "14px",
                          paddingLeft: "20px",
                          backgroundColor: "#F9F9FB",
                          borderTopWidth: "1px",
                          borderBottomWidth: "1px",
                          borderLeftWidth: "1px",
                          borderRightWidth: "1px",
                          borderStyle: "solid",
                          borderColor: "#E5E5EA",
                          borderRadius: "16px",
                          color: "#1C1C1E",
                          fontSize: "0.95rem",
                          outline: "none",
                        }}
                      />
                    </Column>
                  </Column>

                  {/* Hidden File Inputs */}
                  <input
                    type="file"
                    ref={avatarInputRef}
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                    accept="image/jpeg, image/png, image/webp"
                  />
                  <input
                    type="file"
                    ref={coverInputRef}
                    style={{ display: "none" }}
                    onChange={handleCoverChange}
                    accept="image/jpeg, image/png, image/webp, image/gif"
                  />
                </Column>
              </div>

              {/* Modal Footer */}
              <Row
                style={{
                  paddingTop: "24px",
                  paddingRight: "32px",
                  paddingBottom: "24px",
                  paddingLeft: "32px",
                  justifyContent: "flex-end",
                  gap: "16px",
                  borderTopWidth: "1px",
                  borderTopStyle: "solid",
                  borderTopColor: "rgba(0, 122, 255, 0.08)",
                  borderLeftWidth: "0px",
                  borderRightWidth: "0px",
                  borderBottomWidth: "0px",
                  flexShrink: 0,
                  backgroundColor: "#EAF2FF",
                }}
              >
                <Button
                  size="m"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderTopWidth: "1px",
                    borderBottomWidth: "1px",
                    borderLeftWidth: "1px",
                    borderRightWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "rgba(0, 122, 255, 0.1)",
                    borderRadius: "16px",
                    color: "#8E8E93",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    paddingLeft: "28px",
                    paddingRight: "28px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="m"
                  onClick={handleSave}
                  style={{
                    backgroundColor: saveLoading ? "#B0CBFA" : "#007AFF",
                    color: "#FFFFFF",
                    borderRadius: "16px",
                    fontWeight: 700,
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    paddingLeft: "32px",
                    paddingRight: "32px",
                    cursor: saveLoading ? "not-allowed" : "pointer",
                    borderTopWidth: "0px",
                    borderBottomWidth: "0px",
                    borderLeftWidth: "0px",
                    borderRightWidth: "0px",
                    borderStyle: "none",
                    boxShadow: saveLoading
                      ? "none"
                      : "0 8px 24px rgba(0,122,255,0.3)",
                  }}
                  disabled={saveLoading}
                >
                  <Save size={16} style={{ marginRight: "8px" }} />{" "}
                  {saveLoading ? "Saving..." : "Save Changes"}
                </Button>
              </Row>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════════
//  BADGE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════

const BadgeCard = ({ badge, delay }: { badge: any; delay: number }) => {
  const IconMap: any = {
    Star, Utensils, Award, Heart, TrendingUp, Flame, Cake, Gem, Feather, PartyPopper, Users, Handshake, Shield, Medal, Trophy
  };

  const IconComponent = IconMap[badge.icon_name] || Award;

  const rarityStyles: any = {
    Common: {
      border: 'rgba(0,0,0,0.05)',
      glow: 'transparent',
      text: 'neutral-strong',
      bg: 'rgba(0,0,0,0.02)'
    },
    Rare: {
      border: 'rgba(0,122,255,0.2)',
      glow: 'rgba(0,122,255,0.1)',
      text: 'info-strong',
      bg: 'rgba(0,122,255,0.03)'
    },
    Epic: {
      border: 'rgba(175,82,222,0.3)',
      glow: 'rgba(175,82,222,0.15)',
      text: 'brand-strong',
      bg: 'rgba(175,82,222,0.05)'
    },
    Legendary: {
      border: 'rgba(251,191,36,0.5)',
      glow: 'rgba(251,191,36,0.25)',
      text: 'warning-strong',
      bg: 'rgba(251,191,36,0.08)',
      animate: true
    }
  };

  const style = rarityStyles[badge.rarity] || rarityStyles.Common;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      style={{
        position: 'relative',
        height: '100%',
        zIndex: 1
      }}
    >
      {/* Glow Aura for Epic and Legendary */}
      {(badge.rarity === 'Epic' || badge.rarity === 'Legendary') && (
        <div 
          style={{
            position: 'absolute',
            inset: '-4px',
            background: style.glow,
            filter: 'blur(20px)',
            borderRadius: '24px',
            zIndex: -1,
          }}
        />
      )}

      <Column
        fill
        padding="20"
        gap="12"
        radius="xl"
        horizontal="center"
        vertical="center"
        style={{
          background: style.bg,
          border: `1px solid ${style.border}`,
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          boxShadow: badge.rarity === 'Legendary' ? '0 10px 30px rgba(251,191,36,0.15)' : 'none'
        }}
      >
        <div 
          style={{ 
            padding: '12px', 
            borderRadius: '16px', 
            background: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            color: badge.accent_color || '#007AFF',
            position: 'relative'
          }}
        >
          {badge.rarity === 'Legendary' && (
             <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              style={{
                position: 'absolute',
                inset: -2,
                borderRadius: 'inherit',
                border: '2px dashed #FBBF24',
                opacity: 0.5
              }}
             />
          )}
          <IconComponent size={28} />
        </div>

        <Column gap="4" horizontal="center">
          <Text variant="body-strong-s">{badge.name}</Text>
          <div style={{
            padding: '2px 8px',
            borderRadius: '100px',
            background: style.border,
            marginBottom: '4px'
          }}>
            <Text variant="body-default-xs" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
              {badge.rarity}
            </Text>
          </div>
          {badge.description && (
            <Text variant="body-default-xs" onBackground="neutral-weak" style={{ fontSize: '11px', lineHeight: '1.4' }}>
              {badge.description}
            </Text>
          )}
        </Column>

        {badge.earned_at && (
          <Text variant="body-default-xs" style={{ color: 'rgba(0,0,0,0.3)', marginTop: 'auto' }}>
            {new Date(badge.earned_at).toLocaleDateString()}
          </Text>
        )}
      </Column>
    </motion.div>
  );
};
