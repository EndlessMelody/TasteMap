"use client";

import React, { useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Hash } from "lucide-react";
import { Row } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";

interface ChipInputProps {
  chips: string[];
  onChipsChange: (chips: string[]) => void;
  placeholder?: string;
  maxChips?: number;
  maxLength?: number;
}

export function ChipInput({
  chips,
  onChipsChange,
  placeholder = "Add tags…",
  maxChips = 8,
  maxLength = 24,
}: ChipInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addChip = () => {
    const trimmed = inputValue.trim().replace(/\s+/g, " ");
    if (!trimmed || trimmed.length > maxLength || chips.includes(trimmed) || chips.length >= maxChips) return;
    onChipsChange([...chips, trimmed]);
    setInputValue("");
  };

  const removeChip = (index: number) => {
    onChipsChange(chips.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); addChip(); }
    else if (e.key === "Backspace" && !inputValue && chips.length > 0) removeChip(chips.length - 1);
  };

  return (
    <Row
      onClick={() => inputRef.current?.focus()}
      style={{
        flexWrap: "wrap",
        gap: "8px",
        padding: "8px 12px",
        borderRadius: "12px",
        border: isFocused ? `2px solid ${tokens.color.warm}` : `1px solid ${tokens.color.border}`,
        backgroundColor: tokens.color.surface,
        cursor: "text",
        minHeight: "48px",
        alignItems: "center",
        transition: "border 0.15s, box-shadow 0.15s",
        boxShadow: isFocused ? `0 0 0 2px rgba(255,107,53,0.15)` : "none",
      }}
    >
      <AnimatePresence mode="popLayout">
        {chips.map((chip, index) => (
          <motion.span
            key={chip}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              borderRadius: "8px",
              backgroundColor: "rgba(255,107,53,0.08)",
              color: tokens.color.warm,
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            <Hash size={11} />
            {chip}
            <button
              onClick={(e) => { e.stopPropagation(); removeChip(index); }}
              style={{ marginLeft: "2px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: tokens.color.warm, padding: 0 }}
            >
              <X size={11} />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>

      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={chips.length === 0 ? placeholder : ""}
        style={{
          flex: 1,
          minWidth: "80px",
          border: "none",
          outline: "none",
          fontSize: "0.875rem",
          color: tokens.color.text,
          background: "transparent",
          padding: "4px 0",
        }}
      />
    </Row>
  );
}
