"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Zap,
  RefreshCw,
  Trash2,
  ArrowRight,
  CheckCircle,
  Brain,
  Utensils,
  Navigation,
} from "lucide-react";
import type { ItineraryStop } from "./types";
import { STOP_CATEGORY_ICON } from "./constants";

interface StopCardProps {
  stop: ItineraryStop;
  index: number;
  total: number;
  active: boolean;
  swapping: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSwap: () => void;
  onRemove: () => void;
}

export function StopCard({
  stop,
  index,
  total,
  active,
  swapping,
  onHover,
  onLeave,
  onSwap,
  onRemove,
}: StopCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{ display: "flex", gap: 12 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Timeline dot */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 36,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: stop.accent,
            boxShadow: active ? `0 4px 16px ${stop.accent}55` : `0 2px 8px ${stop.accent}33`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            transition: "box-shadow 0.2s",
            flexShrink: 0,
          }}
        >
          {STOP_CATEGORY_ICON[stop.category] ?? <Utensils size={16} />}
        </div>
        {index < total - 1 && (
          <div
            style={{
              width: 2,
              flex: 1,
              background: active
                ? `linear-gradient(to bottom, ${stop.accent}88, rgba(229,229,234,0.3))`
                : "#E5E5EA",
              margin: "4px 0",
              minHeight: 16,
              borderRadius: 2,
            }}
          />
        )}
      </div>

      {/* Card */}
      <div style={{ flex: 1, paddingBottom: 12, minWidth: 0 }}>
        <AnimatePresence mode="wait">
          {swapping ? (
            <motion.div
              key="swapping"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                borderRadius: 18,
                overflow: "hidden",
                border: "1px solid #E5E5EA",
                backgroundColor: "#F9F9FB",
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw size={22} color="#ff6b35" />
              </motion.div>
              <p style={{ fontSize: 12, color: "#8E8E93", fontWeight: 600 }}>
                Finding a better match...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={stop.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, boxShadow: `0 12px 32px ${stop.accent}33` }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor: "#fff",
                borderRadius: 18,
                overflow: "hidden",
                border: active ? `1.5px solid ${stop.accent}66` : "1px solid rgba(0,0,0,0.06)",
                boxShadow: active
                  ? `0 12px 32px ${stop.accent}25`
                  : "0 4px 16px rgba(0,0,0,0.03)",
                transition: "border 0.3s",
              }}
            >
              {/* Image */}
              <div style={{ height: 110, position: "relative", overflow: "hidden" }}>
                <img
                  src={stop.img}
                  alt={stop.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 55%)",
                  }}
                />
                <div style={{ position: "absolute", bottom: 10, left: 12 }}>
                  <p style={{ color: "white", fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>
                    {stop.name}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>{stop.category}</p>
                </div>
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    backgroundColor: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(8px)",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                  }}
                >
                  {stop.time}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: "10px 14px 12px" }}>
                <p
                  style={{
                    fontSize: 12,
                    color: "#636366",
                    fontStyle: "italic",
                    lineHeight: 1.5,
                  }}
                >
                  &ldquo;{stop.reason}&rdquo;
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 12,
                      color: "#8E8E93",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <MapPin size={11} />
                      {stop.address.split(",")[0]}
                    </span>
                    <span style={{ fontWeight: 700, color: "#1C1C1E" }}>{stop.cost}</span>
                    {stop.lat && stop.lng && (
                      <a
                        href={`https://maps.google.com/?q=${stop.lat},${stop.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#007AFF",
                          textDecoration: "none",
                        }}
                      >
                        <Navigation size={10} /> Maps
                      </a>
                    )}
                  </div>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 20,
                      backgroundColor: "#FFF3C4",
                      color: "#CC8B00",
                    }}
                  >
                    <Zap size={10} fill="currentColor" />+{stop.xp} XP
                  </span>
                </div>

                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          marginTop: 10,
                          paddingTop: 10,
                          borderTop: "1px solid #F2F2F7",
                        }}
                      >
                        <button
                          onClick={onSwap}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "5px 12px",
                            borderRadius: 20,
                            border: "1.5px solid #ff6b35",
                            backgroundColor: "rgba(255,107,53,0.06)",
                            color: "#ff6b35",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <RefreshCw size={11} /> Swap
                        </button>
                        <button
                          onClick={onRemove}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "5px 12px",
                            borderRadius: 20,
                            border: "1.5px solid #FF3B30",
                            backgroundColor: "rgba(255,59,48,0.05)",
                            color: "#FF3B30",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                        {stop.lat && stop.lng && (
                          <a
                            href={`https://maps.google.com/?q=${stop.lat},${stop.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "5px 12px",
                              borderRadius: 20,
                              border: "1.5px solid #007AFF",
                              backgroundColor: "rgba(0,122,255,0.06)",
                              color: "#007AFF",
                              fontSize: 12,
                              fontWeight: 700,
                              textDecoration: "none",
                            }}
                          >
                            <Navigation size={11} /> Maps
                          </a>
                        )}
                        <span
                          style={{
                            marginLeft: "auto",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#34C759",
                          }}
                        >
                          <CheckCircle size={13} /> Keep
                        </span>
                      </div>
                      <div
                        style={{
                          marginTop: 8,
                          padding: "8px 12px",
                          borderRadius: 12,
                          backgroundColor: "rgba(0,122,255,0.04)",
                          border: "1px solid rgba(0,122,255,0.12)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginBottom: 4,
                          }}
                        >
                          <Brain size={11} color="#ff6b35" />
                          <span style={{ fontSize: 10, color: "#ff6b35", fontWeight: 700 }}>
                            Why this stop
                          </span>
                        </div>
                        <p style={{ fontSize: 11, color: "#636366", lineHeight: 1.6 }}>
                          Matched: <b style={{ color: "#3C3C43" }}>{stop.category}</b> preference ·
                          budget fits at <b style={{ color: "#3C3C43" }}>{stop.cost}</b>
                          {stop.travelToNext
                            ? ` · ${stop.travelToNext} to next stop`
                            : " · final stop of route"}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {stop.travelToNext && !active && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: "1px solid #F2F2F7",
                    }}
                  >
                    <ArrowRight size={11} color="#8E8E93" />
                    <span style={{ fontSize: 11, color: "#8E8E93" }}>
                      {stop.travelToNext} to next stop
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
