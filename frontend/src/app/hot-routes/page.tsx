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
  Map as MapIcon,
  SearchX,
  Sun,
  Cloud,
  CloudSun,
  CloudFog,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Thermometer,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  Button,
  IconButton,
  Pill,
  H3,
  Body,
  BodySm,
  Caption,
  Skeleton,
  EmptyState,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";

interface WeatherData {
  temp: number;
  feelsLike: number;
  weathercode: number;
  windspeed: number;
  humidity: number;
}

type TrafficLevel = "low" | "moderate" | "heavy";
type TrafficTone = "success" | "warning" | "danger";
interface TrafficStatus {
  level: TrafficLevel;
  label: string;
  tone: TrafficTone;
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

const DEFAULT_LAT = 10.8231;
const DEFAULT_LON = 106.6297;

const WMO_LABELS: Record<number, { label: string; icon: React.ReactNode }> = {
  0: { label: "Clear sky", icon: <Sun size={20} strokeWidth={1.75} /> },
  1: { label: "Mainly clear", icon: <CloudSun size={20} strokeWidth={1.75} /> },
  2: { label: "Partly cloudy", icon: <CloudSun size={20} strokeWidth={1.75} /> },
  3: { label: "Overcast", icon: <Cloud size={20} strokeWidth={1.75} /> },
  45: { label: "Foggy", icon: <CloudFog size={20} strokeWidth={1.75} /> },
  51: { label: "Light drizzle", icon: <CloudDrizzle size={20} strokeWidth={1.75} /> },
  61: { label: "Light rain", icon: <CloudRain size={20} strokeWidth={1.75} /> },
  63: { label: "Moderate rain", icon: <CloudRain size={20} strokeWidth={1.75} /> },
  65: { label: "Heavy rain", icon: <CloudRain size={20} strokeWidth={1.75} /> },
  80: { label: "Rain showers", icon: <CloudRain size={20} strokeWidth={1.75} /> },
  95: { label: "Thunderstorm", icon: <CloudLightning size={20} strokeWidth={1.75} /> },
};

function getWeatherInfo(code: number) {
  return (
    WMO_LABELS[code] ?? {
      label: "Unknown",
      icon: <Thermometer size={20} strokeWidth={1.75} />,
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
      label: "Heavy traffic",
      tone: "danger",
      description: "Rush hour — expect 15–25 min delays",
      segments,
    };
  }
  if ((hour >= 10 && hour <= 16) || (hour >= 20 && hour <= 22)) {
    segments[1].status = "moderate";
    segments[2].status = "moderate";
    return {
      level: "moderate",
      label: "Moderate traffic",
      tone: "warning",
      description: "Some congestion on main roads",
      segments,
    };
  }
  return {
    level: "low",
    label: "Clear roads",
    tone: "success",
    description: "Smooth driving conditions",
    segments,
  };
}

const TRAFFIC_TOKEN: Record<TrafficLevel, string> = {
  low: tokens.color.success,
  moderate: tokens.color.warning,
  heavy: tokens.color.danger,
};

function amenityIcon(type: string): React.ReactElement {
  if (type === "cafe") return <Coffee size={20} strokeWidth={1.75} />;
  if (type === "bar") return <Beer size={20} strokeWidth={1.75} />;
  if (type === "restaurant") return <Utensils size={20} strokeWidth={1.75} />;
  if (type === "fast_food") return <Sandwich size={20} strokeWidth={1.75} />;
  if (type === "bakery") return <Croissant size={20} strokeWidth={1.75} />;
  return <MapPin size={20} strokeWidth={1.75} />;
}

function formatDistance(m?: number) {
  if (!m) return "";
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

const MOCK_PLACES: NearbyPlace[] = [
  { id: 1, name: "Bún Bò Huế Cô Gái", type: "restaurant", lat: 0, lon: 0, distance: 120 },
  { id: 2, name: "Hủ Tiếu Nam Vang", type: "restaurant", lat: 0, lon: 0, distance: 250 },
  { id: 3, name: "Café Phố Thị", type: "cafe", lat: 0, lon: 0, distance: 350 },
  { id: 4, name: "BBQ Street Garden", type: "restaurant", lat: 0, lon: 0, distance: 480 },
  { id: 5, name: "Bánh Mì 24h", type: "fast_food", lat: 0, lon: 0, distance: 600 },
  { id: 6, name: "Rooftop Bar 360", type: "bar", lat: 0, lon: 0, distance: 750 },
  { id: 7, name: "The Alley Boba", type: "cafe", lat: 0, lon: 0, distance: 820 },
  { id: 8, name: "Ramen Shin Tokyo", type: "restaurant", lat: 0, lon: 0, distance: 950 },
];

function TrafficBar({ level }: { level: TrafficLevel }) {
  const widths: Record<TrafficLevel, string> = {
    low: "30%",
    moderate: "65%",
    heavy: "95%",
  };
  return (
    <div
      style={{
        height: 4,
        width: "100%",
        background: tokens.color.surfaceInset,
        borderRadius: tokens.radius.pill,
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: widths[level] }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        style={{
          height: "100%",
          background: TRAFFIC_TOKEN[level],
        }}
      />
    </div>
  );
}

function PlaceCard({ place, index }: { place: NearbyPlace; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.05 * index,
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ minWidth: 160, maxWidth: 160, flexShrink: 0 }}
    >
      <Card
        radius="lg"
        padding="md"
        shadow="sm"
        interactive
        style={{ cursor: "pointer" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space[2],
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: tokens.radius.sm,
              background: tokens.color.surfaceMuted,
              color: tokens.color.textMuted,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {amenityIcon(place.type)}
          </span>
          <div>
            <Body
              style={{
                fontWeight: tokens.type.weight.semibold,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: tokens.type.size.bodySm,
              }}
            >
              {place.name}
            </Body>
            <Caption tone="muted" style={{ textTransform: "capitalize" }}>
              {place.type.replace("_", " ")}
            </Caption>
          </div>
          {place.distance != null && (
            <Pill
              tone="neutral"
              size="sm"
              leftIcon={<MapPin size={10} strokeWidth={1.75} />}
            >
              {formatDistance(place.distance)}
            </Pill>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export default function HotRoutesPage() {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [locationName, setLocationName] = useState("Locating you…");
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
    const w = lon - delta;
    const e = lon + delta;
    const s = lat - delta;
    const n = lat + delta;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${w}%2C${s}%2C${e}%2C${n}&layer=mapnik&marker=${lat}%2C${lon}`;
  }

  async function fetchWeather(lat: number, lon: number) {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relativehumidity_2m&timezone=auto`,
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
      /* silent — overlay just won't show */
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
      const city = addr.city ?? addr.town ?? addr.county ?? "Your area";
      setLocationName(sub ? `${sub}, ${city}` : city);
    } catch {
      setLocationName("Your location");
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
    { id: "all", label: "All", icon: <MapIcon size={14} strokeWidth={1.75} /> },
    { id: "restaurant", label: "Restaurants", icon: <Utensils size={14} strokeWidth={1.75} /> },
    { id: "cafe", label: "Cafés", icon: <Coffee size={14} strokeWidth={1.75} /> },
    { id: "bar", label: "Bars", icon: <Beer size={14} strokeWidth={1.75} /> },
  ];

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: tokens.color.bg,
        color: tokens.color.text,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${tokens.space[4]} ${tokens.space[6]}`,
          borderBottom: `1px solid ${tokens.color.border}`,
          background: tokens.color.surface,
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space[3],
          }}
        >
          <Link href="/discover" aria-label="Back to discover">
            <IconButton
              variant="secondary"
              size="sm"
              aria-label="Back"
              icon={<ChevronLeft size={16} strokeWidth={1.75} />}
            />
          </Link>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: tokens.radius.md,
              background: tokens.color.warm,
              color: tokens.color.textInverse,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Flame size={16} strokeWidth={2} />
          </span>
          <div>
            <Body
              style={{
                fontWeight: tokens.type.weight.bold,
                lineHeight: 1.2,
              }}
            >
              Hot Routes
            </Body>
            <Caption
              tone="muted"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Navigation size={9} strokeWidth={1.75} />
              {locationName}
            </Caption>
          </div>
        </div>

        <IconButton
          variant="secondary"
          size="sm"
          aria-label="Refresh"
          onClick={() =>
            userLocation && initialize(userLocation.lat, userLocation.lon)
          }
          icon={
            <motion.span
              style={{ display: "inline-flex" }}
              animate={dataLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={
                dataLoading
                  ? { duration: 1, repeat: Infinity, ease: "linear" }
                  : {}
              }
            >
              <RefreshCw size={14} strokeWidth={1.75} />
            </motion.span>
          }
        />
      </div>

      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            position: "relative",
            height: 320,
            flexShrink: 0,
            background: tokens.color.surfaceInset,
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

          {!mapLoaded && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: `3px solid ${tokens.color.surfaceInset}`,
                  borderTopColor: tokens.color.warm,
                }}
              />
            </div>
          )}

          <AnimatePresence>
            {weather && wInfo && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.32 }}
                style={{
                  position: "absolute",
                  top: tokens.space[3],
                  left: tokens.space[3],
                  zIndex: 100,
                  minWidth: 150,
                }}
              >
                <Card
                  radius="md"
                  padding="sm"
                  shadow="md"
                  style={{
                    background: "rgba(255, 255, 255, 0.88)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: `1px solid rgba(255, 255, 255, 0.7)`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: tokens.space[3],
                    }}
                  >
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: tokens.radius.sm,
                        background: tokens.color.surfaceMuted,
                        color: tokens.color.textMuted,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {wInfo.icon}
                    </span>
                    <div>
                      <Body
                        style={{
                          fontSize: 18,
                          fontWeight: tokens.type.weight.bold,
                          lineHeight: 1.1,
                        }}
                      >
                        {weather.temp}°C
                      </Body>
                      <Caption tone="muted">{wInfo.label}</Caption>
                      <div
                        style={{
                          display: "flex",
                          gap: tokens.space[2],
                          marginTop: 4,
                        }}
                      >
                        <Caption
                          tone="muted"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Wind size={9} strokeWidth={1.75} />
                          {weather.windspeed} km/h
                        </Caption>
                        <Caption
                          tone="muted"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Droplets size={9} strokeWidth={1.75} />
                          {weather.humidity}%
                        </Caption>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.32 }}
            style={{
              position: "absolute",
              top: tokens.space[3],
              right: tokens.space[3],
              zIndex: 100,
            }}
          >
            <Card
              radius="md"
              padding="sm"
              shadow="md"
              style={{
                background: "rgba(255, 255, 255, 0.88)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                border: `1px solid rgba(255, 255, 255, 0.7)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.space[2],
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: TRAFFIC_TOKEN[traffic.level],
                  }}
                />
                <div>
                  <Body
                    style={{
                      fontSize: 13,
                      fontWeight: tokens.type.weight.semibold,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {traffic.label}
                  </Body>
                  <Caption tone="muted" style={{ whiteSpace: "nowrap" }}>
                    {traffic.description}
                  </Caption>
                </div>
              </div>
            </Card>
          </motion.div>

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 70,
              background: `linear-gradient(to top, ${tokens.color.bg} 0%, transparent 100%)`,
              pointerEvents: "none",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            padding: `0 ${tokens.space[6]}`,
            marginTop: -tokens.space[2],
            flexShrink: 0,
            position: "relative",
            zIndex: 5,
            gap: tokens.space[2],
          }}
        >
          {[
            {
              icon: wInfo?.icon ?? <Thermometer size={14} strokeWidth={1.75} />,
              label: "Weather",
              value: weather ? `${weather.temp}°C` : "—",
              sub: wInfo?.label ?? "Loading",
            },
            {
              icon: (
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: TRAFFIC_TOKEN[traffic.level],
                    display: "inline-block",
                  }}
                />
              ),
              label: "Traffic",
              value:
                traffic.level.charAt(0).toUpperCase() + traffic.level.slice(1),
              sub: "Current status",
            },
            {
              icon: <MapPin size={14} strokeWidth={1.75} />,
              label: "Nearby",
              value: places.length > 0 ? `${places.length}` : "—",
              sub: "spots found",
            },
          ].map((stat, i) => (
            <div key={i} style={{ flex: 1 }}>
              <Card radius="md" padding="sm" shadow="sm">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: tokens.space[2],
                    marginBottom: tokens.space[1],
                    color: tokens.color.textMuted,
                  }}
                >
                  {stat.icon}
                  <Caption tone="muted">{stat.label}</Caption>
                </div>
                <Body
                  style={{
                    fontSize: 16,
                    fontWeight: tokens.type.weight.bold,
                    lineHeight: 1.1,
                  }}
                >
                  {stat.value}
                </Body>
                <Caption tone="muted">{stat.sub}</Caption>
              </Card>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.32 }}
          style={{
            margin: `${tokens.space[3]} ${tokens.space[6]} 0`,
            flexShrink: 0,
          }}
        >
          <Card radius="lg" padding="md" shadow="sm">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: tokens.space[3],
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.space[2],
                }}
              >
                <TrendingUp
                  size={14}
                  strokeWidth={1.75}
                  style={{ color: TRAFFIC_TOKEN[traffic.level] }}
                />
                <H3 style={{ fontSize: tokens.type.size.body }}>Traffic overview</H3>
              </div>
              <Pill tone={traffic.tone} size="sm" dot>
                Live
              </Pill>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: tokens.space[2],
              }}
            >
              {traffic.segments.map((seg) => (
                <div
                  key={seg.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: tokens.space[3],
                  }}
                >
                  <BodySm
                    tone="muted"
                    style={{ width: 100, flexShrink: 0 }}
                  >
                    {seg.name}
                  </BodySm>
                  <div style={{ flex: 1 }}>
                    <TrafficBar level={seg.status} />
                  </div>
                  <Caption
                    style={{
                      color: TRAFFIC_TOKEN[seg.status],
                      fontWeight: tokens.type.weight.semibold,
                      width: 56,
                      textAlign: "right",
                      flexShrink: 0,
                      textTransform: "capitalize",
                    }}
                  >
                    {seg.status}
                  </Caption>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <div
          style={{
            padding: `${tokens.space[5]} ${tokens.space[6]} ${tokens.space[2]}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: tokens.space[3],
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: tokens.space[2],
              }}
            >
              <Flame
                size={16}
                strokeWidth={1.75}
                style={{ color: tokens.color.warm }}
              />
              <H3>Hot spots near you</H3>
            </div>
            <Caption tone="muted">via OpenStreetMap</Caption>
          </div>

          <div
            style={{
              display: "flex",
              gap: tokens.space[2],
            }}
          >
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: tokens.space[1],
                    padding: `${tokens.space[1]} ${tokens.space[3]}`,
                    borderRadius: tokens.radius.pill,
                    border: active
                      ? `1px solid ${tokens.color.warm}`
                      : `1px solid ${tokens.color.border}`,
                    background: active
                      ? "rgba(255, 107, 53, 0.1)"
                      : tokens.color.surface,
                    color: active ? tokens.color.warm : tokens.color.textMuted,
                    fontSize: tokens.type.size.bodySm,
                    fontWeight: active
                      ? tokens.type.weight.semibold
                      : tokens.type.weight.medium,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: tokens.space[2],
            padding: `${tokens.space[1]} ${tokens.space[6]} ${tokens.space[8]}`,
            overflowX: "auto",
            flexShrink: 0,
          }}
        >
          {dataLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                width={160}
                height={140}
                radius="lg"
                style={{ flexShrink: 0 }}
              />
            ))
          ) : filteredPlaces.length > 0 ? (
            filteredPlaces.map((place, i) => (
              <PlaceCard key={place.id} place={place} index={i} />
            ))
          ) : (
            <div style={{ flex: 1, minWidth: 280 }}>
              <EmptyState
                compact
                icon={<SearchX size={28} strokeWidth={1.5} />}
                title={`No ${activeTab === "all" ? "places" : activeTab + "s"} found nearby`}
              />
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          padding: `${tokens.space[1]} ${tokens.space[6]}`,
          background: tokens.color.surface,
          borderTop: `1px solid ${tokens.color.border}`,
          flexShrink: 0,
        }}
      >
        <Caption tone="subtle">
          Map data ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: tokens.color.warm, textDecoration: "none" }}
          >
            OpenStreetMap
          </a>{" "}
          contributors · Places via Overpass API · Weather via Open-Meteo
        </Caption>
      </div>
    </div>
  );
}
