"use client";

import React from "react";
import { Row } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";
import { TIER_IDENTITY } from "@/lib/tier";
import type { MembershipTier } from "@/types/membership";

interface TierBadgePillProps {
  tier: MembershipTier;
  label: string;
  size?: "sm" | "md";
}

/** Tier chip — escalating identity, matches DecoratedAvatar's tier colors. */
export const TierBadgePill: React.FC<TierBadgePillProps> = ({ tier, label, size = "sm" }) => {
  const style = TIER_IDENTITY[tier].pill;
  const isOmakase = tier === "omakase";

  return (
    <Row
      as="span"
      vertical="center"
      style={{
        display: "inline-flex",
        gap: 4,
        padding: size === "sm" ? "3px 10px" : "5px 12px",
        borderRadius: tokens.radius.pill,
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        fontSize: size === "sm" ? tokens.type.size.caption : tokens.type.size.bodySm,
        fontWeight: tokens.type.weight.bold,
        letterSpacing: tokens.type.tracking.wide,
        textTransform: "uppercase",
        boxShadow: isOmakase ? style.glow : undefined,
        whiteSpace: "nowrap",
      }}
    >
      {isOmakase && <span aria-hidden>✨</span>}
      {label}
    </Row>
  );
};

export default TierBadgePill;
