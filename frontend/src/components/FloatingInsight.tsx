"use client";

import React from "react";
import {
  Column,
  Row,
  Text,
} from "@/components/OnceUI";
import { BrainCircuit } from "lucide-react";
import { useUserVector } from "@/context/UserVectorContext";
import ClientOnly from "./common/ClientOnly";
import { motion, AnimatePresence } from "framer-motion";
import { accent } from "@/app/tour-builder/tokens";

interface FloatingInsightProps {
  cardsLeft?: number;
}

export const FlavorAura = ({ data, isPulsing, size = 140 }: { data: any[], isPulsing: boolean, size?: number }) => {
  // Compute an aggregate "intensity" and "dominant color"
  const avgA = data.reduce((acc, curr) => acc + curr.A, 0) / data.length;
  const intensity = (avgA - 20) / 130; // Normalize between 0 and 1 roughly
  
  const glowSize = size * 0.85;
  const coreSize = size;

  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.1 + intensity * 0.2, 1],
          opacity: [0.15, 0.25 + intensity * 0.1, 0.15],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          width: `${glowSize}px`,
          height: `${glowSize}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent.primary}80 0%, transparent 70%)`,
          filter: `blur(${size * 0.2}px)`,
        }}
      />

      {/* The Core Blob */}
      <motion.svg
        viewBox="0 0 200 200"
        animate={{
          rotate: [0, 360],
          scale: isPulsing ? [1, 1.15, 1] : 1,
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.6, ease: "easeOut" }
        }}
        style={{ width: `${coreSize}px`, height: `${coreSize}px`, zIndex: 1 }}
      >
        <defs>
          <linearGradient id="auraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent.primary} stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8E44AD" stopOpacity="0.6" />
          </linearGradient>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          </filter>
        </defs>
        
        <g filter="url(#goo)">
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx="100"
              cy="100"
              r={40 + intensity * 20}
              fill="url(#auraGradient)"
              animate={{
                x: [0, Math.sin(i * 2) * 15, 0],
                y: [0, Math.cos(i * 2.5) * 15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </g>
      </motion.svg>

      {/* Subtle Data Rings */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
        <circle cx="50%" cy="50%" r={size * 0.5} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="0.5" />
        <circle cx="50%" cy="50%" r={size * 0.35} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="0.5" />
      </svg>
    </div>
  );
};

export const FloatingInsight: React.FC<FloatingInsightProps> = ({ cardsLeft }) => {
  const { radarData, isPulsing } = useUserVector();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRadius: "24px",
        padding: "16px",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 12px 40px rgba(0,122,255,0.08)",
      }}
    >
      <Column style={{ gap: "12px" }}>
        <Row style={{ alignItems: "center", gap: "10px" }}>
          <BrainCircuit size={16} color={accent.primary} />
          <Text style={{ color: "#1C1C1E", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "1px", textTransform: 'uppercase' }}>
            Taste Aura
          </Text>
        </Row>

        <div style={{ width: "100%", height: "140px" }}>
          <ClientOnly>
             <FlavorAura data={radarData} isPulsing={isPulsing} />
          </ClientOnly>
        </div>

        <Column style={{ gap: '2px', textAlign: 'center' }}>
          <Text style={{ color: "rgba(0,0,0,0.45)", fontSize: "0.65rem", fontWeight: 500, lineHeight: 1.4 }}>
            Analyzing flavor DNA
          </Text>
          <Row style={{ justifyContent: 'center', gap: 4, marginTop: 4 }}>
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: accent.primary }}
              />
            ))}
          </Row>
        </Column>
      </Column>
    </motion.div>
  );
};
