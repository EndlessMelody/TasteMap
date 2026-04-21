"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Column, Row, Heading, Text, Button } from "@/components/OnceUI";
import ClientOnly from "@/components/common/ClientOnly";

interface TasteDNACardProps {
  radarData: any[];
}

export const TasteDNACard: React.FC<TasteDNACardProps> = ({ radarData }) => {
  return (
    <Column
      style={{
        flexGrow: 1.2,
        flexShrink: 1,
        flexBasis: "0%",
        backgroundColor: "#FFF5F0",
        borderRadius: "32px",
        paddingTop: "40px",
        paddingRight: "40px",
        paddingBottom: "40px",
        paddingLeft: "40px",
        borderTopWidth: "1px",
        borderBottomWidth: "1px",
        borderLeftWidth: "1px",
        borderRightWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgba(255,107,53,0.08)",
        boxShadow: "0 12px 40px rgba(255,107,53,0.04)",
        height: "420px",
        position: "relative",
      }}
    >
      <Row
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Row style={{ gap: "12px", alignItems: "center" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
              paddingTop: "10px",
              paddingBottom: "10px",
              paddingLeft: "10px",
              paddingRight: "10px",
              borderRadius: "12px",
            }}
          >
            <TrendingUp size={20} color="white" />
          </div>
          <Column>
            <Heading
              variant="heading-strong-m"
              style={{ color: "#1C1C1E", fontSize: "1.25rem" }}
            >
              Taste DNA
            </Heading>
            <Text
              style={{
                color: "#ff6b35",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Your Unique Flavor Profile
            </Text>
          </Column>
        </Row>
        <Button
          size="s"
          variant="secondary"
          style={{ backgroundColor: "white", borderRadius: "12px" }}
        >
          View Insights
        </Button>
      </Row>

      <div
        style={{
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: "0%",
          width: "100%",
          minHeight: "280px",
        }}
      >
        <ClientOnly>
          <ResponsiveContainer
            width="100%"
            height={280}
            minWidth={100}
            debounce={50}
          >
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(255,107,53,0.1)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#8E8E93", fontSize: 12, fontWeight: 600 }}
              />
              <Radar
                name="Taste"
                dataKey="A"
                stroke="#ff6b35"
                fill="#ff6b35"
                fillOpacity={0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ClientOnly>
      </div>
    </Column>
  );
};
