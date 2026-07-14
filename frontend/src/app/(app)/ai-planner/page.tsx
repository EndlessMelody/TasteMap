"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Column } from "@once-ui-system/core";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

import { generatePlan, tourToItineraryStops } from "./lib/generatePlan";
import type { PlannerAlternate } from "./lib/generatePlan";
import type { TourDetail } from "@/components/features/tours/lib";
import { PlannerForm } from "./components/PlannerForm";
import { StepGenerating } from "./components/steps/StepGenerating";
import { StepResult } from "./components/steps/StepResult";

type View = "form" | "generating" | "result";

const MIN_GENERATING_MS = 2800;

export default function AIPlanner() {
  const [view, setView] = useState<View>("form");
  const [tour, setTour] = useState<TourDetail | null>(null);
  const [alternates, setAlternates] = useState<PlannerAlternate[]>([]);

  const [mood, setMood] = useState<string | null>(null);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [group, setGroup] = useState<string | null>(null);
  const [duration, setDuration] = useState("4 hours");
  const [budget, setBudget] = useState("100–300k");
  const [location, setLocation] = useState("District 1");

  const { user } = useAuth();
  const { t } = useLanguage();
  const username = user?.display_name ?? user?.username ?? "Foodie";

  const toggleCuisine = (c: string) =>
    setCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const handleGenerate = useCallback(async () => {
    setView("generating");
    const started = Date.now();
    try {
      const [result] = await Promise.all([
        generatePlan({ mood, cuisines, group, duration, budget, location }),
        new Promise((r) => setTimeout(r, MIN_GENERATING_MS)),
      ]);
      setTour(result.tour);
      setAlternates(result.alternates ?? []);
      setView("result");
    } catch {
      const elapsed = Date.now() - started;
      if (elapsed < MIN_GENERATING_MS) await new Promise((r) => setTimeout(r, MIN_GENERATING_MS - elapsed));
      toast.error(t("aiPlanner.generateFailed"));
      setView("form");
    }
  }, [mood, cuisines, group, duration, budget, location, t]);

  return (
    <Column
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <AnimatePresence mode="wait">
        {view === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.99 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <PlannerForm
              username={username}
              mood={mood}
              setMood={setMood}
              cuisines={cuisines}
              toggleCuisine={toggleCuisine}
              group={group}
              setGroup={setGroup}
              duration={duration}
              setDuration={setDuration}
              budget={budget}
              setBudget={setBudget}
              location={location}
              setLocation={setLocation}
              onGenerate={handleGenerate}
            />
          </motion.div>
        )}

        {view === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <StepGenerating />
          </motion.div>
        )}

        {view === "result" && tour && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <StepResult
              tour={tour}
              alternates={alternates}
              stops={tourToItineraryStops(tour, "walking")}
              onRegen={handleGenerate}
              onBack={() => setView("form")}
              onTourUpdate={setTour}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Column>
  );
}
