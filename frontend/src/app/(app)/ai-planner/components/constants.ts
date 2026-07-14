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
