import React from "react";
import { motion } from "framer-motion";
import {
  Row,
  Column,
  Heading,
  Text,
} from "@/components/OnceUI";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { AI_PICKS } from "@/constants/mock-data";

export const AIPicksSection = () => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
    >
      <Column fillWidth style={{ gap: "16px" }}>
        <Row
          fillWidth
          style={{
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <Row style={{ alignItems: "center", gap: "10px" }}>
            <Sparkles size={20} color="#A855F7" />
            <Heading
              variant="heading-strong-l"
              weight="strong"
              style={{ color: "#1C1C1E" }}
            >
              AI Picks For You
            </Heading>
          </Row>
          <Text
            onClick={() => {}}
            style={{
              color: "#A855F7",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Refresh
          </Text>
        </Row>
        <Row
          className="no-scrollbar"
          fillWidth
          style={{ gap: "16px", overflowX: "auto", paddingBottom: "4px" }}
        >
          {AI_PICKS.map((pick, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                boxShadow: "0 20px 48px rgba(0,0,0,0.1)"
              }}
              onClick={() => router.push("/tour-builder")}
              style={{
                minWidth: "260px",
                borderRadius: "20px",
                overflow: "hidden",
                backgroundColor: "#FFFFFF",
                borderTopWidth: "1px",
                borderBottomWidth: "1px",
                borderLeftWidth: "1px",
                borderRightWidth: "1px",
                borderStyle: "solid",
                borderColor: "rgba(0,0,0,0.05)",
                cursor: "pointer",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <div
                className="overflow-hidden relative"
                style={{
                  height: "140px",
                }}
              >
                <img
                  src={pick.img}
                  alt={pick.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(to bottom, transparent 40%, ${pick.color}20 100%)`,
                  }}
                />
                <div
                  className="glass-premium"
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    paddingTop: "6px",
                    paddingBottom: "6px",
                    paddingLeft: "12px",
                    paddingRight: "12px",
                    borderRadius: "10px",
                    borderTopWidth: "1px",
                    borderBottomWidth: "1px",
                    borderLeftWidth: "1px",
                    borderRightWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "rgba(255,255,255,0.4)",
                  }}
                >
                  <Text
                    style={{
                      color: "#1C1C1E",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {pick.match}% Match
                  </Text>
                </div>
              </div>
              <Column style={{ paddingTop: "16px", paddingBottom: "16px", paddingLeft: "16px", paddingRight: "16px", gap: "8px" }}>
                <Text
                  style={{
                    color: "#1C1C1E",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    letterSpacing: "-0.01em"
                  }}
                >
                  {pick.title}
                </Text>
                <Row style={{ gap: "6px", alignItems: "center" }}>
                  <div 
                    style={{ 
                        width: "6px", 
                        height: "6px", 
                        borderRadius: "50%", 
                        backgroundColor: pick.color,
                        boxShadow: `0 0 8px ${pick.color}`
                    }} 
                  />
                  <Text
                    style={{
                      color: pick.color,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {pick.reason}
                  </Text>
                </Row>
                <Row style={{ justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                    <Text style={{ color: "#8E8E93", fontSize: "0.8rem", fontWeight: 500 }}>
                        From {pick.price} VND
                    </Text>
                    <div style={{ paddingTop: "4px", paddingBottom: "4px", paddingLeft: "4px", paddingRight: "4px", borderRadius: "8px", backgroundColor: "#F2F2F7" }}>
                        <Sparkles size={12} color="#A855F7" />
                    </div>
                </Row>
              </Column>
            </motion.div>
          ))}
        </Row>
      </Column>
    </motion.div>
  );
};
