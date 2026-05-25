"use client";

/**
 * ShopeeFood PromoBanner — replaces TasteSignatureCard on Discover
 * ─────────────────────────────────────────────────────────────────
 * Simple, clean promotional card. No heavy decorations.
 * Same card slot size as the original TasteSignatureCard.
 * Exported as TasteSignatureCard — no import changes needed upstream.
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bike, ArrowRight, ShoppingBag } from "lucide-react";

import { GlassCard } from "@/components/primitives";
import { tokens } from "@/styles/tokens";

export const TasteSignatureCard: React.FC = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <GlassCard
      variant="elevated"
      padding="sm"
      radius="lg"
      fillWidth
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: tokens.space[4],
        flex: 1,
        minHeight: 0,
        paddingLeft: tokens.space[4],
        paddingRight: tokens.space[4],
        paddingTop: tokens.space[4],
        paddingBottom: tokens.space[4],
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Subtle background tint on hover */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(238,77,45,0.04) 0%, transparent 100%)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.25s ease",
          pointerEvents: "none",
        }}
      />

      {/* ── Brand row ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
        {/* Icon */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg, #EE4D2D, #FF8C00)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 6px rgba(238,77,45,0.30)",
          }}
        >
          <ShoppingBag size={14} color="white" strokeWidth={2.2} />
        </div>

        {/* Name */}
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            color: tokens.color.textSubtle,
          }}
        >
          ShopeeFood
        </span>

        {/* Live badge */}
        <span
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 7px",
            borderRadius: 20,
            backgroundColor: "rgba(22,163,74,0.08)",
            border: "1px solid rgba(22,163,74,0.18)",
            fontSize: "0.6rem",
            fontWeight: 700,
            color: "#16A34A",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              backgroundColor: "#22C55E",
              boxShadow: "0 0 4px rgba(34,197,94,0.6)",
              display: "block",
            }}
          />
          Open now
        </span>
      </div>

      {/* ── Headline ── */}
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
        <p
          style={{
            margin: 0,
            fontSize: "1rem",
            fontWeight: 800,
            letterSpacing: "-0.3px",
            lineHeight: 1.25,
            color: tokens.color.text,
          }}
        >
          Get it{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #EE4D2D 0%, #FF8C00 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            delivered.
          </span>
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.72rem",
            fontWeight: 500,
            color: tokens.color.textMuted,
            lineHeight: 1.4,
          }}
        >
          Free delivery on your first order
        </p>
      </div>

      {/* ── Footer row: ETA + CTA ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {/* ETA */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: "0.68rem",
            fontWeight: 500,
            color: tokens.color.textMuted,
          }}
        >
          <Bike size={12} color={tokens.color.textMuted} />
          15–25 min
        </span>

        {/* CTA button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => window.open("https://shopeefood.vn", "_blank", "noopener")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 14px",
            borderRadius: 999,
            border: "none",
            background: "linear-gradient(135deg, #EE4D2D, #FF8C00)",
            color: "white",
            fontSize: "0.72rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: hovered ? "0 4px 12px rgba(238,77,45,0.35)" : "0 2px 6px rgba(238,77,45,0.20)",
            transition: "box-shadow 0.25s ease",
            letterSpacing: "0.2px",
          }}
        >
          Order now
          <ArrowRight size={11} color="white" />
        </motion.button>
      </div>
    </GlassCard>
  );
};
