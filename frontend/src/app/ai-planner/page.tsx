"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Zap,
  RotateCcw,
  Wallet,
  ArrowRight,
  CheckCircle,
  Navigation,
  Star,
  Smile,
  Flame,
  Heart,
  Users,
  User,
  PartyPopper,
  Map,
  Utensils,
  Coffee,
  Soup,
  IceCreamCone,
  Fish,
  Brain,
  RefreshCw,
  Trash2,
  Send,
  Wind,
  Droplets,
  Lightbulb,
  History,
} from "lucide-react";

import { useWeather } from "@/hooks/useWeather";
import { useAuth } from "@/context/AuthContext";

const STOP_CATEGORY_ICON: Record<string, React.ReactElement> = {
  "Street Food": <Utensils size={16} />,
  Vietnamese: <Soup size={16} />,
  Cafe: <Coffee size={16} />,
  Ramen: <Soup size={16} />,
  Dessert: <IceCreamCone size={16} />,
  Japanese: <Fish size={16} />,
  BBQ: <Flame size={16} />,
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ItineraryStop {
  time: string;
  name: string;
  category: string;
  emoji: string;
  address: string;
  img: string;
  cost: string;
  xp: number;
  accent: string;
  reason: string;
  travelToNext?: string;
}

// ─── Mock Generated Itinerary ─────────────────────────────────────────────────

const MOCK_ITINERARIES: Record<string, ItineraryStop[]> = {
  default: [
    {
      time: "2:00 PM",
      name: "Bánh Mì Cô Ba",
      category: "Street Food",
      emoji: "🥖",
      address: "126 Lê Văn Sỹ, District 3",
      img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=480&h=320&fit=crop",
      cost: "25,000đ",
      xp: 50,
      accent: "#F59E0B",
      reason: "Classic street kick-off — crispy, fast, legendary.",
      travelToNext: "5 min walk",
    },
    {
      time: "2:45 PM",
      name: "Phở Bò 36",
      category: "Vietnamese",
      emoji: "🍜",
      address: "36 Đinh Tiên Hoàng, Bình Thạnh",
      img: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=480&h=320&fit=crop",
      cost: "75,000đ",
      xp: 80,
      accent: "#ED1B24",
      reason: "Rich northern-style broth matches your spice preference.",
      travelToNext: "8 min walk",
    },
    {
      time: "4:00 PM",
      name: "Matcha Room",
      category: "Cafe",
      emoji: "🍵",
      address: "88 Trần Huy Liệu, Phú Nhuận",
      img: "https://images.unsplash.com/photo-1582787895088-2ff176b668d2?w=480&h=320&fit=crop",
      cost: "55,000đ",
      xp: 60,
      accent: "#2A9D8F",
      reason: "Palate reset — serene matcha break before the evening.",
      travelToNext: "4 min walk",
    },
    {
      time: "5:00 PM",
      name: "Chè Ngon Lắm",
      category: "Dessert",
      emoji: "🍮",
      address: "72 Bùi Thị Xuân, District 1",
      img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=480&h=320&fit=crop",
      cost: "30,000đ",
      xp: 40,
      accent: "#A855F7",
      reason: "Seven-layer chè aligns with your sweet radar score.",
      travelToNext: "12 min Grab",
    },
    {
      time: "6:30 PM",
      name: "Neon Ramen House",
      category: "Ramen",
      emoji: "🍜",
      address: "201 Võ Văn Tần, District 3",
      img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=480&h=320&fit=crop",
      cost: "120,000đ",
      xp: 120,
      accent: "#F97316",
      reason: "Finish strong — 18-hour tonkotsu is your kind of bold.",
      travelToNext: undefined,
    },
  ],
};

// ─── Constants ────────────────────────────────────────────────────────────────

const MOODS = [
  {
    id: "casual",
    label: "Casual",
    icon: <Smile size={28} />,
    desc: "Relaxed, no rush",
    emoji: "😌",
    gradient: "linear-gradient(135deg, #FFF5E6, #FFE8CC)",
    accentColor: "#FF9500",
  },
  {
    id: "adventurous",
    label: "Adventurous",
    icon: <Flame size={28} />,
    desc: "New & unexpected",
    emoji: "🔥",
    gradient: "linear-gradient(135deg, #FFF0E6, #FFE0CC)",
    accentColor: "#FF6B35",
  },
  {
    id: "romantic",
    label: "Romantic",
    icon: <Heart size={28} />,
    desc: "Date-night vibes",
    emoji: "💕",
    gradient: "linear-gradient(135deg, #FFF0F5, #FFE0EB)",
    accentColor: "#FF2D78",
  },
  {
    id: "family",
    label: "Family",
    icon: <Users size={28} />,
    desc: "All-ages friendly",
    emoji: "👨‍👩‍👧‍👦",
    gradient: "linear-gradient(135deg, #E8F8F0, #D0F0E0)",
    accentColor: "#34C759",
  },
];

const CUISINES = [
  { label: "Vietnamese", emoji: "🍜", color: "#ED1B24" },
  { label: "Cafe", emoji: "☕", color: "#8B6914" },
  { label: "Ramen", emoji: "🍥", color: "#F97316" },
  { label: "Street Food", emoji: "🥖", color: "#F59E0B" },
  { label: "BBQ", emoji: "🔥", color: "#DC2626" },
  { label: "Japanese", emoji: "🍣", color: "#E11D48" },
  { label: "Dessert", emoji: "🍰", color: "#A855F7" },
  { label: "Healthy", emoji: "🥗", color: "#22C55E" },
];

const GROUPS = [
  { id: "solo", label: "Solo", icon: <User size={24} />, desc: "Just me", emoji: "🧑" },
  { id: "duo", label: "Couple", icon: <Heart size={24} />, desc: "2 people", emoji: "💑" },
  {
    id: "small",
    label: "Small Group",
    icon: <Users size={24} />,
    desc: "3–5 people",
    emoji: "👥",
  },
  {
    id: "large",
    label: "Large Group",
    icon: <PartyPopper size={24} />,
    desc: "6+ people",
    emoji: "🎉",
  },
];

const DURATIONS = [
  { label: "2 hours", icon: "⚡", desc: "Quick bite" },
  { label: "4 hours", icon: "☀️", desc: "Afternoon" },
  { label: "Half Day", icon: "🌤️", desc: "5–6 hours" },
  { label: "Full Day", icon: "🌅", desc: "8+ hours" },
];
const BUDGETS = [
  { label: "< 100k", icon: "💰", desc: "Thrifty" },
  { label: "100–300k", icon: "💳", desc: "Mid-range" },
  { label: "300–500k", icon: "💎", desc: "Premium" },
  { label: "500k+", icon: "👑", desc: "No limits" },
];

const THINKING_MSGS = [
  "Analysing your Taste DNA...",
  "Cross-referencing 2,400 local reviews...",
  "Optimising route for your mood...",
  "Calculating XP potential...",
  "Checking real-time open hours...",
  "Finalising your perfect itinerary...",
];

// ─── Mood ambience ──────────────────────────────────────────────────────────
const MOOD_AMBIENCE: Record<string, { from: string; accent: string }> = {
  casual: { from: "rgba(255,107,53,0.07)", accent: "#ff6b35" },
  adventurous: { from: "rgba(255,107,53,0.09)", accent: "#FF6B35" },
  romantic: { from: "rgba(255,45,120,0.07)", accent: "#FF2D78" },
  family: { from: "rgba(52,199,89,0.07)", accent: "#34C759" },
};

// ─── Swap pool ───────────────────────────────────────────────────────────────
const SWAP_POOL: ItineraryStop[] = [
  {
    time: "-",
    name: "Cơm Tấm Thuận Kiều",
    category: "Vietnamese",
    emoji: "🍚",
    address: "District 3",
    img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=480&h=320&fit=crop",
    cost: "55,000đ",
    xp: 70,
    accent: "#FF6B35",
    reason: "Iconic broken-rice platter, a Saigon institution since 1980.",
  },
  {
    time: "-",
    name: "Gỏi Cuốn Bà Năm",
    category: "Street Food",
    emoji: "🥟",
    address: "District 1",
    img: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=480&h=320&fit=crop",
    cost: "40,000đ",
    xp: 50,
    accent: "#34C759",
    reason: "Fresh spring rolls with peanut dip — light and local.",
  },
  {
    time: "-",
    name: "Bún Bò Huế Mệ Tý",
    category: "Vietnamese",
    emoji: "🍜",
    address: "Bình Thạnh",
    img: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=480&h=320&fit=crop",
    cost: "65,000đ",
    xp: 85,
    accent: "#ED1B24",
    reason: "Spicy lemongrass broth — central Vietnam's bold answer to phở.",
  },
  {
    time: "-",
    name: "Trà Sữa Phúc Long",
    category: "Cafe",
    emoji: "🧋",
    address: "District 1",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=320&fit=crop",
    cost: "35,000đ",
    xp: 45,
    accent: "#A855F7",
    reason: "The Vietnamese milk tea institution. Queue is worth it.",
  },
];

// SVG map positions [x, y] for up to 5 stops
const MAP_POS = [
  [100, 118],
  [205, 72],
  [68, 162],
  [160, 248],
  [112, 318],
];

// Natural language prompt parser
function parsePrompt(text: string): Record<string, string> {
  const t = text.toLowerCase();
  const r: Record<string, string> = {};
  if (/romantic|date|couple/.test(t)) r.mood = "romantic";
  else if (/adventur|bold|wild/.test(t)) r.mood = "adventurous";
  else if (/family|kids/.test(t)) r.mood = "family";
  else if (/casual|chill|relax/.test(t)) r.mood = "casual";
  if (/\bsolo\b|just me|alone/.test(t)) r.group = "solo";
  else if (/couple|two of us|just the two|partner/.test(t)) r.group = "duo";
  else if (/small group/.test(t)) r.group = "small";
  else if (/large|6\+|party/.test(t)) r.group = "large";
  if (/full day|whole day/.test(t)) r.duration = "Full Day";
  else if (/half day/.test(t)) r.duration = "Half Day";
  else if (/4 hour/.test(t)) r.duration = "4 hours";
  else if (/2 hour/.test(t)) r.duration = "2 hours";
  const bm = t.match(/(\d+)\s*k/);
  if (bm) {
    const v = parseInt(bm[1]);
    r.budget =
      v < 100
        ? "< 100k"
        : v <= 300
          ? "100–300k"
          : v <= 500
            ? "300–500k"
            : "500k+";
  }
  if (/district 1|quận 1/.test(t)) r.location = "District 1";
  else if (/bình thạnh|binh thanh/.test(t)) r.location = "Bình Thạnh";
  else if (/phú nhuận|phu nhuan/.test(t)) r.location = "Phú Nhuận";
  return r;
}

// ─── Route Map (SVG) ─────────────────────────────────────────────────────────
function RouteMap({
  stops,
  activeStop,
}: {
  stops: ItineraryStop[];
  activeStop: number | null;
}) {
  const pts = MAP_POS.slice(0, stops.length);
  const pathD = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
    .join(" ");
  return (
    <div
      style={{
        position: "relative",
        height: 320,
        backgroundColor: "#F5F3EE",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid #E5E5EA",
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 300 400"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="300"
            y2={y}
            stroke="#EAE7E0"
            strokeWidth="1"
          />
        ))}
        {[50, 100, 150, 200, 250].map((x) => (
          <line
            key={x}
            x1={x}
            y1="0"
            x2={x}
            y2="400"
            stroke="#EAE7E0"
            strokeWidth="1"
          />
        ))}
        <line
          x1="150"
          y1="0"
          x2="150"
          y2="400"
          stroke="#D8D3CA"
          strokeWidth="2"
        />
        <line
          x1="0"
          y1="200"
          x2="300"
          y2="200"
          stroke="#D8D3CA"
          strokeWidth="2"
        />
        <ellipse
          cx="248"
          cy="55"
          rx="44"
          ry="26"
          fill="#C8E9F5"
          opacity="0.7"
        />
        <text x="230" y="58" fontSize="7" fill="#7BBDD4" fontWeight="600">
          Sài Gòn River
        </text>
        <ellipse
          cx="58"
          cy="278"
          rx="28"
          ry="18"
          fill="#C8E8C8"
          opacity="0.6"
        />
        <path
          d={pathD}
          fill="none"
          stroke="#ff6b35"
          strokeWidth="2.5"
          strokeDasharray="6 3"
          opacity="0.55"
        />
        {pts.map(([x, y], i) => {
          const s = stops[i];
          const a = activeStop === i;
          return (
            <g key={s.name}>
              {a && (
                <circle cx={x} cy={y} r={22} fill={s.accent} opacity={0.18} />
              )}
              <circle cx={x} cy={y} r={a ? 14 : 11} fill={s.accent} />
              <text
                x={x}
                y={y + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={a ? 9 : 7}
                fontWeight="800"
              >
                {i + 1}
              </text>
              <text
                x={x + (x > 150 ? -16 : 16)}
                y={y - 15}
                textAnchor={x > 150 ? "end" : "start"}
                fill="#3C3C43"
                fontSize="7"
                fontWeight="700"
              >
                {s.name.split(" ").slice(0, 2).join(" ")}
              </text>
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 12,
          fontSize: 10,
          color: "#8E8E93",
          fontWeight: 700,
        }}
      >
        HCMC Route Map
      </div>
    </div>
  );
}

// ─── Step 1: Preferences ─────────────────────────────────────────────────────

function StepPreferences({
  mood,
  setMood,
  cuisines,
  toggleCuisine,
  group,
  setGroup,
}: {
  mood: string | null;
  setMood: (v: string) => void;
  cuisines: string[];
  toggleCuisine: (v: string) => void;
  group: string | null;
  setGroup: (v: string) => void;
}) {
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
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#1C1C1E",
            marginBottom: 12,
          }}
        >
          What&apos;s the vibe today?
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
          }}
        >
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
                  background: selected ? m.gradient : "linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.3))",
                  backdropFilter: "blur(16px)",
                  boxShadow: selected
                    ? `0 12px 32px ${m.accentColor}33, inset 0 2px 4px rgba(255,255,255,0.4)`
                    : "0 4px 16px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1)",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                  overflow: "hidden",
                }}
              >
                {/* Emoji background glow */}
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
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#1C1C1E",
                      margin: 0,
                    }}
                  >
                    {m.label}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#8E8E93",
                      margin: 0,
                    }}
                  >
                    {m.desc}
                  </p>
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
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#1C1C1E",
            marginBottom: 4,
          }}
        >
          Cuisine preferences{" "}
          <span style={{ color: "#8E8E93", fontWeight: 500, fontSize: 13 }}>
            (pick any)
          </span>
        </h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 10,
          }}
        >
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
                        background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))",
                        backdropFilter: "blur(8px)",
                        color: "#3C3C43",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)",
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
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#1C1C1E",
            marginBottom: 12,
          }}
        >
          Who&apos;s coming?
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
          }}
        >
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
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#1C1C1E",
                    margin: 0,
                  }}
                >
                  {g.label}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: "#8E8E93",
                    margin: 0,
                  }}
                >
                  {g.desc}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step 2: Settings ─────────────────────────────────────────────────────────

