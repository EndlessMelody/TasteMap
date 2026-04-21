"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, Row, Column, Text } from "@/components/OnceUI";
import { UserPlus, MessageCircle } from "lucide-react";
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
        zIndex: 50,
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
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingLeft: "40px",
              paddingRight: "40px",
              height: "64px",
              backgroundColor: "rgba(255,255,255,0.90)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <Row style={{ gap: "14px", alignItems: "center" }}>
              <Avatar
                src={user?.avatar_url || ""}
                size="s"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,107,53,0.2)",
                }}
              />
              <Column style={{ gap: "1px" }}>
                <Text
                  style={{
                    color: "#1C1C1E",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    lineHeight: 1,
                  }}
                >
                  {user?.display_name || user?.username || ""}
                </Text>
                <Text
                  style={{
                    color: "#8E8E93",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                  }}
                >
                  @{user?.username || ""}
                </Text>
              </Column>
            </Row>
            <Row style={{ gap: "10px" }}>
              <motion.button
                onClick={onComingSoon}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 18px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #ff6b35, #e65721)",
                  border: "none",
                  cursor: "pointer",
                  color: "white",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(255,107,53,0.28)",
                }}
              >
                <UserPlus size={15} /> Follow
              </motion.button>
              <motion.button
                onClick={onComingSoon}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 18px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255,107,53,0.07)",
                  border: "1px solid rgba(255,107,53,0.12)",
                  cursor: "pointer",
                  color: "#ff6b35",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                <MessageCircle size={15} /> Message
              </motion.button>
            </Row>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileStickyHeader;
