"use client";

/**
 * SwipeAssistDrawer — optional right-side drawer to top up the tour by swiping
 * AI suggestions. Left = skip (vector −α·P), Right/Add = add to tour (vector +α·P).
 * Self-contained: feed cards + taste-vector learning + draft mutation.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Column, Row, IconButton } from "@once-ui-system/core";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { X, Plus, SkipForward, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button, H3, Caption, Skeleton } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { useFeedCards } from "@/hooks/useFeedCards";
import { useUserVector } from "@/context/UserVectorContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTourBuilderStore } from "@/store/useTourBuilderStore";
import { feedCardToTourNode } from "../lib";
import { AssistSwipeCard } from "./AssistSwipeCard";

const FALLBACK_TAGS = ["Street Food", "Spicy", "Group"];

interface SwipeAssistDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SwipeAssistDrawer({ open, onClose }: SwipeAssistDrawerProps) {
  const { cards, loading, refetch } = useFeedCards({ type: "food", limit: 10 });
  const { updateVector } = useUserVector();
  const { t } = useLanguage();
  const { addToTourDraft, tourDraft } = useTourBuilderStore();

  const [idx, setIdx] = useState(0);
  const x = useMotionValue(0);
  const skipOpacity = useTransform(x, [-140, 0], [1, 0]);
  const addOpacity = useTransform(x, [0, 140], [0, 1]);

  const nodes = useMemo(() => cards.map((c, i) => feedCardToTourNode(c, i)), [cards]);
  const active = nodes[idx] ?? null;
  const next = nodes[idx + 1] ?? null;
  const draftIds = useMemo(() => new Set(tourDraft.map((n) => n.venue_id)), [tourDraft]);

  // Refetch a fresh batch once the deck is exhausted.
  useEffect(() => {
    if (!loading && nodes.length > 0 && idx >= nodes.length) {
      refetch();
      setIdx(0);
    }
  }, [idx, nodes.length, loading, refetch]);

  const advance = useCallback(() => {
    x.set(0);
    setIdx((i) => i + 1);
  }, [x]);

  const handleSkip = useCallback(() => {
    if (!active) return;
    updateVector(active.venue_id, active.tags.length ? active.tags : FALLBACK_TAGS, "skip");
    advance();
  }, [active, updateVector, advance]);

  const handleAdd = useCallback(() => {
    if (!active) return;
    updateVector(active.venue_id, active.tags.length ? active.tags : FALLBACK_TAGS, "select");
    if (!draftIds.has(active.venue_id)) {
      addToTourDraft(active);
      toast.success(t("tour.addedToTour", { title: active.title }));
    } else {
      toast.info(t("tour.alreadyInTour", { title: active.title }));
    }
    advance();
  }, [active, updateVector, addToTourDraft, draftIds, advance, t]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const TH = 130;
      if (info.offset.x > TH || info.velocity.x > 500) handleAdd();
      else if (info.offset.x < -TH || info.velocity.x < -500) handleSkip();
    },
    [handleAdd, handleSkip],
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: tokens.z.overlay,
              background: "rgba(10,6,4,0.4)",
              backdropFilter: "blur(2px)",
            }}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(440px, 92vw)",
              zIndex: tokens.z.modal,
              background: tokens.color.bg,
              borderLeft: `1px solid ${tokens.color.border}`,
              boxShadow: tokens.shadow.lg,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <Row
              vertical="center"
              horizontal="between"
              style={{
                padding: `${tokens.space[4]} ${tokens.space[5]}`,
                borderBottom: `1px solid ${tokens.color.border}`,
                flexShrink: 0,
              }}
            >
              <Row vertical="center" style={{ gap: 8 }}>
                <Sparkles size={16} color={tokens.color.magic} />
                <H3>{t("tour.swipeToDiscover")}</H3>
              </Row>
              <IconButton variant="ghost" tooltip={t("common.close")} onClick={onClose}>
                <X size={18} />
              </IconButton>
            </Row>

            {/* Deck */}
            <Column style={{ flex: 1, position: "relative", padding: tokens.space[5], minHeight: 0 }}>
              {loading && nodes.length === 0 ? (
                <Skeleton width="100%" height="100%" radius="lg" />
              ) : active ? (
                <Column style={{ position: "relative", width: "100%", height: "100%" }}>
                  {/* Next card peeking behind */}
                  {next && (
                    <Column
                      style={{
                        position: "absolute",
                        inset: 0,
                        transform: "scale(0.95) translateY(-12px)",
                        opacity: 0.4,
                      }}
                    >
                      <AssistSwipeCard node={next} />
                    </Column>
                  )}

                  {/* Drag overlays */}
                  <motion.div
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 2,
                      borderRadius: tokens.radius.xl,
                      pointerEvents: "none",
                      opacity: skipOpacity,
                      background: `radial-gradient(circle at 18% 50%, ${tokens.color.danger}55, transparent 60%)`,
                    }}
                  />
                  <motion.div
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 2,
                      borderRadius: tokens.radius.xl,
                      pointerEvents: "none",
                      opacity: addOpacity,
                      background: `radial-gradient(circle at 82% 50%, ${tokens.color.success}55, transparent 60%)`,
                    }}
                  />

                  {/* Active draggable card */}
                  <motion.div
                    key={active.id}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.7}
                    onDragEnd={handleDragEnd}
                    style={{ x, position: "absolute", inset: 0, zIndex: 3, cursor: "grab" }}
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <AssistSwipeCard node={active} />
                  </motion.div>
                </Column>
              ) : (
                <Column horizontal="center" vertical="center" fillHeight style={{ gap: 8, textAlign: "center" }}>
                  <Sparkles size={28} color={tokens.color.magic} />
                  <Caption tone="muted">{t("tour.fetchingPicks")}</Caption>
                </Column>
              )}
            </Column>

            {/* Controls */}
            <Row
              horizontal="center"
              vertical="center"
              style={{
                gap: tokens.space[3],
                padding: tokens.space[4],
                borderTop: `1px solid ${tokens.color.border}`,
                flexShrink: 0,
              }}
            >
              <Button variant="secondary" size="md" leftIcon={<SkipForward size={15} />} onClick={handleSkip} disabled={!active}>
                {t("tour.skip")}
              </Button>
              <Button variant="primary" size="md" leftIcon={<Plus size={15} />} onClick={handleAdd} disabled={!active}>
                {t("tour.addToTour")}
              </Button>
            </Row>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
