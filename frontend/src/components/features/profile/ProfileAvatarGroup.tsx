"use client";

import React from "react";
import { motion } from "framer-motion";
import { Avatar, Text } from "@/components/OnceUI";
import { UserData } from "./types";

interface ProfileAvatarGroupProps {
  user: UserData | null;
}

export const ProfileAvatarGroup: React.FC<ProfileAvatarGroupProps> = ({ user }) => {
  return (
    <div style={{ position: "relative", padding: "6px" }}>
      {/* Animated Gradient Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg, #ff6b35, #ff8c5a, #ffaa7a, #ff6b35)",
          padding: "4px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
          }}
        />
      </motion.div>

      {/* Glow Effect */}
      <motion.div
        animate={{
          boxShadow: [
            "0 0 20px rgba(255,107,53,0.3)",
            "0 0 40px rgba(255,107,53,0.5)",
            "0 0 20px rgba(255,107,53,0.3)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "-4px",
          left: "-4px",
          right: "-4px",
          bottom: "-4px",
          borderRadius: "50%",
          zIndex: -1,
        }}
      />

      <Avatar
        src={user?.avatar_url || ""}
        size="xl"
        style={{
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          border: "4px solid #FFFFFF",
          position: "relative",
          zIndex: 1,
        }}
      />

      {/* Level Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 15,
          delay: 0.5,
        }}
        style={{
          position: "absolute",
          bottom: "4px",
          right: "4px",
          background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
          borderRadius: "14px",
          padding: "6px 12px",
          border: "3px solid #FFFFFF",
          boxShadow: "0 4px 16px rgba(255,107,53,0.4)",
          zIndex: 2,
        }}
      >
        <Text style={{ color: "white", fontSize: "0.75rem", fontWeight: 800 }}>
          LV {user?.level || 1}
        </Text>
      </motion.div>
    </div>
  );
};

export default ProfileAvatarGroup;
