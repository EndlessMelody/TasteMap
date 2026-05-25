"use client";

import React from "react";
import { Row, Text } from "@/components/OnceUI";
import { 
  Database, 
  BrainCircuit, 
  Activity, 
  Wifi, 
  CloudRain, 
  Cpu, 
  Clock,
  Users
} from "lucide-react";

/**
 * AppStatusBar - A fixed, center-aligned status bar for the TasteMap dashboard.
 * Positioned fixedly at the bottom of the center panel, serving as a "Pro Bar"
 * displaying AI contexts, telemetry, and environmental coefficients.
 */
export const AppStatusBar = () => {
  const [time, setTime] = React.useState<string>("");

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Row
      fillWidth
      horizontal="center"
      style={{
        height: "32px",
        backgroundColor: "rgba(255, 244, 238, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: "rgba(0, 0, 0, 0.05)",
        zIndex: 1000,
        paddingTop: "0px",
        paddingBottom: "0px",
        paddingLeft: "24px",
        paddingRight: "24px",
        flexShrink: 0,
      }}
    >
      <Row
        fillWidth
        horizontal="between"
        vertical="center"
        style={{ maxWidth: "1440px" }}
      >
        {/* Left: AI & Vector Subsystem */}
        <Row gap="16" vertical="center">
          <Row gap="6" vertical="center">
            <Database size={12} style={{ color: "#ff6b35" }} />
            <Text
              variant="body-default-xs"
              style={{ color: "#1C1C1E", fontWeight: 600 }}
            >
              pgvector: IVFFlat
            </Text>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#34C759",
                boxShadow: "0 0 4px rgba(52, 199, 89, 0.5)",
              }}
            />
          </Row>
          <Row gap="6" vertical="center" hide="s">
            <BrainCircuit size={12} style={{ color: "#8E8E93" }} />
            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>
              Learning: α=0.1
            </Text>
          </Row>
        </Row>

        {/* Center: Hardware Metrics Monitor */}
        <Row
          gap="12"
          vertical="center"
          style={{
            backgroundColor: "rgba(255, 107, 53, 0.05)",
            paddingTop: "3px",
            paddingBottom: "3px",
            paddingLeft: "16px",
            paddingRight: "16px",
            borderRadius: "999px",
            border: "1px solid rgba(255, 107, 53, 0.15)",
            cursor: "default",
          }}
        >
          <Row gap="6" vertical="center">
            <Cpu size={12} style={{ color: "#ff6b35" }} />
            <Text
              variant="body-default-xs"
              style={{ color: "#1C1C1E", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
            >
              <span style={{ color: "#8E8E93", fontWeight: 500 }}>CPU: </span>
              14%
            </Text>
          </Row>
          <div style={{ width: 1, height: 10, backgroundColor: "rgba(0,0,0,0.1)" }} />
          <Row gap="6" vertical="center">
            <Activity size={12} style={{ color: "#9333EA" }} />
            <Text
              variant="body-default-xs"
              style={{ color: "#1C1C1E", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
            >
              <span style={{ color: "#8E8E93", fontWeight: 500 }}>GPU: </span>
              41%
            </Text>
          </Row>
        </Row>

        {/* Right: Environment & Telemetry */}
        <Row gap="16" vertical="center">
          <Row gap="6" vertical="center" hide="m">
            <Wifi size={12} style={{ color: "#34C759" }} />
            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>
              24ms
            </Text>
          </Row>
          <Row gap="6" vertical="center" hide="s">
            <CloudRain size={12} style={{ color: "#8E8E93" }} />
            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>
              Weather: +0.2
            </Text>
          </Row>
          <Row gap="6" vertical="center">
            <Users size={11} style={{ color: "#ff6b35" }} />
            <Text
              variant="body-default-xs"
              style={{ color: "#1C1C1E", fontWeight: 600 }}
            >
              342 Lobbies
            </Text>
          </Row>
          <div
            style={{
              width: "1px",
              height: "12px",
              backgroundColor: "rgba(0,0,0,0.1)",
            }}
          />
          <Row gap="6" vertical="center">
            <Clock size={12} style={{ color: "#8E8E93" }} />
            <Text
              variant="body-default-xs"
              style={{ color: "#8E8E93", fontVariantNumeric: "tabular-nums" }}
            >
              {time}
            </Text>
          </Row>
        </Row>
      </Row>
    </Row>
  );
};
