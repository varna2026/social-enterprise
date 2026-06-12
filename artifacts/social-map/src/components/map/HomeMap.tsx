import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import { Enterprise } from "@workspace/api-client-react/src/generated/api.schemas";
import { Skeleton } from "@/components/ui/skeleton";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function getMarkerIcon(isSelected: boolean) {
  const size = isSelected ? 32 : 24;
  const shadow = isSelected
    ? "drop-shadow(0 0 4px rgba(0,0,0,0.6))"
    : "drop-shadow(0 1px 2px rgba(0,0,0,0.35))";
  return divIcon({
    html: `<img src="${BASE}/marka-icon.png" style="
      width:${size}px;height:${size}px;
      object-fit:contain;
      filter:${shadow};
      transition:all .2s;
    " />`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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
          icon={getMarkerIcon(enterprise.id === selectedId)}
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
