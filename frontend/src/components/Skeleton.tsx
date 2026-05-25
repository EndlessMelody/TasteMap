"use client";

import React from "react";
import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton = ({ className, style }: SkeletonProps) => (
  <div
    className={cn("relative overflow-hidden rounded-m bg-white/5", className)}
    style={style}
  >
    <div
      className="absolute inset-0 -translate-x-full animate-shimmer"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
      }}
    />
  </div>
);
