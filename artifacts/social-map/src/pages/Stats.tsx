import { useGetEnterpriseStats, useGetEnterprisesByOblast, useGetEnterprisesBySector, useGetEnterprisesByKauza } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Building2, Users, HeartHandshake, Lightbulb, MapPin, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ['hsl(154, 44%, 38%)', 'hsl(217, 60%, 25%)', 'hsl(40, 85%, 60%)', 'hsl(350, 75%, 45%)', 'hsl(280, 45%, 55%)', 'hsl(200, 70%, 50%)', 'hsl(20, 80%, 50%)', 'hsl(180, 50%, 40%)'];

export default function Stats() {
  const { data: stats, isLoading: isLoadingStats } = useGetEnterpriseStats();
  const { data: byOblast, isLoading: isLoadingOblast } = useGetEnterprisesByOblast();
  const { data: bySector, isLoading: isLoadingSector } = useGetEnterprisesBySector();
  const { data: byKauza, isLoading: isLoadingKauza } = useGetEnterprisesByKauza();

  const isLoading = isLoadingStats || isLoadingOblast || isLoadingSector || isLoadingKauza;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Статистика и анализи</h1>
        <p className="text-muted-foreground mt-1">Обобщени данни за социалното предприемачество в Североизточен район.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard isLoading={isLoadingStats} value={stats?.totalEnterprises} label="Предприятия" icon={Building2} />
        <StatCard isLoading={isLoadingStats} value={stats?.totalZaeti} label="Заети лица" icon={Users} />
        <StatCard isLoading={isLoadingStats} value={stats?.totalUyazvimiLica} label="Уязвими лица" icon={HeartHandshake} />
        <StatCard isLoading={isLoadingStats} value={stats?.totalKauzi} label="Социални каузи" icon={MapPin} />
        <StatCard isLoading={isLoadingStats} value={stats?.totalInovacii} label="Иновации" icon={Lightbulb} />
        <StatCard isLoading={isLoadingStats} value={stats?.totalSabytiya} label="Събития" icon={CalendarDays} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Разпределение по области</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingOblast ? (
              <Skeleton className="h-[300px] w-full" />
            ) : byOblast && byOblast.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byOblast}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="oblast"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {byOblast.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Няма данни</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Топ сектори</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSector ? (
              <Skeleton className="h-[300px] w-full" />
            ) : bySector && bySector.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bySector.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="sector" type="category" width={100} tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Няма данни</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Водещи социални каузи</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingKauza ? (
              <Skeleton className="h-[300px] w-full" />
            ) : byKauza && byKauza.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byKauza.slice(0, 8)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="kauza" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Няма данни</div>
            )}
          </CardContent>
        </Card>
      </div>
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
