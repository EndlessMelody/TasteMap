"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Row, Text } from "@/components/OnceUI";
import { Cpu, Globe, Users, Cloud, Clock, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * AppStatusBar - A fixed, center-aligned status bar for the Super App dashboard.
 * Positioned fixedly at the bottom of the center panel.
 */
export const AppStatusBar = () => {
  const [time, setTime] = React.useState<string>("");
  const { user, signOut } = useAuth();
  const router = useRouter();

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
        backgroundColor: "rgba(255, 255, 255, 0.9)",
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
        {/* Left: System Status */}
        <Row gap="16" vertical="center">
          <Row gap="6" vertical="center">
            <Cpu size={12} className="text-[#007AFF]" />
            <Text
              variant="body-default-xs"
              style={{ color: "#1C1C1E", fontWeight: 600 }}
            >
              ĐKhoa hong bic lam UI
            </Text>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#34C759",
              }}
            />
          </Row>
          <Row gap="6" vertical="center" hide="s">
            <Cloud size={12} style={{ color: "#8E8E93" }} />
            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>
              Syncing
            </Text>
          </Row>
        </Row>

        {/* Center: Quick Nav Pill */}
        <Row
          gap="20"
          vertical="center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.03)",
            paddingTop: "2px",
            paddingBottom: "2px",
            paddingLeft: "16px",
            paddingRight: "16px",
            borderRadius: "999px",
            borderTopWidth: "1px",
            borderBottomWidth: "1px",
            borderLeftWidth: "1px",
            borderRightWidth: "1px",
            borderStyle: "solid",
            borderColor: "rgba(0, 0, 0, 0.03)",
          }}
        >
          {["Discovery", "Vault", "Map"].map((item) => (
            <Text
              key={item}
              variant="body-default-xs"
              style={{
                color: "#1C1C1E",
                fontWeight: 500,
                cursor: "pointer",
                transitionProperty: "opacity",
                transitionDuration: "0.2s",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                (e.target as HTMLElement).style.opacity = "0.6";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                (e.target as HTMLElement).style.opacity = "1";
              }}
            >
              {item}
            </Text>
          ))}
        </Row>

        {/* Right: Metrics + Auth */}
        <Row gap="16" vertical="center">
          <Row gap="6" vertical="center" hide="m">
            <Users size={12} style={{ color: "#8E8E93" }} />
            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>
              342 Lobbies
            </Text>
          </Row>
          <Row gap="6" vertical="center">
            <Clock size={12} style={{ color: "#8E8E93" }} />
            <Text
              variant="body-default-xs"
              style={{ color: "#8E8E93", fontVariantNumeric: "tabular-nums" }}
            >
              {time}
            </Text>
          </Row>
          <Row gap="6" vertical="center">
            <Globe size={12} style={{ color: "#007AFF" }} />
            <Text
              variant="body-default-xs"
              style={{ color: "#1C1C1E", fontWeight: 600 }}
            >
              Dĩ An
            </Text>
          </Row>
          {/* Auth indicator */}
          {user ? (
            <Row gap="6" vertical="center">
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#34C759",
                  flexShrink: 0,
                }}
              />
              <Text
                variant="body-default-xs"
                onClick={() => router.push("/profile")}
                style={{
                  color: "#1C1C1E",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {user?.display_name || user?.username}
              </Text>
              <button
                onClick={() => {
                  signOut();
                  router.push("/");
                }}
                title="Sign out"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                  color: "rgba(0,0,0,0.3)",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.color = "#FF3B30";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.color = "rgba(0,0,0,0.3)";
                }}
              >
                <LogOut size={11} />
              </button>
            </Row>
          ) : (
            <button
              onClick={() => router.push("/login")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 6,
                background: "linear-gradient(135deg, #1A7AFF, #0057D9)",
                border: "none",
                cursor: "pointer",
                color: "white",
                fontSize: 11,
                fontWeight: 700,
                boxShadow: "0 1px 4px rgba(0,100,255,0.25)",
                whiteSpace: "nowrap",
              }}
            >
              <LogIn size={10} />
              Sign In
            </button>
          )}
        </Row>
      </Row>
    </Row>
  );
};
