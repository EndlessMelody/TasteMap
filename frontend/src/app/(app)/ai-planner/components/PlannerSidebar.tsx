"use client";

import { motion } from "framer-motion";
import { ChevronsLeft, ChevronsRight, History, Star, Wind, Droplets } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { MOODS, GROUPS, RECENT_PLANS } from "./constants";

interface PlannerSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mood: string | null;
  cuisines: string[];
  group: string | null;
  duration: string;
  budget: string;
  location: string;
  step: number;
}

export function PlannerSidebar({
  collapsed,
  onToggle,
  mood,
  cuisines,
  group,
  duration,
  budget,
  location,
  step,
}: PlannerSidebarProps) {
  const { weather, loading: weatherLoading } = useWeather();

  const fields = [
    { key: "Mood", value: mood ? (MOODS.find((m) => m.id === mood)?.label ?? null) : null },
    {
      key: "Cuisines",
      value:
        cuisines.length > 0
          ? cuisines.slice(0, 2).join(", ") + (cuisines.length > 2 ? ` +${cuisines.length - 2}` : "")
          : null,
    },
    { key: "Group", value: group ? (GROUPS.find((g) => g.id === group)?.label ?? null) : null },
    ...(step >= 2
      ? [
          { key: "Duration", value: duration || null },
          { key: "Budget", value: budget || null },
          { key: "Location", value: location || null },
        ]
      : []),
  ];

  const filled = fields.filter((f) => f.value).length;
  const total = step === 1 ? 3 : 6;
  const pct = Math.round((filled / total) * 100);

  return (
    <motion.div
      animate={{ width: collapsed ? 56 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        flexShrink: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        overflowY: "hidden",
        padding: collapsed ? "16px 0" : "16px 14px",
        borderLeft: "1px solid rgba(0,0,0,0.05)",
        backgroundColor: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(16px)",
        gap: 10,
      }}
    >
      {/* Toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? 0 : "0 4px",
          marginBottom: collapsed ? 0 : 4,
        }}
      >
        {!collapsed && (
          <span style={{ fontSize: 13, fontWeight: 800, color: "#1C1C1E" }}>Workspace</span>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: collapsed ? "rgba(255,255,255,0.9)" : "transparent",
            border: collapsed ? "1px solid rgba(0,0,0,0.08)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {collapsed ? (
            <ChevronsLeft size={15} color="#636366" />
          ) : (
            <ChevronsRight size={15} color="#8E8E93" />
          )}
        </motion.button>
      </div>

      {/* Collapsed icon rail */}
      {collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}
        >
          {weather && (
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              title={`${weather.temp}° ${weather.label}`}
              style={{
                width: 38,
                height: 38,
                borderRadius: 14,
                background: weather.outdoor
                  ? "linear-gradient(135deg, rgba(255,193,7,0.15), rgba(255,149,0,0.1))"
                  : "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))",
                border: weather.outdoor
                  ? "1px solid rgba(255,193,7,0.3)"
                  : "1px solid rgba(59,130,246,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              }}
            >
              {weather.emoji}
            </motion.div>
          )}
          <motion.div
            whileHover={{ scale: 1.1 }}
            title="Recent Plans"
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              backgroundColor: "rgba(0,122,255,0.08)",
              border: "1px solid rgba(0,122,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <History size={18} color="#007AFF" />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            title="Live Plan Preview"
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              backgroundColor: "rgba(255,107,53,0.08)",
              border: "1px solid rgba(255,107,53,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Star size={18} color="#FF6B35" />
          </motion.div>
        </motion.div>
      )}

      {/* Expanded state */}
      {!collapsed && (
        <>
          {/* Weather */}
          {(step === 1 || step === 2) && (
            <div
              style={{
                borderRadius: 18,
                padding: "14px",
                flexShrink: 0,
                background: weatherLoading
                  ? "rgba(255,255,255,0.6)"
                  : weather?.outdoor
                  ? "linear-gradient(135deg, rgba(255,193,7,0.1), rgba(255,149,0,0.07))"
                  : "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.06))",
                border: weatherLoading
                  ? "1px solid rgba(0,0,0,0.05)"
                  : weather?.outdoor
                  ? "1px solid rgba(255,193,7,0.2)"
                  : "1px solid rgba(59,130,246,0.18)",
              }}
            >
              {weatherLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "2px solid #FF9500",
                      borderTopColor: "transparent",
                    }}
                  />
                  <span style={{ fontSize: 11, color: "#8E8E93" }}>Getting local weather...</span>
                </div>
              ) : weather ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#8E8E93", margin: "0 0 1px" }}>
                        Right Now in
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: "#1C1C1E",
                          margin: 0,
                          maxWidth: 160,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {weather.locationName}
                      </p>
                    </div>
                    <span style={{ fontSize: 24, lineHeight: 1 }}>{weather.emoji}</span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}
                  >
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#1C1C1E", lineHeight: 1 }}>
                      {weather.temp}°
                    </span>
                    <span style={{ fontSize: 11, color: "#636366", fontWeight: 600 }}>
                      {weather.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#8E8E93" }}>
                      <Wind size={9} /> {weather.windspeed} km/h
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#8E8E93" }}>
                      <Droplets size={9} /> {weather.humidity}%
                    </span>
                  </div>
                  <div
                    style={{
                      padding: "7px 9px",
                      borderRadius: 10,
                      backgroundColor: weather.outdoor ? "rgba(255,193,7,0.12)" : "rgba(59,130,246,0.1)",
                      fontSize: 10.5,
                      color: weather.outdoor ? "#B45309" : "#2563EB",
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    {weather.diningTip}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 11, color: "#8E8E93", margin: 0 }}>Weather unavailable</p>
              )}
            </div>
          )}

          {/* Recent Plans */}
          <div
            style={{
              borderRadius: 18,
              padding: "14px",
              backgroundColor: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(0,0,0,0.05)",
              flexShrink: 0,
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 800, color: "#1C1C1E", margin: "0 0 10px" }}>
              Recent Plans
            </p>
            <div
              className="no-scrollbar"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxHeight: 180,
                overflowY: "auto",
                paddingRight: 2,
              }}
            >
              {RECENT_PLANS.map((p) => (
                <div
                  key={p.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    borderRadius: 12,
                    backgroundColor: "rgba(0,0,0,0.02)",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.backgroundColor =
                      "rgba(255,107,53,0.06)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.backgroundColor =
                      "rgba(0,0,0,0.02)")
                  }
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{p.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#1C1C1E",
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.name}
                    </p>
                    <p style={{ fontSize: 10, color: "#8E8E93", margin: 0 }}>
                      {p.stops} stops · {p.cost}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Plan Preview */}
          {(step === 1 || step === 2) && (
            <div
              style={{
                borderRadius: 18,
                padding: "14px",
                backgroundColor: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(0,0,0,0.05)",
                flexShrink: 0,
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 800, color: "#1C1C1E", margin: "0 0 10px" }}>
                Your Plan So Far
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {fields.map(({ key, value }) => (
                  <div
                    key={key}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 8,
                      fontSize: 10,
                      fontWeight: value ? 700 : 600,
                      color: value ? "#1C1C1E" : "#8E8E93",
                      backgroundColor: value ? "rgba(255,107,53,0.1)" : "rgba(0,0,0,0.03)",
                      border: value
                        ? "1px solid rgba(255,107,53,0.2)"
                        : "1px dashed rgba(0,0,0,0.1)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ opacity: value ? 0.7 : 1 }}>{key}:</span>
                    {value ? (
                      <span style={{ color: "#FF6B35" }}>{value}</span>
                    ) : (
                      <span>...</span>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: "#8E8E93", fontWeight: 600 }}>
                    Completeness
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: pct === 100 ? "#34C759" : "#FF6B35",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  style={{
                    height: 5,
                    backgroundColor: "#F2F2F7",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    animate={{
                      width: `${pct}%`,
                      backgroundColor: pct === 100 ? "#34C759" : "#FF6B35",
                    }}
                    transition={{ duration: 0.5 }}
                    style={{ height: "100%", borderRadius: 4 }}
                  />
                </div>
                <p style={{ fontSize: 11, color: "#8E8E93", margin: "6px 0 0 0", lineHeight: 1.4 }}>
                  {pct === 0 && "Start selecting to see your plan!"}
                  {pct > 0 && pct < 50 && "Looking good — keep going!"}
                  {pct >= 50 && pct < 100 && "Almost there!"}
                  {pct === 100 && "Ready to generate! 🚀"}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
