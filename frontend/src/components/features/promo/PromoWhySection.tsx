"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, X, Check } from "lucide-react";
import { Column, Row, Grid } from "@once-ui-system/core";

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
      <Column
        style={{
          maxWidth: 1200,
          marginTop: 0,
          marginRight: "auto",
          marginBottom: 0,
          marginLeft: "auto",
          paddingTop: 0,
          paddingRight: "32px",
          paddingBottom: 0,
          paddingLeft: "32px",
          width: "100%",
        }}
      >
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
            <Column
              key={s.label}
              style={{
                paddingTop: "24px",
                paddingRight: "20px",
                paddingBottom: "24px",
                paddingLeft: "20px",
                backgroundColor: "#FFFFFF",
                borderRight:
                  i < BIG_STATS.length - 1
                    ? "1px solid rgba(0,0,0,0.07)"
                    : "none",
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
            </Column>
          ))}
        </motion.div>

        {/* Bottom: comparison + chart */}
        <Grid
          style={{
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
            <Grid
              style={{
                gridTemplateColumns: "1fr auto auto",
                paddingTop: "14px",
                paddingRight: "20px",
                paddingBottom: "14px",
                paddingLeft: "20px",
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
            </Grid>

            {/* Rows */}
            {COMPARISON.map((row, i) => (
              <Grid
                key={row.label}
                style={{
                  gridTemplateColumns: "1fr auto auto",
                  paddingTop: "12px",
                  paddingRight: "20px",
                  paddingBottom: "12px",
                  paddingLeft: "20px",
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
                <Row horizontal="center" style={{ minWidth: 80 }}>
                  <Row
                    horizontal="center"
                    vertical="center"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "rgba(22,163,74,0.1)",
                    }}
                  >
                    <Check size={11} color="#16A34A" strokeWidth={2.5} />
                  </Row>
                </Row>
                <Row horizontal="center" style={{ minWidth: 80 }}>
                  <Row
                    horizontal="center"
                    vertical="center"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "rgba(220,38,38,0.08)",
                    }}
                  >
                    <X size={10} color="#DC2626" strokeWidth={2.5} />
                  </Row>
                </Row>
              </Grid>
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
            <Column
              style={{
                flex: 1,
                minHeight: 0,
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                border: "1px solid rgba(0,0,0,0.07)",
                paddingTop: "22px",
                paddingRight: "22px",
                paddingBottom: "18px",
                paddingLeft: "22px",
                justifyContent: "space-between",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <Row
                style={{
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <Column>
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
                </Column>
                <Row
                  vertical="center"
                  style={{
                    gap: 4,
                    paddingTop: "4px",
                    paddingRight: "10px",
                    paddingBottom: "4px",
                    paddingLeft: "10px",
                    borderRadius: 20,
                    backgroundColor: "rgba(22,163,74,0.08)",
                    border: "1px solid rgba(22,163,74,0.15)",
                  }}
                >
                  <TrendingUp size={11} color="#16A34A" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#16A34A" }}>
                    +12%
                  </span>
                </Row>
              </Row>
              <MiniChart />
              <Row
                style={{
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
              </Row>
            </Column>

            {/* Consistency card */}
            <Column
              style={{
                backgroundColor: "rgba(255,85,0,0.05)",
                borderRadius: 16,
                border: "1px solid rgba(255,85,0,0.12)",
                paddingTop: "22px",
                paddingRight: "22px",
                paddingBottom: "22px",
                paddingLeft: "22px",
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
            </Column>
          </motion.div>
        </Grid>
      </Column>
    </section>
  );
}
