"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Compass,
  Hand,
  Trophy,
  Map,
  ListChecks,
  Sparkles,
  Users,
  Mic,
  BadgeCheck,
  BookOpen,
  Shield,
  SquarePlus,
  Crown,
  User as UserIcon,
} from "lucide-react";
import { Column, Row } from "@once-ui-system/core";
import { useUiStore } from "@/store/uiStore";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { BodySm, DecoratedAvatar } from "@/components/ui";
import { tokens } from "@/styles/tokens";

// ─── Design tokens ───
const LIGHT_C = {
  bg: tokens.color.surfaceWarm,
  border: "rgba(0, 0, 0, 0.06)",
  sectionLabel: "rgba(0, 0, 0, 0.3)",
  itemDefault: "rgba(0, 0, 0, 0.5)",
  itemActive: tokens.color.warm,
  itemHover: "rgba(0, 0, 0, 0.04)",
  itemActiveBg: `${tokens.color.warm}14`,
  indicator: tokens.color.warm,
  logo: tokens.color.warm,
  profileName: "rgba(0, 0, 0, 0.85)",
  profileSub: "rgba(0, 0, 0, 0.4)",
  widgetBg: `${tokens.color.warm}0D`,
  widgetBorder: `${tokens.color.warm}26`,
  progressBg: "rgba(0, 0, 0, 0.06)",
  progressFill: tokens.color.warm,
  divider: "rgba(0,0,0,0.06)",
};

const DARK_C = {
  bg: tokens.color.surfaceInk,
  border: "rgba(255, 255, 255, 0.08)",
  sectionLabel: "rgba(255, 255, 255, 0.3)",
  itemDefault: "rgba(255, 255, 255, 0.5)",
  itemActive: tokens.color.warmBright,
  itemHover: "rgba(255, 255, 255, 0.06)",
  itemActiveBg: `${tokens.color.warmBright}1F`,
  indicator: tokens.color.warmBright,
  logo: tokens.color.warmBright,
  profileName: "rgba(255, 255, 255, 0.9)",
  profileSub: "rgba(255, 255, 255, 0.4)",
  widgetBg: `${tokens.color.warmBright}14`,
  widgetBorder: `${tokens.color.warmBright}33`,
  progressBg: "rgba(255, 255, 255, 0.08)",
  progressFill: tokens.color.warmBright,
  divider: "rgba(255,255,255,0.08)",
};

function useThemeColors() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark" ? DARK_C : LIGHT_C;
}

