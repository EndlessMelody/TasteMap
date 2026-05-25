"use client";

import React from "react";

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number;
}

const FIELD_TEXTAREA_STYLE: React.CSSProperties = {
  width: "100%",
  minHeight: "130px",
  border: "1px solid #E5E5EA",
  borderRadius: "14px",
  padding: "12px 14px",
  fontSize: "0.95rem",
  lineHeight: 1.45,
  color: "#1C1C1E",
  background: "#FFFFFF",
  resize: "vertical",
  fontFamily: "inherit",
  outline: "none",
};

export function TextAreaField({ style, ...props }: TextAreaFieldProps) {
  return <textarea {...props} style={{ ...FIELD_TEXTAREA_STYLE, ...style }} />;
}