function StepSettings({
  duration,
  setDuration,
  budget,
  setBudget,
  location,
  setLocation,
}: {
  duration: string;
  setDuration: (v: string) => void;
  budget: string;
  setBudget: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      style={{ display: "flex", flexDirection: "column", gap: 32 }}
    >
      {/* Duration */}
      <div>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#1C1C1E",
            marginBottom: 12,
          }}
        >
          How long?
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
          }}
        >
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
                  border: selected
                    ? "2px solid #ff6b35"
                    : "1px solid rgba(255,255,255,0.8)",
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
        <h3
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#1C1C1E",
            marginBottom: 12,
          }}
        >
          Budget per person
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
          }}
        >
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
                  border: selected
                    ? "2px solid #34C759"
                    : "1px solid rgba(255,255,255,0.8)",
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
        <h3
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#1C1C1E",
            marginBottom: 12,
          }}
        >
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
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 10,
          }}
        >
          {[
            { name: "District 1", emoji: "📍" },
            { name: "Bình Thạnh", emoji: "🏙️" },
            { name: "Phú Nhuận", emoji: "🌿" },
            { name: "Thủ Đức", emoji: "🏫" },
          ].map((loc) => {
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

// ─── Step 3: Generating ───────────────────────────────────────────────────────

const FOOD_PARTICLES = ["🍜", "🥖", "🍵", "🍰", "🍣", "🥟", "🧋", "🍤", "🍚", "🔥"];

function StepGenerating({ onDone }: { onDone: () => void }) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setMsgIdx((i) => i + 1), 900);
    const timer = setTimeout(onDone, 5600);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onDone]);

  const msg = THINKING_MSGS[Math.min(msgIdx, THINKING_MSGS.length - 1)];
  const progress = Math.min(((msgIdx + 1) / THINKING_MSGS.length) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 60,
        paddingBottom: 60,
        gap: 32,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating food particles */}
      {FOOD_PARTICLES.map((emoji, i) => (
        <motion.span
          key={i}
          initial={{
            opacity: 0,
            x: Math.random() * 600 - 300,
            y: Math.random() * 400 - 200,
          }}
          animate={{
            opacity: [0, 0.4, 0],
            y: [0, -120 - Math.random() * 80],
            x: Math.random() * 100 - 50,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            fontSize: 24 + Math.random() * 12,
            pointerEvents: "none",
            top: `${40 + Math.random() * 40}%`,
            left: `${10 + Math.random() * 80}%`,
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Multi-ring AI orb */}
      <div style={{ position: "relative", width: 120, height: 120 }}>
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: "50%",
            border: "2px dashed rgba(168,85,247,0.3)",
          }}
        />
        {/* Mid ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, #ff6b35, #A855F7, #FF6B35, #34C759, #ff6b35)",
            padding: 3,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: "white",
            }}
          />
        </motion.div>
        {/* Inner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: 12,
            borderRadius: "50%",
            border: "1.5px solid rgba(255,107,53,0.2)",
          }}
        />
        {/* Center icon */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain size={32} color="#ff6b35" />
          </motion.div>
        </div>
        {/* Pulse rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "1.5px solid rgba(255,107,53,0.2)",
            }}
            animate={{ scale: [1, 1.8 + i * 0.3], opacity: [0.5, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Title + message */}
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <h3
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: "#1C1C1E",
            letterSpacing: -0.5,
            margin: 0,
          }}
        >
          Crafting your itinerary
        </h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={msg}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              fontSize: 14,
              color: "#8E8E93",
              marginTop: 8,
            }}
          >
            {msg}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Breathing thoughts progress */}
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          zIndex: 1,
          marginTop: 16,
        }}
      >
        {/* Floating text stack */}
        <div style={{ height: 80, position: "relative", width: "100%" }}>
          <AnimatePresence>
            {THINKING_MSGS.map((m, i) => {
              if (i < msgIdx - 1 || i > msgIdx + 1) return null; // Only show window of 3
              
              const isCurrent = i === msgIdx;
              const isPast = i < msgIdx;
              const isFuture = i > msgIdx;
              
              return (
                <motion.div
                  key={m}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{
                    opacity: isCurrent ? 1 : isPast ? 0 : 0.4,
                    y: isCurrent ? 0 : isPast ? -20 : 20,
                    scale: isCurrent ? 1 : 0.95,
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: isCurrent ? 15 : 13,
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? "#ff6b35" : "#8E8E93",
                  }}
                >
                  {isCurrent && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles size={14} color="#ff6b35" />
                    </motion.div>
                  )}
                  {m}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Ambient Progress bar */}
        <div
          style={{
            width: "80%",
            height: 4,
            backgroundColor: "rgba(0,0,0,0.05)",
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #ff6b35, #A855F7, #4FACFE)",
              backgroundSize: "200% 200%",
              borderRadius: 4,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step 4: Stop Card ────────────────────────────────────────────────────────

function StopCard({
  stop,
  index,
  total,
  active,
  swapping,
  onHover,
  onLeave,
  onSwap,
  onRemove,
}: {
  stop: ItineraryStop;
  index: number;
  total: number;
  active: boolean;
  swapping: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSwap: () => void;
  onRemove: () => void;
}) {
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
            boxShadow: active
              ? `0 4px 16px ${stop.accent}55`
              : `0 2px 8px ${stop.accent}33`,
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
              background: active ? `linear-gradient(to bottom, ${stop.accent}88, rgba(229,229,234,0.3))` : "#E5E5EA",
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
                border: active
                  ? `1.5px solid ${stop.accent}66`
                  : "1px solid rgba(0,0,0,0.06)",
                boxShadow: active
                  ? `0 12px 32px ${stop.accent}25`
                  : "0 4px 16px rgba(0,0,0,0.03)",
                transition: "border 0.3s",
              }}
            >
              {/* Image */}
              <div
                style={{
                  height: 110,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <img
                  src={stop.img}
                  alt={stop.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.55), transparent 55%)",
                  }}
                />
                <div style={{ position: "absolute", bottom: 10, left: 12 }}>
                  <p
                    style={{
                      color: "white",
                      fontWeight: 800,
                      fontSize: 15,
                      lineHeight: 1.2,
                    }}
                  >
                    {stop.name}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>
                    {stop.category}
                  </p>
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
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 3 }}
                    >
                      <MapPin size={11} />
                      {stop.address.split(",")[0]}
                    </span>
                    <span style={{ fontWeight: 700, color: "#1C1C1E" }}>
                      {stop.cost}
                    </span>
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

                {/* Hover actions + reasoning */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      {/* Action buttons */}
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
                      {/* AI reasoning card */}
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
                          <span
                            style={{
                              fontSize: 10,
                              color: "#ff6b35",
                              fontWeight: 700,
                            }}
                          >
                            Why this stop
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#636366",
                            lineHeight: 1.6,
                          }}
                        >
                          Matched:{" "}
                          <b style={{ color: "#3C3C43" }}>{stop.category}</b>{" "}
                          preference · budget fits at{" "}
                          <b style={{ color: "#3C3C43" }}>{stop.cost}</b>
                          {stop.travelToNext
                            ? ` · ${stop.travelToNext} to next stop`
                            : " · final stop of route"}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Travel connector (outside hover) */}
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

