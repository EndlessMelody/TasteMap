"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { MOODS, CUISINES, GROUPS } from "../constants";

interface StepPreferencesProps {
  mood: string | null;
  setMood: (v: string) => void;
  cuisines: string[];
  toggleCuisine: (v: string) => void;
  group: string | null;
  setGroup: (v: string) => void;
}

export function StepPreferences({
  mood,
  setMood,
  cuisines,
  toggleCuisine,
  group,
  setGroup,
}: StepPreferencesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      style={{ display: "flex", flexDirection: "column", gap: 32 }}
    >
      {/* Mood */}
      <div>
        <h3
          style={{ fontSize: 15, fontWeight: 800, color: "#1C1C1E", marginBottom: 12 }}
        >
          What&apos;s the vibe today?
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {MOODS.map((m) => {
            const selected = mood === m.id;
            return (
              <motion.button
                key={m.id}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMood(m.id)}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "18px 20px",
                  borderRadius: 20,
                  textAlign: "left",
                  border: selected
                    ? `2px solid ${m.accentColor}`
                    : "1px solid rgba(255,255,255,0.8)",
                  background: selected
                    ? m.gradient
                    : "linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.3))",
                  backdropFilter: "blur(16px)",
                  boxShadow: selected
                    ? `0 12px 32px ${m.accentColor}33, inset 0 2px 4px rgba(255,255,255,0.4)`
                    : "0 4px 16px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1)",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                  overflow: "hidden",
                }}
              >
                <motion.span
                  animate={selected ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    right: -10,
                    top: "40%",
                    transform: "translateY(-50%)",
                    fontSize: 68,
                    opacity: selected ? 0.25 : 0.04,
                    transition: "opacity 0.4s",
                    pointerEvents: "none",
                    filter: selected ? "blur(4px)" : "blur(0px)",
                  }}
                >
                  {m.emoji}
                </motion.span>
                <span
                  style={{
                    color: selected ? m.accentColor : "#8E8E93",
                    transition: "color 0.3s",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {m.icon}
                </span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#1C1C1E", margin: 0 }}>
                    {m.label}
                  </p>
                  <p style={{ fontSize: 12, color: "#8E8E93", margin: 0 }}>{m.desc}</p>
                </div>
                {selected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ marginLeft: "auto", zIndex: 1 }}
                  >
                    <CheckCircle size={18} color={m.accentColor} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Cuisines */}
      <div>
        <h3
          style={{ fontSize: 15, fontWeight: 800, color: "#1C1C1E", marginBottom: 4 }}
        >
          Cuisine preferences{" "}
          <span style={{ color: "#8E8E93", fontWeight: 500, fontSize: 13 }}>(pick any)</span>
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {CUISINES.map((c) => {
            const selected = cuisines.includes(c.label);
            return (
              <motion.button
                key={c.label}
                whileTap={{ scale: 0.93 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => toggleCuisine(c.label)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 24,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                  ...(selected
                    ? {
                        backgroundColor: c.color,
                        color: "#fff",
                        boxShadow: `0 8px 20px ${c.color}55, inset 0 1px 1px rgba(255,255,255,0.3)`,
                      }
                    : {
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))",
                        backdropFilter: "blur(8px)",
                        color: "#3C3C43",
                        boxShadow:
                          "0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)",
                        border: "1px solid rgba(255,255,255,0.6)",
                      }),
                }}
              >
                <span style={{ fontSize: 16 }}>{c.emoji}</span>
                {c.label}
                <AnimatePresence>
                  {selected && (
                    <motion.div
                      initial={{ scale: 0, width: 0, opacity: 0 }}
                      animate={{ scale: 1, width: "auto", opacity: 1 }}
                      exit={{ scale: 0, width: 0, opacity: 0 }}
                      style={{ overflow: "hidden", display: "flex", alignItems: "center" }}
                    >
                      <CheckCircle size={14} color="white" style={{ marginLeft: 4 }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Group size */}
      <div>
        <h3
          style={{ fontSize: 15, fontWeight: 800, color: "#1C1C1E", marginBottom: 12 }}
        >
          Who&apos;s coming?
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {GROUPS.map((g) => {
            const selected = group === g.id;
            return (
              <motion.button
                key={g.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGroup(g.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "16px 8px",
                  borderRadius: 18,
                  border: selected
                    ? "2px solid #ff6b35"
                    : "1px solid rgba(255,255,255,0.8)",
                  background: selected
                    ? "linear-gradient(135deg, #FFF0E6, #FFE8D6)"
                    : "linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.3))",
                  backdropFilter: "blur(12px)",
                  boxShadow: selected
                    ? "0 10px 24px rgba(255,107,53,0.3), inset 0 2px 4px rgba(255,255,255,0.5)"
                    : "0 4px 12px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1)",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                }}
              >
                <span style={{ fontSize: 28 }}>{g.emoji}</span>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#1C1C1E", margin: 0 }}>
                  {g.label}
                </p>
                <p style={{ fontSize: 10, color: "#8E8E93", margin: 0 }}>{g.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
