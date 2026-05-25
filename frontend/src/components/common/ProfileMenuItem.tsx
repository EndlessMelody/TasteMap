"use client";

import React from "react";
import { Row, Text } from "../OnceUI";

export function ProfileMenuItem({
  icon,
  label,
  onClick,
  style,
  textColor,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  style?: React.CSSProperties;
  textColor?: string;
}) {
  return (
    <Row
      onClick={onClick}
      style={{
        padding: "12px 18px",
        gap: "16px",
        alignItems: "center",
        cursor: "pointer",
        borderRadius: "8px",
        margin: "0 4px",
        transition: "background-color 0.15s",
        ...style,
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) =>
        (e.currentTarget.style.backgroundColor = "#F2F2F7")
      }
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) =>
        (e.currentTarget.style.backgroundColor = "transparent")
      }
    >
      <div
        style={{
          color: textColor || "#8E8E93",
          display: "flex",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <Text
        style={{
          color: textColor || "#1C1C1E",
          fontWeight: 500,
          fontSize: "0.85rem",
        }}
      >
        {label}
      </Text>
    </Row>
  );
}
