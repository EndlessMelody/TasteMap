"use client";

import React, {
  useEffect,
  useId,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import Map, { Marker, MapRef, Source, Layer, useMap } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Coffee, Pizza, Utensils, Wine, Croissant, Martini, Map as MapIcon } from "lucide-react";

import type { Spot } from "@/app/explore/types";

const FOOD_ICONS = [Pizza, Coffee, Utensils, Wine, Croissant, Martini];

// ─── CUSTOM SPOT MARKER ───
const SpotMarker = ({
  spot,
  isHovered,
  isSelected,
  isDimmed,
  planIndex,
}: {
  spot: Spot;
  isHovered: boolean;
  isSelected: boolean;
  isDimmed: boolean;
  planIndex?: number;
}) => {
  const scale = isSelected ? 1.3 : isHovered ? 1.2 : 1;
  const opacity = isSelected ? 1 : isDimmed ? 0.4 : 1;
  const shadowValue = isSelected || isHovered 
    ? `0 10px 20px -5px ${spot.accent}80` 
    : `0 4px 10px -2px rgba(0,0,0,0.3)`;
  
  const Icon = FOOD_ICONS[spot.id % FOOD_ICONS.length] || Utensils;

  return (
    <div style={{
      opacity,
      transform: `scale(${scale})`,
      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      cursor: "pointer",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      zIndex: isSelected ? 30 : isHovered ? 20 : 10
    }}>
      {(isHovered || isSelected) && (
        <div style={{
          position: "absolute",
          bottom: "45px",
          whiteSpace: "nowrap",
          background: "rgba(17,24,39,0.95)",
          backdropFilter: "blur(12px)",
          color: "white",
          padding: "6px 12px",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
          border: "1px solid rgba(255,255,255,0.1)",
          transition: "opacity 0.2s",
          pointerEvents: "none",
        }}>
          <span style={{ fontSize: "11px", fontWeight: 700 }}>{spot.name}</span>
          <span style={{ fontSize: "9px", color: "#94A3B8", display: "flex", alignItems: "center", gap: "2px" }}>
             <svg width="8" height="8" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
             {spot.rating} ({spot.reviewCount})
          </span>
          <div style={{
            position: "absolute",
            bottom: "-4px",
            left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
            width: "8px",
            height: "8px",
            background: "rgba(17,24,39,0.95)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            borderRight: "1px solid rgba(255,255,255,0.1)",
          }} />
        </div>
      )}

      <div style={{
        width: "36px",
        height: "36px",
        background: planIndex !== undefined ? "linear-gradient(135deg, #ff6b35, #a855f7)" : spot.accent,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: shadowValue,
        border: "2px solid white",
        position: "relative",
      }}>
        <Icon size={18} color="white" />
        {planIndex !== undefined && (
          <div style={{
            position: "absolute",
            top: -7, right: -7,
            width: 18, height: 18,
            borderRadius: "50%",
            background: "#1C1C1E",
            color: "white",
            fontSize: 10, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
            pointerEvents: "none",
          }}>
            {planIndex}
          </div>
        )}
      </div>
    </div>
  );
};
const PulseMarker = ({ color }: { color: string }) => (
  <div style={{ position: "relative", width: 20, height: 20, background: color, border: "3px solid white", borderRadius: "50%", boxShadow: `0 0 15px ${color}` }}>
    <div style={{ position: "absolute", top: -3, left: -3, width: 20, height: 20, borderRadius: "50%", background: color, opacity: 0.6, animation: "marker-pulse 1.5s infinite ease-out" }} />
    <style>{`
      @keyframes marker-pulse {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    `}</style>
  </div>
);

