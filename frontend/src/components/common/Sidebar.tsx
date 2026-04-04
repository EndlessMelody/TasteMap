"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Column,
  Row,
  Heading,
  Text,
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
  BadgeCheck,
} from "lucide-react";
import { MOCK_USER } from "@/constants/mock-data";
import { useAuth } from "@/hooks/useAuth";

// ─── Design tokens (light theme) ───
const C = {
  bg: "#FFFFFF",
  border: "rgba(0, 0, 0, 0.06)",
  sectionLabel: "rgba(0, 0, 0, 0.3)",
  itemDefault: "rgba(0, 0, 0, 0.5)",
  itemActive: "#4F8EF7",
  itemHover: "rgba(0, 0, 0, 0.04)",
  itemActiveBg: "rgba(79, 142, 247, 0.08)",
  indicator: "#4F8EF7",
  logo: "#4F8EF7",
  profileName: "rgba(0, 0, 0, 0.85)",
  profileSub: "rgba(0, 0, 0, 0.4)",
  widgetBg: "rgba(79, 142, 247, 0.05)",
  widgetBorder: "rgba(79, 142, 247, 0.15)",
  progressBg: "rgba(0, 0, 0, 0.06)",
  progressFill: "#4F8EF7",
} as const;

// ─── Tooltip for collapsed state ───
const Tooltip: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => {
  const [visible, setVisible] = React.useState(false);
  return (
    <div
      style={{ position: "relative", width: "100%" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          style={{
            position: "absolute",
            left: "calc(100% + 10px)",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "rgba(255,255,255,0.97)",
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            padding: "6px 12px",
            whiteSpace: "nowrap",
            zIndex: 9999,
            pointerEvents: "none",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          <Text
            variant="body-default-xs"
            style={{ color: "rgba(0,0,0,0.75)", fontWeight: 600 }}
          >
            {label}
          </Text>
        </div>
      )}
    </div>
  );
};

// ─── Sidebar Item ───
interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  badge?: string;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active = false,
  collapsed = false,
  badge,
  onClick,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const item = (
    <Row
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      style={{
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: "10px",
        padding: collapsed ? "11px 0" : "10px 12px",
        borderRadius: "10px",
        backgroundColor: active
          ? C.itemActiveBg
          : isHovered
            ? C.itemHover
            : "transparent",
        cursor: "pointer",
        color: active ? C.itemActive : C.itemDefault,
        transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
        minHeight: "42px",
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Active left indicator */}
      {active && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "18%",
            bottom: "18%",
            width: "3px",
            backgroundColor: C.indicator,
            borderRadius: "0 3px 3px 0",
          }}
        />
      )}

      {/* Icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: "20px",
          color: "inherit",
        }}
      >
        {icon}
      </div>

      {/* Label */}
      {!collapsed && (
        <Text
          variant="body-default-s"
          style={{
            color: "inherit",
            fontWeight: active ? 600 : 400,
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {label}
        </Text>
      )}

      {/* Badge */}
      {!collapsed && badge && (
        <div
          style={{
            padding: "2px 7px",
            backgroundColor: "rgba(125, 170, 255, 0.15)",
            border: "1px solid rgba(125, 170, 255, 0.25)",
            borderRadius: "20px",
          }}
        >
          <Text
            variant="body-default-xs"
            style={{
              color: C.itemActive,
              fontWeight: 700,
              fontSize: "0.65rem",
            }}
          >
            {badge}
          </Text>
        </div>
      )}
    </Row>
  );

  return collapsed ? <Tooltip label={label}>{item}</Tooltip> : item;
};

// ─── Section Label ───
const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <Text
    variant="body-default-xs"
    style={{
      color: C.sectionLabel,
      textTransform: "uppercase",
      letterSpacing: "1.5px",
      fontWeight: 600,
      padding: "0 12px",
      marginBottom: "2px",
    }}
  >
    {label}
  </Text>
);

