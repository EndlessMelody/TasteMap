"use client";

import React from "react";
import { Column, Row, Text } from "@once-ui-system/core";
import { useLanguage } from "@/context/LanguageContext";
import { tokens } from "@/styles/tokens";
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
  const { t } = useLanguage();
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
        backgroundColor: tokens.color.surface,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: tokens.color.border,
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
          <Row gap="8" vertical="center">
            <Database size={12} style={{ color: tokens.color.warm }} />
            <Text
              variant="body-default-xs"
              style={{ color: tokens.color.text, fontWeight: 600 }}
            >
              pgvector: IVFFlat
            </Text>
            <Column
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: tokens.color.success,
                boxShadow: `0 0 4px ${tokens.color.success}80`,
              }}
            />
          </Row>
          <Row gap="8" vertical="center" s={{ hide: true }}>
            <BrainCircuit size={12} style={{ color: tokens.color.textMuted }} />
            <Text variant="body-default-xs" style={{ color: tokens.color.textMuted }}>
              Learning: α=0.1
            </Text>
          </Row>
        </Row>

        {/* Center: Hardware Metrics Monitor */}
        <Row
          gap="12"
          vertical="center"
          style={{
            backgroundColor: `${tokens.color.warm}0D`,
            paddingTop: "3px",
            paddingBottom: "3px",
            paddingLeft: "16px",
            paddingRight: "16px",
            borderRadius: "999px",
            border: `1px solid ${tokens.color.warm}26`,
            cursor: "default",
          }}
        >
          <Row gap="8" vertical="center">
            <Cpu size={12} style={{ color: tokens.color.warm }} />
            <Text
              variant="body-default-xs"
              style={{ color: tokens.color.text, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
            >
              <span style={{ color: tokens.color.textMuted, fontWeight: 500 }}>CPU: </span>
              14%
            </Text>
          </Row>
          <Column style={{ width: 1, height: 10, backgroundColor: tokens.color.border }} />
          <Row gap="8" vertical="center">
            <Activity size={12} style={{ color: tokens.color.magic }} />
            <Text
              variant="body-default-xs"
              style={{ color: tokens.color.text, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
            >
              <span style={{ color: tokens.color.textMuted, fontWeight: 500 }}>GPU: </span>
              41%
            </Text>
          </Row>
        </Row>

        {/* Right: Environment & Telemetry */}
        <Row gap="16" vertical="center">
          <Row gap="8" vertical="center" m={{ hide: true }}>
            <Wifi size={12} style={{ color: tokens.color.success }} />
            <Text variant="body-default-xs" style={{ color: tokens.color.textMuted }}>
              24ms
            </Text>
          </Row>
          <Row gap="8" vertical="center" s={{ hide: true }}>
            <CloudRain size={12} style={{ color: tokens.color.textMuted }} />
            <Text variant="body-default-xs" style={{ color: tokens.color.textMuted }}>
              {t("statusbar.weather")}: +0.2
            </Text>
          </Row>
          <Row gap="8" vertical="center">
            <Users size={11} style={{ color: tokens.color.warm }} />
            <Text
              variant="body-default-xs"
              style={{ color: tokens.color.text, fontWeight: 600 }}
            >
              {t("statusbar.lobbies", { n: 342 })}
            </Text>
          </Row>
          <Column
            style={{
              width: "1px",
              height: "12px",
              backgroundColor: tokens.color.border,
            }}
          />
          <Row gap="8" vertical="center">
            <Clock size={12} style={{ color: tokens.color.textMuted }} />
            <Text
              variant="body-default-xs"
              style={{ color: tokens.color.textMuted, fontVariantNumeric: "tabular-nums" }}
            >
              {time}
            </Text>
          </Row>
        </Row>
      </Row>
    </Row>
  );
};
