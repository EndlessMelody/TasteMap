/**
 * useWeather — Real-time weather from Open-Meteo + browser GPS
 *
 * Uses the existing navigator.geolocation API (no dependency on useLocation hook
 * to avoid double-permission prompts). Falls back to HCMC default if denied.
 */
"use client";

import { useState, useEffect } from "react";

const DEFAULT_LAT = 10.8231;
const DEFAULT_LON = 106.6297;

// WMO weather interpretation codes → display info
const WMO: Record<number, { label: string; emoji: string; outdoor: boolean }> =
  {
    0: { label: "Clear Sky", emoji: "☀️", outdoor: true },
    1: { label: "Mainly Clear", emoji: "🌤️", outdoor: true },
    2: { label: "Partly Cloudy", emoji: "⛅", outdoor: true },
    3: { label: "Overcast", emoji: "☁️", outdoor: true },
    45: { label: "Foggy", emoji: "🌫️", outdoor: false },
    48: { label: "Foggy", emoji: "🌫️", outdoor: false },
    51: { label: "Light Drizzle", emoji: "🌦️", outdoor: false },
    53: { label: "Drizzle", emoji: "🌦️", outdoor: false },
    55: { label: "Heavy Drizzle", emoji: "🌧️", outdoor: false },
    61: { label: "Light Rain", emoji: "🌧️", outdoor: false },
    63: { label: "Moderate Rain", emoji: "🌧️", outdoor: false },
    65: { label: "Heavy Rain", emoji: "🌧️", outdoor: false },
    80: { label: "Rain Showers", emoji: "🌦️", outdoor: false },
    81: { label: "Rain Showers", emoji: "🌦️", outdoor: false },
    95: { label: "Thunderstorm", emoji: "⛈️", outdoor: false },
    96: { label: "Thunderstorm", emoji: "⛈️", outdoor: false },
    99: { label: "Thunderstorm", emoji: "⛈️", outdoor: false },
  };

function getWmo(code: number) {
  return (
    WMO[code] ?? { label: "Unknown", emoji: "🌡️", outdoor: true }
  );
}

function getDiningTip(outdoor: boolean, label: string): string {
  if (!outdoor) {
    if (label.includes("Rain") || label.includes("Drizzle"))
      return "Rainy day — perfect for cozy indoor spots & hot soup";
    if (label.includes("Storm"))
      return "Stay safe inside — great time for comfort food";
    return "Not ideal outdoors — head to a roofed café";
  }
  const h = new Date().getHours();
  if (h >= 6 && h < 10) return "Good morning! Perfect weather for a sidewalk breakfast";
  if (h >= 10 && h < 14) return "Sunny & warm — great for shaded outdoor spots";
  if (h >= 14 && h < 18) return "Afternoon breeze — rooftop cafés are calling";
  if (h >= 18 && h < 21) return "Clear evening — ideal for alfresco dining";
  return "Clear night sky — try a late-night street food walk";
}

export interface WeatherResult {
  temp: number;
  feelsLike: number;
  windspeed: number;
  humidity: number;
  weathercode: number;
  emoji: string;
  label: string;
  outdoor: boolean;
  diningTip: string;
  locationName: string;
  lat: number;
  lon: number;
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather(lat: number, lon: number, name: string) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
            `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relativehumidity_2m&timezone=auto`,
        );
        const d = await res.json();
        if (cancelled) return;
        const code: number = d.current.weathercode;
        const wmo = getWmo(code);
        setWeather({
          temp: Math.round(d.current.temperature_2m),
          feelsLike: Math.round(d.current.apparent_temperature),
          windspeed: Math.round(d.current.windspeed_10m),
          humidity: d.current.relativehumidity_2m,
          weathercode: code,
          emoji: wmo.emoji,
          label: wmo.label,
          outdoor: wmo.outdoor,
          diningTip: getDiningTip(wmo.outdoor, wmo.label),
          locationName: name,
          lat,
          lon,
        });
      } catch {
        // silently fail — sidebar just won't show weather
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function reverseGeocode(lat: number, lon: number): Promise<string> {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
          { headers: { "Accept-Language": "en-US,en" } },
        );
        const d = await res.json();
        const addr = d.address ?? {};
        const sub =
          addr.suburb ?? addr.quarter ?? addr.neighbourhood ?? "";
        const city = addr.city ?? addr.town ?? addr.county ?? "Your Area";
        return sub ? `${sub}, ${city}` : city;
      } catch {
        return "Your Location";
      }
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          const name = await reverseGeocode(lat, lon);
          if (!cancelled) fetchWeather(lat, lon, name);
        },
        () => {
          // Permission denied — use HCMC default
          if (!cancelled) fetchWeather(DEFAULT_LAT, DEFAULT_LON, "Ho Chi Minh City");
        },
        { timeout: 6000 },
      );
    } else {
      fetchWeather(DEFAULT_LAT, DEFAULT_LON, "Ho Chi Minh City");
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return { weather, loading };
}
