"use client";

import React from "react";
import { motion } from "framer-motion";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { LoginBranding } from "@/components/features/auth/LoginBranding";
import { tokens } from "@/styles/tokens";

export default function LoginPage() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: tokens.color.bg,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Left: branding panel — animated diagonal right edge */}
      <motion.div
        initial={{ clipPath: "polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)" }}
        animate={{
          clipPath: [
            "polygon(0% 0%, 100% 0%, 95% 100%, 0% 100%)",
            "polygon(0% 0%, 100% 0%, 85% 100%, 0% 100%)",
            "polygon(0% 0%, 100% 0%, 95% 100%, 0% 100%)",
          ],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{
          flex: "0 0 50%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <LoginBranding />
      </motion.div>

      {/* Right: form panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 160px 0px 0px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 460,
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,0.95)",
            boxShadow:
              "0 8px 48px rgba(0,0,0,0.07), 0 2px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
            padding: "32px 40px",
          }}
        >
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
