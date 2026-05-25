"use client";

/**
 * PulseDot — animated "live" indicator.
 * ─────────────────────────────────────────────────────────────────
 * Used anywhere TasteMap wants to signal real-time activity:
 *   - Active group rooms
 *   - Trending reels ("just went viral")
 *   - Online friends
 *   - Live weather / context updates
 *
 * Renders a small colored dot with an outward-pulsing ring.
 * Color defaults to `danger` (#E63946). Pair with a label for context.
 *
 * Usage:
 *   <PulseDot />
 *   <PulseDot size={8} tone="#34C759" label="Active now" />
 */
import React from "react";
import { tokens } from "@/styles/tokens";

export interface PulseDotProps {
  /** Dot diameter in px (default 8) */
  size?: number;
  /** Color of dot + pulse ring (default danger red) */
  tone?: string;
  /** Optional label rendered inline after the dot */
  label?: string;
  /** Disable animation (for reduced-motion contexts) */
  static?: boolean;
}

export const PulseDot: React.FC<PulseDotProps> = ({
  size = 8,
  tone = tokens.color.danger,
  label,
  static: isStatic = false,
}) => {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: tokens.space[2],
      }}
    >
      <span
        style={{
          position: "relative",
          width: size,
          height: size,
          display: "inline-block",
          flexShrink: 0,
        }}
      >
        {/* Outer pulsing ring */}
        {!isStatic && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              backgroundColor: tone,
              opacity: 0.35,
              animation: "dsc-pulse-ring 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite",
            }}
          />
        )}
        {/* Solid center dot */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            backgroundColor: tone,
            boxShadow: `0 0 0 2px var(--dsc-surface, #fff)`,
          }}
        />
      </span>

      {label && (
        <span
          style={{
            fontSize: tokens.type.size.caption,
            fontWeight: tokens.type.weight.bold,
            color: tone,
            letterSpacing: tokens.type.tracking.wide,
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          {label}
        </span>
      )}

      {/* Scoped keyframes — safe to duplicate; CSS engine dedupes */}
      <style>{`
        @keyframes dsc-pulse-ring {
          0% { transform: scale(1); opacity: 0.45; }
          70% { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>
    </span>
  );
};
