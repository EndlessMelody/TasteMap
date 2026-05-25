"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dna } from "lucide-react";
import { Card, Eyebrow, BodySm, Caption } from "@/components/ui";
import { tokens } from "@/styles/tokens";

const DIMENSION_LABELS = [
  "Price",
  "Noise",
  "Nature",
  "Cuisine",
  "Modern",
  "Spicy",
  "Sweet",
  "Portion",
  "Ambiance",
  "Service",
  "Distance",
  "Rating",
  "Freshness",
  "Vibe",
  "Variety",
];

interface TourDNABarProps {
  groupVector: number[];
}

/**
 * Tour DNA — AI-derived group taste vector visualization.
 * Uses `magic` accent per DESIGN.md §2 (magic purple is AI-only).
 */
export function TourDNABar({ groupVector }: TourDNABarProps) {
  const prevVectorRef = useRef<number[]>([]);
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    if (groupVector.length === 0) return;
    const baseline = 0.5;
    let totalShift = 0;
    for (const v of groupVector) totalShift += Math.abs(v - baseline);
    const maxShift = 0.5 * groupVector.length;
    const pct = Math.min((totalShift / maxShift) * 100, 100);
    setDelta(pct);
    prevVectorRef.current = groupVector;
  }, [groupVector]);

  if (groupVector.length === 0) return null;

  const label =
    delta < 15
      ? "Exploring…"
      : delta < 40
        ? "Learning preferences"
        : delta < 70
          ? "Profile taking shape"
          : "Strong group identity";

  return (
    <Card radius="md" padding="sm" shadow="none" surface="muted">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: tokens.space[2],
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space[1],
          }}
        >
          <Dna
            size={13}
            strokeWidth={1.75}
            style={{ color: tokens.color.magic }}
          />
          <Eyebrow tone="muted">Tour DNA</Eyebrow>
        </div>
        <Caption
          style={{
            color: tokens.color.magic,
            fontWeight: tokens.type.weight.semibold,
          }}
        >
          {Math.round(delta)}% evolved
        </Caption>
      </div>

      <div
        style={{
          height: 6,
          borderRadius: tokens.radius.pill,
          background: tokens.color.surfaceInset,
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${delta}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "100%",
            background: tokens.color.magic,
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          style={{ marginTop: tokens.space[2] }}
        >
          <Caption tone="subtle">{label}</Caption>
        </motion.div>
      </AnimatePresence>

      {groupVector.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: tokens.space[1],
            marginTop: tokens.space[2],
            flexWrap: "wrap",
          }}
        >
          {groupVector
            .map((v, i) => ({
              index: i,
              shift: Math.abs(v - 0.5),
              value: v,
              label: DIMENSION_LABELS[i] ?? `D${i}`,
            }))
            .sort((a, b) => b.shift - a.shift)
            .slice(0, 5)
            .map((dim) => (
              <div
                key={dim.index}
                title={`${dim.label}: ${(dim.value * 100).toFixed(0)}%`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "2px 6px",
                  borderRadius: tokens.radius.xs,
                  background: "rgba(168, 85, 247, 0.08)",
                  fontSize: 9,
                  fontWeight: tokens.type.weight.semibold,
                  color: tokens.color.magic,
                }}
              >
                <span>{dim.label}</span>
                <div
                  style={{
                    width: 24,
                    height: 3,
                    borderRadius: 2,
                    background: "rgba(168, 85, 247, 0.15)",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.value * 100}%` }}
                    transition={{ duration: 0.5 }}
                    style={{
                      height: "100%",
                      background: tokens.color.magic,
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      )}
    </Card>
  );
}
