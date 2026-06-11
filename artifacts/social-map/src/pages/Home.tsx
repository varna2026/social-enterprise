import { useGetEnterpriseStats } from "@workspace/api-client-react";
import HomeMap from "@/components/map/HomeMap";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, HeartHandshake, Lightbulb, MapPin, CalendarDays, ArrowRight } from "lucide-react";

export default function Home() {
  const { data: stats, isLoading } = useGetEnterpriseStats();

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Section */}
      <section className="bg-secondary text-secondary-foreground py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Интерактивна карта на социалните предприятия
            </h1>
            <p className="text-lg lg:text-xl text-secondary-foreground/80 mb-8 leading-relaxed">
              Дигитален атлас, свързващ граждани, организации и общини със социалните предприятия в Североизточен район (Варна, Добрич, Шумен, Търговище).
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/enterprises">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8">
                  Разгледай предприятията
                </Button>
              </Link>
              <Link href="/stats">
                <Button size="lg" variant="outline" className="bg-transparent border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10 font-semibold">
                  Статистика и анализи
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard isLoading={isLoading} value={stats?.totalEnterprises} label="Предприятия" icon={Building2} />
          <StatCard isLoading={isLoading} value={stats?.totalZaeti} label="Заети лица" icon={Users} />
          <StatCard isLoading={isLoading} value={stats?.totalUyazvimiLica} label="Уязвими лица" icon={HeartHandshake} />
          <StatCard isLoading={isLoading} value={stats?.totalKauzi} label="Социални каузи" icon={MapPin} />
          <StatCard isLoading={isLoading} value={stats?.totalInovacii} label="Иновации" icon={Lightbulb} />
          <StatCard isLoading={isLoading} value={stats?.totalSabytiya} label="Събития" icon={CalendarDays} />
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Карта на региона</h2>
            <p className="text-muted-foreground">Открийте социални предприятия във вашата област</p>
          </div>
          <Link href="/enterprises">
            <Button variant="ghost" className="text-primary group">
              Списъчен изглед <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        <div className="h-[600px] w-full rounded-2xl overflow-hidden border-2 border-border shadow-lg">
          <HomeMap />
        </div>
      </section>
    </div>
  );
}

function StatCard({ isLoading, value, label, icon: Icon }: any) {
  return (
    <Card className="border-none shadow-md bg-card">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
          <Icon className="w-6 h-6" />
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-16 mb-2" />
        ) : (
          <div className="text-3xl font-bold text-foreground mb-1">{value || 0}</div>
        )}
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
      </CardContent>
    </Card>
  );
}
