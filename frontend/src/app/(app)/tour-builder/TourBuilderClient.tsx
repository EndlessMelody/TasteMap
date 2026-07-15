"use client";

/**
 * Tour Builder — thin orchestrator over three phases:
 *   curate    → CurationCanvas (full-page swipe deck + secondary saved-quick-add mode)
 *   optimizing→ OptimizingScene (vector-aware route optimiser running)
 *   journey   → JourneyView (cinematic vertical "Your Flavor Journey")
 *
 * Build sequence (docs/flows/discovery_swipe.md §4.1):
 *   flush swipes → POST /tours → Promise.all add stops → POST optimize
 *   → GET /tours/{id} (authoritative) → render journey.
 */
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { apiGet, apiPost } from "@/lib/api";
import { useUserVector } from "@/context/UserVectorContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTourBuilderStore, OptimizeResult } from "@/store/useTourBuilderStore";
import { CurationCanvas, OptimizingScene, JourneyView } from "./components";
import { bestStart, timeContextNow } from "./lib";
import type { TourDetail } from "./lib";

type Phase = "curate" | "optimizing" | "journey";

export default function TourBuilderClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { flushSwipeQueue } = useUserVector();
  const { t } = useLanguage();
  const { tourDraft, metadata, setOptimizeResult, resetTour } = useTourBuilderStore();

  const [phase, setPhase] = useState<Phase>("curate");
  const [tour, setTour] = useState<TourDetail | null>(null);

  // Reopen an existing tour (e.g. from the Discovery "Latest Tour" card or My Tours).
  useEffect(() => {
    const tourId = searchParams.get("tour");
    if (!tourId) return;
    let cancelled = false;
    apiGet<TourDetail>(`/api/v1/tours/${tourId}`)
      .then((detail) => {
        if (cancelled) return;
        setTour(detail);
        setPhase("journey");
      })
      .catch(() => {
        if (!cancelled) toast.error(t("tour.couldntLoadTour"));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleBuild = useCallback(async () => {
    if (tourDraft.length === 0) {
      toast.warning(t("tour.addOnePlace"));
      return;
    }
    setPhase("optimizing");

    try {
      // 1. Flush any pending swipe learning before saving.
      await flushSwipeQueue();

      // 2. Create the tour shell.
      const created = await apiPost<{ id: number }>("/api/v1/tours/", {});

      // 3. Add all stops concurrently (avoid an N×round-trip waterfall).
      await Promise.all(
        tourDraft.map((stop) => apiPost(`/api/v1/tours/${created.id}/stops`, { location_id: stop.venue_id })),
      );

      // 4. Vector-aware optimise (personalised by taste + weather/time context).
      // No real coords in the draft (e.g. saved-vault-only tour) → omit start_lat/lng
      // and let the backend default to the first added stop.
      const start = bestStart(tourDraft);
      const optimized = await apiPost<OptimizeResult>(`/api/v1/tours/${created.id}/optimize`, {
        start_lat: start?.lat ?? null,
        start_lng: start?.lng ?? null,
        category: "food",
        time_context: timeContextNow(),
        transport_mode: metadata.transport_mode,
      });
      setOptimizeResult(optimized);

      // 5. Re-fetch authoritative detail (coords + persisted metrics) for the journey.
      const detail = await apiGet<TourDetail>(`/api/v1/tours/${created.id}`);
      setTour(detail);
      setPhase("journey");
    } catch (error: unknown) {
      setPhase("curate");
      const message = error instanceof Error ? error.message : t("tour.unknownError");
      toast.error(t("tour.buildFailed", { msg: message }));
    }
  }, [tourDraft, metadata.transport_mode, flushSwipeQueue, setOptimizeResult, t]);

  const handleStartOver = useCallback(() => {
    resetTour();
    setTour(null);
    setPhase("curate");
  }, [resetTour]);

  const handleStartTour = useCallback(() => {
    if (!tour) return;
    const ids = tour.stops.map((s) => s.location?.id).filter(Boolean).join(",");
    router.push(`/explore?spots=${ids}`);
  }, [tour, router]);

  if (phase === "journey" && tour) {
    return (
      <JourneyView
        tour={tour}
        transportMode={metadata.transport_mode}
        onStartOver={handleStartOver}
        onStartTour={handleStartTour}
        onTourUpdate={setTour}
      />
    );
  }

  return (
    <>
      <CurationCanvas onBuild={handleBuild} />
      <AnimatePresence>{phase === "optimizing" && <OptimizingScene />}</AnimatePresence>
    </>
  );
}
