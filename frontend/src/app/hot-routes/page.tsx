"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Wind,
  Droplets,
  Navigation,
  RefreshCw,
  Flame,
  ChevronLeft,
  TrendingUp,
  Coffee,
  Beer,
  Utensils,
  Sandwich,
  Croissant,
  Map,
  SearchX,
} from "lucide-react";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────
interface WeatherData {
  temp: number;
  feelsLike: number;
  weathercode: number;
  windspeed: number;
  humidity: number;
}

type TrafficLevel = "low" | "moderate" | "heavy";
interface TrafficStatus {
  level: TrafficLevel;
  label: string;
  color: string;
  description: string;
  segments: { name: string; status: TrafficLevel }[];
}

interface NearbyPlace {
  id: number;
  name: string;
  type: string;
  lat: number;
  lon: number;
  distance?: number;
  tags?: Record<string, string>;
}

// ─── Constants ──────────────────────────────────────────────────────────────
const DEFAULT_LAT = 10.8231;
const DEFAULT_LON = 106.6297;

const WMO_LABELS: Record<number, { label: string; emoji: string; bg: string }> =
  {
    0: {
      label: "Clear Sky",
      emoji: "☀️",
      bg: "linear-gradient(135deg, #FFF3CD, #FFE082)",
    },
    1: {
      label: "Mainly Clear",
      emoji: "🌤️",
      bg: "linear-gradient(135deg, #E3F2FD, #BBDEFB)",
    },
    2: {
      label: "Partly Cloudy",
      emoji: "⛅",
      bg: "linear-gradient(135deg, #ECEFF1, #CFD8DC)",
    },
    3: {
      label: "Overcast",
      emoji: "☁️",
      bg: "linear-gradient(135deg, #ECEFF1, #B0BEC5)",
    },
    45: {
      label: "Foggy",
      emoji: "🌫️",
      bg: "linear-gradient(135deg, #ECEFF1, #CFD8DC)",
    },
    51: {
      label: "Light Drizzle",
      emoji: "🌦️",
      bg: "linear-gradient(135deg, #E3F2FD, #90CAF9)",
    },
    61: {
      label: "Light Rain",
      emoji: "🌧️",
      bg: "linear-gradient(135deg, #E3F2FD, #64B5F6)",
    },
    63: {
      label: "Moderate Rain",
      emoji: "🌧️",
      bg: "linear-gradient(135deg, #BBDEFB, #42A5F5)",
    },
    65: {
      label: "Heavy Rain",
      emoji: "🌧️",
      bg: "linear-gradient(135deg, #90CAF9, #1E88E5)",
    },
    80: {
      label: "Rain Showers",
      emoji: "🌦️",
      bg: "linear-gradient(135deg, #E3F2FD, #64B5F6)",
    },
    95: {
      label: "Thunderstorm",
      emoji: "⛈️",
      bg: "linear-gradient(135deg, #7E57C2, #4527A0)",
    },
  };

function getWeatherInfo(code: number) {
  return (
    WMO_LABELS[code] ?? {
      label: "Unknown",
      emoji: "🌡️",
      bg: "linear-gradient(135deg, #F2F2F7, #E5E5EA)",
    }
  );
}

function getTrafficStatus(): TrafficStatus {
  const hour = new Date().getHours();
  const segments = [
    { name: "Highway D1", status: "low" as TrafficLevel },
    { name: "Ring Road 3", status: "moderate" as TrafficLevel },
    { name: "City Centre", status: "low" as TrafficLevel },
    { name: "Bypass Route", status: "low" as TrafficLevel },
  ];

  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    segments[0].status = "heavy";
    segments[2].status = "heavy";
    segments[1].status = "moderate";
    return {
      level: "heavy",
      label: "Heavy Traffic",
      color: "#FF3B30",
      description: "Rush hour — expect 15–25 min delays",
      segments,
    };
  }
  if ((hour >= 10 && hour <= 16) || (hour >= 20 && hour <= 22)) {
    segments[1].status = "moderate";
    segments[2].status = "moderate";
    return {
      level: "moderate",
      label: "Moderate Traffic",
      color: "#FF9500",
      description: "Some congestion on main roads",
      segments,
    };
  }
  return {
    level: "low",
    label: "Clear Roads",
    color: "#34C759",
    description: "Smooth driving conditions",
    segments,
  };
}

