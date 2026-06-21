"use client";

/**
 * HeroSection — Discover v2.5 (orchestrator)
 * ─────────────────────────────────────────────────────────────────
 * Composes Fold 1 — YOU TODAY:
 *
 *   ┌─ HeroTour (2fr) ────────────────┐ ┌─ Sidebar (1fr) ─────────┐
 *   │                                  │ │ TasteSignatureCard      │
 *   │   Cinematic featured-tour card  │ ├──────────────────────────┤
 *   │                                  │ │ NearbyNowCard (map)     │
 *   └──────────────────────────────────┘ └──────────────────────────┘
 *
 * Changes vs. v2:
 *   - Removed QuickActionDock (redundant with sidebar nav).
 *   - Replaced ContinueTourCard with NearbyNowCard (map utility).
 *   - Both sidebar cards share height evenly via flex:1 (fixes v2 bug
 *     where TasteSignatureCard was squashed by sibling's height:100%).
 *   - Reduced HeroTour minHeight 360→300 for tighter vertical rhythm.
 */
import React from "react";
import { motion } from "framer-motion";
import { Column, Grid } from "@once-ui-system/core";

import { HeroTour, TasteSignatureCard, NearbyNowCard } from "./hero";

export const HeroSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    >
      <Grid
        fillWidth
        gap="20"
        style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(300px, 1fr)", alignItems: "stretch" }}
      >
        <HeroTour />

        {/* Sidebar: two equal-height cards stacked */}
        <Column fillWidth minHeight="0" gap="16">
          <TasteSignatureCard />
          <NearbyNowCard />
        </Column>
      </Grid>
    </motion.div>
  );
};
