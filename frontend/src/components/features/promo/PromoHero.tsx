"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Users, Star } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.08 + i * 0.1, duration: 0.6, ease },
});

// ─── Taste radar ────────────────────────────────────────────────────────────
const TASTE_DIMS = [
  { label: "Umami",   value: 0.88 },
  { label: "Spicy",   value: 0.72 },
  { label: "Savory",  value: 0.90 },
  { label: "Sweet",   value: 0.45 },
  { label: "Bitter",  value: 0.35 },
  { label: "Sour",    value: 0.60 },
  { label: "Salty",   value: 0.65 },
  { label: "Aroma",   value: 0.78 },
];

const CX = 200, CY = 200, MAX_R = 128;
const N = TASTE_DIMS.length;

function polar(index: number, value: number) {
  const angle = (2 * Math.PI * index) / N - Math.PI / 2;
  return {
    x: CX + value * MAX_R * Math.cos(angle),
    y: CY + value * MAX_R * Math.sin(angle),
  };
}

function polyPath(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
}

function TasteRadar() {
  const profilePts = TASTE_DIMS.map((d, i) => polar(i, d.value));
  const profilePath = polyPath(profilePts);

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const gridPaths = gridLevels.map((lvl) =>
    polyPath(TASTE_DIMS.map((_, i) => polar(i, lvl)))
  );
  const spokeEnds = TASTE_DIMS.map((_, i) => polar(i, 1.0));
  const labelPos = TASTE_DIMS.map((d, i) => ({ ...d, pos: polar(i, 1.40) }));

  return (
    <svg
      width="400"
      height="400"
      viewBox="0 0 400 400"
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id="rFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FF5500" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FF5500" stopOpacity="0.03" />
        </radialGradient>
        <filter id="rGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid rings */}
      {gridPaths.map((path, i) => (
        <path
          key={i}
          d={path}
          fill="none"
          stroke={
            i === gridLevels.length - 1
              ? "rgba(0,0,0,0.12)"
              : "rgba(0,0,0,0.07)"
          }
          strokeWidth="1"
        />
      ))}

      {/* Spokes */}
      {spokeEnds.map((p, i) => (
        <line
          key={i}
          x1={CX} y1={CY}
          x2={p.x} y2={p.y}
          stroke="rgba(0,0,0,0.07)"
          strokeWidth="1"
        />
      ))}

      {/* Profile fill */}
      <motion.path
        d={profilePath}
        fill="url(#rFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 1.0 }}
      />

      {/* Profile stroke */}
      <motion.path
        d={profilePath}
        fill="none"
        stroke="#FF5500"
        strokeWidth="2"
        strokeLinejoin="round"
        filter="url(#rGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.9, duration: 1.6, ease: "easeOut" }}
      />

      {/* Vertex dots */}
      {profilePts.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x} cy={p.y} r="4.5"
          fill="#FF5500"
          stroke="#FFFFFF"
          strokeWidth="2"
          filter="url(#rGlow)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.05 + i * 0.07, duration: 0.35 }}
        />
      ))}

      {/* Labels */}
      {labelPos.map((d, i) => (
        <text
          key={i}
          x={d.pos.x}
          y={d.pos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(24,22,15,0.42)"
          fontSize="11"
          fontWeight="600"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.3"
        >
          {d.label}
        </text>
      ))}

      {/* Center */}
      <circle cx={CX} cy={CY} r="3" fill="rgba(255,85,0,0.55)" />
    </svg>
  );
}

