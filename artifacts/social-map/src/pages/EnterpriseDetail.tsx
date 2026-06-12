import { useGetEnterprise } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Phone, Mail, Facebook, Users, Heart, ArrowLeft, Lightbulb, TrendingUp, ImageOff } from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function parseImages(raw?: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export default function EnterpriseDetail() {
  const { id } = useParams();
  const { data: ent, isLoading } = useGetEnterprise(Number(id), {
    query: { enabled: !!id }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!ent) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Предприятието не е намерено</h2>
        <Link href="/enterprises">
          <Button variant="outline" className="mt-4">Назад към списъка</Button>
        </Link>
      </div>
    );
  }

  const images = parseImages(ent.images);

  return (
    <div className="bg-muted/30 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-background border-b pt-8 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/enterprises">
            <Button variant="ghost" size="sm" className="mb-6 -ml-3 text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Всички предприятия
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-primary hover:bg-primary text-white text-sm px-3 py-1">
                  {ent.klas}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {ent.pravnaForma}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{ent.naimenovanie}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {ent.grad}, обл. {ent.oblast}
                </span>
                {ent.eik && (
                  <span className="flex items-center gap-1 border-l pl-4">
                    ЕИК: {ent.eik}
                  </span>
                )}
              </div>
            </div>

            {(ent.telefon || ent.email || ent.website || ent.facebook) && (
              <div className="flex flex-col gap-2 bg-muted/50 p-4 rounded-xl min-w-[250px] border border-border/50">
                <h3 className="text-sm font-semibold mb-1 uppercase tracking-wider text-muted-foreground">Контакти</h3>
                {ent.telefon && <a href={`tel:${ent.telefon}`} className="flex items-center gap-2 text-sm hover:text-primary"><Phone className="w-4 h-4" /> {ent.telefon}</a>}
                {ent.email && <a href={`mailto:${ent.email}`} className="flex items-center gap-2 text-sm hover:text-primary"><Mail className="w-4 h-4" /> {ent.email}</a>}
                {ent.website && <a href={ent.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:text-primary"><Globe className="w-4 h-4" /> Уебсайт</a>}
                {ent.facebook && <a href={ent.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:text-primary"><Facebook className="w-4 h-4" /> Facebook</a>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-background rounded-2xl p-6 md:p-8 shadow-sm border">
              <h2 className="text-xl font-bold mb-4">Кратко описание</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{ent.kratkoOpisanie}</p>

              {ent.misiya && (
                <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-xl">
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5" /> Мисия
                  </h3>
                  <p className="text-foreground leading-relaxed italic">"{ent.misiya}"</p>
                </div>
              )}
            </section>

            {/* Photo Gallery */}
            <section className="bg-background rounded-2xl p-6 md:p-8 shadow-sm border">
              <h2 className="text-xl font-bold mb-5">Снимки</h2>
              {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="group relative overflow-hidden rounded-xl aspect-square bg-muted border hover:border-primary/40 transition-all">
                      <img
                        src={url}
                        alt={`${ent.naimenovanie} - снимка ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-muted/30 rounded-xl border border-dashed gap-3 text-muted-foreground">
                  <ImageOff className="w-10 h-10 opacity-40" />
                  <p className="text-sm">Снимките могат да се добавят чрез Админ панела</p>
                </div>
              )}
            </section>

            <section className="bg-background rounded-2xl p-6 md:p-8 shadow-sm border">
              <h2 className="text-xl font-bold mb-6">Социално въздействие</h2>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Социална кауза</div>
                    <div className="font-medium text-foreground">{ent.socialnaKauza}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Целева група</div>
                    <div className="font-medium text-foreground">{ent.celevnaGrupa}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {ent.socialnaInovaciya && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Lightbulb className="w-3 h-3" /> Иновация</div>
                      <div className="font-medium text-foreground">{ent.socialnaInovaciya}</div>
                    </div>
                  )}
                  <div className="flex gap-8 pt-2 border-t mt-4">
                    {ent.broyZaeti !== null && (
                      <div>
                        <div className="text-3xl font-bold text-primary mb-1">{ent.broyZaeti}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Заети лица</div>
                      </div>
                    )}
                    {ent.broyUyazvimiLica !== null && (
                      <div>
                        <div className="text-3xl font-bold text-accent mb-1">{ent.broyUyazvimiLica}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Уязвими лица</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {ent.istoriyaNaUspeha && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-secondary" /> История на успеха
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{ent.istoriyaNaUspeha}</p>
                </div>
              )}
            </section>

            {(ent.producti || ent.uslugi) && (
              <section className="bg-background rounded-2xl p-6 md:p-8 shadow-sm border">
                <h2 className="text-xl font-bold mb-6">Продукти и Услуги</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {ent.producti && (
                    <div>
                      <h3 className="font-semibold text-lg border-b pb-2 mb-4">Продукти</h3>
                      <ul className="space-y-1.5">
                        {ent.producti.split(";").map((p, i) => p.trim() && (
                          <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                            <span className="text-primary mt-1">•</span> {p.trim()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {ent.uslugi && (
                    <div>
                      <h3 className="font-semibold text-lg border-b pb-2 mb-4">Услуги</h3>
                      <ul className="space-y-1.5">
                        {ent.uslugi.split(";").map((u, i) => u.trim() && (
                          <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                            <span className="text-primary mt-1">•</span> {u.trim()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <section className="bg-background rounded-2xl p-6 shadow-sm border">
              <h3 className="font-bold mb-4">Локация</h3>
              <p className="text-sm text-muted-foreground mb-4">{ent.adres || `${ent.grad}, обл. ${ent.oblast}`}</p>
              <div className="h-[250px] rounded-xl overflow-hidden border mb-4">
                <MapContainer center={[ent.lat, ent.lng]} zoom={14} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[ent.lat, ent.lng]} />
                </MapContainer>
              </div>
              {/* Brand mark */}
              <div className="flex flex-col items-center gap-2 pt-2 border-t mt-2">
                <img
                  src={`${BASE}/marka-sp.png`}
                  alt="Продукт на социално предприятие"
                  className="h-14 object-contain"
                />
              </div>

            {/* Social Innovation logo */}
            <div className="flex flex-col items-center gap-2 pt-3 border-t mt-1">
              <div className="w-full rounded-xl bg-[#1a3a5c] flex items-center justify-center py-3 px-4">
                <img
                  src={`${BASE}/social-innovation-logo.gif`}
                  alt="Социална иновация"
                  className="h-16 object-contain"
                />
              </div>
            </div>
            </section>

            <section className="bg-background rounded-2xl p-6 shadow-sm border">
              <h3 className="font-bold mb-4">Икономическа дейност</h3>
              <Badge variant="secondary" className="text-sm px-3 py-1 bg-secondary/10 text-secondary-foreground">{ent.ikonomicheskaDeynost}</Badge>
              {ent.godinaZastoyvane && (
                <div className="mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">Година на създаване</div>
                  <div className="font-semibold">{ent.godinaZastoyvane}</div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
