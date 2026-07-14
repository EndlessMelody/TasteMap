"use client";

/**
 * My Tours — list of the user's saved tours, each with a real map preview.
 * Reuses the shared TourMap/tours lib so it stays visually consistent with
 * Tour Builder's Journey View and the Discovery "Latest Tour" card.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Column, Row, Grid } from "@once-ui-system/core";
import { motion } from "framer-motion";
import { ChevronLeft, ListChecks, MapPinned, Pencil, Trash2, ArrowUpRight, Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button, IconButton, H2, H3, Caption, Eyebrow, Skeleton, EmptyState, Pill } from "@/components/ui";
import { GlassCard } from "@/components/primitives/GlassCard";
import { tokens } from "@/styles/tokens";
import { fadeUp, stagger } from "@/lib/motion";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { TourMap, formatDuration, formatVnd } from "@/components/features/tours";
import type { TourDetail, TourSummary } from "@/components/features/tours/lib";

const STATUS_TONE: Record<string, "success" | "warm" | "neutral"> = {
  ready: "success",
  in_progress: "warm",
  completed: "neutral",
  building: "neutral",
};

const STATUS_LABEL_KEY: Record<string, string> = {
  building: "tour.statusBuilding",
  ready: "tour.statusReady",
  in_progress: "tour.statusInProgress",
  completed: "tour.statusCompleted",
};

export default function MyToursPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [tours, setTours] = useState<TourDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await apiGet<{ items: TourSummary[] }>("/api/v1/tours?limit=50");
      const details = await Promise.all(
        (list.items ?? []).map((tour) => apiGet<TourDetail>(`/api/v1/tours/${tour.id}`)),
      );
      setTours(details);
    } catch {
      toast.error(t("tour.couldntLoadSaved"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRename = (tour: TourDetail) => {
    setRenamingId(tour.id);
    setRenameValue(tour.title || "");
  };

  const saveRename = async (tourId: number) => {
    const title = renameValue.trim();
    if (!title) {
      setRenamingId(null);
      return;
    }
    try {
      await apiPatch(`/api/v1/tours/${tourId}`, { title });
      setTours((prev) => prev.map((tr) => (tr.id === tourId ? { ...tr, title } : tr)));
    } catch {
      toast.error(t("tour.renameFailed"));
    } finally {
      setRenamingId(null);
    }
  };

  const handleDelete = async (tourId: number) => {
    if (!window.confirm(`${t("tour.deleteTourConfirmTitle")} ${t("tour.deleteTourConfirmDesc")}`)) return;
    try {
      await apiDelete(`/api/v1/tours/${tourId}`);
      setTours((prev) => prev.filter((tr) => tr.id !== tourId));
    } catch {
      toast.error(t("tour.deleteTourFailed"));
    }
  };

  return (
    <Column fillWidth fillHeight style={{ background: tokens.color.bg, overflow: "hidden" }}>
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
          <ListChecks size={16} color={tokens.color.warm} />
          <H2 style={{ fontSize: tokens.type.size.h3 }}>{t("tour.myToursTitle")}</H2>
        </Row>
        <Button variant="primary" size="md" onClick={() => router.push("/tour-builder")}>
          {t("tour.createTour")}
        </Button>
      </Row>

      <Column className="no-scrollbar" fillWidth style={{ flex: 1, overflowY: "auto", padding: tokens.space[8] }}>
        <Column style={{ gap: 4, marginBottom: tokens.space[6] }}>
          <Eyebrow style={{ color: tokens.color.warm }}>{t("tour.myToursTitle")}</Eyebrow>
          <Caption tone="muted">{t("tour.myToursSubtitle", { n: tours.length })}</Caption>
        </Column>

        {loading ? (
          <Grid columns={3} gap="16" s={{ columns: 1 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={280} radius="lg" />
            ))}
          </Grid>
        ) : tours.length === 0 ? (
          <GlassCard variant="flat" padding="lg" radius="xl" fillWidth>
            <EmptyState
              icon={<MapPinned size={30} strokeWidth={1.5} />}
              title={t("tour.emptyTitle")}
              description={t("tour.noToursDesc")}
              action={
                <Button variant="primary" size="md" onClick={() => router.push("/tour-builder")}>
                  {t("tour.emptyCta")}
                </Button>
              }
            />
          </GlassCard>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show">
            <Grid columns={3} gap="16" s={{ columns: 1 }}>
              {tours.map((tour) => (
                <motion.div key={tour.id} variants={fadeUp}>
                  <GlassCard
                    variant="elevated"
                    padding="none"
                    radius="lg"
                    fillWidth
                    style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
                  >
                    <TourMap stops={tour.stops} mapId={`my-tours-${tour.id}`} height={140} zoom={12} />

                    <Column style={{ padding: tokens.space[4], gap: tokens.space[2] }}>
                      <Row horizontal="between" vertical="center" style={{ gap: 8 }}>
                        {renamingId === tour.id ? (
                          <Row vertical="center" style={{ gap: 4, flex: 1 }}>
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveRename(tour.id);
                                if (e.key === "Escape") setRenamingId(null);
                              }}
                              style={{
                                flex: 1,
                                fontSize: tokens.type.size.bodySm,
                                fontWeight: tokens.type.weight.bold,
                                padding: "4px 8px",
                                borderRadius: tokens.radius.sm,
                                border: `1px solid ${tokens.color.border}`,
                                background: tokens.color.surface,
                                color: tokens.color.text,
                              }}
                            />
                            <IconButton
                              icon={<Check size={14} />}
                              aria-label={t("tour.renameSave")}
                              size="sm"
                              onClick={() => saveRename(tour.id)}
                            />
                            <IconButton
                              icon={<X size={14} />}
                              aria-label={t("tour.cancel")}
                              size="sm"
                              onClick={() => setRenamingId(null)}
                            />
                          </Row>
                        ) : (
                          <>
                            <H3 style={{ fontSize: tokens.type.size.body, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {tour.title || t("tour.untitled", { id: tour.id })}
                            </H3>
                            <Pill tone={STATUS_TONE[tour.status] ?? "neutral"} size="sm">
                              {t(STATUS_LABEL_KEY[tour.status] ?? "tour.statusBuilding")}
                            </Pill>
                          </>
                        )}
                      </Row>

                      <Caption tone="muted">
                        {tour.stops.length === 1
                          ? t("tour.stopSingular", { n: tour.stops.length })
                          : t("tour.stopPlural", { n: tour.stops.length })}
                        {" · "}
                        {formatDuration(tour.estimated_duration)}
                        {" · "}
                        {formatVnd(tour.estimated_cost)}
                      </Caption>

                      <Row style={{ gap: 8, marginTop: tokens.space[2] }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          fullWidth
                          leftIcon={<ArrowUpRight size={14} />}
                          onClick={() => router.push(`/tour-builder?tour=${tour.id}`)}
                        >
                          {t("tour.openTour")}
                        </Button>
                        <IconButton
                          icon={<Pencil size={14} />}
                          aria-label={t("tour.renameTour")}
                          size="sm"
                          onClick={() => startRename(tour)}
                        />
                        <IconButton
                          icon={<Trash2 size={14} color={tokens.color.danger} />}
                          aria-label={t("tour.deleteTour")}
                          size="sm"
                          onClick={() => handleDelete(tour.id)}
                        />
                      </Row>
                    </Column>
                  </GlassCard>
                </motion.div>
              ))}
            </Grid>
          </motion.div>
        )}
      </Column>
    </Column>
  );
}
