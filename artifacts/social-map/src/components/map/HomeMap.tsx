import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import { useListEnterprises } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Enterprise } from "@workspace/api-client-react/src/generated/api.schemas";
import { MapPin } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function FlyTo({ enterprises, selectedId }: { enterprises: Enterprise[]; selectedId: number | null }) {
  const map = useMap();
  const prevId = useRef<number | null>(null);

  useEffect(() => {
    if (!selectedId || selectedId === prevId.current) return;
    const ent = enterprises.find(e => e.id === selectedId);
    if (ent?.lat && ent?.lng) {
      map.flyTo([ent.lat, ent.lng], 15, { duration: 1.2 });
      prevId.current = selectedId;
    }
  }, [selectedId, enterprises, map]);

  return null;
}

interface HomeMapProps {
  selectedId?: number | null;
}

export default function HomeMap({ selectedId }: HomeMapProps) {
  const { data: enterprises, isLoading } = useListEnterprises();

  if (isLoading) {
    return <Skeleton className="w-full h-full min-h-[500px] rounded-xl" />;
  }

  if (!enterprises) return null;

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-border shadow-sm">
      <MapContainer
        center={[43.21, 27.92]}
        zoom={8}
        style={{ height: "100%", width: "100%", minHeight: "500px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo enterprises={enterprises} selectedId={selectedId ?? null} />
        {enterprises.map((enterprise: Enterprise) => (
          <Marker key={enterprise.id} position={[enterprise.lat, enterprise.lng]}>
            <Tooltip direction="top" offset={[0, -8]} className="enterprise-name-tooltip">
              <span className="text-xs font-semibold">{enterprise.naimenovanie}</span>
            </Tooltip>
            <Popup className="civic-popup" minWidth={220}>
              <div className="p-1">
                <h3 className="font-bold text-sm mb-0.5 leading-tight">{enterprise.naimenovanie}</h3>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" /> {enterprise.adres || enterprise.grad}, {enterprise.oblast}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                    {enterprise.ikonomicheskaDeynost}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-secondary/10 text-secondary-foreground rounded-full">
                    {enterprise.socialnaKauza}
                  </span>
                </div>
                <Link href={`/enterprises/${enterprise.id}`}>
                  <Button size="sm" className="w-full h-8 text-xs mb-2">
                    Към профила
                  </Button>
                </Link>
                <div className="border-t pt-2 mt-1 flex justify-center">
                  <img
                    src={`${BASE}/marka-sp.png`}
                    alt="Продукт на социално предприятие"
                    className="h-8 object-contain opacity-80"
                  />
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
