"use client";

/**
 * ContextRibbon (a.k.a. Taste Pulse) — Discover v3
 * ─────────────────────────────────────────────────────────────────
 * A slim, alive status strip between the topbar and the hero.
 * Three-column layout:
 *
 *   ┌──────────────────────────────────────────────────────────┐
 *   │  ☀ 25°C Clear · Dĩ An  │  🔔 Dev Note  │  ✨ 3.4K spots │
 *   └──────────────────────────────────────────────────────────┘
 *
 * Left:    Weather + location (static)
 * Center:  Developer/system notification (rotating)
 * Right:   Quick stats / contextual info
 */
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sun,
  Cloud,
  CloudRain,
  Moon,
  Sparkles,
  Radio,
  Code2,
  Zap,
  Wind,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import { GlassCard } from "@/components/primitives";
import { tokens } from "@/styles/tokens";
import { fadeDown } from "@/lib/motion";
import { useAuth } from "@/context/AuthContext";
import { useUserVector } from "@/context/UserVectorContext";

// ─── Live weather context ────────────────────────────────────────
interface WeatherState {
  icon: LucideIcon;
  color: string;
  temp: string;
  condition: string;
  timeOfDay: "Morning" | "Afternoon" | "Evening" | "Night";
  hour: number;
}

function useLiveContext(): WeatherState {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const h = now.getHours();
  if (h >= 5 && h < 12) {
    return {
      icon: Sun,
      color: "#FBBF24",
      temp: "29°C",
      condition: "Sunny",
      timeOfDay: "Morning",
      hour: h,
    };
  }
  if (h >= 12 && h < 17) {
    return {
      icon: Cloud,
      color: tokens.color.textMuted,
      temp: "31°C",
      condition: "Partly Cloudy",
      timeOfDay: "Afternoon",
      hour: h,
    };
  }
  if (h >= 17 && h < 20) {
    return {
      icon: CloudRain,
      color: tokens.color.cool,
      temp: "27°C",
      condition: "Light Rain",
      timeOfDay: "Evening",
      hour: h,
    };
  }
  return {
    icon: Moon,
    color: tokens.color.magic,
    temp: "25°C",
    condition: "Clear",
    timeOfDay: "Night",
    hour: h,
  };
}

// ─── Dev notification messages ───────────────────────────────────
interface DevNote {
  id: string;
  icon: LucideIcon;
  tone: string;
  text: string;
}

function useDevNotes(): DevNote[] {
  return useMemo(
    () => [
      {
        id: "dev-update",
        icon: Code2,
        tone: tokens.color.cool,
        text: "v2.5 — Group Lobby & AI Planner now live!",
      },
      {
        id: "dev-perf",
        icon: Zap,
        tone: "#FBBF24",
        text: "Performance boost: Vector search 3× faster",
      },
      {
        id: "dev-feature",
        icon: Radio,
        tone: tokens.color.magic,
        text: "Coming soon: Voice rooms in Group Lobby",
      },
      {
        id: "dev-community",
        icon: Sparkles,
        tone: tokens.color.warm,
        text: "New: Culture Guide powered by RAG pipeline",
      },
    ],
    [],
  );
}

// ─── Rotator hook ────────────────────────────────────────────────
function useRotator(length: number, intervalMs = 5000) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [length, intervalMs]);
  return index;
}

// ─── Divider ─────────────────────────────────────────────────────
const VerticalDivider: React.FC = () => (
  <span
    aria-hidden
    style={{
      width: 1,
      height: 16,
      backgroundColor: tokens.color.border,
      flexShrink: 0,
      opacity: 0.6,
    }}
  />
);

// ─── Main component ──────────────────────────────────────────────
export const ContextRibbon: React.FC = () => {
  const { user, isInitializing } = useAuth();
  const ctx = useLiveContext();
  const WeatherIcon = ctx.icon;

  const { radarData } = useUserVector();
  const topTrait = useMemo(() => {
    if (!radarData?.length) return null;
    return (
      [...radarData].sort(
        (a, b) => b.A / b.fullMark - a.A / a.fullMark,
      )[0]?.subject || null
    );
  }, [radarData]);

  const devNotes = useDevNotes();
  const noteIndex = useRotator(devNotes.length);
  const currentNote = devNotes[noteIndex];

  // Loading placeholder
  if (isInitializing) {
    return (
      <motion.div
        variants={fadeDown}
        initial="hidden"
        animate="show"
        style={{ width: "100%" }}
      >
        <GlassCard
          variant="glass"
          padding="sm"
          radius="lg"
          fillWidth
          style={{
            height: 40,
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,0.03) 25%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.6s ease-in-out infinite",
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeDown}
      initial="hidden"
      animate="show"
      style={{ width: "100%" }}
    >
      <GlassCard
        variant="glass"
        padding="none"
        radius="md"
        fillWidth
        style={{
          paddingTop: 7,
          paddingBottom: 7,
          paddingLeft: tokens.space[4],
          paddingRight: tokens.space[4],
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space[4],
            width: "100%",
            minHeight: 24,
          }}
        >
          {/* ── LEFT: Weather + Location ── */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: tokens.space[2],
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            <WeatherIcon
              size={13}
              color={ctx.color}
              strokeWidth={2.4}
              style={{ flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: tokens.type.weight.bold,
                color: tokens.color.text,
              }}
            >
              {ctx.temp}
            </span>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: tokens.type.weight.medium,
                color: tokens.color.textMuted,
              }}
            >
              {ctx.condition}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "0.78rem",
                fontWeight: tokens.type.weight.semibold,
                color: tokens.color.textSubtle,
              }}
            >
              ·
              <Wind size={10} strokeWidth={2.4} style={{ opacity: 0.5 }} />
              AQI: 42
            </span>
          </div>

          <VerticalDivider />

          {/* ── CENTER: Dev Notes (rotating) ── */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              position: "relative",
              height: 20,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
            }}
          >
            <AnimatePresence mode="wait">
              {currentNote && (
                <motion.div
                  key={currentNote.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <currentNote.icon
                    size={12}
                    color={currentNote.tone}
                    strokeWidth={2.4}
                    style={{ flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: "0.76rem",
                      fontWeight: tokens.type.weight.semibold,
                      color: tokens.color.text,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {currentNote.text}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Dots indicator ── */}
          <div
            style={{
              display: "inline-flex",
              gap: 3,
              flexShrink: 0,
            }}
            aria-hidden
          >
            {devNotes.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === noteIndex ? 10 : 3,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor:
                    i === noteIndex
                      ? tokens.color.text
                      : tokens.color.border,
                  transition: "all 250ms var(--dsc-ease-out)",
                }}
              />
            ))}
          </div>

          <VerticalDivider />

          {/* ── RIGHT: Quick Stats ── */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: tokens.space[3],
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {/* Foodies online */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.74rem",
                fontWeight: tokens.type.weight.semibold,
                color: tokens.color.textMuted,
              }}
            >
              <Users size={11} color={tokens.color.cool} strokeWidth={2.4} />
              <span style={{ color: tokens.color.text, fontWeight: 700 }}>
                312
              </span>
              online
            </span>

            {/* Trending trait */}
            {topTrait && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.74rem",
                  fontWeight: tokens.type.weight.semibold,
                  color: tokens.color.textMuted,
                }}
              >
                <TrendingUp
                  size={11}
                  color={tokens.color.warm}
                  strokeWidth={2.4}
                />
                <span style={{ color: tokens.color.text, fontWeight: 700 }}>
                  {topTrait}
                </span>
              </span>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
