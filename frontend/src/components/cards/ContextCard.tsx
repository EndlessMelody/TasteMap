"use client";

import React from "react";
import { motion } from "framer-motion";
import { Column, Row, Text } from "../OnceUI";
import { Sparkles, Navigation } from "lucide-react";

export function ContextCard({
  title,
  subtitle,
  match,
  accent,
  img,
  delay,
}: {
  title: string;
  subtitle: string;
  match: number;
  accent: string;
  img: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -4, boxShadow: `0 12px 40px ${accent}30` }}
      style={{ borderRadius: "16px", flexShrink: 0 }}
    >
      <Column
        style={{
          width: "260px",
          minWidth: "260px",
          borderRadius: "16px",
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
      >
        {/* Thumbnail */}
        <div
          className="overflow-hidden relative"
          style={{
            width: "100%",
            height: "140px",
          }}
        >
          <img
            src={img}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* Match badge */}
          <Row
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              backgroundColor: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              paddingTop: "4px",
              paddingBottom: "4px",
              paddingLeft: "10px",
              paddingRight: "10px",
              borderRadius: "8px",
              gap: "4px",
              alignItems: "center",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(255,255,255,0.5)",
            }}
          >
            <Sparkles size={11} color={accent} />
            <Text
              style={{ fontSize: "0.7rem", fontWeight: 700, color: accent }}
            >
              {match}% match
            </Text>
          </Row>
          {/* Distance badge */}
          <Row
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              backgroundColor: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              paddingTop: "3px",
              paddingBottom: "3px",
              paddingLeft: "8px",
              paddingRight: "8px",
              borderRadius: "6px",
              gap: "4px",
              alignItems: "center",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(255,255,255,0.5)",
            }}
          >
            <Navigation size={10} color="#636366" />
            <Text
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                color: "#48484A",
              }}
            >
              Dĩ An
            </Text>
          </Row>
        </div>
        {/* Info */}
        <Column style={{ paddingTop: "14px", paddingBottom: "14px", paddingLeft: "16px", paddingRight: "16px", gap: "4px" }}>
          <Text style={{ color: "#1C1C1E", fontWeight: 700, fontSize: "0.9rem" }}>
            {title}
          </Text>
          <Text
            style={{ color: "#8E8E93", fontSize: "0.75rem" }}
          >
            {subtitle}
          </Text>
        </Column>
      </Column>
    </motion.div>
  );
}
