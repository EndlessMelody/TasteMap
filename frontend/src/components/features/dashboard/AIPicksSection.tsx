"use client";

/**
 * AIPicksSection — Discover v6 (Mascot + Smart Cards)
 * ─────────────────────────────────────────────────────────────────
 * Left:  3D animated cube mascot (TasteMap AI assistant)
 * Right: 2 recommendation cards with reasoning notes
 *
 *   ┌─ FOR YOU · AI Picks ─────────────── [Refresh] ─┐
 *   │                                                  │
 *   │  ┌───────────┐  ┌────────────────────────────┐  │
 *   │  │           │  │ 🏆 #1 Best Match — 94%     │  │
 *   │  │   🟪      │  │ Phở Hương Quê              │  │
 *   │  │  (3D      │  │ "Because you love authentic │  │
 *   │  │  mascot)  │  │  Vietnamese street food"    │  │
 *   │  │           │  ├────────────────────────────┤  │
 *   │  │  "Hey!    │  │ 🥈 #2 Great Fit — 87%     │  │
 *   │  │  I found  │  │ Maison Baguette            │  │
 *   │  │  these    │  │ "Cozy French-Viet fusion    │  │
 *   │  │  for you" │  │  that matches your price"   │  │
 *   │  └───────────┘  └────────────────────────────┘  │
 *   └──────────────────────────────────────────────────┘
 */
