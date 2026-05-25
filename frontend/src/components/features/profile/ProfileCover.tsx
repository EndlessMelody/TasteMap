"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, Edit3, Heart } from "lucide-react";
import { Button, IconButton } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { UserData } from "./types";

interface ProfileCoverProps {
  user: UserData | null;
  onEditProfile: () => void;
  onComingSoon: () => void;
}

const FLOATING_BUTTON_STYLE: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.92)",
  backdropFilter: "blur(12px) saturate(180%)",
  WebkitBackdropFilter: "blur(12px) saturate(180%)",
  border: `1px solid ${tokens.color.border}`,
  boxShadow: tokens.shadow.sm,
};

export const ProfileCover: React.FC<ProfileCoverProps> = ({
  user,
  onEditProfile,
  onComingSoon,
}) => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "280px",
        flexShrink: 0,
      }}
    >
      <img
        src={
          user?.cover_url ||
          "https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&q=80"
        }
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(10,10,10,0.05) 0%, rgba(10,10,10,0.35) 100%)",
        }}
      />

      <Link
        href="/"
        aria-label="Go home"
        style={{
          position: "absolute",
          top: tokens.space[5],
          left: tokens.space[5],
          display: "inline-flex",
          textDecoration: "none",
        }}
      >
        <IconButton
          variant="secondary"
          size="md"
          aria-label="Go home"
          icon={<ChevronLeft size={18} strokeWidth={1.75} />}
          style={FLOATING_BUTTON_STYLE}
        />
      </Link>

      <div
        style={{
          position: "absolute",
          top: tokens.space[5],
          right: tokens.space[5],
          display: "flex",
          alignItems: "center",
          gap: tokens.space[2],
        }}
      >
        <Button
          variant="secondary"
          size="md"
          leftIcon={<Edit3 size={16} strokeWidth={1.75} />}
          onClick={onEditProfile}
          style={FLOATING_BUTTON_STYLE}
        >
          Edit profile
        </Button>
        <IconButton
          variant="secondary"
          size="md"
          aria-label="Save profile"
          icon={<Heart size={18} strokeWidth={1.75} />}
          onClick={onComingSoon}
          style={FLOATING_BUTTON_STYLE}
        />
      </div>
    </div>
  );
};

export default ProfileCover;
