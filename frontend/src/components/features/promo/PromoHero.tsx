"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Star } from "lucide-react";

// ─── Paste your background image URL here ───────────────────────────────────
const HERO_BG_URL = "https://images5.alphacoders.com/564/thumb-1920-564931.jpg";
// ────────────────────────────────────────────────────────────────────────────

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.1 + i * 0.1, duration: 0.65, ease },
});

function FloatBadge({
  top,
  left,
  right,
  bottom,
  delay = 0.5,
  emoji,
  title,
  sub,
  ampY = 6,
}: {
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  delay?: number;
  emoji: string;
  title: string;
  sub: string;
  ampY?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.65, ease }}
      style={{ position: "absolute", top, left, right, bottom, zIndex: 4 }}
    >
      <motion.div
        animate={{ y: [0, -ampY, 0] }}
        transition={{
          duration: 3 + delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          backgroundColor: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: 14,
          padding: "10px 14px",
          boxShadow: "0 16px 40px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid rgba(255,255,255,0.65)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          minWidth: 160,
        }}
      >
        <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>
          {emoji}
        </span>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              color: "#1C1C1E",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 10.5,
              color: "rgba(0,0,0,0.45)",
              whiteSpace: "nowrap",
            }}
          >
            {sub}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AppMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, y: 16 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: 0.3, duration: 0.8, ease }}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 380,
        marginLeft: "auto",
      }}
    >
      {/* Glow behind card */}
      <div
        style={{
          position: "absolute",
          inset: -48,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(79,142,247,0.28) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
          filter: "blur(20px)",
        }}
      />

      {/* Main card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "white",
          borderRadius: 22,
          boxShadow: "0 32px 80px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.1)",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.7)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1C1C1E" }}>
            Your TasteMap
          </span>
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 20,
              background: "rgba(52,199,89,0.1)",
              border: "1px solid rgba(52,199,89,0.2)",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: "#16A34A" }}>
              ● Online
            </span>
          </div>
        </div>

        {/* Score */}
        <div
          style={{
            padding: "20px 18px 16px",
            background: "linear-gradient(135deg, #1A7AFF10, #5856D610)",
          }}
        >
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(0,0,0,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            Taste Match Score
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 42,
                fontWeight: 900,
                letterSpacing: "-2px",
                color: "#1C1C1E",
                lineHeight: 1,
              }}
            >
              94%
            </span>
            <span
              style={{
                fontSize: 13,
                color: "#34C759",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              ▲ +3.2%
            </span>
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 6,
              backgroundColor: "rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "94%" }}
              transition={{ delay: 0.9, duration: 1.2, ease }}
              style={{
                height: "100%",
                borderRadius: 6,
                background: "linear-gradient(90deg, #1A7AFF, #5856D6)",
              }}
            />
          </div>
        </div>

        {/* Venue */}
        <div
          style={{
            margin: "12px 18px",
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              height: 88,
              background: "linear-gradient(135deg, #FF6B35, #FF8C42)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
            }}
          >
            🍣
          </div>
          <div
            style={{
              padding: "10px 14px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 2px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1C1C1E",
                }}
              >
                Neo-Tokyo Sushi
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(0,0,0,0.4)" }}>
                0.8km · $$$ · Japanese
              </p>
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={11} fill="#FBBF24" color="#FBBF24" />
              ))}
            </div>
          </div>
        </div>

        {/* Foodies strip */}
        <div
          style={{
            padding: "0 18px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex" }}>
              {["🧑‍🍳", "👩‍🍳", "🍱"].map((e, i) => (
                <div
                  key={i}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: `hsl(${i * 60 + 180},60%,70%)`,
                    border: "2px solid white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    marginLeft: i === 0 ? 0 : -8,
                  }}
                >
                  {e}
                </div>
              ))}
            </div>
            <span
              style={{
                fontSize: 12,
                color: "rgba(0,0,0,0.5)",
                fontWeight: 500,
              }}
            >
              +24 foodies nearby
            </span>
          </div>
          <button
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              background: "linear-gradient(135deg, #1A7AFF, #0057D9)",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              color: "white",
            }}
          >
            Explore
          </button>
        </div>
      </div>

      {/* Glass floating badges */}
      <FloatBadge
        top={-18}
        right={-20}
        emoji="✨"
        title="New Match!"
        sub="Ramona Flowers · 94%"
        delay={0.65}
        ampY={7}
      />
      <FloatBadge
        bottom={-16}
        left={-20}
        emoji="🗺️"
        title="Tour Ready"
        sub="5 venues · 3.2km"
        delay={0.8}
        ampY={5}
      />
    </motion.div>
  );
}

