"use client";

import React from "react";
import { Column, Text, Button } from "@/components/OnceUI";
import { MapIcon } from "lucide-react";

export const VisitedTab: React.FC = () => {
  return (
    <Column
      style={{
        gap: "20px",
        height: "400px",
        backgroundColor: "#FFFFFF",
        borderTopWidth: "1px",
        borderBottomWidth: "1px",
        borderLeftWidth: "1px",
        borderRightWidth: "1px",
        borderStyle: "solid",
        borderColor: "#FFE8D6",
        borderRadius: "32px",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MapIcon size={48} color="#ff6b35" style={{ opacity: 0.2 }} />
      <Text
        style={{ color: "#ff6b35", fontWeight: 600, opacity: 0.5 }}
      >
        Interactive Map Coming Soon 🗺️
      </Text>
      <Button variant="secondary" size="s">
        View List instead
      </Button>
    </Column>
  );
};
