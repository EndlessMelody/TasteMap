"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Brain,
  Send,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { Column, Row, Grid } from "@once-ui-system/core";
import { MOODS, CUISINES, GROUPS, DURATIONS, BUDGETS, parsePrompt } from "./constants";
import { useLanguage } from "@/context/LanguageContext";

// ─── Sub-components ───────────────────────────────────────────────────────────

// i18n key maps — logic keys off the English id/label values in constants.ts.
const AI_MESSAGE_KEY: Record<string, string> = {
  _default: "aiPlanner.aiMsgDefault",
  casual: "aiPlanner.aiMsgCasual",
  adventurous: "aiPlanner.aiMsgAdventurous",
  romantic: "aiPlanner.aiMsgRomantic",
  family: "aiPlanner.aiMsgFamily",
};
const CUISINE_KEY: Record<string, string> = {
  Vietnamese: "aiPlanner.cuisine_vietnamese",
  Cafe: "aiPlanner.cuisine_cafe",
  Ramen: "aiPlanner.cuisine_ramen",
  "Street Food": "aiPlanner.cuisine_streetFood",
  BBQ: "aiPlanner.cuisine_bbq",
  Japanese: "aiPlanner.cuisine_japanese",
  Dessert: "aiPlanner.cuisine_dessert",
  Healthy: "aiPlanner.cuisine_healthy",
};
const DURATION_KEY: Record<string, { label: string; desc: string }> = {
  "2 hours": { label: "aiPlanner.dur_h2", desc: "aiPlanner.durDesc_h2" },
  "4 hours": { label: "aiPlanner.dur_h4", desc: "aiPlanner.durDesc_h4" },
  "Half Day": { label: "aiPlanner.dur_half", desc: "aiPlanner.durDesc_half" },
  "Full Day": { label: "aiPlanner.dur_full", desc: "aiPlanner.durDesc_full" },
};
const BUDGET_KEY: Record<string, { label: string; desc: string }> = {
  "< 100k": { label: "aiPlanner.bud_1", desc: "aiPlanner.budDesc_1" },
  "100–300k": { label: "aiPlanner.bud_2", desc: "aiPlanner.budDesc_2" },
  "300–500k": { label: "aiPlanner.bud_3", desc: "aiPlanner.budDesc_3" },
  "500k+": { label: "aiPlanner.bud_4", desc: "aiPlanner.budDesc_4" },
};

function AIGreeting({ username, mood }: { username: string; mood: string | null }) {
  const { t } = useLanguage();
  const message = t(mood ? (AI_MESSAGE_KEY[mood] ?? AI_MESSAGE_KEY._default) : AI_MESSAGE_KEY._default);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        gap: 14,
        padding: "16px 20px",
        borderRadius: 20,
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.9)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        marginBottom: 24,
      }}
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          background: "linear-gradient(135deg, #FF6B35, #A855F7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 4px 14px rgba(255,107,53,0.35)",
        }}
      >
        <Brain size={20} color="white" />
      </motion.div>
      <Column style={{ flex: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: "#A855F7", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 3px" }}>
          TasteMap AI
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            style={{ fontSize: 14, color: "#1C1C1E", fontWeight: 500, margin: 0, lineHeight: 1.5 }}
          >
            {t("aiPlanner.hey")} <strong>{username}</strong>! {message}
          </motion.p>
        </AnimatePresence>
      </Column>
    </motion.div>
  );
}

function AIReaction({ text, accentColor }: { text: string; accentColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 12,
        backgroundColor: `${accentColor}0E`,
        border: `1px solid ${accentColor}22`,
        margin: "4px 0 20px",
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: accentColor,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 13, color: accentColor, fontWeight: 600 }}>{text}</span>
    </motion.div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 800, color: "#3C3C43", margin: "0 0 14px", letterSpacing: "0.01em" }}>
      {text}
    </p>
  );
}

