"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "Explorer",
    price: "Free",
    period: "forever",
    desc: "Perfect for casual foodies just getting started.",
    color: "#1C1C1E",
    accent: "#ff6b35",
    bg: "white",
    border: "rgba(0,0,0,0.1)",
    highlight: false,
    features: [
      "Up to 20 venue saves",
      "Basic taste profile",
      "3 foodie connections",
      "Community reels feed",
      "1 tour per month",
    ],
  },
  {
    name: "Tastemap Pro",
    price: "£23",
    period: "/ month",
    desc: "For serious foodies who live to eat and explore.",
    color: "white",
    accent: "rgba(255,255,255,0.9)",
    bg: "linear-gradient(135deg, #1A7AFF 0%, #5856D6 60%, #AF52DE 100%)",
    border: "transparent",
    highlight: true,
    features: [
      "Unlimited venue saves",
      "Full 8D taste profile",
      "Unlimited foodies",
      "AI-ranked recommendations",
      "Unlimited tour builder",
      "Priority match notifications",
      "Early access to new features",
    ],
  },
];

export function PromoPlans() {
  const router = useRouter();

  return (
    <section
      id="plans"
      style={{ backgroundColor: "#F8F8FA", padding: "88px 0" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        {/* Label + heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          style={{ textAlign: "center", marginBottom: 52 }}
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
            Choose your plan
          </p>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 800,
              letterSpacing: "-1.2px",
              color: "#1C1C1E",
            }}
          >
            Start free, go Pro when you&apos;re ready
          </h2>
        </motion.div>

        {/* Plan cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            maxWidth: 820,
            margin: "0 auto",
          }}
        >
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              style={{
                position: "relative",
                background: plan.bg,
                border: `1.5px solid ${plan.border}`,
                borderRadius: 20,
                padding: "36px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 24,
                boxShadow: plan.highlight
                  ? "0 20px 60px rgba(0,100,255,0.25)"
                  : "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              {plan.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "4px 16px",
                    borderRadius: 20,
                    backgroundColor: "#FBBF24",
                    boxShadow: "0 4px 12px rgba(251,191,36,0.4)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#92400E",
                      letterSpacing: "0.5px",
                    }}
                  >
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Name + price */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: plan.highlight
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(0,0,0,0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  {plan.name}
                </span>
                <div
                  style={{ display: "flex", alignItems: "flex-end", gap: 4 }}
                >
                  <span
                    style={{
                      fontSize: 44,
                      fontWeight: 900,
                      letterSpacing: "-2.5px",
                      color: plan.color,
                      lineHeight: 1,
                    }}
                  >
                    {plan.price}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: plan.highlight
                        ? "rgba(255,255,255,0.55)"
                        : "rgba(0,0,0,0.4)",
                      marginBottom: 6,
                    }}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: plan.highlight
                      ? "rgba(255,255,255,0.6)"
                      : "rgba(0,0,0,0.45)",
                    lineHeight: 1.5,
                  }}
                >
                  {plan.desc}
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={() => router.push("/discover")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 18px",
                  borderRadius: 12,
                  backgroundColor: plan.highlight
                    ? "rgba(255,255,255,0.15)"
                    : "#1C1C1E",
                  border: plan.highlight
                    ? "1px solid rgba(255,255,255,0.2)"
                    : "none",
                  cursor: "pointer",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    plan.highlight ? "rgba(255,255,255,0.22)" : "#333";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    plan.highlight ? "rgba(255,255,255,0.15)" : "#1C1C1E";
                }}
              >
                Get started <ArrowRight size={15} />
              </button>

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  backgroundColor: plan.highlight
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(0,0,0,0.07)",
                }}
              />

              {/* Features */}
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
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        backgroundColor: plan.highlight
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(0,0,0,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <Check
                        size={11}
                        color={plan.highlight ? "white" : "#ff6b35"}
                        strokeWidth={2.5}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        color: plan.highlight
                          ? "rgba(255,255,255,0.8)"
                          : "rgba(0,0,0,0.6)",
                        lineHeight: 1.5,
                      }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
