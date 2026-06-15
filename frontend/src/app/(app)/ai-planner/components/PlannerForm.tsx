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
import { MOODS, CUISINES, GROUPS, DURATIONS, BUDGETS, parsePrompt } from "./constants";

// ─── Sub-components ───────────────────────────────────────────────────────────

const AI_MESSAGES: Record<string, string> = {
  _default: "What food adventure are we planning today?",
  casual: "Keeping it chill? I'll find some great spots to unwind.",
  adventurous: "Bold choice! Let's explore something new and unexpected.",
  romantic: "Date night — I'll find the most memorable spots.",
  family: "Family outing — I'll pick places everyone will love!",
};

function AIGreeting({ username, mood }: { username: string; mood: string | null }) {
  const message = mood ? (AI_MESSAGES[mood] ?? AI_MESSAGES._default) : AI_MESSAGES._default;
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
      <div style={{ flex: 1 }}>
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
            Hey <strong>{username}</strong>! {message}
          </motion.p>
        </AnimatePresence>
      </div>
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
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ position: "relative" }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder="Or describe it in your own words… e.g. 'romantic dinner, 300k'"
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
      </div>
      <AnimatePresence>
        {Object.keys(parsedHints).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, alignItems: "center" }}
          >
            <span style={{ fontSize: 11, color: "#8E8E93", fontWeight: 600 }}>Got it:</span>
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
    </div>
  );
}

function MoodSection({ mood, setMood }: { mood: string | null; setMood: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <SectionLabel text="What's the vibe today?" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
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
              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#1C1C1E", margin: 0 }}>{m.label}</p>
                <p style={{ fontSize: 11, color: "#8E8E93", margin: 0 }}>{m.desc}</p>
              </div>
              {selected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ marginLeft: "auto", zIndex: 1 }}>
                  <CheckCircle size={16} color={m.accentColor} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
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
  return (
    <div style={{ marginBottom: 28 }}>
      <SectionLabel text="Any cuisine preferences? (optional)" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
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
              {c.label}
            </motion.button>
          );
        })}
      </div>
    </div>
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
  return (
    <div style={{ marginBottom: 28 }}>
      <SectionLabel text="Who's coming?" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
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
              <p style={{ fontSize: 12, fontWeight: 800, color: "#1C1C1E", margin: 0 }}>{g.label}</p>
              <p style={{ fontSize: 10, color: "#8E8E93", margin: 0 }}>{g.desc}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
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
  const QUICK_LOCS = [
    { name: "District 1", emoji: "📍" },
    { name: "Bình Thạnh", emoji: "🏙️" },
    { name: "Phú Nhuận", emoji: "🌿" },
    { name: "Thủ Đức", emoji: "🏫" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Duration + Budget side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <SectionLabel text="How long?" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#1C1C1E", margin: 0 }}>{d.label}</p>
                    <p style={{ fontSize: 10, color: "#8E8E93", margin: 0 }}>{d.desc}</p>
                  </div>
                  {selected && <CheckCircle size={14} color={accentColor} style={{ marginLeft: "auto" }} />}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <SectionLabel text="Budget / person" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#1C1C1E", margin: 0 }}>{b.label}</p>
                    <p style={{ fontSize: 10, color: "#8E8E93", margin: 0 }}>{b.desc}</p>
                  </div>
                  {selected && <CheckCircle size={14} color="#34C759" style={{ marginLeft: "auto" }} />}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <SectionLabel text="Starting point" />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. District 1, Ho Chi Minh City"
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
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
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
        </div>
      </div>
    </div>
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
  const selectedMood = MOODS.find((m) => m.id === mood);
  const selectedGroup = GROUPS.find((g) => g.id === group);

  return (
    <div
      style={{
        flexShrink: 0,
        padding: "12px 24px",
        backgroundColor: "rgba(250,248,245,0.92)",
        backdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
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
            {selectedMood.emoji} {selectedMood.label}
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
            {selectedGroup.emoji} {selectedGroup.label}
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
            {cuisines.length} cuisine{cuisines.length > 1 ? "s" : ""}
          </span>
        )}
        {!canGenerate && (
          <span style={{ fontSize: 12, color: "#C7C7CC" }}>
            Pick a vibe + group to continue
          </span>
        )}
      </div>

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
        Generate
        {canGenerate && <ChevronRight size={15} />}
      </motion.button>
    </div>
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
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#FAF8F5", position: "relative" }}>
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
      <div
        style={{
          flexShrink: 0,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          backgroundColor: "rgba(250,248,245,0.85)",
          backdropFilter: "blur(20px)",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${accentColor}, #A855F7)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.4s",
          }}
        >
          <Sparkles size={15} color="white" />
        </div>
        <span style={{ fontSize: 17, fontWeight: 800, color: "#1C1C1E", letterSpacing: -0.3 }}>
          AI Food Planner
        </span>
      </div>

      {/* Scrollable form */}
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 24px 32px" }}>
          <AIGreeting username={username} mood={mood} />

          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            parsedHints={parsedHints}
            onSubmit={handlePromptSubmit}
            accentColor={accentColor}
          />

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div style={{ flex: 1, height: 1, backgroundColor: "rgba(0,0,0,0.06)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#C7C7CC", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Or select below
            </span>
            <div style={{ flex: 1, height: 1, backgroundColor: "rgba(0,0,0,0.06)" }} />
          </div>

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
                <AIReaction text="Nice choice! Who's joining the adventure?" accentColor={accentColor} />
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
                <AIReaction text="Perfect — let's nail the details." accentColor={accentColor} />
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
        </div>
      </div>

      {/* Sticky bottom bar */}
      <StickyBar
        mood={mood}
        group={group}
        cuisines={cuisines}
        canGenerate={canGenerate}
        accentColor={accentColor}
        onGenerate={onGenerate}
      />
    </div>
  );
}
