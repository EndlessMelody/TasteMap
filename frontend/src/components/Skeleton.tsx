"use client";

import React from "react";
import { Column } from "@once-ui-system/core";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton = ({ className, style }: SkeletonProps) => (
  <Column
    className={className}
    style={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.05)",
      ...style,
    }}
  >
    <Column
      style={{
        position: "absolute",
        inset: 0,
        transform: "translateX(-100%)",
        animation: "shimmer 1.6s ease-in-out infinite",
        background:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
      }}
    />
  </Column>
);
