"use client";

import React from "react";
import { Column } from "@once-ui-system/core";

interface StickyCardProps {
  children: React.ReactNode;
  top?: string;
}

export function StickyCard({ children, top = "20px" }: StickyCardProps) {
  return (
    <Column
      style={{
        position: "sticky",
        top,
        alignSelf: "flex-start",
      }}
    >
      {children}
    </Column>
  );
}