function PromptInput({
  prompt,
  setPrompt,
  parsedHints,
  onSubmit,
  accentColor,
}: {
  prompt: string;
  setPrompt: (v: string) => void;
  parsedHints: Record<string, string>;
  onSubmit: () => void;
  accentColor: string;
}) {
  const { t } = useLanguage();
  return (
    <Column style={{ marginBottom: 32 }}>
      <Column style={{ position: "relative" }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder={t("aiPlanner.promptPlaceholder")}
          style={{
            width: "100%",
            padding: "14px 52px 14px 18px",
            borderRadius: 18,
            fontSize: 14,
            outline: "none",
            fontFamily: "inherit",
            color: "#1C1C1E",
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            transition: "all 0.25s",
            border: prompt ? `1.5px solid ${accentColor}55` : "1.5px solid #E5E5EA",
            boxShadow: prompt ? `0 4px 20px ${accentColor}15` : "0 2px 8px rgba(0,0,0,0.04)",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = accentColor;
            e.currentTarget.style.boxShadow = `0 4px 20px ${accentColor}20`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = prompt ? `${accentColor}55` : "#E5E5EA";
            e.currentTarget.style.boxShadow = prompt ? `0 4px 20px ${accentColor}15` : "0 2px 8px rgba(0,0,0,0.04)";
          }}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onSubmit}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: prompt ? `linear-gradient(135deg, ${accentColor}, #A855F7)` : "#F2F2F7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          <Send size={15} color={prompt ? "white" : "#8E8E93"} />
        </motion.button>
      </Column>
      <AnimatePresence>
        {Object.keys(parsedHints).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, alignItems: "center" }}
          >
            <span style={{ fontSize: 11, color: "#8E8E93", fontWeight: 600 }}>{t("aiPlanner.gotIt")}</span>
            {Object.entries(parsedHints).map(([k, v]) => (
              <span
                key={k}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 10px",
                  borderRadius: 20,
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                {v}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Column>
  );
}

function MoodSection({ mood, setMood }: { mood: string | null; setMood: (v: string) => void }) {
  const { t } = useLanguage();
  return (
    <Column style={{ marginBottom: 28 }}>
      <SectionLabel text={t("aiPlanner.vibeLabel")} />
      <Grid style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {MOODS.map((m) => {
          const selected = mood === m.id;
          return (
            <motion.button
              key={m.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMood(m.id)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 18px",
                borderRadius: 18,
                textAlign: "left",
                border: selected ? `2px solid ${m.accentColor}` : "1.5px solid rgba(0,0,0,0.06)",
                background: selected ? m.gradient : "rgba(255,255,255,0.8)",
                backdropFilter: "blur(12px)",
                boxShadow: selected
                  ? `0 8px 24px ${m.accentColor}25`
                  : "0 2px 8px rgba(0,0,0,0.03)",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)",
                overflow: "hidden",
              }}
            >
              <motion.span
                animate={selected ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  position: "absolute",
                  right: -8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 56,
                  opacity: selected ? 0.2 : 0.04,
                  filter: selected ? "blur(3px)" : "none",
                  transition: "opacity 0.3s",
                  pointerEvents: "none",
                }}
              >
                {m.emoji}
              </motion.span>
              <span style={{ color: selected ? m.accentColor : "#C7C7CC", transition: "color 0.25s", position: "relative", zIndex: 1 }}>
                {m.icon}
              </span>
              <Column style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#1C1C1E", margin: 0 }}>{t(`aiPlanner.mood_${m.id}`)}</p>
                <p style={{ fontSize: 11, color: "#8E8E93", margin: 0 }}>{t(`aiPlanner.moodDesc_${m.id}`)}</p>
              </Column>
              {selected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ marginLeft: "auto", zIndex: 1 }}>
                  <CheckCircle size={16} color={m.accentColor} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </Grid>
    </Column>
  );
}

function CuisineSection({
  cuisines,
  toggleCuisine,
  accentColor,
}: {
  cuisines: string[];
  toggleCuisine: (v: string) => void;
  accentColor: string;
}) {
  const { t } = useLanguage();
  return (
    <Column style={{ marginBottom: 28 }}>
      <SectionLabel text={t("aiPlanner.cuisineLabel")} />
      <Row style={{ flexWrap: "wrap", gap: 8 }}>
        {CUISINES.map((c) => {
          const selected = cuisines.includes(c.label);
          return (
            <motion.button
              key={c.label}
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.04 }}
              onClick={() => toggleCuisine(c.label)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                ...(selected
                  ? {
                      backgroundColor: c.color,
                      color: "#fff",
                      boxShadow: `0 4px 16px ${c.color}44`,
                    }
                  : {
                      backgroundColor: "rgba(255,255,255,0.8)",
                      color: "#3C3C43",
                      border: "1.5px solid rgba(0,0,0,0.06)",
                    }),
              }}
            >
              <span style={{ fontSize: 15 }}>{c.emoji}</span>
              {t(CUISINE_KEY[c.label] ?? c.label)}
            </motion.button>
          );
        })}
      </Row>
    </Column>
  );
}

