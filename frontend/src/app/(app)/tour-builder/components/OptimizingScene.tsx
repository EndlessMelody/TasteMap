"use client";

/**
 * OptimizingScene — full-screen transition while the vector-aware optimiser runs.
 * On-brand: signature gradient orb, rotating status copy, soft drifting motes.
 */
import { useEffect, useMemo, useState } from "react";
import { Column, Row } from "@once-ui-system/core";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { H2, Caption } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { useLanguage } from "@/context/LanguageContext";

const MESSAGE_KEYS = [
  "tour.optMsg1",
  "tour.optMsg2",
  "tour.optMsg3",
  "tour.optMsg4",
  "tour.optMsg5",
];

export function OptimizingScene() {
  const { t } = useLanguage();
  const [msg, setMsg] = useState(0);

  const motes = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x0: Math.random() * 600 - 300,
        y0: Math.random() * 500 - 250,
        x1: Math.random() * 600 - 300,
        y1: Math.random() * 500 - 250,
        dur: 4 + Math.random() * 4,
      })),
    [],
  );

  useEffect(() => {
    const id = setInterval(() => setMsg((m) => (m + 1) % MESSAGE_KEYS.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: tokens.z.modal,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(40px) saturate(160%)",
        WebkitBackdropFilter: "blur(40px) saturate(160%)",
        overflow: "hidden",
      }}
    >
      {/* Drifting motes */}
      {motes.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: p.x0, y: p.y0, opacity: 0 }}
          animate={{ x: [p.x0, p.x1], y: [p.y0, p.y1], opacity: [0, 0.5, 0] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: tokens.color.warm,
            boxShadow: `0 0 12px ${tokens.color.warm}`,
          }}
        />
      ))}

      {/* Gradient orb */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], rotate: [0, 360] }}
        transition={{
          scale: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 12, repeat: Infinity, ease: "linear" },
        }}
        style={{
          width: 108,
          height: 108,
          borderRadius: "50%",
          backgroundImage: tokens.gradient.signature,
          boxShadow: tokens.shadow.glowWarm,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <Sparkles size={40} color="#fff" />
      </motion.div>

      <Column horizontal="center" style={{ gap: 8, marginTop: tokens.space[8], zIndex: 1, textAlign: "center" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={msg}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <H2 style={{ fontSize: tokens.type.size.h2 }}>{t(MESSAGE_KEYS[msg])}</H2>
          </motion.div>
        </AnimatePresence>
        <Row vertical="center" style={{ gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25 }}
              style={{ width: 5, height: 5, borderRadius: "50%", background: tokens.color.warm }}
            />
          ))}
        </Row>
        <Caption tone="muted">{t("tour.buildingPersonalised")}</Caption>
      </Column>
    </motion.div>
  );
}