const ClusterMarker = ({ cluster }: { cluster: Cluster }) => {
  const count = cluster.count;
  const size = count > 5 ? 44 : count > 2 ? 38 : 32;
  const accents = cluster.spots.map(s => s.accent);
  const dominantAccent = accents.sort((a,b) =>
      accents.filter(v => v===a).length - accents.filter(v => v===b).length
  ).pop() || "#ff6b35";

  return (
    <div style={{
      width: size, height: size,
      background: "linear-gradient(135deg, #111827, #1F2937)",
      border: `2.5px solid ${dominantAccent}`,
      borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 4px 14px ${dominantAccent}50`,
      transition: "transform 0.2s",
      cursor: "pointer"
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      <MapIcon size={size * 0.55} color="white" />
    </div>
  );
};

interface Cluster {
  center: [number, number];
  spots: Spot[];
  count: number;
}

function clusterSpots(
  spots: Spot[],
  zoom: number,
): { clusters: Cluster[]; singles: Spot[] } {
  // Higher zoom = smaller threshold = less clustering
  const threshold = 0.15 / Math.pow(2, Math.max(0, zoom - 10));
  const used = new Set<number>();
  const clusters: Cluster[] = [];
  const singles: Spot[] = [];

  for (let i = 0; i < spots.length; i++) {
    if (used.has(i)) continue;
    
    const group: Spot[] = [spots[i]];
    used.add(i);
    
    for (let j = i + 1; j < spots.length; j++) {
      if (used.has(j)) continue;
      const dx = spots[i].lat - spots[j].lat;
      const dy = spots[i].lon - spots[j].lon;
      if (Math.sqrt(dx * dx + dy * dy) < threshold) {
        group.push(spots[j]);
        used.add(j);
      }
    }

    if (group.length > 1) {
      const avgLat = group.reduce((s, p) => s + p.lat, 0) / group.length;
      const avgLon = group.reduce((s, p) => s + p.lon, 0) / group.length;
      clusters.push({ center: [avgLat, avgLon], spots: group, count: group.length });
    } else {
      singles.push(group[0]);
    }
  }

  return { clusters, singles };
}

interface MapWidgetProps {
  mapId?: string;
  spots?: Spot[];
  center?: [number, number]; // [lat, lon]
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  userLocation?: [number, number] | null; // [lat, lon]
  showBanner?: boolean;
  enableClustering?: boolean;
  mapStyleType?: string;
  show3D?: boolean;
  selectedSpotId?: number | null;
  hoveredSpotId?: number | null;
  onMarkerClick?: (spot: Spot) => void;
  onMarkerHover?: (spot: Spot | null) => void;
  /** Ordered [lon, lat] coords for drawing a route polyline */
  routeCoords?: [number, number][];
  /** Maps spot id → 1-based stop number, to render numbered badges */
  planSpotIndexMap?: Map<number, number>;
}

export default function MapWidget({
  mapId = "default-map",
  spots = [],
  center = [10.897, 106.772],
  zoom = 14,
  minZoom = 3,
  maxZoom = 19,
  userLocation = null,
  showBanner = true,
  enableClustering = false,
  mapStyleType = "streets",
  show3D = false,
  selectedSpotId = null,
  hoveredSpotId = null,
  onMarkerClick,
  onMarkerHover,
  routeCoords,
  planSpotIndexMap,
}: MapWidgetProps) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [center[1], center[0]], zoom, duration: 800 });
    }
  }, [center[0], center[1], zoom]); // explicitly unroll center array dependency safely

  const currentMapStyle = useMemo(() => {
    switch (mapStyleType) {
      case "satellite": return "mapbox://styles/mapbox/satellite-streets-v12";
      case "light": return "mapbox://styles/mapbox/light-v11";
      case "streets": return "mapbox://styles/mapbox/streets-v12";
      case "dark":
      default: return "mapbox://styles/mapbox/dark-v11";
    }
  }, [mapStyleType]);

  const { clusters, singles } = useMemo(
    () => enableClustering ? clusterSpots(spots, zoom) : { clusters: [], singles: spots },
    [spots, zoom, enableClustering],
  );

  const routeGeoJson = useMemo(() => {
    if (!routeCoords || routeCoords.length < 2) return null;
    return {
      type: "FeatureCollection" as const,
      features: [{
        type: "Feature" as const,
        properties: {},
        geometry: { type: "LineString" as const, coordinates: routeCoords },
      }],
    };
  }, [routeCoords]);

  if (!isMounted) {
    return (
      <div style={{ height: "100%", width: "100%", backgroundColor: "#333", borderRadius: "inherit" }} />
    );
  }

  return (
    <div style={{ height: "100%", width: "100%", position: "relative", zIndex: 0, borderRadius: "inherit", overflow: "hidden" }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        initialViewState={{
          longitude: center[1],
          latitude: center[0],
          zoom: zoom,
        }}
        minZoom={minZoom}
        maxZoom={maxZoom}
        style={{ width: "100%", height: "100%" }}
        mapStyle={currentMapStyle}
        interactive={true}
        dragRotate={true}
        pitchWithRotate={true}
        pitch={show3D ? 60 : 0}
        projection="globe"
        fog={{
          range: [0.8, 8],
          color: mapStyleType === "dark" || mapStyleType === "satellite" ? "#242B4B" : "#ffffff",
          "horizon-blend": 0.3,
          "high-color": mapStyleType === "dark" || mapStyleType === "satellite" ? "#161B36" : "#f0f8ff",
          "space-color": mapStyleType === "dark" || mapStyleType === "satellite" ? "#0B1026" : "#add8e6",
          "star-intensity": mapStyleType === "dark" || mapStyleType === "satellite" ? 0.8 : 0.0,
        }}
        terrain={show3D ? { source: "mapbox-dem", exaggeration: 1.5 } : undefined}
      >
        {/* AI Plan Route */}
        {routeGeoJson && (
          <Source id="ai-plan-route" type="geojson" data={routeGeoJson}>
            <Layer
              id="ai-plan-route-glow"
              type="line"
              paint={{ "line-color": "#ff6b35", "line-width": 10, "line-opacity": 0.15, "line-blur": 8 }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
            <Layer
              id="ai-plan-route-line"
              type="line"
              paint={{ "line-color": "#ff6b35", "line-width": 3, "line-dasharray": [2, 2.5], "line-opacity": 0.9 }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
          </Source>
        )}

        {/* 3D Terrain Source */}
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={512}
          maxzoom={14}
        />

        {/* 3D Buildings Layer */}
        {show3D && (
          <Layer
            id="3d-buildings"
            source="composite"
            source-layer="building"
            filter={["==", "extrude", "true"]}
            type="fill-extrusion"
            minzoom={15}
            paint={{
              "fill-extrusion-color": "#aaa",
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.6,
            }}
          />
        )}

        {/* Cluster markers */}
        {clusters.map((cluster, idx) => (
          <Marker
            key={`cluster-${idx}-${cluster.center[0]}-${cluster.center[1]}`}
            longitude={cluster.center[1]}
            latitude={cluster.center[0]}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              if (mapRef.current) {
                mapRef.current.flyTo({
                  center: [cluster.center[1], cluster.center[0]],
                  zoom: zoom + 2,
                  duration: 800,
                });
              }
            }}
          >
            <ClusterMarker cluster={cluster} />
          </Marker>
        ))}

        {/* Single markers */}
        {singles.map((spot) => {
          const isSelected = selectedSpotId === spot.id;
          const isHovered = hoveredSpotId === spot.id;
          const isDimmed = selectedSpotId !== null && !isSelected;
          const planIndex = planSpotIndexMap?.get(spot.id);

          return (
            <Marker
              key={`marker-${spot.id}`}
              longitude={spot.lon}
              latitude={spot.lat}
              anchor="bottom"
              style={{ paddingBottom: '16px' }}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onMarkerClick?.(spot);
                if (mapRef.current) {
                  mapRef.current.flyTo({
                    center: [spot.lon, spot.lat],
                    zoom: Math.max(16, zoom),
                    pitch: show3D ? 60 : 0,
                    duration: 1200,
                  });
                }
              }}
            >
              <div
                onMouseEnter={() => onMarkerHover?.(spot)}
                onMouseLeave={() => onMarkerHover?.(null)}
              >
                <SpotMarker
                  spot={spot}
                  isHovered={isHovered}
                  isSelected={isSelected}
                  isDimmed={isDimmed}
                  planIndex={planIndex}
                />
              </div>
            </Marker>
          );
        })}

        {/* User Location */}
        {userLocation && (
          <Marker
            longitude={userLocation[1]}
            latitude={userLocation[0]}
            anchor="center"
          >
            <PulseMarker color="#0A84FF" />
          </Marker>
        )}

        {/* Base center marker if no points & user */}
        {spots.length === 0 && !userLocation && (
          <Marker
            longitude={center[1]}
            latitude={center[0]}
            anchor="center"
          >
            {/* Custom Pulse fallback */}
            <div style={{ position: "relative", width: 20, height: 20, background: "#ff6b35", border: "3px solid white", borderRadius: "50%", boxShadow: `0 0 15px #ff6b35` }} />
          </Marker>
        )}
      </Map>

      {/* Banner */}
      {showBanner && (
        <div style={{
          position: "absolute", top: "16px", left: "16px", zIndex: 1000,
          padding: "8px 16px", backgroundColor: "rgba(31,41,55,0.85)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", gap: "10px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
        }}>
          <div style={{ width: "8px", height: "8px", backgroundColor: "#ff6b35", borderRadius: "50%", boxShadow: "0 0 12px rgba(255,107,53,0.6)" }} />
          <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#FFF", letterSpacing: "0.8px", textTransform: "uppercase" }}>
            Exploring Area
          </span>
        </div>
      )}
    </div>
  );
}
