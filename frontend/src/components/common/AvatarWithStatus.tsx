"use client";

import React from "react";
import { Avatar } from "../OnceUI";

export function AvatarWithStatus({
  src,
  status,
}: {
  src: string;
  status: "online" | "offline" | "busy" | "eating" | "lobby";
}) {
  const color =
    status === "online"
      ? "#00D1B2"
      : status === "eating"
        ? "#F59E0B"
        : status === "lobby"
          ? "#A855F7"
          : status === "busy"
            ? "#ED1B24"
            : "#D1D1D6";
  return (
    <div style={{ position: "relative" }}>
      <Avatar src={src} size="m" />
      <div
        style={{
          position: "absolute",
          bottom: 1,
          right: -1,
          width: "11px",
          height: "11px",
          backgroundColor: color,
          borderRadius: "50%",
          border: "2px solid #FFFFFF",
          boxShadow: `0 0 6px ${color}60`,
        }}
      />
    </div>
  );
}
