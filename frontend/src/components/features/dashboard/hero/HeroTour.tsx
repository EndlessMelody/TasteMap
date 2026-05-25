"use client";

/**
 * HeroTour — Discover v2
 * ─────────────────────────────────────────────────────────────────
 * The primary "what should I do right now" surface. Replaces the
 * cluttered HeroSection banner with a cleaner editorial composition:
 *
 *   - Full-bleed image (the best-matched tour today)
 *   - 2 badges max (status + match score)
 *   - Editorial display-size title
 *   - One line of live meta (distance · weather)
 *   - Single primary CTA: "Start Tour"
 *
 * Data: uses `useRecommendations(1)` — same data as the old hero —
 * but presented with restraint. No avatar pile, no secondary CTAs.
 */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Sun,
  Cloud,
  CloudRain,
  Moon,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

import { tokens, matchTone } from "@/styles/tokens";
import { useRecommendations } from "@/hooks/useRecommendations";

// ─── Live weather (duplicated from ContextRibbon — see TODO note) ──
interface WeatherState {
  icon: LucideIcon;
  color: string;
  label: string;
}

function useLiveWeather(): WeatherState {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const h = now.getHours();
  if (h >= 5 && h < 12) {
    return { icon: Sun, color: tokens.color.warning, label: "29°C · Sunny" };
  }
  if (h >= 12 && h < 17) {
    return {
      icon: Cloud,
      color: tokens.color.textMuted,
      label: "31°C · Partly Cloudy",
    };
  }
  if (h >= 17 && h < 20) {
    return {
      icon: CloudRain,
      color: tokens.color.cool,
      label: "27°C · Light Rain",
    };
  }
  return { icon: Moon, color: tokens.color.magic, label: "25°C · Clear" };
}

// ─── Fallback image ──────────────────────────────────────────────
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&h=900&fit=crop";

// ─── Main component ──────────────────────────────────────────────
export const HeroTour: React.FC = () => {
  const router = useRouter();
  const { picks, loading } = useRecommendations(1, undefined, "place");
  const tour = picks && picks.length > 0 ? picks[0] : null;
  const weather = useLiveWeather();
  const WeatherIcon = weather.icon;

  const bgImage = tour?.image_url || FALLBACK_IMG;
  const title = tour?.name || "Weekend Street Food Tour";
  const matchPct = tour
    ? tour.match_score > 1
      ? Math.round(tour.match_score)
      : Math.round(tour.match_score * 100)
    : 92;
  const tone = matchTone(matchPct);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      onClick={() => router.push("/tour-builder")}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 340,
        borderRadius: tokens.radius.xl,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: tokens.shadow.lg,
        border: `1px solid ${tokens.color.border}`,
        backgroundColor: tokens.color.surface,
      }}
    >
      {/* ── Background image with parallax-ready zoom ── */}
      <motion.div
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* ── Editorial gradient overlay ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.15) 55%, rgba(10,10,10,0.72) 100%)",
        }}
      />

      {/* ── Top-right badges ── */}
      <div
        style={{
          position: "absolute",
          top: tokens.space[5],
          right: tokens.space[5],
          display: "flex",
          gap: tokens.space[2],
          zIndex: 2,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: tokens.space[2],
            paddingTop: 6,
            paddingBottom: 6,
            paddingLeft: tokens.space[3],
            paddingRight: tokens.space[3],
            borderRadius: tokens.radius.pill,
            backgroundColor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            border: `1px solid rgba(255,255,255,0.4)`,
            boxShadow: tokens.shadow.sm,
          }}
        >
          <CheckCircle2 size={12} color={tokens.color.warm} strokeWidth={2.4} />
          <span
            style={{
              fontSize: tokens.type.size.caption,
              fontWeight: tokens.type.weight.black,
              color: tokens.color.text,
              letterSpacing: tokens.type.tracking.wide,
              textTransform: "uppercase",
            }}
          >
            Featured
          </span>
        </span>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: tokens.space[2],
            paddingTop: 6,
            paddingBottom: 6,
            paddingLeft: tokens.space[3],
            paddingRight: tokens.space[3],
            borderRadius: tokens.radius.pill,
            backgroundColor: tone,
            color: tokens.color.textInverse,
            boxShadow: `0 4px 12px -2px ${tone}88`,
          }}
        >
          <Sparkles size={12} strokeWidth={2.4} />
          <span
            style={{
              fontSize: tokens.type.size.caption,
              fontWeight: tokens.type.weight.black,
              letterSpacing: tokens.type.tracking.wide,
              textTransform: "uppercase",
            }}
          >
            {matchPct}% Match
          </span>
        </span>
      </div>

      {/* ── Bottom content stack ── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: tokens.space[8],
          display: "flex",
          flexDirection: "column",
          gap: tokens.space[4],
          zIndex: 2,
          color: tokens.color.textInverse,
        }}
      >
        {/* Eyebrow */}
        <span
          style={{
            fontSize: tokens.type.size.caption,
            fontWeight: tokens.type.weight.bold,
            letterSpacing: tokens.type.tracking.wide,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          Today&apos;s featured tour
        </span>

        {/* Title */}
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: tokens.type.weight.bold,
            lineHeight: 1.08,
            letterSpacing: tokens.type.tracking.tight,
            color: tokens.color.textInverse,
            margin: 0,
            maxWidth: "80%",
            textShadow: "0 2px 16px rgba(0,0,0,0.25)",
          }}
        >
          {loading ? "Loading your tour…" : title}
        </h1>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space[4],
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: tokens.space[2],
              fontSize: tokens.type.size.bodySm,
              fontWeight: tokens.type.weight.semibold,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            <WeatherIcon
              size={14}
              color="rgba(255,255,255,0.92)"
              strokeWidth={2.2}
            />
            {weather.label}
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: tokens.space[2],
              fontSize: tokens.type.size.bodySm,
              fontWeight: tokens.type.weight.semibold,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            <MapPin
              size={14}
              color="rgba(255,255,255,0.92)"
              strokeWidth={2.2}
            />
            {tour?.price_range || "3 stops · 1.2km"}
          </span>
        </div>

        {/* CTA */}
        <div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              router.push("/tour-builder");
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: tokens.space[3],
              paddingTop: 12,
              paddingBottom: 12,
              paddingLeft: tokens.space[6],
              paddingRight: tokens.space[5],
              borderRadius: tokens.radius.pill,
              backgroundColor: tokens.color.textInverse,
              color: tokens.color.text,
              border: "none",
              fontSize: tokens.type.size.body,
              fontWeight: tokens.type.weight.bold,
              letterSpacing: tokens.type.tracking.normal,
              cursor: "pointer",
              boxShadow: "0 12px 32px -8px rgba(0,0,0,0.35)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span style={{ position: "relative", zIndex: 1 }}>Start Tour</span>
            <ArrowRight
              size={16}
              color={tokens.color.text}
              strokeWidth={2.4}
              style={{ position: "relative", zIndex: 1 }}
            />
            {/* Subtle shimmer */}
            <motion.span
              initial={{ x: "-150%" }}
              animate={{ x: "150%" }}
              transition={{
                repeat: Infinity,
                duration: 2.6,
                ease: "linear",
                repeatDelay: 1.4,
              }}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "40%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,107,53,0.18), transparent)",
              }}
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
