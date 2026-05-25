"use client";

import React from "react";
import { Star, Video } from "lucide-react";
import { ComposerType } from "@/types/contentCreation";
import { SegmentedControl } from "./SegmentedControl";

interface PostTypeSelectorProps {
  value: ComposerType;
  onChange: (type: ComposerType) => void;
}

const options = [
  { value: "post" as const, label: "Foodie Feed", icon: Star },
  { value: "reel" as const, label: "Discover Reel", icon: Video },
];

export function PostTypeSelector({ value, onChange }: PostTypeSelectorProps) {
  return (
    <div style={{ maxWidth: "360px" }}>
      <SegmentedControl options={options} value={value} onChange={onChange} />
    </div>
  );
}
