"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Column, Row } from "@once-ui-system/core";
import type { LobbyMember } from "./types";
import { Pill } from "@/components/ui";
import { tokens } from "@/styles/tokens";

export function AvatarStack({
  members,
  spotsLeft,
}: {
  members: LobbyMember[];
  spotsLeft: number;
}) {
  return (
    <Row>
      {members.map((m, i) => (
        <img
          key={i}
          src={m.avatar}
          alt=""
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `2px solid ${tokens.color.surface}`,
            objectFit: "cover",
            marginLeft: i === 0 ? 0 : -8,
            zIndex: members.length - i,
          }}
        />
      ))}
      {spotsLeft > 0 && (
        <Column
          center
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `2px dashed ${tokens.color.border}`,
            background: tokens.color.surfaceMuted,
            color: tokens.color.textMuted,
            marginLeft: -8,
          }}
        >
          <Plus size={12} strokeWidth={1.75} />
        </Column>
      )}
    </Row>
  );
}

export function LivePing() {
  return (
    <span
      className="dsc-pulse-live"
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: tokens.color.success,
        display: "inline-block",
      }}
      aria-hidden
    />
  );
}

export function StatusBadge({ spotsLeft }: { spotsLeft: number }) {
  return (
    <Pill tone={spotsLeft > 0 ? "success" : "neutral"} size="sm" dot>
      {spotsLeft > 0 ? `Waiting for ${spotsLeft}` : "Full"}
    </Pill>
  );
}
