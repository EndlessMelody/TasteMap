"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Column,
  Row,
  Heading,
  Text,
  Button,
  IconButton,
  Avatar,
} from "@/components/OnceUI";
import {
  Compass,
  Hand,
  MapPin,
  Users,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { AppStatusBar } from "./common/AppStatusBar";
import { MOCK_USER } from "@/constants/mock-data";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const radarData = MOCK_USER.radarData;

function SidebarItem({
  icon,
  label,
  active = false,
  collapsed = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  const [isHovered, setIsHovered] = React.useState(false);
  const showHighlight = active || isHovered;

  return (
    <Row
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="focus-ring"
      tabIndex={0}
      style={{
        padding: collapsed ? "10px 0" : "10px 12px",
        borderRadius: "10px",
        backgroundColor: showHighlight ? "#EAF2FF" : "transparent",
        cursor: "pointer",
        borderLeft: active ? "3px solid #007AFF" : "3px solid transparent",
        color: showHighlight ? "#007AFF" : "#8E8E93",
        transition: "all 0.2s ease",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? "0px" : "14px",
        overflow: "hidden",
        minHeight: "42px",
      }}
    >
      <div
        style={{
          color: "inherit",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      {!collapsed && (
        <Text
          style={{
            color: "inherit",
            fontWeight: active ? 600 : isHovered ? 500 : 400,
            fontSize: "0.9rem",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Text>
      )}
    </Row>
  );
}

const handleComingSoon = () => toast("Will be updated in the next version 🚀");

const friends = [
  {
    name: "Ramona F.",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop",
    status: "eating" as const,
    statusText: "🍜 On a Spicy Tour",
  },
  {
    name: "Mai Linh",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop",
    status: "online" as const,
    statusText: "🟢 Online",
  },
  {
    name: "Thảo Vy",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop",
    status: "lobby" as const,
    statusText: "🎮 In Group Lobby",
  },
  {
    name: "Hùng Đạt",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop",
    status: "eating" as const,
    statusText: "☕ Cafe Hopping",
  },
  {
    name: "Khôi Nguyên",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop",
    status: "online" as const,
    statusText: "🟢 Online",
  },
];

const statusDotColor = (s: string) =>
  s === "eating" ? "#F59E0B" : s === "lobby" ? "#A855F7" : "#00D1B2";
const statusTextColor = (s: string) =>
  s === "eating" ? "#F59E0B" : s === "lobby" ? "#A855F7" : "#00D1B2";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightExpanded, setIsRightExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isProfilePage = pathname === "/profile" || pathname.startsWith("/admin");

  // Auto-collapse sidebars when entering the profile page
  React.useEffect(() => {
    if (isProfilePage) {
      setIsSidebarOpen(false);
      setIsRightExpanded(false);
    }
  }, [isProfilePage]);

  const sidebarWidth = isProfilePage ? 0 : (isSidebarOpen ? 280 : 80);
  const rightSidebarWidth = isProfilePage ? 0 : (isRightExpanded ? 320 : 80);

  return (
    <Row
      fillWidth
      background={isProfilePage ? "surface" : "page"}
      overflow="hidden"
      style={{ height: "100vh", color: "#1C1C1E" }}
    >
      {/* ═══════════ 1. LEFT SIDEBAR ═══════════ */}
      <Column
        className="no-scrollbar"
        fillHeight
        background="surface"
        borderRight="neutral-alpha-weak"
        radius="none"
        style={{
          width: `${sidebarWidth}px`,
          minWidth: `${sidebarWidth}px`,
          padding: isProfilePage ? "0" : (isSidebarOpen ? "24px 20px" : "24px 12px"),
          flexShrink: 0,
          overflowX: "hidden",
          overflowY: "auto",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          gap: "28px",
          display: isProfilePage ? 'none' : 'flex',
        }}
      >
        {/* Logo + Toggle */}
        <Row
          fillWidth
          style={{
            justifyContent: isSidebarOpen ? "space-between" : "center",
            alignItems: "center",
            minHeight: "36px",
          }}
        >
          {isSidebarOpen && (
            <Heading
              variant="heading-strong-l"
              style={{
                color: "#ED1B24",
                fontWeight: 900,
                letterSpacing: "-0.5px",
                whiteSpace: "nowrap",
              }}
            >
              TasteMap.
            </Heading>
          )}
          <IconButton
            icon={
              isSidebarOpen ? (
                <PanelLeftClose size={18} color="#48484A" />
              ) : (
                <PanelLeftOpen size={18} color="#48484A" />
              )
            }
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              backgroundColor: "#F2F2F7",
              borderRadius: "10px",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              border: "1px solid #E5E5EA",
              transition: "background-color 0.2s",
            }}
          />
        </Row>

        {/* Menu Section */}
        <Column style={{ gap: "4px", width: "100%" }}>
          {isSidebarOpen && (
            <Text
              variant="body-default-xs"
              style={{
                color: "#AEAEB2",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: "8px",
                paddingLeft: "12px",
              }}
            >
              Menu
            </Text>
          )}
          <SidebarItem
            icon={<Compass size={20} />}
            label="Discover"
            active
            collapsed={!isSidebarOpen}
            onClick={() => {}}
          />
          <SidebarItem
            icon={<Hand size={20} />}
            label="Food Tour Builder"
            collapsed={!isSidebarOpen}
            onClick={() => router.push("/tour-builder")}
          />
          <SidebarItem
            icon={<MapPin size={20} />}
            label="Local Hot Routes"
            collapsed={!isSidebarOpen}
            onClick={handleComingSoon}
          />
        </Column>

        {/* Social Section */}
        <Column style={{ gap: "4px", width: "100%" }}>
          {isSidebarOpen && (
            <Text
              variant="body-default-xs"
              style={{
                color: "#AEAEB2",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: "8px",
                paddingLeft: "12px",
              }}
            >
              Social
            </Text>
          )}
          <SidebarItem
            icon={<Users size={20} />}
            label="Foodies"
            collapsed={!isSidebarOpen}
            onClick={handleComingSoon}
          />
          <SidebarItem
            icon={<Mic size={20} />}
            label="Group Rooms"
            collapsed={!isSidebarOpen}
            onClick={handleComingSoon}
          />
        </Column>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Gamification Card */}
        {isSidebarOpen ? (
          <Column
            style={{
              backgroundColor: "#F2F2F7",
              borderRadius: "16px",
              border: "1px solid #E5E5EA",
              padding: "16px",
              gap: "12px",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <Row style={{ alignItems: "center", gap: "12px" }}>
              <Avatar
                src={MOCK_USER.avatar}
                size="m"
              />
              <Column>
                <Heading variant="heading-strong-s" style={{ color: "#1C1C1E" }}>
                  {MOCK_USER.title}
                </Heading>
                <Text
                  variant="body-default-xs"
                  style={{ color: "#8E8E93" }}
                >
                  Level {MOCK_USER.level} • Vector Map
                </Text>
              </Column>
            </Row>
            <div
              style={{
                width: "100%",
                height: "150px",
                marginTop: "-4px",
                marginBottom: "-4px",
                minWidth: 1,
                minHeight: 1,
              }}
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={1} debounce={100}>
                <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                  <PolarGrid stroke="#E5E5EA" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#8E8E93", fontSize: 10 }}
                  />
                  <Radar
                    name="Taste"
                    dataKey="A"
                    stroke="#007AFF"
                    fill="#007AFF"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <Button
              size="s"
              variant="secondary"
              fillWidth
              onClick={handleComingSoon}
            >
              Challenge Data
            </Button>
          </Column>
        ) : (
          <Column
            style={{
              alignItems: "center",
              width: "100%",
              paddingBottom: "8px",
            }}
          >
            <Avatar
              src={MOCK_USER.avatar}
              size="m"
              style={{ border: "2px solid #007AFF", cursor: "pointer" }}
            />
          </Column>
        )}
      </Column>

      {/* 2. CENTER PANEL (CHILDREN) */}
      <Column flex={1} fillHeight style={{ minWidth: 0, position: "relative" }}>
        <Column flex={1} fillWidth style={{ overflowY: "auto", overflowX: "hidden" }}>
          {children}
        </Column>
        <AppStatusBar />
      </Column>

      {/* 3. RIGHT SIDEBAR */}
      <Column
        onMouseEnter={() => setIsRightExpanded(true)}
        onMouseLeave={() => setIsRightExpanded(false)}
        fillHeight
        background="surface"
        borderLeft="neutral-alpha-weak"
        radius="none"
        style={{
          width: isProfilePage ? '0px' : (isRightExpanded ? "320px" : "80px"),
          minWidth: isProfilePage ? '0px' : (isRightExpanded ? "320px" : "80px"),
          flexShrink: 0,
          transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
          overflow: "hidden",
          paddingTop: isProfilePage ? "0" : "24px",
          display: isProfilePage ? 'none' : 'flex',
        }}
      >
        <Row
          style={{
            padding: "0 18px 20px 18px",
            alignItems: "center",
            justifyContent: isRightExpanded ? "space-between" : "center",
            borderBottom: "1px solid #E5E5EA",
            paddingBottom: "20px",
            gap: "12px",
            minHeight: "44px",
          }}
        >
          {isRightExpanded && (
            <Heading
              variant="heading-strong-s"
              style={{
                color: "#1C1C1E",
                whiteSpace: "nowrap",
                opacity: isRightExpanded ? 1 : 0,
                transition: "opacity 0.2s 0.1s",
              }}
            >
              Friends
            </Heading>
          )}
          <IconButton
            icon={<Plus size={20} color="#ED1B24" />}
            onClick={handleComingSoon}
            style={{
              backgroundColor: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              minWidth: "44px",
              cursor: "pointer",
              transition: "border-color 0.2s",
              flexShrink: 0,
            }}
          />
        </Row>

        <Column
          style={{
            gap: "4px",
            paddingTop: "16px",
            overflowY: "auto",
            flex: 1,
            paddingBottom: "24px"
          }}
        >
          {friends.map((f) => (
            <Row
              key={f.name}
              style={{
                padding: "10px 18px",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                borderRadius: "12px",
                margin: "0 8px",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                if (isRightExpanded) e.currentTarget.style.backgroundColor = "#F2F2F7";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Avatar src={f.avatar} size="m" />
                <div
                  style={{
                    position: "absolute",
                    bottom: 1,
                    right: -1,
                    width: "12px",
                    height: "12px",
                    backgroundColor: statusDotColor(f.status),
                    borderRadius: "50%",
                    border: "2px solid #FFFFFF",
                    boxShadow: `0 0 6px ${statusDotColor(f.status)}60`,
                  }}
                />
              </div>

              <Row
                style={{
                  flex: 1,
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: isRightExpanded ? 1 : 0,
                  transition: "opacity 0.2s ease 0.1s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  minWidth: 0,
                }}
              >
                <Column style={{ gap: "2px", minWidth: 0 }}>
                  <Text style={{ color: "#1C1C1E", fontWeight: 700, fontSize: "0.8rem" }}>{f.name}</Text>
                  <Text style={{ color: statusTextColor(f.status), fontSize: "0.65rem", fontWeight: 600 }}>{f.statusText}</Text>
                </Column>
              </Row>
            </Row>
          ))}
        </Column>
      </Column>
    </Row>
  );
}
