"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Clock,
  MapPin,
  MoreHorizontal,
  Eye,
  UserMinus,
  UserPlus,
  Utensils,
} from "lucide-react";
import {
  Card,
  Button,
  IconButton,
  Avatar,
  H3,
  Body,
  BodySm,
  Caption,
  Pill,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";

export interface Friend {
  id: number;
  name: string;
  status: string;
  note: string;
  avatar: string;
  cover: string;
  match?: number;
  isOnline?: boolean;
  friendshipId?: number;
  lastMessageAt?: string;
}

export type FriendVariant = "friend" | "discover" | "sent";

interface FriendRowProps {
  friend: Friend;
  variant?: FriendVariant;
  onMessage: (friend: Friend) => void;
  onInvite?: (friend: Friend) => void;
  onUnfriend?: (friend: Friend) => void;
  onCancel?: (friend: Friend) => void;
  isCompact?: boolean;
  isActive?: boolean;
}

function MoreMenu({
  onViewProfile,
  onUnfriend,
}: {
  onViewProfile: () => void;
  onUnfriend: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const menuItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: tokens.space[2],
    padding: `${tokens.space[2]} ${tokens.space[4]}`,
    background: "transparent",
    border: "none",
    width: "100%",
    textAlign: "left",
    fontSize: tokens.type.size.bodySm,
    fontWeight: tokens.type.weight.semibold,
    cursor: "pointer",
    color: tokens.color.text,
    fontFamily: "inherit",
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label="More options"
        icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      />
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            background: tokens.color.surface,
            borderRadius: tokens.radius.md,
            boxShadow: tokens.shadow.lg,
            border: `1px solid ${tokens.color.border}`,
            overflow: "hidden",
            zIndex: tokens.z.overlay,
            minWidth: 180,
          }}
        >
          <button
            type="button"
            onClick={() => {
              onViewProfile();
              setOpen(false);
            }}
            style={menuItemStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = tokens.color.surfaceMuted)
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Eye size={15} strokeWidth={1.75} />
            View profile
          </button>
          <div style={{ height: 1, background: tokens.color.border }} />
          <button
            type="button"
            onClick={() => {
              onUnfriend();
              setOpen(false);
            }}
            style={{ ...menuItemStyle, color: tokens.color.danger }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(230, 57, 70, 0.06)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <UserMinus size={15} strokeWidth={1.75} />
            Unfriend
          </button>
        </motion.div>
      )}
    </div>
  );
}

function MatchGauge({ pct }: { pct: number }) {
  const size = 56;
  const strokeW = 4;
  const r = (size - strokeW * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const color =
    pct >= 85
      ? tokens.color.success
      : pct >= 70
        ? tokens.color.warning
        : tokens.color.textSubtle;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={tokens.color.border}
          strokeWidth={strokeW}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: tokens.type.weight.bold,
            color,
            lineHeight: 1,
          }}
        >
          {pct}
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: tokens.type.weight.semibold,
            color: tokens.color.textSubtle,
            lineHeight: 1,
          }}
        >
          %
        </span>
      </div>
    </div>
  );
}

function statusLabel(raw: string): string {
  return raw
    .replace(/[\u{1F300}-\u{1FFFF}]|\u{1F32E}|\u{1F336}️/gu, "")
    .trim() || "Foodie";
}

