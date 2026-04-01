"use client";

import React from "react";
import { motion } from "framer-motion";
import { Column, Row, Text, Avatar } from "../OnceUI";
import { Eye, Play } from "lucide-react";

export function ReelCard({
  title,
  user,
  views,
  avatar,
  img,
  delay,
}: {
  title: string;
  user: string;
  views: string;
  avatar: string;
  img: string;
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
        width: "180px",
        minWidth: "180px",
        height: "400px",
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
      <div className="overflow-hidden relative" style={{ width: "100%", height: "320px" }}>
        <img
          src={img}
          alt={title}
          className="transition-transform duration-[700ms] ease-out group-hover:scale-[1.03]"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        {/* Gradient for badge legibility */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "40%",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)",
          zIndex: 5,
        }} />

        {/* Views badge — white glass, top right */}
        <Row
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            paddingTop: "4px",
            paddingBottom: "4px",
            paddingLeft: "8px",
            paddingRight: "8px",
            borderRadius: "8px",
            gap: "4px",
            alignItems: "center",
            borderTopWidth: "1px",
            borderBottomWidth: "1px",
            borderLeftWidth: "1px",
            borderRightWidth: "1px",
            borderStyle: "solid",
            borderColor: "rgba(255,255,255,0.5)",
          }}
        >
          <Eye size={10} color="#8E8E93" />
          <Text
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "#636366",
            }}
          >
            {views}
          </Text>
        </Row>

        {/* Center play button */}
        <Column
          style={{
            position: "absolute",
            inset: 0,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(12px)",
              borderTopWidth: "1px",
              borderBottomWidth: "1px",
              borderLeftWidth: "1px",
              borderRightWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s, transform 0.2s",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            className="group-hover:scale-110"
          >
            <Play size={18} color="#007AFF" fill="#007AFF" />
          </div>
        </Column>
      </div>

      {/* Text Area — white bottom, no overlay */}
      <Column
        style={{
          paddingTop: "12px",
          paddingBottom: "12px",
          paddingLeft: "14px",
          paddingRight: "14px",
          gap: "6px",
        }}
      >
        <Text
          style={{
            color: "#1C1C1E",
            fontWeight: 700,
            fontSize: "0.80rem",
            lineHeight: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "32px",
            maxHeight: "32px",
          }}
        >
          {title}
        </Text>
        <Row style={{ alignItems: "center", gap: "6px" }}>
          <Avatar src={avatar} size="xs" />
          <Text
            style={{
              color: "#8E8E93",
              fontSize: "0.7rem",
              fontWeight: 500,
            }}
          >
            {user}
          </Text>
        </Row>
      </Column>
    </motion.div>
  );
}
