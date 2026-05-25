"use client";

/**
 * MatchRing — animated SVG ring showing AI match percentage.
 * ─────────────────────────────────────────────────────────────────
 * Visual: circular progress ring (Apple-Watch style) with the percent
 * rendered in the center. Color auto-picked by matchTone() threshold.
 *
 * Sizes: sm (32px) / md (48px) / lg (64px) / xl (96px)
 *
 * Usage:
 *   <MatchRing value={87} size="md" />
 *   <MatchRing value={92} size="lg" label="Match" />
 */
import React from "react";
import { motion } from "framer-motion";
import { tokens, matchTone } from "@/styles/tokens";

export type MatchRingSize = "sm" | "md" | "lg" | "xl";

export interface MatchRingProps {
  /** Match percentage 0-100 */
  value: number;
  size?: MatchRingSize;
  /** Optional small label shown below the percent */
  label?: string;
  /** Override the auto-picked tone color */
  tone?: string;
  /** Stroke width as a fraction of radius (default 0.14) */
  thickness?: number;
  /** Animate on mount (default true) */
  animated?: boolean;
}

const SIZE_MAP: Record<MatchRingSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

const FONT_MAP: Record<MatchRingSize, number> = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 26,
};

export const MatchRing: React.FC<MatchRingProps> = ({
  value,
  size = "md",
  label,
  tone,
  thickness = 0.14,
  animated = true,
}) => {
  const px = SIZE_MAP[size];
  const fontSize = FONT_MAP[size];
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const color = tone ?? matchTone(pct);
  const strokeW = Math.max(2, px * thickness);
  const radius = (px - strokeW) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <div
      style={{
        width: px,
        height: label ? px + fontSize + 4 : px,
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: label ? 2 : 0,
      }}
    >
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        style={{ display: "block" }}
        aria-label={`Match ${pct}%`}
        role="img"
      >
        {/* Track */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          stroke={tokens.color.surfaceInset}
          strokeWidth={strokeW}
        />
        {/* Progress */}
        <motion.circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            transform: `rotate(-90deg)`,
            transformOrigin: `${px / 2}px ${px / 2}px`,
          }}
        />
        {/* Percent text */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize,
            fontWeight: 800,
            fill: tokens.color.text,
            fontFamily: "inherit",
            letterSpacing: tokens.type.tracking.tight,
          }}
        >
          {pct}
        </text>
      </svg>
      {label && (
        <span
          style={{
            fontSize: tokens.type.size.caption,
            fontWeight: tokens.type.weight.semibold,
            color: tokens.color.textMuted,
            letterSpacing: tokens.type.tracking.wide,
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
