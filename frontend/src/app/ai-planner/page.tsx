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
                  ? { backgroundColor: "#EAF2FF", borderColor: "#007AFF" }
                  : { backgroundColor: "#F9F9FB", borderColor: "transparent" }
              }
            >
              <span style={{ color: mood === m.id ? "#007AFF" : "#636366" }}>
                {m.icon}
              </span>
              <div>
                <p className="text-[14px] font-bold text-[#1C1C1E]">
                  {m.label}
                </p>
                <p className="text-[12px] text-[#8E8E93]">{m.desc}</p>
              </div>
              {mood === m.id && (
                <CheckCircle size={16} className="text-[#007AFF] ml-auto" />
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
                  ? { backgroundColor: "#EAF2FF", borderColor: "#007AFF" }
                  : { backgroundColor: "#F9F9FB", borderColor: "transparent" }
              }
            >
              <span
                style={{
                  color: group === g.id ? "#007AFF" : "#636366",
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
          <Clock size={16} className="text-[#007AFF]" /> How long?
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
            onFocus={(e) => (e.currentTarget.style.borderColor = "#007AFF")}
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
              "conic-gradient(from 0deg, #007AFF, #A855F7, #FF6B35, #34C759, #007AFF)",
            padding: "3px",
          }}
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <Sparkles size={32} className="text-[#007AFF]" />
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
                  ? "#007AFF"
                  : "#D1D1D6",
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Step 4: Result ───────────────────────────────────────────────────────────

function StepResult({
  stops,
  onRegen,
}: {
  stops: ItineraryStop[];
  onRegen: () => void;
}) {
  const totalCost = "305,000đ";
  const totalXp = stops.reduce((s, x) => s + x.xp, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5"
    >
      {/* Summary banner */}
      <div
        className="rounded-[22px] p-5 flex items-center gap-5"
        style={{
          background: "linear-gradient(135deg, #1C1C1E, #2C2C2E)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="w-12 h-12 rounded-[16px] flex items-center justify-center"
          style={{ background: "rgba(255,193,7,0.18)" }}
        >
          <Map size={24} style={{ color: "rgba(255,193,7,0.9)" }} />
        </div>
        <div className="flex-1">
          <h3 className="text-[18px] font-extrabold text-white">
            Afternoon Street Food Sprint
          </h3>
          <p
            className="text-[13px]"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            5 stops · ~4.5 hours · Ho Chi Minh City
          </p>
        </div>
        <div className="text-right">
          <p className="text-[14px] font-extrabold text-white">{totalCost}</p>
          <p
            className="flex items-center gap-1 text-[12px] justify-end"
            style={{ color: "rgba(255,193,7,0.9)" }}
          >
            <Zap size={11} fill="currentColor" />
            {totalXp} XP
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex flex-col">
        {stops.map((stop, i) => (
          <motion.div
            key={stop.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-4"
          >
            {/* Timeline line */}
            <div className="flex flex-col items-center w-10 flex-shrink-0">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{
                  backgroundColor: stop.accent,
                  boxShadow: `0 4px 12px ${stop.accent}44`,
                }}
              >
                {STOP_CATEGORY_ICON[stop.category] ?? <Utensils size={16} />}
              </div>
              {i < stops.length - 1 && (
                <div className="flex flex-col items-center gap-0.5 mt-1 mb-1">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div
                      key={j}
                      className="w-px h-1.5 rounded-full bg-[#D1D1D6]"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Stop content */}
            <div className="flex-1 min-w-0 pb-5">
              <div
                className="bg-white rounded-[18px] overflow-hidden"
                style={{
                  border: "1px solid rgba(0,0,0,0.05)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                }}
              >
                <div className="h-[120px] relative overflow-hidden">
                  <img
                    src={stop.img}
                    alt={stop.name}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)",
                    }}
                  />
                  <div className="absolute bottom-2 left-3">
                    <p className="text-white font-extrabold text-[15px] leading-tight">
                      {stop.name}
                    </p>
                    <p className="text-[rgba(255,255,255,0.7)] text-[11px]">
                      {stop.category}
                    </p>
                  </div>
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <span
                      className="text-[12px] font-bold px-2.5 py-1 rounded-full text-white"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.35)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {stop.time}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[12px] text-[#636366] italic leading-relaxed">
                    &ldquo;{stop.reason}&rdquo;
                  </p>
                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-center gap-3 text-[12px] text-[#8E8E93]">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {stop.address.split(",")[0]}
                      </span>
                      <span className="font-semibold text-[#1C1C1E]">
                        {stop.cost}
                      </span>
                    </div>
                    <span
                      className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#FFF3C4", color: "#CC8B00" }}
                    >
                      <Zap size={10} fill="currentColor" />+{stop.xp} XP
                    </span>
                  </div>
                  {stop.travelToNext && (
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#F2F2F7]">
                      <ArrowRight size={11} className="text-[#8E8E93]" />
                      <span className="text-[11px] text-[#8E8E93]">
                        {stop.travelToNext} to next stop
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRegen}
          className="flex items-center gap-2 px-5 py-3.5 rounded-[16px] text-[14px] font-bold text-[#1C1C1E] bg-[#F2F2F7] hover:bg-[#E5E5EA] transition"
        >
          <RotateCcw size={15} /> Regenerate
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-[16px] text-[15px] font-extrabold text-white"
          style={{
            background: "linear-gradient(135deg, #1A7AFF, #0057D9)",
            boxShadow: "0 6px 20px rgba(0,122,255,0.32)",
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

  // Step 1
  const [mood, setMood] = useState<string | null>(null);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [group, setGroup] = useState<string | null>(null);

  // Step 2
  const [duration, setDuration] = useState("4 hours");
  const [budget, setBudget] = useState("100–300k");
  const [location, setLocation] = useState("District 1");

  const toggleCuisine = (c: string) =>
    setCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const canProceed1 = !!mood && !!group;
  const canProceed2 = !!location.trim();

  const handleGenerate = () => setStep(3);
  const handleRegen = () => {
    setStep(3);
  };
  const handleDone = () => setStep(4);

  const STEP_LABELS = ["Preferences", "Settings", "Generating", "Your Plan"];

  return (
    <div
      className="no-scrollbar"
      style={{
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
                className="flex items-center gap-1 text-[#007AFF] text-[15px] font-semibold"
              >
                <ChevronLeft size={18} /> Back
              </motion.button>
            )}
            {(step === 1 || step >= 3) && (
              <Link href="/discover">
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  className="flex items-center gap-1 text-[#007AFF] text-[15px] font-semibold"
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
                  background: "linear-gradient(135deg, #007AFF, #A855F7)",
                }}
              >
                <Sparkles size={16} className="text-white" />
              </div>
              <h1 className="text-[20px] font-extrabold text-[#1C1C1E] tracking-tight">
                AI Food Planner
              </h1>
            </div>
          </div>

          {/* Step indicator */}
          {step < 3 && (
            <div className="flex items-center gap-2">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all"
                      style={
                        step >= s
                          ? { backgroundColor: "#007AFF", color: "#fff" }
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
        {/* Progress bar */}
        {step < 3 && (
          <div className="h-0.5 bg-[#E5E5EA]">
            <motion.div
              className="h-full bg-[#007AFF]"
              animate={{ width: `${(step / 2) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 flex flex-col items-center px-8 py-8">
        <div className="w-full max-w-[680px]">
          {step < 3 && (
            <div className="mb-6">
              <h2 className="text-[26px] font-extrabold text-[#1C1C1E] tracking-tight">
                {step === 1 ? "Tell me about yourself" : "Set your parameters"}
              </h2>
              <p className="text-[14px] text-[#8E8E93] mt-1">
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

          {/* CTA button */}
          {(step === 1 || step === 2) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <motion.button
                whileHover={{ scale: canProceed1 ? 1.02 : 1 }}
                whileTap={{ scale: canProceed1 ? 0.97 : 1 }}
                onClick={step === 1 ? () => setStep(2) : handleGenerate}
                disabled={step === 1 ? !canProceed1 : !canProceed2}
                className="w-full py-4 rounded-[18px] text-[16px] font-extrabold text-white flex items-center justify-center gap-2 transition-all"
                style={
                  (step === 1 ? canProceed1 : canProceed2)
                    ? {
                        background: "linear-gradient(135deg, #1A7AFF, #0057D9)",
                        boxShadow: "0 8px 24px rgba(0,122,255,0.32)",
                      }
                    : { background: "#E5E5EA", color: "#A8A8AD" }
                }
              >
                {step === 1 ? (
                  <>
                    Continue <ChevronRight size={18} />
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Generate My Itinerary
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
