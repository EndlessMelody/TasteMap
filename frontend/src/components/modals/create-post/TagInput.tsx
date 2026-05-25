"use client";

import React from "react";
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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Tags <span className="normal-case font-normal text-zinc-400">(optional)</span>
        </label>
        <span className="text-[11px] text-zinc-400">{tags.length}/{maxTags}</span>
      </div>
      <ChipInput
        chips={tags}
        onChipsChange={onTagsChange}
        placeholder="Type and press Enter…"
        maxChips={maxTags}
        maxLength={maxTagLength}
      />
    </div>
  );
}
