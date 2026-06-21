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
      <Row horizontal="between" vertical="center" className="px-8 py-4">
        <Row vertical="center" className="gap-4">
          {step > 1 && step < 3 && (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={onBack}
              className="flex items-center gap-1 text-[#ff6b35] text-[15px] font-semibold"
            >
              <ChevronLeft size={18} /> Back
            </motion.button>
          )}
          <Row vertical="center" className="gap-2">
            <Row
              horizontal="center"
              vertical="center"
              className="w-8 h-8 rounded-[10px]"
              style={{
                background: ambience
                  ? `linear-gradient(135deg, ${ambience.accent}, #A855F7)`
                  : "linear-gradient(135deg, #ff6b35, #A855F7)",
                transition: "background 0.4s",
              }}
            >
              <Sparkles size={16} className="text-white" />
            </Row>
            <h1 className="text-[20px] font-extrabold text-[#1C1C1E] tracking-tight">
              AI Food Planner
            </h1>
          </Row>
        </Row>

        {step < 3 && (
          <Row vertical="center" className="gap-2">
            {[1, 2].map((s) => (
              <Row key={s} vertical="center" className="gap-2">
                <Row vertical="center" className="gap-1.5">
                  <Row
                    horizontal="center"
                    vertical="center"
                    className="w-6 h-6 rounded-full text-[11px] font-extrabold transition-all"
                    style={
                      step >= s
                        ? { backgroundColor: ambience?.accent ?? "#ff6b35", color: "#fff" }
                        : { backgroundColor: "#E5E5EA", color: "#8E8E93" }
                    }
                  >
                    {step > s ? <CheckCircle size={14} /> : s}
                  </Row>
                  <span
                    className="text-[12px] font-semibold"
                    style={{ color: step >= s ? "#1C1C1E" : "#8E8E93" }}
                  >
                    {STEP_LABELS[s - 1]}
                  </span>
                </Row>
                {s < 2 && <ChevronRight size={14} className="text-[#D1D1D6]" />}
              </Row>
            ))}
          </Row>
        )}
      </Row>

      {step < 3 && (
        <Column className="h-0.5 bg-[#E5E5EA]">
          <motion.div
            className="h-full"
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
