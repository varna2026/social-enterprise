import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListEnterprises } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase, Filter, Map, Building2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

const OBLASTI = ["Варна", "Добрич", "Шумен", "Търговище"];

const VID_DEYNOST = [
  "Производство",
  "Услуги",
  "Социални услуги",
  "Обучения",
  "Земеделие",
  "Други",
];

const SOCIALNI_CAUZI = [
  "Хора с увреждания",
  "Деца и младежи",
  "Възрастни хора",
  "Образование",
  "Околна среда",
  "Социално включване",
  "Други",
];

export default function Enterprises() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [oblast, setOblast] = useState("");
  const [vidDeynost, setVidDeynost] = useState("");
  const [socialnaKauza, setSocialnaKauza] = useState("");
  const [, navigate] = useLocation();

  const { data: enterprises, isLoading } = useListEnterprises({
    search: debouncedSearch || undefined,
    oblast: oblast || undefined,
    ikonomicheskaDeynost: vidDeynost || undefined,
    socialnaKauza: socialnaKauza || undefined,
  });

  const hasActiveFilters = oblast || vidDeynost || socialnaKauza || search;

  const clearFilters = () => {
    setSearch("");
    setOblast("");
    setVidDeynost("");
    setSocialnaKauza("");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Социални предприятия</h1>
          <p className="text-muted-foreground mt-1">
            Всички социални предприятия в Североизточен район (Варна, Добрич, Шумен, Търговище).
          </p>
        </div>
        {enterprises && (
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {enterprises.length} предприятия
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border rounded-xl p-5 shadow-sm sticky top-20">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 font-semibold text-base">
                <Filter className="w-4 h-4 text-primary" />
                Филтри
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7 text-muted-foreground">
                  Изчисти
                </Button>
              )}
            </div>

            <div className="space-y-5">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Търсене</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Наименование или населено място..."
                    className="pl-9 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Oblast */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Област</label>
                <Select value={oblast || "all"} onValueChange={(v) => setOblast(v === "all" ? "" : v)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Всички области" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всички области</SelectItem>
                    {OBLASTI.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Vid deynost */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Вид дейност</label>
                <Select value={vidDeynost || "all"} onValueChange={(v) => setVidDeynost(v === "all" ? "" : v)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Всички дейности" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всички дейности</SelectItem>
                    {VID_DEYNOST.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Socialna kauza */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Социална кауза</label>
                <Select value={socialnaKauza || "all"} onValueChange={(v) => setSocialnaKauza(v === "all" ? "" : v)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Всички каузи" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всички каузи</SelectItem>
                    {SOCIALNI_CAUZI.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Main List */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-52 w-full rounded-xl" />
              ))}
            </div>
          ) : enterprises?.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">Няма намерени предприятия</h3>
              <p className="text-muted-foreground mt-1 text-sm">Опитайте да промените филтрите или търсенето.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enterprises?.map((ent) => (
                <Card key={ent.id} className="h-full border hover:border-primary/40 hover:shadow-md transition-all flex flex-col">
                  <CardHeader className="pb-3 flex-none">
                    <div className="flex justify-between items-start gap-3">
                      <CardTitle className="text-base leading-tight line-clamp-2">
                        {ent.naimenovanie}
                      </CardTitle>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 shrink-0 text-xs">
                        {ent.klas}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                      <MapPin className="w-3 h-3" /> {ent.grad}, {ent.oblast}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-1 pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {ent.kratkoOpisanie}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <Badge variant="secondary" className="text-xs font-normal">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {ent.ikonomicheskaDeynost}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-normal bg-accent/10">
                        {ent.socialnaKauza}
                      </Badge>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Link href={`/enterprises/${ent.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs h-8">
                          Профил
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="flex-1 text-xs h-8 gap-1"
                        onClick={() => navigate(`/?id=${ent.id}`)}
                      >
                        <Map className="w-3 h-3" />
                        Виж на картата
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