const TRAFFIC_COLORS: Record<TrafficLevel, string> = {
  low: "#34C759",
  moderate: "#FF9500",
  heavy: "#FF3B30",
};

function amenityIcon(type: string): React.ReactElement {
  if (type === "cafe") return <Coffee size={22} />;
  if (type === "bar") return <Beer size={22} />;
  if (type === "restaurant") return <Utensils size={22} />;
  if (type === "fast_food") return <Sandwich size={22} />;
  if (type === "bakery") return <Croissant size={22} />;
  return <MapPin size={22} />;
}

function formatDistance(m?: number) {
  if (!m) return "";
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

// ─── Fallback mock places ───────────────────────────────────────────────────
const MOCK_PLACES: NearbyPlace[] = [
  {
    id: 1,
    name: "Bún Bò Huế Cô Gái",
    type: "restaurant",
    lat: 0,
    lon: 0,
    distance: 120,
  },
  {
    id: 2,
    name: "Hủ Tiếu Nam Vang",
    type: "restaurant",
    lat: 0,
    lon: 0,
    distance: 250,
  },
  { id: 3, name: "Café Phố Thị", type: "cafe", lat: 0, lon: 0, distance: 350 },
  {
    id: 4,
    name: "BBQ Street Garden",
    type: "restaurant",
    lat: 0,
    lon: 0,
    distance: 480,
  },
  {
    id: 5,
    name: "Bánh Mì 24h",
    type: "fast_food",
    lat: 0,
    lon: 0,
    distance: 600,
  },
  {
    id: 6,
    name: "Rooftop Bar 360",
    type: "bar",
    lat: 0,
    lon: 0,
    distance: 750,
  },
  {
    id: 7,
    name: "The Alley Boba",
    type: "cafe",
    lat: 0,
    lon: 0,
    distance: 820,
  },
  {
    id: 8,
    name: "Ramen Shin Tokyo",
    type: "restaurant",
    lat: 0,
    lon: 0,
    distance: 950,
  },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

function TrafficBar({ level }: { level: TrafficLevel }) {
  const widths: Record<TrafficLevel, string> = {
    low: "30%",
    moderate: "65%",
    heavy: "95%",
  };
  return (
    <div
      style={{
        height: "4px",
        width: "100%",
        backgroundColor: "rgba(0,0,0,0.06)",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: widths[level] }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        style={{
          height: "100%",
          backgroundColor: TRAFFIC_COLORS[level],
          borderRadius: "4px",
        }}
      />
    </div>
  );
}

function PlaceCard({ place, index }: { place: NearbyPlace; index: number }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.06 * index,
        type: "spring",
        stiffness: 120,
        damping: 18,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: "148px",
        maxWidth: "148px",
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "14px",
        border: `1px solid ${hovered ? "rgba(0,122,255,0.18)" : "rgba(0,0,0,0.06)"}`,
        boxShadow: hovered
          ? "0 8px 28px rgba(0,0,0,0.09)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        cursor: "pointer",
        flexShrink: 0,
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      <div
        style={{
          marginBottom: "8px",
          color: "#636366",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {amenityIcon(place.type)}
      </div>
      <div
        style={{
          fontSize: "0.78rem",
          fontWeight: 700,
          color: "#1C1C1E",
          marginBottom: "3px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {place.name}
      </div>
      <div
        style={{
          fontSize: "0.63rem",
          color: "#8E8E93",
          textTransform: "capitalize",
          marginBottom: "8px",
        }}
      >
        {place.type.replace("_", " ")}
      </div>
      {place.distance != null && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            backgroundColor: "rgba(255,107,53,0.07)",
            borderRadius: "8px",
            padding: "3px 7px",
          }}
        >
          <MapPin size={9} color="#ff6b35" />
          <span
            style={{ fontSize: "0.62rem", color: "#ff6b35", fontWeight: 600 }}
          >
            {formatDistance(place.distance)}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function HotRoutesPage() {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [locationName, setLocationName] = useState("Locating you...");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [traffic] = useState<TrafficStatus>(getTrafficStatus());
  const [dataLoading, setDataLoading] = useState(true);
  const [mapUrl, setMapUrl] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "restaurant" | "cafe" | "bar"
  >("all");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function buildMapUrl(lat: number, lon: number, delta = 0.018) {
    const w = lon - delta,
      e = lon + delta;
    const s = lat - delta,
      n = lat + delta;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${w}%2C${s}%2C${e}%2C${n}&layer=mapnik&marker=${lat}%2C${lon}`;
  }

  async function fetchWeather(lat: number, lon: number) {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relativehumidity_2m&timezone=auto`,
      );
      const d = await res.json();
      setWeather({
        temp: Math.round(d.current.temperature_2m),
        feelsLike: Math.round(d.current.apparent_temperature),
        weathercode: d.current.weathercode,
        windspeed: Math.round(d.current.windspeed_10m),
        humidity: d.current.relativehumidity_2m,
      });
    } catch {
      // silently fail — overlay just won't show
    }
  }

  async function fetchNearbyPlaces(lat: number, lon: number) {
    try {
      const query =
        `[out:json][timeout:12];` +
        `node[amenity~"restaurant|cafe|bar|fast_food|bakery"](around:1200,${lat},${lon});` +
        `out 20;`;
      const res = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      );
      const d = await res.json();
      const items: NearbyPlace[] = d.elements
        .filter(
          (el: Record<string, unknown>) =>
            (el.tags as Record<string, string>)?.name,
        )
        .map((el: Record<string, unknown>) => {
          const elLat = el.lat as number;
          const elLon = el.lon as number;
          const tags = el.tags as Record<string, string>;
          const dx = (elLat - lat) * 111000;
          const dy = (elLon - lon) * 111000 * Math.cos((lat * Math.PI) / 180);
          return {
            id: el.id as number,
            name: tags.name,
            type: tags.amenity,
            lat: elLat,
            lon: elLon,
            distance: Math.round(Math.sqrt(dx * dx + dy * dy)),
            tags,
          };
        })
        .sort(
          (a: NearbyPlace, b: NearbyPlace) =>
            (a.distance ?? 0) - (b.distance ?? 0),
        )
        .slice(0, 12);

      setPlaces(items.length > 0 ? items : MOCK_PLACES);
    } catch {
      setPlaces(MOCK_PLACES);
    }
  }

  async function reverseGeocode(lat: number, lon: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        { headers: { "Accept-Language": "en-US,en" } },
      );
      const d = await res.json();
      const addr = d.address ?? {};
      const sub = addr.suburb ?? addr.quarter ?? addr.neighbourhood ?? "";
      const city = addr.city ?? addr.town ?? addr.county ?? "Your Area";
      setLocationName(sub ? `${sub}, ${city}` : city);
    } catch {
      setLocationName("Your Location");
    }
  }

  const initialize = useCallback(async (lat: number, lon: number) => {
    setDataLoading(true);
    setUserLocation({ lat, lon });
    setMapUrl(buildMapUrl(lat, lon));
    await Promise.all([
      fetchWeather(lat, lon),
      fetchNearbyPlaces(lat, lon),
      reverseGeocode(lat, lon),
    ]);
    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => initialize(pos.coords.latitude, pos.coords.longitude),
        () => initialize(DEFAULT_LAT, DEFAULT_LON),
        { timeout: 6000 },
      );
    } else {
      initialize(DEFAULT_LAT, DEFAULT_LON);
    }
  }, [initialize]);

  const wInfo = weather ? getWeatherInfo(weather.weathercode) : null;

  const filteredPlaces =
    activeTab === "all"
      ? places
      : places.filter(
          (p) =>
            p.type === activeTab ||
            (activeTab === "restaurant" && p.type === "fast_food"),
        );

  const tabs: {
    id: "all" | "restaurant" | "cafe" | "bar";
    label: string;
    icon: React.ReactElement;
  }[] = [
    { id: "all", label: "All", icon: <Map size={14} /> },
    { id: "restaurant", label: "Restaurants", icon: <Utensils size={14} /> },
    { id: "cafe", label: "Cafés", icon: <Coffee size={14} /> },
    { id: "bar", label: "Bars", icon: <Beer size={14} /> },
  ];

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "#F2F2F7",
        position: "relative",
      }}
    >
      {/* ─── Top Header ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px 14px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          backgroundColor: "white",
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/discover" style={{ textDecoration: "none" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                border: "1px solid rgba(0,0,0,0.08)",
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ChevronLeft size={16} color="#636366" />
            </div>
          </Link>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #FF3B30 0%, #FF6B35 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Flame size={16} color="white" />
          </div>
          <div>
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: 800,
                color: "#1C1C1E",
                lineHeight: 1.2,
              }}
            >
              Hot Routes
            </div>
            <div
              style={{
                fontSize: "0.67rem",
                color: "#8E8E93",
                display: "flex",
                alignItems: "center",
                gap: "3px",
                marginTop: "1px",
              }}
            >
              <Navigation size={9} color="#8E8E93" />
              {locationName}
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            userLocation && initialize(userLocation.lat, userLocation.lon)
          }
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            border: "1px solid rgba(0,0,0,0.08)",
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title="Refresh"
        >
          <motion.div
            animate={dataLoading ? { rotate: 360 } : { rotate: 0 }}
            transition={
              dataLoading
                ? { duration: 1, repeat: Infinity, ease: "linear" }
                : {}
            }
          >
            <RefreshCw size={14} color="#636366" />
          </motion.div>
        </button>
      </div>

      {/* ─── Scrollable Body ─────────────────────────────────────────────── */}
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── OSM Map ── */}
        <div
          style={{
            position: "relative",
            height: "320px",
            flexShrink: 0,
            backgroundColor: "#E5E5EA",
          }}
        >
          {mapUrl && (
            <iframe
              ref={iframeRef}
              src={mapUrl}
              title="OpenStreetMap — Hot Routes"
              onLoad={() => setMapLoaded(true)}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
                opacity: mapLoaded ? 1 : 0,
                transition: "opacity 0.5s ease",
              }}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          )}

          {/* Map loading spinner */}
          {!mapLoaded && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#EEF1F7",
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "3px solid rgba(255,59,48,0.15)",
                  borderTopColor: "#FF3B30",
                }}
              />
            </div>
          )}

          {/* ── Weather overlay — top-left ── */}
          <AnimatePresence>
            {weather && wInfo && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  zIndex: 100,
                  background: "rgba(255,255,255,0.88)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                  borderRadius: "16px",
                  padding: "10px 14px",
                  border: "1px solid rgba(255,255,255,0.7)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  minWidth: "130px",
                }}
              >
                <span style={{ fontSize: "1.8rem", lineHeight: 1 }}>
                  {wInfo.emoji}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 900,
                      color: "#1C1C1E",
                      lineHeight: 1,
                    }}
                  >
                    {weather.temp}°C
                  </div>
                  <div
                    style={{
                      fontSize: "0.62rem",
                      color: "#636366",
                      marginTop: "1px",
                    }}
                  >
                    {wInfo.label}
                  </div>
                  <div
                    style={{ display: "flex", gap: "6px", marginTop: "4px" }}
                  >
                    <span
                      style={{
                        fontSize: "0.58rem",
                        color: "#8E8E93",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      <Wind size={8} />
                      {weather.windspeed} km/h
                    </span>
                    <span
                      style={{
                        fontSize: "0.58rem",
                        color: "#8E8E93",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      <Droplets size={8} />
                      {weather.humidity}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Traffic overlay — top-right ── */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              zIndex: 100,
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              borderRadius: "16px",
              padding: "10px 14px",
              border: "1px solid rgba(255,255,255,0.7)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                backgroundColor: traffic.color,
                boxShadow: `0 0 8px ${traffic.color}88`,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#1C1C1E",
                  whiteSpace: "nowrap",
                }}
              >
                {traffic.label}
              </div>
              <div
                style={{
                  fontSize: "0.58rem",
                  color: "#636366",
                  marginTop: "1px",
                  whiteSpace: "nowrap",
                }}
              >
                {traffic.description}
              </div>
            </div>
          </motion.div>

          {/* Bottom gradient fade into content */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "70px",
              background:
                "linear-gradient(to top, #F2F2F7 0%, transparent 100%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* ── Stats bar ── */}
        <div
          style={{
            display: "flex",
            padding: "0 20px",
            marginTop: "-8px",
            flexShrink: 0,
            position: "relative",
            zIndex: 5,
            gap: "8px",
          }}
        >
          {[
            {
              icon: (
                <span style={{ fontSize: "1rem" }}>{wInfo?.emoji ?? "🌡️"}</span>
              ),
              label: "Weather",
              value: weather ? `${weather.temp}°C` : "—",
              sub: wInfo?.label ?? "Loading",
              accent: "#ff6b35",
            },
            {
              icon: (
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: traffic.color,
                    boxShadow: `0 0 6px ${traffic.color}`,
                  }}
                />
              ),
              label: "Traffic",
              value:
                traffic.level.charAt(0).toUpperCase() + traffic.level.slice(1),
              sub: "Current status",
              accent: traffic.color,
            },
            {
              icon: <MapPin size={14} color="#FF6B35" />,
              label: "Nearby",
              value: places.length > 0 ? `${places.length}` : "—",
              sub: "spots found",
              accent: "#FF6B35",
            },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                backgroundColor: "white",
                borderRadius: "14px",
                padding: "12px 14px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginBottom: "4px",
                }}
              >
                {stat.icon}
                <span
                  style={{
                    fontSize: "0.62rem",
                    color: "#8E8E93",
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 800,
                  color: stat.accent,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "0.58rem",
                  color: "#8E8E93",
                  marginTop: "1px",
                }}
              >
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ── Traffic detail card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 100 }}
          style={{
            margin: "12px 20px 0",
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "16px",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <TrendingUp size={14} color={traffic.color} />
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#1C1C1E",
                }}
              >
                Traffic Overview
              </span>
            </div>
            <span
              style={{
                fontSize: "0.62rem",
                fontWeight: 700,
                color: traffic.color,
                backgroundColor: `${traffic.color}14`,
                padding: "3px 8px",
                borderRadius: "20px",
              }}
            >
              Live
            </span>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {traffic.segments.map((seg) => (
              <div
                key={seg.name}
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "#636366",
                    width: "100px",
                    flexShrink: 0,
                  }}
                >
                  {seg.name}
                </span>
                <div style={{ flex: 1 }}>
                  <TrafficBar level={seg.status} />
                </div>
                <span
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 600,
                    color: TRAFFIC_COLORS[seg.status],
                    width: "56px",
                    textAlign: "right",
                    flexShrink: 0,
                    textTransform: "capitalize",
                  }}
                >
                  {seg.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Nearby Spots section ── */}
        <div style={{ padding: "18px 20px 8px", flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <Flame size={15} color="#FF3B30" />
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#1C1C1E",
                }}
              >
                Hot Spots Near You
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#34C759",
                  boxShadow: "0 0 5px #34C759",
                }}
              />
              <span
                style={{
                  fontSize: "0.62rem",
                  color: "#8E8E93",
                  fontWeight: 500,
                }}
              >
                via OpenStreetMap
              </span>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "5px 11px",
                  borderRadius: "20px",
                  border: `1px solid ${activeTab === tab.id ? "#ff6b35" : "rgba(0,0,0,0.08)"}`,
                  backgroundColor:
                    activeTab === tab.id ? "rgba(255,107,53,0.08)" : "white",
                  color: activeTab === tab.id ? "#ff6b35" : "#636366",
                  fontSize: "0.7rem",
                  fontWeight: activeTab === tab.id ? 700 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal cards scroll */}
        <div
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: "10px",
            padding: "4px 20px 28px",
            overflowX: "auto",
            flexShrink: 0,
          }}
        >
          {dataLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-shimmer"
                style={{
                  minWidth: "148px",
                  height: "128px",
                  borderRadius: "16px",
                  flexShrink: 0,
                }}
              />
            ))
          ) : filteredPlaces.length > 0 ? (
            filteredPlaces.map((place, i) => (
              <PlaceCard key={place.id} place={place} index={i} />
            ))
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "24px 32px",
                color: "#8E8E93",
                fontSize: "0.8rem",
              }}
            >
              <SearchX size={24} style={{ marginBottom: "4px" }} />
              <span>
                No {activeTab === "all" ? "places" : activeTab + "s"} found
                nearby
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── OSM Attribution ── */}
      <div
        style={{
          padding: "6px 20px",
          backgroundColor: "white",
          borderTop: "1px solid rgba(0,0,0,0.05)",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: "0.58rem", color: "#C7C7CC" }}>
          Map data ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#ff6b35", textDecoration: "none" }}
          >
            OpenStreetMap
          </a>{" "}
          contributors · Places via Overpass API · Weather via Open-Meteo
        </span>
      </div>
    </div>
  );
}
