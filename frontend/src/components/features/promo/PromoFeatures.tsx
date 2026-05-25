"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Users, ShieldCheck } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const FEATURES = [
  {
    icon: <Zap size={24} />,
    color: "#FF5500",
    bg: "rgba(255,85,0,0.1)",
    border: "rgba(255,85,0,0.18)",
    tag: "Core",
    title: "Instant AI Discovery",
    desc: "Your personal taste profile matches you to restaurants, tours, and experiences before you even search. The more you use it, the sharper it gets.",
    stat: "94%",
    statLabel: "match accuracy",
  },
  {
    icon: <Users size={22} />,
    color: "#16A34A",
    bg: "rgba(22,163,74,0.08)",
    border: "rgba(22,163,74,0.16)",
    tag: "Social",
    title: "Find Your Food Tribe",
    desc: "Connect with foodies who share your exact taste vectors. Coordinate group tours, share reviews, eat together.",
    stat: "2.4k+",
    statLabel: "active foodies",
  },
  {
    icon: <ShieldCheck size={22} />,
    color: "#2563EB",
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.15)",
    tag: "Accuracy",
    title: "8-Dimension Profiling",
    desc: "Most apps track what you eat. TasteMap maps the why — across 8 flavour dimensions that evolve with every meal you take.",
    stat: "8D",
    statLabel: "taste dimensions",
  },
];

