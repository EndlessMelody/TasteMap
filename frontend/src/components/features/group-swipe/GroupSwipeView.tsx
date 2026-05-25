"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  motion,
  PanInfo,
  useAnimation,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { X, Heart, Star, Undo2, Sparkles, Archive, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useGroupSwipe, type GroupCard } from "@/hooks/useGroupSwipe";
import { TourDNABar } from "./TourDNABar";
import { GroupVaultSheet } from "@/components/features/group-swipe/GroupVaultSheet";
import { GroupResultsView } from "@/components/features/group-swipe/GroupResultsView";
import { Card, Button, Pill, H3, Body, BodySm, Caption } from "@/components/ui";
import { tokens } from "@/styles/tokens";

const SWIPE_THRESHOLD = 100;
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1200&fit=crop";

function GroupSwipeCard({
  card,
  active,
  onSwipeRight,
  onSwipeLeft,
}: {
  card: GroupCard;
  active: boolean;
  onSwipeRight: (id: number) => void;
  onSwipeLeft: (id: number) => void;
}) {
  const controls = useAnimation();
  const [exitX, setExitX] = useState(0);
  const dragX = useMotionValue(0);
  const likeOpacity = useTransform(dragX, [0, SWIPE_THRESHOLD], [0, 1]);
  const passOpacity = useTransform(dragX, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const cardRotate = useTransform(dragX, [-300, 300], [-18, 18]);

  const dragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      setExitX(500);
      controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
      onSwipeRight(card.id);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      setExitX(-500);
      controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
      onSwipeLeft(card.id);
    } else {
      controls.start({
        x: 0,
        rotate: 0,
        transition: { duration: 0.28, ease: [0.34, 1.56, 0.64, 1] },
      });
      dragX.set(0);
    }
  };

  const imgUrl =
    card.image_url && card.image_url.trim() !== ""
      ? card.image_url
      : FALLBACK_IMG;

  return (
    <motion.div
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.12}
      onDragEnd={dragEnd}
      animate={controls}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: tokens.radius.xl,
        overflow: "hidden",
        boxShadow: tokens.shadow.lg,
        cursor: active ? "grab" : "auto",
        zIndex: active ? 10 : 0,
        rotate: active ? cardRotate : 0,
        x: dragX,
        touchAction: "none",
        background: tokens.color.text,
      }}
      initial={{ scale: 0.96, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.25 } }}
      whileDrag={{ scale: 1.03, cursor: "grabbing" }}
      onDrag={(_e: unknown, info: PanInfo) => dragX.set(info.offset.x)}
    >
      <img
        src={imgUrl}
        alt={card.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />

      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(52, 199, 89, 0.45) 0%, transparent 60%)",
          opacity: likeOpacity,
          pointerEvents: "none",
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(225deg, rgba(230, 57, 70, 0.45) 0%, transparent 60%)",
          opacity: passOpacity,
          pointerEvents: "none",
        }}
      />

      {card.is_starred_by_teammate && (
        <div
          style={{
            position: "absolute",
            top: tokens.space[4],
            left: tokens.space[4],
          }}
        >
          <Pill
            tone="warning"
            size="sm"
            solid
            leftIcon={<Star size={12} fill="currentColor" />}
          >
            Teammate starred this
          </Pill>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: tokens.space[4],
          right: tokens.space[4],
        }}
      >
        <Pill
          tone="neutral"
          size="sm"
          style={{
            background: "rgba(10, 10, 10, 0.55)",
            color: tokens.color.textInverse,
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          {Math.round(card.match_score)}% match
        </Pill>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(10, 10, 10, 0.85) 0%, rgba(10, 10, 10, 0.3) 40%, transparent 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: tokens.space[6],
        }}
      >
        <Body
          style={{
            color: tokens.color.textInverse,
            fontSize: 22,
            fontWeight: tokens.type.weight.bold,
            letterSpacing: tokens.type.tracking.tight,
            marginBottom: 4,
          }}
        >
          {card.name}
        </Body>
        <BodySm
          style={{
            color: "rgba(255, 255, 255, 0.72)",
            fontWeight: tokens.type.weight.medium,
          }}
        >
          {[
            card.price_range,
            card.distance_km != null
              ? `${card.distance_km.toFixed(1)} km`
              : null,
            card.reason,
          ]
            .filter(Boolean)
            .join(" · ") || "TasteMap place"}
        </BodySm>
      </div>
    </motion.div>
  );
}

function CircleActionButton({
  icon,
  label,
  onClick,
  disabled,
  size = "lg",
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
  size?: "md" | "lg";
  tone?: "neutral" | "danger" | "success" | "warning";
}) {
  const dim = size === "lg" ? 56 : 44;
  const toneStyles: Record<
    typeof tone,
    { bg: string; border: string; color: string }
  > = {
    neutral: {
      bg: tokens.color.surfaceMuted,
      border: tokens.color.border,
      color: tokens.color.text,
    },
    danger: {
      bg: "rgba(230, 57, 70, 0.08)",
      border: "rgba(230, 57, 70, 0.35)",
      color: tokens.color.danger,
    },
    success: {
      bg: "rgba(52, 199, 89, 0.08)",
      border: "rgba(52, 199, 89, 0.35)",
      color: tokens.color.success,
    },
    warning: {
      bg: "rgba(251, 191, 36, 0.1)",
      border: "rgba(251, 191, 36, 0.4)",
      color: "#92580d",
    },
  };
  const s = toneStyles[tone];
  return (
    <motion.button
      type="button"
      whileHover={disabled ? {} : { scale: 1.06 }}
      whileTap={disabled ? {} : { scale: 0.92 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: dim,
        height: dim,
        borderRadius: "50%",
        border: `1.5px solid ${s.border}`,
        background: s.bg,
        color: s.color,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        boxShadow: tokens.shadow.sm,
      }}
    >
      {icon}
    </motion.button>
  );
}

