"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Row, Heading, Text, Input, IconButton } from "@/components/OnceUI";
import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/lib/api";
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
} from "lucide-react";

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

// ─── Section Icon Map ─────────────────────────────────────────────────────────

const SECTION_ICONS: Record<string, React.ReactNode> = {
  "Origin Story": <Globe size={18} />,
  "Cultural Significance": <BookOpen size={18} />,
  "How Locals Eat It": <Sparkles size={18} />,
  "The Science of Flavor": <Lightbulb size={18} />,
};

// ─── Suggested Dishes ─────────────────────────────────────────────────────────

const SUGGESTED_DISHES = [
  { name: "Phở", emoji: "🍜", tag: "National Dish" },
  { name: "Bánh Mì", emoji: "🥖", tag: "Iconic" },
  { name: "Bún Chả", emoji: "🥢", tag: "Hanoi Classic" },
  { name: "Cơm Tấm", emoji: "🍚", tag: "Saigon Soul" },
  { name: "Bánh Xèo", emoji: "🥞", tag: "Crispy" },
  { name: "Gỏi Cuốn", emoji: "🥟", tag: "Fresh" },
  { name: "Cà Phê Sữa Đá", emoji: "☕", tag: "Essential" },
  { name: "Hủ Tiếu", emoji: "🍲", tag: "Southern" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CulturePage() {
  useAuth(); // ensures auth context is loaded
  const [searchQuery, setSearchQuery] = useState("");
  const [story, setStory] = useState<CultureStoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (foodName?: string) => {
    const query = foodName || searchQuery.trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setStory(null);
    setActiveSection(0);

    try {
      const result = await apiPost<CultureStoryResponse>(
        "/api/v1/culture/story",
        {
          food_name: query,
          language: "vi",
        },
      );
      setStory(result);
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to generate story. Please try again.",
      );
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

      // Use fetch directly for multipart
      const BASE_URL =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
        "http://127.0.0.1:8000";

      const { supabase } = await import("@/lib/supabase");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(
        `${BASE_URL}/api/v1/culture/identify-upload?language=vi`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const result: CultureStoryResponse = await res.json();
      setStory(result);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Failed to identify dish from image.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        height: "100vh",
        overflowY: "auto",
        backgroundColor: "#FAFAFA",
        padding: "0 24px 40px",
      }}
    >
      {/* ─── Hero / Search ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: "center",
          paddingTop: 48,
          paddingBottom: 32,
          maxWidth: 680,
          margin: "0 auto",
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 8 }}>📖</div>
        <Heading
          variant="heading-strong-xl"
          style={{
            color: "#1C1C1E",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            marginBottom: 8,
          }}
        >
          Culinary Culture Guide
        </Heading>
        <Text
          style={{
            color: "#8E8E93",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            maxWidth: 480,
            margin: "0 auto 28px",
          }}
        >
          Discover the stories behind every dish. Search by name or snap a photo
          — let AI reveal the culture on your plate.
        </Text>

        {/* Search Bar */}
        <Row
          style={{
            gap: 8,
            maxWidth: 520,
            margin: "0 auto",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, position: "relative" }}>
            <Input
              placeholder="Type a dish name... (e.g. Phở, Bánh Mì)"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent) =>
                e.key === "Enter" && handleSearch()
              }
              style={{
                width: "100%",
                borderRadius: 14,
                paddingTop: 14,
                paddingBottom: 14,
                paddingLeft: 44,
                paddingRight: 20,
                fontSize: "0.95rem",
                border: "1.5px solid #E5E5EA",
              }}
            />
            <Search
              size={18}
              color="#8E8E93"
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
          </div>
          <IconButton
            icon={<Camera size={20} color="#ff6b35" />}
            variant="tertiary"
            onClick={() => fileInputRef.current?.click()}
            style={{
              borderRadius: 14,
              width: 48,
              height: 48,
              border: "1.5px solid #E5E5EA",
            }}
          />
          <IconButton
            icon={
              loading ? (
                <Loader2 size={20} color="#ff6b35" className="animate-spin" />
              ) : (
                <Sparkles size={20} color="#ff6b35" />
              )
            }
            variant="tertiary"
            onClick={() => handleSearch()}
            disabled={loading}
            style={{
              borderRadius: 14,
              width: 48,
              height: 48,
              border: "1.5px solid #ff6b35",
              backgroundColor: loading ? "#F2F2F7" : "rgba(255,107,53,0.06)",
            }}
          />
        </Row>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </motion.div>

      {/* ─── Suggested Dishes (when no story) ─── */}
      {!story && !loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ maxWidth: 680, margin: "0 auto" }}
        >
          <Text
            style={{
              color: "#AEAEB2",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: 12,
              display: "block",
            }}
          >
            Popular Dishes
          </Text>
          <Row style={{ flexWrap: "wrap", gap: 8 }}>
            {SUGGESTED_DISHES.map((dish) => (
              <motion.button
                key={dish.name}
                onClick={() => {
                  setSearchQuery(dish.name);
                  handleSearch(dish.name);
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  borderRadius: 12,
                  border: "1px solid #E5E5EA",
                  backgroundColor: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#1C1C1E",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{dish.emoji}</span>
                {dish.name}
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "#8E8E93",
                    fontWeight: 500,
                    padding: "2px 6px",
                    backgroundColor: "#F2F2F7",
                    borderRadius: 6,
                  }}
                >
                  {dish.tag}
                </span>
              </motion.button>
            ))}
          </Row>
        </motion.div>
      )}

      {/* ─── Loading ─── */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: "center",
            padding: "60px 0",
            maxWidth: 680,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: "rgba(255,107,53,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Loader2 size={24} color="#ff6b35" className="animate-spin" />
          </div>
          <Text style={{ color: "#8E8E93", fontSize: "0.85rem" }}>
            Uncovering the story behind your dish...
          </Text>
        </motion.div>
      )}

      {/* ─── Error ─── */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: "center",
            padding: "40px 0",
            maxWidth: 680,
            margin: "0 auto",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>😕</div>
          <Text style={{ color: "#FF3B30", fontSize: "0.85rem" }}>{error}</Text>
        </motion.div>
      )}

      {/* ─── Story Card ─── */}
      <AnimatePresence mode="wait">
        {story && !loading && (
          <motion.div
            key={story.food_name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            style={{ 
              maxWidth: 960, 
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 24,
              alignItems: "start"
            }}
          >
            {/* ─── Left Column: Core Identity & Quick Tips ─── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Food Header */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: "28px 28px 20px",
                  border: "1px solid #E5E5EA",
                }}
              >
                <Row
                  style={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Row style={{ alignItems: "center", gap: 12 }}>
                    {story.identified_from_image && (
                      <div
                        style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          backgroundColor: "rgba(255,107,53,0.08)",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "#ff6b35",
                        }}
                      >
                        📸 Identified
                      </div>
                    )}
                    {story.confidence != null && (
                      <Text
                        style={{
                          fontSize: "0.7rem",
                          color: "#8E8E93",
                          fontWeight: 600,
                        }}
                      >
                        {Math.round(story.confidence * 100)}% confidence
                      </Text>
                    )}
                  </Row>
                  <IconButton
                    icon={<X size={16} />}
                    variant="tertiary"
                    onClick={() => {
                      setStory(null);
                      setSearchQuery("");
                    }}
                    style={{ borderRadius: 10, width: 32, height: 32 }}
                  />
                </Row>

                <Heading
                  variant="heading-strong-xl"
                  style={{
                    color: "#1C1C1E",
                    fontWeight: 800,
                    letterSpacing: "-0.3px",
                    marginBottom: 2,
                  }}
                >
                  {story.food_name}
                </Heading>
                {story.food_name_local &&
                  story.food_name_local !== story.food_name && (
                    <Text
                      style={{
                        color: "#8E8E93",
                        fontSize: "0.9rem",
                        marginBottom: 16,
                      }}
                    >
                      {story.food_name_local}
                    </Text>
                  )}

                {/* Taste Tags */}
                {story.taste_tags.length > 0 && (
                  <Row style={{ flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                    {story.taste_tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: "4px 12px",
                          borderRadius: 20,
                          backgroundColor: "rgba(255,107,53,0.06)",
                          border: "1px solid rgba(255,107,53,0.12)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "#ff6b35",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </Row>
                )}
              </div>

              {/* When to Eat */}
              {story.when_to_eat && (
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: "18px 20px",
                    border: "1px solid #E5E5EA",
                  }}
                >
                  <Row style={{ alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Clock size={16} color="#FF9500" />
                    <Text
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#FF9500",
                        textTransform: "uppercase",
                      }}
                    >
                      When to Eat
                    </Text>
                  </Row>
                  <Text
                    style={{
                      color: "#3C3C43",
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {story.when_to_eat}
                  </Text>
                </div>
              )}

              {/* Pairing Suggestions */}
              {story.pairing_suggestions.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: "18px 20px",
                    border: "1px solid #E5E5EA",
                  }}
                >
                  <Row style={{ alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Wine size={16} color="#AF52DE" />
                    <Text
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#AF52DE",
                        textTransform: "uppercase",
                      }}
                    >
                      Pairs Well With
                    </Text>
                  </Row>
                  {story.pairing_suggestions.map((s) => (
                    <Text
                      key={s}
                      style={{
                        color: "#3C3C43",
                        fontSize: "0.85rem",
                        lineHeight: 1.6,
                      }}
                    >
                      • {s}
                    </Text>
                  ))}
                </div>
              )}

              {/* Fun Fact */}
              {story.fun_fact && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    backgroundColor: "rgba(255,149,0,0.04)",
                    borderRadius: 16,
                    padding: "18px 24px",
                    border: "1px solid rgba(255,149,0,0.12)",
                  }}
                >
                  <Row style={{ alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Lightbulb size={16} color="#FF9500" />
                    <Text
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#FF9500",
                        textTransform: "uppercase",
                      }}
                    >
                      Fun Fact
                    </Text>
                  </Row>
                  <Text
                    style={{
                      color: "#3C3C43",
                      fontSize: "0.85rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {story.fun_fact}
                  </Text>
                </motion.div>
              )}
            </div>

            {/* ─── Right Column: Information Sections ─── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {story.sections.map((section, idx) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: "20px 24px",
                    border: "1px solid #E5E5EA",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setActiveSection(activeSection === idx ? -1 : idx)
                  }
                >
                  <Row
                    style={{
                      alignItems: "center",
                      gap: 12,
                      justifyContent: "space-between",
                    }}
                  >
                    <Row style={{ alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          backgroundColor: "rgba(0,122,255,0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {section.icon || SECTION_ICONS[section.title] || (
                          <BookOpen size={18} />
                        )}
                      </div>
                      <Heading
                        variant="heading-strong-s"
                        style={{
                          color: "#1C1C1E",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        {section.title}
                      </Heading>
                    </Row>
                    <motion.div
                      animate={{
                        rotate: activeSection === idx ? 90 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight size={16} color="#8E8E93" />
                    </motion.div>
                  </Row>

                  <AnimatePresence>
                    {activeSection === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: "hidden" }}
                      >
                        <Text
                          style={{
                            color: "#3C3C43",
                            fontSize: "0.88rem",
                            lineHeight: 1.7,
                            marginTop: 14,
                            paddingLeft: 48,
                          }}
                        >
                          {section.content}
                        </Text>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
