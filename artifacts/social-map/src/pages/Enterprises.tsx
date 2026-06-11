import { useState } from "react";
import { Link } from "wouter";
import { useListEnterprises } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FILTER_OPTIONS = {
  oblast: ["Varna", "Dobrich", "Shumen", "Targovishte"],
  klas: ["Klas A", "Klas A+"],
  pravnaForma: ["EOOD", "OOD", "Sdruzhenie", "Fondaciya", "Kooperaciya", "Drugo"],
  ikonomicheskaDeynost: ["Proizvodstvo", "Uslugi", "Sotsialni uslugi", "Zemedelie", "Turizam", "Obuchenie", "Zanayatchiystvo", "Reciklirane", "Kragova ikonomika", "Drago"],
  celevGrupa: ["Hora s uvrezhdaniya", "Lica nad 55 godini", "Bezrabotni lica", "Mladezhi", "Samotni roditeli", "Lica v risk ot sots. izklyuchvane", "Druga uzyazvima grupa"],
  socialnaKauza: ["Trudova integraciya", "Podkrepa za hora s uvrezhdaniya", "Detsko razvitie", "Podkrepa za semeystva", "Obrazovanie", "Zdrave", "Ustoychivo razvitie", "Opazvane na okolnata sreda", "Kragova ikonomika", "Sotsialni uslugi", "Mestno razvitie", "Drago"],
  socialnaInovaciya: ["Nov produkt", "Nova usluga", "Nov proces", "Nov organizatsionen model", "Digitalna inovaciya", "Ekologichna inovaciya", "Sotsialna inovaciya v obshtnostta"]
};

export default function Enterprises() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<Record<string, string>>({
    oblast: "",
    klas: "",
    pravnaForma: "",
    ikonomicheskaDeynost: "",
    celevGrupa: "",
    socialnaKauza: "",
    socialnaInovaciya: ""
  });

  const { data: enterprises, isLoading } = useListEnterprises({
    search: debouncedSearch || undefined,
    oblast: filters.oblast || undefined,
    klas: filters.klas || undefined,
    pravnaForma: filters.pravnaForma || undefined,
    ikonomicheskaDeynost: filters.ikonomicheskaDeynost || undefined,
    celevGrupa: filters.celevGrupa || undefined,
    socialnaKauza: filters.socialnaKauza || undefined,
    socialnaInovaciya: filters.socialnaInovaciya || undefined,
  });

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value === "all" ? "" : value }));
  };

  const hasActiveFilters = Object.values(filters).some(Boolean) || search;

  const clearFilters = () => {
    setSearch("");
    setFilters({
      oblast: "",
      klas: "",
      pravnaForma: "",
      ikonomicheskaDeynost: "",
      celevGrupa: "",
      socialnaKauza: "",
      socialnaInovaciya: ""
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Социални предприятия</h1>
          <p className="text-muted-foreground mt-1">Регистър на всички социални предприятия в региона.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border rounded-xl p-5 shadow-sm sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <Filter className="w-5 h-5 text-primary" />
                Филтри
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-8">
                  Изчисти
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Търсене</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Име, ЕИК, Град..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <Accordion type="multiple" defaultValue={["oblast", "klas"]} className="w-full">
                <AccordionItem value="oblast" className="border-b-0">
                  <AccordionTrigger className="py-2 hover:no-underline text-sm font-medium">Област</AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <Select value={filters.oblast || "all"} onValueChange={(v) => updateFilter("oblast", v)}>
                      <SelectTrigger><SelectValue placeholder="Всички" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Всички</SelectItem>
                        {FILTER_OPTIONS.oblast.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="klas" className="border-b-0">
                  <AccordionTrigger className="py-2 hover:no-underline text-sm font-medium">Клас</AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <Select value={filters.klas || "all"} onValueChange={(v) => updateFilter("klas", v)}>
                      <SelectTrigger><SelectValue placeholder="Всички" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Всички</SelectItem>
                        {FILTER_OPTIONS.klas.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="pravnaForma" className="border-b-0">
                  <AccordionTrigger className="py-2 hover:no-underline text-sm font-medium">Правна форма</AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <Select value={filters.pravnaForma || "all"} onValueChange={(v) => updateFilter("pravnaForma", v)}>
                      <SelectTrigger><SelectValue placeholder="Всички" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Всички</SelectItem>
                        {FILTER_OPTIONS.pravnaForma.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ikonomicheskaDeynost" className="border-b-0">
                  <AccordionTrigger className="py-2 hover:no-underline text-sm font-medium">Икономическа дейност</AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <Select value={filters.ikonomicheskaDeynost || "all"} onValueChange={(v) => updateFilter("ikonomicheskaDeynost", v)}>
                      <SelectTrigger><SelectValue placeholder="Всички" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Всички</SelectItem>
                        {FILTER_OPTIONS.ikonomicheskaDeynost.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="celevGrupa" className="border-b-0">
                  <AccordionTrigger className="py-2 hover:no-underline text-sm font-medium">Целева група</AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <Select value={filters.celevGrupa || "all"} onValueChange={(v) => updateFilter("celevGrupa", v)}>
                      <SelectTrigger><SelectValue placeholder="Всички" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Всички</SelectItem>
                        {FILTER_OPTIONS.celevGrupa.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="socialnaKauza" className="border-b-0">
                  <AccordionTrigger className="py-2 hover:no-underline text-sm font-medium">Социална кауза</AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <Select value={filters.socialnaKauza || "all"} onValueChange={(v) => updateFilter("socialnaKauza", v)}>
                      <SelectTrigger><SelectValue placeholder="Всички" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Всички</SelectItem>
                        {FILTER_OPTIONS.socialnaKauza.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Main List */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : enterprises?.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">Няма намерени предприятия</h3>
              <p className="text-muted-foreground mt-1">Опитайте да промените филтрите.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enterprises?.map((ent) => (
                <Link key={ent.id} href={`/enterprises/${ent.id}`}>
                  <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group flex flex-col">
                    <CardHeader className="pb-3 flex-none">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {ent.naimenovanie}
                        </CardTitle>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 shrink-0">
                          {ent.klas}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {ent.grad}, област {ent.oblast}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="flex flex-col gap-3 h-full">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {ent.kratkoOpisanie}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/50">
                          <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground text-xs font-normal">
                            <Briefcase className="w-3 h-3 mr-1 inline" />
                            {ent.ikonomicheskaDeynost}
                          </Badge>
                          <Badge variant="secondary" className="bg-accent/20 text-accent-foreground text-xs font-normal">
                            {ent.socialnaKauza}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Ensure Building2 is imported properly for the empty state
import { Building2 } from "lucide-react";
