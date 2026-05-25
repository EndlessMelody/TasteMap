"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ArrowRight, Zap } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const PLANS = [
  {
    name: "Explorer",
    badge: null,
    price: "Free",
    period: "forever",
    desc: "Perfect for casual foodies just getting started.",
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
    name: "Pro",
    badge: "Most Popular",
    price: "£23",
    period: "/ month",
    desc: "For serious foodies who live to eat and explore.",
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
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease }}
          style={{ textAlign: "center", marginBottom: 48 }}
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
            Pricing
          </p>
          <h2
            style={{
              margin: "0 0 14px",
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 900,
              letterSpacing: "-1.5px",
              color: "#18160F",
            }}
          >
            Start free.{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #FF5500, #FFB347)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Go Pro
            </span>{" "}
            when you&apos;re ready.
          </h2>
          <p
            style={{
              margin: "0 auto",
              fontSize: 14,
              color: "rgba(24,22,15,0.45)",
              maxWidth: 380,
              lineHeight: 1.65,
            }}
          >
            No credit card required to get started. Upgrade at any time.
          </p>
        </motion.div>

        {/* Plan cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            maxWidth: 860,
            margin: "0 auto",
          }}
        >
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12, ease }}
              style={{
                position: "relative",
                backgroundColor: plan.highlight ? "#FFFAF4" : "#FFFFFF",
                border: plan.highlight
                  ? "1px solid rgba(255,85,0,0.22)"
                  : "1px solid rgba(0,0,0,0.08)",
                borderRadius: 20,
                padding: "36px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 24,
                boxShadow: plan.highlight
                  ? "0 0 0 1px rgba(255,85,0,0.08), 0 12px 40px rgba(255,85,0,0.08)"
                  : "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              {/* Orange top bar for Pro */}
              {plan.highlight && (
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
              )}

              {/* Badge */}
              {plan.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "4px 14px",
                    borderRadius: 20,
                    backgroundColor: "#FF5500",
                    boxShadow: "0 4px 16px rgba(255,85,0,0.35)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "white",
                      letterSpacing: "0.8px",
                      textTransform: "uppercase",
                    }}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Name + price */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {plan.highlight && <Zap size={14} color="#FF5500" />}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: plan.highlight ? "#E04A00" : "rgba(24,22,15,0.38)",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                  >
                    TasteMap {plan.name}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                  <span
                    style={{
                      fontSize: 48,
                      fontWeight: 900,
                      letterSpacing: "-3px",
                      color: plan.highlight ? "#FF5500" : "#18160F",
                      lineHeight: 1,
                    }}
                  >
                    {plan.price}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "rgba(24,22,15,0.38)",
                      marginBottom: 7,
                    }}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "rgba(24,22,15,0.5)",
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
                  justifyContent: "center",
                  gap: 8,
                  padding: "13px 18px",
                  borderRadius: 11,
                  backgroundColor: plan.highlight ? "#FF5500" : "rgba(0,0,0,0.05)",
                  border: plan.highlight ? "none" : "1px solid rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  color: plan.highlight ? "white" : "rgba(24,22,15,0.72)",
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: plan.highlight ? "0 6px 24px rgba(255,85,0,0.32)" : "none",
                  transition: "background 0.15s, box-shadow 0.15s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    plan.highlight ? "#FF6B35" : "rgba(0,0,0,0.08)";
                  if (plan.highlight)
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 8px 32px rgba(255,85,0,0.45)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    plan.highlight ? "#FF5500" : "rgba(0,0,0,0.05)";
                  if (plan.highlight)
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 6px 24px rgba(255,85,0,0.32)";
                  (e.currentTarget as HTMLElement).style.transform = "";
                }}
              >
                {plan.highlight ? "Get Pro" : "Start free"}{" "}
                <ArrowRight size={15} />
              </button>

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  backgroundColor: plan.highlight
                    ? "rgba(255,85,0,0.12)"
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
                  gap: 11,
                }}
              >
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        backgroundColor: plan.highlight
                          ? "rgba(255,85,0,0.1)"
                          : "rgba(0,0,0,0.04)",
                        border: plan.highlight
                          ? "1px solid rgba(255,85,0,0.18)"
                          : "1px solid rgba(0,0,0,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Check
                        size={10}
                        color={plan.highlight ? "#FF5500" : "rgba(24,22,15,0.45)"}
                        strokeWidth={2.5}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        color: plan.highlight
                          ? "rgba(24,22,15,0.8)"
                          : "rgba(24,22,15,0.58)",
                        lineHeight: 1.4,
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
