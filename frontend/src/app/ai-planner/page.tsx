"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
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
} from "lucide-react";

import Link from "next/link";

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
  },
  {
    id: "adventurous",
    label: "Adventurous",
    icon: <Flame size={28} />,
    desc: "New & unexpected",
  },
  {
    id: "romantic",
    label: "Romantic",
    icon: <Heart size={28} />,
    desc: "Date-night vibes",
  },
  {
    id: "family",
    label: "Family",
    icon: <Users size={28} />,
    desc: "All-ages friendly",
  },
];

const CUISINES = [
  "Vietnamese",
  "Cafe",
  "Ramen",
  "Street Food",
  "BBQ",
  "Japanese",
  "Dessert",
  "Healthy",
];

const GROUPS = [
  { id: "solo", label: "Solo", icon: <User size={24} />, desc: "Just me" },
  { id: "duo", label: "Couple", icon: <Heart size={24} />, desc: "2 people" },
  {
    id: "small",
    label: "Small Group",
    icon: <Users size={24} />,
    desc: "3–5 people",
  },
  {
    id: "large",
    label: "Large Group",
    icon: <PartyPopper size={24} />,
    desc: "6+ people",
  },
];

const DURATIONS = ["2 hours", "4 hours", "Half Day", "Full Day"];
const BUDGETS = ["< 100k", "100–300k", "300–500k", "500k+"];

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
      className="flex flex-col gap-8"
    >
      {/* Mood */}
      <div>
        <h3 className="text-[15px] font-bold text-[#1C1C1E] mb-3">
          What&apos;s the vibe today?
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {MOODS.map((m) => (
            <motion.button
              key={m.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setMood(m.id)}
              className="flex items-center gap-3 p-4 rounded-[18px] text-left border-2 transition-all"
              style={
                mood === m.id
                  ? { backgroundColor: "#FFF0E6", borderColor: "#ff6b35" }
                  : { backgroundColor: "#F9F9FB", borderColor: "transparent" }
              }
            >
              <span style={{ color: mood === m.id ? "#ff6b35" : "#636366" }}>
                {m.icon}
              </span>
              <div>
                <p className="text-[14px] font-bold text-[#1C1C1E]">
                  {m.label}
                </p>
                <p className="text-[12px] text-[#8E8E93]">{m.desc}</p>
              </div>
              {mood === m.id && (
                <CheckCircle size={16} className="text-[#ff6b35] ml-auto" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cuisines */}
      <div>
        <h3 className="text-[15px] font-bold text-[#1C1C1E] mb-1">
          Cuisine preferences{" "}
          <span className="text-[#8E8E93] font-normal">(pick any)</span>
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {CUISINES.map((c) => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.93 }}
              onClick={() => toggleCuisine(c)}
              className="px-3.5 py-2 rounded-full text-[13px] font-semibold border transition-all"
              style={
                cuisines.includes(c)
                  ? {
                      backgroundColor: "#1C1C1E",
                      borderColor: "#1C1C1E",
                      color: "#fff",
                    }
                  : {
                      backgroundColor: "#F2F2F7",
                      borderColor: "transparent",
                      color: "#3C3C43",
                    }
              }
            >
              {c}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Group size */}
      <div>
        <h3 className="text-[15px] font-bold text-[#1C1C1E] mb-3">
          Who&apos;s coming?
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {GROUPS.map((g) => (
            <motion.button
              key={g.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setGroup(g.id)}
              className="flex flex-col items-center gap-1.5 p-3.5 rounded-[16px] border-2 transition-all"
              style={
                group === g.id
                  ? { backgroundColor: "#FFF0E6", borderColor: "#ff6b35" }
                  : { backgroundColor: "#F9F9FB", borderColor: "transparent" }
              }
            >
              <span
                style={{
                  color: group === g.id ? "#ff6b35" : "#636366",
                }}
              >
                {g.icon}
              </span>
              <p className="text-[12px] font-bold text-[#1C1C1E]">{g.label}</p>
              <p className="text-[10px] text-[#8E8E93]">{g.desc}</p>
            </motion.button>
          ))}
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
      className="flex flex-col gap-8"
    >
      {/* Duration */}
      <div>
        <h3 className="text-[15px] font-bold text-[#1C1C1E] mb-3 flex items-center gap-2">
          <Clock size={16} className="text-[#ff6b35]" /> How long?
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {DURATIONS.map((d) => (
            <motion.button
              key={d}
              whileTap={{ scale: 0.94 }}
              onClick={() => setDuration(d)}
              className="py-3 rounded-[14px] text-[13px] font-bold border-2 transition-all"
              style={
                duration === d
                  ? {
                      backgroundColor: "#1C1C1E",
                      borderColor: "#1C1C1E",
                      color: "#fff",
                    }
                  : {
                      backgroundColor: "#F9F9FB",
                      borderColor: "transparent",
                      color: "#3C3C43",
                    }
              }
            >
              {d}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <h3 className="text-[15px] font-bold text-[#1C1C1E] mb-3 flex items-center gap-2">
          <Wallet size={16} className="text-[#34C759]" /> Budget per person
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {BUDGETS.map((b) => (
            <motion.button
              key={b}
              whileTap={{ scale: 0.94 }}
              onClick={() => setBudget(b)}
              className="py-3 rounded-[14px] text-[13px] font-bold border-2 transition-all"
              style={
                budget === b
                  ? {
                      backgroundColor: "#34C759",
                      borderColor: "#34C759",
                      color: "#fff",
                    }
                  : {
                      backgroundColor: "#F9F9FB",
                      borderColor: "transparent",
                      color: "#3C3C43",
                    }
              }
            >
              {b}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-[15px] font-bold text-[#1C1C1E] mb-3 flex items-center gap-2">
          <Navigation size={16} className="text-[#FF9500]" /> Starting point
        </h3>
        <div className="relative">
          <MapPin
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. District 1, Ho Chi Minh City"
            className="w-full pl-11 pr-4 py-3.5 rounded-[16px] text-[15px] outline-none transition-all"
            style={{
              backgroundColor: "#F9F9FB",
              border: "1.5px solid #E5E5EA",
              color: "#1C1C1E",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#ff6b35")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E5EA")}
          />
        </div>
        <div className="flex gap-2 mt-2">
          {["District 1", "Bình Thạnh", "Phú Nhuận", "Thủ Đức"].map((loc) => (
            <button
              key={loc}
              onClick={() => setLocation(loc)}
              className="px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all"
              style={{
                backgroundColor: location === loc ? "#FFF3E0" : "#F2F2F7",
                borderColor: location === loc ? "#FF9500" : "transparent",
                color: location === loc ? "#FF9500" : "#8E8E93",
              }}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step 3: Generating ───────────────────────────────────────────────────────

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20 gap-8"
    >
      {/* AI orb */}
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, #ff6b35, #A855F7, #FF6B35, #34C759, #ff6b35)",
            padding: "3px",
          }}
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <Sparkles size={32} className="text-[#ff6b35]" />
          </div>
        </motion.div>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{ border: "1.5px solid rgba(0,122,255,0.2)" }}
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

      <div className="text-center">
        <h3 className="text-[22px] font-extrabold text-[#1C1C1E]">
          Crafting your itinerary
        </h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={msg}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-[14px] text-[#8E8E93] mt-2"
          >
            {msg}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {THINKING_MSGS.map((_, i) => (
          <motion.div
            key={i}
            className="h-1.5 rounded-full"
            animate={{
              width:
                i <= Math.min(msgIdx, THINKING_MSGS.length - 1)
                  ? "20px"
                  : "6px",
              backgroundColor:
                i <= Math.min(msgIdx, THINKING_MSGS.length - 1)
                  ? "#ff6b35"
                  : "#D1D1D6",
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
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
              width: 1,
              flex: 1,
              background: "#E5E5EA",
              margin: "4px 0",
              minHeight: 16,
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
              style={{
                backgroundColor: "#fff",
                borderRadius: 18,
                overflow: "hidden",
                border: active
                  ? `1.5px solid ${stop.accent}55`
                  : "1px solid rgba(0,0,0,0.05)",
                boxShadow: active
                  ? `0 8px 24px rgba(0,0,0,0.09)`
                  : "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.2s",
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
      {/* Summary banner */}
      <div
        style={{
          borderRadius: 22,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "linear-gradient(135deg, #1C1C1E, #2C2C2E)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: "rgba(255,193,7,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Map size={22} color="rgba(255,193,7,0.9)" />
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.2,
            }}
          >
            Afternoon Street Food Sprint
          </h3>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.45)",
              marginTop: 2,
            }}
          >
            {stops.length} stops · ~4.5 hours · Ho Chi Minh City
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "white" }}>
            305,000đ
          </p>
          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 12,
              justifyContent: "flex-end",
              color: "rgba(255,193,7,0.9)",
              marginTop: 2,
            }}
          >
            <Zap size={11} fill="currentColor" />
            {totalXp} XP
          </p>
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

          {/* Mini stat grid */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            {[
              {
                label: "Total Stops",
                value: `${stops.length} places`,
                color: "#ff6b35",
              },
              { label: "Est. Duration", value: "~4.5 hours", color: "#FF9500" },
              { label: "Budget", value: "305,000đ", color: "#34C759" },
              { label: "XP Earned", value: `+${totalXp} XP`, color: "#A855F7" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 14,
                  padding: "12px 14px",
                  border: "1px solid rgba(0,0,0,0.05)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    color: "#8E8E93",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{ fontSize: 15, fontWeight: 800, color, marginTop: 2 }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, paddingBottom: 24 }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRegen}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 16,
            fontSize: 14,
            fontWeight: 700,
            color: "#1C1C1E",
            backgroundColor: "#F2F2F7",
            border: "none",
            cursor: "pointer",
          }}
        >
          <RotateCcw size={15} /> Regenerate
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
            padding: "12px 20px",
            borderRadius: 16,
            fontSize: 15,
            fontWeight: 800,
            color: "white",
            background: "linear-gradient(135deg, #1A7AFF, #0057D9)",
            boxShadow: "0 6px 20px rgba(0,122,255,0.32)",
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

export default function AIPlanner() {
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [parsedHints, setParsedHints] = useState<Record<string, string>>({});

  const [mood, setMood] = useState<string | null>(null);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [group, setGroup] = useState<string | null>(null);
  const [duration, setDuration] = useState("4 hours");
  const [budget, setBudget] = useState("100–300k");
  const [location, setLocation] = useState("District 1");

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
        backgroundColor: "#F2F2F7",
        overflowY: "auto",
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
          backgroundColor: "rgba(242,242,247,0.88)",
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
            {(step === 1 || step >= 3) && (
              <Link href="/discover">
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  className="flex items-center gap-1 text-[#ff6b35] text-[15px] font-semibold"
                >
                  <ChevronLeft size={18} /> Discover
                </motion.button>
              </Link>
            )}
            <div className="w-px h-5 bg-[#D1D1D6]" />
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

      {/* ── CONTENT ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ width: "100%", maxWidth: step === 4 ? 1100 : 680 }}>
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
        </div>
      </div>
    </div>
  );
}

