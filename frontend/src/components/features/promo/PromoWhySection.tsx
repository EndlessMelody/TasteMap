"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, X, Check } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const BIG_STATS = [
  { value: "94%",  label: "Taste accuracy",   sub: "vs 34% avg for generic apps" },
  { value: "2.4k", label: "Monthly foodies",  sub: "Active on the platform" },
  { value: "8D",   label: "Taste dimensions", sub: "Spicy · Umami · Sweet + 5 more" },
  { value: "12k+", label: "Tours completed",  sub: "Across Ho Chi Minh City" },
];

const COMPARISON = [
  { label: "Personalised recommendations", tm: true, other: false },
  { label: "8-dimension taste profiling",  tm: true, other: false },
  { label: "Find foodies by taste match",  tm: true, other: false },
  { label: "AI-built food tour routes",    tm: true, other: false },
  { label: "Real-time profile updates",    tm: true, other: false },
  { label: "Group dining coordination",    tm: true, other: false },
];

function MiniChart() {
  const points = [20, 35, 28, 50, 44, 65, 58, 78, 72, 88, 82, 94];
  const w = 240, h = 60;
  const max = Math.max(...points), min = Math.min(...points);
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map((v) => h - ((v - min) / (max - min)) * (h - 8) - 4);
  const pathD = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
  const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="whyArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#FF5500" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FF5500" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#whyArea)" />
      <path
        d={pathD}
        fill="none"
        stroke="#FF5500"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={xs[xs.length - 1]}
        cy={ys[ys.length - 1]}
        r="4"
        fill="#FF5500"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
    </svg>
  );
}

export function PromoWhySection() {
  return (
    <section
      id="why"
      style={{
        backgroundColor: "transparent",
        height: "100vh",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", width: "100%" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease }}
          style={{ marginBottom: 40 }}
        >
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
            Why TasteMap
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
            The only app built around
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
              your exact palate.
            </span>
          </h2>
        </motion.div>

        {/* Big stats row */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.08, ease }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1,
            marginBottom: 28,
            backgroundColor: "rgba(0,0,0,0.05)",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.07)",
          }}
        >
          {BIG_STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: "24px 20px",
                backgroundColor: "#FFFFFF",
                borderRight:
                  i < BIG_STATS.length - 1
                    ? "1px solid rgba(0,0,0,0.07)"
                    : "none",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 38,
                  fontWeight: 900,
                  letterSpacing: "-2px",
                  color: "#FF5500",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#18160F" }}>
                {s.label}
              </span>
              <span style={{ fontSize: 11, color: "rgba(24,22,15,0.38)" }}>
                {s.sub}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Bottom: comparison + chart */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            alignItems: "stretch",
          }}
        >
          {/* Comparison table */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.12, ease }}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.07)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                padding: "14px 20px",
                borderBottom: "1px solid rgba(0,0,0,0.07)",
                gap: 16,
              }}
            >
              <span style={{ fontSize: 12, color: "rgba(24,22,15,0.38)", fontWeight: 600 }}>
                Feature
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#FF5500",
                  fontWeight: 700,
                  textAlign: "center",
                  minWidth: 80,
                }}
              >
                TasteMap
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "rgba(24,22,15,0.38)",
                  fontWeight: 600,
                  textAlign: "center",
                  minWidth: 80,
                }}
              >
                Others
              </span>
            </div>

            {/* Rows */}
            {COMPARISON.map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  padding: "12px 20px",
                  gap: 16,
                  flex: 1,
                  borderBottom:
                    i < COMPARISON.length - 1
                      ? "1px solid rgba(0,0,0,0.04)"
                      : "none",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: "rgba(24,22,15,0.65)",
                    fontWeight: 500,
                  }}
                >
                  {row.label}
                </span>
                <div style={{ display: "flex", justifyContent: "center", minWidth: 80 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "rgba(22,163,74,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={11} color="#16A34A" strokeWidth={2.5} />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", minWidth: 80 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "rgba(220,38,38,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={10} color="#DC2626" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Chart + big stat card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.18, ease }}
            style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}
          >
            {/* Taste score chart */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                border: "1px solid rgba(0,0,0,0.07)",
                padding: "22px 22px 18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 3px",
                      fontSize: 11,
                      color: "rgba(24,22,15,0.4)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                    }}
                  >
                    Taste Score Growth
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 24,
                      fontWeight: 900,
                      letterSpacing: "-1.2px",
                      color: "#18160F",
                    }}
                  >
                    94%
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 10px",
                    borderRadius: 20,
                    backgroundColor: "rgba(22,163,74,0.08)",
                    border: "1px solid rgba(22,163,74,0.15)",
                  }}
                >
                  <TrendingUp size={11} color="#16A34A" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#16A34A" }}>
                    +12%
                  </span>
                </div>
              </div>
              <MiniChart />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                {["Jan", "Mar", "May", "Jul", "Sep", "Nov"].map((m) => (
                  <span
                    key={m}
                    style={{
                      fontSize: 10,
                      color: "rgba(24,22,15,0.32)",
                      fontWeight: 500,
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Consistency card */}
            <div
              style={{
                backgroundColor: "rgba(255,85,0,0.05)",
                borderRadius: 16,
                border: "1px solid rgba(255,85,0,0.12)",
                padding: "22px",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#18160F",
                  letterSpacing: "-0.3px",
                }}
              >
                Zero random suggestions
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "rgba(24,22,15,0.5)",
                  lineHeight: 1.65,
                }}
              >
                Every recommendation is anchored to your taste profile and
                updates in real time as you explore and rate new venues.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
