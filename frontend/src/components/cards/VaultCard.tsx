"use client";

import React from "react";
import { motion } from "framer-motion";
import { Column, Row, Text } from "../OnceUI";
import { Sparkles, Star } from "lucide-react";

export function VaultCard({
  title,
  xp,
  img,
  tags,
  rating,
  delay,
}: {
  title: string;
  xp: string;
  img: string;
  tags: string;
  rating: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{
        y: -4,
        boxShadow: "0 12px 40px rgba(0, 122, 255, 0.08)",
      }}
      style={{
        borderRadius: "20px",
        flexShrink: 0,
        minWidth: "260px",
        backgroundColor: "#FFFFFF",
        borderTopWidth: "1px",
        borderBottomWidth: "1px",
        borderLeftWidth: "1px",
        borderRightWidth: "1px",
        borderStyle: "solid",
        borderColor: "#E5E5EA",
        overflow: "hidden",
        cursor: "pointer",
        transform: "translateZ(0)",
      }}
      className="group"
    >
      {/* Image Area */}
      <div
        className="overflow-hidden relative"
        style={{ width: "100%", height: "150px" }}
      >
        <img
          src={img}
          alt={title}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        {/* Gradient for text/badge legibility */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "50%",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)",
            zIndex: 2,
          }}
        />

        {/* XP badge — white glass, top left */}
        <motion.div
          initial={{ boxShadow: "0 0 0px rgba(251,191,36,0)" }}
          animate={{
            boxShadow: [
              "0 0 0px rgba(251,191,36,0)",
              "0 0 14px rgba(251,191,36,0.55)",
              "0 0 0px rgba(251,191,36,0)",
            ],
          }}
          transition={{ delay: 0.6, duration: 1.6, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            paddingTop: "4px",
            paddingBottom: "4px",
            paddingLeft: "10px",
            paddingRight: "10px",
            borderRadius: "8px",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "rgba(255,255,255,0.5)",
          }}
        >
          <Sparkles size={10} color="#FBBF24" />
          <Text
            style={{ fontSize: "0.7rem", fontWeight: 700, color: "#D97706" }}
          >
            {xp}
          </Text>
        </motion.div>

        {/* Rating badge — white glass, top right */}
        <Row
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 3,
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            paddingTop: "4px",
            paddingBottom: "4px",
            paddingLeft: "8px",
            paddingRight: "8px",
            borderRadius: "8px",
            gap: "3px",
            alignItems: "center",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "rgba(255,255,255,0.5)",
          }}
        >
          <Star size={11} color="#FBBF24" fill="#FBBF24" />
          <Text
            style={{ fontSize: "0.7rem", fontWeight: 700, color: "#D97706" }}
          >
            {rating}
          </Text>
        </Row>
      </div>

      {/* Text Area — white bottom */}
      <Column
        style={{
          paddingTop: "14px",
          paddingBottom: "14px",
          paddingLeft: "16px",
          paddingRight: "16px",
          gap: "4px",
        }}
      >
        <Text
          style={{ color: "#1C1C1E", fontWeight: 700, fontSize: "0.95rem" }}
        >
          {title}
        </Text>
        <Text style={{ color: "#8E8E93", fontSize: "0.75rem" }}>{tags}</Text>
      </Column>
    </motion.div>
  );
}
