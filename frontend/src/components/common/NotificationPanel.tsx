"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Column, Row, Text, Heading } from "@/components/OnceUI";
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
    color: "#007AFF",
    bg: "rgba(0,122,255,0.1)",
  },
  friend_accepted: {
    icon: <UserPlus size={14} />,
    color: "#34C759",
    bg: "rgba(52,199,89,0.1)",
  },
  message: {
    icon: <MessageCircle size={14} />,
    color: "#FF9500",
    bg: "rgba(255,149,0,0.1)",
  },
  achievement: {
    icon: <Star size={14} />,
    color: "#AF52DE",
    bg: "rgba(175,82,222,0.1)",
  },
};

function cfg(type: string) {
  return (
    TYPE_CFG[type] ?? {
      icon: <Info size={14} />,
      color: "#8E8E93",
      bg: "rgba(142,142,147,0.1)",
    }
  );
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

function NotifItem({ notif, onMarkRead, onAccept, onDecline }: NotifItemProps) {
  const [busy, setBusy] = React.useState(false);
  const c = cfg(notif.type);
  const isFriendReq = notif.type === "friend_request" && notif.reference_id;

  return (
    <div
      onClick={() => {
        if (!isFriendReq && !notif.is_read) onMarkRead(notif.id);
      }}
      style={{
        padding: "14px 18px",
        borderBottom: "1px solid rgba(0,0,0,0.045)",
        backgroundColor: notif.is_read
          ? "transparent"
          : "rgba(0,122,255,0.028)",
        cursor: isFriendReq ? "default" : "pointer",
        transition: "background 0.15s",
      }}
    >
      <Row style={{ gap: 12, alignItems: "flex-start" }}>
        {/* Type icon */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            backgroundColor: c.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: c.color,
          }}
        >
          {c.icon}
        </div>

        {/* Text content */}
        <Column style={{ gap: 3, flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: notif.is_read ? 500 : 700,
              color: "#1C1C1E",
              lineHeight: 1.4,
            }}
          >
            {notif.title}
          </Text>

          {notif.body && (
            <Text
              style={{
                fontSize: 12,
                color: "rgba(0,0,0,0.5)",
                lineHeight: 1.4,
              }}
            >
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
                  backgroundColor: busy ? "#A8C7FA" : "#007AFF",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: busy ? "default" : "pointer",
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
                  border: "1.5px solid rgba(0,0,0,0.1)",
                  backgroundColor: "white",
                  color: "rgba(0,0,0,0.55)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: busy ? "default" : "pointer",
                }}
              >
                Decline
              </button>
            </Row>
          )}

          <Text
            style={{ fontSize: 11, color: "rgba(0,0,0,0.32)", marginTop: 2 }}
          >
            {timeAgo(notif.created_at)}
          </Text>
        </Column>

        {/* Unread dot */}
        {!notif.is_read && (
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "#007AFF",
              flexShrink: 0,
              marginTop: 5,
            }}
          />
        )}
      </Row>
    </div>
  );
}

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
              backgroundColor: "#FFFFFF",
              boxShadow: "6px 0 32px rgba(0,0,0,0.11)",
              zIndex: 999,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRight: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {/* ─ Header ─ */}
            <Row
              style={{
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 18px 16px",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                flexShrink: 0,
              }}
            >
              <Row style={{ alignItems: "center", gap: 10 }}>
                <Bell size={17} color="#1C1C1E" />
                <Heading
                  variant="heading-strong-s"
                  style={{ color: "#1C1C1E" }}
                >
                  Notifications
                </Heading>
                {unreadCount > 0 && (
                  <div
                    style={{
                      padding: "2px 8px",
                      borderRadius: 20,
                      backgroundColor: "#FF3B30",
                      color: "white",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {unreadCount}
                  </div>
                )}
              </Row>

              <Row style={{ gap: 6, alignItems: "center" }}>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "5px 10px",
                      borderRadius: 8,
                      border: "1px solid rgba(0,0,0,0.08)",
                      backgroundColor: "transparent",
                      color: "rgba(0,0,0,0.45)",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
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
                    backgroundColor: "rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    color: "rgba(0,0,0,0.5)",
                    flexShrink: 0,
                  }}
                >
                  <X size={14} />
                </button>
              </Row>
            </Row>

            {/* ─ List ─ */}
            <div
              className="no-scrollbar"
              style={{ flex: 1, overflowY: "auto" }}
            >
              {loading ? (
                <Column style={{ padding: "24px 18px", gap: 18 }}>
                  {[1, 2, 3].map((i) => (
                    <Row key={i} style={{ gap: 12, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          backgroundColor: "rgba(0,0,0,0.06)",
                          flexShrink: 0,
                          animation: "pulse 1.4s ease-in-out infinite",
                        }}
                      />
                      <Column style={{ gap: 8, flex: 1 }}>
                        <div
                          style={{
                            height: 12,
                            backgroundColor: "rgba(0,0,0,0.06)",
                            borderRadius: 6,
                            width: "72%",
                            animation: "pulse 1.4s ease-in-out infinite",
                          }}
                        />
                        <div
                          style={{
                            height: 10,
                            backgroundColor: "rgba(0,0,0,0.04)",
                            borderRadius: 5,
                            width: "48%",
                            animation: "pulse 1.4s ease-in-out infinite",
                          }}
                        />
                      </Column>
                    </Row>
                  ))}
                </Column>
              ) : notifications.length === 0 ? (
                <Column
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "72px 24px",
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: "2.2rem" }}>🔔</Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#1C1C1E",
                    }}
                  >
                    All caught up!
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "rgba(0,0,0,0.38)",
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
                    <div
                      style={{
                        padding: "8px 18px 6px",
                        fontSize: 10,
                        fontWeight: 800,
                        color: "rgba(0,0,0,0.32)",
                        textTransform: "uppercase",
                        letterSpacing: "0.9px",
                        backgroundColor: "rgba(0,0,0,0.018)",
                        borderBottom: "1px solid rgba(0,0,0,0.04)",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      {label}
                    </div>
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
            </div>

            {/* ─ Footer ─ */}
            <div
              style={{
                padding: "12px 18px",
                borderTop: "1px solid rgba(0,0,0,0.06)",
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
                  padding: "9px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.08)",
                  backgroundColor: "transparent",
                  color: "rgba(0,0,0,0.38)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={11} />
                Refresh
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