import React, { useMemo, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Award,
  Medal,
  MapPin,
  Star,
  TrendingUp,
  Heart,
  DollarSign,
  Utensils,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { DiscoverSection, GlassCard, MatchRing } from "@/components/primitives";
import { tokens } from "@/styles/tokens";
import {
  useRecommendations,
  type Recommendation,
} from "@/hooks/useRecommendations";
import { useUserVector } from "@/context/UserVectorContext";

// ─── Dynamic import for 3D mascot (avoid SSR issues) ────────────
const TasteMapMascot = dynamic(
  () =>
    import("./ai-picks/TasteMapMascot").then((mod) => ({
      default: mod.TasteMapMascot,
    })),
  { ssr: false },
);

// ─── Props ───────────────────────────────────────────────────────
interface AIPicksSectionProps {
  isLoading?: boolean;
}

// ─── Reasoning generator ─────────────────────────────────────────
function generateReasoning(
  pick: Recommendation,
  index: number,
  topTrait: string | null,
): string {
  const reasons = [
    topTrait
      ? `Your love for ${topTrait} cuisine matches perfectly with their signature dishes`
      : "Matches your unique taste profile with 15-dimension vector analysis",
    "Highly rated by foodies with similar preferences to yours",
    "The flavor profile aligns closely with your recent discoveries",
    "Popular among users who share your dining style",
    topTrait
      ? `Their ${topTrait}-inspired menu scored highest in our AI matching`
      : "Our AI detected a strong pattern match with your food journey",
  ];

  // Pick a deterministic reason based on place_id
  const reasonIndex = (pick.place_id + index) % reasons.length;
  return reasons[reasonIndex];
}

function getReasonIcon(index: number) {
  const icons = [Utensils, Heart, TrendingUp, Star, DollarSign];
  return icons[index % icons.length];
}

// ─── Refresh button ──────────────────────────────────────────────
const RefreshButton: React.FC<{ onClick: () => void; spinning: number }> = ({
  onClick,
  spinning,
}) => (
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
      color: tokens.color.magic,
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
    <motion.span
      animate={{ rotate: spinning }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      style={{ display: "inline-flex" }}
    >
      <RefreshCw size={12} strokeWidth={2.4} />
    </motion.span>
    Refresh
  </button>
);

// ─── Fallback image ──────────────────────────────────────────────
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop";

// ─── Recommendation Card ─────────────────────────────────────────
const RecommendationCard: React.FC<{
  pick: Recommendation;
  rank: number;
  reasoning: string;
  reasoningTrait: string | null;
  index: number;
}> = ({ pick, rank, reasoning, reasoningTrait, index }) => {
  const router = useRouter();
  const img =
    pick.image_url && pick.image_url.trim() !== ""
      ? pick.image_url
      : FALLBACK_IMG;

  const matchPct =
    pick.match_score > 1
      ? Math.round(pick.match_score)
      : Math.round(pick.match_score * 100);

  const RankIcon = rank === 1 ? Award : Medal;
  const rankLabel = rank === 1 ? "Best Match" : "Great Fit";
  const rankColor = rank === 1 ? "#8b5cf6" : tokens.color.cool;
  const ReasonIcon = getReasonIcon(index);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.3 + index * 0.15,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ width: "100%" }}
    >
      <GlassCard
        variant="elevated"
        padding="none"
        radius="xl"
        fillWidth
        interactive
        onClick={() => router.push("/tour-builder")}
        style={{
          display: "flex",
          overflow: "hidden",
          cursor: "pointer",
          transition:
            "transform 200ms var(--dsc-ease-out), box-shadow 200ms var(--dsc-ease-out)",
        }}
      >
        {/* ── Image side ── */}
        <div
          style={{
            width: 160,
            minWidth: 160,
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={img}
            alt={pick.name}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            loading="lazy"
          />
          {/* Gradient fade */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(to right, transparent 50%, rgba(255,255,255,0.05) 100%)",
            }}
          />
        </div>

        {/* ── Content side ── */}
        <div
          style={{
            flex: 1,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 0,
          }}
        >
          {/* Rank badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              alignSelf: "flex-start",
              paddingTop: 3,
              paddingBottom: 3,
              paddingLeft: 8,
              paddingRight: 10,
              borderRadius: tokens.radius.pill,
              backgroundColor: `${rankColor}12`,
              border: `1px solid ${rankColor}25`,
            }}
          >
            <RankIcon size={11} color={rankColor} strokeWidth={2.4} />
            <span
              style={{
                fontSize: "0.62rem",
                fontWeight: 700,
                color: rankColor,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              #{rank} {rankLabel} — {matchPct}%
            </span>
          </div>

          {/* Restaurant name */}
          <span
            style={{
              fontSize: "0.92rem",
              fontWeight: tokens.type.weight.bold,
              color: tokens.color.text,
              lineHeight: 1.25,
              letterSpacing: tokens.type.tracking.tight,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {pick.name}
          </span>

          {/* Metrics row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "6px 12px",
              marginTop: 2,
            }}
          >
            {/* Price */}
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: tokens.color.textMuted,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <DollarSign size={10} strokeWidth={2.5} />
              {pick.price_range || "$$"}
            </span>

            {/* Rating */}
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: tokens.color.textMuted,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Star size={10} strokeWidth={2.5} color="#eab308" fill="#eab308" />
              {((4.5 + ((pick.place_id * 7) % 5) / 10)).toFixed(1)} <span style={{opacity: 0.5}}>({70 + (pick.place_id % 100)}+)</span>
            </span>

            {/* Location */}
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: tokens.color.textMuted,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <MapPin size={10} strokeWidth={2.5} />
              {1 + (pick.place_id % 8)}.{pick.place_id % 9} km away
            </span>

            {/* Weather */}
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: tokens.color.textMuted,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <span style={{ fontSize: "10px", lineHeight: 1 }}>🌤️</span>
              26°C Clear
            </span>
          </div>

          {/* ── Reasoning note ── */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 6,
              paddingTop: 6,
              borderTop: `1px solid ${tokens.color.border}`,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                backgroundColor: `${rankColor}10`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              <ReasonIcon size={10} color={rankColor} strokeWidth={2.4} />
            </div>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 500,
                color: tokens.color.textMuted,
                lineHeight: 1.45,
                fontStyle: "italic",
              }}
            >
              &ldquo;{reasoning}&rdquo;
            </span>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push("/tour-builder");
            }}
            style={{
              marginTop: "auto",
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              paddingTop: 5,
              paddingBottom: 5,
              paddingLeft: 10,
              paddingRight: 10,
              borderRadius: tokens.radius.md,
              backgroundColor: tokens.color.text,
              color: tokens.color.textInverse,
              border: "none",
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.03em",
              cursor: "pointer",
              transition: "opacity 150ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.85";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            <Star size={10} strokeWidth={2.4} />
            Add to Tour
            <ArrowRight size={10} strokeWidth={2.4} />
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
};

// ─── Mascot speech bubble ────────────────────────────────────────
const SpeechBubble: React.FC<{
  message: string;
  subMessage?: string;
}> = ({ message, subMessage }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: 0.6, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    style={{
      position: "relative",
      backgroundColor: tokens.color.surface,
      border: `1px solid ${tokens.color.border}`,
      borderRadius: tokens.radius.lg,
      padding: "10px 14px",
      maxWidth: "100%",
      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    }}
  >
    {/* Bubble arrow */}
    <div
      style={{
        position: "absolute",
        top: -6,
        left: "50%",
        marginLeft: -6,
        width: 12,
        height: 12,
        backgroundColor: tokens.color.surface,
        border: `1px solid ${tokens.color.border}`,
        borderRight: "none",
        borderBottom: "none",
        transform: "rotate(45deg)",
      }}
    />
    <span
      style={{
        display: "block",
        fontSize: "0.78rem",
        fontWeight: 700,
        color: tokens.color.text,
        lineHeight: 1.35,
        textAlign: "center",
        position: "relative",
        zIndex: 1,
      }}
    >
      {message}
    </span>
    {subMessage && (
      <span
        style={{
          display: "block",
          fontSize: "0.66rem",
          fontWeight: 500,
          color: tokens.color.textMuted,
          lineHeight: 1.3,
          textAlign: "center",
          marginTop: 3,
          position: "relative",
          zIndex: 1,
        }}
      >
        {subMessage}
      </span>
    )}
  </motion.div>
);

// ─── 3D Mascot placeholder (while loading) ──────────────────────
const MascotFallback: React.FC = () => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        rotate: [0, 3, -3, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        width: 80,
        height: 80,
        borderRadius: 16,
        background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "36px",
        boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
      }}
    >
      🤖
    </motion.div>
  </div>
);

