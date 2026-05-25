"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import { PromoFooter } from "./PromoFooter";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function PromoCTA() {
  const router = useRouter();

  return (
    <section
      style={{
        backgroundColor: "transparent",
        height: "100vh",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* CTA content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          position: "relative",
        }}
      >
        {/* Decorative radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,85,0,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 32px",
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease }}
            style={{
              position: "relative",
              backgroundColor: "#FFFFFF",
              borderRadius: 28,
              border: "1px solid rgba(0,0,0,0.08)",
              padding: "64px 48px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 36,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            {/* Orange top border glow */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "10%",
                right: "10%",
                height: 2,
                background:
                  "linear-gradient(90deg, transparent, #FF5500, #FFB347, #FF5500, transparent)",
                borderRadius: "0 0 2px 2px",
              }}
            />

            {/* Corner decorative circles */}
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 240,
                height: 240,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,85,0,0.06) 0%, transparent 65%)",
                filter: "blur(30px)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -60,
                left: -60,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,179,71,0.05) 0%, transparent 65%)",
                filter: "blur(30px)",
                pointerEvents: "none",
              }}
            />

            {/* Text content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                maxWidth: 680,
                position: "relative",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#FF5500",
                  textTransform: "uppercase",
                  letterSpacing: "1.4px",
                }}
              >
                Get started today
              </p>
              <h2
                style={{
                  margin: 0,
                  fontSize: "clamp(2rem, 4vw, 3.2rem)",
                  fontWeight: 900,
                  letterSpacing: "-2px",
                  lineHeight: 1.1,
                  color: "#18160F",
                }}
              >
                Ready to find your
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
                  food tribe?
                </span>
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: "rgba(24,22,15,0.55)",
                  lineHeight: 1.7,
                }}
              >
                Join thousands of foodies already mapping their taste, building
                tours, and discovering restaurants they actually love. It&apos;s
                free to start — always.
              </p>
            </div>

            {/* CTAs */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 14,
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              <button
                onClick={() => router.push("/discover")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "15px 32px",
                  borderRadius: 12,
                  background: "#FF5500",
                  border: "none",
                  cursor: "pointer",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 700,
                  boxShadow: "0 8px 32px rgba(255,85,0,0.36)",
                  transition: "transform 0.15s, box-shadow 0.15s, background 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 14px 40px rgba(255,85,0,0.5)";
                  (e.currentTarget as HTMLElement).style.background = "#FF6B35";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 8px 32px rgba(255,85,0,0.36)";
                  (e.currentTarget as HTMLElement).style.background = "#FF5500";
                }}
              >
                <Compass size={17} />
                Start Discovering
                <ArrowRight size={15} />
              </button>
              <button
                onClick={() => router.push("/discover")}
                style={{
                  padding: "15px 26px",
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  color: "rgba(24,22,15,0.65)",
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "background 0.15s, color 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.08)";
                  (e.currentTarget as HTMLElement).style.color = "#18160F";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.05)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(24,22,15,0.65)";
                }}
              >
                Learn more →
              </button>
            </div>

            {/* Trust line */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {["No credit card required", "Free forever plan", "Setup in 2 min"].map(
                (text, i) => (
                  <React.Fragment key={text}>
                    {i > 0 && (
                      <span style={{ color: "rgba(0,0,0,0.15)" }}>·</span>
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
                )
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <PromoFooter />
    </section>
  );
}
