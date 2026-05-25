/**
 * Hero — Discover v2.5
 * ─────────────────────────────────────────────────────────────────
 * Currently active in the orchestrator:
 *   - HeroTour            (left, 2fr)
 *   - TasteSignatureCard  (sidebar top)
 *   - NearbyNowCard       (sidebar bottom, map utility)
 *
 * Available but not currently rendered (held for future phases):
 *   - ContinueTourCard  — revive when `useTours()` exposes in-progress tours
 *   - QuickActionDock   — revive for mobile layout where sidebar collapses
 */
export { HeroTour } from "./HeroTour";
export { TasteSignatureCard } from "./TasteSignatureCard";
export { NearbyNowCard } from "./NearbyNowCard";

// Kept for future use — not currently imported by HeroSection.
export { ContinueTourCard } from "./ContinueTourCard";
export type { ResumeTour, ContinueTourCardProps } from "./ContinueTourCard";
export { QuickActionDock } from "./QuickActionDock";