export function PromoHero() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const contentOp = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const hasBg = Boolean(HERO_BG_URL);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* ── Parallax background ── */}
      <motion.div
        style={{
          position: "absolute",
          inset: "-25%",
          y: bgY,
          backgroundImage: hasBg
            ? `url(${HERO_BG_URL})`
            : "linear-gradient(135deg, #060D1F 0%, #0B1A40 40%, #180828 70%, #091524 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      />

      {/* ── Grain texture ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          opacity: 0.45,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
          backgroundSize: "180px",
        }}
      />

      {/* ── Gradient overlay ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          background: hasBg
            ? "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.38) 55%, rgba(0,0,0,0.18) 100%)"
            : "linear-gradient(to bottom right, rgba(0,8,30,0.5) 0%, rgba(0,0,0,0.12) 100%)",
        }}
      />

      {/* ── Ambient glow blobs ── */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "8%",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,122,255,0.22) 0%, transparent 65%)",
          zIndex: 1,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "20%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(88,86,214,0.24) 0%, transparent 65%)",
          zIndex: 1,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Content (parallax drift + fade) ── */}
      <motion.div
        style={{
          y: contentY,
          opacity: contentOp,
          position: "relative",
          zIndex: 5,
          width: "100%",
          paddingTop: 88,
          paddingBottom: 88,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 32px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          {/* ── Left copy ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Badge */}
            <motion.div {...stagger(0)}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 14px",
                  borderRadius: 20,
                  backgroundColor: "rgba(0,122,255,0.2)",
                  border: "1px solid rgba(0,122,255,0.38)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Sparkles size={12} color="#60A5FA" />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#93C5FD",
                    letterSpacing: "0.2px",
                  }}
                >
                  AI-powered food discovery
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...stagger(1)}
              style={{
                margin: 0,
                fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)",
                fontWeight: 900,
                letterSpacing: "-2.5px",
                lineHeight: 1.05,
                color: "white",
              }}
            >
              Discover food,{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #60A5FA, #A78BFA, #F472B6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                save automatically,
              </span>{" "}
              eat your way.
            </motion.h1>

            {/* Sub */}
            <motion.p
              {...stagger(2)}
              style={{
                margin: 0,
                fontSize: 16,
                color: "rgba(255,255,255,0.62)",
                lineHeight: 1.75,
                maxWidth: 460,
              }}
            >
              TasteMap maps your flavour DNA, matches you with the right venues
              and foodies, and builds food tours you&apos;ll actually want to go
              on.
            </motion.p>

            {/* CTAs */}
            <motion.div
              {...stagger(3)}
              style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
            >
              <button
                onClick={() => router.push("/discover")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 26px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #1A7AFF, #0057D9)",
                  border: "none",
                  cursor: "pointer",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 700,
                  boxShadow: "0 6px 28px rgba(0,100,255,0.45)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 12px 36px rgba(0,100,255,0.55)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 6px 28px rgba(0,100,255,0.45)";
                }}
              >
                Get Started <ArrowRight size={15} />
              </button>
              <button
                onClick={() => router.push("/discover")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 22px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.1)",
                  border: "1.5px solid rgba(255,255,255,0.28)",
                  backdropFilter: "blur(8px)",
                  cursor: "pointer",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 600,
                  transition: "background 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.18)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.55)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.28)";
                }}
              >
                Explore Demo
              </button>
            </motion.div>

            {/* Social proof mini */}
            <motion.div
              {...stagger(4)}
              style={{ display: "flex", alignItems: "center", gap: 14 }}
            >
              <div style={{ display: "flex" }}>
                {["🧑‍🍳", "👩‍🍳", "👨‍🍳", "🍱"].map((e, i) => (
                  <div
                    key={i}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: `hsl(${i * 50 + 200},55%,55%)`,
                      border: "2.5px solid rgba(255,255,255,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      marginLeft: i === 0 ? 0 : -10,
                      zIndex: 4 - i,
                    }}
                  >
                    {e}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: "flex", gap: 2, marginBottom: 3 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={11} fill="#FBBF24" color="#FBBF24" />
                  ))}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 500,
                  }}
                >
                  Loved by{" "}
                  <strong style={{ color: "rgba(255,255,255,0.82)" }}>
                    2,400+
                  </strong>{" "}
                  foodies
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Right: mockup ── */}
          <AppMockup />
        </div>
      </motion.div>
    </section>
  );
}