// ─── Step 4: Result (split-screen) ───────────────────────────────────────────

function StepResult({
  stops: initialStops,
  onRegen,
}: {
  stops: ItineraryStop[];
  onRegen: () => void;
}) {
  const [stops, setStops] = useState<ItineraryStop[]>(initialStops);
  const [activeStop, setActiveStop] = useState<number | null>(null);
  const [swapping, setSwapping] = useState<number | null>(null);
  const [pool, setPool] = useState([...SWAP_POOL]);

  const totalXp = stops.reduce((s, x) => s + x.xp, 0);

  const handleSwap = async (i: number) => {
    setSwapping(i);
    await new Promise((r) => setTimeout(r, 1400));
    const next = {
      ...pool[0],
      time: stops[i].time,
      travelToNext: stops[i].travelToNext,
    };
    setPool((p) => [...p.slice(1), p[0]]);
    setStops((prev) => prev.map((s, idx) => (idx === i ? next : s)));
    setSwapping(null);
  };

  const handleRemove = (i: number) =>
    setStops((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* Summary banner - Premium Hero */}
      <div
        style={{
          borderRadius: 24,
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #0F0F12 0%, #1A1A2E 40%, #16213E 70%, #0F3460 100%)",
            padding: "24px 28px",
            position: "relative",
          }}
        >
          {/* Sparkle particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.4,
              }}
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Animated icon */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "linear-gradient(135deg, rgba(255,193,7,0.25), rgba(255,107,53,0.25))",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: "1px solid rgba(255,193,7,0.2)",
              }}
            >
              <Map size={24} color="#FFC107" />
            </motion.div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "white",
                    lineHeight: 1.2,
                    margin: 0,
                    letterSpacing: -0.3,
                  }}
                >
                  Afternoon Street Food Sprint
                </h3>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 8px",
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
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                  margin: 0,
                }}
              >
                {stops.length} stops · ~4.5 hours · Ho Chi Minh City
              </p>
            </div>

            {/* Price + XP */}
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "white",
                  margin: 0,
                }}
              >
                305,000đ
              </p>
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 12,
                  justifyContent: "flex-end",
                  margin: 0,
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    padding: "2px 8px",
                    borderRadius: 12,
                    backgroundColor: "rgba(255,193,7,0.15)",
                    color: "#FFC107",
                    fontWeight: 800,
                  }}
                >
                  <Zap size={11} fill="currentColor" />
                  +{totalXp} XP
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* LEFT: Interactive timeline */}
        <div
          style={{
            flex: "0 0 460px",
            display: "flex",
            flexDirection: "column",
          }}
        >
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

        {/* RIGHT: Map + quick stats */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            position: "sticky",
            top: 80,
            minWidth: 0,
          }}
        >
          <RouteMap stops={stops} activeStop={activeStop} />

          {/* Mini stat grid - upgraded */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            {[
              {
                label: "Total Stops",
                value: `${stops.length} places`,
                color: "#ff6b35",
                emoji: "📍",
              },
              {
                label: "Est. Duration",
                value: "~4.5 hours",
                color: "#FF9500",
                emoji: "⏱️",
              },
              {
                label: "Budget",
                value: "305,000đ",
                color: "#34C759",
                emoji: "💰",
              },
              {
                label: "XP Earned",
                value: `+${totalXp} XP`,
                color: "#A855F7",
                emoji: "⚡",
              },
            ].map(({ label, value, color, emoji }) => (
              <div
                key={label}
                style={{
                  backgroundColor: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 16,
                  padding: "14px 16px",
                  border: "1px solid rgba(0,0,0,0.04)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{emoji}</span>
                  <p
                    style={{
                      fontSize: 10,
                      color: "#8E8E93",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      margin: 0,
                    }}
                  >
                    {label}
                  </p>
                </div>
                <p
                  style={{
                    fontSize: 17,
                    fontWeight: 900,
                    color,
                    margin: 0,
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions - 3-button layout */}
      <div style={{ display: "flex", gap: 10, paddingBottom: 24 }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRegen}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 22px",
            borderRadius: 18,
            fontSize: 14,
            fontWeight: 700,
            color: "#1C1C1E",
            backgroundColor: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(8px)",
            border: "1.5px solid rgba(0,0,0,0.06)",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <RotateCcw size={15} /> Regenerate
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 22px",
            borderRadius: 18,
            fontSize: 14,
            fontWeight: 700,
            color: "#636366",
            backgroundColor: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(8px)",
            border: "1.5px solid rgba(0,0,0,0.06)",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Send size={14} /> Share
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px 22px",
            borderRadius: 18,
            fontSize: 15,
            fontWeight: 800,
            color: "white",
            background: "linear-gradient(135deg, #FF6B35, #A855F7)",
            boxShadow:
              "0 8px 24px rgba(255,107,53,0.3), 0 2px 8px rgba(168,85,247,0.2)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Star size={16} fill="currentColor" /> Save to Tour Builder
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// ─── Mock data ───────────────────────────────────────────────────────────────
const RECENT_PLANS = [
  { name: "Street Food Night", stops: 3, cost: "120,000đ", emoji: "🌃" },
  { name: "Cafe Hopping", stops: 5, cost: "250,000đ", emoji: "☕" },
  { name: "Phở Family Lunch", stops: 2, cost: "180,000đ", emoji: "🍜" },
];

const MOOD_TIPS: Record<string, string> = {
  casual: "Morning bánh mì combos are trending in your area!",
  romantic: "Japanese cuisine pairs perfectly with date-night ambience.",
  adventurous: "A hidden gem 600m from you hasn't been reviewed in 2 weeks.",
  family: "Look for spots with shaded seating — great for kids this afternoon.",
};

const CUISINE_PREDICTIONS: Record<string, Array<{ label: string; score: number }>> = {
  casual: [
    { label: "Bánh mì street spots", score: 92 },
    { label: "Egg coffee", score: 87 },
    { label: "Street phở", score: 84 },
  ],
  romantic: [
    { label: "Japanese omakase", score: 94 },
    { label: "Rooftop cocktail bars", score: 89 },
    { label: "French-fusion bistros", score: 81 },
  ],
  adventurous: [
    { label: "Hidden alley BBQ", score: 96 },
    { label: "Fusion street tacos", score: 88 },
    { label: "Night market picks", score: 85 },
  ],
  family: [
    { label: "Dim sum restaurants", score: 91 },
    { label: "Buffet all-you-can-eat", score: 86 },
    { label: "Pizza & pasta", score: 80 },
  ],
};

// ─── Unified Planner Sidebar ──────────────────────────────────────────────────
function PlannerSidebar({
  collapsed,
  onToggle,
  mood,
  cuisines,
  group,
  duration,
  budget,
  location,
  step,
  username,
  avatarUrl,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mood: string | null;
  cuisines: string[];
  group: string | null;
  duration: string;
  budget: string;
  location: string;
  step: number;
  username: string;
  avatarUrl?: string | null;
}) {
  const { weather, loading: weatherLoading } = useWeather();

  const fields = [
    { key: "Mood", value: mood ? (MOODS.find((m) => m.id === mood)?.label ?? null) : null },
    { key: "Cuisines", value: cuisines.length > 0 ? cuisines.slice(0, 2).join(", ") + (cuisines.length > 2 ? ` +${cuisines.length - 2}` : "") : null },
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: collapsed ? 0 : "0 4px", marginBottom: collapsed ? 0 : 4 }}>
        {!collapsed && <span style={{ fontSize: 13, fontWeight: 800, color: "#1C1C1E" }}>Workspace</span>}
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
          {collapsed ? <ChevronsLeft size={15} color="#636366" /> : <ChevronsRight size={15} color="#8E8E93" />}
        </motion.button>
      </div>

      {/* ── COLLAPSED icon rail ── */}
      {collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}
        >
          {/* Weather dot */}
          {weather && (
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              title={`${weather.temp}° ${weather.label}`}
              style={{
                width: 38, height: 38, borderRadius: 14,
                background: weather.outdoor ? "linear-gradient(135deg, rgba(255,193,7,0.15), rgba(255,149,0,0.1))" : "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))",
                border: weather.outdoor ? "1px solid rgba(255,193,7,0.3)" : "1px solid rgba(59,130,246,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                cursor: "pointer", flexShrink: 0,
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
              }}
            >
              {weather.emoji}
            </motion.div>
          )}

          {/* Plans dot */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            title="Recent Plans"
            style={{
              width: 38, height: 38, borderRadius: 14,
              backgroundColor: "rgba(0,122,255,0.08)",
              border: "1px solid rgba(0,122,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            <History size={18} color="#007AFF" />
          </motion.div>

          {/* Plan preview dot */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            title="Live Plan Preview"
            style={{
              width: 38, height: 38, borderRadius: 14,
              backgroundColor: "rgba(255,107,53,0.08)",
              border: "1px solid rgba(255,107,53,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            <Star size={18} color="#FF6B35" />
          </motion.div>
        </motion.div>
      )}

      {/* ── EXPANDED state ── */}
      {!collapsed && (
        <>
          {/* ── Real Weather ── */}
          {(step === 1 || step === 2) && (
            <div
              style={{
                borderRadius: 18, padding: "14px", flexShrink: 0,
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
                    style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #FF9500", borderTopColor: "transparent" }}
                  />
                  <span style={{ fontSize: 11, color: "#8E8E93" }}>Getting local weather...</span>
                </div>
              ) : weather ? (
                <>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#8E8E93", margin: "0 0 1px" }}>Right Now in</p>
                      <p style={{ fontSize: 11, fontWeight: 800, color: "#1C1C1E", margin: 0, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {weather.locationName}
                      </p>
                    </div>
                    <span style={{ fontSize: 24, lineHeight: 1 }}>{weather.emoji}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#1C1C1E", lineHeight: 1 }}>{weather.temp}°</span>
                    <span style={{ fontSize: 11, color: "#636366", fontWeight: 600 }}>{weather.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#8E8E93" }}>
                      <Wind size={9} /> {weather.windspeed} km/h
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#8E8E93" }}>
                      <Droplets size={9} /> {weather.humidity}%
                    </span>
                  </div>
                  <div style={{
                    padding: "7px 9px", borderRadius: 10,
                    backgroundColor: weather.outdoor ? "rgba(255,193,7,0.12)" : "rgba(59,130,246,0.1)",
                    fontSize: 10.5, color: weather.outdoor ? "#B45309" : "#2563EB",
                    fontWeight: 600, lineHeight: 1.4,
                  }}>
                    {weather.diningTip}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 11, color: "#8E8E93", margin: 0 }}>Weather unavailable</p>
              )}
            </div>
          )}

          {/* ── Recent Plans ── */}
          <div style={{ borderRadius: 18, padding: "14px", backgroundColor: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.05)", flexShrink: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#1C1C1E", margin: "0 0 10px" }}>Recent Plans</p>
            <div className="no-scrollbar" style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto", paddingRight: 2 }}>
              {RECENT_PLANS.map((p) => (
                <div
                  key={p.name}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 12, backgroundColor: "rgba(0,0,0,0.02)", cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(255,107,53,0.06)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(0,0,0,0.02)")}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{p.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#1C1C1E", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
                    <p style={{ fontSize: 10, color: "#8E8E93", margin: 0 }}>{p.stops} stops · {p.cost}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Live Plan Preview ── */}
          {(step === 1 || step === 2) && (
            <div style={{ borderRadius: 18, padding: "14px", backgroundColor: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.05)", flexShrink: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#1C1C1E", margin: "0 0 10px" }}>Your Plan So Far</p>
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
                      border: value ? "1px solid rgba(255,107,53,0.2)" : "1px dashed rgba(0,0,0,0.1)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4
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
                  <span style={{ fontSize: 10, color: "#8E8E93", fontWeight: 600 }}>Completeness</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: pct === 100 ? "#34C759" : "#FF6B35" }}>{pct}%</span>
                </div>
                <div style={{ height: 5, backgroundColor: "#F2F2F7", borderRadius: 4, overflow: "hidden" }}>
                  <motion.div
                    animate={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#34C759" : "#FF6B35" }}
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


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AIPlanner() {
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [parsedHints, setParsedHints] = useState<Record<string, string>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const [mood, setMood] = useState<string | null>(null);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [group, setGroup] = useState<string | null>(null);
  const [duration, setDuration] = useState("4 hours");
  const [budget, setBudget] = useState("100–300k");
  const [location, setLocation] = useState("District 1");

  const { user } = useAuth();
  const username = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Foodie";
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  const toggleCuisine = (c: string) =>
    setCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const handlePromptSubmit = () => {
    if (!prompt.trim()) return;
    const parsed = parsePrompt(prompt);
    setParsedHints(parsed);
    if (parsed.mood) setMood(parsed.mood);
    if (parsed.group) setGroup(parsed.group);
    if (parsed.duration) setDuration(parsed.duration);
    if (parsed.budget) setBudget(parsed.budget);
    if (parsed.location) setLocation(parsed.location);
  };

  const ambience = mood ? MOOD_AMBIENCE[mood] : null;
  const canProceed1 = !!mood && !!group;
  const canProceed2 = !!location.trim();
  const handleGenerate = () => setStep(3);
  const handleRegen = () => setStep(3);
  const handleDone = () => setStep(4);
  const STEP_LABELS = ["Preferences", "Settings", "Generating", "Your Plan"];

  return (
    <div
      className="no-scrollbar"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#FAF8F5",
        overflow: "hidden",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* ── Ambient mood gradient ── */}
      <motion.div
        animate={{ opacity: mood ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: ambience
            ? `radial-gradient(ellipse 90% 45% at 50% 0%, ${ambience.from}, transparent 70%)`
            : "none",
        }}
      />

      {/* ── HEADER ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          backgroundColor: "rgba(250,248,245,0.88)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            {step > 1 && step < 3 && (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1 text-[#ff6b35] text-[15px] font-semibold"
              >
                <ChevronLeft size={18} /> Back
              </motion.button>
            )}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                style={{
                  background: ambience
                    ? `linear-gradient(135deg, ${ambience.accent}, #A855F7)`
                    : "linear-gradient(135deg, #ff6b35, #A855F7)",
                  transition: "background 0.4s",
                }}
              >
                <Sparkles size={16} className="text-white" />
              </div>
              <h1 className="text-[20px] font-extrabold text-[#1C1C1E] tracking-tight">
                AI Food Planner
              </h1>
            </div>
          </div>
          {step < 3 && (
            <div className="flex items-center gap-2">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all"
                      style={
                        step >= s
                          ? {
                              backgroundColor: ambience?.accent ?? "#ff6b35",
                              color: "#fff",
                            }
                          : { backgroundColor: "#E5E5EA", color: "#8E8E93" }
                      }
                    >
                      {step > s ? <CheckCircle size={14} /> : s}
                    </div>
                    <span
                      className="text-[12px] font-semibold"
                      style={{ color: step >= s ? "#1C1C1E" : "#8E8E93" }}
                    >
                      {STEP_LABELS[s - 1]}
                    </span>
                  </div>
                  {s < 2 && (
                    <ChevronRight size={14} className="text-[#D1D1D6]" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {step < 3 && (
          <div className="h-0.5 bg-[#E5E5EA]">
            <motion.div
              className="h-full"
              animate={{
                width: `${(step / 2) * 100}%`,
                backgroundColor: ambience?.accent ?? "#ff6b35",
              }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}
      </div>

      {/* ── CONTENT: 3-column grid ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        {/* Center content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: step === 3 ? "center" : "flex-start",
            padding: step === 3 ? "32px" : "24px 28px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: step === 4 ? "100%" : 680,
              margin: "0 auto",
            }}
          >
          {/* ── Natural Language Prompt Bar (steps 1–2) ── */}
          {step < 3 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: 28 }}
            >
              <div style={{ position: "relative" }}>
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePromptSubmit()}
                  placeholder="Describe your ideal food adventure... e.g. 'A romantic evening in District 1, 200k budget'"
                  style={{
                    width: "100%",
                    padding: "15px 56px 15px 18px",
                    borderRadius: 20,
                    fontSize: 15,
                    outline: "none",
                    fontFamily: "inherit",
                    color: "#1C1C1E",
                    backgroundColor: "#fff",
                    transition: "all 0.25s",
                    border: prompt
                      ? `1.5px solid ${ambience?.accent ?? "#ff6b35"}55`
                      : "1.5px solid #E5E5EA",
                    boxShadow: prompt
                      ? `0 4px 20px ${ambience?.accent ?? "#ff6b35"}18`
                      : "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                />
                <button
                  onClick={handlePromptSubmit}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    background: prompt
                      ? `linear-gradient(135deg, ${ambience?.accent ?? "#ff6b35"}, #A855F7)`
                      : "#E5E5EA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <Send size={16} color={prompt ? "white" : "#8E8E93"} />
                </button>
              </div>

              <AnimatePresence>
                {Object.keys(parsedHints).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginTop: 8,
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: "#8E8E93",
                        fontWeight: 600,
                      }}
                    >
                      AI understood:
                    </span>
                    {Object.entries(parsedHints).map(([k, v]) => (
                      <span
                        key={k}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 20,
                          backgroundColor: `${ambience?.accent ?? "#ff6b35"}15`,
                          color: ambience?.accent ?? "#ff6b35",
                        }}
                      >
                        {v}
                      </span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {!prompt && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 8,
                  }}
                >
                  {[
                    "A romantic date night, 300k budget",
                    "Solo street food adventure",
                    "Family lunch in District 1",
                  ].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setPrompt(ex)}
                      style={{
                        fontSize: 12,
                        padding: "4px 12px",
                        borderRadius: 20,
                        border: "1px solid #E5E5EA",
                        backgroundColor: "#fff",
                        color: "#636366",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              )}

              <div
                style={{ height: 1, backgroundColor: "#E5E5EA", marginTop: 20 }}
              />
            </motion.div>
          )}

          {step < 3 && (
            <div style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#1C1C1E",
                  letterSpacing: -0.5,
                  margin: 0,
                }}
              >
                {step === 1 ? "Tell me about yourself" : "Set your parameters"}
              </h2>
              <p style={{ fontSize: 14, color: "#8E8E93", marginTop: 4 }}>
                {step === 1
                  ? "Your preferences help the AI craft the perfect food adventure."
                  : "Fine-tune your session details."}
              </p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <StepPreferences
                key="s1"
                mood={mood}
                setMood={setMood}
                cuisines={cuisines}
                toggleCuisine={toggleCuisine}
                group={group}
                setGroup={setGroup}
              />
            )}
            {step === 2 && (
              <StepSettings
                key="s2"
                duration={duration}
                setDuration={setDuration}
                budget={budget}
                setBudget={setBudget}
                location={location}
                setLocation={setLocation}
              />
            )}
            {step === 3 && <StepGenerating key="s3" onDone={handleDone} />}
            {step === 4 && (
              <StepResult
                key="s4"
                stops={MOCK_ITINERARIES.default}
                onRegen={handleRegen}
              />
            )}
          </AnimatePresence>

          {(step === 1 || step === 2) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 32 }}
            >
              <motion.button
                whileHover={{
                  scale: (step === 1 ? canProceed1 : canProceed2) ? 1.02 : 1,
                }}
                whileTap={{
                  scale: (step === 1 ? canProceed1 : canProceed2) ? 0.97 : 1,
                }}
                onClick={step === 1 ? () => setStep(2) : handleGenerate}
                disabled={step === 1 ? !canProceed1 : !canProceed2}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: 18,
                  fontSize: 16,
                  fontWeight: 800,
                  color: "white",
                  border: "none",
                  cursor: (step === 1 ? canProceed1 : canProceed2)
                    ? "pointer"
                    : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  ...((step === 1 ? canProceed1 : canProceed2)
                    ? {
                        background: `linear-gradient(135deg, ${ambience?.accent ?? "#1A7AFF"}, ${ambience?.accent ? ambience.accent + "BB" : "#0057D9"})`,
                        boxShadow: `0 8px 24px ${ambience?.accent ?? "#ff6b35"}44`,
                      }
                    : { background: "#E5E5EA", color: "#A8A8AD" }),
                  transition: "all 0.3s",
                }}
              >
                {step === 1 ? (
                  <>
                    <span>Continue</span>
                    <ChevronRight size={18} />
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate My Itinerary</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
          </div>  {/* closes maxWidth wrapper */}
        </div>  {/* closes center content */}

        {/* ── Right: Planner Sidebar — hidden during generating step ── */}
        <AnimatePresence>
          {step !== 3 && (
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              style={{ height: "100%", overflowY: "auto", flexShrink: 0 }}
            >
              <PlannerSidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed((v) => !v)}
                mood={mood}
                cuisines={cuisines}
                group={group}
                duration={duration}
                budget={budget}
                location={location}
                step={step}
                username={username}
                avatarUrl={avatarUrl}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

