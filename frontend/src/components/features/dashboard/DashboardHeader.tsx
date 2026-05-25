"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  MotionValue,
  useTransform,
} from "framer-motion";
import { H3, Body, BodySm, Avatar, IconButton } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { Bell, MessageSquare, Search, LogOut, User, Settings, Info } from "lucide-react";
import { ProfileMenuItem } from "@/components/common/ProfileMenuItem";
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
      className="sticky z-50 backdrop-blur-xl noise-overlay"
      style={{
        backgroundColor: "rgba(255, 244, 238, 0.88)",
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
      <div style={{ display: "flex", flexDirection: "row", gap: tokens.space[4], alignItems: "center" }}>
        {/* Location Selector */}
        <LocationSelector
          value={selectedLocation}
          onChange={setSelectedLocation}
        />

        {/* Search */}
        <motion.div style={{ width: searchWidth, position: "relative", zIndex: 2 }}>
          <Search
            size={16}
            color={isSearchFocused ? tokens.color.warm : tokens.color.textSubtle}
            style={{
              position: "absolute",
              left: "18px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 1,
              pointerEvents: "none",
              transition: "color 0.2s ease-out",
            }}
          />
          <input
            placeholder="Search locations, tours, foodies..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{
              borderRadius: tokens.radius.pill,
              paddingTop: "12px",
              paddingBottom: "12px",
              paddingLeft: "44px",
              paddingRight: "60px",
              width: "100%",
              outline: "none",
              backgroundColor: isSearchFocused ? tokens.color.surface : tokens.color.surfaceMuted,
              border: `${isSearchFocused ? "1.5px" : "1px"} solid ${isSearchFocused ? tokens.color.warm : tokens.color.border}`,
              transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
              boxShadow: isSearchFocused
                ? `0 8px 32px rgba(255, 107, 53, 0.12), 0 0 0 4px rgba(255, 107, 53, 0.05)`
                : "none",
              fontSize: "0.9rem",
              color: tokens.color.text,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              gap: "3px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                paddingTop: "3px",
                paddingBottom: "3px",
                paddingLeft: "8px",
                paddingRight: "8px",
                backgroundColor: isSearchFocused ? "rgba(255, 107, 53, 0.06)" : tokens.color.surface,
                border: `1px solid ${isSearchFocused ? "rgba(255, 107, 53, 0.35)" : tokens.color.border}`,
                borderRadius: tokens.radius.sm,
                fontSize: "0.65rem",
                fontWeight: tokens.type.weight.bold,
                color: isSearchFocused ? tokens.color.warm : tokens.color.textSubtle,
                lineHeight: 1.2,
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                transition: "all 0.25s",
              }}
            >
              Ctrl + K
            </span>
          </div>
        </motion.div>
      </div>

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

      <div style={{ display: "flex", flexDirection: "row", gap: tokens.space[2], alignItems: "center" }}>
        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <IconButton
            icon={
              <Bell size={20} color={isNotifOpen ? tokens.color.warning : tokens.color.textMuted} />
            }
            aria-label="Notifications"
            variant="ghost"
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
                backgroundColor: tokens.color.danger,
                border: `2px solid ${tokens.color.surface}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
                fontWeight: tokens.type.weight.black,
                color: tokens.color.textInverse,
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
                  zIndex: tokens.z.modal,
                  width: "420px",
                  backgroundColor: "rgba(255, 244, 238, 0.97)",
                  backdropFilter: "blur(24px)",
                  border: `1px solid ${tokens.color.border}`,
                  borderRadius: tokens.radius.xl,
                  overflow: "hidden",
                  boxShadow: tokens.shadow.lg,
                }}
              >
                {/* Notification Header */}
                <div
                  style={{
                    padding: "16px 20px 12px",
                    borderBottom: `1px solid ${tokens.color.surfaceMuted}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <H3>Notifications</H3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        fontSize: 12,
                        fontWeight: tokens.type.weight.semibold,
                        color: tokens.color.warm,
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
                      <BodySm tone="muted" style={{ fontSize: "0.8rem" }}>
                        Loading…
                      </BodySm>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div style={{ padding: "32px 20px", textAlign: "center" }}>
                      <div style={{ fontSize: "2rem", marginBottom: 8 }}>
                        🔔
                      </div>
                      <BodySm tone="muted" style={{ fontSize: "0.8rem" }}>
                        You&apos;re all caught up!
                      </BodySm>
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
                            borderBottom: `1px solid ${tokens.color.surfaceMuted}`,
                            backgroundColor: n.is_read ? "transparent" : "rgba(0,122,255,0.03)",
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
                                  backgroundColor: tokens.color.warm,
                                  marginTop: 4,
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <BodySm
                                style={{
                                  fontSize: 13,
                                  fontWeight: tokens.type.weight.semibold,
                                  color: tokens.color.text,
                                  lineHeight: 1.4,
                                }}
                              >
                                {n.title}
                              </BodySm>
                              {n.body && (
                                <BodySm
                                  tone="muted"
                                  style={{
                                    fontSize: 12,
                                    marginTop: 2,
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {n.body}
                                </BodySm>
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
                                  borderRadius: tokens.radius.md,
                                  border: "none",
                                  backgroundColor: tokens.color.warm,
                                  color: tokens.color.textInverse,
                                  fontSize: 12,
                                  fontWeight: tokens.type.weight.bold,
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
                                  borderRadius: tokens.radius.md,
                                  border: `1px solid ${tokens.color.border}`,
                                  backgroundColor: "transparent",
                                  color: tokens.color.textMuted,
                                  fontSize: 12,
                                  fontWeight: tokens.type.weight.semibold,
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
                color={isMsgOpen ? tokens.color.warm : tokens.color.textMuted}
              />
            }
            aria-label="Messages"
            variant="ghost"
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
                backgroundColor: tokens.color.warm,
                border: `2px solid ${tokens.color.surface}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
                fontWeight: tokens.type.weight.black,
                color: tokens.color.textInverse,
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
                  zIndex: tokens.z.modal,
                  width: "380px",
                  backgroundColor: "rgba(255, 244, 238, 0.97)",
                  backdropFilter: "blur(24px)",
                  border: `1px solid ${tokens.color.border}`,
                  borderRadius: tokens.radius.xl,
                  overflow: "hidden",
                  boxShadow: tokens.shadow.lg,
                }}
              >
                {/* Messages Header */}
                <div
                  style={{
                    padding: "16px 20px 12px",
                    borderBottom: `1px solid ${tokens.color.surfaceMuted}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <H3>Messages</H3>
                </div>

                {/* Conversations List */}
                <div style={{ maxHeight: 420, overflowY: "auto" }}>
                  {inboxLoading ? (
                    <div style={{ padding: "24px 20px", textAlign: "center" }}>
                      <BodySm tone="muted" style={{ fontSize: "0.8rem" }}>
                        Loading…
                      </BodySm>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div style={{ padding: "32px 20px", textAlign: "center" }}>
                      <div style={{ fontSize: "2rem", marginBottom: 8 }}>
                        💬
                      </div>
                      <BodySm tone="muted" style={{ fontSize: "0.8rem" }}>
                        No messages yet
                      </BodySm>
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
                          borderBottom: `1px solid ${tokens.color.surfaceMuted}`,
                          backgroundColor: c.unread_count > 0 ? "rgba(0,122,255,0.03)" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          cursor: "pointer",
                        }}
                      >
                        <Avatar src={c.partner_avatar || undefined} size="sm" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 2,
                            }}
                          >
                            <Body
                              style={{
                                fontSize: 14,
                                fontWeight: tokens.type.weight.semibold,
                                color: tokens.color.text,
                              }}
                            >
                              {c.partner_name}
                            </Body>
                            <span style={{ fontSize: 11, color: tokens.color.textMuted }}>
                              {c.last_message_time}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <BodySm
                              style={{
                                fontSize: 12,
                                color: c.unread_count > 0 ? tokens.color.textMuted : tokens.color.textSubtle,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                flex: 1,
                                fontWeight: c.unread_count > 0 ? 500 : 400,
                              }}
                            >
                              {c.is_sent_by_me && (
                                <span style={{ color: tokens.color.textMuted }}>You: </span>
                              )}
                              {c.last_message}
                            </BodySm>
                            {c.unread_count > 0 && (
                              <div
                                style={{
                                  minWidth: 18,
                                  height: 18,
                                  borderRadius: tokens.radius.pill,
                                  backgroundColor: tokens.color.warm,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 10,
                                  fontWeight: tokens.type.weight.bold,
                                  color: tokens.color.textInverse,
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
                backgroundColor: tokens.color.surfaceMuted,
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
                 background: "linear-gradient(135deg, #ff6b35, #ff4757)",
                 border: "none",
                 cursor: "pointer",
                 color: "white",
                 fontSize: 13,
                 fontWeight: 700,
                 boxShadow: "0 2px 10px rgba(255,107,53,0.25)",
                 transition: "box-shadow 0.15s, transform 0.15s",
                 whiteSpace: "nowrap",
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.boxShadow =
                   "0 4px 16px rgba(255,107,53,0.35)";
                 e.currentTarget.style.transform = "translateY(-1px)";
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.boxShadow =
                   "0 2px 10px rgba(255,107,53,0.25)";
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
              <Avatar src={user?.avatar_url || undefined} size="md" />
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
                <BodySm
                  style={{
                    color: tokens.color.text,
                    fontWeight: tokens.type.weight.semibold,
                    fontSize: "0.85rem",
                  }}
                >
                  {user?.display_name || user?.username || "User"}
                </BodySm>
                <span style={{ color: tokens.color.textSubtle, fontSize: "0.7rem" }}>
                  Level {user?.level ?? 1}
                </span>
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
                  zIndex: tokens.z.modal,
                  width: "280px",
                  backgroundColor: "rgba(255, 244, 238, 0.97)",
                  backdropFilter: "blur(24px)",
                  border: `1px solid ${tokens.color.border}`,
                  borderRadius: tokens.radius.lg,
                  overflow: "hidden",
                  boxShadow: tokens.shadow.md,
                  padding: "6px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
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
                </div>
                <div
                  style={{
                    height: "1px",
                    backgroundColor: tokens.color.surfaceMuted,
                    marginTop: "4px",
                    marginBottom: "4px",
                    marginLeft: "10px",
                    marginRight: "10px",
                  }}
                />
                <ProfileMenuItem
                  icon={<LogOut size={16} color={tokens.color.danger} />}
                  label="Đăng xuất"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    signOut();
                    router.push("/");
                  }}
                  style={{ color: tokens.color.danger }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