export const FriendRow: React.FC<FriendRowProps> = ({
  friend,
  variant = "discover",
  onMessage,
  onInvite,
  onUnfriend,
  onCancel,
  isCompact = false,
  isActive = false,
}) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleAction = async (fn?: (f: Friend) => void | Promise<void>) => {
    if (!fn) return;
    setBusy(true);
    try {
      await fn(friend);
    } finally {
      setBusy(false);
    }
  };

  const handleViewProfile = () => router.push(`/foodies/${friend.id}`);

  if (isCompact) {
    return (
      <button
        type="button"
        onClick={() => onMessage(friend)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: tokens.space[3],
          padding: `${tokens.space[4]} ${tokens.space[4]}`,
          width: "100%",
          background: isActive ? tokens.color.surfaceMuted : "transparent",
          border: "none",
          borderLeft: `3px solid ${
            isActive ? tokens.color.warm : "transparent"
          }`,
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.15s ease",
          minHeight: 72,
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => {
          if (!isActive)
            e.currentTarget.style.background = tokens.color.surfaceMuted;
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = "transparent";
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Avatar src={friend.avatar} name={friend.name} size="md" />
          {friend.isOnline && (
            <span
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: tokens.color.success,
                border: `2.5px solid ${tokens.color.surface}`,
              }}
            />
          )}
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: tokens.space[2],
            }}
          >
            <Body
              style={{
                fontWeight: tokens.type.weight.semibold,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {friend.name}
            </Body>
            <Caption
              tone={isActive ? "default" : "subtle"}
              style={{
                flexShrink: 0,
                color: isActive ? tokens.color.warm : undefined,
                fontWeight: isActive
                  ? tokens.type.weight.bold
                  : tokens.type.weight.medium,
              }}
            >
              {friend.lastMessageAt
                ? new Date(friend.lastMessageAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : ""}
            </Caption>
          </div>
          <Pill tone={isActive ? "warm" : "neutral"} size="sm" solid={isActive}>
            {statusLabel(friend.status)}
          </Pill>
        </div>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card
        radius="lg"
        padding="none"
        shadow="sm"
        interactive
        onClick={handleViewProfile}
        style={{ cursor: "pointer", overflow: "hidden" }}
      >
        <div
          style={{
            position: "relative",
            height: 120,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={friend.cover}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to bottom, rgba(10, 10, 10, 0.05) 0%, ${tokens.color.surface} 92%)`,
            }}
          />
          {friend.isOnline && (
            <div
              style={{
                position: "absolute",
                top: tokens.space[3],
                right: tokens.space[3],
              }}
            >
              <Pill tone="success" size="sm" dot>
                Online
              </Pill>
            </div>
          )}
        </div>

        <div
          style={{
            padding: `0 ${tokens.space[6]} ${tokens.space[5]}`,
            marginTop: -16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space[3],
              marginBottom: tokens.space[3],
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar
                src={friend.avatar}
                name={friend.name}
                size="lg"
                style={{
                  border: `3px solid ${tokens.color.surface}`,
                  boxShadow: tokens.shadow.sm,
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <H3>{friend.name}</H3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: tokens.color.textMuted,
                }}
              >
                <MapPin size={11} strokeWidth={1.75} />
                <BodySm tone="muted">{friend.note}</BodySm>
              </div>
            </div>
            {friend.match !== undefined && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  flexShrink: 0,
                }}
              >
                <MatchGauge pct={friend.match} />
                <Caption tone="muted" style={{ whiteSpace: "nowrap" }}>
                  Taste match
                </Caption>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: tokens.space[3],
              flexWrap: "wrap",
            }}
          >
            <Pill
              tone="neutral"
              size="md"
              leftIcon={<Utensils size={13} strokeWidth={1.75} />}
            >
              {statusLabel(friend.status)}
            </Pill>

            <div
              style={{
                display: "flex",
                gap: tokens.space[2],
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {variant === "friend" && (
                <>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label="Message"
                    icon={<MessageCircle size={16} strokeWidth={1.75} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(onMessage);
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={busy}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(onInvite);
                    }}
                  >
                    {busy ? "Sending…" : "Invite to tour"}
                  </Button>
                  <MoreMenu
                    onViewProfile={handleViewProfile}
                    onUnfriend={() => handleAction(onUnfriend)}
                  />
                </>
              )}
              {variant === "discover" && (
                <>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label="Message"
                    icon={<MessageCircle size={16} strokeWidth={1.75} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(onMessage);
                    }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={busy}
                    leftIcon={
                      busy ? (
                        <Clock size={14} strokeWidth={1.75} />
                      ) : (
                        <UserPlus size={14} strokeWidth={1.75} />
                      )
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(onInvite);
                    }}
                  >
                    {busy ? "Adding…" : "Add friend"}
                  </Button>
                </>
              )}
              {variant === "sent" && (
                <>
                  <Pill
                    tone="warm"
                    size="md"
                    leftIcon={<Clock size={13} strokeWidth={1.75} />}
                  >
                    Pending
                  </Pill>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(onCancel);
                    }}
                    style={{ color: tokens.color.danger }}
                  >
                    {busy ? "Canceling…" : "Cancel"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
