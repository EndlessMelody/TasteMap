"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Trophy,
  Map,
  Sparkles,
  Users,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  BadgeCheck,
  BookOpen,
  Shield,
  SquarePlus,
  Clapperboard,
} from "lucide-react";
import { useUiStore } from "@/store/uiStore";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

// ─── Design tokens ───
const LIGHT_C = {
  bg: "#FFFFFF",
  border: "rgba(0, 0, 0, 0.06)",
  sectionLabel: "rgba(0, 0, 0, 0.3)",
  itemDefault: "rgba(0, 0, 0, 0.5)",
  itemActive: "#ff6b35",
  itemHover: "rgba(0, 0, 0, 0.04)",
  itemActiveBg: "rgba(255, 107, 53, 0.08)",
  indicator: "#ff6b35",
  logo: "#ff6b35",
  profileName: "rgba(0, 0, 0, 0.85)",
  profileSub: "rgba(0, 0, 0, 0.4)",
  widgetBg: "rgba(255, 107, 53, 0.05)",
  widgetBorder: "rgba(255, 107, 53, 0.15)",
  progressBg: "rgba(0, 0, 0, 0.06)",
  progressFill: "#ff6b35",
  divider: "rgba(0,0,0,0.06)",
};

const DARK_C = {
  bg: "#1C1C1E",
  border: "rgba(255, 255, 255, 0.08)",
  sectionLabel: "rgba(255, 255, 255, 0.3)",
  itemDefault: "rgba(255, 255, 255, 0.5)",
  itemActive: "#ff8c5a",
  itemHover: "rgba(255, 255, 255, 0.06)",
  itemActiveBg: "rgba(255, 140, 90, 0.12)",
  indicator: "#ff8c5a",
  logo: "#ff8c5a",
  profileName: "rgba(255, 255, 255, 0.9)",
  profileSub: "rgba(255, 255, 255, 0.4)",
  widgetBg: "rgba(255, 140, 90, 0.08)",
  widgetBorder: "rgba(255, 140, 90, 0.2)",
  progressBg: "rgba(255, 255, 255, 0.08)",
  progressFill: "#ff8c5a",
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
  const [visible, setVisible] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const C = useThemeColors();
  return (
    <div
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
          <Text
            variant="body-default-xs"
            style={{ color: "rgba(0,0,0,0.75)", fontWeight: 600 }}
          >
            {label}
          </Text>
        </motion.div>
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
  const C = useThemeColors();

  const item = (
    <Row
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "10px",
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: "24px",
          color: "inherit",
          zIndex: 1,
        }}
      >
        {icon}
      </div>

      {/* Label and Badge Container */}
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            key="content"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: 1,
              overflow: "hidden",
            }}
          >
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

            {badge && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  padding: "2px 7px",
                  backgroundColor: "rgba(255, 107, 53, 0.15)",
                  border: "1px solid rgba(255, 107, 53, 0.25)",
                  borderRadius: "20px",
                  flexShrink: 0,
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
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ width: "100%", overflow: "hidden" }}
        >
          <Text
            variant="body-default-xs"
            style={{
              color: C.sectionLabel,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              fontWeight: 600,
              padding: "0 16px",
              marginBottom: "2px",
              marginTop: "4px",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </Text>
        </motion.div>
      )}
    </AnimatePresence>
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
  const sidebarWidth = isFullScreen ? 0 : isOpen ? 240 : 72;

  const activeModal = useUiStore((state) => state.activeModal);

  // Track if we are hovering to prevent flickering
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      className="no-scrollbar"
      animate={{
        width: isFullScreen ? 0 : isOpen ? 240 : 72,
        minWidth: isFullScreen ? 0 : isOpen ? 240 : 72,
      }}
      transition={{
        duration: 0.35,
        ease: [0.19, 1, 0.22, 1], // Shorter, snappier ease to reduce perceived lag
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        if (!isOpen) onToggle(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
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
        gap: "16px",
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
          justifyContent: "flex-start",
          minHeight: "36px",
          flexShrink: 0,
          paddingLeft: "20px",
        }}
      >
        <Heading
          variant="heading-strong-l"
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
          onClick={() => router.push(user ? "/discover" : "/")}
        >
          {isOpen ? "TasteMap." : "T."}
        </Heading>
      </Row>

      {/* ─── Divider ─── */}
      <div
        style={{
          height: "1px",
          backgroundColor: C.divider,
          flexShrink: 0,
        }}
      />

      {/* ─── Menu Section ─── */}
      <Column style={{ gap: "1px", width: "100%", flexShrink: 0 }}>
        <SectionLabel label="Menu" visible={isOpen} />
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
          icon={<Trophy size={17} />}
          label="Challenges"
          active={currentPath === "/challenges"}
          collapsed={!isOpen}
          onClick={() => router.push("/challenges")}
        />
        <SidebarItem
          icon={<Map size={17} />}
          label="Explore"
          active={currentPath === "/explore"}
          collapsed={!isOpen}
          onClick={() => router.push("/explore")}
        />
        <SidebarItem
          icon={<Sparkles size={17} />}
          label="AI Planner"
          active={currentPath === "/ai-planner"}
          collapsed={!isOpen}
          badge="AI"
          onClick={() => router.push("/ai-planner")}
        />
        <SidebarItem
          icon={<BookOpen size={17} />}
          label="Culture Guide"
          active={currentPath === "/culture"}
          collapsed={!isOpen}
          badge="New"
          onClick={() => router.push("/culture")}
        />
      </Column>

      {/* ─── Social Section ─── */}
      <Column style={{ gap: "1px", width: "100%", flexShrink: 0 }}>
        <SectionLabel label="Social" visible={isOpen} />
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
          active={currentPath === "/group-rooms"}
          collapsed={!isOpen}
          onClick={() => router.push("/group-rooms")}
        />
        <SidebarItem
          icon={<SquarePlus size={17} />}
          label="Create"
          active={activeModal === "createPost"}
          collapsed={!isOpen}
          onClick={() => useUiStore.getState().openCreatePost("post")}
        />
      </Column>

      {/* ─── Admin Section ─── */}
      {user?.role === "admin" && (
        <Column style={{ gap: "1px", width: "100%", flexShrink: 0 }}>
          <SectionLabel label="Admin" visible={isOpen} />
          <SidebarItem
            icon={<Shield size={17} />}
            label="Dashboard"
            active={currentPath.startsWith("/admin")}
            collapsed={!isOpen}
            badge="Admin"
            onClick={() => router.push("/admin")}
          />
        </Column>
      )}

      {/* ─── Spacer ─── */}
      <div style={{ flex: 1 }} />

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
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          height: "58px",
          flexShrink: 0,
          borderRadius: "10px",
          backgroundColor: "rgba(0,0,0,0.02)",
        }}
      />
    );
  }

  // ── Loading: show skeleton, never flash "Sign In" ──
  if (loading) {
    return (
      <>
        <style>{`
          @keyframes tm-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.45; }
          }
        `}</style>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: isOpen ? "10px 12px" : "10px 0",
            borderRadius: "10px",
            border: "1px solid rgba(0,0,0,0.06)",
            justifyContent: isOpen ? "flex-start" : "center",
            flexShrink: 0,
          }}
        >
          {/* Avatar circle skeleton */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: "#F2F2F7",
              animation: "tm-pulse 1.4s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          {isOpen && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                flex: 1,
              }}
            >
              {/* Name line skeleton */}
              <div
                style={{
                  height: "10px",
                  width: "70%",
                  borderRadius: "5px",
                  backgroundColor: "#F2F2F7",
                  animation: "tm-pulse 1.4s ease-in-out infinite",
                }}
              />
              {/* Level line skeleton */}
              <div
                style={{
                  height: "8px",
                  width: "40%",
                  borderRadius: "4px",
                  backgroundColor: "#F2F2F7",
                  animation: "tm-pulse 1.4s ease-in-out infinite 0.2s",
                }}
              />
            </div>
          )}
        </div>
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
        padding: "8px 16px",
        borderRadius: "10px",
        backgroundColor: "rgba(255,255,255,0.03)",
        border: `1px solid rgba(0,0,0,0.06)`,
        justifyContent: "flex-start",
        flexShrink: 0,
        cursor: "pointer",
        transition: "background-color 0.18s",
        position: "relative",
        minHeight: "56px",
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
          src={user?.avatar_url || ""}
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
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="profile-info"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flex: 1,
              overflow: "hidden",
            }}
          >
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
                  {user?.display_name || user?.username || ""}
                </Text>
                <BadgeCheck size={12} color="#ff6b35" />
              </Row>
              <Text variant="body-default-xs" style={{ color: C.profileSub }}>
                Level {user?.level ?? 1}
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
          </motion.div>
        )}
      </AnimatePresence>
    </Row>
  );
}
