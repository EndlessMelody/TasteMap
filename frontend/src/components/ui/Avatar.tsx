"use client";

import React, { ImgHTMLAttributes } from "react";
import { tokens } from "@/styles/tokens";
import { cn } from "@/lib/cn";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const FONT_SIZE: Record<AvatarSize, string> = {
  xs: "10px",
  sm: "12px",
  md: "14px",
  lg: "18px",
  xl: "24px",
};

// Editorial neutral palette — no warm-only orange bias.
const INITIALS_BG = [
  "#0a0a0a",
  "#3a3a3c",
  "#636366",
  "#48484a",
  "#1c1c1e",
  "#2c2c2e",
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

function initials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "size"> {
  size?: AvatarSize;
  name?: string;
  src?: string;
  /** Renders a colored ring around the avatar (e.g., story unseen). */
  ring?: "none" | "warm" | "magic" | "success";
}

const RING_COLOR = {
  none: "transparent",
  warm: tokens.color.warm,
  magic: tokens.color.magic,
  success: tokens.color.success,
} as const;

/**
 * <Avatar>
 * Square-px sizes from `tokens.space`. Falls back to initials with a
 * deterministic neutral background — never decorative warm orange.
 */
export const Avatar = ({
  size = "md",
  src,
  name,
  ring = "none",
  className,
  style,
  alt,
  ...props
}: AvatarProps) => {
  const px = SIZE[size];
  const bg = src ? tokens.color.surfaceMuted : INITIALS_BG[hash(name ?? "?") % INITIALS_BG.length];

  return (
    <span
      className={cn("ui-avatar", className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: px,
        height: px,
        borderRadius: tokens.radius.pill,
        background: bg,
        color: tokens.color.textInverse,
        fontSize: FONT_SIZE[size],
        fontWeight: tokens.type.weight.semibold,
        letterSpacing: tokens.type.tracking.normal,
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: ring === "none" ? undefined : `0 0 0 2px ${tokens.color.surface}, 0 0 0 4px ${RING_COLOR[ring]}`,
        ...style,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? name ?? ""}
          width={px}
          height={px}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          {...props}
        />
      ) : (
        <span aria-label={name ?? "avatar"}>{initials(name)}</span>
      )}
    </span>
  );
};
