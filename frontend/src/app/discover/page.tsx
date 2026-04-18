"use client";

import React, { useState, useEffect, useRef } from "react";
import { Column } from "@/components/OnceUI";
import { motion, useScroll } from "framer-motion";

// Modular Components
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { HeroSection } from "@/components/features/dashboard/HeroSection";
import { AIPicksSection } from "@/components/features/dashboard/AIPicksSection";
import { TrendingReels } from "@/components/features/dashboard/TrendingReels";
import { ContextualNavigator } from "@/components/features/dashboard/ContextualNavigator";
import { LobbySection } from "@/components/features/lobby";
import { TasteVault } from "@/components/features/dashboard/TasteVault";
import { FoodieFeed } from "@/components/features/dashboard/FoodieFeed";
import { TasteMapProBanner } from "@/components/features/dashboard/TasteMapProBanner";

// Modals
import PostModal from "@/components/PostModal";
import ReelModal from "@/components/ReelModal";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { CreateRoomModal } from "@/components/modals/CreateRoomModal";

// Types & Data
import { ReelData, PostData } from "@/types/dashboard";

export default function DiscoverPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [selectedReel, setSelectedReel] = useState<ReelData | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("appearance");

  // Scroll logic for header
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15,
      },
    },
  };

  return (
    <React.Fragment>
      <Column
        fillHeight
        style={{
          flex: 1,
          minWidth: 0,
          position: "relative",
          backgroundColor: "#fff5f0",
        }}
      >
        <DashboardHeader
          scrollY={scrollY}
          onProfileClick={() => {}}
          onSettingsClick={() => {
            setActiveSettingsTab("appearance");
            setIsSettingsModalOpen(true);
          }}
          onNotifClick={() => {}}
        />

        <Column
          ref={scrollRef}
          className="no-scrollbar"
          fillHeight
          style={{
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: "0%",
            minWidth: 0,
            minHeight: 0,
            overflowY: "auto",
            paddingBottom: "60px",
            position: "relative",
          }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <Column
              fillWidth
              style={{
                gap: "32px",
                paddingTop: "32px",
                paddingBottom: "12px",
                paddingLeft: "32px",
                paddingRight: "32px",
              }}
            >
              <motion.div variants={itemVariants}>
                <HeroSection />
              </motion.div>
              <motion.div variants={itemVariants}>
                <AIPicksSection isLoading={isLoading} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TrendingReels
                  onReelClick={(reel) => setSelectedReel(reel)}
                  isLoading={isLoading}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <ContextualNavigator />
              </motion.div>
              <motion.div variants={itemVariants}>
                <LobbySection />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TasteVault />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FoodieFeed
                  onPostClick={(post) => setSelectedPost(post)}
                  isLoading={isLoading}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TasteMapProBanner />
              </motion.div>
            </Column>
          </motion.div>
        </Column>
      </Column>

      {selectedReel && (
        <ReelModal
          isOpen={!!selectedReel}
          data={selectedReel}
          onClose={() => setSelectedReel(null)}
        />
      )}
      {selectedPost && (
        <PostModal
          isOpen={!!selectedPost}
          data={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        initialTab={activeSettingsTab}
      />
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
      />
    </React.Fragment>
  );
}