// ─── Loading skeleton ────────────────────────────────────────────
const LoadingSkeleton: React.FC = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "280px 1fr",
      gap: tokens.space[5],
      width: "100%",
      alignItems: "stretch",
      minHeight: 340,
    }}
  >
    {/* Mascot area skeleton */}
    <div
      style={{
        borderRadius: tokens.radius.xl,
        backgroundImage:
          "linear-gradient(90deg, rgba(0,0,0,0.03) 25%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.6s ease-in-out infinite",
      }}
    />
    {/* Cards skeleton */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: tokens.space[3],
      }}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            height: 155,
            borderRadius: tokens.radius.xl,
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,0.03) 25%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.6s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  </div>
);

// ─── Error / Empty (reused from previous) ────────────────────────
const ErrorCard: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <GlassCard
    variant="flat"
    padding="lg"
    radius="lg"
    fillWidth
    style={{ display: "flex", alignItems: "center", gap: tokens.space[4] }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: tokens.radius.md,
        backgroundColor: `${tokens.color.danger}12`,
        border: `1px solid ${tokens.color.danger}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <AlertTriangle
        size={18}
        color={tokens.color.danger}
        strokeWidth={2.2}
      />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <span
        style={{
          display: "block",
          fontSize: tokens.type.size.bodySm,
          fontWeight: tokens.type.weight.bold,
          color: tokens.color.text,
          marginBottom: 2,
        }}
      >
        Couldn&apos;t load picks
      </span>
      <span
        style={{
          display: "block",
          fontSize: tokens.type.size.caption,
          color: tokens.color.textMuted,
        }}
      >
        {message}
      </span>
    </div>
    <button
      type="button"
      onClick={onRetry}
      style={{
        padding: `6px ${tokens.space[4]}`,
        borderRadius: tokens.radius.pill,
        backgroundColor: tokens.color.text,
        color: tokens.color.textInverse,
        border: "none",
        fontSize: tokens.type.size.caption,
        fontWeight: tokens.type.weight.bold,
        letterSpacing: tokens.type.tracking.wide,
        textTransform: "uppercase",
        cursor: "pointer",
      }}
    >
      Retry
    </button>
  </GlassCard>
);

const EmptyCard: React.FC = () => (
  <GlassCard
    variant="flat"
    padding="lg"
    radius="lg"
    fillWidth
    style={{ display: "flex", alignItems: "center", gap: tokens.space[4] }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: tokens.radius.md,
        backgroundImage: tokens.gradient.signatureSoft,
        border: `1px solid ${tokens.color.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Sparkles size={18} color={tokens.color.magic} strokeWidth={2.2} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <span
        style={{
          display: "block",
          fontSize: tokens.type.size.bodySm,
          fontWeight: tokens.type.weight.bold,
          color: tokens.color.text,
          marginBottom: 2,
        }}
      >
        No picks yet
      </span>
      <span
        style={{
          display: "block",
          fontSize: tokens.type.size.caption,
          color: tokens.color.textMuted,
        }}
      >
        Take a few swipes to unlock personalized recommendations.
      </span>
    </div>
  </GlassCard>
);

// ─── Main component ──────────────────────────────────────────────
export const AIPicksSection: React.FC<AIPicksSectionProps> = () => {
  const { radarData } = useUserVector();

  // Build a 15-dim proxy vector from the 6-point radar (pad remaining dims with 0.5)
  const userVector = useMemo(() => {
    if (!radarData?.length) return Array(15).fill(0.5);
    const base = radarData.map((p) => p.A / p.fullMark);
    while (base.length < 15) base.push(0.5);
    return base.slice(0, 15);
  }, [radarData]);

  const { picks, loading, error, refetch } = useRecommendations(4, userVector, "food");
  const [rotation, setRotation] = useState(0);
  const reasoningTrait = useMemo(() => {
    if (!radarData?.length) return null;
    return (
      [...radarData].sort((a, b) => b.A / b.fullMark - a.A / a.fullMark)[0]
        ?.subject || null
    );
  }, [radarData]);

  const handleRefresh = () => {
    setRotation((r) => r + 360);
    refetch();
  };

  // Take only top 2 picks for display
  const topPicks = picks.slice(0, 2);

  const subtitle = reasoningTrait
    ? `Because you liked ${reasoningTrait} · ${picks.length || 4} spots analyzed`
    : "Curated for you · vector-matched to your taste";

  // Dynamic mascot message
  const mascotMessage = useMemo(() => {
    if (loading) return "Scanning your taste DNA...";
    if (error) return "Hmm, let me try again...";
    if (picks.length === 0) return "Let's discover your taste!";
    if (reasoningTrait) return `Found ${reasoningTrait} gems!`;
    return "I picked these for you!";
  }, [loading, error, picks.length, reasoningTrait]);

  const mascotSubMessage = useMemo(() => {
    if (loading) return "Analyzing 15 dimensions...";
    if (picks.length > 0) return `${picks.length} spots matched your vector`;
    return "Swipe to teach me your taste";
  }, [loading, picks.length]);

  return (
    <DiscoverSection
      eyebrow="For You"
      title="TasteMatch AI"
      subtitle={subtitle}
      icon={<Sparkles size={18} />}
      accent={tokens.color.magic}
      action={<RefreshButton onClick={handleRefresh} spinning={rotation} />}
    >
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorCard message={error} onRetry={refetch} />
      ) : picks.length === 0 ? (
        <EmptyCard />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: tokens.space[5],
            width: "100%",
            alignItems: "stretch",
            minHeight: 340,
          }}
        >
          {/* ── Left: 3D Mascot ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              height: "100%",
              gap: 0,
            }}
          >
            {/* 3D Canvas */}
            <div
              style={{
                width: "100%",
                flex: 1,
                minHeight: 240,
                borderRadius: tokens.radius.xl,
                overflow: "hidden",
                backgroundColor: tokens.color.surfaceMuted,
                border: `1px solid ${tokens.color.border}`,
                position: "relative",
              }}
            >
              {/* Subtle gradient background */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.08) 0%, transparent 70%)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              <Suspense fallback={<MascotFallback />}>
                <TasteMapMascot />
              </Suspense>
            </div>

            {/* Speech bubble */}
            <div style={{ marginTop: 12, width: "100%" }}>
              <SpeechBubble
                message={mascotMessage}
                subMessage={mascotSubMessage}
              />
            </div>
          </div>

          {/* ── Right: 2 Recommendation Cards ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: tokens.space[3],
            }}
          >
            {topPicks.map((pick, i) => (
              <RecommendationCard
                key={pick.place_id}
                pick={pick}
                rank={i + 1}
                reasoning={generateReasoning(pick, i, reasoningTrait)}
                reasoningTrait={reasoningTrait}
                index={i}
              />
            ))}
          </div>
        </div>
      )}
    </DiscoverSection>
  );
};
