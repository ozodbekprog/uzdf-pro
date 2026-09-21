"use client";

import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  CircleMarker,
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

interface ZoneEditorProps {
  zones: Zone[];
  points: [number, number][];
  onAddPoint: (point: [number, number]) => void;
  activeType: ZoneType;
  editingId: string | null;
}

function ClickHandler({
  onAddPoint,
}: {
  onAddPoint: (point: [number, number]) => void;
}) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onAddPoint([event.latlng.lat, event.latlng.lng]);
    },
  });
  return null;
}

export default function ZoneEditor({
  zones,
  points,
  onAddPoint,
  activeType,
  editingId,
}: ZoneEditorProps) {
  return (
    <MapContainer
      center={[41.28, 69.26]}
      zoom={11}
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler onAddPoint={onAddPoint} />

      {zones.map((zone) => {
        const isEditing = zone.id === editingId;
        return (
          <Polygon
            key={zone.id}
            positions={zone.polygon}
            pathOptions={{
              color: COLORS[zone.type],
              fillColor: COLORS[zone.type],
              fillOpacity: isEditing ? 0.28 : 0.06,
              opacity: isEditing ? 0.9 : 0.35,
              weight: isEditing ? 3 : 1.5,
            }}
          />
        );
      })}

      {points.length >= 3 ? (
        <Polygon
          positions={points}
          pathOptions={{
            color: COLORS[activeType],
            fillColor: COLORS[activeType],
            fillOpacity: 0.12,
            weight: 1,
            dashArray: "4 4",
          }}
        />
      ) : null}

      {points.length >= 2 ? (
        <Polyline
          positions={points}
          pathOptions={{ color: "#38bdf8", weight: 4 }}
        />
      ) : null}

      {points.map((point, index) => (
        <CircleMarker
          key={`${point[0]}-${point[1]}-${index}`}
          center={point}
          radius={5}
          pathOptions={{
            color: "#38bdf8",
            fillColor: "#38bdf8",
            fillOpacity: 1,
            weight: 2,
          }}
        />
      ))}
    </MapContainer>
  );
}
