"use client";

import { motion } from "framer-motion";
import { DURATIONS, BUDGETS } from "../constants";

interface StepSettingsProps {
  duration: string;
  setDuration: (v: string) => void;
  budget: string;
  setBudget: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
}

const QUICK_LOCATIONS = [
  { name: "District 1", emoji: "📍" },
  { name: "Bình Thạnh", emoji: "🏙️" },
  { name: "Phú Nhuận", emoji: "🌿" },
  { name: "Thủ Đức", emoji: "🏫" },
];

export function StepSettings({
  duration,
  setDuration,
  budget,
  setBudget,
  location,
  setLocation,
}: StepSettingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      style={{ display: "flex", flexDirection: "column", gap: 32 }}
    >
      {/* Duration */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1C1C1E", marginBottom: 12 }}>
          How long?
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {DURATIONS.map((d) => {
            const selected = duration === d.label;
            return (
              <motion.button
                key={d.label}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDuration(d.label)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "16px 8px",
                  borderRadius: 18,
                  border: selected ? "2px solid #ff6b35" : "1px solid rgba(255,255,255,0.8)",
                  background: selected
                    ? "linear-gradient(135deg, #1C1C1E, #2C2C2E)"
                    : "linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.3))",
                  backdropFilter: "blur(12px)",
                  boxShadow: selected
                    ? "0 10px 24px rgba(28,28,30,0.35), inset 0 2px 4px rgba(255,255,255,0.1)"
                    : "0 4px 12px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1)",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                }}
              >
                <span style={{ fontSize: 24 }}>{d.icon}</span>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: selected ? "#fff" : "#1C1C1E",
                    margin: 0,
                  }}
                >
                  {d.label}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: selected ? "rgba(255,255,255,0.5)" : "#8E8E93",
                    margin: 0,
                  }}
                >
                  {d.desc}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Budget */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1C1C1E", marginBottom: 12 }}>
          Budget per person
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {BUDGETS.map((b) => {
            const selected = budget === b.label;
            return (
              <motion.button
                key={b.label}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBudget(b.label)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "16px 8px",
                  borderRadius: 18,
                  border: selected ? "2px solid #34C759" : "1px solid rgba(255,255,255,0.8)",
                  background: selected
                    ? "linear-gradient(135deg, #34C759, #2DB550)"
                    : "linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.3))",
                  backdropFilter: "blur(12px)",
                  boxShadow: selected
                    ? "0 10px 24px rgba(52,199,89,0.35), inset 0 2px 4px rgba(255,255,255,0.3)"
                    : "0 4px 12px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1)",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                }}
              >
                <span style={{ fontSize: 24 }}>{b.icon}</span>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: selected ? "#fff" : "#1C1C1E",
                    margin: 0,
                  }}
                >
                  {b.label}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: selected ? "rgba(255,255,255,0.6)" : "#8E8E93",
                    margin: 0,
                  }}
                >
                  {b.desc}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1C1C1E", marginBottom: 12 }}>
          Starting point
        </h3>
        <div style={{ position: "relative" }}>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. District 1, Ho Chi Minh City"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 18,
              fontSize: 15,
              outline: "none",
              fontFamily: "inherit",
              backgroundColor: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(8px)",
              border: "1.5px solid #E5E5EA",
              color: "#1C1C1E",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#ff6b35";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,107,53,0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E5E5EA";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {QUICK_LOCATIONS.map((loc) => {
            const selected = location === loc.name;
            return (
              <motion.button
                key={loc.name}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setLocation(loc.name)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor: selected ? "#FFF3E0" : "rgba(255,255,255,0.7)",
                  color: selected ? "#FF9500" : "#8E8E93",
                  boxShadow: selected
                    ? "0 2px 8px rgba(255,149,0,0.2)"
                    : "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <span>{loc.emoji}</span>
                {loc.name}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
