"use client";

import React, { useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Hash } from "lucide-react";

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
    <div
      onClick={() => inputRef.current?.focus()}
      className={`flex flex-wrap gap-2 px-3 py-2 rounded-xl border bg-white cursor-text min-h-[48px] items-center transition-shadow ${
        isFocused ? "border-orange-400 ring-2 ring-orange-200" : "border-slate-200"
      }`}
    >
      <AnimatePresence mode="popLayout">
        {chips.map((chip, index) => (
          <motion.span
            key={chip}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-500 text-xs font-medium"
          >
            <Hash size={11} />
            {chip}
            <button
              onClick={(e) => { e.stopPropagation(); removeChip(index); }}
              className="ml-0.5 flex items-center justify-center text-orange-400 hover:text-orange-600 transition-colors"
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
        className="flex-1 min-w-[80px] border-none outline-none text-sm text-zinc-800 placeholder-zinc-300 bg-transparent py-1"
      />
    </div>
  );
}
