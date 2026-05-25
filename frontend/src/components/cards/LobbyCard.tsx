"use client";

import React from "react";
import { motion } from "framer-motion";
import { Column, Row, Text, Avatar, Button } from "../OnceUI";
import { Users } from "lucide-react";

export const lobbyAvatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop",
];

export function LobbyCard({
  title,
  desc,
  img,
  status,
  members,
  delay,
  onJoin,
}: {
  title: string;
  desc: string;
  img: string;
  status: string;
  members: number;
  delay: number;
  onJoin?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{
        scale: 1.02,
        y: -4,
        boxShadow: "0 12px 40px rgba(0,209,178,0.2)",
      }}
      style={{ borderRadius: "16px", flexShrink: 0 }}
    >
      <Column
        style={{
          minWidth: "300px",
          height: "165px",
          borderRadius: "16px",
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          padding: "20px",
          justifyContent: "space-between",
        }}
      >
        {/* Background image + heavy dark overlay for glassmorphism */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(2px) brightness(0.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
            backdropFilter: "blur(12px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "1px solid #E5E5EA",
            borderRadius: "16px",
            pointerEvents: "none",
          }}
        />

        {/* Top Row — Status */}
        <Row
          style={{
            position: "relative",
            zIndex: 2,
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Row style={{ alignItems: "center", gap: "8px" }}>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#00D1B2",
              }}
            />
            <Text
              style={{ color: "#00D1B2", fontSize: "0.75rem", fontWeight: 700 }}
            >
              {status}
            </Text>
          </Row>
          <Users size={16} color="#AEAEB2" />
        </Row>

        {/* Middle — Content */}
        <Column style={{ position: "relative", zIndex: 2, gap: "2px" }}>
          <Text
            style={{ color: "#1C1C1E", fontWeight: 700, fontSize: "1.05rem" }}
          >
            {title}
          </Text>
          <Text style={{ color: "#8E8E93", fontSize: "0.8rem" }}>
            {desc}
          </Text>
        </Column>

        {/* Bottom — Avatars + Join */}
        <Row
          style={{
            position: "relative",
            zIndex: 2,
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
          }}
        >
          <Row style={{ alignItems: "center" }}>
            {lobbyAvatars.slice(0, members).map((src, i) => (
              <Avatar
                key={i}
                src={src}
                size="s"
                style={{
                  border: "2px solid rgba(20,20,20,0.9)",
                  marginLeft: i > 0 ? "-8px" : "0",
                  zIndex: members - i,
                }}
              />
            ))}
          </Row>
          <Button
            size="s"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onJoin?.();
            }}
            style={{
              backgroundColor: "#00D1B2",
              color: "#000",
              fontWeight: 700,
              borderRadius: "10px",
              padding: "6px 18px",
              fontSize: "0.8rem",
              border: "none",
            }}
          >
            Join
          </Button>
        </Row>
      </Column>
    </motion.div>
  );
}
