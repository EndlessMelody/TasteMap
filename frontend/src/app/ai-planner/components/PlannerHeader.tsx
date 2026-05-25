"use client";

import { motion } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

const STEP_LABELS = ["Preferences", "Settings", "Generating", "Your Plan"];

interface PlannerHeaderProps {
  step: number;
  ambience: { from: string; accent: string } | null;
  onBack: () => void;
}

export function PlannerHeader({ step, ambience, onBack }: PlannerHeaderProps) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        backgroundColor: "rgba(250,248,245,0.88)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          {step > 1 && step < 3 && (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={onBack}
              className="flex items-center gap-1 text-[#ff6b35] text-[15px] font-semibold"
            >
              <ChevronLeft size={18} /> Back
            </motion.button>
          )}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center"
              style={{
                background: ambience
                  ? `linear-gradient(135deg, ${ambience.accent}, #A855F7)`
                  : "linear-gradient(135deg, #ff6b35, #A855F7)",
                transition: "background 0.4s",
              }}
            >
              <Sparkles size={16} className="text-white" />
            </div>
            <h1 className="text-[20px] font-extrabold text-[#1C1C1E] tracking-tight">
              AI Food Planner
            </h1>
          </div>
        </div>

        {step < 3 && (
          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all"
                    style={
                      step >= s
                        ? { backgroundColor: ambience?.accent ?? "#ff6b35", color: "#fff" }
                        : { backgroundColor: "#E5E5EA", color: "#8E8E93" }
                    }
                  >
                    {step > s ? <CheckCircle size={14} /> : s}
                  </div>
                  <span
                    className="text-[12px] font-semibold"
                    style={{ color: step >= s ? "#1C1C1E" : "#8E8E93" }}
                  >
                    {STEP_LABELS[s - 1]}
                  </span>
                </div>
                {s < 2 && <ChevronRight size={14} className="text-[#D1D1D6]" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {step < 3 && (
        <div className="h-0.5 bg-[#E5E5EA]">
          <motion.div
            className="h-full"
            animate={{
              width: `${(step / 2) * 100}%`,
              backgroundColor: ambience?.accent ?? "#ff6b35",
            }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}
    </div>
  );
}
