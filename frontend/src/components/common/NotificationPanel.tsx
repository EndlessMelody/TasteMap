"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Column, Row, Text, Heading } from "@once-ui-system/core";
import {
  Bell,
  X,
  CheckCheck,
  UserPlus,
  MessageCircle,
  Star,
  Info,
  RefreshCw,
} from "lucide-react";
import type { AppNotification } from "@/hooks/useNotifications";
import { tokens } from "@/styles/tokens";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarWidth: number;
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  onAccept: (friendshipId: number, notifId: number) => Promise<void>;
  onDecline: (friendshipId: number, notifId: number) => Promise<void>;
  onRefresh: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  friend_request: {
    icon: <UserPlus size={14} />,
    color: tokens.color.warm,
    bg: `${tokens.color.warm}1A`,
  },
  friend_accepted: {
    icon: <UserPlus size={14} />,
    color: tokens.color.success,
    bg: `${tokens.color.success}1A`,
  },
  message: {
    icon: <MessageCircle size={14} />,
    color: tokens.color.warning,
    bg: `${tokens.color.warning}1A`,
  },
  achievement: {
    icon: <Star size={14} />,
    color: tokens.color.magic,
    bg: `${tokens.color.magic}1A`,
  },
};

const DEFAULT_CFG = {
  icon: <Info size={14} />,
  color: tokens.color.textMuted,
  bg: tokens.color.surfaceMuted,
};

function cfg(type: string) {
  return TYPE_CFG[type] ?? DEFAULT_CFG;
}

function groupByDate(
  items: AppNotification[],
): { label: string; items: AppNotification[] }[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);

  const buckets: Record<string, AppNotification[]> = {};
  for (const n of items) {
    const d = new Date(n.created_at);
    const label =
      d >= todayStart ? "Today" : d >= yesterdayStart ? "Yesterday" : "Earlier";
    if (!buckets[label]) buckets[label] = [];
    buckets[label].push(n);
  }

  return ["Today", "Yesterday", "Earlier"]
    .filter((l) => buckets[l])
    .map((l) => ({ label: l, items: buckets[l] }));
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Single notification item ─────────────────────────────────────────────────

interface NotifItemProps {
  notif: AppNotification;
  onMarkRead: (id: number) => void;
  onAccept: (friendshipId: number, notifId: number) => Promise<void>;
  onDecline: (friendshipId: number, notifId: number) => Promise<void>;
}

const NotifItem = React.memo(
  function NotifItem({
    notif,
    onMarkRead,
    onAccept,
    onDecline,
  }: NotifItemProps) {
    const [busy, setBusy] = React.useState(false);
    const c = cfg(notif.type);
    const isFriendReq = notif.type === "friend_request" && notif.reference_id;

    return (
      <Column
        onClick={() => {
          if (!isFriendReq && !notif.is_read) onMarkRead(notif.id);
        }}
        style={{
          padding: "14px 18px",
          borderBottom: `1px solid ${tokens.color.border}`,
          transition: "background-color 150ms",
          backgroundColor: notif.is_read ? "transparent" : `${tokens.color.cool}07`,
          cursor: isFriendReq ? "default" : "pointer",
        }}
      >
        <Row style={{ gap: 12, alignItems: "flex-start" }}>
          {/* Type icon */}
          <Row
            horizontal="center"
            vertical="center"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              flexShrink: 0,
              backgroundColor: c.bg,
              color: c.color,
            }}
          >
            {c.icon}
          </Row>

          {/* Text content */}
          <Column style={{ gap: 3, flex: 1, minWidth: 0 }}>
            <Text
              style={{
                fontSize: 13,
                color: tokens.color.text,
                lineHeight: 1.4,
                fontWeight: notif.is_read ? 500 : 700,
              }}
            >
              {notif.title}
            </Text>

            {notif.body && (
              <Text style={{ fontSize: 12, color: tokens.color.textMuted, lineHeight: 1.4 }}>
                {notif.body}
              </Text>
            )}

            {/* Inline Accept / Decline for friend requests */}
            {isFriendReq && (
              <Row style={{ gap: 8, marginTop: 6 }}>
                <button
                  disabled={busy}
                  onClick={async (e) => {
                    e.stopPropagation();
                    setBusy(true);
                    try {
                      await onAccept(notif.reference_id!, notif.id);
                    } finally {
                      setBusy(false);
                    }
                  }}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 8,
                    border: "none",
                    fontSize: 12,
                    fontWeight: 700,
                    backgroundColor: busy ? `${tokens.color.warm}40` : tokens.color.warm,
                    cursor: busy ? "default" : "pointer",
                    color: busy ? undefined : tokens.color.textInverse,
                  }}
                >
                  Accept
                </button>
                <button
                  disabled={busy}
                  onClick={async (e) => {
                    e.stopPropagation();
                    setBusy(true);
                    try {
                      await onDecline(notif.reference_id!, notif.id);
                    } finally {
                      setBusy(false);
                    }
                  }}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 8,
                    border: `1.5px solid ${tokens.color.borderStrong}`,
                    transition: "background-color 150ms",
                    backgroundColor: tokens.color.surface,
                    cursor: busy ? "default" : "pointer",
                    color: tokens.color.textMuted,
                  }}
                  onMouseEnter={(e) => {
                    if (!busy) e.currentTarget.style.backgroundColor = tokens.color.surfaceMuted;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = tokens.color.surface;
                  }}
                >
                  Decline
                </button>
              </Row>
            )}

            <Text style={{ fontSize: 11, color: tokens.color.textSubtle, marginTop: 2 }}>
              {timeAgo(notif.created_at)}
            </Text>
          </Column>

          {/* Unread dot */}
          {!notif.is_read && (
            <Column
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: tokens.color.warm,
                flexShrink: 0,
                marginTop: 5,
              }}
            />
          )}
        </Row>
      </Column>
    );
  }
);