// ─── Floating stat badge ──────────────────────────────────────────────────────
function StatBadge({
  icon,
  value,
  label,
  top,
  left,
  right,
  bottom,
  delay = 0.8,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.55, ease }}
      style={{ position: "absolute", top, left, right, bottom, zIndex: 5 }}
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{
          duration: 3.5 + delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          backgroundColor: "rgba(255,252,247,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: 13,
          padding: "10px 14px",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,85,0,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: 20, display: "flex", alignItems: "center" }}>
          {icon}
        </span>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 800,
              color: "#18160F",
              letterSpacing: "-0.4px",
            }}
          >
            {value}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 10,
              color: "rgba(24,22,15,0.42)",
              fontWeight: 500,
            }}
          >
            {label}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function PromoHero() {
  const router = useRouter();

  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "transparent",
        overflow: "hidden",
      }}
    >
      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", width: "100%" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 32px",
            paddingTop: 64,
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 72,
            alignItems: "center",
          }}
        >
          {/* ── Left: copy ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            {/* Eyebrow */}
            <motion.div {...stagger(0)}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "5px 12px 5px 6px",
                  borderRadius: 20,
                  backgroundColor: "rgba(255,85,0,0.08)",
                  border: "1px solid rgba(255,85,0,0.2)",
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: "#FF5500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={11} color="white" />
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#E04A00",
                    letterSpacing: "0.3px",
                  }}
                >
                  Your Flavour DNA, Mapped
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...stagger(1)}
              style={{
                margin: 0,
                fontSize: "clamp(2.5rem, 4vw, 3.7rem)",
                fontWeight: 900,
                letterSpacing: "-2.5px",
                lineHeight: 1.05,
                color: "#18160F",
              }}
            >
              Discover food{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #FF5500, #FFB347)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                that fits
              </span>{" "}
              your exact taste.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              {...stagger(2)}
              style={{
                margin: 0,
                fontSize: 16,
                color: "rgba(24,22,15,0.55)",
                lineHeight: 1.78,
                maxWidth: 440,
              }}
            >
              TasteMap profiles your palate across 8 taste dimensions — then
              connects you to the right venues, tours, and foodies. No
              guesswork. Just food you&apos;ll love.
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
                  padding: "13px 24px",
                  borderRadius: 10,
                  background: "#FF5500",
                  border: "none",
                  cursor: "pointer",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 700,
                  boxShadow: "0 6px 28px rgba(255,85,0,0.38)",
                  transition: "transform 0.15s, box-shadow 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 38px rgba(255,85,0,0.52)";
                  (e.currentTarget as HTMLElement).style.background = "#FF6B35";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 28px rgba(255,85,0,0.38)";
                  (e.currentTarget as HTMLElement).style.background = "#FF5500";
                }}
              >
                Start for free <ArrowRight size={15} />
              </button>
              <button
                onClick={() => router.push("/discover")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 22px",
                  borderRadius: 10,
                  background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.12)",
                  cursor: "pointer",
                  color: "rgba(24,22,15,0.72)",
                  fontSize: 15,
                  fontWeight: 600,
                  transition: "background 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.08)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.05)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.12)";
                }}
              >
                See how it works
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              {...stagger(4)}
              style={{ display: "flex", alignItems: "center", gap: 16 }}
            >
              <div style={{ display: "flex" }}>
                {["#FF5500", "#FFB347", "#4ADE80", "#60A5FA"].map((color, i) => (
                  <div
                    key={i}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      backgroundColor: color,
                      border: "2px solid #FFFCF7",
                      marginLeft: i === 0 ? 0 : -9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 4 - i,
                    }}
                  >
                    <Users size={11} color="white" />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={11} fill="#FFB347" color="#FFB347" />
                  ))}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "rgba(24,22,15,0.48)",
                    fontWeight: 500,
                  }}
                >
                  Loved by{" "}
                  <strong style={{ color: "#18160F", fontWeight: 700 }}>
                    2,400+
                  </strong>{" "}
                  foodies
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Right: Taste radar ── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.8, ease }}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Glow behind radar */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle, rgba(255,85,0,0.1) 0%, transparent 68%)",
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />

            {/* Label pill at top */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                padding: "4px 12px",
                borderRadius: 20,
                backgroundColor: "rgba(255,85,0,0.08)",
                border: "1px solid rgba(255,85,0,0.16)",
                zIndex: 4,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#E04A00",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                }}
              >
                Your taste profile
              </span>
            </div>

            {/* Radar SVG */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <TasteRadar />
            </div>

            {/* Floating badges */}
            <StatBadge
              icon={<Zap size={18} color="#FF5500" fill="#FF5500" />}
              value="94%"
              label="Taste match accuracy"
              top={48}
              right={-16}
              delay={1.2}
            />
            <StatBadge
              icon={<Users size={18} color="#4ADE80" />}
              value="2,400+"
              label="Active foodies"
              bottom={56}
              left={-16}
              delay={1.45}
            />
          </motion.div>
        </div>
      </div>

      {/* ── Bottom scroll ticker ── */}
      <div
        style={{
          width: "100%",
          borderTop: "1px solid rgba(0,0,0,0.07)",
          overflow: "hidden",
          padding: "13px 0",
          flexShrink: 0,
        }}
      >
        <style>{`
          @keyframes hero-ticker {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>
        <div
          style={{
            display: "flex",
            animation: "hero-ticker 24s linear infinite",
            width: "max-content",
          }}
        >
          {[...Array(2)].map((_, ri) => (
            <div key={ri} style={{ display: "flex", alignItems: "center" }}>
              {[
                "DISCOVER YOUR TASTE",
                "FIND YOUR TRIBE",
                "BUILD FOOD TOURS",
                "EAT TOGETHER",
                "MAP YOUR PALETTE",
                "TASTE DNA UNLOCKED",
              ].map((text, i) => (
                <React.Fragment key={i}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "rgba(24,22,15,0.28)",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      padding: "0 22px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {text}
                  </span>
                  <span style={{ color: "#FF5500", fontSize: 7, opacity: 0.4 }}>
                    ◆
                  </span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
