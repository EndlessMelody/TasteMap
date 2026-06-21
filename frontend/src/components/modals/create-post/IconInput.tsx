"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Column } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";

interface IconInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  iconSize?: number;
}

const getFieldInputStyle = (): React.CSSProperties => ({
  width: "100%",
  height: "50px",
  border: `1px solid ${tokens.color.border}`,
  borderRadius: "14px",
  padding: "0 14px 0 42px",
  fontSize: "0.95rem",
  color: tokens.color.text,
  background: tokens.color.surface,
  fontFamily: "inherit",
  outline: "none",
});

export function IconInput({ icon: Icon, iconSize = 18, style, ...props }: IconInputProps) {
  return (
    <Column style={{ position: "relative", width: "100%" }}>
      <Column
        center
        style={{
          position: "absolute",
          left: "14px",
          top: "50%",
          transform: "translateY(-50%)",
          color: tokens.color.textMuted,
          pointerEvents: "none",
          height: "auto",
        }}
      >
        <Icon size={iconSize} />
      </Column>
      <input {...props} style={{ ...getFieldInputStyle(), ...style }} />
    </Column>
  );
}