function GroupSection({
  group,
  setGroup,
  accentColor,
}: {
  group: string | null;
  setGroup: (v: string) => void;
  accentColor: string;
}) {
  const { t } = useLanguage();
  return (
    <Column style={{ marginBottom: 28 }}>
      <SectionLabel text={t("aiPlanner.groupLabel")} />
      <Grid style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {GROUPS.map((g) => {
          const selected = group === g.id;
          return (
            <motion.button
              key={g.id}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGroup(g.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                padding: "14px 8px",
                borderRadius: 16,
                border: selected ? `2px solid ${accentColor}` : "1.5px solid rgba(0,0,0,0.06)",
                background: selected ? `${accentColor}12` : "rgba(255,255,255,0.8)",
                cursor: "pointer",
                transition: "all 0.25s",
              }}
            >
              <span style={{ fontSize: 26 }}>{g.emoji}</span>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#1C1C1E", margin: 0 }}>{t(`aiPlanner.group_${g.id}`)}</p>
              <p style={{ fontSize: 10, color: "#8E8E93", margin: 0 }}>{t(`aiPlanner.groupDesc_${g.id}`)}</p>
            </motion.button>
          );
        })}
      </Grid>
    </Column>
  );
}

function SettingsSection({
  duration,
  setDuration,
  budget,
  setBudget,
  location,
  setLocation,
  accentColor,
}: {
  duration: string;
  setDuration: (v: string) => void;
  budget: string;
  setBudget: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  accentColor: string;
}) {
  const { t } = useLanguage();
  const QUICK_LOCS = [
    { name: "District 1", emoji: "📍" },
    { name: "Bình Thạnh", emoji: "🏙️" },
    { name: "Phú Nhuận", emoji: "🌿" },
    { name: "Thủ Đức", emoji: "🏫" },
  ];

  return (
    <Column style={{ gap: 28 }}>
      {/* Duration + Budget side by side */}
      <Grid style={{ gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Column>
          <SectionLabel text={t("aiPlanner.durationLabel")} />
          <Column style={{ gap: 8 }}>
            {DURATIONS.map((d) => {
              const selected = duration === d.label;
              return (
                <motion.button
                  key={d.label}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDuration(d.label)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 14,
                    border: selected ? `2px solid ${accentColor}` : "1.5px solid rgba(0,0,0,0.06)",
                    background: selected ? `${accentColor}10` : "rgba(255,255,255,0.8)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{d.icon}</span>
                  <Column>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#1C1C1E", margin: 0 }}>{t(DURATION_KEY[d.label]?.label ?? d.label)}</p>
                    <p style={{ fontSize: 10, color: "#8E8E93", margin: 0 }}>{t(DURATION_KEY[d.label]?.desc ?? d.desc)}</p>
                  </Column>
                  {selected && <CheckCircle size={14} color={accentColor} style={{ marginLeft: "auto" }} />}
                </motion.button>
              );
            })}
          </Column>
        </Column>

        <Column>
          <SectionLabel text={t("aiPlanner.budgetLabel")} />
          <Column style={{ gap: 8 }}>
            {BUDGETS.map((b) => {
              const selected = budget === b.label;
              return (
                <motion.button
                  key={b.label}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setBudget(b.label)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 14,
                    border: selected ? "2px solid #34C759" : "1.5px solid rgba(0,0,0,0.06)",
                    background: selected ? "rgba(52,199,89,0.1)" : "rgba(255,255,255,0.8)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{b.icon}</span>
                  <Column>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#1C1C1E", margin: 0 }}>{t(BUDGET_KEY[b.label]?.label ?? b.label)}</p>
                    <p style={{ fontSize: 10, color: "#8E8E93", margin: 0 }}>{t(BUDGET_KEY[b.label]?.desc ?? b.desc)}</p>
                  </Column>
                  {selected && <CheckCircle size={14} color="#34C759" style={{ marginLeft: "auto" }} />}
                </motion.button>
              );
            })}
          </Column>
        </Column>
      </Grid>

      {/* Location */}
      <Column>
        <SectionLabel text={t("aiPlanner.startingLabel")} />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t("aiPlanner.startingPlaceholder")}
          style={{
            width: "100%",
            padding: "13px 16px",
            borderRadius: 16,
            fontSize: 14,
            outline: "none",
            fontFamily: "inherit",
            backgroundColor: "rgba(255,255,255,0.85)",
            border: "1.5px solid #E5E5EA",
            color: "#1C1C1E",
            transition: "all 0.2s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = accentColor;
            e.currentTarget.style.boxShadow = `0 4px 16px ${accentColor}18`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#E5E5EA";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <Row style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {QUICK_LOCS.map((loc) => {
            const selected = location === loc.name;
            return (
              <motion.button
                key={loc.name}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLocation(loc.name)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "5px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  backgroundColor: selected ? `${accentColor}18` : "rgba(255,255,255,0.8)",
                  color: selected ? accentColor : "#8E8E93",
                  border: selected ? `1px solid ${accentColor}44` : "1px solid rgba(0,0,0,0.06)",
                  transition: "all 0.2s",
                }}
              >
                {loc.emoji} {loc.name}
              </motion.button>
            );
          })}
        </Row>
      </Column>
    </Column>
  );
}

