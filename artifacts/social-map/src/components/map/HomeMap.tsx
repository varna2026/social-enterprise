import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useListEnterprises } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Enterprise } from "@workspace/api-client-react/src/generated/api.schemas";
import { MapPin } from "lucide-react";

function FlyTo({ enterprises, selectedId }: { enterprises: Enterprise[]; selectedId: number | null }) {
  const map = useMap();
  const prevId = useRef<number | null>(null);

  useEffect(() => {
    if (!selectedId || selectedId === prevId.current) return;
    const ent = enterprises.find(e => e.id === selectedId);
    if (ent?.lat && ent?.lng) {
      map.flyTo([ent.lat, ent.lng], 14, { duration: 1.2 });
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
            <Popup className="civic-popup">
              <div className="p-1">
                <h3 className="font-bold text-sm mb-1">{enterprise.naimenovanie}</h3>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {enterprise.grad}, {enterprise.oblast}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    {enterprise.ikonomicheskaDeynost}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-secondary/10 text-secondary rounded-full">
                    {enterprise.socialnaKauza}
                  </span>
                </div>
                <Link href={`/enterprises/${enterprise.id}`}>
                  <Button size="sm" className="w-full h-8 text-xs">
                    Към профила
                  </Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
