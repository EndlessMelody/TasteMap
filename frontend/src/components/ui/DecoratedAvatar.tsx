"use client";

import React from "react";
import { Row } from "@once-ui-system/core";
import { tierFromStyleKey, TIER_IDENTITY } from "@/lib/tier";
import { Avatar, AvatarSize } from "./Avatar";

export interface DecoratedAvatarFrame {
  style_key: string;
  accent_color: string;
  is_animated: boolean;
}

interface DecoratedAvatarProps {
  size?: AvatarSize;
  src?: string;
  name?: string;
  frame?: DecoratedAvatarFrame | null;
  className?: string;
  /** Optional badge (e.g. level pill) rendered bottom-right, outside the frame ring. */
  badge?: React.ReactNode;
  /** Solid ring color drawn directly around the avatar image (e.g. a surface-colored separator from the frame). */
  avatarRingColor?: string;
}

const SIZE_PX: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80, "2xl": 160 };

let keyframesInjected = false;
function ensureKeyframes() {
  if (keyframesInjected || typeof document === "undefined") return;
  keyframesInjected = true;
  const style = document.createElement("style");
  style.setAttribute("data-tm-decorated-avatar", "true");
  style.textContent = `
    @keyframes tm-frame-spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) {
      .tm-frame-animated { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
}

/**
 * DecoratedAvatar — wraps <Avatar> with a tier-appropriate avatar frame,
 * rendered as pure CSS (no image assets, scales 24-160px+). Identity
 * escalates: Savor = warm ring, Feast = violet signature-gradient ring,
 * Omakase = animated gold conic ring (respects prefers-reduced-motion).
 */
export const DecoratedAvatar: React.FC<DecoratedAvatarProps> = ({
  size = "md",
  src,
  name,
  frame,
  className,
  badge,
  avatarRingColor,
}) => {
  const px = SIZE_PX[size];
  const ringWidth = Math.max(2, Math.round(px * 0.07));
  const framePadding = frame ? ringWidth + 2 : 0;
  const outerSize = px + framePadding * 2;
  const identity = frame ? TIER_IDENTITY[tierFromStyleKey(frame.style_key)] : null;

  React.useEffect(() => {
    if (frame?.is_animated) ensureKeyframes();
  }, [frame?.is_animated]);

  return (
    <Row
      horizontal="center"
      vertical="center"
      className={className}
      style={{
        position: "relative",
        width: outerSize,
        height: outerSize,
        minWidth: outerSize,
        minHeight: outerSize,
        flexShrink: 0,
      }}
    >
      {frame && identity && (
        <span
          aria-hidden
          className={frame.is_animated ? "tm-frame-animated" : undefined}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: identity.ring,
            WebkitMask: `radial-gradient(closest-side, transparent calc(100% - ${ringWidth}px), black calc(100% - ${ringWidth}px))`,
            mask: `radial-gradient(closest-side, transparent calc(100% - ${ringWidth}px), black calc(100% - ${ringWidth}px))`,
            animation: frame.is_animated ? "tm-frame-spin 6s linear infinite" : undefined,
            boxShadow: identity.glow,
            pointerEvents: "none",
          }}
        />
      )}
      <Row
        style={{
          width: px,
          height: px,
          borderRadius: "50%",
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <Avatar
          src={src}
          name={name}
          size={size}
          style={{
            width: px,
            height: px,
            minWidth: px,
            minHeight: px,
            boxShadow: avatarRingColor ? `inset 0 0 0 4px ${avatarRingColor}` : "none",
          }}
        />
      </Row>
      {badge && (
        <Row
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            zIndex: 1,
          }}
        >
          {badge}
        </Row>
      )}
    </Row>
  );
};

export default DecoratedAvatar;
