"use client";

import React from "react";
import Link from "next/link";
import { IconButton, Button, Row, Text } from "@/components/OnceUI";
import { ChevronLeft, Edit3, Heart } from "lucide-react";
import { UserData } from "./types";

interface ProfileCoverProps {
  user: UserData | null;
  onEditProfile: () => void;
  onComingSoon: () => void;
}

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
        height: "320px",
        flexShrink: 0,
      }}
    >
      <img
        src={
          user?.cover_url ||
          "https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&q=80"
        }
        alt="Cover"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.52) 100%)",
        }}
      />

      {/* Back Button */}
      <Link
        href="/"
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          display: "flex",
        }}
      >
        <IconButton
          icon={<ChevronLeft size={20} color="#1C1C1E" />}
          style={{
            backgroundColor: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(12px)",
            borderRadius: "14px",
            width: "44px",
            height: "44px",
            cursor: "pointer",
            borderTopWidth: "1px",
            borderBottomWidth: "1px",
            borderLeftWidth: "1px",
            borderRightWidth: "1px",
            borderStyle: "solid",
            borderColor: "rgba(0,0,0,0.05)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        />
      </Link>

      {/* Header Actions */}
      <Row
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <Button
          size="s"
          onClick={onEditProfile}
          style={{
            backgroundColor: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(12px)",
            borderRadius: "14px",
            color: "#1C1C1E",
            fontWeight: 700,
            paddingTop: "10px",
            paddingBottom: "10px",
            paddingLeft: "20px",
            paddingRight: "20px",
            cursor: "pointer",
            borderTopWidth: "1px",
            borderBottomWidth: "1px",
            borderLeftWidth: "1px",
            borderRightWidth: "1px",
            borderStyle: "solid",
            borderColor: "rgba(0,0,0,0.05)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Row style={{ gap: "8px", alignItems: "center" }}>
            <Edit3 size={16} color="#ff6b35" />
            <Text style={{ fontSize: "0.85rem" }}>Edit Profile</Text>
          </Row>
        </Button>
        <IconButton
          icon={<Heart size={20} color="#ff6b35" />}
          onClick={onComingSoon}
          style={{
            backgroundColor: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(12px)",
            borderRadius: "14px",
            width: "44px",
            height: "44px",
            cursor: "pointer",
            borderTopWidth: "1px",
            borderBottomWidth: "1px",
            borderLeftWidth: "1px",
            borderRightWidth: "1px",
            borderStyle: "solid",
            borderColor: "rgba(0,0,0,0.05)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        />
      </Row>
    </div>
  );
};

export default ProfileCover;