// ─── Tooltip for collapsed state ───
const Tooltip: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const C = useThemeColors();

  return (
    <Column
      style={{ position: "relative", width: "100%" }}
      onMouseEnter={() => {
        timerRef.current = setTimeout(() => setVisible(true), 300);
      }}
      onMouseLeave={() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setVisible(false);
      }}
    >
      {children}
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
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
          <span
            style={{
              color: "rgba(0,0,0,0.75)",
              fontWeight: 600,
              fontSize: "12px",
            }}
          >
            {label}
          </span>
        </motion.div>
      )}
    </Column>
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
  const [isHovered, setIsHovered] = useState(false);
  const C = useThemeColors();

  const item = (
    <Row
      vertical="center"
      horizontal="start"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      style={{
        padding: "8px 16px",
        borderRadius: "10px",
        backgroundColor: active
          ? C.itemActiveBg
          : isHovered
            ? C.itemHover
            : "transparent",
        cursor: "pointer",
        color: active ? C.itemActive : C.itemDefault,
        transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
        minHeight: "38px",
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Active left indicator */}
      {active && (
        <motion.div
          layoutId="sidebar-active-indicator"
          style={{
            position: "absolute",
            left: 0,
            top: "18%",
            bottom: "18%",
            width: "3px",
            backgroundColor: C.indicator,
            borderRadius: "0 3px 3px 0",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}

      {/* Icon */}
      <Row
        horizontal="center"
        vertical="center"
        style={{
          flexShrink: 0,
          width: "24px",
          color: "inherit",
          zIndex: 1,
        }}
      >
        {icon}
      </Row>

      {/* Smoothly animated text slide + fade */}
      <motion.div
        animate={{
          opacity: collapsed ? 0 : 1,
          x: collapsed ? -8 : 0,
        }}
        transition={{
          duration: 0.28,
          ease: [0.19, 1, 0.22, 1],
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flex: 1,
          overflow: "hidden",
          whiteSpace: "nowrap",
          marginLeft: 10,
        }}
      >
        <BodySm
          style={{
            color: "inherit",
            fontWeight: active ? tokens.type.weight.semibold : tokens.type.weight.regular,
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {label}
        </BodySm>

        {badge && (
          <span
            style={{
              padding: "2px 7px",
              backgroundColor: "rgba(255, 107, 53, 0.15)",
              border: "1px solid rgba(255, 107, 53, 0.25)",
              borderRadius: tokens.radius.pill,
              flexShrink: 0,
              fontSize: "0.65rem",
              fontWeight: tokens.type.weight.bold,
              color: C.itemActive,
            }}
          >
            {badge}
          </span>
        )}
      </motion.div>
    </Row>
  );

  return collapsed ? <Tooltip label={label}>{item}</Tooltip> : item;
};

// ─── Section Label ───
const SectionLabel: React.FC<{ label: string; visible?: boolean }> = ({
  label,
  visible = true,
}) => {
  const C = useThemeColors();
  return (
    <Row
      vertical="center"
      style={{
        width: "100%",
        height: "20px",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <motion.span
        animate={{
          opacity: visible ? 1 : 0,
          x: visible ? 0 : -8,
        }}
        transition={{
          duration: 0.28,
          ease: [0.19, 1, 0.22, 1],
        }}
        style={{
          display: "block",
          color: C.sectionLabel,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          fontWeight: tokens.type.weight.semibold,
          fontSize: "10px",
          padding: "0 16px",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </motion.span>
    </Row>
  );
};

// ─── Main Sidebar ───
interface SidebarProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  isFullScreen?: boolean;
  currentPath: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  isFullScreen = false,
  currentPath,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const C = useThemeColors();
  const { t } = useLanguage();
  const isCreatePostModalOpen = useUiStore((state) => state.isCreatePostModalOpen);

  return (
    <motion.div
      className="no-scrollbar"
      animate={{
        width: isFullScreen ? 0 : isOpen ? 240 : 72,
      }}
      transition={{
        duration: 0.28,
        ease: [0.19, 1, 0.22, 1], // snappier animation
      }}
      onMouseEnter={() => {
        if (!isOpen) onToggle(true);
      }}
      onMouseLeave={() => {
        if (isOpen) onToggle(false);
      }}
      style={{
        height: "100%",
        flexShrink: 0,
        overflowX: "hidden",
        overflowY: "auto",
        borderRight: isFullScreen ? "none" : `1px solid ${C.border}`,
        backgroundColor: C.bg,
        boxShadow: "1px 0 0 rgba(0,0,0,0.06)",
        padding: isFullScreen ? "0" : "24px 8px 20px",
        display: isFullScreen ? "none" : "flex",
        flexDirection: "column",
        gap: "16px",
        position: "relative",
        zIndex: tokens.z.sticky,
        boxSizing: "border-box",
      }}
    >
      {/* ─── Header: Logo + Toggle ─── */}
      <Row
        vertical="center"
        horizontal="start"
        style={{
          minHeight: "36px",
          flexShrink: 0,
          paddingLeft: "20px",
        }}
      >
        <Row
          vertical="center"
          onClick={() => router.push(user ? "/discover" : "/")}
          style={{
            color: C.logo,
            fontWeight: 800,
            letterSpacing: "-0.06em",
            cursor: "pointer",
            userSelect: "none",
            fontSize: "18px",
            fontFamily: "var(--font-geist-sans), sans-serif",
            lineHeight: 1,
          }}
        >
          <span>T</span>
          <motion.span
            animate={{
              opacity: isOpen ? 1 : 0,
              width: isOpen ? "auto" : 0,
            }}
            transition={{
              duration: 0.28,
              ease: [0.19, 1, 0.22, 1],
            }}
            style={{
              overflow: "hidden",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
          >
            asteMap.
          </motion.span>
        </Row>
      </Row>

      {/* ─── Divider ─── */}
      <Column
        style={{
          height: "1px",
          backgroundColor: C.divider,
          flexShrink: 0,
        }}
      />

      {/* ─── Menu Section ─── */}
      <Column style={{ gap: "1px", width: "100%", flexShrink: 0 }}>
        <SectionLabel label={t("nav.sectionMenu")} visible={isOpen} />
        <SidebarItem
          icon={<Compass size={17} />}
          label={t("nav.discover")}
          active={currentPath === "/discover"}
          collapsed={!isOpen}
          onClick={() => router.push("/discover")}
        />
        <SidebarItem
          icon={<Hand size={17} />}
          label={t("nav.tourBuilder")}
          active={currentPath === "/tour-builder"}
          collapsed={!isOpen}
          badge={t("sidebar.badgeNew")}
          onClick={() => router.push("/tour-builder")}
        />
        <SidebarItem
          icon={<ListChecks size={17} />}
          label={t("nav.myTours")}
          active={currentPath === "/tours"}
          collapsed={!isOpen}
          onClick={() => router.push("/tours")}
        />
        <SidebarItem
          icon={<Trophy size={17} />}
          label={t("nav.challenges")}
          active={currentPath === "/challenges"}
          collapsed={!isOpen}
          onClick={() => router.push("/challenges")}
        />
        <SidebarItem
          icon={<Map size={17} />}
          label={t("nav.explore")}
          active={currentPath === "/explore"}
          collapsed={!isOpen}
          onClick={() => router.push("/explore")}
        />
        <SidebarItem
          icon={<Sparkles size={17} />}
          label={t("nav.aiPlanner")}
          active={currentPath === "/ai-planner"}
          collapsed={!isOpen}
          badge={t("sidebar.badgeAi")}
          onClick={() => router.push("/ai-planner")}
        />
        <SidebarItem
          icon={<BookOpen size={17} />}
          label={t("nav.cultureGuide")}
          active={currentPath === "/culture"}
          collapsed={!isOpen}
          badge={t("sidebar.badgeNew")}
          onClick={() => router.push("/culture")}
        />
        <SidebarItem
          icon={<Crown size={17} />}
          label={t("nav.membership")}
          active={currentPath === "/membership"}
          collapsed={!isOpen}
          onClick={() => router.push("/membership")}
        />
      </Column>

      {/* ─── Social Section ─── */}
      <Column style={{ gap: "1px", width: "100%", flexShrink: 0 }}>
        <SectionLabel label={t("nav.sectionSocial")} visible={isOpen} />
        <SidebarItem
          icon={<Users size={17} />}
          label={t("nav.foodies")}
          active={currentPath === "/foodies"}
          collapsed={!isOpen}
          onClick={() => router.push("/foodies")}
        />
        <SidebarItem
          icon={<Mic size={17} />}
          label={t("nav.groupRooms")}
          active={currentPath === "/group-rooms"}
          collapsed={!isOpen}
          onClick={() => router.push("/group-rooms")}
        />
        <SidebarItem
          icon={<SquarePlus size={17} />}
          label={t("nav.create")}
          active={isCreatePostModalOpen}
          collapsed={!isOpen}
          onClick={() => useUiStore.getState().openCreatePost("post")}
        />
      </Column>

      {/* ─── Admin Section ─── */}
      {user?.role === "admin" && (
        <Column style={{ gap: "1px", width: "100%", flexShrink: 0 }}>
          <SectionLabel label={t("nav.sectionAdmin")} visible={isOpen} />
          <SidebarItem
            icon={<Shield size={17} />}
            label={t("nav.dashboard")}
            active={currentPath.startsWith("/admin")}
            collapsed={!isOpen}
            badge={t("sidebar.badgeAdmin")}
            onClick={() => router.push("/admin")}
          />
        </Column>
      )}

      {/* ─── Spacer ─── */}
      <Column style={{ flex: 1 }} />

      {/* ─── Profile Footer ─── */}
      <SidebarProfileFooter isOpen={isOpen} />
    </motion.div>
  );
};

// ─── Profile footer: auth-aware ───
function SidebarProfileFooter({ isOpen }: { isOpen: boolean }) {
  const { user, isInitializing: loading, logout: signOut } = useAuth();
  const router = useRouter();
  const C = useThemeColors();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Column
        style={{
          height: "58px",
          flexShrink: 0,
          borderRadius: "10px",
          backgroundColor: "rgba(0,0,0,0.02)",
        }}
      />
    );
  }

  // ── Loading: show skeleton ──
  if (loading) {
    return (
      <>
        <style>{`
          @keyframes tm-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.45; }
          }
        `}</style>
        <Row
          vertical="center"
          style={{
            gap: "10px",
            paddingTop: "10px",
            paddingBottom: "10px",
            paddingLeft: isOpen ? "12px" : "0px",
            paddingRight: isOpen ? "12px" : "0px",
            borderRadius: "10px",
            border: `1px solid ${C.divider}`,
            justifyContent: isOpen ? "flex-start" : "center",
            flexShrink: 0,
          }}
        >
          <Column
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: C.divider,
              animation: "tm-pulse 1.4s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          {isOpen && (
            <Column
              style={{
                gap: "6px",
                flex: 1,
              }}
            >
              <Column
                style={{
                  height: "10px",
                  width: "70%",
                  borderRadius: "5px",
                  backgroundColor: C.divider,
                  animation: "tm-pulse 1.4s ease-in-out infinite",
                }}
              />
              <Column
                style={{
                  height: "8px",
                  width: "40%",
                  borderRadius: "4px",
                  backgroundColor: C.divider,
                  animation: "tm-pulse 1.4s ease-in-out infinite 0.2s",
                }}
              />
            </Column>
          )}
        </Row>
      </>
    );
  }

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
            "linear-gradient(135deg, rgba(255, 107, 53, 0.08), rgba(255, 140, 90, 0.08))",
          border: `1.5px solid rgba(255, 107, 53, 0.18)`,
          cursor: "pointer",
          flexShrink: 0,
          transition: "background 0.18s, border-color 0.18s",
          boxSizing: "border-box",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255, 107, 53, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255, 107, 53, 0.18)";
        }}
      >
        <Row
          horizontal="center"
          vertical="center"
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: "rgba(255, 107, 53, 0.1)",
            color: tokens.color.warm,
            flexShrink: 0,
          }}
        >
          <UserIcon size={14} strokeWidth={2} />
        </Row>
        <motion.div
          animate={{
            opacity: isOpen ? 1 : 0,
            x: isOpen ? 0 : -8,
          }}
          transition={{
            duration: 0.28,
            ease: [0.19, 1, 0.22, 1],
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            overflow: "hidden",
            whiteSpace: "nowrap",
            marginLeft: 10,
          }}
        >
          <BodySm
            style={{
              color: C.itemActive,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {t("sidebar.signIn")}
          </BodySm>
          <span style={{ color: C.profileSub, fontSize: "11px" }}>
            {t("sidebar.notLoggedIn")}
          </span>
        </motion.div>
      </button>
    );
  }

  return (
    <Row
      vertical="center"
      horizontal={isOpen ? "start" : "center"}
      onClick={() => router.push("/profile")}
      style={{
        gap: "10px",
        paddingTop: "8px",
        paddingBottom: "8px",
        paddingLeft: isOpen ? "16px" : "0px",
        paddingRight: isOpen ? "16px" : "0px",
        borderRadius: "10px",
        backgroundColor: "rgba(255,255,255,0.03)",
        border: `1px solid ${C.border}`,
        flexShrink: 0,
        cursor: "pointer",
        transition: "background-color 0.18s",
        position: "relative",
        minHeight: "56px",
        width: "100%",
        boxSizing: "border-box",
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.backgroundColor = C.itemHover;
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <Column style={{ position: "relative", flexShrink: 0 }}>
        <DecoratedAvatar
          src={user?.avatar_url || ""}
          name={user?.display_name || user?.username}
          size="sm"
          frame={user?.equipped_frame ?? null}
        />
        <Column
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "9px",
            height: "9px",
            borderRadius: "50%",
            backgroundColor: tokens.color.success,
            border: `2px solid ${C.bg}`,
          }}
        />
      </Column>

      <motion.div
        animate={{
          opacity: isOpen ? 1 : 0,
          x: isOpen ? 0 : -8,
        }}
        transition={{
          duration: 0.28,
          ease: [0.19, 1, 0.22, 1],
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flex: isOpen ? 1 : "0 0 0px",
          width: isOpen ? "auto" : 0,
          overflow: "hidden",
          whiteSpace: "nowrap",
          marginLeft: isOpen ? 10 : 0,
        }}
      >
        <Column style={{ gap: "1px", overflow: "hidden", flex: 1 }}>
          <Row vertical="center" style={{ gap: "4px" }}>
            <BodySm
              style={{
                color: C.profileName,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.display_name || user?.username || ""}
            </BodySm>
            <BadgeCheck size={12} color={tokens.color.warm} />
          </Row>
          <span style={{ color: C.profileSub, fontSize: "11px" }}>
            {t("sidebar.level", { n: user?.level ?? 1 })}
          </span>
        </Column>
        <button
          onClick={(e) => {
            e.stopPropagation();
            signOut();
            router.push("/");
          }}
          title={t("sidebar.signOut")}
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
            e.currentTarget.style.color = tokens.color.danger;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(0,0,0,0.3)";
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
      </motion.div>
    </Row>
  );
}
