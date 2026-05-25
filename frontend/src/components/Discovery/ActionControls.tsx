"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Heart } from "lucide-react";
import { Row } from "@/components/OnceUI";

interface ActionControlsProps {
  onPass: () => void;
  onLike: () => void;
  disabled?: boolean;
}

const springTap = { type: "spring", stiffness: 450, damping: 15 } as const;

export const ActionControls: React.FC<ActionControlsProps> = ({
  onPass,
  onLike,
  disabled = false,
}) => {
  return (
    <Row
      fillWidth
      justify="center"
      align="center"
      gap={24}
      style={{ padding: "16px" }}
    >
      {/* Pass button */}
      <motion.button
        whileHover={disabled ? {} : { scale: 1.08 }}
        whileTap={
          disabled ? {} : { scale: 0.88, rotate: -15, transition: springTap }
        }
        transition={{ type: "spring", stiffness: 350, damping: 18 }}
        onClick={onPass}
        disabled={disabled}
        title="Pass"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: "2px solid rgba(239,68,68,0.35)",
          backgroundColor: "rgba(239,68,68,0.08)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.4 : 1,
          boxShadow: "0 4px 16px rgba(239,68,68,0.12)",
          transition: "background-color 0.2s ease, border-color 0.2s ease",
        }}
      >
        <X size={26} color="#ef4444" strokeWidth={2.5} />
      </motion.button>

      {/* Like button */}
      <motion.button
        whileHover={disabled ? {} : { scale: 1.08 }}
        whileTap={
          disabled ? {} : { scale: 0.88, rotate: 15, transition: springTap }
        }
        transition={{ type: "spring", stiffness: 350, damping: 18 }}
        onClick={onLike}
        disabled={disabled}
        title="Like"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: "2px solid rgba(34,197,94,0.35)",
          backgroundColor: "rgba(34,197,94,0.08)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.4 : 1,
          boxShadow: "0 4px 16px rgba(34,197,94,0.12)",
          transition: "background-color 0.2s ease, border-color 0.2s ease",
        }}
      >
        <Heart size={26} color="#22c55e" strokeWidth={2.5} />
      </motion.button>
    </Row>
  );
};
