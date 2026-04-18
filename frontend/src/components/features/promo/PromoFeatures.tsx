"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Link2, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: <Zap size={22} />,
    color: "#ff6b35",
    bg: "rgba(255,107,53,0.08)",
    title: "Instant Discovery",
    desc: "AI-matched restaurants, trending reels, and curated tours built around your flavour DNA. Zero guesswork.",
  },
  {
    icon: <Link2 size={22} />,
    color: "#FF9500",
    bg: "rgba(255,149,0,0.08)",
    title: "Social Connections",
    desc: "Find foodies who share your exact taste vectors. Coordinate tours, share reviews, eat together.",
  },
  {
    icon: <ShieldCheck size={22} />,
    color: "#34C759",
    bg: "rgba(52,199,89,0.08)",
    title: "Unmatched Accuracy",
    desc: "94% taste-match accuracy powered by multi-dimensional profiling. Every recommendation is personal.",
  },
];

export function PromoFeatures() {
  return (
    <section
      id="features"
      style={{ backgroundColor: "#F8F8FA", padding: "88px 0" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        {/* Label + heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          style={{ marginBottom: 52 }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 11,
              fontWeight: 700,
              color: "#ff6b35",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
            }}
          >
            For your palate
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              alignItems: "start",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                fontWeight: 800,
                letterSpacing: "-1.2px",
                lineHeight: 1.15,
                color: "#1C1C1E",
              }}
            >
              Experience that grows with your taste.
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                color: "rgba(0,0,0,0.48)",
                lineHeight: 1.7,
                paddingTop: 6,
              }}
            >
              From AI-powered discovery to social dining, TasteMap is designed
              to evolve with every meal you take, recommendation you follow, and
              foodie you connect with.
            </p>
          </div>
        </motion.div>

        {/* Feature columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 32,
          }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: f.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: f.color,
                }}
              >
                {f.icon}
              </div>
              <div>
                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1C1C1E",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "rgba(0,0,0,0.48)",
                    lineHeight: 1.65,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
