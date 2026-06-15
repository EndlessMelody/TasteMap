"use client";

import type { ItineraryStop } from "./types";
import { MAP_POS } from "./constants";

interface RouteMapProps {
  stops: ItineraryStop[];
  activeStop: number | null;
}

export function RouteMap({ stops, activeStop }: RouteMapProps) {
  const pts = MAP_POS.slice(0, stops.length);
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");

  return (
    <div
      style={{
        position: "relative",
        height: 320,
        backgroundColor: "#F5F3EE",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid #E5E5EA",
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 300 400"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((y) => (
          <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#EAE7E0" strokeWidth="1" />
        ))}
        {[50, 100, 150, 200, 250].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="400" stroke="#EAE7E0" strokeWidth="1" />
        ))}
        <line x1="150" y1="0" x2="150" y2="400" stroke="#D8D3CA" strokeWidth="2" />
        <line x1="0" y1="200" x2="300" y2="200" stroke="#D8D3CA" strokeWidth="2" />
        <ellipse cx="248" cy="55" rx="44" ry="26" fill="#C8E9F5" opacity="0.7" />
        <text x="230" y="58" fontSize="7" fill="#7BBDD4" fontWeight="600">
          Sài Gòn River
        </text>
        <ellipse cx="58" cy="278" rx="28" ry="18" fill="#C8E8C8" opacity="0.6" />
        <path
          d={pathD}
          fill="none"
          stroke="#ff6b35"
          strokeWidth="2.5"
          strokeDasharray="6 3"
          opacity="0.55"
        />
        {pts.map(([x, y], i) => {
          const s = stops[i];
          const a = activeStop === i;
          return (
            <g key={s.name}>
              {a && <circle cx={x} cy={y} r={22} fill={s.accent} opacity={0.18} />}
              <circle cx={x} cy={y} r={a ? 14 : 11} fill={s.accent} />
              <text
                x={x}
                y={y + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={a ? 9 : 7}
                fontWeight="800"
              >
                {i + 1}
              </text>
              <text
                x={x + (x > 150 ? -16 : 16)}
                y={y - 15}
                textAnchor={x > 150 ? "end" : "start"}
                fill="#3C3C43"
                fontSize="7"
                fontWeight="700"
              >
                {s.name.split(" ").slice(0, 2).join(" ")}
              </text>
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 12,
          fontSize: 10,
          color: "#8E8E93",
          fontWeight: 700,
        }}
      >
        HCMC Route Map
      </div>
    </div>
  );
}
