"use client";

import React, { useState, useEffect, useRef } from "react";
import { Column, Text } from "@/components/OnceUI";
import { motion, useScroll, AnimatePresence } from "framer-motion";

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

export default function DashboardPage() {
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
    const timer = setTimeout(() => setIsLoading(false), 1500);
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
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15
      }
    }
  };

  return (
    <React.Fragment>
      {/* Loading Overlay (unchanged) */}
      {/* ═══════════ IMMERSIVE LOADING OVERLAY ═══════════ */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)", transition: { duration: 0.8, ease: "easeInOut" } }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden"
            }}
          >
            {/* Layer 1: Animated Mesh Gradient */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{
                position: "absolute",
                inset: "-50%",
                background: "radial-gradient(circle at 30% 30%, #007AFF15 0%, transparent 40%), radial-gradient(circle at 70% 70%, #5856D615 0%, transparent 40%), radial-gradient(circle at 50% 50%, #F2F2F7 0%, #E5E5EA 100%)",
                filter: "blur(80px)",
                zIndex: 0
              }}
            />

            {/* Layer 2: Grain Overlay */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none', zIndex: 1, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            <Column horizontal="center" style={{ gap: "32px", zIndex: 10, position: 'relative', width: '100vw' }}>
              <div style={{ position: 'relative' }}>
                {/* Logo Pulsing Aura */}
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: 'radial-gradient(circle, #007AFF30 0%, transparent 70%)', zIndex: -1 }}
                />

                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor: "white",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Vertical Scanline */}
                  <motion.div
                    animate={{ top: ['-100%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, transparent, rgba(0,122,255,0.1), transparent)', zIndex: 2 }}
                  />

                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    border: '3px solid rgba(0, 122, 255, 0.1)', 
                    borderTopColor: '#007AFF', 
                    animation: 'spin 1s cubic-bezier(0.55, 0.055, 0.675, 0.19) infinite' 
                  }} />
                </motion.div>
              </div>

              <Column horizontal="center" style={{ gap: '12px', width: '100%' }}>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Text align="center" style={{ color: "#1C1C1E", fontWeight: 800, fontSize: "1rem", letterSpacing: '-0.3px', background: 'linear-gradient(90deg, #1C1C1E, #007AFF, #1C1C1E)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 3s linear infinite', textAlign: 'center' }}>
                    Preparing your TasteMap...
                  </Text>
                </motion.div>
                
                {/* Visual Progress Bar */}
                <div style={{ width: '140px', height: '2px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '1px', overflow: 'hidden', position: 'relative', margin: '0 auto' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #007AFF, #5856D6)', boxShadow: '0 0 8px rgba(0,122,255,0.4)' }}
                  />
                </div>
              </Column>
            </Column>
            
            <style jsx global>{`
              @keyframes shimmer {
                0% { background-position: 0% center; }
                100% { background-position: 200% center; }
              }
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>

      <Column
        fillHeight
        style={{
          flex: 1,
          minWidth: 0,
          position: "relative",
          backgroundColor: "#F2F2F7",
        }}
      >
        {/* Persistent Header - Constrained by DashboardLayout's center panel width */}
        <DashboardHeader 
            scrollY={scrollY}
            onProfileClick={() => {}}
            onSettingsClick={() => {
            setActiveSettingsTab("appearance");
            setIsSettingsModalOpen(true);
            }}
            onNotifClick={() => {}}
        />

        {/* Scrollable Content */}
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
                    paddingRight: "32px" 
                }}
            >
                {/* Main Dashboard Sections */}
                <motion.div variants={itemVariants}><HeroSection /></motion.div>
                <motion.div variants={itemVariants}><AIPicksSection /></motion.div>
                <motion.div variants={itemVariants}>
                <TrendingReels onReelClick={(reel) => setSelectedReel(reel)} />
                </motion.div>
                <motion.div variants={itemVariants}><ContextualNavigator /></motion.div>
                <motion.div variants={itemVariants}><LobbySection /></motion.div>
                <motion.div variants={itemVariants}><TasteVault /></motion.div>
                <motion.div variants={itemVariants}>
                <FoodieFeed onPostClick={(post) => setSelectedPost(post)} />
                </motion.div>
                <motion.div variants={itemVariants}><TasteMapProBanner /></motion.div>
            </Column>
            </motion.div>
        </Column>
      </Column>

      {/* Modals Layer */}
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