function StickyBar({
  mood,
  group,
  cuisines,
  canGenerate,
  accentColor,
  onGenerate,
}: {
  mood: string | null;
  group: string | null;
  cuisines: string[];
  canGenerate: boolean;
  accentColor: string;
  onGenerate: () => void;
}) {
  const { t } = useLanguage();
  const selectedMood = MOODS.find((m) => m.id === mood);
  const selectedGroup = GROUPS.find((g) => g.id === group);

  return (
    <Row
      vertical="center"
      style={{
        flexShrink: 0,
        paddingTop: "12px",
        paddingBottom: "12px",
        paddingLeft: "24px",
        paddingRight: "24px",
        backgroundColor: "rgba(250,248,245,0.92)",
        backdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        gap: 12,
      }}
    >
      <Row vertical="center" style={{ flex: 1, gap: 6, flexWrap: "wrap" }}>
        {selectedMood && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 20,
              backgroundColor: `${selectedMood.accentColor}15`,
              color: selectedMood.accentColor,
            }}
          >
            {selectedMood.emoji} {t(`aiPlanner.mood_${selectedMood.id}`)}
          </span>
        )}
        {selectedGroup && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 20,
              backgroundColor: "rgba(0,0,0,0.04)",
              color: "#636366",
            }}
          >
            {selectedGroup.emoji} {t(`aiPlanner.group_${selectedGroup.id}`)}
          </span>
        )}
        {cuisines.length > 0 && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 20,
              backgroundColor: "rgba(0,0,0,0.04)",
              color: "#636366",
            }}
          >
            {cuisines.length > 1 ? t("aiPlanner.cuisinePlural", { n: cuisines.length }) : t("aiPlanner.cuisineSingular", { n: cuisines.length })}
          </span>
        )}
        {!canGenerate && (
          <span style={{ fontSize: 12, color: "#C7C7CC" }}>
            {t("aiPlanner.pickVibeGroup")}
          </span>
        )}
      </Row>

      <motion.button
        whileHover={canGenerate ? { scale: 1.03 } : {}}
        whileTap={canGenerate ? { scale: 0.96 } : {}}
        onClick={canGenerate ? onGenerate : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 22px",
          borderRadius: 16,
          fontSize: 14,
          fontWeight: 800,
          color: canGenerate ? "white" : "#A8A8AD",
          background: canGenerate
            ? `linear-gradient(135deg, ${accentColor}, #A855F7)`
            : "#F2F2F7",
          border: "none",
          cursor: canGenerate ? "pointer" : "default",
          boxShadow: canGenerate ? `0 8px 24px ${accentColor}40` : "none",
          transition: "all 0.3s",
          flexShrink: 0,
        }}
      >
        <Sparkles size={15} />
        {t("aiPlanner.generate")}
        {canGenerate && <ChevronRight size={15} />}
      </motion.button>
    </Row>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface PlannerFormProps {
  username: string;
  mood: string | null;
  setMood: (v: string) => void;
  cuisines: string[];
  toggleCuisine: (v: string) => void;
  group: string | null;
  setGroup: (v: string) => void;
  duration: string;
  setDuration: (v: string) => void;
  budget: string;
  setBudget: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  onGenerate: () => void;
}

