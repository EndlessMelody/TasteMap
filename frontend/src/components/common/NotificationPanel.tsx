"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Column, Row, Text, Heading } from "@/components/OnceUI";
import { cn } from "@/lib/cn";
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
  { icon: React.ReactNode; colorClass: string; bgClass: string }
> = {
  friend_request: {
    icon: <UserPlus size={14} />,
    colorClass: "text-[#ff6b35]",
    bgClass: "bg-[#ff6b35]/10",
  },
  friend_accepted: {
    icon: <UserPlus size={14} />,
    colorClass: "text-[#34C759]",
    bgClass: "bg-[#34C759]/10",
  },
  message: {
    icon: <MessageCircle size={14} />,
    colorClass: "text-[#FF9500]",
    bgClass: "bg-[#FF9500]/10",
  },
  achievement: {
    icon: <Star size={14} />,
    colorClass: "text-[#AF52DE]",
    bgClass: "bg-[#AF52DE]/10",
  },
};

function cfg(type: string) {
  return (
    TYPE_CFG[type] ?? {
      icon: <Info size={14} />,
      colorClass: "text-[#8E8E93]",
      bgClass: "bg-[#8E8E93]/10",
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
      <div
        onClick={() => {
          if (!isFriendReq && !notif.is_read) onMarkRead(notif.id);
        }}
        className={cn(
          "px-[18px] py-[14px] border-b border-[rgba(0,0,0,0.045)] transition-colors duration-150",
          notif.is_read ? "bg-transparent" : "bg-[rgba(0,122,255,0.028)]",
          isFriendReq ? "cursor-default" : "cursor-pointer",
        )}
      >
        <Row className="gap-[12px] items-start">
          {/* Type icon */}
          <div
            className={cn(
              "w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0",
              c.bgClass,
              c.colorClass,
            )}
          >
            {c.icon}
          </div>

          {/* Text content */}
          <Column className="gap-[3px] flex-1 min-w-0">
            <Text
              className={cn(
                "text-[13px] text-[#1C1C1E] leading-[1.4]",
                notif.is_read ? "font-medium" : "font-bold",
              )}
            >
              {notif.title}
            </Text>

            {notif.body && (
              <Text className="text-[12px] text-black/50 leading-[1.4]">
                {notif.body}
              </Text>
            )}

            {/* Inline Accept / Decline for friend requests */}
            {isFriendReq && (
              <Row className="gap-[8px] mt-[6px]">
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
                  className={cn(
                    "px-[14px] py-[5px] rounded-[8px] border-none text-[12px] font-bold",
                    busy
                      ? "bg-[#FFD4A3] cursor-default"
                      : "bg-[#ff6b35] cursor-pointer text-white",
                  )}
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
                  className={cn(
                    "px-[14px] py-[5px] rounded-[8px] border-[1.5px] border-black/10 transition-colors",
                    busy
                      ? "bg-white cursor-default text-black/55"
                      : "bg-white cursor-pointer text-black/55 hover:bg-black/5",
                  )}
                >
                  Decline
                </button>
              </Row>
            )}

            <Text className="text-[11px] text-black/30 mt-[2px]">
              {timeAgo(notif.created_at)}
            </Text>
          </Column>

          {/* Unread dot */}
          {!notif.is_read && (
            <div className="w-[7px] h-[7px] rounded-full bg-[#ff6b35] shrink-0 mt-[5px]" />
          )}
        </Row>
      </div>
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
            className="fixed inset-0 z-[998] bg-black/15"
          />

          {/* Slide-in panel */}
          <motion.div
            key="notif-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            style={{ "--sidebar-width": `${sidebarWidth}px` } as any}
            className="fixed top-0 bottom-0 left-[var(--sidebar-width)] w-[340px] bg-white shadow-[6px_0_32px_rgba(0,0,0,0.11)] z-[999] flex flex-col overflow-hidden border-r border-black/5 will-change-[transform,opacity] transform-gpu"
          >
            {/* ─ Header ─ */}
            <Row className="items-center justify-between px-[18px] pt-[20px] pb-[16px] border-b border-black/5 shrink-0">
              <Row className="items-center gap-[10px]">
                <Bell size={17} className="text-[#1C1C1E]" />
                <Heading variant="heading-strong-s" className="text-[#1C1C1E]">
                  Notifications
                </Heading>
                {unreadCount > 0 && (
                  <div className="px-[8px] py-[2px] rounded-full bg-[#FF3B30] text-white text-[11px] font-extrabold">
                    {unreadCount}
                  </div>
                )}
              </Row>

              <Row className="gap-[6px] items-center">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[8px] border border-black/10 bg-transparent text-black/45 text-[11px] font-semibold cursor-pointer whitespace-nowrap hover:bg-black/5 transition-colors"
                  >
                    <CheckCheck size={11} />
                    All read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-[28px] h-[28px] rounded-[8px] border-none bg-black/5 cursor-pointer text-black/50 shrink-0 hover:bg-black/10 transition-colors"
                >
                  <X size={14} />
                </button>
              </Row>
            </Row>

            {/* ─ List ─ */}
            <div className="no-scrollbar flex-1 overflow-y-auto">
              {loading ? (
                <Column className="px-[18px] py-[24px] gap-[18px]">
                  {[1, 2, 3].map((i) => (
                    <Row key={i} className="gap-[12px] items-start">
                      <div className="w-[34px] h-[34px] rounded-full bg-black/5 shrink-0 animate-pulse" />
                      <Column className="gap-[8px] flex-1">
                        <div className="h-[12px] bg-black/5 rounded-full w-[72%] animate-pulse" />
                        <div className="h-[10px] bg-black/5 rounded-full w-[48%] animate-pulse" />
                      </Column>
                    </Row>
                  ))}
                </Column>
              ) : notifications.length === 0 ? (
                <Column className="items-center justify-center px-[24px] py-[72px] gap-[10px]">
                  <Text className="text-[2.2rem]">🔔</Text>
                  <Text className="text-[14px] font-bold text-[#1C1C1E]">
                    All caught up!
                  </Text>
                  <Text className="text-[12px] text-black/40 text-center leading-[1.5]">
                    No notifications yet.
                    <br />
                    Activity from your foodies will show up here.
                  </Text>
                </Column>
              ) : (
                groupByDate(notifications).map(({ label, items }) => (
                  <React.Fragment key={label}>
                    {/* Group header */}
                    <div className="sticky top-0 z-[1] px-[18px] py-[8px] pt-[8px] pb-[6px] text-[10px] font-extrabold text-black/30 uppercase tracking-[0.9px] bg-black/[0.018] border-b border-black/5">
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
            <div className="px-[18px] py-[12px] border-t border-black/5 shrink-0">
              <button
                onClick={onRefresh}
                className="w-full flex items-center justify-center gap-[6px] p-[9px] rounded-[10px] border border-black/10 bg-transparent text-black/40 text-[12px] font-semibold cursor-pointer hover:bg-black/5 transition-colors"
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
