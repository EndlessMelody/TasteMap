"use client";

import React, { useState } from "react";
import { Star, X } from "lucide-react";

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  maxStars?: number;
}

const BRAND = "#ff6b35";

const ratingLabels: Record<number, string> = {
  0: "", 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent",
};

export function RatingInput({ value, onChange, maxStars = 5 }: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        Rating <span className="normal-case font-normal text-zinc-400">(optional)</span>
      </label>
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star === value ? 0 : star)}
              onMouseEnter={() => setHoverValue(star)}
              onMouseLeave={() => setHoverValue(0)}
              className="p-0.5 transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                size={26}
                color={star <= displayValue ? BRAND : "#E5E5EA"}
                fill={star <= displayValue ? BRAND : "none"}
                strokeWidth={star <= displayValue ? 0 : 1.5}
              />
            </button>
          ))}
        </div>

        {value > 0 && (
          <>
            <span className="text-sm font-semibold" style={{ color: BRAND }}>
              {ratingLabels[value]}
            </span>
            <button
              onClick={() => onChange(0)}
              className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-100 text-zinc-400 hover:bg-slate-200 transition-colors"
            >
              <X size={11} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
