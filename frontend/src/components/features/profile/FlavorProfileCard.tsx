"use client";

import React from "react";
import { motion } from "framer-motion";
import { Row, Text } from "@/components/OnceUI";
import { Heart } from "lucide-react";

const TASTE_DATA = [
  { emoji: "🌶️", label: "Spicy", value: 85, color: "#FF3B30" },
  { emoji: "🍰", label: "Sweet", value: 60, color: "#FF9500" },
  { emoji: "🥬", label: "Vegan", value: 40, color: "#34C759" },
  { emoji: "🧂", label: "Savory", value: 72, color: "#5856D6" },
  { emoji: "🍤", label: "Crispy", value: 55, color: "#FF6B35" },
  { emoji: "🍜", label: "Umami", value: 68, color: "#AF52DE" },
];

export const FlavorProfileCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.55 }}
      style={{
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
        <Heart size={18} color="#ff6b35" />
        <Text
          style={{
            color: "#1C1C1E",
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          Flavor Profile
        </Text>
      </Row>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "10px",
        }}
      >
        {TASTE_DATA.map((taste, i) => (
          <motion.div
            key={taste.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.6 + i * 0.05 }}
            whileHover={{ scale: 1.03, backgroundColor: "#FAFAFA" }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "14px",
              backgroundColor: "#F9F9FB",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
          >
            <div
              style={{
                fontSize: "1.3rem",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {taste.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Row
                style={{
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <Text
                  style={{
                    color: "#1C1C1E",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}
                >
                  {taste.label}
                </Text>
                <Text
                  style={{
                    color: taste.color,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  }}
                >
                  {taste.value}%
                </Text>
              </Row>
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  backgroundColor: "#ECECEE",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${taste.value}%` }}
                  transition={{
                    duration: 0.8,
                    delay: 0.7 + i * 0.08,
                    ease: "easeOut",
                  }}
                  style={{
                    height: "100%",
                    background: `linear-gradient(90deg, ${taste.color}, ${taste.color}aa)`,
                    borderRadius: "2px",
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default FlavorProfileCard;
