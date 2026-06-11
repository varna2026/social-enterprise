import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import { Enterprise } from "@workspace/api-client-react/src/generated/api.schemas";
import { Skeleton } from "@/components/ui/skeleton";

const ACTIVITY_COLORS: Record<string, string> = {
  "Производство": "#16a34a",
  "Услуги": "#2563eb",
  "Социални услуги": "#9333ea",
  "Земеделие": "#d97706",
  "Обучения": "#ca8a04",
  "Здраве и грижа": "#db2777",
  "Рециклиране": "#0d9488",
};

function getMarkerIcon(enterprise: Enterprise, isSelected: boolean) {
  const color = ACTIVITY_COLORS[enterprise.ikonomicheskaDeynost ?? ""] ?? "#6b7280";
  if (isSelected) {
    return divIcon({
      html: `<div style="
        width:16px;height:16px;border-radius:50%;
        background:${color};
        border:3px solid white;
        box-shadow:0 0 0 2.5px ${color},0 3px 8px rgba(0,0,0,0.5);
        transition:all .2s;
      "></div>`,
      className: "",
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  }
  return divIcon({
    html: `<div style="
      width:11px;height:11px;border-radius:50%;
      background:${color};
      border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.3);
    "></div>`,
    className: "",
    iconSize: [11, 11],
    iconAnchor: [5.5, 5.5],
  });
}

function FlyTo({ enterprises, selectedId }: { enterprises: Enterprise[]; selectedId: number | null }) {
  const map = useMap();
  const prevId = useRef<number | null>(null);

  useEffect(() => {
    if (!selectedId || selectedId === prevId.current) return;
    const ent = enterprises.find(e => e.id === selectedId);
    if (ent?.lat && ent?.lng) {
      map.flyTo([ent.lat, ent.lng], 13, { duration: 0.8 });
      prevId.current = selectedId;
    }
  }, [selectedId, enterprises, map]);

  return null;
}

interface HomeMapProps {
  enterprises: Enterprise[];
  selectedId: number | null;
  onSelectEnterprise: (enterprise: Enterprise) => void;
  isLoading?: boolean;
}

export default function HomeMap({ enterprises, selectedId, onSelectEnterprise, isLoading }: HomeMapProps) {
  if (isLoading) {
    return <Skeleton className="w-full h-full" />;
  }

  const valid = enterprises.filter(e => e.lat && e.lng);

  return (
    <MapContainer
      center={[43.21, 27.92]}
      zoom={8}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo enterprises={valid} selectedId={selectedId} />
      {valid.map((enterprise) => (
        <Marker
          key={enterprise.id}
          position={[enterprise.lat!, enterprise.lng!]}
          icon={getMarkerIcon(enterprise, enterprise.id === selectedId)}
          eventHandlers={{ click: () => onSelectEnterprise(enterprise) }}
        >
          <Tooltip direction="top" offset={[0, -6]} className="enterprise-name-tooltip">
            <span className="text-xs font-semibold">{enterprise.naimenovanie}</span>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
