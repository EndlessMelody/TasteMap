"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Column, Row } from "@once-ui-system/core";
import { AppStatusBar } from "@/components/common/AppStatusBar";
import { Sidebar } from "@/components/common/Sidebar";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { useUiStore } from "@/store/uiStore";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";

const RightSidebar = dynamic(() => import("@/components/common/RightSidebar").then((mod) => mod.RightSidebar), { ssr: false });
const CreatePostModal = dynamic(() => import("@/components/modals/CreatePostModal").then((mod) => mod.CreatePostModal), { ssr: false });
const MessagingSidebar = dynamic(() => import("@/components/features/foodies/MessagingSidebar").then((mod) => mod.MessagingSidebar), { ssr: false });

// Authenticated app shell: sidebars, status bar, global modals, route guard.
// The marketing shell (`/`, `/login`) lives in `app/(marketing)/layout.tsx`.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isInitializing, isLoggedIn } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightExpanded, setIsRightExpanded] = useState(false);

  const { isCreatePostModalOpen, closeCreatePost, createPostType } = useUiStore();

  const router = useRouter();
  const pathname = usePathname();

  const isExplorePage = pathname.startsWith("/explore");
  const isFullScreenPage =
    pathname.startsWith("/profile") || pathname.startsWith("/tour-builder");
  const isFoodies = pathname.startsWith("/foodies");
  const isAIPlanner = pathname.startsWith("/ai-planner");

  // ─── Route guard ─────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (isInitializing) return;
    if (!isLoggedIn) {
      router.replace("/login"); // unauthenticated users can't access app pages
    }
  }, [isInitializing, isLoggedIn, router]);

  // Auto-collapse sidebars when entering fullscreen pages
  React.useEffect(() => {
    setIsSidebarOpen(false);
    setIsRightExpanded(false);
  }, [isFullScreenPage]);

  const { isChatOpen, setIsChatOpen, activeFriend } = useChat();

  // Show splash while auth state is resolving (SSR → client hydration)
  if (isInitializing) {
    return <SplashScreen />;
  }

  return (
    <Row
      fillWidth
      background={isFullScreenPage ? "surface" : "page"}
      onBackground="neutral-strong"
      overflow="hidden"
      style={{
        height: "100vh",
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
        <Column position="absolute" left="0" top="0" bottom="0" style={{ zIndex: 30 }}>
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={setIsSidebarOpen}
            isFullScreen={false}
            currentPath={pathname}
          />
        </Column>
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
        vertical="between"
        gap="0"
        background={isFoodies && isChatOpen ? "surface" : "transparent"}
        style={{
          minWidth: 0,
          position: "relative",
          flexGrow: isFoodies && isChatOpen ? 0 : 1,
          flexShrink: isFoodies && isChatOpen ? 0 : 1,
          flexBasis: isFoodies && isChatOpen ? "320px" : "0%",
        }}
      >
        <Column
          key={pathname}
          fillWidth
          fillHeight
          vertical="between"
          gap="0"
          style={{
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: "0%",
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
            overflowY: "auto",
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
          borderLeft={isChatOpen ? "neutral-alpha-medium" : "transparent"}
          style={{
            width: isChatOpen ? "auto" : "0px",
            minWidth: isChatOpen ? "0" : "0px",
            flexGrow: isChatOpen ? 1 : 0,
            flexShrink: 0,
            flexBasis: isChatOpen ? "0%" : "auto",
            transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
            overflow: "hidden",
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
