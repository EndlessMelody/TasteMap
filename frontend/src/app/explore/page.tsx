"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Clock,
  Star,
  X,
  SlidersHorizontal,
  Navigation,
  ChevronRight,
  Sparkles,
  Coffee,
  Utensils,
  Moon,
  Flame,
  Soup,
  IceCreamCone,
  Fish,
  Croissant,
  SearchX,
} from "lucide-react";

const CATEGORY_ICON: Record<string, React.ReactElement> = {
  Vietnamese: <Soup size={12} />,
  Cafe: <Coffee size={12} />,
  Ramen: <Soup size={12} />,
  BBQ: <Flame size={12} />,
  "Street Food": <Utensils size={12} />,
  Dessert: <IceCreamCone size={12} />,
  Japanese: <Fish size={12} />,
  Healthy: <Sparkles size={12} />,
  Bakery: <Croissant size={12} />,
};

const MapWidget = dynamic(() => import("@/components/MapWidget"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#F2F2F7] flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-[#E5E5EA] border-t-[#ff6b35] animate-spin" />
    </div>
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface Spot {
  id: number;
  name: string;
  category: string;
  emoji: string;
  accent: string;
  lat: number;
  lon: number;
  rating: number;
  reviewCount: number;
  priceLevel: 1 | 2 | 3;
  isOpen: boolean;
  closesAt: string;
  distance: string;
  img: string;
  description: string;
  tags: string[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SPOTS: Spot[] = [
  {
    id: 1,
    name: "Phở Bò 36",
    category: "Vietnamese",
    emoji: "🍜",
    accent: "#ED1B24",
    lat: 10.897,
    lon: 106.772,
    rating: 4.9,
    reviewCount: 312,
    priceLevel: 2,
    isOpen: true,
    closesAt: "11 PM",
    distance: "0.3 km",
    img: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&h=400&fit=crop",
    description:
      "Classic northern-style pho with slow-cooked bone broth, hand-cut rice noodles, and fresh herb plates.",
    tags: ["Noodles", "Authentic", "Local Fav"],
  },
  {
    id: 2,
    name: "Matcha Room",
    category: "Cafe",
    emoji: "🍵",
    accent: "#2A9D8F",
    lat: 10.901,
    lon: 106.769,
    rating: 4.7,
    reviewCount: 198,
    priceLevel: 2,
    isOpen: true,
    closesAt: "10 PM",
    distance: "0.6 km",
    img: "https://images.unsplash.com/photo-1582787895088-2ff176b668d2?w=600&h=400&fit=crop",
    description:
      "Japanese-inspired specialty cafe with premium ceremonial-grade matcha, aesthetic interiors, and calm vibes.",
    tags: ["Matcha", "Aesthetic", "Chill"],
  },
  {
    id: 3,
    name: "Neon Ramen House",
    category: "Ramen",
    emoji: "🍜",
    accent: "#F97316",
    lat: 10.895,
    lon: 106.778,
    rating: 4.8,
    reviewCount: 254,
    priceLevel: 2,
    isOpen: true,
    closesAt: "11:30 PM",
    distance: "0.9 km",
    img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop",
    description:
      "Tonkotsu heaven. Rich 18-hour broth, perfectly tender chashu, and that addictive neon-lit atmosphere.",
    tags: ["Ramen", "Japanese", "Late Night"],
  },
  {
    id: 4,
    name: "BBQ Midnight",
    category: "BBQ",
    emoji: "🍖",
    accent: "#E76F51",
    lat: 10.903,
    lon: 106.774,
    rating: 4.5,
    reviewCount: 176,
    priceLevel: 3,
    isOpen: true,
    closesAt: "1 AM",
    distance: "1.1 km",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop",
    description:
      "Open-fire charcoal BBQ with premium wagyu cuts, live acoustic music, and outdoor seating under the stars.",
    tags: ["BBQ", "Late Night", "Wagyu"],
  },
  {
    id: 5,
    name: "Bánh Mì Cô Ba",
    category: "Street Food",
    emoji: "🥖",
    accent: "#F59E0B",
    lat: 10.899,
    lon: 106.77,
    rating: 4.6,
    reviewCount: 430,
    priceLevel: 1,
    isOpen: true,
    closesAt: "7 PM",
    distance: "0.2 km",
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
    description:
      "Legendary 30-year-old street stall. Crispy baguette with pâté, house-made pickled daikon, and signature chilli sauce.",
    tags: ["Bánh Mì", "Quick Bite", "Iconic"],
  },
  {
    id: 6,
    name: "Chè Ngon Lắm",
    category: "Dessert",
    emoji: "🍮",
    accent: "#A855F7",
    lat: 10.893,
    lon: 106.775,
    rating: 4.4,
    reviewCount: 142,
    priceLevel: 1,
    isOpen: true,
    closesAt: "9 PM",
    distance: "0.7 km",
    img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop",
    description:
      "Seven-layer dessert bar serving traditional chè ba màu, taro soup, and seasonal coconut-based sweets.",
    tags: ["Dessert", "Sweet", "Traditional"],
  },
  {
    id: 7,
    name: "Hidden Cafe Rooftop",
    category: "Cafe",
    emoji: "☕",
    accent: "#ff6b35",
    lat: 10.906,
    lon: 106.767,
    rating: 4.6,
    reviewCount: 89,
    priceLevel: 3,
    isOpen: true,
    closesAt: "10 PM",
    distance: "1.3 km",
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop",
    description:
      "Secret rooftop with panoramic city views, single-origin pour-overs, and a menu that changes weekly.",
    tags: ["Hidden Gem", "Specialty", "View"],
  },
  {
    id: 8,
    name: "Hủ Tiếu Chú Sáu",
    category: "Vietnamese",
    emoji: "🍜",
    accent: "#EC4899",
    lat: 10.892,
    lon: 106.78,
    rating: 4.9,
    reviewCount: 521,
    priceLevel: 1,
    isOpen: false,
    closesAt: "2 PM",
    distance: "1.0 km",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    description:
      "Dawn-to-noon only. The most sought-after dry hủ tiếu in the city — silky noodles, crispy pork cracklings, rich broth.",
    tags: ["Breakfast", "Iconic", "Cash Only"],
  },
  {
    id: 9,
    name: "Sushi Yuki",
    category: "Japanese",
    emoji: "🍣",
    accent: "#3B82F6",
    lat: 10.908,
    lon: 106.771,
    rating: 4.7,
    reviewCount: 167,
    priceLevel: 3,
    isOpen: true,
    closesAt: "10:30 PM",
    distance: "1.5 km",
    img: "https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=600&h=400&fit=crop",
    description:
      "Intimate 14-seat omakase counter. Chef Yuki sources daily from Tsukiji market to deliver an authentic Tokyo experience.",
    tags: ["Omakase", "Premium", "Reservation"],
  },
  {
    id: 10,
    name: "Bún Riêu Cua Đồng",
    category: "Vietnamese",
    emoji: "🦀",
    accent: "#10B981",
    lat: 10.896,
    lon: 106.783,
    rating: 4.8,
    reviewCount: 287,
    priceLevel: 1,
    isOpen: true,
    closesAt: "6 PM",
    distance: "0.8 km",
    img: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&h=400&fit=crop",
    description:
      "Tangy tomato-based crab broth with hand-pounded fresh crab paste, vermicelli, and fried tofu puffs.",
    tags: ["Noodles", "Crab", "Morning Only"],
  },
  {
    id: 11,
    name: "Coffee Blend Lab",
    category: "Cafe",
    emoji: "🧪",
    accent: "#8B5CF6",
    lat: 10.904,
    lon: 106.776,
    rating: 4.5,
    reviewCount: 93,
    priceLevel: 2,
    isOpen: true,
    closesAt: "9 PM",
    distance: "1.2 km",
    img: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&h=400&fit=crop",
    description:
      "Lab-style specialty roastery. Rotating origin selection, cold brew on nitro tap, and monthly cupping events.",
    tags: ["Specialty", "Lab", "Pour-Over"],
  },
  {
    id: 12,
    name: "Nem Nướng Cuốn",
    category: "Street Food",
    emoji: "🌯",
    accent: "#F97316",
    lat: 10.898,
    lon: 106.768,
    rating: 4.3,
    reviewCount: 204,
    priceLevel: 1,
    isOpen: true,
    closesAt: "8 PM",
    distance: "0.4 km",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
    description:
      "DIY roll-your-own station — grilled pork skewers, fresh herbs, rice paper, and three house dipping sauces.",
    tags: ["Street Food", "DIY", "Fun"],
  },
];

const CATEGORIES = [
  "All",
  "Vietnamese",
  "Cafe",
  "Ramen",
  "Street Food",
  "BBQ",
  "Dessert",
  "Japanese",
];
const PRICE_ICONS = ["", "💰", "💰💰", "💰💰💰"];
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  All: <Sparkles size={14} />,
  Vietnamese: <Utensils size={14} />,
  Cafe: <Coffee size={14} />,
  Ramen: <Flame size={14} />,
  "Street Food": <Moon size={14} />,
  BBQ: <Flame size={14} />,
  Dessert: <Sparkles size={14} />,
  Japanese: <Utensils size={14} />,
};

// ─── Spot Card ────────────────────────────────────────────────────────────────

function SpotCard({
  spot,
  selected,
  onClick,
}: {
  spot: Spot;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ x: 3 }}
      onClick={onClick}
      className="flex gap-3 p-3 rounded-[16px] cursor-pointer transition-colors"
      style={{
        backgroundColor: selected ? `${spot.accent}10` : "transparent",
        border: selected
          ? `1.5px solid ${spot.accent}40`
          : "1.5px solid transparent",
      }}
    >
      <div className="w-[72px] h-[72px] rounded-[12px] overflow-hidden flex-shrink-0">
        <img
          src={spot.img}
          alt={spot.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-[14px] font-bold text-[#1C1C1E] truncate leading-tight">
            {spot.name}
          </h4>
          <span
            className="text-[11px] font-semibold whitespace-nowrap"
            style={{ color: spot.isOpen ? "#34C759" : "#FF3B30" }}
          >
            {spot.isOpen ? `Until ${spot.closesAt}` : "Closed"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[#8E8E93]">
            {CATEGORY_ICON[spot.category] ?? <Utensils size={12} />}
          </span>
          <span className="text-[12px] text-[#8E8E93]">{spot.category}</span>
          <span className="text-[#D1D1D6]">·</span>
          <span className="text-[12px] text-[#8E8E93]">
            {PRICE_ICONS[spot.priceLevel]}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-[12px] text-[#FBBF24] font-semibold">
            <Star size={11} fill="currentColor" /> {spot.rating}
            <span className="text-[#C7C7CC] font-normal">
              ({spot.reviewCount})
            </span>
          </span>
          <span className="flex items-center gap-1 text-[12px] text-[#8E8E93]">
            <MapPin size={11} /> {spot.distance}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Detail Overlay ───────────────────────────────────────────────────────────

function DetailOverlay({ spot, onClose }: { spot: Spot; onClose: () => void }) {
  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 120, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="absolute bottom-5 left-5 right-5 z-10 bg-white rounded-[24px] overflow-hidden"
      style={{
        boxShadow: "0 16px 48px rgba(0,0,0,0.16)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex gap-4 p-4">
        <div className="w-[100px] h-[100px] rounded-[16px] overflow-hidden flex-shrink-0">
          <img
            src={spot.img}
            alt={spot.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[18px] font-extrabold text-[#1C1C1E] leading-tight">
                {spot.name}
              </h3>
              <p className="text-[13px] text-[#8E8E93] mt-0.5 flex items-center gap-1">
                {CATEGORY_ICON[spot.category] ?? <Utensils size={12} />}{" "}
                {spot.category} · {PRICE_ICONS[spot.priceLevel]}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#F2F2F7] text-[#8E8E93] hover:bg-[#E5E5EA] transition flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-[13px] text-[#636366] mt-2 leading-relaxed line-clamp-2">
            {spot.description}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-[13px] font-bold text-[#FBBF24]">
              <Star size={13} fill="currentColor" /> {spot.rating}
            </span>
            <span className="flex items-center gap-1 text-[13px] text-[#8E8E93]">
              <MapPin size={12} /> {spot.distance}
            </span>
            <span
              className="flex items-center gap-1 text-[13px]"
              style={{ color: spot.isOpen ? "#34C759" : "#FF3B30" }}
            >
              <Clock size={12} />{" "}
              {spot.isOpen ? `Open · closes ${spot.closesAt}` : "Closed now"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 px-4 pb-4">
        <div className="flex gap-1.5 flex-1 flex-wrap">
          {spot.tags.map((t) => (
            <span
              key={t}
              className="text-[11px] font-semibold px-2 py-1 rounded-full"
              style={{
                backgroundColor: spot.accent + "15",
                color: spot.accent,
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <motion.a
          href="/ai-planner"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[12px] text-[13px] font-bold text-white flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${spot.accent}, ${spot.accent}cc)`,
            boxShadow: `0 4px 12px ${spot.accent}40`,
          }}
        >
          Plan Visit <ChevronRight size={14} />
        </motion.a>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [openOnly, setOpenOnly] = useState(false);
  const [priceMax, setPriceMax] = useState<1 | 2 | 3>(3);
  const [selected, setSelected] = useState<Spot | null>(null);

  const filtered = useMemo(
    () =>
      SPOTS.filter((s) => {
        const matchCat = category === "All" || s.category === category;
        const matchOpen = !openOnly || s.isOpen;
        const matchPrice = s.priceLevel <= priceMax;
        const matchQ =
          !search ||
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.category.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchOpen && matchPrice && matchQ;
      }),
    [category, openOnly, priceMax, search],
  );

  const mapCenter: [number, number] = selected
    ? [selected.lat, selected.lon]
    : [10.899, 106.774];
  const mapZoom = selected ? 17 : 15;
  const mapPoints = filtered.map((s) => [s.lat, s.lon] as [number, number]);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* ── LEFT PANEL ── */}
      <div
        className="no-scrollbar"
        style={{
          width: "360px",
          flexShrink: 0,
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 20px 16px",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Navigation size={20} className="text-[#ff6b35]" />
            <h1 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight">
              Explore
            </h1>
          </div>
          <p className="text-[13px] text-[#8E8E93]">
            {filtered.length} spots · Ho Chi Minh City
          </p>

          {/* Search */}
          <div className="relative mt-3">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search spots, cuisines..."
              className="w-full pl-9 pr-9 py-2.5 rounded-[12px] text-[14px] outline-none transition-all"
              style={{
                backgroundColor: "#F2F2F7",
                border: "1.5px solid transparent",
                color: "#1C1C1E",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#ff6b35")}
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "transparent")
              }
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93]"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category chips */}
        <div
          className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
        >
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.93 }}
              onClick={() => setCategory(cat)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap border transition-all"
              style={
                category === cat
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
              {CATEGORY_ICONS[cat]} {cat}
            </motion.button>
          ))}
        </div>

        {/* Filters row */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
        >
          <SlidersHorizontal size={14} className="text-[#8E8E93]" />
          {/* Open Now toggle */}
          <button
            onClick={() => setOpenOnly((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all"
            style={
              openOnly
                ? {
                    backgroundColor: "#34C759",
                    borderColor: "#34C759",
                    color: "#fff",
                  }
                : {
                    backgroundColor: "#F2F2F7",
                    borderColor: "transparent",
                    color: "#3C3C43",
                  }
            }
          >
            <Clock size={12} /> Open Now
          </button>
          {/* Price filter */}
          <div className="flex gap-1">
            {([1, 2, 3] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriceMax(p)}
                className="px-2.5 py-1.5 rounded-full text-[11px] font-bold border transition-all"
                style={
                  priceMax === p
                    ? {
                        backgroundColor: "#1C1C1E",
                        borderColor: "#1C1C1E",
                        color: "#fff",
                      }
                    : {
                        backgroundColor: "#F2F2F7",
                        borderColor: "transparent",
                        color: "#8E8E93",
                      }
                }
              >
                {PRICE_ICONS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Spot list */}
        <div className="flex flex-col px-3 py-2 gap-1">
          <AnimatePresence>
            {filtered.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                selected={selected?.id === spot.id}
                onClick={() =>
                  setSelected((prev) => (prev?.id === spot.id ? null : spot))
                }
              />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center gap-2">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(142,142,147,0.1)",
                  color: "#8E8E93",
                }}
              >
                <SearchX size={28} />
              </div>
              <p className="text-[15px] font-bold text-[#1C1C1E]">
                No spots match
              </p>
              <p className="text-[13px] text-[#8E8E93]">
                Try clearing some filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── MAP ── */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapWidget
          mapId="explore-main"
          points={mapPoints}
          center={mapCenter}
          zoom={mapZoom}
          showBanner={false}
        />
        <AnimatePresence>
          {selected && (
            <DetailOverlay spot={selected} onClose={() => setSelected(null)} />
          )}
        </AnimatePresence>

        {/* Spot count badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3.5 py-2 rounded-full"
          style={{
            backgroundColor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <MapPin size={14} className="text-[#ff6b35]" />
          <span className="text-[13px] font-bold text-[#1C1C1E]">
            {filtered.length} spots
          </span>
        </motion.div>
      </div>
    </div>
  );
}
