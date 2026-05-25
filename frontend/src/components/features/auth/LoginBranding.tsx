"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Check, ChefHat, Pizza, Heart, UtensilsCrossed, Sparkles } from "lucide-react";

const PERKS = [
  "AI-matched restaurants, ranked by your palate",
  "Connect with foodies who share your taste vectors",
  "Build drag-to-route food tours in seconds",
  "Group rooms to plan dinners together, live",
];

const AVATARS = [
  { icon: ChefHat, bg: "hsl(20,70%,65%)" },
  { icon: Pizza, bg: "hsl(30,60%,65%)" },
  { icon: Heart, bg: "hsl(340,55%,65%)" },
  { icon: Sparkles, bg: "hsl(160,50%,60%)" },
];

export function LoginBranding() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(145deg, #1A0D08 0%, #2E1A0E 40%, #1A0D08 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 52px 56px 80px",
      }}
    >
      {/* Ambient blobs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: "60%",
          height: "60%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,107,53,0.30) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-5%",
          width: "50%",
          height: "50%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,107,53,0.20) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "linear-gradient(135deg, #ff6b35, #ff4757)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(255,107,53,0.35)",
          }}
        >
          <MapPin size={17} color="white" />
        </div>
        <span
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.5px",
          }}
        >
          TasteMap<span style={{ color: "#ff6b35" }}>.</span>
        </span>
      </motion.div>

      {/* Center content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.65, ease: "easeOut" }}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2.2rem, 3.2vw, 3.1rem)",
              fontWeight: 900,
              letterSpacing: "-2px",
              lineHeight: 1.1,
              color: "white",
            }}
          >
            Your flavour DNA,{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #ff6b35, #ff4757)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              mapped.
            </span>
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.65,
              maxWidth: 360,
            }}
          >
            Sign in to unlock personalised recommendations, food tours, and a
            community that actually shares your taste.
          </p>
        </div>

        {/* Perks */}
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {PERKS.map((perk, i) => (
            <motion.li
              key={perk}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
              style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "rgba(255,107,53,0.15)",
                  border: "1px solid rgba(255,107,53,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <Check size={11} color="#ff6b35" strokeWidth={2.5} />
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.5,
                }}
              >
                {perk}
              </span>
            </motion.li>
          ))}
        </ul>

        {/* Floating mockup card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 16,
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            maxWidth: 340,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: "linear-gradient(135deg, #FF6B35, #FF8C42)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <UtensilsCrossed size={22} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                Neo-Tokyo Sushi
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#FBBF24" }}>
                97% match
              </span>
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              0.8km · Japanese · $$$
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom social proof */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ display: "flex" }}>
          {AVATARS.map((a, i) => {
            const Icon = a.icon;
            return (
              <div
                key={i}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  backgroundColor: a.bg,
                  border: "2px solid rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: i === 0 ? 0 : -8,
                  zIndex: AVATARS.length - i,
                }}
              >
                <Icon size={14} color="white" />
              </div>
            );
          })}
        </div>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
          Joined by{" "}
          <strong style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
            2,400+ foodies
          </strong>
        </span>
      </motion.div>
    </div>
  );
}
