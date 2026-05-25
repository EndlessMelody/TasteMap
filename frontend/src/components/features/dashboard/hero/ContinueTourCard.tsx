"use client";

/**
 * ContinueTourCard — Discover v2
 * ─────────────────────────────────────────────────────────────────
 * A compact "resume where you left off" card that lives in the hero
 * sidebar beneath the TasteSignatureCard.
 *
 * Behavior:
 *   - If a `tour` prop is provided → shows resume state (progress + CTA).
 *   - Otherwise → shows evergreen variant ("Ready for your next adventure?").
 *
 * Future: wire to a real `useTours()` hook when the backend exposes
 * in-progress tour state. For now, the evergreen variant is always
 * accurate and never shows stale data.
 */
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Compass } from "lucide-react";

import { GlassCard } from "@/components/primitives";
import { tokens } from "@/styles/tokens";

// ─── Optional resume-state type ──────────────────────────────────
export interface ResumeTour {
  id: string | number;
  name: string;
  progressPct: number; // 0-100
  nextStop?: string;
}

export interface ContinueTourCardProps {
  /** If present, render the "resume" state; otherwise evergreen */
  tour?: ResumeTour;
}

// ─── Main component ──────────────────────────────────────────────
export const ContinueTourCard: React.FC<ContinueTourCardProps> = ({
  tour,
}) => {
  const router = useRouter();
  const hasTour = !!tour;

  const handleClick = () => {
    if (hasTour) {
      router.push(`/tour-builder?resume=${tour!.id}`);
    } else {
      router.push("/tour-builder");
    }
  };

  return (
    <GlassCard
      variant="elevated"
      padding="md"
      radius="lg"
      interactive
      fillWidth
      onClick={handleClick}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: tokens.space[3],
        height: "100%",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: tokens.space[3],
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: tokens.radius.md,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${tokens.color.warm}12`,
            border: `1px solid ${tokens.color.warm}22`,
            flexShrink: 0,
          }}
        >
          <Compass size={18} color={tokens.color.warm} strokeWidth={2.2} />
        </div>
        <span
          style={{
            fontSize: tokens.type.size.caption,
            fontWeight: tokens.type.weight.bold,
            letterSpacing: tokens.type.tracking.wide,
            textTransform: "uppercase",
            color: tokens.color.textSubtle,
          }}
        >
          {hasTour ? "Continue" : "Next up"}
        </span>
      </div>

      {/* ── Body ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: tokens.space[2],
          flex: 1,
        }}
      >
        <span
          style={{
            fontSize: tokens.type.size.h3,
            fontWeight: tokens.type.weight.bold,
            color: tokens.color.text,
            letterSpacing: tokens.type.tracking.tight,
            lineHeight: 1.25,
          }}
        >
          {hasTour ? tour!.name : "Ready for your next adventure?"}
        </span>
        {hasTour ? (
          <span
            style={{
              fontSize: tokens.type.size.bodySm,
              fontWeight: tokens.type.weight.medium,
              color: tokens.color.textMuted,
              lineHeight: 1.4,
            }}
          >
            {tour!.nextStop
              ? `Next: ${tour!.nextStop}`
              : `${Math.round(tour!.progressPct)}% complete`}
          </span>
        ) : (
          <span
            style={{
              fontSize: tokens.type.size.bodySm,
              fontWeight: tokens.type.weight.medium,
              color: tokens.color.textMuted,
              lineHeight: 1.4,
            }}
          >
            Build a personalized food tour in minutes.
          </span>
        )}
      </div>

      {/* ── Footer: progress bar or CTA row ── */}
      {hasTour ? (
        <div
          style={{
            width: "100%",
            height: 4,
            borderRadius: tokens.radius.pill,
            backgroundColor: tokens.color.surfaceInset,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.max(2, Math.min(100, tour!.progressPct))}%`,
              height: "100%",
              backgroundImage: tokens.gradient.signature,
              borderRadius: tokens.radius.pill,
              transition: "width 400ms var(--dsc-ease-out)",
            }}
          />
        </div>
      ) : (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: tokens.space[2],
            color: tokens.color.warm,
            fontSize: tokens.type.size.bodySm,
            fontWeight: tokens.type.weight.bold,
            letterSpacing: tokens.type.tracking.normal,
          }}
        >
          <span>Start building</span>
          <ArrowRight size={14} strokeWidth={2.4} />
        </div>
      )}
    </GlassCard>
  );
};
