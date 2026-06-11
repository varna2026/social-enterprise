import { useGetEvent } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowLeft, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function EventDetail() {
  const { id } = useParams();
  const { data: event, isLoading } = useGetEvent(Number(id), {
    query: { enabled: !!id }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Събитието не е намерено</h2>
        <Link href="/events">
          <Button variant="outline" className="mt-4">Назад към всички събития</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/events">
        <Button variant="ghost" size="sm" className="mb-6 -ml-3 text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Всички събития
        </Button>
      </Link>
      
      <div className="bg-background rounded-2xl p-6 md:p-8 shadow-sm border border-border">
        <div className="mb-6">
          <Badge className="bg-primary hover:bg-primary text-white mb-4 px-3 py-1">
            {event.vid}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {event.zaglavia}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 bg-muted/30 p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Дата и час</div>
                <div className="font-medium">{format(new Date(event.data), "dd.MM.yyyy HH:mm")}</div>
              </div>
            </div>
            
            {event.myasto && (
              <div className="flex items-center gap-3">
                <div className="bg-secondary/10 p-2 rounded-lg text-secondary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Място</div>
                  <div className="font-medium">{event.myasto}</div>
                </div>
              </div>
            )}

            {event.organizator && (
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 p-2 rounded-lg text-accent-foreground">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Организатор</div>
                  <div className="font-medium">{event.organizator}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
          <h3 className="text-xl font-bold mb-4">За събитието</h3>
          <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{event.opisanie}</p>
        </div>

        {event.linkRegistraciya && (
          <div className="pt-6 border-t border-border">
            <a href={event.linkRegistraciya} target="_blank" rel="noreferrer">
              <Button className="w-full sm:w-auto" size="lg">
                Регистрация за събитието
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
