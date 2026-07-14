"use client";

import React from "react";
import { Row } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";
import { DecoratedAvatar, type DecoratedAvatarFrame } from "@/components/ui/DecoratedAvatar";

interface ProfileAvatarGroupUser {
  display_name?: string;
  username?: string;
  avatar_url?: string;
  level?: number | null;
  equipped_frame?: DecoratedAvatarFrame | null;
}

interface ProfileAvatarGroupProps {
  user: ProfileAvatarGroupUser | null;
}

/**
 * Hero avatar — 160px circular, 4px surface ring, level badge, optional
 * membership tier frame (see DecoratedAvatar). Editorial: no infinite glow
 * unless the equipped frame itself calls for it (Omakase only).
 */
export const ProfileAvatarGroup: React.FC<ProfileAvatarGroupProps> = ({
  user,
}) => {
  return (
    <DecoratedAvatar
      size="2xl"
      name={user?.display_name || user?.username}
      src={user?.avatar_url}
      frame={user?.equipped_frame}
      avatarRingColor={tokens.color.surface}
      badge={
        <Row
          style={{
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
        </Row>
      }
    />
  );
};

export default ProfileAvatarGroup;
