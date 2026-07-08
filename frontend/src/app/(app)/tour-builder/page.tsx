"use client";

/**
 * Tour Builder — thin orchestrator over three phases:
 *   curate    → CurationCanvas (hybrid: saved quick-add + swipe assist)
 *   optimizing→ OptimizingScene (vector-aware route optimiser running)
 *   journey   → JourneyView (cinematic vertical "Your Flavor Journey")
 *
 * Build sequence (docs/flows/discovery_swipe.md §4.1):
 *   flush swipes → POST /tours → Promise.all add stops → POST optimize
 *   → GET /tours/{id} (authoritative) → render journey.
 */
import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiGet, apiPost } from "@/lib/api";
import { useUserVector } from "@/context/UserVectorContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTourBuilderStore, OptimizeResult } from "@/store/useTourBuilderStore";
import { CurationCanvas, SwipeAssistDrawer, OptimizingScene, JourneyView } from "./components";
import { bestStart, timeContextNow } from "./lib";
import type { TourDetail } from "./lib";

type Phase = "curate" | "optimizing" | "journey";

export default function TourBuilderPage() {
  const router = useRouter();
  const { flushSwipeQueue } = useUserVector();
  const { t } = useLanguage();
  const { tourDraft, metadata, setOptimizeResult, resetTour } = useTourBuilderStore();

  const [phase, setPhase] = useState<Phase>("curate");
  const [assistOpen, setAssistOpen] = useState(false);
  const [tour, setTour] = useState<TourDetail | null>(null);

  const handleBuild = useCallback(async () => {
    if (tourDraft.length === 0) {
      toast.warning(t("tour.addOnePlace"));
      return;
    }
    setAssistOpen(false);
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
      const start = bestStart(tourDraft);
      const optimized = await apiPost<OptimizeResult>(`/api/v1/tours/${created.id}/optimize`, {
        start_lat: start.lat,
        start_lng: start.lng,
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
      />
    );
  }

  return (
    <>
      <CurationCanvas onOpenAssist={() => setAssistOpen(true)} onBuild={handleBuild} />
      <SwipeAssistDrawer open={assistOpen} onClose={() => setAssistOpen(false)} />
      <AnimatePresence>{phase === "optimizing" && <OptimizingScene />}</AnimatePresence>
    </>
  );
}
