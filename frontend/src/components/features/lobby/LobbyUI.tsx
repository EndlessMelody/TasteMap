"use client";

import React from "react";
import { Plus } from "lucide-react";
import type { LobbyMember } from "./types";

/**
 * Renders a horizontal stack of circular avatars with overlapping edges.
 * If there are remaining spots, renders a dashed placeholder with a "+" icon.
 */
export function AvatarStack({
  members,
  spotsLeft,
}: {
  members: LobbyMember[];
  spotsLeft: number;
}) {
  return (
    <div className="flex -space-x-2">
      {members.map((m, i) => (
        <img
          key={i}
          src={m.avatar}
          alt={m.name}
          className="w-8 h-8 rounded-full border-2 border-white object-cover"
          style={{ zIndex: members.length - i }}
        />
      ))}
      {spotsLeft > 0 && (
        <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#FFE0CC] bg-[#FFF0E6] flex items-center justify-center">
          <Plus size={12} className="text-[#ff6b35]" />
        </div>
      )}
    </div>
  );
}

/**
 * A pulsing green dot indicating a "live" status.
 */
export function LivePing() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34C759]" />
    </span>
  );
}

/**
 * A status badge showing remaining spots with a live ping indicator.
 */
export function StatusBadge({ spotsLeft }: { spotsLeft: number }) {
  return (
    <div className="flex items-center gap-2">
      <LivePing />
      <span className="text-[13px] font-semibold text-[#34C759]">
        {spotsLeft > 0 ? `Waiting for ${spotsLeft}` : "Full"}
      </span>
    </div>
  );
}
