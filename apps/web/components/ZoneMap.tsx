"use client";

import {
  MapContainer,
  TileLayer,
  Polygon,
  CircleMarker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Zone, ZoneType } from "@/lib/api";

const COLORS: Record<ZoneType, string> = {
  RED: "#ef4444",
  YELLOW: "#f59e0b",
  GREEN: "#22c55e",
};

interface ZoneMapProps {
  zones: Zone[];
  point: { lat: number; lng: number } | null;
  onPick?: (point: { lat: number; lng: number }) => void;
}

function ClickHandler({ onPick }: { onPick?: ZoneMapProps["onPick"] }) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onPick?.({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

export default function ZoneMap({ zones, point, onPick }: ZoneMapProps) {
  return (
    <MapContainer
      center={[41.28, 69.26]}
      zoom={11}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler onPick={onPick} />

      {zones.map((zone) => (
        <Polygon
          key={zone.id}
          positions={zone.polygon}
          pathOptions={{ color: COLORS[zone.type], fillOpacity: 0.25, weight: 2 }}
        >
          <Popup>
            <strong>{zone.name}</strong>
            <br />
            {zone.type} zona
            {zone.description ? (
              <>
                <br />
                {zone.description}
              </>
            ) : null}
          </Popup>
        </Polygon>
      ))}

      {point ? (
        <CircleMarker
          center={[point.lat, point.lng]}
          radius={7}
          pathOptions={{ color: "#38bdf8", fillColor: "#38bdf8", fillOpacity: 0.9 }}
        >
          <Popup>
            {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
          </Popup>
        </CircleMarker>
      ) : null}
    </MapContainer>
  );
}
