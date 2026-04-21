"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Text, Row } from "@/components/OnceUI";

interface TasteMapStatsCardProps {
  user: any;
}

export const TasteMapStatsCard: React.FC<TasteMapStatsCardProps> = ({ user }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: "24px",
        padding: "24px",
        border: "1px solid #F2F2F7",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <Row
        style={{
          gap: "8px",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
            padding: "6px",
            borderRadius: "8px",
          }}
        >
          <TrendingUp size={16} color="white" />
        </div>
        <Text
          style={{
            color: "#1C1C1E",
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          TasteMap Stats
        </Text>
      </Row>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
        }}
      >
        {[
          { label: "Followers", value: user?.stats?.followers ?? 0, color: "#ff6b35" },
          { label: "Following", value: user?.stats?.following ?? 0, color: "#34C759" },
          { label: "Reviews", value: user?.stats?.reviews ?? 0, color: "#5856D6" },
          { label: "Visited", value: user?.stats?.visited ?? 0, color: "#FF9500" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: "#F9F9FB",
              borderRadius: "16px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <Text
              style={{
                color: stat.color,
                fontWeight: 700,
                fontSize: "1.3rem",
              }}
            >
              {typeof stat.value === "number" && stat.value >= 1000
                ? `${(stat.value / 1000).toFixed(1)}K`
                : stat.value}
            </Text>
            <Text
              style={{
                color: "#8E8E93",
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            >
              {stat.label}
            </Text>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
