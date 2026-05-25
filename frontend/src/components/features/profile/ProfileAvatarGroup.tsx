"use client";

import React from "react";
import { tokens } from "@/styles/tokens";
interface ProfileAvatarGroupUser {
  display_name?: string;
  username?: string;
  avatar_url?: string;
  level?: number | null;
}

interface ProfileAvatarGroupProps {
  user: ProfileAvatarGroupUser | null;
}

/**
 * Hero avatar — 160px circular, 4px white ring, level badge.
 * Editorial: no animated conic ring, no infinite glow.
 */
export const ProfileAvatarGroup: React.FC<ProfileAvatarGroupProps> = ({
  user,
}) => {
  const initials = (user?.display_name || user?.username || "?")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ position: "relative", width: 160, height: 160 }}>
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: "50%",
          border: `4px solid ${tokens.color.surface}`,
          background: tokens.color.surfaceMuted,
          boxShadow: tokens.shadow.md,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {user?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar_url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span
            style={{
              color: tokens.color.textInverse,
              background: tokens.color.text,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: tokens.type.weight.semibold,
            }}
          >
            {initials}
          </span>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 4,
          right: 4,
          background: tokens.color.warm,
          color: tokens.color.textInverse,
          borderRadius: tokens.radius.md,
          padding: `${tokens.space[1]} ${tokens.space[3]}`,
          border: `3px solid ${tokens.color.surface}`,
          fontSize: tokens.type.size.caption,
          fontWeight: tokens.type.weight.bold,
          letterSpacing: tokens.type.tracking.wide,
          textTransform: "uppercase",
        }}
      >
        Lv {user?.level || 1}
      </div>
    </div>
  );
};

export default ProfileAvatarGroup;
