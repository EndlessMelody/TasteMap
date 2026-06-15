"use client";

import { motion } from "framer-motion";

// Shown while auth state resolves on first load (both route groups use this).
export function SplashScreen() {
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

export default SplashScreen;
