"use client";

/**
 * CurationCanvas — the tour-building canvas.
 * Primary: a full-page, centered swipe deck (AI picks) — flip a card to see
 * its full details. Secondary: a "Saved" mode for quick-adding Taste Vault
 * bookmarks. The tour draft (pinned stops) lives in an on-demand slide-over
 * panel so the swipe deck stays centered instead of sharing the screen with
 * a permanently-docked rail.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Column, Row, Grid, IconButton } from "@once-ui-system/core";
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { ChevronLeft, Sparkles, Wand2, Bookmark, MapPinned, X, SkipForward, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button, H2, H3, Body, BodySm, Caption, Eyebrow, Skeleton, EmptyState } from "@/components/ui";
import { GlassCard } from "@/components/primitives/GlassCard";
import { SegmentedControl } from "@/components/modals/create-post/SegmentedControl";
import ClientOnly from "@/components/common/ClientOnly";
import { tokens } from "@/styles/tokens";
import { fadeUp, stagger } from "@/lib/motion";
import { apiGet } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useTourBuilderStore } from "@/store/useTourBuilderStore";
import { useFeedCards } from "@/hooks/useFeedCards";
import { useUserVector } from "@/context/UserVectorContext";
import { SavedPlaceCard } from "./SavedPlaceCard";
import { DraftStopRow } from "./DraftStopRow";
import { AssistSwipeCard } from "./AssistSwipeCard";
import { savedToTourNode, feedCardToTourNode, accentFor, DEFAULT_CENTER } from "../lib";
import type { SavedPlace } from "../lib";
import type { Spot } from "@/app/(app)/explore/types";

const MapWidget = dynamic(() => import("@/components/MapWidget"), { ssr: false });

interface BookmarkRecord {
  id: number;
  location?: {
    id: number;
    name: string;
    lat?: number | null;
    lng?: number | null;
    image_url?: string | null;
    rating?: number | null;
    category?: string | null;
    price_range?: string | null;
  } | null;
}

type CurateMode = "swipe" | "saved";
const FALLBACK_TAGS = ["Street Food", "Spicy", "Group"];

interface CurationCanvasProps {
  onBuild: () => void;
}

export function CurationCanvas({ onBuild }: CurationCanvasProps) {
  const { t } = useLanguage();
  const { tourDraft, addToTourDraft, removeFromTourDraft } = useTourBuilderStore();
  const { updateVector } = useUserVector();

  const [mode, setMode] = useState<CurateMode>("swipe");
  const [draftOpen, setDraftOpen] = useState(false);

  const draftIds = useMemo(() => new Set(tourDraft.map((n) => n.venue_id)), [tourDraft]);

  // ─── Saved (Taste Vault) data ────────────────────────────────────────────
  const [saved, setSaved] = useState<SavedPlace[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await apiGet<{ items: BookmarkRecord[] }>("/api/v1/bookmarks?limit=50");
        if (!alive) return;
        const places = (res.items ?? [])
          .filter((b) => b.location)
          .map((b) => ({
            id: b.location!.id,
            name: b.location!.name,
            lat: b.location!.lat ?? null,
            lng: b.location!.lng ?? null,
            image_url: b.location!.image_url ?? null,
            rating: b.location!.rating ?? null,
            category: b.location!.category ?? null,
            price_range: b.location!.price_range ?? null,
          }));
        setSaved(places);
      } catch {
        if (alive) toast.error(t("tour.couldntLoadSaved"));
      } finally {
        if (alive) setSavedLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSaved = (place: SavedPlace, index: number) => {
    if (draftIds.has(place.id)) removeFromTourDraft(place.id);
    else addToTourDraft(savedToTourNode(place, index));
  };

  // ─── Swipe deck ───────────────────────────────────────────────────────────
  const { cards, loading: cardsLoading, refetch } = useFeedCards({ type: "food", limit: 10 });
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const x = useMotionValue(0);
  const skipOpacity = useTransform(x, [-140, 0], [1, 0]);
  const addOpacity = useTransform(x, [0, 140], [0, 1]);

  const nodes = useMemo(() => cards.map((c, i) => feedCardToTourNode(c, i)), [cards]);
  const active = nodes[idx] ?? null;
  const next = nodes[idx + 1] ?? null;

  // Refetch a fresh batch once the deck is exhausted.
  useEffect(() => {
    if (!cardsLoading && nodes.length > 0 && idx >= nodes.length) {
      refetch();
      setIdx(0);
    }
  }, [idx, nodes.length, cardsLoading, refetch]);

  const advance = () => {
    x.set(0);
    setFlipped(false);
    setIdx((i) => i + 1);
  };

  const handleSkip = () => {
    if (!active) return;
    updateVector(active.venue_id, active.tags.length ? active.tags : FALLBACK_TAGS, "skip");
    advance();
  };

  const handleAdd = () => {
    if (!active) return;
    updateVector(active.venue_id, active.tags.length ? active.tags : FALLBACK_TAGS, "select");
    if (!draftIds.has(active.venue_id)) {
      addToTourDraft(active);
      toast.success(t("tour.addedToTour", { title: active.title }));
    } else {
      toast.info(t("tour.alreadyInTour", { title: active.title }));
    }
    advance();
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const TH = 130;
    if (info.offset.x > TH || info.velocity.x > 500) handleAdd();
    else if (info.offset.x < -TH || info.velocity.x < -500) handleSkip();
  };

  // ─── Draft rail data (for the slide-over panel) ──────────────────────────
  const draftWithCoords = useMemo(
    () => tourDraft.filter((n) => n.location[0] !== 0 || n.location[1] !== 0),
    [tourDraft],
  );
  const draftSpots: Spot[] = useMemo(
    () =>
      draftWithCoords.map((n) => ({
        id: n.venue_id,
        name: n.title,
        category: "place",
        emoji: "📍",
        accent: accentFor(n.venue_id),
        lat: n.location[0],
        lon: n.location[1],
        rating: n.rating ?? 5,
        reviewCount: 0,
        priceLevel: 2,
        isOpen: true,
        closesAt: "",
        distance: "",
        img: n.img ?? "",
        description: n.subtitle ?? "",
        tags: n.tags ?? [],
      })),
    [draftWithCoords],
  );
  const draftRouteCoords: [number, number][] = useMemo(
    () => draftWithCoords.map((n) => [n.location[1], n.location[0]]),
    [draftWithCoords],
  );
  const draftCenter: [number, number] = draftWithCoords[0]
    ? [draftWithCoords[0].location[0], draftWithCoords[0].location[1]]
    : DEFAULT_CENTER;
  const draftIndexMap = useMemo(
    () => new Map(draftWithCoords.map((n, i) => [n.venue_id, i + 1])),
    [draftWithCoords],
  );

  return (
    <Column fillWidth fillHeight style={{ background: tokens.color.bg, overflow: "hidden" }}>
      {/* Sticky header */}
      <Row
        fillWidth
        vertical="center"
        horizontal="between"
        style={{
          paddingTop: tokens.space[4],
          paddingRight: tokens.space[8],
          paddingBottom: tokens.space[4],
          paddingLeft: tokens.space[8],
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: `1px solid ${tokens.color.border}`,
          position: "sticky",
          top: 0,
          zIndex: tokens.z.sticky,
          flexShrink: 0,
          gap: tokens.space[4],
        }}
      >
        <Link href="/discover" style={{ textDecoration: "none" }}>
          <Button variant="ghost" size="md" leftIcon={<ChevronLeft size={16} />}>
            {t("nav.discover")}
          </Button>
        </Link>

        <SegmentedControl
          options={[
            { value: "swipe" as const, label: t("tour.swipeMode"), icon: Wand2 },
            { value: "saved" as const, label: t("tour.savedMode"), icon: Bookmark },
          ]}
          value={mode}
          onChange={setMode}
        />

        <Button
          variant={tourDraft.length > 0 ? "primary" : "secondary"}
          size="md"
          leftIcon={<Sparkles size={15} />}
          onClick={() => setDraftOpen(true)}
        >
          {t("tour.pinned", { n: tourDraft.length })}
        </Button>
      </Row>

      {/* Body */}
      {mode === "swipe" ? (
        <Column
          horizontal="center"
          vertical="center"
          style={{
            flex: 1,
            position: "relative",
            paddingTop: tokens.space[8],
            paddingRight: tokens.space[8],
            paddingBottom: tokens.space[8],
            paddingLeft: tokens.space[8],
            minHeight: 0,
            gap: tokens.space[6],
          }}
        >
          <Column style={{ width: "min(420px, 92vw)", height: "min(600px, 68vh)", position: "relative" }}>
            {cardsLoading && nodes.length === 0 ? (
              <Skeleton width="100%" height="100%" radius="lg" />
            ) : active ? (
              <>
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
                  <AssistSwipeCard node={active} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
                </motion.div>
              </>
            ) : (
              <Column horizontal="center" vertical="center" fillHeight style={{ gap: 8, textAlign: "center" }}>
                <Sparkles size={28} color={tokens.color.magic} />
                <Caption tone="muted">{t("tour.fetchingPicks")}</Caption>
              </Column>
            )}
          </Column>

          {/* Controls */}
          <Row horizontal="center" vertical="center" style={{ gap: tokens.space[3] }}>
            <Button variant="secondary" size="md" leftIcon={<SkipForward size={15} />} onClick={handleSkip} disabled={!active}>
              {t("tour.skip")}
            </Button>
            <Button variant="primary" size="md" leftIcon={<Plus size={15} />} onClick={handleAdd} disabled={!active}>
              {t("tour.addToTour")}
            </Button>
          </Row>
        </Column>
      ) : (
        <Column
          className="no-scrollbar"
          style={{
            flex: 1,
            overflowY: "auto",
            paddingTop: tokens.space[8],
            paddingRight: tokens.space[8],
            paddingBottom: tokens.space[8],
            paddingLeft: tokens.space[8],
            minWidth: 0,
          }}
        >
          <Column style={{ gap: 4, marginBottom: tokens.space[6] }}>
            <Eyebrow style={{ color: tokens.color.warm }}>{t("tour.curate")}</Eyebrow>
            <H2 style={{ fontSize: tokens.type.size.h2 }}>{t("tour.buildJourney")}</H2>
            <Body tone="muted">{t("tour.curateBody")}</Body>
          </Column>

          {savedLoading ? (
            <Grid columns={3} gap="16" s={{ columns: 2 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={180} radius="lg" />
              ))}
            </Grid>
          ) : saved.length === 0 ? (
            <GlassCard variant="flat" padding="lg" radius="xl" fillWidth>
              <EmptyState
                icon={<Bookmark size={30} strokeWidth={1.5} />}
                title={t("tour.vaultEmpty")}
                description={t("tour.vaultEmptyDesc")}
                action={
                  <Button variant="primary" size="md" leftIcon={<Wand2 size={15} />} onClick={() => setMode("swipe")}>
                    {t("tour.swipeToDiscover")}
                  </Button>
                }
              />
            </GlassCard>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show">
              <Grid columns={3} gap="16" s={{ columns: 2 }}>
                {saved.map((place, i) => (
                  <motion.div key={place.id} variants={fadeUp}>
                    <SavedPlaceCard place={place} added={draftIds.has(place.id)} onToggle={() => toggleSaved(place, i)} />
                  </motion.div>
                ))}
              </Grid>
            </motion.div>
          )}

          <Row horizontal="center" style={{ marginTop: tokens.space[8] }}>
            <Button variant="secondary" size="md" leftIcon={<Wand2 size={15} />} onClick={() => setMode("swipe")}>
              {t("tour.swipeToDiscoverMore")}
            </Button>
          </Row>
        </Column>
      )}

      {/* Draft panel (slide-over) */}
      <AnimatePresence>
        {draftOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDraftOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: tokens.z.overlay,
                background: "rgba(10,6,4,0.4)",
                backdropFilter: "blur(2px)",
              }}
            />
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
                width: "min(400px, 92vw)",
                zIndex: tokens.z.modal,
                background: tokens.color.bg,
                borderLeft: `1px solid ${tokens.color.border}`,
                boxShadow: tokens.shadow.lg,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Row
                vertical="center"
                horizontal="between"
                style={{
                  paddingTop: tokens.space[4],
                  paddingRight: tokens.space[5],
                  paddingBottom: tokens.space[4],
                  paddingLeft: tokens.space[5],
                  borderBottom: `1px solid ${tokens.color.border}`,
                  flexShrink: 0,
                }}
              >
                <Row vertical="center" style={{ gap: 8 }}>
                  <H3>{tourDraft.length === 1 ? t("tour.stopSingular", { n: tourDraft.length }) : t("tour.stopPlural", { n: tourDraft.length })}</H3>
                </Row>
                <IconButton variant="ghost" tooltip={t("common.close")} onClick={() => setDraftOpen(false)}>
                  <X size={18} />
                </IconButton>
              </Row>

              {draftSpots.length > 0 && (
                <Column
                  style={{
                    paddingTop: tokens.space[3],
                    paddingRight: tokens.space[5],
                    paddingBottom: 0,
                    paddingLeft: tokens.space[5],
                  }}
                >
                  <GlassCard variant="flat" padding="none" radius="lg" fillWidth>
                    <Column style={{ height: 140, width: "100%" }}>
                      <ClientOnly>
                        <MapWidget
                          mapId="tour-draft-preview-map"
                          spots={draftSpots}
                          center={draftCenter}
                          zoom={12}
                          routeCoords={draftRouteCoords.length >= 2 ? draftRouteCoords : undefined}
                          planSpotIndexMap={draftIndexMap}
                          showBanner={false}
                        />
                      </ClientOnly>
                    </Column>
                  </GlassCard>
                </Column>
              )}

              <Column
                className="no-scrollbar"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  paddingTop: tokens.space[5],
                  paddingRight: tokens.space[5],
                  paddingBottom: tokens.space[5],
                  paddingLeft: tokens.space[5],
                  gap: tokens.space[2],
                }}
              >
                {tourDraft.length === 0 ? (
                  <Column
                    horizontal="center"
                    vertical="center"
                    fillHeight
                    style={{
                      gap: 8,
                      textAlign: "center",
                      paddingTop: tokens.space[6],
                      paddingRight: tokens.space[6],
                      paddingBottom: tokens.space[6],
                      paddingLeft: tokens.space[6],
                    }}
                  >
                    <MapPinned size={28} color={tokens.color.textSubtle} />
                    <BodySm style={{ fontWeight: tokens.type.weight.semibold }}>{t("tour.noStops")}</BodySm>
                    <Caption tone="muted">{t("tour.noStopsHint")}</Caption>
                  </Column>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {tourDraft.map((node, i) => (
                      <DraftStopRow key={node.id} node={node} index={i} onRemove={() => removeFromTourDraft(node.venue_id)} />
                    ))}
                  </AnimatePresence>
                )}
              </Column>

              <Column
                style={{
                  paddingTop: tokens.space[5],
                  paddingRight: tokens.space[5],
                  paddingBottom: tokens.space[5],
                  paddingLeft: tokens.space[5],
                  borderTop: `1px solid ${tokens.color.border}`,
                  gap: tokens.space[2],
                }}
              >
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  leftIcon={<Sparkles size={16} />}
                  disabled={tourDraft.length === 0}
                  onClick={onBuild}
                >
                  {t("tour.buildMyTour")}
                </Button>
                <Caption tone="muted" align="center">
                  {t("tour.optimiseCaption")}
                </Caption>
              </Column>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Column>
  );
}
