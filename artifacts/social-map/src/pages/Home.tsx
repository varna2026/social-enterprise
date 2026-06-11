import { useGetEnterpriseStats } from "@workspace/api-client-react";
import HomeMap from "@/components/map/HomeMap";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin, ArrowRight, HeartHandshake } from "lucide-react";

export default function Home() {
  const { data: stats, isLoading } = useGetEnterpriseStats();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const selectedId = params.get("id") ? Number(params.get("id")) : null;

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Hero Section */}
      <section className="bg-secondary text-secondary-foreground py-14 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              Интерактивна карта на социалните предприятия
            </h1>
            <p className="text-lg text-secondary-foreground/80 mb-8 leading-relaxed">
              Открийте социалните предприятия в Североизточен район — Варна, Добрич, Шумен и Търговище. Намерете техните продукти, услуги, контакти и социална кауза.
            </p>
            <Link href="/enterprises">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8">
                Разгледай предприятията
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard isLoading={isLoading} value={stats?.totalEnterprises} label="Социални предприятия" icon={Building2} />
          <StatCard isLoading={isLoading} value={4} label="Области в региона" icon={MapPin} />
          <StatCard isLoading={isLoading} value={stats?.totalKauzi} label="Социални каузи" icon={HeartHandshake} />
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-5 gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-1 text-foreground">Карта на региона</h2>
            <p className="text-muted-foreground text-sm">Кликнете върху маркер, за да видите информация за предприятието</p>
          </div>
          <Link href="/enterprises">
            <Button variant="ghost" size="sm" className="text-primary group">
              Списъчен изглед <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        <div className="h-[600px] w-full rounded-2xl overflow-hidden border-2 border-border shadow-lg">
          <HomeMap selectedId={selectedId} />
        </div>
      </section>
    </div>
  );
}

function StatCard({ isLoading, value, label, icon: Icon }: { isLoading: boolean; value?: number; label: string; icon: any }) {
  return (
    <Card className="border-none shadow-md bg-card">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
          <Icon className="w-6 h-6" />
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-16 mb-2" />
        ) : (
          <div className="text-3xl font-bold text-foreground mb-1">{value ?? 0}</div>
        )}
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
      </CardContent>
    </Card>
  );
}
