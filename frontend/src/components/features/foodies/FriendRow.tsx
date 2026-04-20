"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Row,
  Column,
  Heading,
  Text,
  Avatar,
  IconButton,
  Button,
} from "@/components/OnceUI";
import { motion } from "framer-motion";

// ── Premium Icons (lucide-react) ──
import {
  MessageCircle,
  Clock,
  MapPin,
  MoreHorizontal,
  Eye,
  UserMinus,
  UserPlus,
  Coffee,
  Fish,
  Soup,
  Pizza,
  Flame,
  Sandwich,
} from "lucide-react";

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
}

// ─── More dropdown menu (friend variant) ───
const menuItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 16px",
  background: "none",
  border: "none",
  width: "100%",
  textAlign: "left",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  color: "var(--dsc-text)",
  transition: "background 0.12s",
};

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

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <IconButton
        icon={<MoreHorizontal size={16} strokeWidth={2.25} />}
        onClick={() => setOpen((o) => !o)}
        variant="tertiary"
        style={{
          width: 36,
          height: 36,
          backgroundColor: "var(--dsc-surface-muted)",
          color: "var(--dsc-text-subtle)",
          borderRadius: 10,
        }}
      />
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            backgroundColor: "var(--dsc-surface)",
            borderRadius: 14,
            boxShadow: "var(--dsc-shadow-lg)",
            border: "1px solid var(--dsc-border)",
            overflow: "hidden",
            zIndex: 100,
            minWidth: 170,
          }}
        >
          <button
            onClick={() => {
              onViewProfile();
              setOpen(false);
            }}
            style={menuItemStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--dsc-surface-muted)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <Eye size={15} strokeWidth={2.25} />
            View Profile
          </button>
          <div style={{ height: 1, backgroundColor: "var(--dsc-border)" }} />
          <button
            onClick={() => {
              onUnfriend();
              setOpen(false);
            }}
            style={{ ...menuItemStyle, color: "#e63946" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(230,57,70,0.06)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <UserMinus size={15} strokeWidth={2.25} />
            Unfriend
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── SVG circular match gauge ───
function MatchGauge({ pct }: { pct: number }) {
  const size = 56;
  const strokeW = 4;
  const r = (size - strokeW * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const color =
    pct >= 85 ? "#34c759" : pct >= 70 ? "#D97706" : "var(--dsc-text-subtle)";
  const glowColor = pct >= 85 ? "rgba(52,199,89,0.25)" : "transparent";

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        filter: pct >= 85 ? `drop-shadow(0 0 8px ${glowColor})` : "none",
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--dsc-border)"
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
          gap: 0,
        }}
      >
        <span
          style={{ fontSize: "12px", fontWeight: 800, color, lineHeight: 1 }}
        >
          {pct}
        </span>
        <span
          style={{
            fontSize: "9px",
            fontWeight: 600,
            color: "var(--dsc-text-subtle)",
            lineHeight: 1,
          }}
        >
          %
        </span>
      </div>
    </div>
  );
}

// ─── Activity chip (emoji → icon mapping) ───
const ACTIVITY_MAP: {
  emoji: string;
  icon: React.ReactElement;
  color: string;
  bg: string;
}[] = [
  {
    emoji: "🍣",
    icon: <Fish size={13} strokeWidth={2.25} />,
    color: "#C2410C",
    bg: "rgba(239,68,68,0.07)",
  },
  {
    emoji: "🍜",
    icon: <Soup size={13} strokeWidth={2.25} />,
    color: "#B45309",
    bg: "rgba(245,158,11,0.08)",
  },
  {
    emoji: "☕",
    icon: <Coffee size={13} strokeWidth={2.25} />,
    color: "#78350F",
    bg: "rgba(180,83,9,0.08)",
  },
  {
    emoji: "🍔",
    icon: <Sandwich size={13} strokeWidth={2.25} />,
    color: "#854D0E",
    bg: "rgba(234,179,8,0.08)",
  },
  {
    emoji: "🌶️",
    icon: <Flame size={13} strokeWidth={2.25} />,
    color: "#B91C1C",
    bg: "rgba(239,68,68,0.07)",
  },
  {
    emoji: "🍕",
    icon: <Pizza size={13} strokeWidth={2.25} />,
    color: "#C2410C",
    bg: "rgba(249,115,22,0.08)",
  },
];

