"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  MotionValue,
  useTransform,
} from "framer-motion";
import {
  Row,
  Column,
  Heading,
  Text,
  IconButton,
  Input,
  Avatar,
} from "@/components/OnceUI";
import { Bell, MessageSquare } from "lucide-react";
import { ProfileMenuItem } from "@/components/common/ProfileMenuItem";
import { LogOut, User, Settings, Info } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useInbox } from "@/hooks/useInbox";
import { LocationSelector } from "./LocationSelector";

interface DashboardHeaderProps {
  scrollY: MotionValue<number>;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onNotifClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  scrollY,
  onSettingsClick,
}) => {
  const router = useRouter();
  const { user, isInitializing: loading, logout: signOut } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  const msgRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    loading: notifsLoading,
    markRead,
    markAllRead,
    acceptFriendRequest,
    declineFriendRequest,
  } = useNotifications();
  const {
    conversations,
    loading: inboxLoading,
    totalUnread: msgUnreadCount,
    markRead: markMsgRead,
  } = useInbox();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const headerWidth = useTransform(scrollY, [0, 80], ["100%", "80%"]);
  const headerRadius = useTransform(scrollY, [0, 80], ["0px", "32px"]);
  const headerTop = useTransform(scrollY, [0, 80], ["0px", "12px"]);
  const headerPaddingX = useTransform(scrollY, [0, 80], ["40px", "24px"]);
  const headerPaddingY = useTransform(scrollY, [0, 80], ["14px", "10px"]);
  const headerShadow = useTransform(
    scrollY,
    [0, 80],
    [
      "none",
      "0 10px 30px -5px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.3)",
    ],
  );
  const headerBorder = useTransform(
    scrollY,
    [0, 80],
    ["rgba(0,0,0,0.05)", "rgba(0,0,0,0.1)"],
  );

  // New transforms for Profile "Trim" (ẩn tên)
  const profileTextOpacity = useTransform(scrollY, [0, 60], [1, 0]);
  const profileTextWidth = useTransform(scrollY, [0, 80], ["auto", "0px"]);
  const profileGap = useTransform(scrollY, [0, 80], ["12px", "0px"]);

  // Transforms for Search Expansion
  const searchWidth = useTransform(scrollY, [0, 80], ["420px", "480px"]);

  // Click-outside to close notification panel
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotifOpen]);

  // Click-outside to close messages panel
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (msgRef.current && !msgRef.current.contains(e.target as Node)) {
        setIsMsgOpen(false);
      }
    };
    if (isMsgOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMsgOpen]);

  // Click-outside to close profile menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  const handleComingSoon = () =>
    toast("Will be updated in the next version 🚀");

  return (
    <motion.div
      className="sticky z-50 bg-white/80 backdrop-blur-xl noise-overlay"
      style={{
        width: headerWidth,
        borderRadius: headerRadius,
        top: headerTop,
        paddingLeft: headerPaddingX,
        paddingRight: headerPaddingX,
        paddingTop: headerPaddingY,
        paddingBottom: headerPaddingY,
        boxShadow: headerShadow,
        borderTopWidth: "1px",
        borderBottomWidth: "1px",
        borderLeftWidth: "1px",
        borderRightWidth: "1px",
        borderStyle: "solid",
        borderColor: headerBorder,
        marginLeft: "auto",
        marginRight: "auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      animate={{
        scale: isSearchFocused ? 1.005 : 1,
      }}
    >
      <Row style={{ gap: "16px", alignItems: "center" }}>
        {/* Location Selector */}
        <LocationSelector
          value={selectedLocation}
          onChange={setSelectedLocation}
        />

        {/* Search */}
        <motion.div style={{ width: searchWidth, position: "relative" }}>
          <Input
            placeholder="Search locations, tours, foodies..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{
              borderRadius: "999px",
              paddingTop: "10px",
              paddingBottom: "10px",
              paddingLeft: "20px",
              paddingRight: "20px",
              width: "100%",
              borderTopWidth: isSearchFocused ? "1.5px" : "1px",
              borderBottomWidth: isSearchFocused ? "1.5px" : "1px",
              borderLeftWidth: isSearchFocused ? "1.5px" : "1px",
              borderRightWidth: isSearchFocused ? "1.5px" : "1px",
              borderTopStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid",
              borderRightStyle: "solid",
              borderTopColor: isSearchFocused ? "#ff6b35" : "#E5E5EA",
              borderBottomColor: isSearchFocused ? "#ff6b35" : "#E5E5EA",
              borderLeftColor: isSearchFocused ? "#ff6b35" : "#E5E5EA",
              borderRightColor: isSearchFocused ? "#ff6b35" : "#E5E5EA",
              transitionProperty: "all",
              transitionDuration: "0.2s",
              boxShadow: isSearchFocused
                ? "0 0 0 4px rgba(255, 107, 53, 0.1)"
                : "none",
            }}
          />
          <Row
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              gap: "3px",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                paddingTop: "2px",
                paddingBottom: "2px",
                paddingLeft: "6px",
                paddingRight: "6px",
                backgroundColor: "#F2F2F7",
                borderTopWidth: "1px",
                borderBottomWidth: "1px",
                borderLeftWidth: "1px",
                borderRightWidth: "1px",
                borderTopStyle: "solid",
                borderBottomStyle: "solid",
                borderLeftStyle: "solid",
                borderRightStyle: "solid",
                borderTopColor: "#E5E5EA",
                borderBottomColor: "#E5E5EA",
                borderLeftColor: "#E5E5EA",
                borderRightColor: "#E5E5EA",
                borderRadius: "4px",
                fontSize: "0.6rem",
                fontWeight: 700,
                color: "#AEAEB2",
                lineHeight: 1.2,
              }}
            >
              Ctrl + K
            </span>
          </Row>
        </motion.div>
      </Row>

      {/* Focus Mask */}
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="focus-mask active"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -1,
            }}
          />
        )}
      </AnimatePresence>

      <Row style={{ gap: "8px", alignItems: "center" }}>
        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <IconButton
            icon={
              <Bell size={20} color={isNotifOpen ? "#FBBF24" : "#8E8E93"} />
            }
            variant="tertiary"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            style={{ borderRadius: "10px" }}
          />
          {unreadCount > 0 && (
            <div
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                minWidth: unreadCount > 9 ? "16px" : "14px",
                height: "14px",
                borderRadius: "9px",
                backgroundColor: "#ED1B24",
                border: "2px solid #FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
                fontWeight: 800,
                color: "white",
                lineHeight: 1,
                padding: "0 2px",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                style={{
                  position: "absolute",
                  top: "48px",
                  right: 0,
                  zIndex: 100,
                  width: "420px",
                  backgroundColor: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(24px)",
                  borderTopWidth: "1px",
                  borderBottomWidth: "1px",
                  borderLeftWidth: "1px",
                  borderRightWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "#E5E5EA",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
                }}
              >
                {/* Notification Header */}
                <div
                  style={{
                    padding: "16px 20px 12px",
                    borderBottom: "1px solid #F2F2F7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Heading variant="heading-strong-s">Notifications</Heading>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#ff6b35",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div style={{ maxHeight: 380, overflowY: "auto" }}>
                  {notifsLoading ? (
                    <div style={{ padding: "24px 20px", textAlign: "center" }}>
                      <Text style={{ color: "#8E8E93", fontSize: "0.8rem" }}>
                        Loading…
                      </Text>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div style={{ padding: "32px 20px", textAlign: "center" }}>
                      <div style={{ fontSize: "2rem", marginBottom: 8 }}>
                        🔔
                      </div>
                      <Text style={{ color: "#8E8E93", fontSize: "0.8rem" }}>
                        You&apos;re all caught up!
                      </Text>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const isFriendReq =
                        n.reference_type === "friendship" &&
                        n.title === "New Friend Request";
                      return (
                        <div
                          key={n.id}
                          onClick={() => !n.is_read && markRead(n.id)}
                          style={{
                            padding: "12px 20px",
                            borderBottom: "1px solid #F2F2F7",
                            backgroundColor: n.is_read
                              ? "transparent"
                              : "rgba(0,122,255,0.03)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            cursor: n.is_read ? "default" : "pointer",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 10,
                            }}
                          >
                            {!n.is_read && (
                              <div
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  backgroundColor: "#ff6b35",
                                  marginTop: 4,
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#1C1C1E",
                                  lineHeight: 1.4,
                                }}
                              >
                                {n.title}
                              </Text>
                              {n.body && (
                                <Text
                                  style={{
                                    fontSize: 12,
                                    color: "#8E8E93",
                                    marginTop: 2,
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {n.body}
                                </Text>
                              )}
                            </div>
                          </div>
                          {isFriendReq && n.reference_id && (
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                marginTop: 4,
                                marginLeft: n.is_read ? 0 : 17,
                              }}
                            >
                              <button
                                onClick={() =>
                                  acceptFriendRequest(n.reference_id!, n.id)
                                }
                                style={{
                                  flex: 1,
                                  padding: "6px 0",
                                  borderRadius: 8,
                                  border: "none",
                                  backgroundColor: "#ff6b35",
                                  color: "white",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  declineFriendRequest(n.reference_id!, n.id)
                                }
                                style={{
                                  flex: 1,
                                  padding: "6px 0",
                                  borderRadius: 8,
                                  border: "1px solid #E5E5EA",
                                  backgroundColor: "transparent",
                                  color: "#8E8E93",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Messages */}
        <div ref={msgRef} style={{ position: "relative" }}>
          <IconButton
            icon={
              <MessageSquare
                size={20}
                color={isMsgOpen ? "#ff6b35" : "#8E8E93"}
              />
            }
            variant="tertiary"
            onClick={() => setIsMsgOpen(!isMsgOpen)}
            style={{ borderRadius: "10px" }}
          />
          {msgUnreadCount > 0 && (
            <div
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                minWidth: msgUnreadCount > 9 ? "16px" : "14px",
                height: "14px",
                borderRadius: "9px",
                backgroundColor: "#ff6b35",
                border: "2px solid #FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
                fontWeight: 800,
                color: "white",
                lineHeight: 1,
                padding: "0 2px",
              }}
            >
              {msgUnreadCount > 9 ? "9+" : msgUnreadCount}
            </div>
          )}

          <AnimatePresence>
            {isMsgOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                style={{
                  position: "absolute",
                  top: "48px",
                  right: 0,
                  zIndex: 100,
                  width: "380px",
                  backgroundColor: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(24px)",
                  borderTopWidth: "1px",
                  borderBottomWidth: "1px",
                  borderLeftWidth: "1px",
                  borderRightWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "#E5E5EA",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
                }}
              >
                {/* Messages Header */}
                <div
                  style={{
                    padding: "16px 20px 12px",
                    borderBottom: "1px solid #F2F2F7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Heading variant="heading-strong-s">Messages</Heading>
                </div>

                {/* Conversations List */}
                <div style={{ maxHeight: 420, overflowY: "auto" }}>
                  {inboxLoading ? (
                    <div style={{ padding: "24px 20px", textAlign: "center" }}>
                      <Text style={{ color: "#8E8E93", fontSize: "0.8rem" }}>
                        Loading…
                      </Text>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div style={{ padding: "32px 20px", textAlign: "center" }}>
                      <div style={{ fontSize: "2rem", marginBottom: 8 }}>
                        💬
                      </div>
                      <Text style={{ color: "#8E8E93", fontSize: "0.8rem" }}>
                        No messages yet
                      </Text>
                    </div>
                  ) : (
                    conversations.map((c) => (
                      <div
                        key={c.partner_id}
                        onClick={() => {
                          if (c.unread_count > 0) markMsgRead(c.partner_id);
                          setIsMsgOpen(false);
                          router.push(`/foodies/${c.partner_id}`);
                        }}
                        style={{
                          padding: "12px 20px",
                          borderBottom: "1px solid #F2F2F7",
                          backgroundColor:
                            c.unread_count > 0
                              ? "rgba(0,122,255,0.03)"
                              : "transparent",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          cursor: "pointer",
                        }}
                      >
                        <Avatar src={c.partner_avatar || undefined} size="s" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 2,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#1C1C1E",
                              }}
                            >
                              {c.partner_name}
                            </Text>
                            <Text style={{ fontSize: 11, color: "#8E8E93" }}>
                              {c.last_message_time}
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                color:
                                  c.unread_count > 0 ? "#3C3C43" : "#8E8E93",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                flex: 1,
                                fontWeight: c.unread_count > 0 ? 500 : 400,
                              }}
                            >
                              {c.is_sent_by_me && (
                                <span style={{ color: "#8E8E93" }}>You: </span>
                              )}
                              {c.last_message}
                            </Text>
                            {c.unread_count > 0 && (
                              <div
                                style={{
                                  minWidth: 18,
                                  height: 18,
                                  borderRadius: "9px",
                                  backgroundColor: "#ff6b35",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: "white",
                                  padding: "0 5px",
                                }}
                              >
                                {c.unread_count}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div ref={profileMenuRef} style={{ position: "relative" }}>
          {/* Keyframes for skeleton pulse */}
          <style>{`
            @keyframes tm-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.45; }
            }
          `}</style>

          {loading ? (
            /* ── Loading: circular skeleton ── */
            <div
              style={{
                marginLeft: "12px",
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "#F2F2F7",
                animation: "tm-pulse 1.4s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
          ) : !user ? (
            /* ── Guest: Sign In button ── */
            <button
              onClick={() => router.push("/login")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginLeft: "12px",
                padding: "8px 18px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #1A7AFF, #0057D9)",
                border: "none",
                cursor: "pointer",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                boxShadow: "0 2px 10px rgba(0,100,255,0.25)",
                transition: "box-shadow 0.15s, transform 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(0,100,255,0.35)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 2px 10px rgba(0,100,255,0.25)";
                e.currentTarget.style.transform = "none";
              }}
            >
              Sign In
            </button>
          ) : (
            /* ── Logged in: avatar + name + dropdown ── */
            <motion.div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: profileGap,
                marginLeft: "12px",
                cursor: "pointer",
              }}
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <Avatar src={user?.avatar_url || undefined} size="m" />
              <motion.div
                style={{
                  opacity: profileTextOpacity,
                  width: profileTextWidth,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  whiteSpace: "nowrap",
                }}
              >
                <Text
                  style={{
                    color: "#1C1C1E",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  {user?.display_name || user?.username || "User"}
                </Text>
                <Text style={{ color: "#AEAEB2", fontSize: "0.7rem" }}>
                  Level {user?.level ?? 1}
                </Text>
              </motion.div>
            </motion.div>
          )}

          <AnimatePresence>
            {isProfileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                style={{
                  position: "absolute",
                  top: "56px",
                  right: 0,
                  zIndex: 999,
                  width: "280px",
                  backgroundColor: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(24px)",
                  borderTopWidth: "1px",
                  borderBottomWidth: "1px",
                  borderLeftWidth: "1px",
                  borderRightWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "#E5E5EA",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.08)",
                  paddingTop: "6px",
                  paddingBottom: "6px",
                  paddingLeft: "6px",
                  paddingRight: "6px",
                }}
              >
                <Column
                  style={{
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    paddingLeft: "0px",
                    paddingRight: "0px",
                  }}
                >
                  <ProfileMenuItem
                    icon={<User size={16} />}
                    label="Hồ sơ cá nhân"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      router.push("/profile");
                    }}
                  />
                  <ProfileMenuItem
                    icon={<Settings size={16} />}
                    label="Tùy chỉnh hệ thống"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSettingsClick();
                    }}
                  />
                  <ProfileMenuItem
                    icon={<Info size={16} />}
                    label="Thông tin & Trợ giúp"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleComingSoon();
                    }}
                  />
                </Column>
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "#F2F2F7",
                    marginTop: "4px",
                    marginBottom: "4px",
                    marginLeft: "10px",
                    marginRight: "10px",
                  }}
                />
                <ProfileMenuItem
                  icon={<LogOut size={16} color="#ED1B24" />}
                  label="Đăng xuất"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    signOut();
                    router.push("/");
                  }}
                  style={{ color: "#ED1B24" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Row>
    </motion.div>
  );
};
