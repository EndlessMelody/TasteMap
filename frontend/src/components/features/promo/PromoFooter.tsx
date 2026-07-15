"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { Column, Row, Grid } from "@once-ui-system/core";

const LINKS = {
  Solutions: ["Discover", "Tour Builder", "Foodies Network", "Group Rooms"],
  Company:   ["About", "Blog", "Careers", "Press"],
  Learn:     ["Docs", "Changelog", "Status", "Support"],
};

const SOCIAL = [
  { label: "𝕏",  href: "#" },
  { label: "IG", href: "#" },
  { label: "TT", href: "#" },
];

export function PromoFooter() {
  return (
    <footer
      id="footer"
      style={{
        backgroundColor: "transparent",
        borderTop: "1px solid rgba(0,0,0,0.07)",
        padding: "24px 0 16px",
      }}
    >
      <Column
        style={{
          maxWidth: 1200,
          marginTop: 0,
          marginRight: "auto",
          marginBottom: 0,
          marginLeft: "auto",
          paddingTop: 0,
          paddingRight: "32px",
          paddingBottom: 0,
          paddingLeft: "32px",
        }}
      >
        {/* Top: logo + links */}
        <Grid
          style={{
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 20,
          }}
        >
          {/* Brand */}
          <Column style={{ gap: 16 }}>
            <Row vertical="center" style={{ gap: 8 }}>
              <Row
                horizontal="center"
                vertical="center"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #FF5500, #FF3300)",
                }}
              >
                <MapPin size={13} color="white" />
              </Row>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  color: "#18160F",
                }}
              >
                TasteMap<span style={{ color: "#FF5500" }}>.</span>
              </span>
            </Row>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "rgba(24,22,15,0.45)",
                lineHeight: 1.65,
                maxWidth: 240,
              }}
            >
              Discover food, connect with foodies, build tours. Your flavour
              DNA, mapped.
            </p>
            <Row style={{ gap: 8 }}>
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    color: "rgba(24,22,15,0.5)",
                    fontSize: 11,
                    fontWeight: 700,
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "rgba(0,0,0,0.09)";
                    (e.currentTarget as HTMLElement).style.color = "#18160F";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "rgba(0,0,0,0.05)";
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(24,22,15,0.5)";
                  }}
                >
                  {s.label}
                </a>
              ))}
            </Row>
          </Column>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, items]) => (
            <Column
              key={section}
              style={{ gap: 12 }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(24,22,15,0.35)",
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
                    color: "rgba(24,22,15,0.5)",
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#18160F";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(24,22,15,0.5)";
                  }}
                >
                  {item}
                </a>
              ))}
            </Column>
          ))}
        </Grid>

        {/* Bottom bar */}
        <Row
          vertical="center"
          horizontal="between"
          style={{
            paddingTop: 12,
            borderTop: "1px solid rgba(0,0,0,0.07)",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: 12, color: "rgba(24,22,15,0.3)" }}>
            © {new Date().getFullYear()} TasteMap. All rights reserved.
          </p>
          <Row style={{ gap: 20 }}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  fontSize: 12,
                  color: "rgba(24,22,15,0.3)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(24,22,15,0.6)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(24,22,15,0.3)";
                }}
              >
                {l}
              </a>
            ))}
          </Row>
        </Row>
      </Column>
    </footer>
  );
}
