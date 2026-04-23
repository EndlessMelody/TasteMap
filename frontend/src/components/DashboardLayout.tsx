"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Column,
  Row,
} from "@/components/OnceUI";
import { AppStatusBar } from "./common/AppStatusBar";

import { UserVectorProvider } from "@/context/UserVectorContext";

import { Sidebar } from "./common/Sidebar";
import { useUiStore } from "@/store/uiStore";
import { ChatProvider, useChat } from "@/context/ChatContext";
import dynamic from "next/dynamic";

const RightSidebar = dynamic(() => import("./common/RightSidebar").then(mod => mod.RightSidebar), { ssr: false });
const CreatePostModal = dynamic(() => import("@/components/modals/CreatePostModal").then(mod => mod.CreatePostModal), { ssr: false });
const MessagingSidebar = dynamic(() => import("./features/foodies/MessagingSidebar").then(mod => mod.MessagingSidebar), { ssr: false });
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
          gap: 12,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 48,
            fontWeight: 800,
            color: "#ff6b35",
            letterSpacing: "-0.06em",
            fontFamily: "var(--font-geist-sans), sans-serif",
            lineHeight: 1,
          }}
        >
          TasteMap.
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(0,0,0,0.45)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
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
  const { isInitializing, isLoggedIn } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightExpanded, setIsRightExpanded] = useState(false);
  
  // Global Modals State
  const { isCreatePostModalOpen, closeCreatePost, createPostType } = useUiStore();
  
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = pathname === "/" || pathname === "/login";
  const isPromoPage = isPublicPage;
  const isExplorePage = pathname.startsWith("/explore");
  const isFullScreenPage =
    pathname.startsWith("/profile") || pathname.startsWith("/tour-builder");

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
      setIsSidebarOpen(false);
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


  return (
    <Row
      fillWidth
      background={isFullScreenPage ? "surface" : "page"}
      overflow="hidden"
      style={{
        height: "100vh",
        color: "var(--foreground)",
        position: "relative",
        ["--explore-left-sidebar-width" as string]: isExplorePage
          ? isSidebarOpen
            ? "240px"
            : "72px"
          : "0px",
      }}
    >
      {/* ═══════════ 1. LEFT SIDEBAR ═══════════ */}
      {isExplorePage ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 30,
          }}
        >
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={setIsSidebarOpen}
            isFullScreen={false}
            currentPath={pathname}
          />
        </div>
      ) : (
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={setIsSidebarOpen}
          isFullScreen={isFullScreenPage}
          currentPath={pathname}
        />
      )}

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
            maxWidth:
              isFullScreenPage || isExplorePage
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
        {!isFoodies && !isExplorePage && <AppStatusBar />}
      </Column>

      {/* 3. RIGHT SIDEBAR */}
      {isFoodies ? (
        <Column
          fillHeight
          style={{
            width: isChatOpen ? "auto" : "0px",
            minWidth: isChatOpen ? "0" : "0px",
            flexGrow: isChatOpen ? 1 : 0,
            flexShrink: 0,
            flexBasis: isChatOpen ? "0%" : "auto",
            transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
            overflow: "hidden",
            borderLeftWidth: isChatOpen ? "1px" : "0",
            borderLeftStyle: "solid",
            borderLeftColor: isChatOpen ? "rgba(0,0,0,0.06)" : "transparent",
          }}
        >
          <MessagingSidebar
            isOpen={isChatOpen}
            onToggle={() => setIsChatOpen(!isChatOpen)}
            activeUser={activeFriend}
          />
        </Column>
      ) : !isFullScreenPage && !isAIPlanner && !isExplorePage ? (
        <RightSidebar
          isExpanded={isRightExpanded}
          onExpandChange={setIsRightExpanded}
        />
      ) : null}

      {/* 4. GLOBAL MODALS */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={closeCreatePost}
        initialType={createPostType}
      />
    </Row>
  );
}
