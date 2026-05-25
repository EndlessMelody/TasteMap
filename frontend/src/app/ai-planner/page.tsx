"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

import { MOCK_ITINERARIES } from "./components/constants";
import type { ItineraryStop } from "./components/types";
import { generateItinerary } from "./lib/generateItinerary";
import { PlannerForm } from "./components/PlannerForm";
import { StepGenerating } from "./components/steps/StepGenerating";
import { StepResult } from "./components/steps/StepResult";

type View = "form" | "generating" | "result";

export default function AIPlanner() {
  const [view, setView] = useState<View>("form");
  const [itinerary, setItinerary] = useState<ItineraryStop[]>(MOCK_ITINERARIES.default);

  const [mood, setMood] = useState<string | null>(null);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [group, setGroup] = useState<string | null>(null);
  const [duration, setDuration] = useState("4 hours");
  const [budget, setBudget] = useState("100–300k");
  const [location, setLocation] = useState("District 1");

  const { user } = useAuth();
  const username = user?.display_name ?? user?.username ?? "Foodie";

  const toggleCuisine = (c: string) =>
    setCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const handleGenerate = useCallback(async () => {
    setView("generating");
    try {
      const stops = await generateItinerary({ mood, cuisines, duration, budget });
      if (stops.length > 0) setItinerary(stops);
    } catch {
      // API failed — keep current itinerary (mock data as fallback)
    }
  }, [mood, cuisines, duration, budget]);

  const handleDone = useCallback(() => setView("result"), []);
  const handleRegen = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  return (
    <div
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
            <StepGenerating onDone={handleDone} />
          </motion.div>
        )}

        {view === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <StepResult
              stops={itinerary}
              onRegen={handleRegen}
              onBack={() => setView("form")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