// ─── Panel ────────────────────────────────────────────────────────────────────

export default function NotificationPanel({
  isOpen,
  onClose,
  sidebarWidth,
  notifications,
  unreadCount,
  loading,
  onMarkRead,
  onMarkAllRead,
  onAccept,
  onDecline,
  onRefresh,
}: NotificationPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="notif-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 998,
              backgroundColor: "rgba(0,0,0,0.15)",
            }}
          />

          {/* Slide-in panel */}
          <motion.div
            key="notif-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              left: sidebarWidth,
              width: 340,
              backgroundColor: tokens.color.surface,
              boxShadow: "6px 0 32px rgba(0,0,0,0.11)",
              zIndex: 999,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRight: `1px solid ${tokens.color.border}`,
              willChange: "transform, opacity",
              transform: "translateZ(0)",
            }}
          >
            {/* ─ Header ─ */}
            <Row
              vertical="center"
              horizontal="between"
              style={{
                padding: "20px 18px 16px",
                borderBottom: `1px solid ${tokens.color.border}`,
                flexShrink: 0,
              }}
            >
              <Row vertical="center" style={{ gap: 10 }}>
                <Bell size={17} style={{ color: tokens.color.text }} />
                <Heading variant="heading-strong-s" style={{ color: tokens.color.text }}>
                  Notifications
                </Heading>
                {unreadCount > 0 && (
                  <Column
                    style={{
                      padding: "2px 8px",
                      borderRadius: "999px",
                      backgroundColor: tokens.color.danger,
                      color: tokens.color.textInverse,
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {unreadCount}
                  </Column>
                )}
              </Row>

              <Row vertical="center" style={{ gap: 6 }}>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "5px 10px",
                      borderRadius: 8,
                      border: `1px solid ${tokens.color.borderStrong}`,
                      backgroundColor: "transparent",
                      color: tokens.color.textMuted,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "background-color 150ms",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = tokens.color.surfaceMuted;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <CheckCheck size={11} />
                    All read
                  </button>
                )}
                <button
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    border: "none",
                    backgroundColor: tokens.color.surfaceMuted,
                    color: tokens.color.textMuted,
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "background-color 150ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = tokens.color.borderStrong;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = tokens.color.surfaceMuted;
                  }}
                >
                  <X size={14} />
                </button>
              </Row>
            </Row>

            {/* ─ List ─ */}
            <Column className="no-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
              {loading ? (
                <Column style={{ padding: "24px 18px", gap: 18 }}>
                  {[1, 2, 3].map((i) => (
                    <Row key={i} style={{ gap: 12, alignItems: "flex-start" }}>
                      <Column
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          backgroundColor: tokens.color.surfaceMuted,
                          flexShrink: 0,
                          animation: "tm-pulse 1.4s ease-in-out infinite",
                        }}
                      />
                      <Column style={{ gap: 8, flex: 1 }}>
                        <Column
                          style={{
                            height: 12,
                            backgroundColor: tokens.color.surfaceMuted,
                            borderRadius: "999px",
                            width: "72%",
                            animation: "tm-pulse 1.4s ease-in-out infinite",
                          }}
                        />
                        <Column
                          style={{
                            height: 10,
                            backgroundColor: tokens.color.surfaceMuted,
                            borderRadius: "999px",
                            width: "48%",
                            animation: "tm-pulse 1.4s ease-in-out infinite",
                          }}
                        />
                      </Column>
                    </Row>
                  ))}
                  <style>{`
                    @keyframes tm-pulse {
                      0%, 100% { opacity: 1; }
                      50% { opacity: 0.45; }
                    }
                  `}</style>
                </Column>
              ) : notifications.length === 0 ? (
                <Column
                  horizontal="center"
                  style={{
                    justifyContent: "center",
                    padding: "72px 24px",
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: "2.2rem" }}>🔔</Text>
                  <Text style={{ fontSize: 14, fontWeight: 700, color: tokens.color.text }}>
                    All caught up!
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: tokens.color.textMuted,
                      textAlign: "center",
                      lineHeight: 1.5,
                    }}
                  >
                    No notifications yet.
                    <br />
                    Activity from your foodies will show up here.
                  </Text>
                </Column>
              ) : (
                groupByDate(notifications).map(({ label, items }) => (
                  <React.Fragment key={label}>
                    {/* Group header */}
                    <Column
                      style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        padding: "8px 18px 6px",
                        fontSize: 10,
                        fontWeight: 800,
                        color: tokens.color.textSubtle,
                        textTransform: "uppercase",
                        letterSpacing: "0.9px",
                        backgroundColor: tokens.color.surfaceMuted,
                        borderBottom: `1px solid ${tokens.color.border}`,
                      }}
                    >
                      {label}
                    </Column>
                    {items.map((n) => (
                      <NotifItem
                        key={n.id}
                        notif={n}
                        onMarkRead={onMarkRead}
                        onAccept={onAccept}
                        onDecline={onDecline}
                      />
                    ))}
                  </React.Fragment>
                ))
              )}
            </Column>

            {/* ─ Footer ─ */}
            <Column
              style={{
                padding: "12px 18px",
                borderTop: `1px solid ${tokens.color.border}`,
                flexShrink: 0,
              }}
            >
              <button
                onClick={onRefresh}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: 9,
                  borderRadius: 10,
                  border: `1px solid ${tokens.color.borderStrong}`,
                  backgroundColor: "transparent",
                  color: tokens.color.textMuted,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color 150ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = tokens.color.surfaceMuted;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <RefreshCw size={11} />
                Refresh
              </button>
            </Column>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
