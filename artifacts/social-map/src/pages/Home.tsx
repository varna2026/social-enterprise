import { useState, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { useListEnterprises, useGetEnterpriseStats } from "@workspace/api-client-react";
import { Enterprise } from "@workspace/api-client-react/src/generated/api.schemas";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import HomeMap from "@/components/map/HomeMap";
import {
  Building2, Users, HeartHandshake, MapPin, X, Phone, Mail,
  Globe, Facebook, ChevronRight, Filter, Shield, Lightbulb,
} from "lucide-react";

const OBLASTI = ["Варна", "Добрич", "Шумен", "Търговище"];
const VID_DEYNOST_OPTIONS = ["Производство", "Услуги", "Социални услуги", "Земеделие", "Обучения"];
const KAUZA_OPTIONS = ["Хора с увреждания", "Деца и младежи", "Социално включване"];

function parseImages(raw?: string | string[] | null): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

function parseList(raw?: string | null): string[] {
  if (!raw) return [];
  return raw.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
}

/* ─── Stats Bar ─────────────────────────────────────────── */
function StatBar({ stats, allEnterprises }: { stats: any; allEnterprises: Enterprise[] }) {
  const settlements = useMemo(
    () => new Set(allEnterprises.map(e => e.grad).filter(Boolean)).size,
    [allEnterprises]
  );
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap divide-x divide-border">
          <StatItem icon={Building2} value={stats?.totalEnterprises} label="Социални предприятия" color="emerald" />
          <StatItem icon={Users} value={stats?.totalZaeti} label="Заети лица" color="blue" />
          <StatItem icon={Shield} value={stats?.totalUyazvimiLica} label="От уязвими групи" color="violet" />
          <StatItem icon={HeartHandshake} value={stats?.totalKauzi} label="Социални каузи" color="rose" />
          <StatItem icon={MapPin} value={settlements || undefined} label="Населени места" color="amber" />
        </div>
      </div>
    </div>
  );
}

const COLOR_MAP: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
  rose: "bg-rose-50 text-rose-600",
  amber: "bg-amber-50 text-amber-600",
};

function StatItem({ icon: Icon, value, label, color }: { icon: any; value?: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 flex-1 min-w-[140px]">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${COLOR_MAP[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        {value === undefined ? (
          <Skeleton className="h-6 w-10 mb-0.5" />
        ) : (
          <div className="text-2xl font-bold text-foreground leading-none">{value}</div>
        )}
        <div className="text-xs text-muted-foreground leading-tight mt-0.5">{label}</div>
      </div>
    </div>
  );
}