export function PlannerForm({
  username,
  mood,
  setMood,
  cuisines,
  toggleCuisine,
  group,
  setGroup,
  duration,
  setDuration,
  budget,
  setBudget,
  location,
  setLocation,
  onGenerate,
}: PlannerFormProps) {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState("");
  const [parsedHints, setParsedHints] = useState<Record<string, string>>({});

  const selectedMood = MOODS.find((m) => m.id === mood);
  const accentColor = selectedMood?.accentColor ?? "#FF6B35";
  const canGenerate = !!mood && !!group;

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

  return (
    <Column style={{ width: "100%", height: "100%", backgroundColor: "#FAF8F5", position: "relative" }}>
      {/* Ambient gradient */}
      <motion.div
        animate={{ opacity: mood ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: `radial-gradient(ellipse 80% 40% at 50% 0%, ${accentColor}10, transparent 70%)`,
        }}
      />

      {/* Header */}
      <Row
        vertical="center"
        style={{
          flexShrink: 0,
          paddingTop: "16px",
          paddingBottom: "16px",
          paddingLeft: "24px",
          paddingRight: "24px",
          gap: 10,
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          backgroundColor: "rgba(250,248,245,0.85)",
          backdropFilter: "blur(20px)",
          position: "relative",
          zIndex: 10,
        }}
      >
        <Row
          horizontal="center"
          vertical="center"
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${accentColor}, #A855F7)`,
            transition: "background 0.4s",
          }}
        >
          <Sparkles size={15} color="white" />
        </Row>
        <span style={{ fontSize: 17, fontWeight: 800, color: "#1C1C1E", letterSpacing: -0.3 }}>
          {t("aiPlanner.appTitle")}
        </span>
      </Row>

      {/* Scrollable form */}
      <Column
        className="no-scrollbar"
        style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}
      >
        <Column
          style={{
            maxWidth: 640,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: "auto",
            marginRight: "auto",
            paddingTop: "24px",
            paddingLeft: "24px",
            paddingRight: "24px",
            paddingBottom: "32px",
          }}
        >
          <AIGreeting username={username} mood={mood} />

          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            parsedHints={parsedHints}
            onSubmit={handlePromptSubmit}
            accentColor={accentColor}
          />

          {/* Divider */}
          <Row
            vertical="center"
            style={{
              gap: 12,
              marginBottom: 24,
            }}
          >
            <Column style={{ flex: 1, height: 1, backgroundColor: "rgba(0,0,0,0.06)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#C7C7CC", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {t("aiPlanner.orSelectBelow")}
            </span>
            <Column style={{ flex: 1, height: 1, backgroundColor: "rgba(0,0,0,0.06)" }} />
          </Row>

          {/* Phase 1 — Mood (always visible) */}
          <MoodSection mood={mood} setMood={setMood} />

          {/* Phase 2 — Cuisines + Group (reveals after mood) */}
          <AnimatePresence>
            {mood && (
              <motion.div
                key="phase2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <AIReaction text={t("aiPlanner.reactionGroup")} accentColor={accentColor} />
                <CuisineSection cuisines={cuisines} toggleCuisine={toggleCuisine} accentColor={accentColor} />
                <GroupSection group={group} setGroup={setGroup} accentColor={accentColor} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 3 — Settings (reveals after group) */}
          <AnimatePresence>
            {mood && group && (
              <motion.div
                key="phase3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
              >
                <AIReaction text={t("aiPlanner.reactionDetails")} accentColor={accentColor} />
                <SettingsSection
                  duration={duration}
                  setDuration={setDuration}
                  budget={budget}
                  setBudget={setBudget}
                  location={location}
                  setLocation={setLocation}
                  accentColor={accentColor}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Column>
      </Column>

      {/* Sticky bottom bar */}
      <StickyBar
        mood={mood}
        group={group}
        cuisines={cuisines}
        canGenerate={canGenerate}
        accentColor={accentColor}
        onGenerate={onGenerate}
      />
    </Column>
  );
}
