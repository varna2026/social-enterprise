import { useState } from "react";
import { useListEnterprises, useCreateEnterprise, useDeleteEnterprise, useListEvents, useCreateEvent, getListEnterprisesQueryKey, getListEventsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, ShieldAlert } from "lucide-react";
import { EnterpriseInput, EventInput } from "@workspace/api-client-react/src/generated/api.schemas";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("Грешна парола");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl">Администраторски панел</CardTitle>
            <CardDescription>Въведете парола за достъп</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Парола"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" className="w-full">Вход</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Управление</h1>
          <p className="text-muted-foreground mt-1">Редактиране на предприятия и събития</p>
        </div>
        <Button variant="outline" onClick={() => setIsAuthenticated(false)}>Изход</Button>
      </div>

      <Tabs defaultValue="enterprises" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 max-w-[400px]">
          <TabsTrigger value="enterprises">Предприятия</TabsTrigger>
          <TabsTrigger value="events">Събития</TabsTrigger>
        </TabsList>
        
        <TabsContent value="enterprises">
          <EnterprisesAdmin />
        </TabsContent>
        
        <TabsContent value="events">
          <EventsAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const OBLASTS = ["Varna", "Dobrich", "Shumen", "Targovishte"];
const KLAS = ["Klas A", "Klas A+"];

function EnterprisesAdmin() {
  const queryClient = useQueryClient();
  const { data: enterprises, isLoading } = useListEnterprises();
  const deleteEnterprise = useDeleteEnterprise();
  const createEnterprise = useCreateEnterprise();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<EnterpriseInput>>({
    naimenovanie: "",
    oblast: "",
    grad: "",
    klas: "",
    pravnaForma: "",
    ikonomicheskaDeynost: "",
    celevnaGrupa: "",
    socialnaKauza: "",
    kratkoOpisanie: "",
    lat: 43.21,
    lng: 27.92
  });

  const handleDelete = async (id: number) => {
    if (confirm("Сигурни ли сте, че искате да изтриете това предприятие?")) {
      try {
        await deleteEnterprise.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: getListEnterprisesQueryKey() });
        toast({ title: "Успешно изтрито предприятие" });
      } catch (error) {
        toast({ title: "Грешка при изтриване", variant: "destructive" });
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEnterprise.mutateAsync({ data: formData as EnterpriseInput });
      queryClient.invalidateQueries({ queryKey: getListEnterprisesQueryKey() });
      toast({ title: "Успешно създадено предприятие" });
      setFormData({
        naimenovanie: "", oblast: "", grad: "", klas: "", pravnaForma: "",
        ikonomicheskaDeynost: "", celevnaGrupa: "", socialnaKauza: "", kratkoOpisanie: "",
        lat: 43.21, lng: 27.92
      });
    } catch (error) {
      toast({ title: "Грешка при създаване", variant: "destructive" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Съществуващи предприятия</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Зареждане...</div>
          ) : enterprises?.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">Няма предприятия.</div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {enterprises?.map((ent) => (
                <div key={ent.id} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg border border-border">
                  <div>
                    <div className="font-medium">{ent.naimenovanie}</div>
                    <div className="text-sm text-muted-foreground">{ent.grad}, {ent.oblast}</div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(ent.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Добавяне на предприятие</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Наименование</Label>
                <Input required value={formData.naimenovanie} onChange={(e) => setFormData({...formData, naimenovanie: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Област</Label>
                <Select value={formData.oblast} onValueChange={(v) => setFormData({...formData, oblast: v})}>
                  <SelectTrigger><SelectValue placeholder="Избери" /></SelectTrigger>
                  <SelectContent>
                    {OBLASTS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Град</Label>
                <Input required value={formData.grad} onChange={(e) => setFormData({...formData, grad: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Клас</Label>
                <Select value={formData.klas} onValueChange={(v) => setFormData({...formData, klas: v})}>
                  <SelectTrigger><SelectValue placeholder="Избери" /></SelectTrigger>
                  <SelectContent>
                    {KLAS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Правна форма</Label>
                <Input required value={formData.pravnaForma} onChange={(e) => setFormData({...formData, pravnaForma: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Икономическа дейност</Label>
                <Input required value={formData.ikonomicheskaDeynost} onChange={(e) => setFormData({...formData, ikonomicheskaDeynost: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Целева група</Label>
                <Input required value={formData.celevnaGrupa} onChange={(e) => setFormData({...formData, celevnaGrupa: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Социална кауза</Label>
                <Input required value={formData.socialnaKauza} onChange={(e) => setFormData({...formData, socialnaKauza: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Кратко описание</Label>
              <Textarea required value={formData.kratkoOpisanie} onChange={(e) => setFormData({...formData, kratkoOpisanie: e.target.value})} />
            </div>
            <Button type="submit" className="w-full">Създай</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function EventsAdmin() {
  const queryClient = useQueryClient();
  const { data: events, isLoading } = useListEvents();
  const createEvent = useCreateEvent();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<EventInput>>({
    zaglavia: "",
    data: new Date().toISOString().slice(0, 16),
    vid: "",
    opisanie: "",
    myasto: ""
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEvent.mutateAsync({ data: formData as EventInput });
      queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
      toast({ title: "Успешно създадено събитие" });
      setFormData({
        zaglavia: "", data: new Date().toISOString().slice(0, 16), vid: "", opisanie: "", myasto: ""
      });
    } catch (error) {
      toast({ title: "Грешка при създаване", variant: "destructive" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Съществуващи събития</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Зареждане...</div>
          ) : events?.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">Няма събития.</div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {events?.map((ev) => (
                <div key={ev.id} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg border border-border">
                  <div>
                    <div className="font-medium">{ev.zaglavia}</div>
                    <div className="text-sm text-muted-foreground">{new Date(ev.data).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Добавяне на събитие</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Заглавие</Label>
              <Input required value={formData.zaglavia} onChange={(e) => setFormData({...formData, zaglavia: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Дата и час</Label>
                <Input type="datetime-local" required value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Вид събитие</Label>
                <Input required value={formData.vid} onChange={(e) => setFormData({...formData, vid: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Място</Label>
              <Input value={formData.myasto} onChange={(e) => setFormData({...formData, myasto: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea required value={formData.opisanie} onChange={(e) => setFormData({...formData, opisanie: e.target.value})} />
            </div>
            <Button type="submit" className="w-full">Създай</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
