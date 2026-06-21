"use client";

import React from "react";
import { Column, Row } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";
import { ChipInput } from "./ChipInput";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  maxTagLength?: number;
}

export function TagInput({
  tags,
  onTagsChange,
  maxTags = 8,
  maxTagLength = 24,
}: TagInputProps) {
  return (
    <Column style={{ gap: 6 }}>
      <Row horizontal="between" vertical="center">
        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: tokens.color.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Tags <span style={{ textTransform: "none", fontWeight: 400 }}>(optional)</span>
        </label>
        <span style={{ fontSize: "0.6875rem", color: tokens.color.textMuted }}>{tags.length}/{maxTags}</span>
      </Row>
      <ChipInput
        chips={tags}
        onChipsChange={onTagsChange}
        placeholder="Type and press Enter…"
        maxChips={maxTags}
        maxLength={maxTagLength}
      />
    </Column>
  );
}
