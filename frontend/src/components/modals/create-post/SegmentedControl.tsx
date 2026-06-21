"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Column } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";

interface Option<T> {
  value: T;
  label: string;
  icon: LucideIcon;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const activeIndex = options.findIndex((opt) => opt.value === value);

  return (
    <Column
      style={{
        display: "flex",
        flexDirection: "row",
        position: "relative",
        background: tokens.color.surfaceMuted,
        borderRadius: "12px",
        padding: "4px",
        gap: "4px",
      }}
    >
      {/* Sliding background */}
      <motion.div
        layoutId="segmented-indicator"
        style={{
          position: "absolute",
          top: "4px",
          bottom: "4px",
          left: 0,
          width: `calc(${100 / options.length}% - 4px)`,
          marginLeft: `calc(${(100 / options.length) * activeIndex}% + 2px)`,
          background: "white",
          borderRadius: "10px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />

      {options.map((option) => {
        const isActive = option.value === value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "10px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: isActive ? tokens.color.warm : tokens.color.textMuted,
              position: "relative",
              zIndex: 1,
              transition: "color 0.15s ease",
            }}
          >
            <Icon size={18} />
            {option.label}
          </button>
        );
      })}
    </Column>
  );
}
