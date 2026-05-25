"use client";

import React from "react";
import { motion } from "framer-motion";

export function PromoBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        background: "linear-gradient(160deg, #FFFCF7 0%, #FFF7EE 50%, #FFF3E3 100%)",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Warm glow — top left */}
      <motion.div
        animate={{
          scale: [1, 1.18, 0.94, 1.08, 1],
          x: [0, 50, -30, 25, 0],
          y: [0, -35, 50, -18, 0],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "-20%",
          left: "-12%",
          width: "65vw",
          height: "65vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,140,60,0.12) 0%, transparent 65%)",
          filter: "blur(80px)",
        }}
      />

      {/* Amber glow — bottom right */}
      <motion.div
        animate={{
          scale: [1, 0.9, 1.14, 1, 0.96],
          x: [0, -40, 28, -20, 0],
          y: [0, 45, -28, 35, 0],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        style={{
          position: "absolute",
          bottom: "-18%",
          right: "-12%",
          width: "58vw",
          height: "58vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 65%)",
          filter: "blur(80px)",
        }}
      />

      {/* Subtle dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.5,
        }}
      />

      {/* Noise texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
      />
    </div>
  );
}
