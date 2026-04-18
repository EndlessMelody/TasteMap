"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

function StatCard({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: "24px",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <p
        style={{
          margin: "0 0 4px",
          fontSize: 13,
          color: "rgba(0,0,0,0.4)",
          fontWeight: 500,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "0 0 6px",
          fontSize: 36,
          fontWeight: 900,
          letterSpacing: "-2px",
          color: "#1C1C1E",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: "rgba(0,0,0,0.45)",
          lineHeight: 1.5,
        }}
      >
        {sub}
      </p>
    </div>
  );
}

function TrendChart() {
  const points = [20, 35, 28, 50, 44, 65, 58, 78, 72, 88, 82, 94];
  const w = 280,
    h = 80;
  const max = Math.max(...points),
    min = Math.min(...points);
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map((v) => h - ((v - min) / (max - min)) * (h - 12) - 6);
  const pathD = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`)
    .join(" ");
  const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`;

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: "20px 20px 16px",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
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
              margin: "0 0 2px",
              fontSize: 11,
              color: "rgba(0,0,0,0.35)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.6px",
            }}
          >
            Taste Score
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "-1px",
              color: "#1C1C1E",
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
            backgroundColor: "rgba(52,199,89,0.1)",
          }}
        >
          <TrendingUp size={12} color="#16A34A" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#16A34A" }}>
            +12%
          </span>
        </div>
      </div>
      <svg
        width="100%"
        viewBox={`0 0 ${w} ${h}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#areaGrad)" />
        <path
          d={pathD}
          fill="none"
          stroke="#ff6b35"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={xs[xs.length - 1]}
          cy={ys[ys.length - 1]}
          r="4"
          fill="#ff6b35"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
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
            style={{ fontSize: 10, color: "rgba(0,0,0,0.3)", fontWeight: 500 }}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PromoWhySection() {
  return (
    <section id="why" style={{ backgroundColor: "white", padding: "88px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          style={{
            margin: "0 0 52px",
            fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
            fontWeight: 800,
            letterSpacing: "-1.2px",
            color: "#1C1C1E",
            textAlign: "center",
          }}
        >
          Why foodies prefer TasteMap
        </motion.h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Big stat */}
            <div
              style={{
                backgroundColor: "#FFF0E6",
                borderRadius: 20,
                padding: "32px",
                border: "1px solid rgba(255,107,53,0.1)",
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 13,
                  color: "rgba(0,0,0,0.45)",
                  fontWeight: 500,
                }}
              >
                Foodies active monthly
              </p>
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: 52,
                  fontWeight: 900,
                  letterSpacing: "-3px",
                  color: "#ff6b35",
                  lineHeight: 1,
                }}
              >
                2.4k+
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "rgba(0,0,0,0.45)",
                  lineHeight: 1.5,
                }}
              >
                Foodies already mapping their taste on TasteMap every month
              </p>
            </div>

            {/* No volatility card */}
            <div
              style={{
                backgroundColor: "#F8F8FA",
                borderRadius: 20,
                padding: "28px",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1C1C1E",
                  letterSpacing: "-0.3px",
                }}
              >
                Consistent recommendations
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "rgba(0,0,0,0.45)",
                  lineHeight: 1.6,
                }}
              >
                No random suggestions. Every recommendation is anchored to your
                taste profile, updating as you explore.
              </p>
            </div>
          </motion.div>

          {/* Right column */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Trend chart */}
            <TrendChart />

            {/* Two small stat cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <StatCard
                value="94%"
                label="Taste accuracy"
                sub="AI-matched to your exact profile"
              />
              <StatCard
                value="12k+"
                label="Tours completed"
                sub="Across Ho Chi Minh City"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
