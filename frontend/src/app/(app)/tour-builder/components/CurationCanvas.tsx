"use client";

/**
 * CurationCanvas — the hybrid tour-building canvas.
 * Left: quick-add places from the user's Taste Vault (saved bookmarks).
 * Right: the live "Your tour" draft rail + Build CTA.
 * Plus a swipe-assist entry point to top up the route with AI picks.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Column, Row, Grid } from "@once-ui-system/core";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Sparkles, Wand2, Bookmark, MapPinned } from "lucide-react";
import { toast } from "sonner";
import { Button, H2, H3, Body, BodySm, Caption, Eyebrow, Skeleton, EmptyState } from "@/components/ui";
import { GlassCard } from "@/components/primitives/GlassCard";
import ClientOnly from "@/components/common/ClientOnly";
import { tokens } from "@/styles/tokens";
import { fadeUp, stagger } from "@/lib/motion";
import { apiGet } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useTourBuilderStore } from "@/store/useTourBuilderStore";
import { SavedPlaceCard } from "./SavedPlaceCard";
import { DraftStopRow } from "./DraftStopRow";
import { savedToTourNode, accentFor, DEFAULT_CENTER } from "../lib";
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

interface CurationCanvasProps {
  onOpenAssist: () => void;
  onBuild: () => void;
}

export function CurationCanvas({ onOpenAssist, onBuild }: CurationCanvasProps) {
  const { t } = useLanguage();
  const { tourDraft, addToTourDraft, removeFromTourDraft } = useTourBuilderStore();

  const [saved, setSaved] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(true);

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
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const draftIds = useMemo(() => new Set(tourDraft.map((n) => n.venue_id)), [tourDraft]);

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

  const toggleSaved = (place: SavedPlace, index: number) => {
    if (draftIds.has(place.id)) removeFromTourDraft(place.id);
    else addToTourDraft(savedToTourNode(place, index));
  };

  return (
    <Column fillWidth fillHeight style={{ background: tokens.color.bg, overflow: "hidden" }}>
      {/* Sticky header */}
      <Row
        fillWidth
        vertical="center"
        horizontal="between"
        style={{
          padding: `${tokens.space[4]} ${tokens.space[8]}`,
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: `1px solid ${tokens.color.border}`,
          position: "sticky",
          top: 0,
          zIndex: tokens.z.sticky,
          flexShrink: 0,
        }}
      >
        <Link href="/discover" style={{ textDecoration: "none" }}>
          <Button variant="ghost" size="md" leftIcon={<ChevronLeft size={16} />}>
            {t("nav.discover")}
          </Button>
        </Link>
        <Row vertical="center" style={{ gap: 8 }}>
          <Sparkles size={16} color={tokens.color.warm} />
          <H2 style={{ fontSize: tokens.type.size.h3 }}>{t("nav.tourBuilder")}</H2>
        </Row>
        <Button variant="magic" size="md" leftIcon={<Wand2 size={15} />} onClick={onOpenAssist}>
          {t("tour.swipeAssist")}
        </Button>
      </Row>

      {/* Body */}
      <Row fillWidth style={{ flex: 1, overflow: "hidden" }} s={{ direction: "column" }}>
        {/* Left: add places */}
        <Column
          className="no-scrollbar"
          style={{ flex: 1, overflowY: "auto", padding: tokens.space[8], minWidth: 0 }}
        >
          <Column style={{ gap: 4, marginBottom: tokens.space[6] }}>
            <Eyebrow style={{ color: tokens.color.warm }}>{t("tour.curate")}</Eyebrow>
            <H2 style={{ fontSize: tokens.type.size.h2 }}>{t("tour.buildJourney")}</H2>
            <Body tone="muted">
              {t("tour.curateBody")}
            </Body>
          </Column>

          {loading ? (
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
                  <Button variant="primary" size="md" leftIcon={<Wand2 size={15} />} onClick={onOpenAssist}>
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
            <Button variant="secondary" size="md" leftIcon={<Wand2 size={15} />} onClick={onOpenAssist}>
              {t("tour.swipeToDiscoverMore")}
            </Button>
          </Row>
        </Column>

        {/* Right: draft rail */}
        <Column
          style={{
            width: 380,
            flexShrink: 0,
            borderLeft: `1px solid ${tokens.color.border}`,
            background: tokens.color.surface,
            overflow: "hidden",
          }}
          s={{ style: { width: "100%" } }}
        >
          <Column style={{ padding: `${tokens.space[5]} ${tokens.space[6]} ${tokens.space[3]}`, borderBottom: `1px solid ${tokens.color.border}` }}>
            <Eyebrow style={{ color: tokens.color.warm }}>{t("tour.yourTour")}</Eyebrow>
            <Row vertical="center" style={{ gap: 8 }}>
              <H3>{tourDraft.length === 1 ? t("tour.stopSingular", { n: tourDraft.length }) : t("tour.stopPlural", { n: tourDraft.length })}</H3>
            </Row>
          </Column>

          {draftSpots.length > 0 && (
            <Column style={{ padding: `${tokens.space[3]} ${tokens.space[5]} 0` }}>
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

          <Column className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: tokens.space[5], gap: tokens.space[2] }}>
            {tourDraft.length === 0 ? (
              <Column horizontal="center" vertical="center" fillHeight style={{ gap: 8, textAlign: "center", padding: tokens.space[6] }}>
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

          <Column style={{ padding: tokens.space[5], borderTop: `1px solid ${tokens.color.border}`, gap: tokens.space[2] }}>
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
        </Column>
      </Row>
    </Column>
  );
}
