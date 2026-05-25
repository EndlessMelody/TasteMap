"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, MessageCircle } from "lucide-react";
import { Avatar, Button, Body, BodySm } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { UserData } from "./types";

interface ProfileStickyHeaderProps {
  showSticky: boolean;
  user: UserData | null;
  onComingSoon: () => void;
}

export const ProfileStickyHeader: React.FC<ProfileStickyHeaderProps> = ({
  showSticky,
  user,
  onComingSoon,
}) => {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: tokens.z.sticky,
        height: 0,
        overflow: "visible",
      }}
    >
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: -72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -72, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: `0 ${tokens.space[10]}`,
              height: "64px",
              background: "rgba(250, 250, 247, 0.85)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              borderBottom: `1px solid ${tokens.color.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: tokens.space[3],
              }}
            >
              <Avatar
                size="sm"
                name={user?.display_name || user?.username}
                src={user?.avatar_url || undefined}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Body
                  style={{
                    fontWeight: tokens.type.weight.semibold,
                    lineHeight: 1.1,
                  }}
                >
                  {user?.display_name || user?.username || ""}
                </Body>
                <BodySm tone="muted">@{user?.username || ""}</BodySm>
              </div>
            </div>
            <div style={{ display: "flex", gap: tokens.space[2] }}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UserPlus size={14} strokeWidth={1.75} />}
                onClick={onComingSoon}
              >
                Follow
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<MessageCircle size={14} strokeWidth={1.75} />}
                onClick={onComingSoon}
              >
                Message
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileStickyHeader;