function ActivityChip({ status }: { status: string }) {
  const found = ACTIVITY_MAP.find((a) => status.includes(a.emoji));
  const color = found?.color ?? "var(--dsc-text-muted)";
  const bg = found?.bg ?? "rgba(255,107,53,0.05)";
  const icon = found?.icon ?? <MapPin size={13} strokeWidth={2.25} />;
  const label = status
    .replace(/[\u{1F300}-\u{1FFFF}]|\u{1F32E}|\u{1F336}\uFE0F/gu, "")
    .trim();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 20,
        backgroundColor: bg,
        border: `1px solid ${color}20`,
        maxWidth: "100%",
      }}
    >
      <span style={{ color, display: "flex" }}>{icon}</span>
      <Text
        variant="body-default-xs"
        style={{
          color,
          fontWeight: 600,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </Text>
    </div>
  );
}

// ─── Card entrance animation ───
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

// ─── Main component ───
export const FriendRow: React.FC<FriendRowProps> = ({
  friend,
  variant = "discover",
  onMessage,
  onInvite,
  onUnfriend,
  onCancel,
  isCompact = false,
}) => {
  const router = useRouter();
  const handleViewProfile = () => router.push(`/foodies/${friend.id}`);

  /* ── COMPACT (chat sidebar) ── */
  if (isCompact) {
    return (
      <Row
        vertical="center"
        gap="12"
        onClick={() => onMessage(friend)}
        paddingX="16"
        paddingY="14"
        radius="m"
        className="messenger-list-item"
        style={{
          cursor: "pointer",
          transition: "background-color 0.18s ease",
          backgroundColor: "transparent",
          minHeight: 68,
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Avatar src={friend.avatar} name={friend.name} size="l" />
          {friend.isOnline && (
            <div
              style={{
                position: "absolute",
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "var(--dsc-accent-success)",
                border: "2.5px solid var(--dsc-surface-muted)",
              }}
            />
          )}
        </div>
        <Column flexGrow={1} style={{ overflow: "hidden", gap: 1 }}>
          <Row
            vertical="center"
            style={{ justifyContent: "space-between", gap: 8 }}
          >
            <Text
              style={{
                color: "var(--dsc-text)",
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                letterSpacing: "-0.2px",
              }}
            >
              {friend.name}
            </Text>
            <Text
              variant="body-default-xs"
              style={{ color: "var(--dsc-text-subtle)", flexShrink: 0 }}
            >
              9:41 AM
            </Text>
          </Row>
          <Text
            style={{
              color: "var(--dsc-text-muted)",
              fontSize: 12,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {friend.status
              .replace(/[\u{1F300}-\u{1FFFF}]|\u{1F336}\uFE0F/gu, "")
              .trim()}
          </Text>
        </Column>
        <style jsx>{`
          .messenger-list-item:hover {
            background-color: rgba(255, 107, 53, 0.04) !important;
          }
          .messenger-list-item:active {
            background-color: rgba(255, 107, 53, 0.08) !important;
          }
        `}</style>
      </Row>
    );
  }

  /* ── FULL CARD (expanded) ── */
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Column
        fillWidth
        className="dsc-lift"
        style={{
          backgroundColor: "var(--dsc-surface)",
          borderRadius: 20,
          border: "1px solid var(--dsc-border)",
          boxShadow: "var(--dsc-shadow-sm)",
          overflow: "hidden",
          transition:
            "box-shadow 0.3s var(--dsc-ease-out), transform 0.3s var(--dsc-ease-out)",
        }}
      >
        {/* ── Cover hero image ── */}
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
          {/* Warm bottom fade */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(255,107,53,0.03) 0%, rgba(255,255,255,0.92) 88%, var(--dsc-surface) 100%)",
            }}
          />
          {/* Online badge — glassmorphic */}
          {friend.isOnline && (
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(12px) saturate(180%)",
                WebkitBackdropFilter: "blur(12px) saturate(180%)",
                border: "1px solid rgba(52,199,89,0.25)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: "var(--dsc-accent-success)",
                  boxShadow: "0 0 0 2px rgba(52,199,89,0.25)",
                }}
              />
              <Text
                variant="body-default-xs"
                style={{ color: "#16A34A", fontWeight: 700 }}
              >
                Online
              </Text>
            </div>
          )}
        </div>

        {/* ── Card body ── */}
        <div style={{ padding: "0 24px 20px", marginTop: -16 }}>
          {/* Avatar + name row */}
          <Row vertical="center" gap="14" style={{ marginBottom: 14 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar
                src={friend.avatar}
                name={friend.name}
                size="l"
                style={{
                  border: "3px solid var(--dsc-surface)",
                  display: "block",
                  boxShadow: "0 2px 10px rgba(255,107,53,0.10)",
                }}
              />
            </div>
            <Column style={{ gap: 1, flex: 1, overflow: "hidden" }}>
              <Heading
                variant="heading-strong-s"
                style={{ color: "var(--dsc-text)", letterSpacing: "-0.3px" }}
              >
                {friend.name}
              </Heading>
              <Row vertical="center" gap="4">
                <MapPin
                  size={11}
                  strokeWidth={2.25}
                  color="var(--dsc-text-subtle)"
                />
                <Text
                  variant="body-default-xs"
                  style={{ color: "var(--dsc-text-muted)", fontWeight: 500 }}
                >
                  {friend.note}
                </Text>
              </Row>
            </Column>
            {/* Match gauge — right side */}
            {friend.match !== undefined && (
              <Column style={{ alignItems: "center", gap: 2, flexShrink: 0 }}>
                <MatchGauge pct={friend.match} />
                <Text
                  variant="body-default-xs"
                  style={{
                    color: "var(--dsc-text-subtle)",
                    fontSize: "10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Taste Match
                </Text>
              </Column>
            )}
          </Row>

          {/* Activity chip + actions */}
          <Row
            vertical="center"
            style={{
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <ActivityChip status={friend.status} />

            <Row gap="8" vertical="center" style={{ flexShrink: 0 }}>
              {variant === "friend" && (
                <>
                  <IconButton
                    icon={<MessageCircle size={16} strokeWidth={2.25} />}
                    onClick={() => onMessage(friend)}
                    variant="tertiary"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: "rgba(255,107,53,0.06)",
                      color: "var(--dsc-accent-warm)",
                      borderRadius: 10,
                    }}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => onInvite && onInvite(friend)}
                    style={{
                      borderRadius: 10,
                      fontWeight: 700,
                      padding: "0 16px",
                      height: 36,
                      fontSize: "13px",
                      borderColor: "var(--dsc-border-strong)",
                    }}
                  >
                    Invite to Tour
                  </Button>
                  <MoreMenu
                    onViewProfile={handleViewProfile}
                    onUnfriend={() => onUnfriend && onUnfriend(friend)}
                  />
                </>
              )}
              {variant === "discover" && (
                <>
                  <IconButton
                    icon={<MessageCircle size={16} strokeWidth={2.25} />}
                    onClick={() => onMessage(friend)}
                    variant="tertiary"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: "rgba(255,107,53,0.06)",
                      color: "var(--dsc-accent-warm)",
                      borderRadius: 10,
                    }}
                  />
                  <Button
                    variant="primary"
                    onClick={() => onInvite && onInvite(friend)}
                    style={{
                      borderRadius: 10,
                      fontWeight: 700,
                      padding: "0 16px",
                      height: 36,
                      background: "linear-gradient(135deg, #ff6b35, #e65721)",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      border: "none",
                      boxShadow: "0 2px 8px rgba(255,107,53,0.25)",
                    }}
                  >
                    <UserPlus size={14} strokeWidth={2.5} />
                    Add Friend
                  </Button>
                </>
              )}
              {variant === "sent" && (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      borderRadius: 10,
                      backgroundColor: "rgba(255,107,53,0.05)",
                      border: "1px solid rgba(255,107,53,0.15)",
                      color: "var(--dsc-text-muted)",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <Clock size={13} strokeWidth={2.5} />
                    Pending
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => onCancel && onCancel(friend)}
                    style={{
                      borderRadius: 10,
                      fontWeight: 600,
                      padding: "0 16px",
                      height: 36,
                      fontSize: "13px",
                      color: "#e63946",
                      border: "1.5px solid rgba(230,57,70,0.2)",
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </Row>
          </Row>
        </div>
      </Column>
    </motion.div>
  );
};
