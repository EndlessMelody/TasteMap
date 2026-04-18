"use client";

import React from "react";
import { MapPin } from "lucide-react";

const LINKS = {
  Solutions: ["Discover", "Tour Builder", "Foodies Network", "Group Rooms"],
  Company: ["About", "Blog", "Careers", "Press"],
  Learn: ["Docs", "Changelog", "Status", "Support"],
};

const SOCIAL = [
  { label: "𝕏", href: "#" },
  { label: "IG", href: "#" },
  { label: "TT", href: "#" },
];

export function PromoFooter() {
  return (
    <footer
      id="footer"
      style={{
        backgroundColor: "#0D1117",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "56px 0 32px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        {/* Top: logo + links */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #1A7AFF, #5856D6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MapPin size={13} color="white" />
              </div>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  color: "white",
                }}
              >
                TasteMap<span style={{ color: "#4F8EF7" }}>.</span>
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "rgba(255,255,255,0.35)",
                lineHeight: 1.65,
                maxWidth: 240,
              }}
            >
              Discover food, connect with foodies, build tours. Your flavour
              DNA, mapped.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 11,
                    fontWeight: 700,
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "rgba(255,255,255,0.1)";
                    (e.currentTarget as HTMLElement).style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.5)";
                  }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div
              key={section}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {section}
              </p>
              {items.map((item) => (
                <a
                  key={item}
                  href="#"
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.45)",
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.85)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.45)";
                  }}
                >
                  {item}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p
            style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.25)" }}
          >
            © {new Date().getFullYear()} TasteMap. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (l) => (
                <a
                  key={l}
                  href="#"
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.25)",
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.55)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.25)";
                  }}
                >
                  {l}
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
