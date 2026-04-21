"use client";

import React from "react";
import { Utensils, Flame, Cake, Gem, Feather, PartyPopper } from "lucide-react";
import { Column, Row, Heading, Text } from "@/components/OnceUI";

interface TopHighlightsCardProps {
  radarData: any[];
}

const TRAIT_META: Record<
  string,
  {
    icon: React.ReactNode;
    label: string;
    desc: string;
    bg: string;
    iconColor: string;
  }
> = {
  "Street Food": {
    icon: <Utensils size={20} />,
    label: "Street Food Guru",
    desc: "Local street eats enthusiast",
    bg: "#FDFCF2",
    iconColor: "#B45309",
  },
  Spicy: {
    icon: <Flame size={20} />,
    label: "Spice Specialist",
    desc: "Loves bold, fiery flavors",
    bg: "#FFF5F5",
    iconColor: "#DC2626",
  },
  Sweet: {
    icon: <Cake size={20} />,
    label: "Sweet Tooth",
    desc: "Desserts & café connoisseur",
    bg: "#FFF0F6",
    iconColor: "#DB2777",
  },
  Luxury: {
    icon: <Gem size={20} />,
    label: "Fine Dining Fan",
    desc: "Premium culinary experiences",
    bg: "#F5F3FF",
    iconColor: "#7C3AED",
  },
  Quiet: {
    icon: <Feather size={20} />,
    label: "Peaceful Eater",
    desc: "Cozy & calm dining spots",
    bg: "#F0FFF4",
    iconColor: "#059669",
  },
  Group: {
    icon: <PartyPopper size={20} />,
    label: "Social Foodie",
    desc: "Food is better with friends",
    bg: "#FFF8E1",
    iconColor: "#D97706",
  },
};

export const TopHighlightsCard: React.FC<TopHighlightsCardProps> = ({ radarData }) => {
  const topTraits = [...radarData].sort((a, b) => b.A - a.A).slice(0, 3);

  return (
    <Column
      style={{
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "0%",
        backgroundColor: "#FFFFFF",
        borderRadius: "32px",
        paddingTop: "32px",
        paddingBottom: "32px",
        paddingLeft: "32px",
        paddingRight: "32px",
        borderTopWidth: "1px",
        borderBottomWidth: "1px",
        borderLeftWidth: "1px",
        borderRightWidth: "1px",
        borderStyle: "solid",
        borderColor: "#F2F2F7",
        boxShadow: "0 8px 32px rgba(0,0,0,0.02)",
        height: "420px",
      }}
    >
      <Heading
        variant="heading-strong-m"
        style={{ color: "#1C1C1E", marginBottom: "24px" }}
      >
        Top Highlights
      </Heading>
      <Column style={{ gap: "12px" }}>
        {topTraits.length > 0 ? (
          topTraits.map((trait) => {
            const meta = TRAIT_META[trait.subject] ?? {
              icon: <Utensils size={20} />,
              label: trait.subject,
              desc: "A key taste preference",
              bg: "#F9F9FB",
              iconColor: "#8E8E93",
            };
            return (
              <Row
                key={trait.subject}
                style={{
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "18px",
                  gap: "16px",
                  alignItems: "center",
                  borderTopWidth: "1px",
                  borderBottomWidth: "1px",
                  borderLeftWidth: "1px",
                  borderRightWidth: "1px",
                  borderStyle: "solid",
                  borderColor: meta.bg,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    backgroundColor: meta.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: meta.iconColor,
                  }}
                >
                  {meta.icon}
                </div>
                <Column style={{ gap: "2px" }}>
                  <Text
                    style={{
                      color: "#1C1C1E",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                    }}
                  >
                    {meta.label}
                  </Text>
                  <Text
                    style={{
                      color: "#8E8E93",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                    }}
                  >
                    {meta.desc} ·{" "}
                    {Math.round((trait.A / (trait.fullMark ?? 100)) * 100)}%
                  </Text>
                </Column>
              </Row>
            );
          })
        ) : (
          <Text
            style={{
              color: "#8E8E93",
              fontSize: "0.85rem",
              paddingTop: "12px",
            }}
          >
            Complete the taste quiz to unlock your top traits!
          </Text>
        )}
      </Column>
      <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }} />
      <Row
        style={{
          backgroundColor: "#F9F9FB",
          paddingTop: "16px",
          paddingBottom: "16px",
          paddingLeft: "20px",
          paddingRight: "20px",
          borderRadius: "18px",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#636366",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          Taste Match with Friends
        </Text>
        <Text style={{ color: "#ff6b35", fontWeight: 800 }}>88%</Text>
      </Row>
    </Column>
  );
};
