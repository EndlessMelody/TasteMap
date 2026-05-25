"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "A romantic date night, 300k budget",
  "Solo street food adventure",
  "Family lunch in District 1",
];

interface PromptBarProps {
  prompt: string;
  setPrompt: (v: string) => void;
  parsedHints: Record<string, string>;
  onSubmit: () => void;
  accentColor?: string;
}

export function PromptBar({
  prompt,
  setPrompt,
  parsedHints,
  onSubmit,
  accentColor = "#ff6b35",
}: PromptBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: 28 }}
    >
      <div style={{ position: "relative" }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
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
            border: prompt ? `1.5px solid ${accentColor}55` : "1.5px solid #E5E5EA",
            boxShadow: prompt
              ? `0 4px 20px ${accentColor}18`
              : "0 2px 8px rgba(0,0,0,0.04)",
          }}
        />
        <button
          onClick={onSubmit}
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
              ? `linear-gradient(135deg, ${accentColor}, #A855F7)`
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
            <span style={{ fontSize: 11, color: "#8E8E93", fontWeight: 600 }}>
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

      {!prompt && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {EXAMPLE_PROMPTS.map((ex) => (
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

      <div style={{ height: 1, backgroundColor: "#E5E5EA", marginTop: 20 }} />
    </motion.div>
  );
}
