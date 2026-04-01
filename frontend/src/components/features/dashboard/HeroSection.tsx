import React from "react";
import { motion } from "framer-motion";
import {
  Row,
  Column,
  Heading,
  Text,
  IconButton,
  Button,
  Avatar,
} from "@/components/OnceUI";
import {
  CloudRain,
  Navigation,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import MapWidget from "@/components/Map";
import { useRouter } from "next/navigation";
import { MOCK_HERO_BANNER } from "@/constants/mock-data";

export const HeroSection = () => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
    >
      <Row fillWidth style={{ gap: "20px", height: "auto", minHeight: "300px" }}>
        {/* Map Box */}
        <motion.div
          whileHover={{ y: -8, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{
            width: "320px",
            minWidth: "320px",
            height: "300px",
            position: "relative",
            flexShrink: 0,
            borderRadius: "28px",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ position: "absolute", inset: 0 }}>
            <MapWidget />
          </div>
        </motion.div>

        {/* Hero Banner */}
        <motion.div
          whileHover={{ y: -8, scale: 1.005 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="noise-overlay"
          style={{
            flex: 1,
            minWidth: 0,
            height: "300px",
            backgroundImage: `url(${MOCK_HERO_BANNER.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            borderRadius: "28px",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
          }}
        >
          {/* Gray/White Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 45%, rgba(255,255,255,0.4) 100%)",
            }}
          />

          <Column
            style={{
              position: "relative",
              zIndex: 10,
              justifyContent: "center",
              paddingTop: "48px",
              paddingBottom: "48px",
              paddingLeft: "48px",
              paddingRight: "48px",
              height: "100%",
              gap: "14px",
            }}
          >
            {/* Badges Row */}
            <Row
              style={{
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {MOCK_HERO_BANNER.sponsored && (
                <Row
                  className="glass-premium"
                  style={{
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    borderRadius: "8px",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "rgba(0, 122, 255, 0.06)",
                  }}
                >
                  <CheckCircle2 size={11} color="#007AFF" />
                  <Text
                    style={{
                      color: "#007AFF",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}
                  >
                    Verified Sponsored
                  </Text>
                </Row>
              )}
              
              <Row
                className="glass-premium"
                style={{
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    borderRadius: "8px",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "rgba(230, 57, 70, 0.06)",
                }}
              >
                  <Sparkles size={11} color="#E63946" />
                  <Text
                    style={{
                        color: "#E63946",
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        textTransform: "uppercase"
                    }}
                  >
                      Featured Tour
                  </Text>
              </Row>

              <Row
                style={{
                  paddingTop: "5px",
                  paddingBottom: "5px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  backgroundColor: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "8px",
                  gap: "6px",
                  alignItems: "center",
                }}
              >
                <CloudRain size={11} color="#8E8E93" />
                <Text
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#636366",
                  }}
                >
                  {MOCK_HERO_BANNER.tags[1]}
                </Text>
              </Row>
            </Row>

            {/* Title */}
            <Heading
              variant="display-strong-m"
              style={{ 
                color: "#1C1C1E", 
                lineHeight: 1.1, 
                fontSize: "2.6rem", // Reduced font size for 300px height
                letterSpacing: "-1px"
              }}
            >
              {MOCK_HERO_BANNER.title.split(' ').slice(0, 2).join(' ')}
              <br />
              {MOCK_HERO_BANNER.title.split(' ').slice(2).join(' ')}
            </Heading>

            {/* Description */}
            {MOCK_HERO_BANNER.description && (
                <Text
                    style={{
                        color: "#636366",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        maxWidth: "380px",
                        lineHeight: 1.4
                    }}
                >
                    {MOCK_HERO_BANNER.description}
                </Text>
            )}

            {/* Bottom Row: Social + CTA */}
            <Row
              style={{
                gap: "20px",
                alignItems: "center",
                marginTop: "4px",
                justifyContent: "space-between"
              }}
            >
                <Row style={{ gap: "0px", alignItems: "center" }}>
                    {[
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=28&h=28&fit=crop",
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=28&h=28&fit=crop",
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=28&h=28&fit=crop"
                    ].map((src, i) => (
                        <div 
                            key={i}
                            style={{ 
                                marginLeft: i === 0 ? 0 : -10,
                                borderTopWidth: "2px",
                                borderBottomWidth: "2px",
                                borderLeftWidth: "2px",
                                borderRightWidth: "2px",
                                borderStyle: "solid",
                                borderColor: "#FFFFFF",
                                borderRadius: "50%",
                                zIndex: 3 - i,
                                boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
                            }}
                        >
                        <Avatar src={src} size="s" />
                        </div>
                    ))}
                    <Text
                        style={{
                        color: "#8E8E93",
                        fontSize: "0.8rem",
                        marginLeft: "12px",
                        fontWeight: 600,
                        }}
                    >
                        +32 joined
                    </Text>
                </Row>

                <Row style={{ gap: "10px", alignItems: "center" }}>
                    <IconButton
                        icon={<Navigation size={18} color="#007AFF" />}
                        onClick={() => {}}
                        style={{
                        backgroundColor: "rgba(0, 122, 255, 0.05)",
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        borderTopWidth: "1px",
                        borderBottomWidth: "1px",
                        borderLeftWidth: "1px",
                        borderRightWidth: "1px",
                        borderStyle: "solid",
                        borderColor: "rgba(0, 122, 255, 0.1)"
                        }}
                    />
                    <Button
                        size="m" // Scale down button size
                        variant="primary"
                        onClick={() => router.push("/tour-builder")}
                        style={{
                        position: "relative",
                        overflow: "hidden",
                        paddingTop: "12px",
                        paddingBottom: "12px",
                        paddingLeft: "28px",
                        paddingRight: "28px",
                        borderRadius: "14px",
                        boxShadow: "0 8px 20px rgba(0, 122, 255, 0.2)",
                        }}
                    >
                        <span style={{ position: "relative", zIndex: 1, fontWeight: 700 }}>
                        {MOCK_HERO_BANNER.ctaText}
                        </span>
                        <motion.div
                        initial={{ x: "-200%", rotate: "-20deg" }}
                        animate={{ x: "200%" }}
                        transition={{
                            repeat: Infinity,
                            duration: 3,
                            ease: "linear",
                            repeatDelay: 2,
                        }}
                        style={{
                            position: "absolute",
                            top: -20,
                            bottom: -20,
                            width: "50px",
                            background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                            zIndex: 0,
                        }}
                        />
                    </Button>
                </Row>
            </Row>
          </Column>
        </motion.div>
      </Row>
    </motion.div>
  );
};
