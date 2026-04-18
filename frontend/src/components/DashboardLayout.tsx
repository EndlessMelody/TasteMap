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
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import ClientOnly from "./common/ClientOnly";
import { UserVectorProvider, useUserVector } from "@/context/UserVectorContext";

import { Sidebar } from "./common/Sidebar";
import { ChatProvider, useChat } from "@/context/ChatContext";
import { MessagingSidebar } from "./features/foodies/MessagingSidebar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AuthProvider as HooksAuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { motion } from "framer-motion";

function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.05,
          type: "spring",
          stiffness: 280,
          damping: 22,
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 44 }}>🗺️</span>
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 800,
            color: "#1C1C1E",
            letterSpacing: "-0.8px",
          }}
        >
          TasteMap
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(0,0,0,0.35)" }}>
          Discover food together
        </p>
      </motion.div>
      <motion.div
        style={{
          position: "absolute",
          bottom: 40,
          width: 48,
          height: 3,
          borderRadius: 99,
          backgroundColor: "#E5E5EA",
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{
            height: "100%",
            borderRadius: 99,
            backgroundColor: "#ff6b35",
          }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

const handleComingSoon = () => toast("Will be updated in the next version 🚀");

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <HooksAuthProvider>
            <UserVectorProvider>
              <ChatProvider>
                <LayoutContent>{children}</LayoutContent>
              </ChatProvider>
            </UserVectorProvider>
          </HooksAuthProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { radarData, mergedRadarData, isPulsing } = useUserVector();
  const { user, isInitializing, isLoggedIn } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightExpanded, setIsRightExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = pathname === "/" || pathname === "/login";
  const isPromoPage = isPublicPage;
  const isFullScreenPage =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/tour-builder") ||
    pathname.startsWith("/explore");

  // ─── Route guard ─────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (isInitializing) return;
    if (isLoggedIn && pathname === "/login") {
      router.replace("/discover"); // logged-in users skip the login page
    } else if (!isLoggedIn && !isPublicPage) {
      router.replace("/login"); // unauthenticated users can't access app pages
    }
  }, [isInitializing, isLoggedIn, isPublicPage, pathname, router]);

  // Auto-collapse sidebars when entering fullscreen pages
  React.useEffect(() => {
    if (isFullScreenPage) {
      setIsSidebarOpen(false);
      setIsRightExpanded(false);
    } else {
      setIsSidebarOpen(true);
      setIsRightExpanded(false);
    }
  }, [isFullScreenPage]);

  const { isChatOpen, setIsChatOpen, activeFriend } = useChat();

  // Show splash while auth state is resolving (SSR → client hydration)
  if (isInitializing) {
    return <SplashScreen />;
  }

  // Promo page: render full-screen, no chrome
  if (isPromoPage) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {children}
      </div>
    );
  }

  const isFoodies = pathname.startsWith("/foodies");
  const isAIPlanner = pathname.startsWith("/ai-planner");

  const rightExpandedWidth = isFoodies ? "100%" : "320px";
  const rightSidebarWidth = isFullScreenPage || isAIPlanner
    ? "0px"
    : isFoodies
      ? isChatOpen
        ? "flex-fill"
        : "0px"
      : isRightExpanded
        ? "320px"
        : "80px";

  return (
    <Row
      fillWidth
      background={isFullScreenPage ? "surface" : "page"}
      overflow="hidden"
      style={{ height: "100vh", color: "var(--foreground)" }}
    >
      {/* ═══════════ 1. LEFT SIDEBAR ═══════════ */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isFullScreen={isFullScreenPage}
        currentPath={pathname}
      />

      {/* 2. CENTER PANEL (CHATS LIST) */}
      <Column
        fillHeight
        horizontal={isFoodies && isChatOpen ? "start" : "center"}
        vertical="stretch"
        gap="0"
        flexGrow={isFoodies && isChatOpen ? 0 : 1}
        flexShrink={isFoodies && isChatOpen ? 0 : 1}
        flexBasis={isFoodies && isChatOpen ? "320px" : "0%"}
        style={{
          minWidth: 0,
          position: "relative",
          backgroundColor: isFoodies && isChatOpen ? "white" : "transparent",
        }}
      >
        <Column
          key={pathname}
          fillWidth
          fillHeight
          vertical="stretch"
          gap="0"
          flexGrow={1}
          flexShrink={1}
          flexBasis="0%"
          style={{
            maxWidth: isFullScreenPage
              ? "100%"
              : isFoodies && isChatOpen
                ? "none"
                : "1440px",
            marginLeft: isFoodies && isChatOpen ? "0" : "auto",
            marginRight: isFoodies && isChatOpen ? "0" : "auto",
            paddingBottom: "0",
            paddingTop: "0",
            overflow: "hidden",
            position: "relative",
            minHeight: "1px",
            transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
          }}
        >
          {children}
        </Column>
        {!isFoodies && <AppStatusBar />}
      </Column>

      {/* 3. RIGHT SIDEBAR */}
      <Column
        onMouseEnter={() => !isFoodies && setIsRightExpanded(true)}
        onMouseLeave={() => !isFoodies && setIsRightExpanded(false)}
        fillHeight
        background="surface"
        borderLeft="neutral-alpha-weak"
        radius="none"
        style={{
          width: rightSidebarWidth === "flex-fill" ? "auto" : rightSidebarWidth,
          minWidth: rightSidebarWidth === "flex-fill" ? "0" : rightSidebarWidth,
          flexGrow: rightSidebarWidth === "flex-fill" ? 1 : 0,
          flexShrink: 0,
          flexBasis: rightSidebarWidth === "flex-fill" ? "0%" : "auto",
          paddingLeft: "0",
          paddingRight: "0",
          transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
          overflow: "hidden",
          paddingTop: isFullScreenPage || isFoodies ? "0" : "24px",
          paddingBottom: isFullScreenPage || isFoodies ? "0" : "24px",
          borderLeftWidth:
            isFullScreenPage || (isFoodies && !isChatOpen) ? "0" : "1px",
          borderLeftStyle: "solid",
          borderLeftColor:
            isFullScreenPage || (isFoodies && !isChatOpen)
              ? "transparent"
              : "rgba(0,0,0,0.06)",
        }}
      >
        {isFoodies ? (
          <MessagingSidebar
            isOpen={isChatOpen}
            onToggle={() => setIsChatOpen(!isChatOpen)}
            activeUser={activeFriend}
          />
        ) : (
          <Row
            style={{
              paddingTop: "0px",
              paddingBottom: "20px",
              paddingLeft: "18px",
              paddingRight: "18px",
              alignItems: "center",
              justifyContent: isRightExpanded ? "space-between" : "center",
              borderBottomWidth: "1px",
              borderBottomStyle: "solid",
              borderBottomColor: "#E5E5EA",
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
                borderTopWidth: "1px",
                borderBottomWidth: "1px",
                borderLeftWidth: "1px",
                borderRightWidth: "1px",
                borderTopStyle: "solid",
                borderBottomStyle: "solid",
                borderLeftStyle: "solid",
                borderRightStyle: "solid",
                borderTopColor: "rgba(255,255,255,0.12)",
                borderBottomColor: "rgba(255,255,255,0.12)",
                borderLeftColor: "rgba(255,255,255,0.12)",
                borderRightColor: "rgba(255,255,255,0.12)",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                minWidth: "44px",
                cursor: "pointer",
                transitionProperty: "border-color",
                transitionDuration: "0.2s",
                flexShrink: 0,
              }}
            />
          </Row>
        )}
      </Column>
    </Row>
  );
}