interface GroupSwipeViewProps {
  groupId: string;
  isHost: boolean;
  onStatusChange?: (status: string) => void;
}

export function GroupSwipeView({
  groupId,
  isHost,
  onStatusChange,
}: GroupSwipeViewProps) {
  const {
    cards,
    loadingCards,
    swipeRight,
    swipeLeft,
    star,
    undo,
    swiping,
    groupVector,
    vaultCount,
    vault,
    loadingVault,
    fetchVault,
    results,
    finishing,
    finish,
  } = useGroupSwipe({ groupId, enabled: true });

  const [showVault, setShowVault] = useState(false);
  const cardStackRef = useRef<HTMLDivElement>(null);

  const topCard = cards.length > 0 ? cards[0] : null;

  const handleSkip = useCallback(() => {
    if (topCard) swipeLeft(topCard.id);
  }, [topCard, swipeLeft]);

  const handleLike = useCallback(() => {
    if (topCard) swipeRight(topCard.id);
  }, [topCard, swipeRight]);

  const handleStar = useCallback(() => {
    if (topCard) {
      star(topCard.id);
      toast.success("Super liked.");
    }
  }, [topCard, star]);

  const handleUndo = useCallback(() => {
    undo();
    toast("Undone last swipe");
  }, [undo]);

  const handleFinish = useCallback(async () => {
    const res = await finish(5);
    if (res.length > 0) onStatusChange?.("completed");
  }, [finish, onStatusChange]);

  const handleOpenVault = useCallback(() => {
    fetchVault();
    setShowVault(true);
  }, [fetchVault]);

  if (results && results.length > 0) {
    return <GroupResultsView results={results} />;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        background: tokens.color.bg,
      }}
    >
      <div
        style={{
          padding: `${tokens.space[4]} ${tokens.space[5]} ${tokens.space[2]}`,
          flexShrink: 0,
        }}
      >
        <TourDNABar groupVector={groupVector} />
      </div>

      <div
        ref={cardStackRef}
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: `${tokens.space[2]} ${tokens.space[6]}`,
        }}
      >
        {loadingCards && cards.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: tokens.space[3],
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                border: `3px solid ${tokens.color.surfaceInset}`,
                borderTopColor: tokens.color.warm,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <BodySm tone="muted">Loading places…</BodySm>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : cards.length === 0 ? (
          <Card
            radius="xl"
            padding="lg"
            shadow="none"
            surface="muted"
            style={{ maxWidth: 360, textAlign: "center" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: tokens.space[3],
              }}
            >
              <Sparkles
                size={32}
                strokeWidth={1.5}
                style={{ color: tokens.color.warm }}
              />
              <H3>All caught up</H3>
              <BodySm tone="muted">
                You&apos;ve swiped through all recommendations. Wait for new
                cards or ask the host to finish.
              </BodySm>
            </div>
          </Card>
        ) : (
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 360,
              aspectRatio: "3 / 4",
            }}
          >
            <AnimatePresence>
              {cards
                .slice(0, 3)
                .map((card, index) => (
                  <GroupSwipeCard
                    key={card.id}
                    card={card}
                    active={index === 0}
                    onSwipeRight={swipeRight}
                    onSwipeLeft={swipeLeft}
                  />
                ))
                .reverse()}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: tokens.space[3],
          padding: `${tokens.space[3]} 0`,
          flexShrink: 0,
        }}
      >
        <CircleActionButton
          icon={<Undo2 size={18} strokeWidth={1.75} />}
          label="Undo"
          size="md"
          tone="warning"
          onClick={handleUndo}
          disabled={swiping || cards.length === 0}
        />
        <CircleActionButton
          icon={<X size={24} strokeWidth={2} />}
          label="Skip"
          size="lg"
          tone="danger"
          onClick={handleSkip}
          disabled={swiping || cards.length === 0}
        />
        <CircleActionButton
          icon={<Heart size={24} strokeWidth={2} />}
          label="Like"
          size="lg"
          tone="success"
          onClick={handleLike}
          disabled={swiping || cards.length === 0}
        />
        <CircleActionButton
          icon={<Star size={20} strokeWidth={1.75} fill="currentColor" />}
          label="Super like"
          size="md"
          tone="warning"
          onClick={handleStar}
          disabled={swiping || cards.length === 0}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${tokens.space[2]} ${tokens.space[5]} ${tokens.space[4]}`,
          flexShrink: 0,
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Archive size={14} strokeWidth={1.75} />}
          onClick={handleOpenVault}
        >
          Vault ({vaultCount})
        </Button>

        {isHost && (
          <Button
            variant="primary"
            size="sm"
            loading={finishing}
            leftIcon={<Trophy size={14} strokeWidth={1.75} />}
            onClick={handleFinish}
          >
            {finishing ? "Calculating…" : "Finish & reveal"}
          </Button>
        )}
      </div>

      <GroupVaultSheet
        open={showVault}
        onClose={() => setShowVault(false)}
        vault={vault}
        loading={loadingVault}
      />
    </div>
  );
}
