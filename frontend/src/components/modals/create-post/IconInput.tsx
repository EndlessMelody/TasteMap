"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface IconInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  iconSize?: number;
}

const FIELD_INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  height: "50px",
  border: "1px solid #E5E5EA",
  borderRadius: "14px",
  padding: "0 14px 0 42px",
  fontSize: "0.95rem",
  color: "#1C1C1E",
  background: "#FFFFFF",
  fontFamily: "inherit",
  outline: "none",
};

export function IconInput({ icon: Icon, iconSize = 18, style, ...props }: IconInputProps) {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          position: "absolute",
          left: "14px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#8E8E93",
          display: "flex",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <Icon size={iconSize} />
      </div>
      <input {...props} style={{ ...FIELD_INPUT_STYLE, ...style }} />
    </div>
  );
}
