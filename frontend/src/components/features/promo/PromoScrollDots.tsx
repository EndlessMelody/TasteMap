"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  "Home",
  "Features",
  "Why Us",
  "How It Works",
  "Reviews",
  "Pricing",
  "Get Started",
];

const TOTAL = SECTIONS.length;

function getContainer(): HTMLElement | null {
  return document.getElementById("promo-scroll-container");
}

export function PromoScrollDots() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered]         = useState<number | null>(null);
  const activeRef = useRef(0);

  // ── Track scroll position → update active dot ───────────────────────────────
  useEffect(() => {
    const container = getContainer();
    if (!container) return;

    const onScroll = () => {
      const idx = Math.round(container.scrollTop / container.clientHeight);
      const clamped = Math.min(Math.max(idx, 0), TOTAL - 1);
      if (clamped !== activeRef.current) {
        activeRef.current = clamped;
        setActiveIndex(clamped);
      }
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  // ── Click dot → scroll to section ───────────────────────────────────────────
  const goTo = useCallback((idx: number) => {
    const container = getContainer();
    if (!container) return;
    container.scrollTo({ top: idx * container.clientHeight, behavior: "smooth" });
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        right: 22,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "center",
      }}
    >
      {/* Background progress line */}
      <div
        style={{
          position: "absolute",
          top: 10, bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1,
          backgroundColor: "rgba(0,0,0,0.08)",
          zIndex: 0,
        }}
      />
      {/* Active progress fill */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1,
          backgroundColor: "#FF5500",
          zIndex: 0,
          height: `${(activeIndex / (TOTAL - 1)) * 100}%`,
          transition: "height 0.45s cubic-bezier(0.16,1,0.3,1)",
        }}
      />

      {SECTIONS.map((label, i) => (
        <div
          key={i}
          style={{ position: "relative", display: "flex", alignItems: "center", zIndex: 1 }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {hovered === i && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute",
                  right: "calc(100% + 10px)",
                  padding: "5px 11px",
                  borderRadius: 8,
                  backgroundColor: "rgba(255,252,247,0.96)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  color: "#18160F",
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  pointerEvents: "none",
                }}
              >
                {label}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dot */}
          <button
            onClick={() => goTo(i)}
            aria-label={`Go to ${label}`}
            style={{
              padding: 0, border: "none", background: "none",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              width: 20, height: 20,
            }}
          >
            <motion.div
              animate={{
                width:  i === activeIndex ? 10 : hovered === i ? 7 : 5,
                height: i === activeIndex ? 10 : hovered === i ? 7 : 5,
                backgroundColor:
                  i === activeIndex ? "#FF5500"
                  : hovered === i   ? "rgba(0,0,0,0.4)"
                  : "rgba(0,0,0,0.18)",
                boxShadow: i === activeIndex ? "0 0 0 3px rgba(255,85,0,0.18)" : "none",
              }}
              transition={{ duration: 0.2 }}
              style={{ borderRadius: "50%" }}
            />
          </button>
        </div>
      ))}
    </div>
  );
}
