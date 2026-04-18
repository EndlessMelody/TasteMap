"use client";

import { useState, useCallback } from "react";
import {
  resolveCurrentLocation,
  type LocationResult,
  type VietnamAddress,
} from "@/lib/geolocation";

type LocationStatus =
  | "idle"
  | "acquiring"
  | "geocoding"
  | "success"
  | "error";

interface UseLocationState {
  status: LocationStatus;
  result: LocationResult | null;
  error: string | null;
}

interface UseLocationReturn extends UseLocationState {
  isLoading: boolean;
  detect: () => Promise<LocationResult | null>;
  reset: () => void;
  formatAddress: (addr: VietnamAddress) => string;
}

export function useLocation(): UseLocationReturn {
  const [state, setState] = useState<UseLocationState>({
    status: "idle",
    result: null,
    error: null,
  });

  const detect = useCallback(async (): Promise<LocationResult | null> => {
    setState({ status: "acquiring", result: null, error: null });

    try {
      setState((s) => ({ ...s, status: "acquiring" }));
      const result = await resolveCurrentLocation();
      setState({ status: "success", result, error: null });
      return result;
    } catch (err) {
      const isGeoError =
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as Record<string, unknown>).code === "number";
      const message = isGeoError
        ? geolocationErrorMessage(err as GeolocationPositionError)
        : (err as Error).message ?? "Location detection failed";
      setState({ status: "error", result: null, error: message });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle", result: null, error: null });
  }, []);

  const formatAddress = useCallback((addr: VietnamAddress): string => {
    return addr.formatted;
  }, []);

  return {
    ...state,
    isLoading: state.status === "acquiring" || state.status === "geocoding",
    detect,
    reset,
    formatAddress,
  };
}

function geolocationErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return "Location permission denied. Please allow access in your browser settings.";
    case err.POSITION_UNAVAILABLE:
      return "GPS signal unavailable. Move to open sky and retry.";
    case err.TIMEOUT:
      return "GPS timed out. Ensure location services are enabled.";
    default:
      return "Unknown location error.";
  }
}
