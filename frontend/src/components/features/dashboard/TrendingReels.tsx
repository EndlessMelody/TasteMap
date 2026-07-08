"use client";

/**
 * TrendingReels — Discover v4 (orchestrator)
 * ─────────────────────────────────────────────────────────────────
 * Composes Fold 3 — TRENDING:
 *
 *   ┌─ TRENDING · Trending Reels ─────── [View all →] ─┐
 *   │  What's hot in your city this week                │
 *   │  ───────────────────────────────────────────────  │
 *   │  [Reel #1][Reel #2][Reel #3][Reel 4][Reel 5] →   │
 *   └───────────────────────────────────────────────────┘
 *
 * Horizontal scroll feels native to vertical-video content. Top-3 reels
 * get a flame rank badge; remainder are plain cards.
 */
import React from "react";
import { useRouter } from "next/navigation";
import { Flame, ArrowUpRight, AlertTriangle } from "lucide-react";

import { DiscoverSection, GlassCard } from "@/components/primitives";
import { Column, Row, Text } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";
import { useReels } from "@/hooks/useReels";
import type { ReelData } from "@/types/dashboard";
import { useLanguage } from "@/context/LanguageContext";

import { ReelCardV2 } from "./social";

// ─── Props ───────────────────────────────────────────────────────
interface TrendingReelsProps {
  onReelClick: (reel: ReelData) => void;
  isLoading?: boolean;
}

// ─── View all button ─────────────────────────────────────────────
const ViewAllButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { t } = useLanguage();
  return (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: tokens.space[2],
      paddingTop: 6,
      paddingBottom: 6,
      paddingLeft: tokens.space[3],
      paddingRight: tokens.space[3],
      borderRadius: tokens.radius.pill,
      backgroundColor: tokens.color.surfaceMuted,
      border: `1px solid ${tokens.color.border}`,
      color: tokens.color.warm,
      fontSize: tokens.type.size.caption,
      fontWeight: tokens.type.weight.bold,
      letterSpacing: tokens.type.tracking.wide,
      textTransform: "uppercase",
      cursor: "pointer",
      transition: "background-color 150ms var(--dsc-ease-out)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = tokens.color.surfaceInset;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = tokens.color.surfaceMuted;
    }}
  >
    {t("discover.viewAll")}
    <ArrowUpRight size={12} strokeWidth={2.6} />
  </button>
  );
};

// ─── Skeletons ───────────────────────────────────────────────────
const ReelSkeleton: React.FC = () => (
  <Column
    style={{
      flexShrink: 0,
      width: 180,
      minWidth: 180,
      height: 260,
      borderRadius: tokens.radius.xl,
      backgroundImage:
        "linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.07) 50%, rgba(0,0,0,0.04) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s ease-in-out infinite",
    }}
  />
);

// ─── Error + empty cards (inline, full width of section body) ────
const InlineNotice: React.FC<{
  icon: React.ReactNode;
  title: string;
  message: string;
  tone?: "danger" | "muted";
}> = ({ icon, title, message, tone = "muted" }) => {
  const accent =
    tone === "danger" ? tokens.color.danger : tokens.color.textMuted;
  return (
    <GlassCard
      variant="flat"
      padding="lg"
      radius="lg"
      fillWidth
      style={{
        display: "flex",
        alignItems: "center",
        gap: tokens.space[4],
      }}
    >
      <Column
        style={{
          width: 40,
          height: 40,
          borderRadius: tokens.radius.md,
          backgroundColor: `${accent}14`,
          border: `1px solid ${accent}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: accent,
        }}
      >
        {icon}
      </Column>
      <Column flex="1" minWidth="0">
        <Text
          as="span"
          variant="body-default-s"
          style={{
            display: "block",
            fontSize: tokens.type.size.bodySm,
            fontWeight: tokens.type.weight.bold,
            color: tokens.color.text,
            marginBottom: 2,
          }}
        >
          {title}
        </Text>
        <Text
          as="span"
          variant="body-default-s"
          style={{
            display: "block",
            fontSize: tokens.type.size.caption,
            color: tokens.color.textMuted,
          }}
        >
          {message}
        </Text>
      </Column>
    </GlassCard>
  );
};

// ─── Main component ──────────────────────────────────────────────
export const TrendingReels: React.FC<TrendingReelsProps> = ({
  onReelClick,
}) => {
  const router = useRouter();
  const { reels, loading, error } = useReels(10);
  const { t } = useLanguage();

  const subtitle = loading
    ? t("discover.reelsLoading")
    : error
      ? t("discover.reelsErrorSub")
      : reels.length > 0
        ? t("discover.reelsHotCity", { n: reels.length })
        : t("discover.reelsEmptySub");

  return (
    <DiscoverSection
      eyebrow={t("discover.trending")}
      title={t("discover.tasteReels")}
      subtitle={subtitle}
      icon={<Flame size={18} />}
      accent={tokens.color.danger}
      action={<ViewAllButton onClick={() => router.push("/foodies")} />}
    >
      {loading ? (
        <Row className="no-scrollbar" gap="12" overflowX="auto" paddingBottom="4">
          {[0, 1, 2, 3, 4].map((i) => (
            <ReelSkeleton key={i} />
          ))}
        </Row>
      ) : error ? (
        <InlineNotice
          icon={<AlertTriangle size={18} strokeWidth={2.2} />}
          title={t("discover.couldntLoadReels")}
          message={error}
          tone="danger"
        />
      ) : reels.length === 0 ? (
        <InlineNotice
          icon={<Flame size={18} strokeWidth={2.2} />}
          title={t("discover.noTrendingReels")}
          message={t("discover.reelsCheckBack")}
        />
      ) : (
        <Row className="no-scrollbar" gap="12" overflowX="auto" paddingBottom="4">
          {reels.map((reel, i) => (
            <ReelCardV2
              key={reel.id}
              reel={reel}
              rank={i + 1}
              index={i}
              onClick={onReelClick}
            />
          ))}
        </Row>
      )}
    </DiscoverSection>
  );
};