/* ─── Filters Panel ─────────────────────────────────────── */
function FiltersPanel({
  oblastFilter, setOblastFilter,
  vidDeynost, setVidDeynost,
  kauza, setKauza,
  oblastCounts, onClear, hasFilters,
}: {
  oblastFilter: string[];
  setOblastFilter: (v: string[]) => void;
  vidDeynost: string;
  setVidDeynost: (v: string) => void;
  kauza: string;
  setKauza: (v: string) => void;
  oblastCounts: Record<string, number>;
  onClear: () => void;
  hasFilters: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground tracking-wide">
          <Filter className="w-4 h-4 text-primary" />
          ФИЛТРИ
        </div>
        {hasFilters && (
          <button onClick={onClear} className="text-xs text-primary hover:underline font-medium">
            Изчисти
          </button>
        )}
      </div>

      {/* Oblast checkboxes */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Област</div>
        <div className="space-y-2">
          {OBLASTI.map(o => (
            <label key={o} className="flex items-center justify-between cursor-pointer group select-none">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={oblastFilter.includes(o)}
                  onCheckedChange={(checked) =>
                    setOblastFilter(
                      checked ? [...oblastFilter, o] : oblastFilter.filter(x => x !== o)
                    )
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">{o}</span>
              </div>
              <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full tabular-nums">
                {oblastCounts[o] ?? 0}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Вид дейност */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Вид дейност</div>
        <Select value={vidDeynost} onValueChange={setVidDeynost}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Всички" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Всички</SelectItem>
            {VID_DEYNOST_OPTIONS.map(v => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Социална кауза */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Социална кауза</div>
        <Select value={kauza} onValueChange={setKauza}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Всички" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Всички</SelectItem>
            {KAUZA_OPTIONS.map(k => (
              <SelectItem key={k} value={k}>{k}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/* ─── Enterprise Side Panel ─────────────────────────────── */
function EnterprisePanel({ enterprise, onClose }: { enterprise: Enterprise; onClose: () => void }) {
  const images = parseImages(enterprise.images);
  const allItems = [...parseList(enterprise.producti), ...parseList(enterprise.uslugi)];

  return (
    <div className="h-full flex flex-col">
      {/* Hero image or blank header with close */}
      {images.length > 0 ? (
        <div className="relative h-44 shrink-0">
          <img src={images[0]} alt={enterprise.naimenovanie} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="h-10 shrink-0 flex items-center justify-end px-3 pt-2">
          <button onClick={onClose} className="w-7 h-7 hover:bg-muted rounded-full flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">

        {/* Name & location */}
        <div>
          <h3 className="font-bold text-base leading-snug text-foreground mb-1">
            {enterprise.naimenovanie}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0 text-primary" />
            {enterprise.grad}{enterprise.oblast ? `, ${enterprise.oblast}` : ""}
          </div>
        </div>

        {/* Кауза */}
        {enterprise.socialnaKauza && (
          <div>
            <div className="text-xs font-semibold text-foreground mb-1">Кауза</div>
            <div className="text-xs text-muted-foreground leading-relaxed">{enterprise.socialnaKauza}</div>
          </div>
        )}

        {/* Заети лица stats — explicitly requested by user */}
        {(enterprise.broyZaeti || enterprise.broyUyazvimiLica) && (
          <div className="grid grid-cols-2 gap-2">
            {!!enterprise.broyZaeti && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-center">
                <div className="text-xl font-bold text-blue-700 leading-none">{enterprise.broyZaeti}</div>
                <div className="text-[10px] text-blue-600 mt-0.5 leading-tight">Заети лица</div>
              </div>
            )}
            {!!enterprise.broyUyazvimiLica && (
              <div className="bg-violet-50 border border-violet-100 rounded-lg p-2.5 text-center">
                <div className="text-xl font-bold text-violet-700 leading-none">{enterprise.broyUyazvimiLica}</div>
                <div className="text-[10px] text-violet-600 mt-0.5 leading-tight">От уязвими групи</div>
              </div>
            )}
          </div>
        )}

        {/* Products & services */}
        {allItems.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-foreground mb-1.5">Продукти и услуги</div>
            <ul className="space-y-1">
              {allItems.slice(0, 5).map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <span className="text-primary mt-0.5 shrink-0 font-bold">✓</span>
                  {item}
                </li>
              ))}
              {allItems.length > 5 && (
                <li className="text-xs text-muted-foreground italic">+{allItems.length - 5} още...</li>
              )}
            </ul>
          </div>
        )}

        {/* Photo gallery */}
        {images.length > 1 && (
          <div>
            <div className="text-xs font-semibold text-foreground mb-1.5">
              Снимки{" "}
              <span className="font-normal text-muted-foreground">({images.length})</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="w-16 h-16 object-cover rounded-md shrink-0 border border-border"
                />
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div>
          <div className="text-xs font-semibold text-foreground mb-1.5">Контакт</div>
          <div className="space-y-1.5">
            {enterprise.email && (
              <a href={`mailto:${enterprise.email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-3 h-3 shrink-0" />{enterprise.email}
              </a>
            )}
            {enterprise.telefon && (
              <a href={`tel:${enterprise.telefon}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-3 h-3 shrink-0" />{enterprise.telefon}
              </a>
            )}
            {enterprise.adres && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 shrink-0 mt-0.5" />{enterprise.adres}
              </div>
            )}
            {enterprise.website && (
              <a href={enterprise.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Globe className="w-3 h-3 shrink-0" />
                {enterprise.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {enterprise.facebook && (
              <a href={enterprise.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-3 h-3 shrink-0" />Facebook страница
              </a>
            )}
          </div>
        </div>

        {/* Социална иновация info */}
        {enterprise.socialnaInovaciya && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1">
              <Lightbulb className="w-3.5 h-3.5" />
              Социална иновация
            </div>
            <div className="text-xs text-amber-700 leading-relaxed">{enterprise.socialnaInovaciya}</div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="p-3 border-t shrink-0">
        <Link href={`/enterprises/${enterprise.id}`}>
          <Button className="w-full h-9 text-sm" size="sm">
            Виж повече <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

/* ─── Enterprise Carousel Card ──────────────────────────── */
function EnterpriseCard({ enterprise }: { enterprise: Enterprise }) {
  const images = parseImages(enterprise.images);
  return (
    <Link href={`/enterprises/${enterprise.id}`}>
      <div className="w-52 shrink-0 bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
        <div className="h-28 bg-muted overflow-hidden">
          {images[0] ? (
            <img src={images[0]} alt={enterprise.naimenovanie} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-muted-foreground/20" />
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="font-semibold text-sm text-foreground leading-tight mb-1 line-clamp-2">
            {enterprise.naimenovanie}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <MapPin className="w-3 h-3 shrink-0" />{enterprise.grad}
          </div>
          {enterprise.kratkoOpisanie && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
              {enterprise.kratkoOpisanie}
            </p>
          )}
          {enterprise.socialnaKauza && (
            <div className="flex items-center gap-1 text-[10px] text-rose-600 font-medium">
              <HeartHandshake className="w-3 h-3 shrink-0" />
              <span className="truncate">Кауза</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function Home() {
  const urlSearch = useSearch();
  const urlParams = new URLSearchParams(urlSearch);
  const urlSelectedId = urlParams.get("id") ? Number(urlParams.get("id")) : null;

  const { data: stats } = useGetEnterpriseStats();
  const { data: allEnterprises = [], isLoading } = useListEnterprises();

  const [oblastFilter, setOblastFilter] = useState<string[]>([]);
  const [vidDeynost, setVidDeynost] = useState("_all");
  const [kauza, setKauza] = useState("_all");
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);

  const oblastCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allEnterprises.forEach(e => {
      if (e.oblast) counts[e.oblast] = (counts[e.oblast] ?? 0) + 1;
    });
    return counts;
  }, [allEnterprises]);

  const filtered = useMemo(() => {
    return allEnterprises.filter(e => {
      if (oblastFilter.length > 0 && !oblastFilter.includes(e.oblast)) return false;
      if (vidDeynost !== "_all" && e.ikonomicheskaDeynost !== vidDeynost) return false;
      if (kauza !== "_all" && e.socialnaKauza !== kauza) return false;
      return true;
    });
  }, [allEnterprises, oblastFilter, vidDeynost, kauza]);

  const hasFilters = oblastFilter.length > 0 || vidDeynost !== "_all" || kauza !== "_all";

  const clearFilters = () => {
    setOblastFilter([]);
    setVidDeynost("_all");
    setKauza("_all");
  };

  const effectiveSelected: Enterprise | null =
    selectedEnterprise ??
    (urlSelectedId ? allEnterprises.find(e => e.id === urlSelectedId) ?? null : null);

  const handleSelectEnterprise = (enterprise: Enterprise) => {
    setSelectedEnterprise(prev => (prev?.id === enterprise.id ? null : enterprise));
  };

  return (
    <div className="flex flex-col bg-muted/30 min-h-screen">
      {/* Stats bar */}
      <StatBar stats={stats} allEnterprises={allEnterprises} />

      {/* Main: Filters | Map | Side panel */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex gap-4" style={{ height: 580 }}>
          {/* Left: Filters */}
          <div className="w-52 shrink-0 bg-card border border-border rounded-xl p-4 overflow-y-auto shadow-sm">
            <FiltersPanel
              oblastFilter={oblastFilter}
              setOblastFilter={setOblastFilter}
              vidDeynost={vidDeynost}
              setVidDeynost={setVidDeynost}
              kauza={kauza}
              setKauza={setKauza}
              oblastCounts={oblastCounts}
              onClear={clearFilters}
              hasFilters={hasFilters}
            />
          </div>

          {/* Center: Map */}
          <div className="flex-1 min-w-0 rounded-xl overflow-hidden border border-border shadow-sm">
            <HomeMap
              enterprises={filtered}
              selectedId={effectiveSelected?.id ?? null}
              onSelectEnterprise={handleSelectEnterprise}
              isLoading={isLoading}
            />
          </div>

          {/* Right: Enterprise detail side panel */}
          {effectiveSelected && (
            <div className="w-72 shrink-0 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <EnterprisePanel
                enterprise={effectiveSelected}
                onClose={() => setSelectedEnterprise(null)}
              />
            </div>
          )}
        </div>

        {/* Filter count bar */}
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-xs text-muted-foreground">
            {filtered.length} предприятия{hasFilters ? " (филтрирани)" : " в региона"}
          </span>
          <Link href="/enterprises">
            <Button variant="ghost" size="sm" className="text-xs text-primary h-7 px-2">
              Списъчен изглед →
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom: Enterprise carousel */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Социални предприятия</h2>
          <Link href="/enterprises">
            <Button variant="ghost" size="sm" className="text-primary text-xs h-8">
              Виж всички →
            </Button>
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-3" style={{ scrollSnapType: "x mandatory" }}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-52 h-52 shrink-0 bg-card border rounded-xl animate-pulse" />
              ))
            : filtered.map(e => (
                <div key={e.id} style={{ scrollSnapAlign: "start" }}>
                  <EnterpriseCard enterprise={e} />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
