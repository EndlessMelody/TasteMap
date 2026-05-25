"use client";

import React, { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { apiPost, apiGet } from "@/lib/api";
import { normalizeImageUrl } from "@/lib/image-utils";
import MapWidget from "@/components/MapWidget";
import {
  Search,
  Camera,
  BookOpen,
  Sparkles,
  Clock,
  Wine,
  Lightbulb,
  X,
  Loader2,
  Globe,
  ChevronRight,
  Flame,
  MapPin,
  Soup,
  Sandwich,
  Coffee,
  Utensils,
} from "lucide-react";
import {
  Page,
  Card,
  Button,
  IconButton,
  Field,
  Pill,
  H1,
  H2,
  H3,
  Body,
  BodySm,
  Caption,
  Eyebrow,
  EmptyState,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CultureStorySection {
  title: string;
  content: string;
  icon?: string | null;
}

interface CultureStoryResponse {
  food_name: string;
  food_name_local?: string | null;
  identified_from_image: boolean;
  confidence?: number | null;
  image_url?: string | null;
  sections: CultureStorySection[];
  taste_tags: string[];
  pairing_suggestions: string[];
  when_to_eat?: string | null;
  fun_fact?: string | null;
}

interface LocationItem {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address?: string | null;
  city?: string | null;
  category?: string | null;
  image_url?: string | null;
  price_range?: string | null;
  open_hours?: string | null;
  rating?: number | null;
  characteristics?: Record<string, unknown> | null;
}

interface LocationListResponse {
  items: LocationItem[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Theme data ────────────────────────────────────────────────────────────────

const SECTION_ICONS: Record<string, React.ReactNode> = {
  "Origin Story": <Globe size={18} strokeWidth={1.75} />,
  "Cultural Significance": <BookOpen size={18} strokeWidth={1.75} />,
  "How Locals Eat It": <Sparkles size={18} strokeWidth={1.75} />,
  "The Science of Flavor": <Lightbulb size={18} strokeWidth={1.75} />,
  Origin: <Globe size={18} strokeWidth={1.75} />,
  History: <BookOpen size={18} strokeWidth={1.75} />,
  Flavor: <Sparkles size={18} strokeWidth={1.75} />,
  Taste: <Sparkles size={18} strokeWidth={1.75} />,
  Preparation: <Lightbulb size={18} strokeWidth={1.75} />,
  Cooking: <Flame size={18} strokeWidth={1.75} />,
  Seasonal: <Clock size={18} strokeWidth={1.75} />,
  "Best Places": <MapPin size={18} strokeWidth={1.75} />,
};

const SECTION_ACCENT: Record<string, string> = {
  "Origin Story": "#2A5EA0",
  "Cultural Significance": "#6B42B8",
  "How Locals Eat It": "#C04B6F",
  "The Science of Flavor": "#3A7A3A",
  Origin: "#2A5EA0",
  History: "#6B42B8",
  Flavor: "#C04B6F",
  Taste: "#C04B6F",
  Preparation: "#3A7A3A",
  Cooking: "#C97A10",
  Seasonal: "#2A7A5A",
  "Best Places": "#7A5230",
};

const DISH_THEMES = [
  { bg: "#FFF4DC", accent: "#B8690A", iconBg: "#FFE4A0", iconColor: "#7A4200" },
  { bg: "#FDEEF2", accent: "#B8335A", iconBg: "#F9C0D0", iconColor: "#7A0A2A" },
  { bg: "#EEF6EE", accent: "#2E6E2E", iconBg: "#C0E0C0", ionColor: "#0A4A0A" },
  { bg: "#F2EDFC", accent: "#5E38A8", iconBg: "#D0C0F5", iconColor: "#2E0880" },
  { bg: "#FEF0E6", accent: "#B84010", iconBg: "#F9C0A0", iconColor: "#701000" },
  { bg: "#E6F8F0", accent: "#1E6E4A", iconBg: "#A8E8C8", iconColor: "#004828" },
  { bg: "#F5EDE4", accent: "#6A4220", iconBg: "#DEC0A0", iconColor: "#3A1A00" },
  { bg: "#E6F2FE", accent: "#1E4E90", iconBg: "#A8C8F5", iconColor: "#001E60" },
];

const SUGGESTED_DISHES = [
  { name: "Phở", icon: <Soup size={22} strokeWidth={1.75} />, tag: "National soul", mood: "Slow-simmer comfort" },
  { name: "Bánh Mì", icon: <Sandwich size={22} strokeWidth={1.75} />, tag: "Street icon", mood: "Crunchy, bold, portable" },
  { name: "Bún Chả", icon: <Utensils size={22} strokeWidth={1.75} />, tag: "Hanoi classic", mood: "Smoky grill ritual" },
  { name: "Cơm Tấm", icon: <Utensils size={22} strokeWidth={1.75} />, tag: "Saigon soul", mood: "Everyday comfort plate" },
  { name: "Bánh Xèo", icon: <Flame size={22} strokeWidth={1.75} />, tag: "Golden crispy", mood: "Sizzle and fresh herbs" },
  { name: "Gỏi Cuốn", icon: <Utensils size={22} strokeWidth={1.75} />, tag: "Fresh roll", mood: "Light, bright, herbal" },
  { name: "Cà Phê Sữa Đá", icon: <Coffee size={22} strokeWidth={1.75} />, tag: "Essential", mood: "Bittersweet energy" },
  { name: "Hủ Tiếu", icon: <Soup size={22} strokeWidth={1.75} />, tag: "Southern bowl", mood: "Clear broth and aroma" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CulturePage() {
  useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [story, setStory] = useState<CultureStoryResponse | null>(null);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mapCenter: [number, number] = useMemo(() => {
    if (locations.length > 0) {
      const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
      const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;
      return [avgLat, avgLng];
    }
    return [10.897, 106.772];
  }, [locations]);

  const mapPoints: [number, number][] = useMemo(
    () => locations.map((loc) => [loc.lat, loc.lng]),
    [locations],
  );

  const handleSearch = async (foodName?: string) => {
    const query = foodName || searchQuery.trim();
    if (!query) return;
    setLoading(true);
    setError(null);
    setStory(null);
    setLocations([]);
    setActiveSection(0);
    try {
      const [storyResult, locationsResult] = await Promise.all([
        apiPost<CultureStoryResponse>("/api/v1/culture/story", { food_name: query, language: "vi" }),
        apiGet<LocationListResponse>(`/api/v1/locations/by-food/${encodeURIComponent(query)}?limit=12`),
      ]);
      setStory(storyResult);
      setLocations(locationsResult.items || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setStory(null);
    setActiveSection(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", "vi");
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`${BASE_URL}/api/v1/culture/identify-upload?language=vi`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const result: CultureStoryResponse = await res.json();
      setStory(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to identify dish from image.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const previewImageUrl = story ? normalizeImageUrl(story.image_url) : null;
  const hasMetadata = Boolean(story?.when_to_eat || (story?.pairing_suggestions?.length ?? 0) > 0 || story?.fun_fact);

  return (
    <Page>
      <div style={{ maxWidth: 860, margin: "0 auto", width: "100%" }}>

        {/* ── Hero banner (gradient + search inside) ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "relative",
            borderRadius: tokens.radius.xl,
            overflow: "hidden",
            background: "linear-gradient(135deg, #FFCFAA 0%, #FFDDBE 30%, #FFEEDF 60%, #FFF7F2 100%)",
            padding: `${tokens.space[8]} ${tokens.space[6]} ${tokens.space[6]}`,
            marginBottom: tokens.space[8],
            boxShadow: "0 6px 40px rgba(255,140,60,0.2), 0 1px 6px rgba(255,140,60,0.12)",
          }}
        >
          {/* Floating food emojis — decorative, non-interactive */}
          <div style={{ position: "absolute", top: 22, right: 100, pointerEvents: "none", transform: "rotate(14deg)" }}>
            <span style={{ fontSize: 44, opacity: 0.22, display: "block", animation: "floatA 4.2s ease-in-out infinite" }}>🍜</span>
          </div>
          <div style={{ position: "absolute", top: 60, right: 38, pointerEvents: "none", transform: "rotate(-9deg)" }}>
            <span style={{ fontSize: 32, opacity: 0.18, display: "block", animation: "floatB 5.1s ease-in-out infinite 0.6s" }}>🍣</span>
          </div>
          <div style={{ position: "absolute", bottom: 48, right: 120, pointerEvents: "none", transform: "rotate(7deg)" }}>
            <span style={{ fontSize: 36, opacity: 0.17, display: "block", animation: "floatA 4.8s ease-in-out infinite 1.1s" }}>🫕</span>
          </div>
          <div style={{ position: "absolute", top: 32, right: 188, pointerEvents: "none", transform: "rotate(-16deg)" }}>
            <span style={{ fontSize: 26, opacity: 0.15, display: "block", animation: "floatB 6.3s ease-in-out infinite 0.3s" }}>🌿</span>
          </div>
          <div style={{ position: "absolute", bottom: 24, right: 55, pointerEvents: "none", transform: "rotate(22deg)" }}>
            <span style={{ fontSize: 30, opacity: 0.19, display: "block", animation: "floatA 5.6s ease-in-out infinite 1.8s" }}>🥢</span>
          </div>
          <div style={{ position: "absolute", top: 85, right: 218, pointerEvents: "none", transform: "rotate(-4deg)" }}>
            <span style={{ fontSize: 22, opacity: 0.14, display: "block", animation: "floatB 7.1s ease-in-out infinite 2.2s" }}>☕</span>
          </div>
          <div style={{ position: "absolute", bottom: 70, right: 175, pointerEvents: "none", transform: "rotate(11deg)" }}>
            <span style={{ fontSize: 28, opacity: 0.13, display: "block", animation: "floatA 5s ease-in-out infinite 0.9s" }}>🥖</span>
          </div>

          {/* Content — max-width so emojis have breathing room on the right */}
          <div style={{ position: "relative", zIndex: 1, maxWidth: 560 }}>

            {/* Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: tokens.space[2], flexWrap: "wrap", marginBottom: tokens.space[3] }}>
              <Pill tone="magic" size="sm" leftIcon={<Sparkles size={12} strokeWidth={1.75} />}>
                AI · Culture Lens
              </Pill>
              <Pill tone="warm" size="sm">TasteMap signature</Pill>
            </div>

            {/* Title — white marker highlight for contrast on orange bg */}
            <div style={{ position: "relative", display: "inline-block", marginBottom: tokens.space[2] }}>
              <div style={{
                position: "absolute",
                bottom: 5,
                left: -5,
                right: -5,
                height: "40%",
                background: "rgba(255,255,255,0.42)",
                borderRadius: 3,
                transform: "rotate(-0.5deg) skewX(-1deg)",
                zIndex: 0,
              }} />
              <H1 style={{ position: "relative", zIndex: 1 }}>Culinary culture guide</H1>
            </div>

            <Body tone="muted" style={{ marginBottom: tokens.space[5], maxWidth: 480 }}>
              Every dish has roots, rituals, and stories. Type a name or drop a photo — let AI unveil the memory behind what you&apos;re about to taste.
            </Body>

            {/* Frosted-glass search row embedded in the banner */}
            <div style={{
              display: "flex",
              gap: tokens.space[2],
              alignItems: "center",
              flexWrap: "wrap",
              background: "rgba(255,255,255,0.78)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              borderRadius: tokens.radius.xl,
              padding: tokens.space[2],
              border: "1.5px solid rgba(255,255,255,0.9)",
              boxShadow: "0 2px 20px rgba(255,140,60,0.1), inset 0 1px 0 rgba(255,255,255,0.7)",
            }}>
              <div style={{ flex: "1 1 200px", minWidth: 180 }}>
                <Field
                  type="text"
                  placeholder="Type a dish name (e.g. Phở, Bánh Mì)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  leading={<Search size={16} strokeWidth={1.75} />}
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: tokens.space[2],
                  padding: `${tokens.space[2]} ${tokens.space[3]}`,
                  borderRadius: tokens.radius.lg,
                  border: `1.5px solid rgba(200,100,40,0.22)`,
                  background: "rgba(255,255,255,0.55)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: tokens.color.textMuted,
                  fontSize: tokens.type.size.bodySm,
                  fontWeight: tokens.type.weight.medium,
                  flexShrink: 0,
                  height: 44,
                  transition: "background 140ms, border-color 140ms",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.92)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,100,40,0.5)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.55)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,100,40,0.22)";
                }}
              >
                <Camera size={17} strokeWidth={1.75} />
                Snap a photo
              </button>
              <Button
                variant="magic"
                size="lg"
                loading={loading}
                leftIcon={
                  loading
                    ? <Loader2 size={18} strokeWidth={1.75} style={{ animation: "spin 0.8s linear infinite" }} />
                    : <Sparkles size={18} strokeWidth={1.75} />
                }
                onClick={() => handleSearch()}
              >
                {loading ? "Searching…" : "Generate"}
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </motion.div>

        {/* ── Empty state: suggested dishes ── */}
        {!story && !loading && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>

            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", gap: tokens.space[3], marginBottom: tokens.space[5] }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 22, height: 3, background: tokens.color.warm, borderRadius: 2 }} />
                <div style={{ width: 8, height: 3, background: tokens.color.warm, borderRadius: 2, opacity: 0.45 }} />
              </div>
              <Eyebrow>Popular dishes</Eyebrow>
              <div style={{ flex: 1, height: 1, background: tokens.color.border }} />
              <BodySm tone="muted">Tap any to explore</BodySm>
            </div>

            {/* Colored dish cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: tokens.space[3],
            }}>
              {SUGGESTED_DISHES.map((dish, idx) => {
                const theme = DISH_THEMES[idx % DISH_THEMES.length];
                return (
                  <motion.div
                    key={dish.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + idx * 0.04, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -4, transition: { duration: 0.18 } }}
                    onClick={() => { setSearchQuery(dish.name); handleSearch(dish.name); }}
                    style={{
                      cursor: "pointer",
                      borderRadius: tokens.radius.xl,
                      background: theme.bg,
                      padding: tokens.space[4],
                      display: "flex",
                      flexDirection: "column",
                      gap: tokens.space[3],
                      border: `1.5px solid ${theme.accent}28`,
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: `0 1px 4px ${theme.accent}14`,
                    }}
                  >
                    {/* Decorative corner orb */}
                    <div style={{
                      position: "absolute",
                      top: -18,
                      right: -18,
                      width: 72,
                      height: 72,
                      background: theme.iconBg,
                      borderRadius: "50%",
                      opacity: 0.55,
                      pointerEvents: "none",
                    }} />

                    {/* Circular icon badge */}
                    <span style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: theme.iconBg,
                      color: theme.iconColor,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      position: "relative",
                      zIndex: 1,
                    }}>
                      {dish.icon}
                    </span>

                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <Body style={{ fontWeight: tokens.type.weight.bold }}>{dish.name}</Body>
                      <BodySm style={{ color: `${theme.accent}99` }}>{dish.mood}</BodySm>
                    </div>

                    {/* Accent tag — solid colored */}
                    <span style={{
                      display: "inline-flex",
                      alignSelf: "flex-start",
                      alignItems: "center",
                      paddingTop: 3,
                      paddingBottom: 3,
                      paddingLeft: 10,
                      paddingRight: 10,
                      borderRadius: tokens.radius.pill,
                      background: theme.accent,
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: tokens.type.weight.bold,
                      letterSpacing: "0.04em",
                      lineHeight: 1.4,
                    }}>
                      {dish.tag}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Loading state ── */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: `${tokens.space[12]} 0 ${tokens.space[2]}` }}
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: tokens.radius.lg,
              background: "rgba(168,85,247,0.1)",
              color: tokens.color.magic,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: tokens.space[3],
            }}>
              <Loader2 size={28} strokeWidth={1.75} style={{ animation: "spin 0.8s linear infinite" }} />
            </div>
            <Body tone="muted">Uncovering the story behind your dish…</Body>
          </motion.div>
        )}

        {/* ── Error state ── */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ maxWidth: 860, margin: `${tokens.space[5]} auto 0` }}
          >
            <Card radius="lg" padding="md" shadow="sm">
              <EmptyState compact title="We couldn't generate a story right now." description={error} />
            </Card>
          </motion.div>
        )}

        {/* ── Story result — editorial + zine accent ── */}
        <AnimatePresence mode="wait">
          {story && !loading && (
            <motion.div
              key={story.food_name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", flexDirection: "column", gap: tokens.space[4] }}
            >

              {/* Hero image */}
              <div style={{
                position: "relative",
                width: "100%",
                height: 320,
                borderRadius: tokens.radius.xl,
                overflow: "hidden",
                background: tokens.color.surfaceMuted,
                boxShadow: tokens.shadow.lg,
              }}>
                {previewImageUrl ? (
                  <img
                    src={previewImageUrl}
                    alt={story.food_name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, rgba(255,107,53,0.18) 0%, rgba(168,85,247,0.14) 100%)",
                  }} />
                )}

                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "65%",
                  background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)",
                  pointerEvents: "none",
                }} />

                <div style={{ position: "absolute", bottom: tokens.space[5], left: tokens.space[5], right: tokens.space[14] }}>
                  {story.identified_from_image && (
                    <div style={{ marginBottom: tokens.space[2] }}>
                      <Pill tone="magic" size="sm" leftIcon={<Camera size={11} strokeWidth={1.75} />}>
                        Identified from photo
                      </Pill>
                    </div>
                  )}
                  <H2 style={{ color: "#fff", textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
                    {story.food_name}
                  </H2>
                  {story.food_name_local && story.food_name_local !== story.food_name && (
                    <Body style={{ color: "rgba(255,255,255,0.72)", marginTop: tokens.space[1] }}>
                      {story.food_name_local}
                    </Body>
                  )}
                  {story.confidence != null && (
                    <Caption style={{ color: "rgba(255,255,255,0.52)", marginTop: 2 }}>
                      {Math.round(story.confidence * 100)}% confidence
                    </Caption>
                  )}
                </div>

                <div style={{ position: "absolute", top: tokens.space[3], right: tokens.space[3] }}>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label="Close story"
                    icon={<X size={16} strokeWidth={1.75} />}
                    onClick={() => { setStory(null); setSearchQuery(""); }}
                    style={{
                      background: "rgba(255,255,255,0.18)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      color: "#fff",
                    }}
                  />
                </div>
              </div>

              {/* Taste tag strip */}
              {story.taste_tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="no-scrollbar"
                  style={{ display: "flex", gap: tokens.space[2], overflowX: "auto", paddingBottom: 2 }}
                >
                  {story.taste_tags.map((tag) => (
                    <Pill key={tag} tone="warm" size="sm" style={{ flexShrink: 0 }}>
                      {tag}
                    </Pill>
                  ))}
                </motion.div>
              )}

              {/* 3-col metadata strip */}
              {hasMetadata && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  style={{
                    display: "flex",
                    borderRadius: tokens.radius.lg,
                    border: `1.5px solid rgba(255,207,170,0.55)`,
                    overflow: "hidden",
                    background: "rgba(255,247,240,0.7)",
                  }}
                >
                  {story.when_to_eat && (
                    <div style={{
                      flex: 1,
                      padding: tokens.space[4],
                      borderRight: (story.pairing_suggestions.length > 0 || story.fun_fact)
                        ? `1px solid rgba(255,207,170,0.45)` : "none",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: tokens.space[1], marginBottom: tokens.space[2] }}>
                        <Clock size={13} strokeWidth={1.75} style={{ color: tokens.color.textMuted }} />
                        <Eyebrow tone="muted">When to eat</Eyebrow>
                      </div>
                      <BodySm tone="muted">{story.when_to_eat}</BodySm>
                    </div>
                  )}
                  {story.pairing_suggestions.length > 0 && (
                    <div style={{
                      flex: 1,
                      padding: tokens.space[4],
                      borderRight: story.fun_fact ? `1px solid rgba(255,207,170,0.45)` : "none",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: tokens.space[1], marginBottom: tokens.space[2] }}>
                        <Wine size={13} strokeWidth={1.75} style={{ color: tokens.color.textMuted }} />
                        <Eyebrow tone="muted">Pairs well with</Eyebrow>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: tokens.space[1] }}>
                        {story.pairing_suggestions.slice(0, 3).map((s) => (
                          <BodySm key={s} tone="muted">· {s}</BodySm>
                        ))}
                      </div>
                    </div>
                  )}
                  {story.fun_fact && (
                    <div style={{ flex: 1, padding: tokens.space[4] }}>
                      <div style={{ display: "flex", alignItems: "center", gap: tokens.space[1], marginBottom: tokens.space[2] }}>
                        <Lightbulb size={13} strokeWidth={1.75} style={{ color: tokens.color.warning }} />
                        <Eyebrow tone="muted">Fun fact</Eyebrow>
                      </div>
                      <BodySm tone="muted">{story.fun_fact}</BodySm>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Story accordion sections — with per-section accent */}
              <div style={{ display: "flex", flexDirection: "column", gap: tokens.space[2] }}>
                {story.sections.map((section, idx) => {
                  const isActive = activeSection === idx;
                  const accent = SECTION_ACCENT[section.title] || tokens.color.textMuted;
                  const previewText = section.content.length > 150
                    ? `${section.content.slice(0, 150).trim()}…`
                    : section.content;

                  return (
                    <motion.div
                      key={section.title}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.16 + idx * 0.06 }}
                    >
                      <Card
                        radius="lg"
                        padding="md"
                        shadow="sm"
                        interactive
                        onClick={() => setActiveSection(isActive ? -1 : idx)}
                        style={{
                          cursor: "pointer",
                          borderLeft: `3px solid ${accent}`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: tokens.space[3] }}>
                          <span style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: `${accent}16`,
                            color: accent,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            {SECTION_ICONS[section.title] || <BookOpen size={18} strokeWidth={1.75} />}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <H3>{section.title}</H3>
                            {!isActive && (
                              <BodySm tone="muted" style={{ marginTop: tokens.space[1] }}>
                                {previewText}
                              </BodySm>
                            )}
                          </div>
                          <motion.div
                            animate={{ rotate: isActive ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ marginTop: 4, color: tokens.color.textMuted, flexShrink: 0 }}
                          >
                            <ChevronRight size={18} strokeWidth={1.75} />
                          </motion.div>
                        </div>

                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.24 }}
                              style={{ overflow: "hidden" }}
                            >
                              <Body style={{ marginTop: tokens.space[3], paddingLeft: 52, lineHeight: 1.7 }}>
                                {section.content}
                              </Body>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Places to try */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
              >
                <Card radius="xl" padding="md" shadow="sm">
                  <div style={{ display: "flex", alignItems: "center", gap: tokens.space[2], marginBottom: tokens.space[3] }}>
                    <MapPin size={16} strokeWidth={1.75} style={{ color: tokens.color.textMuted }} />
                    <Eyebrow tone="muted">
                      {locations.length > 0 ? `${locations.length} places to try` : "Places to try"}
                    </Eyebrow>
                  </div>

                  {locations.length > 0 ? (
                    <>
                      <div style={{
                        height: 280,
                        borderRadius: tokens.radius.md,
                        overflow: "hidden",
                        marginBottom: tokens.space[3],
                        border: `1px solid ${tokens.color.border}`,
                      }}>
                        <MapWidget
                          mapId="culture-map"
                          // @ts-expect-error MapWidget signature
                          points={mapPoints}
                          center={mapCenter}
                          zoom={locations.length > 1 ? 11 : 14}
                          showBanner={false}
                          enableClustering={locations.length > 5}
                          mapStyleType="light"
                        />
                      </div>

                      <div
                        className="no-scrollbar"
                        style={{ display: "flex", gap: tokens.space[3], overflowX: "auto", paddingBottom: 4 }}
                      >
                        {locations.map((loc) => (
                          <motion.div
                            key={loc.id}
                            whileHover={{ y: -3, transition: { duration: 0.16 } }}
                            style={{
                              flexShrink: 0,
                              width: 160,
                              borderRadius: tokens.radius.md,
                              overflow: "hidden",
                              border: `1px solid ${tokens.color.border}`,
                              cursor: "pointer",
                            }}
                          >
                            <img
                              src={normalizeImageUrl(loc.image_url, { id: loc.id, category: loc.category || "food" })}
                              alt=""
                              style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }}
                            />
                            <div style={{ padding: tokens.space[2] }}>
                              <BodySm style={{
                                fontWeight: tokens.type.weight.semibold,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}>
                                {loc.name}
                              </BodySm>
                              {loc.city && <Caption tone="muted">{loc.city}</Caption>}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <BodySm tone="muted" style={{ textAlign: "center", padding: tokens.space[5], fontStyle: "italic" }}>
                      No specific locations found — but this dish is available at many local spots.
                    </BodySm>
                  )}
                </Card>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes floatA {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes floatB {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-7px); }
          }
        `}</style>
      </div>
    </Page>
  );
}