export function PromoFeatures() {
  return (
    <section
      id="features"
      style={{
        backgroundColor: "transparent",
        height: "100vh",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxSizing: "border-box",
        overflow: "hidden",
        padding: "0",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 32px",
          width: "100%",
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 36,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 11,
                fontWeight: 700,
                color: "#FF5500",
                textTransform: "uppercase",
                letterSpacing: "1.4px",
              }}
            >
              What you get
            </p>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(1.7rem, 3vw, 2.5rem)",
                fontWeight: 900,
                letterSpacing: "-1.5px",
                lineHeight: 1.1,
                color: "#18160F",
              }}
            >
              An experience built around
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #FF5500, #FFB347)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                your palate.
              </span>
            </h2>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "rgba(24,22,15,0.48)",
              lineHeight: 1.7,
              maxWidth: 360,
              textAlign: "right",
            }}
          >
            From solo discovery to group dining — TasteMap adapts to every
            type of food journey you want to go on.
          </p>
        </motion.div>

        {/* Bento grid: Feature 1 spans 2 rows (left), F2+F3 stack on right */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gridTemplateRows: "1fr 1fr",
            gap: 16,
            height: "calc(100vh - 220px)",
            maxHeight: 500,
          }}
        >
          {/* Feature 1 — spans both rows */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease }}
            style={{
              gridRow: "1 / 3",
              position: "relative",
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              border: "1px solid rgba(0,0,0,0.07)",
              padding: "36px 32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {/* Glow accent */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: "linear-gradient(90deg, #FF5500, #FFB347)",
                borderRadius: "20px 20px 0 0",
              }}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Tag + icon */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: FEATURES[0].bg,
                    border: `1px solid ${FEATURES[0].border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: FEATURES[0].color,
                  }}
                >
                  {FEATURES[0].icon}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(24,22,15,0.38)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {FEATURES[0].tag}
                </span>
              </div>

              <div>
                <h3
                  style={{
                    margin: "0 0 12px",
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#18160F",
                    letterSpacing: "-0.6px",
                    lineHeight: 1.2,
                  }}
                >
                  {FEATURES[0].title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    color: "rgba(24,22,15,0.5)",
                    lineHeight: 1.7,
                  }}
                >
                  {FEATURES[0].desc}
                </p>
              </div>

              {/* How it works bullets */}
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {[
                  "Learns from every save, rating & swipe",
                  "Updates recommendations in real time",
                  "Zero manual searching — ever",
                ].map((text, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,85,0,0.1)",
                        border: "1px solid rgba(255,85,0,0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="#FF5500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        color: "rgba(24,22,15,0.55)",
                        fontWeight: 500,
                      }}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              {/* AI considers tags */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "rgba(24,22,15,0.35)",
                    textTransform: "uppercase",
                    letterSpacing: "1.2px",
                  }}
                >
                  AI considers
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {[
                    "Flavour profile",
                    "Cuisine type",
                    "Price range",
                    "Atmosphere",
                    "Distance",
                    "Dietary",
                    "Crowd level",
                  ].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "rgba(24,22,15,0.48)",
                        backgroundColor: "rgba(0,0,0,0.04)",
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mini match preview */}
              <div
                style={{
                  backgroundColor: "rgba(255,85,0,0.05)",
                  borderRadius: 12,
                  border: "1px solid rgba(255,85,0,0.12)",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#18160F",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Neo-Tokyo Sushi
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: "rgba(24,22,15,0.38)",
                    }}
                  >
                    0.8 km · $$$ · Japanese · Umami
                  </p>
                </div>
                <div
                  style={{
                    flexShrink: 0,
                    padding: "5px 11px",
                    borderRadius: 8,
                    backgroundColor: "#FF5500",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "-0.3px",
                    boxShadow: "0 4px 12px rgba(255,85,0,0.3)",
                  }}
                >
                  94% match
                </div>
              </div>
            </div>

            {/* Big stat at bottom */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                paddingTop: 24,
                borderTop: "1px solid rgba(0,0,0,0.07)",
              }}
            >
              <span
                style={{
                  fontSize: 52,
                  fontWeight: 900,
                  letterSpacing: "-3px",
                  color: "#FF5500",
                  lineHeight: 1,
                }}
              >
                {FEATURES[0].stat}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "rgba(24,22,15,0.42)",
                  fontWeight: 500,
                  marginBottom: 6,
                }}
              >
                {FEATURES[0].statLabel}
              </span>
            </div>
          </motion.div>

          {/* Feature 2 — top right */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: 0.1, ease }}
            style={{
              position: "relative",
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              border: "1px solid rgba(0,0,0,0.07)",
              padding: "28px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: "linear-gradient(90deg, #16A34A, #4ADE80)",
                borderRadius: "20px 20px 0 0",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  backgroundColor: FEATURES[1].bg,
                  border: `1px solid ${FEATURES[1].border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: FEATURES[1].color,
                }}
              >
                {FEATURES[1].icon}
              </div>
              <div>
                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: 17,
                    fontWeight: 800,
                    color: "#18160F",
                    letterSpacing: "-0.4px",
                  }}
                >
                  {FEATURES[1].title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13.5,
                    color: "rgba(24,22,15,0.5)",
                    lineHeight: 1.65,
                  }}
                >
                  {FEATURES[1].desc}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 16 }}>
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: "#16A34A",
                  letterSpacing: "-1.5px",
                  lineHeight: 1,
                }}
              >
                {FEATURES[1].stat}
              </span>
              <span style={{ fontSize: 12, color: "rgba(24,22,15,0.38)" }}>
                {FEATURES[1].statLabel}
              </span>
            </div>
          </motion.div>

          {/* Feature 3 — bottom right */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: 0.2, ease }}
            style={{
              position: "relative",
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              border: "1px solid rgba(0,0,0,0.07)",
              padding: "28px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: "linear-gradient(90deg, #2563EB, #818CF8)",
                borderRadius: "20px 20px 0 0",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  backgroundColor: FEATURES[2].bg,
                  border: `1px solid ${FEATURES[2].border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: FEATURES[2].color,
                }}
              >
                {FEATURES[2].icon}
              </div>
              <div>
                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: 17,
                    fontWeight: 800,
                    color: "#18160F",
                    letterSpacing: "-0.4px",
                  }}
                >
                  {FEATURES[2].title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13.5,
                    color: "rgba(24,22,15,0.5)",
                    lineHeight: 1.65,
                  }}
                >
                  {FEATURES[2].desc}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 16 }}>
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: "#2563EB",
                  letterSpacing: "-1px",
                  lineHeight: 1,
                }}
              >
                {FEATURES[2].stat}
              </span>
              <span style={{ fontSize: 12, color: "rgba(24,22,15,0.38)" }}>
                {FEATURES[2].statLabel}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