// ─── Main Sidebar ───
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isFullScreen?: boolean;
  currentPath: string;
  onComingSoon: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  isFullScreen = false,
  currentPath,
  onComingSoon,
}) => {
  const router = useRouter();
  const sidebarWidth = isFullScreen ? 0 : isOpen ? 240 : 72;

  return (
    <Column
      className="no-scrollbar"
      fillHeight
      style={{
        width: isFullScreen ? "0px" : `${sidebarWidth}px`,
        minWidth: isFullScreen ? "0px" : `${sidebarWidth}px`,
        flexShrink: 0,
        overflowX: "hidden",
        overflowY: "auto",
        transition:
          "width 0.35s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        borderRight: isFullScreen ? "none" : `1px solid ${C.border}`,
        backgroundColor: C.bg,
        boxShadow: "1px 0 0 rgba(0,0,0,0.06)",
        padding: isFullScreen
          ? "0"
          : isOpen
            ? "24px 12px 20px"
            : "24px 8px 20px",
        gap: "24px",
        display: isFullScreen ? "none" : "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* ─── Header: Logo + Toggle ─── */}
      <Row
        fillWidth
        style={{
          alignItems: "center",
          justifyContent: isOpen ? "space-between" : "center",
          minHeight: "36px",
          flexShrink: 0,
        }}
      >
        {isOpen && (
          <Heading
            variant="heading-strong-l"
            onClick={() => router.push("/")}
            style={{
              color: C.logo,
              fontWeight: 900,
              letterSpacing: "-0.5px",
              cursor: "pointer",
              lineHeight: 1,
              userSelect: "none",
              paddingLeft: "4px",
              paddingRight: "12px",
            }}
          >
            TasteMap.
          </Heading>
        )}
        <IconButton
          icon={
            isOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />
          }
          onClick={onToggle}
          variant="tertiary"
          style={{
            color: C.sectionLabel,
            backgroundColor: "transparent",
            width: "32px",
            height: "32px",
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
      </Row>

      {/* ─── Divider ─── */}
      <div
        style={{
          height: "1px",
          backgroundColor: "rgba(0,0,0,0.06)",
          flexShrink: 0,
        }}
      />

      {/* ─── Menu Section ─── */}
      <Column style={{ gap: "2px", width: "100%", flexShrink: 0 }}>
        {isOpen && <SectionLabel label="Menu" />}
        <SidebarItem
          icon={<Compass size={17} />}
          label="Discover"
          active={currentPath === "/discover"}
          collapsed={!isOpen}
          onClick={() => router.push("/discover")}
        />
        <SidebarItem
          icon={<Hand size={17} />}
          label="Tour Builder"
          active={currentPath === "/tour-builder"}
          collapsed={!isOpen}
          badge="New"
          onClick={() => router.push("/tour-builder")}
        />
        <SidebarItem
          icon={<MapPin size={17} />}
          label="Hot Routes"
          collapsed={!isOpen}
          badge="Soon"
          onClick={onComingSoon}
        />
      </Column>

      {/* ─── Social Section ─── */}
      <Column style={{ gap: "2px", width: "100%", flexShrink: 0 }}>
        {isOpen && <SectionLabel label="Social" />}
        <SidebarItem
          icon={<Users size={17} />}
          label="Foodies"
          active={currentPath === "/foodies"}
          collapsed={!isOpen}
          onClick={() => router.push("/foodies")}
        />
        <SidebarItem
          icon={<Mic size={17} />}
          label="Group Rooms"
          collapsed={!isOpen}
          badge="Soon"
          onClick={onComingSoon}
        />
      </Column>

      {/* ─── Spacer ─── */}
      <div style={{ flex: 1 }} />

      {/* ─── Discovery Stats Widget (expanded only) ─── */}
      {isOpen && (
        <Column
          style={{
            backgroundColor: C.widgetBg,
            border: `1px solid ${C.widgetBorder}`,
            borderRadius: "12px",
            padding: "14px 16px",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <Row style={{ alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: C.progressFill,
                boxShadow: "0 0 6px rgba(125,170,255,0.6)",
              }}
            />
            <Text
              variant="body-default-xs"
              style={{
                color: C.itemActive,
                fontWeight: 700,
                letterSpacing: "1px",
                fontSize: "0.65rem",
                textTransform: "uppercase",
              }}
            >
              Discovery Stats
            </Text>
          </Row>
          <Column style={{ gap: "8px" }}>
            <Row
              style={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Text variant="body-default-xs" style={{ color: C.sectionLabel }}>
                Foodies Found
              </Text>
              <Text
                variant="body-default-xs"
                style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
              >
                12/20
              </Text>
            </Row>
            <div
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: C.progressBg,
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "60%",
                  height: "100%",
                  background: `linear-gradient(90deg, ${C.progressFill}, rgba(125,170,255,0.6))`,
                  borderRadius: "4px",
                }}
              />
            </div>
          </Column>
        </Column>
      )}

      {/* ─── Profile Footer ─── */}
      <SidebarProfileFooter isOpen={isOpen} />
    </Column>
  );
};

// ─── Profile footer: auth-aware ───
function SidebarProfileFooter({ isOpen }: { isOpen: boolean }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <button
        onClick={() => router.push("/login")}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: isOpen ? "flex-start" : "center",
          gap: "10px",
          padding: isOpen ? "11px 14px" : "11px 0",
          borderRadius: "10px",
          background:
            "linear-gradient(135deg, rgba(0,122,255,0.08), rgba(88,86,214,0.08))",
          border: "1.5px solid rgba(0,122,255,0.18)",
          cursor: "pointer",
          flexShrink: 0,
          transition: "background 0.18s, border-color 0.18s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(0,122,255,0.4)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(0,122,255,0.18)";
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: "rgba(0,122,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 14 }}>👤</span>
        </div>
        {isOpen && (
          <Column style={{ gap: "1px", alignItems: "flex-start" }}>
            <Text
              variant="body-default-s"
              style={{
                color: C.itemActive,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              Sign In
            </Text>
            <Text
              variant="body-default-xs"
              style={{ color: "rgba(0,122,255,0.55)" }}
            >
              Not logged in
            </Text>
          </Column>
        )}
      </button>
    );
  }

  return (
    <Row
      onClick={() => router.push("/profile")}
      style={{
        alignItems: "center",
        gap: "10px",
        padding: isOpen ? "10px 12px" : "10px 0",
        borderRadius: "10px",
        backgroundColor: "rgba(255,255,255,0.03)",
        border: `1px solid rgba(0,0,0,0.06)`,
        justifyContent: isOpen ? "flex-start" : "center",
        flexShrink: 0,
        cursor: "pointer",
        transition: "background-color 0.18s",
        position: "relative",
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        (e.currentTarget as HTMLElement).style.backgroundColor =
          "rgba(0,0,0,0.03)";
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        (e.currentTarget as HTMLElement).style.backgroundColor =
          "rgba(255,255,255,0.03)";
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar
          src={user?.avatar_url || MOCK_USER.avatar}
          size="s"
          style={{
            border: "2px solid rgba(79,142,247,0.25)",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "9px",
            height: "9px",
            borderRadius: "50%",
            backgroundColor: "#4ADE80",
            border: "2px solid #FFFFFF",
          }}
        />
      </div>
      {isOpen && (
        <>
          <Column style={{ gap: "1px", overflow: "hidden", flex: 1 }}>
            <Row style={{ alignItems: "center", gap: "4px" }}>
              <Text
                variant="body-default-s"
                style={{
                  color: C.profileName,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.display_name || user?.username || MOCK_USER.name}
              </Text>
              <BadgeCheck size={12} color="#4F8EF7" />
            </Row>
            <Text variant="body-default-xs" style={{ color: C.profileSub }}>
              Level {user?.level ?? MOCK_USER.level}
            </Text>
          </Column>
          <button
            onClick={(e) => {
              e.stopPropagation();
              signOut();
              router.push("/");
            }}
            title="Sign out"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
              color: "rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#FF3B30";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(0,0,0,0.3)";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </>
      )}
    </Row>
  );
}
