"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sliders, Sparkles, Map } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const STEPS = [
  {
    num: "01",
    icon: <Sliders size={26} />,
    color: "#FF5500",
    bg: "rgba(255,85,0,0.1)",
    border: "rgba(255,85,0,0.2)",
    title: "Map your taste",
    desc: "Take a short flavour quiz or let TasteMap learn from your first few swipes. Your palate gets mapped across 8 dimensions instantly.",
    highlight: false,
  },
  {
    num: "02",
    icon: <Sparkles size={26} />,
    color: "#B45309",
    bg: "rgba(180,83,9,0.08)",
    border: "rgba(180,83,9,0.18)",
    title: "Get your matches",
    desc: "AI-ranked venues, curated tours, and foodies aligned with your exact taste vector — updated in real time as your profile deepens.",
    highlight: true,
  },
  {
    num: "03",
    icon: <Map size={26} />,
    color: "#2563EB",
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.18)",
    title: "Go eat, together",
    desc: "Invite foodies, build a tour route, share experiences. Your TasteMap grows richer with every meal, rating, and connection.",
    highlight: false,
  },
];

export function PromoHowItWorks() {
  return (
    <section
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
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 11,
              fontWeight: 700,
              color: "#FF5500",
              textTransform: "uppercase",
              letterSpacing: "1.4px",
            }}
          >
            How it works
          </p>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(1.8rem, 3.2vw, 2.8rem)",
              fontWeight: 900,
              letterSpacing: "-1.8px",
              lineHeight: 1.1,
              color: "#18160F",
            }}
          >
            Start mapping your food story
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
              in under 2 minutes.
            </span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            position: "relative",
          }}
        >
          {/* Connector line */}
          <div
            style={{
              position: "absolute",
              top: 36,
              left: "16.5%",
              right: "16.5%",
              height: 1,
              background:
                "linear-gradient(90deg, rgba(255,85,0,0.2), rgba(255,179,71,0.35), rgba(37,99,235,0.2))",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.13, ease }}
              style={{
                position: "relative",
                zIndex: 1,
                backgroundColor: step.highlight ? "#FFFAF4" : "#FFFFFF",
                borderRadius: 20,
                border: step.highlight
                  ? "1px solid rgba(255,179,71,0.3)"
                  : "1px solid rgba(0,0,0,0.08)",
                padding: "36px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                boxShadow: step.highlight
                  ? "0 0 0 1px rgba(255,179,71,0.1), 0 8px 32px rgba(255,179,71,0.1)"
                  : "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              {/* Step number (decorative background) */}
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 20,
                  fontSize: 72,
                  fontWeight: 900,
                  color: "rgba(0,0,0,0.04)",
                  letterSpacing: "-4px",
                  lineHeight: 1,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {step.num}
              </div>

              {/* Step circle */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: step.bg,
                  border: `1px solid ${step.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: step.color,
                  flexShrink: 0,
                  boxShadow: step.highlight ? `0 6px 20px ${step.bg}` : "none",
                }}
              >
                {step.icon}
              </div>

              {/* Step number label */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    backgroundColor: step.bg,
                    border: `1px solid ${step.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 800, color: step.color }}>
                    {i + 1}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(24,22,15,0.35)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Step {step.num}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#18160F",
                    letterSpacing: "-0.5px",
                    lineHeight: 1.2,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "rgba(24,22,15,0.5)",
                    lineHeight: 1.7,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom proof line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            marginTop: 36,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          {[
            "No credit card required",
            "Setup in 2 minutes",
            "Free forever plan",
          ].map((text, i) => (
            <React.Fragment key={text}>
              {i > 0 && (
                <span style={{ color: "rgba(0,0,0,0.15)", fontSize: 12 }}>·</span>
              )}
              <span
                style={{
                  fontSize: 12,
                  color: "rgba(24,22,15,0.38)",
                  fontWeight: 500,
                }}
              >
                {text}
              </span>
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
