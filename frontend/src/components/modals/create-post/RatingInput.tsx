"use client";

import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { Column, Row } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  maxStars?: number;
}

const ratingLabels: Record<number, string> = {
  0: "", 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent",
};

export function RatingInput({ value, onChange, maxStars = 5 }: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;

  return (
    <Column style={{ gap: 6 }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: tokens.color.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Rating <span style={{ textTransform: "none", fontWeight: 400, color: tokens.color.textMuted }}>(optional)</span>
      </label>
      <Row vertical="center" style={{ gap: "12px" }}>
        <Row style={{ gap: "4px" }}>
          {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star === value ? 0 : star)}
              onMouseEnter={() => setHoverValue(star)}
              onMouseLeave={() => setHoverValue(0)}
              style={{ padding: "2px", background: "none", border: "none", cursor: "pointer", transition: "transform 0.1s", display: "flex" }}
            >
              <Star
                size={26}
                color={star <= displayValue ? tokens.color.warm : tokens.color.border}
                fill={star <= displayValue ? tokens.color.warm : "none"}
                strokeWidth={star <= displayValue ? 0 : 1.5}
              />
            </button>
          ))}
        </Row>

        {value > 0 && (
          <>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: tokens.color.warm }}>
              {ratingLabels[value]}
            </span>
            <button
              onClick={() => onChange(0)}
              style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: tokens.color.surfaceMuted, color: tokens.color.textMuted, border: "none", cursor: "pointer" }}
            >
              <X size={11} />
            </button>
          </>
        )}
      </Row>
    </Column>
  );
}
