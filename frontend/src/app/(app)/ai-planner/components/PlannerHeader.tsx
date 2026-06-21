"use client";

import { motion } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Column, Row } from "@once-ui-system/core";

const STEP_LABELS = ["Preferences", "Settings", "Generating", "Your Plan"];

interface PlannerHeaderProps {
  step: number;
  ambience: { from: string; accent: string } | null;
  onBack: () => void;
}

export function PlannerHeader({ step, ambience, onBack }: PlannerHeaderProps) {
  return (
    <Column
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        backgroundColor: "rgba(250,248,245,0.88)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Row horizontal="between" vertical="center" style={{ padding: "16px 32px" }}>
        <Row vertical="center" style={{ gap: 16 }}>
          {step > 1 && step < 3 && (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={onBack}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: "#ff6b35",
                fontSize: 15,
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <ChevronLeft size={18} /> Back
            </motion.button>
          )}
          <Row vertical="center" style={{ gap: 8 }}>
            <Row
              horizontal="center"
              vertical="center"
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: ambience
                  ? `linear-gradient(135deg, ${ambience.accent}, #A855F7)`
                  : "linear-gradient(135deg, #ff6b35, #A855F7)",
                transition: "background 0.4s",
              }}
            >
              <Sparkles size={16} color="#fff" />
            </Row>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1C1C1E", letterSpacing: "-0.02em", margin: 0 }}>
              AI Food Planner
            </h1>
          </Row>
        </Row>

        {step < 3 && (
          <Row vertical="center" style={{ gap: 8 }}>
            {[1, 2].map((s) => (
              <Row key={s} vertical="center" style={{ gap: 8 }}>
                <Row vertical="center" style={{ gap: 6 }}>
                  <Row
                    horizontal="center"
                    vertical="center"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      fontSize: 11,
                      fontWeight: 800,
                      transition: "all 0.2s",
                      ...(step >= s
                        ? { backgroundColor: ambience?.accent ?? "#ff6b35", color: "#fff" }
                        : { backgroundColor: "#E5E5EA", color: "#8E8E93" }),
                    }}
                  >
                    {step > s ? <CheckCircle size={14} /> : s}
                  </Row>
                  <span
                    style={{ fontSize: 12, fontWeight: 600, color: step >= s ? "#1C1C1E" : "#8E8E93" }}
                  >
                    {STEP_LABELS[s - 1]}
                  </span>
                </Row>
                {s < 2 && <ChevronRight size={14} color="#D1D1D6" />}
              </Row>
            ))}
          </Row>
        )}
      </Row>

      {step < 3 && (
        <Column style={{ height: 2, backgroundColor: "#E5E5EA" }}>
          <motion.div
            style={{ height: "100%" }}
            animate={{
              width: `${(step / 2) * 100}%`,
              backgroundColor: ambience?.accent ?? "#ff6b35",
            }}
            transition={{ duration: 0.4 }}
          />
        </Column>
      )}
    </Column>
  );
}
