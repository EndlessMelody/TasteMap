import React from "react";
import {
  Smile,
  Flame,
  Heart,
  Users,
  User,
  PartyPopper,
  Utensils,
  Soup,
  Coffee,
  IceCreamCone,
  Fish,
} from "lucide-react";
import type { ItineraryStop } from "./types";

export const STOP_CATEGORY_ICON: Record<string, React.ReactElement> = {
  "Street Food": React.createElement(Utensils, { size: 16 }),
  Vietnamese: React.createElement(Soup, { size: 16 }),
  Cafe: React.createElement(Coffee, { size: 16 }),
  Ramen: React.createElement(Soup, { size: 16 }),
  Dessert: React.createElement(IceCreamCone, { size: 16 }),
  Japanese: React.createElement(Fish, { size: 16 }),
  BBQ: React.createElement(Flame, { size: 16 }),
};

export const MOODS = [
  {
    id: "casual",
    label: "Casual",
    icon: React.createElement(Smile, { size: 28 }),
    desc: "Relaxed, no rush",
    emoji: "😌",
    gradient: "linear-gradient(135deg, #FFF5E6, #FFE8CC)",
    accentColor: "#FF9500",
  },
  {
    id: "adventurous",
    label: "Adventurous",
    icon: React.createElement(Flame, { size: 28 }),
    desc: "New & unexpected",
    emoji: "🔥",
    gradient: "linear-gradient(135deg, #FFF0E6, #FFE0CC)",
    accentColor: "#FF6B35",
  },
  {
    id: "romantic",
    label: "Romantic",
    icon: React.createElement(Heart, { size: 28 }),
    desc: "Date-night vibes",
    emoji: "💕",
    gradient: "linear-gradient(135deg, #FFF0F5, #FFE0EB)",
    accentColor: "#FF2D78",
  },
  {
    id: "family",
    label: "Family",
    icon: React.createElement(Users, { size: 28 }),
    desc: "All-ages friendly",
    emoji: "👨‍👩‍👧‍👦",
    gradient: "linear-gradient(135deg, #E8F8F0, #D0F0E0)",
    accentColor: "#34C759",
  },
];

export const CUISINES = [
  { label: "Vietnamese", emoji: "🍜", color: "#ED1B24" },
  { label: "Cafe", emoji: "☕", color: "#8B6914" },
  { label: "Ramen", emoji: "🍥", color: "#F97316" },
  { label: "Street Food", emoji: "🥖", color: "#F59E0B" },
  { label: "BBQ", emoji: "🔥", color: "#DC2626" },
  { label: "Japanese", emoji: "🍣", color: "#E11D48" },
  { label: "Dessert", emoji: "🍰", color: "#A855F7" },
  { label: "Healthy", emoji: "🥗", color: "#22C55E" },
];

export const GROUPS = [
  {
    id: "solo",
    label: "Solo",
    icon: React.createElement(User, { size: 24 }),
    desc: "Just me",
    emoji: "🧑",
  },
  {
    id: "duo",
    label: "Couple",
    icon: React.createElement(Heart, { size: 24 }),
    desc: "2 people",
    emoji: "💑",
  },
  {
    id: "small",
    label: "Small Group",
    icon: React.createElement(Users, { size: 24 }),
    desc: "3–5 people",
    emoji: "👥",
  },
  {
    id: "large",
    label: "Large Group",
    icon: React.createElement(PartyPopper, { size: 24 }),
    desc: "6+ people",
    emoji: "🎉",
  },
];

export const DURATIONS = [
  { label: "2 hours", icon: "⚡", desc: "Quick bite" },
  { label: "4 hours", icon: "☀️", desc: "Afternoon" },
  { label: "Half Day", icon: "🌤️", desc: "5–6 hours" },
  { label: "Full Day", icon: "🌅", desc: "8+ hours" },
];

export const BUDGETS = [
  { label: "< 100k", icon: "💰", desc: "Thrifty" },
  { label: "100–300k", icon: "💳", desc: "Mid-range" },
  { label: "300–500k", icon: "💎", desc: "Premium" },
  { label: "500k+", icon: "👑", desc: "No limits" },
];

export const THINKING_MSGS = [
  "Analysing your Taste DNA...",
  "Cross-referencing 2,400 local reviews...",
  "Optimising route for your mood...",
  "Calculating XP potential...",
  "Checking real-time open hours...",
  "Finalising your perfect itinerary...",
];

export const MOOD_AMBIENCE: Record<string, { from: string; accent: string }> = {
  casual: { from: "rgba(255,107,53,0.07)", accent: "#ff6b35" },
  adventurous: { from: "rgba(255,107,53,0.09)", accent: "#FF6B35" },
  romantic: { from: "rgba(255,45,120,0.07)", accent: "#FF2D78" },
  family: { from: "rgba(52,199,89,0.07)", accent: "#34C759" },
};

export const SWAP_POOL: ItineraryStop[] = [
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

export const MOCK_ITINERARIES: Record<string, ItineraryStop[]> = {
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

export const RECENT_PLANS = [
  { name: "Street Food Night", stops: 3, cost: "120,000đ", emoji: "🌃" },
  { name: "Cafe Hopping", stops: 5, cost: "250,000đ", emoji: "☕" },
  { name: "Phở Family Lunch", stops: 2, cost: "180,000đ", emoji: "🍜" },
];

export const MAP_POS: [number, number][] = [
  [100, 118],
  [205, 72],
  [68, 162],
  [160, 248],
  [112, 318],
];

export function parsePrompt(text: string): Record<string, string> {
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
      v < 100 ? "< 100k" : v <= 300 ? "100–300k" : v <= 500 ? "300–500k" : "500k+";
  }
  if (/district 1|quận 1/.test(t)) r.location = "District 1";
  else if (/bình thạnh|binh thanh/.test(t)) r.location = "Bình Thạnh";
  else if (/phú nhuận|phu nhuan/.test(t)) r.location = "Phú Nhuận";
  return r;
}
