"use client";

/**
 * TourMap — canonical way to render a tour's stops + route on a real Mapbox map.
 * Used by JourneyView, the Discovery "Latest Tour" card, My Tours, and the AI
 * Planner result screen so every surface stays visually/behaviourally consistent.
 */
import dynamic from "next/dynamic";
import { Column } from "@once-ui-system/core";
import ClientOnly from "@/components/common/ClientOnly";
import type { JourneyStop } from "./lib";
import { journeyStopsToSpots, toRouteCoords, tourCenter, stopIndexMap } from "./lib";

const MapWidget = dynamic(() => import("@/components/MapWidget"), { ssr: false });

interface TourMapProps {
  stops: JourneyStop[];
  mapId: string;
  height?: number | string;
  zoom?: number;
}

export function TourMap({ stops, mapId, height = 220, zoom = 13 }: TourMapProps) {
  const spots = journeyStopsToSpots(stops);
  const routeCoords = toRouteCoords(stops);
  const center = tourCenter(stops);
  const planSpotIndexMap = stopIndexMap(stops);

  return (
    <Column style={{ height, width: "100%" }}>
      <ClientOnly>
        <MapWidget
          mapId={mapId}
          spots={spots}
          center={center}
          zoom={zoom}
          routeCoords={routeCoords.length >= 2 ? routeCoords : undefined}
          planSpotIndexMap={planSpotIndexMap}
          showBanner={false}
        />
      </ClientOnly>
    </Column>
  );
}
