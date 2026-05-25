"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Foodies",  href: "#why"      },
  { label: "Pricing",  href: "#plans"    },
  { label: "About",    href: "#footer"   },
];

export function PromoNav() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (href: string) => {
    if (href.startsWith("#"))
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{
        opacity: 1,
        y: 0,
        backgroundColor: scrolled ? "rgba(255,252,247,0.9)" : "rgba(255,252,247,0)",
        backdropFilter: scrolled ? "blur(20px)" : "none",
      }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        borderBottom: scrolled
          ? "1px solid rgba(0,0,0,0.07)"
          : "1px solid transparent",
      }}
    >
      <div
        style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 32px",
          height: 64, display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div
            style={{
              width: 32, height: 32, borderRadius: 9,
              background: "linear-gradient(135deg, #FF5500, #FF3300)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 0 1px rgba(255,85,0,0.25), 0 4px 14px rgba(255,85,0,0.25)",
            }}
          >
            <MapPin size={16} color="white" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.5px", color: "#18160F" }}>
            TasteMap<span style={{ color: "#FF5500" }}>.</span>
          </span>
        </div>

        {/* Desktop links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 2 }} className="promo-desktop-nav">
          {NAV_LINKS.map((l) => (
            <button
              key={l.label}
              onClick={() => scrollTo(l.href)}
              style={{
                padding: "7px 14px", borderRadius: 8,
                background: "none", border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 500, color: "rgba(24,22,15,0.55)",
                transition: "color 0.15s, background-color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#18160F";
                (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,0,0,0.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "rgba(24,22,15,0.55)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isLoggedIn && (
            <button
              onClick={() => router.push("/login")}
              style={{
                padding: "7px 16px", borderRadius: 8, background: "none",
                border: "1px solid rgba(0,0,0,0.12)", cursor: "pointer",
                fontSize: 14, fontWeight: 600, color: "rgba(24,22,15,0.65)",
                transition: "color 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#18160F";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.22)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "rgba(24,22,15,0.65)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.12)";
              }}
            >
              Login
            </button>
          )}
          <button
            onClick={() => router.push("/discover")}
            style={{
              padding: "8px 18px", borderRadius: 8,
              background: "#FF5500", border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 700, color: "white",
              boxShadow: "0 2px 14px rgba(255,85,0,0.32)",
              transition: "box-shadow 0.15s, transform 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#FF6B35";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 22px rgba(255,85,0,0.48)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#FF5500";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 14px rgba(255,85,0,0.32)";
              (e.currentTarget as HTMLElement).style.transform = "";
            }}
          >
            {isLoggedIn ? "Open App →" : "Get Started →"}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "none", padding: 6, borderRadius: 8,
              background: "rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.08)", cursor: "pointer",
            }}
            className="promo-mobile-menu-btn"
          >
            {mobileOpen ? <X size={20} color="#18160F" /> : <Menu size={20} color="#18160F" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          style={{
            padding: "12px 24px 20px",
            borderTop: "1px solid rgba(0,0,0,0.07)",
            backgroundColor: "rgba(255,252,247,0.97)",
            backdropFilter: "blur(20px)",
            display: "flex", flexDirection: "column", gap: 4,
          }}
        >
          {NAV_LINKS.map((l) => (
            <button
              key={l.label}
              onClick={() => scrollTo(l.href)}
              style={{
                padding: "10px 12px", borderRadius: 8, background: "none",
                border: "none", cursor: "pointer", fontSize: 15,
                fontWeight: 500, color: "rgba(24,22,15,0.8)", textAlign: "left",
              }}
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => router.push("/discover")}
            style={{
              marginTop: 8, padding: "12px", borderRadius: 10,
              background: "#FF5500", border: "none", cursor: "pointer",
              fontSize: 15, fontWeight: 700, color: "white",
            }}
          >
            Get Started →
          </button>
        </div>
      )}
    </motion.nav>
  );
}
