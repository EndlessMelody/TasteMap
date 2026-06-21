"use client";

import React from "react";
import { tokens } from "@/styles/tokens";

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number;
}

const FIELD_TEXTAREA_STYLE: React.CSSProperties = {
  width: "100%",
  minHeight: "130px",
  border: `1px solid ${tokens.color.border}`,
  borderRadius: "14px",
  padding: "12px 14px",
  fontSize: "0.95rem",
  lineHeight: 1.45,
  color: tokens.color.text,
  background: tokens.color.surface,
  resize: "vertical",
  fontFamily: "inherit",
  outline: "none",
};

export function TextAreaField({ style, ...props }: TextAreaFieldProps) {
  return <textarea {...props} style={{ ...FIELD_TEXTAREA_STYLE, ...style }} />;
}
