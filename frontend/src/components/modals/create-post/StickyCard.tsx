"use client";

import React from "react";

interface StickyCardProps {
  children: React.ReactNode;
  top?: string;
}

export function StickyCard({ children, top = "20px" }: StickyCardProps) {
  return (
    <div
      style={{
        position: "sticky",
        top,
        alignSelf: "flex-start",
      }}
    >
      {children}
    </div>
  );
}
