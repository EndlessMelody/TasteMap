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
  Sun,
  Cloud,
  Moon,
  Navigation,
  CheckCircle2,
  Sparkles,
  MapPin,
} from "lucide-react";
import MapWidget from "@/components/Map";
import { useRouter } from "next/navigation";
import { useRecommendations } from "@/hooks/useRecommendations";

function useLiveWeather() {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const h = now.getHours();
  const timeStr = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (h >= 5 && h < 12)
    return {
      icon: Sun,
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.08)",
      label: `${timeStr} • 29°C • Sunny`,
      location: "Dĩ An, Bình Dương",
    };
  if (h >= 12 && h < 17)
    return {
      icon: Cloud,
      color: "#6B7280",
      bg: "rgba(107,114,128,0.08)",
      label: `${timeStr} • 31°C • Partly Cloudy`,
      location: "Dĩ An, Bình Dương",
    };
  if (h >= 17 && h < 20)
    return {
      icon: CloudRain,
      color: "#3B82F6",
      bg: "rgba(59,130,246,0.08)",
      label: `${timeStr} • 27°C • Light Rain`,
      location: "Dĩ An, Bình Dương",
    };
  return {
    icon: Moon,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    label: `${timeStr} • 25°C • Clear Night`,
    location: "Dĩ An, Bình Dương",
  };
}

export const HeroSection = () => {
  const router = useRouter();
  const { picks, loading } = useRecommendations(1, undefined, "place");
  const heroData = picks && picks.length > 0 ? picks[0] : null;
  const weather = useLiveWeather();
  const WeatherIcon = weather.icon;

  const bgImage =
    heroData?.image_url ||
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop";
  const title = heroData?.name || "Weekend Street Food Tour";
  const titleWords = title.split(" ");
  const titleLine1 = titleWords.slice(0, 2).join(" ");
  const titleLine2 = titleWords.slice(2).join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
    >
      <Row
        fillWidth
        style={{ gap: "20px", height: "auto", minHeight: "300px" }}
      >
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
            backgroundImage: `url(${bgImage})`,
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
              {heroData && (
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
                    backgroundColor: "rgba(255, 107, 53, 0.06)",
                  }}
                >
                  <CheckCircle2 size={11} color="#ff6b35" />
                  <Text
                    style={{
                      color: "#ff6b35",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
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
                    textTransform: "uppercase",
                  }}
                >
                  Featured Tour
                </Text>
              </Row>

              <motion.div
                key={weather.label}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  paddingTop: "5px",
                  paddingBottom: "5px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  backgroundColor: weather.bg,
                  backdropFilter: "blur(12px)",
                  borderRadius: "8px",
                  gap: "6px",
                  alignItems: "center",
                  display: "flex",
                  border: `1px solid ${weather.color}22`,
                }}
              >
                <WeatherIcon size={11} color={weather.color} />
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: weather.color,
                  }}
                >
                  {weather.label}
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{
                  paddingTop: "5px",
                  paddingBottom: "5px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  backgroundColor: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "8px",
                  gap: "5px",
                  alignItems: "center",
                  display: "flex",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <MapPin size={10} color="#8E8E93" />
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#636366",
                  }}
                >
                  {heroData?.price_range || "Light Rain • 1.2km"}
                </span>
              </motion.div>
            </Row>

            {/* Title */}
            <Heading
              variant="display-strong-m"
              style={{
                color: "#1C1C1E",
                lineHeight: 1.1,
                fontSize: "2.6rem", // Reduced font size for 300px height
                letterSpacing: "-1px",
              }}
            >
              {titleLine1}
              <br />
              {titleLine2}
            </Heading>

            {/* Description */}
            <Text
              style={{
                color: "#636366",
                fontSize: "0.95rem",
                fontWeight: 500,
                maxWidth: "380px",
                lineHeight: 1.4,
              }}
            >
              {loading
                ? "Loading recommended tour..."
                : "Discover hidden gems and earn massive rewards this weekend."}
            </Text>

            {/* Bottom Row: Social + CTA */}
            <Row
              style={{
                gap: "20px",
                alignItems: "center",
                marginTop: "4px",
                justifyContent: "space-between",
              }}
            >
              <Row style={{ gap: "0px", alignItems: "center" }}>
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=28&h=28&fit=crop",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=28&h=28&fit=crop",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=28&h=28&fit=crop",
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
                      boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
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
                  icon={<Navigation size={18} color="#ff6b35" />}
                  onClick={() => {}}
                  style={{
                    backgroundColor: "rgba(255, 107, 53, 0.05)",
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    borderTopWidth: "1px",
                    borderBottomWidth: "1px",
                    borderLeftWidth: "1px",
                    borderRightWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "rgba(255, 107, 53, 0.1)",
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
                  <span
                    style={{ position: "relative", zIndex: 1, fontWeight: 700 }}
                  >
                    Book Now
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
