"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain } from "lucide-react";
import { THINKING_MSGS } from "../constants";

const FOOD_PARTICLES = ["🍜", "🥖", "🍵", "🍰", "🍣", "🥟", "🧋", "🍤", "🍚", "🔥"];

interface StepGeneratingProps {
  onDone: () => void;
}

export function StepGenerating({ onDone }: StepGeneratingProps) {
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
  const progress = Math.min(((msgIdx + 1) / THINKING_MSGS.length) * 100, 100);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#FAF8F5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Radial glow behind the orb */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,53,0.08) 0%, rgba(168,85,247,0.05) 50%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Floating food particles */}
      {FOOD_PARTICLES.map((emoji, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, x: Math.random() * 600 - 300, y: 0 }}
          animate={{
            opacity: [0, 0.35, 0],
            y: [0, -150 - Math.random() * 80],
            x: Math.random() * 80 - 40,
          }}
          transition={{
            duration: 3.5 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            fontSize: 22 + Math.random() * 10,
            pointerEvents: "none",
            top: `${45 + Math.random() * 30}%`,
            left: `${10 + Math.random() * 80}%`,
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* AI Orb */}
      <div style={{ position: "relative", width: 120, height: 120, marginBottom: 40 }}>
        {/* Outer dashed ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: -12,
            borderRadius: "50%",
            border: "1.5px dashed rgba(168,85,247,0.25)",
          }}
        />
        {/* Conic gradient ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "conic-gradient(from 0deg, #FF6B35, #A855F7, #4FACFE, #34C759, #FF6B35)",
            padding: 3,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "#FAF8F5",
            }}
          />
        </motion.div>
        {/* Center */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Brain size={32} color="#FF6B35" />
          </motion.div>
        </div>
        {/* Pulse rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "1px solid rgba(255,107,53,0.3)",
            }}
            animate={{ scale: [1, 2 + i * 0.4], opacity: [0.4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* Text */}
      <div style={{ textAlign: "center", zIndex: 1, marginBottom: 32 }}>
        <h3
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: "#1C1C1E",
            letterSpacing: -0.5,
            margin: "0 0 10px",
          }}
        >
          Crafting your itinerary
        </h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={msg}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{ fontSize: 14, color: "#8E8E93", margin: 0 }}
          >
            {msg}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Thinking steps + progress */}
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          zIndex: 1,
        }}
      >
        <div style={{ height: 64, position: "relative", width: "100%" }}>
          <AnimatePresence>
            {THINKING_MSGS.map((m, i) => {
              if (i < msgIdx - 1 || i > msgIdx + 1) return null;
              const isCurrent = i === msgIdx;
              const isPast = i < msgIdx;
              return (
                <motion.div
                  key={m}
                  initial={{ opacity: 0, y: 16, scale: 0.92 }}
                  animate={{
                    opacity: isCurrent ? 1 : isPast ? 0 : 0.3,
                    y: isCurrent ? 0 : isPast ? -16 : 16,
                    scale: isCurrent ? 1 : 0.95,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: isCurrent ? 14 : 12,
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? "#FF6B35" : "rgba(0,0,0,0.25)",
                  }}
                >
                  {isCurrent && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles size={13} color="#FF6B35" />
                    </motion.div>
                  )}
                  {m}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: "75%",
            height: 3,
            backgroundColor: "rgba(0,0,0,0.07)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #FF6B35, #A855F7, #4FACFE)",
              borderRadius: 4,
            }}
          />
        </div>
      </div>
    </div>
  );
}
