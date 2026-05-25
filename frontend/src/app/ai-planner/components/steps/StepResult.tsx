"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Zap, RotateCcw, Send, Map, ChevronLeft } from "lucide-react";
import type { ItineraryStop } from "../types";
import { SWAP_POOL } from "../constants";
import { RouteMap } from "../RouteMap";
import { StopCard } from "../StopCard";

interface StepResultProps {
  stops: ItineraryStop[];
  onRegen: () => void;
  onBack: () => void;
}

export function StepResult({ stops: initialStops, onRegen, onBack }: StepResultProps) {
  const router = useRouter();
  const [stops, setStops] = useState<ItineraryStop[]>(initialStops);
  const [activeStop, setActiveStop] = useState<number | null>(null);
  const [swapping, setSwapping] = useState<number | null>(null);
  const [pool, setPool] = useState([...SWAP_POOL]);

  const totalXp = stops.reduce((s, x) => s + x.xp, 0);

  const handleSwap = async (i: number) => {
    setSwapping(i);
    await new Promise((r) => setTimeout(r, 1400));
    const next = { ...pool[0], time: stops[i].time, travelToNext: stops[i].travelToNext };
    setPool((p) => [...p.slice(1), p[0]]);
    setStops((prev) => prev.map((s, idx) => (idx === i ? next : s)));
    setSwapping(null);
  };

  const handleRemove = (i: number) => setStops((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FAF8F5",
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Result header */}
      <div
        style={{
          flexShrink: 0,
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          backgroundColor: "rgba(250,248,245,0.92)",
          backdropFilter: "blur(20px)",
        }}
      >
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "6px 12px",
            borderRadius: 10,
            border: "1.5px solid rgba(0,0,0,0.08)",
            backgroundColor: "rgba(255,255,255,0.8)",
            color: "#636366",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          <ChevronLeft size={15} /> Back
        </motion.button>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 17, fontWeight: 900, color: "#1C1C1E", margin: 0, letterSpacing: -0.3 }}>
            Your Plan
          </h1>
          <p style={{ fontSize: 11, color: "#8E8E93", margin: 0 }}>
            {stops.length} stops · Ho Chi Minh City
          </p>
        </div>

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 10,
            fontWeight: 800,
            padding: "4px 10px",
            borderRadius: 20,
            background: "linear-gradient(135deg, #FF6B35, #A855F7)",
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <Sparkles size={9} /> AI Generated
        </span>
      </div>

      {/* Scrollable content */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "20px 24px 40px" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Hero banner */}
            <div
              style={{
                borderRadius: 24,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #0F0F12 0%, #1A1A2E 40%, #16213E 70%, #0F3460 100%)",
                  padding: "22px 24px",
                  position: "relative",
                }}
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1, 0.5] }}
                    transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
                    style={{
                      position: "absolute",
                      width: 3,
                      height: 3,
                      borderRadius: "50%",
                      backgroundColor: "#FFC107",
                      top: `${15 + Math.random() * 70}%`,
                      left: `${10 + Math.random() * 80}%`,
                    }}
                  />
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", zIndex: 1 }}>
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: "linear-gradient(135deg, rgba(255,193,7,0.22), rgba(255,107,53,0.22))",
                      backdropFilter: "blur(8px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      border: "1px solid rgba(255,193,7,0.18)",
                    }}
                  >
                    <Map size={22} color="#FFC107" />
                  </motion.div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: 19,
                        fontWeight: 900,
                        color: "white",
                        lineHeight: 1.2,
                        margin: "0 0 4px",
                        letterSpacing: -0.3,
                      }}
                    >
                      Afternoon Street Food Sprint
                    </h3>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                      {stops.length} stops · ~4.5 hours · Ho Chi Minh City
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 18, fontWeight: 900, color: "white", margin: "0 0 4px" }}>
                      305,000đ
                    </p>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        padding: "2px 8px",
                        borderRadius: 12,
                        backgroundColor: "rgba(255,193,7,0.15)",
                        color: "#FFC107",
                        fontWeight: 800,
                        fontSize: 12,
                      }}
                    >
                      <Zap size={10} fill="currentColor" />+{totalXp} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-column layout */}
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              {/* Left: timeline */}
              <div style={{ flex: "0 0 460px", display: "flex", flexDirection: "column" }}>
                {stops.map((stop, i) => (
                  <StopCard
                    key={`${stop.name}-${i}`}
                    stop={stop}
                    index={i}
                    total={stops.length}
                    active={activeStop === i}
                    swapping={swapping === i}
                    onHover={() => setActiveStop(i)}
                    onLeave={() => setActiveStop(null)}
                    onSwap={() => handleSwap(i)}
                    onRemove={() => handleRemove(i)}
                  />
                ))}
              </div>

              {/* Right: map + stats */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  position: "sticky",
                  top: 0,
                  minWidth: 0,
                }}
              >
                <RouteMap stops={stops} activeStop={activeStop} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Total Stops", value: `${stops.length} places`, color: "#ff6b35", emoji: "📍" },
                    { label: "Est. Duration", value: "~4.5 hours", color: "#FF9500", emoji: "⏱️" },
                    { label: "Budget", value: "305,000đ", color: "#34C759", emoji: "💰" },
                    { label: "XP Earned", value: `+${totalXp} XP`, color: "#A855F7", emoji: "⚡" },
                  ].map(({ label, value, color, emoji }) => (
                    <div
                      key={label}
                      style={{
                        backgroundColor: "rgba(255,255,255,0.85)",
                        backdropFilter: "blur(8px)",
                        borderRadius: 16,
                        padding: "14px 16px",
                        border: "1px solid rgba(0,0,0,0.04)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 13 }}>{emoji}</span>
                        <p
                          style={{
                            fontSize: 9,
                            color: "#8E8E93",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            margin: 0,
                          }}
                        >
                          {label}
                        </p>
                      </div>
                      <p style={{ fontSize: 16, fontWeight: 900, color, margin: 0 }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, paddingBottom: 8 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onRegen}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 20px",
                  borderRadius: 16,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1C1C1E",
                  backgroundColor: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(8px)",
                  border: "1.5px solid rgba(0,0,0,0.06)",
                  cursor: "pointer",
                }}
              >
                <RotateCcw size={14} /> Regenerate
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 20px",
                  borderRadius: 16,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#636366",
                  backgroundColor: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(8px)",
                  border: "1.5px solid rgba(0,0,0,0.06)",
                  cursor: "pointer",
                }}
              >
                <Send size={14} /> Share
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const ids = stops.filter((s) => s.id).map((s) => s.id).join(",");
                  try { localStorage.setItem("tastemap_ai_plan", JSON.stringify(stops)); } catch {}
                  router.push(`/explore${ids ? `?spots=${ids}` : ""}`);
                }}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "13px 20px",
                  borderRadius: 16,
                  fontSize: 15,
                  fontWeight: 800,
                  color: "white",
                  background: "linear-gradient(135deg, #FF6B35, #A855F7)",
                  boxShadow: "0 8px 24px rgba(255,107,53,0.28)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Map size={15} /> View on Map
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
