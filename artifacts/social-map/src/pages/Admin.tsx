import { useState } from "react";
import {
  useListEnterprises, useCreateEnterprise, useDeleteEnterprise, useUpdateEnterprise,
  useListEvents, useCreateEvent,
  getListEnterprisesQueryKey, getListEventsQueryKey, getGetEnterpriseQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, ShieldAlert, Pencil, Plus, X, Images, Upload } from "lucide-react";
import { EnterpriseInput, EventInput, Enterprise } from "@workspace/api-client-react/src/generated/api.schemas";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const OBLASTS = ["Varna", "Dobrich", "Shumen", "Targovishte"];
const KLAS = ["Klas A", "Klas A+"];
const DEYNOSTI = ["Производство", "Услуги", "Социални услуги", "Земеделие", "Обучения"];
const KAUZI = ["Хора с увреждания", "Деца и младежи", "Социално включване"];

function parseImages(raw?: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Maria4141") {
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

function EditEnterpriseDialog({ enterprise, onClose }: { enterprise: Enterprise; onClose: () => void }) {
  const queryClient = useQueryClient();
  const updateEnterprise = useUpdateEnterprise();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Enterprise>>({ ...enterprise });
  const [images, setImages] = useState<string[]>(parseImages(enterprise.images));
  const [newImageUrl, setNewImageUrl] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);
    try {
      const formData = new FormData();
      formData.append("file", file);
      setUploadProgress(40);
      const res = await fetch("/api/storage/uploads", { method: "POST", body: formData });
      setUploadProgress(90);
      if (!res.ok) throw new Error(await res.text());
      const { servingUrl } = await res.json();
      setImages((prev) => [...prev, servingUrl]);
      toast({ title: "Снимката е качена успешно" });
    } catch {
      toast({ title: "Грешка при качване на снимката", variant: "destructive" });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const field = (key: keyof Enterprise, label: string, required = false, type = "text") => (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}{required && " *"}</Label>
      <Input
        type={type}
        value={(formData[key] as string) ?? ""}
        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
        required={required}
        className="h-8 text-sm"
      />
    </div>
  );

  const addImage = () => {
    const url = newImageUrl.trim();
    if (url && !images.includes(url)) {
      setImages([...images, url]);
      setNewImageUrl("");
    }
  };

  const removeImage = (idx: number) => setImages(images.filter((_, i) => i !== idx));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const raw = {
        ...formData,
        lat: Number(formData.lat),
        lng: Number(formData.lng),
        broyZaeti: formData.broyZaeti != null ? Number(formData.broyZaeti) : undefined,
        broyUyazvimiLica: formData.broyUyazvimiLica != null ? Number(formData.broyUyazvimiLica) : undefined,
        godinaZastoyvane: formData.godinaZastoyvane != null ? Number(formData.godinaZastoyvane) : undefined,
        images: images.length > 0 ? JSON.stringify(images) : undefined,
      };
      // Zod UpdateEnterpriseBody uses .optional() (not .nullish()), so null must become undefined
      const payload = Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k, v === null ? undefined : v])
      );
      await updateEnterprise.mutateAsync({ id: enterprise.id, data: payload as Parameters<typeof updateEnterprise.mutateAsync>[0]["data"] });
      queryClient.invalidateQueries({ queryKey: getListEnterprisesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetEnterpriseQueryKey(enterprise.id) });
      toast({ title: "Предприятието е обновено успешно" });
      onClose();
    } catch (err) {
      toast({ title: "Грешка при обновяване", variant: "destructive" });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Редактиране: {enterprise.naimenovanie}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 min-h-0">
          <form id="edit-form" onSubmit={handleSave} className="space-y-5 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {field("naimenovanie", "Наименование", true)}
              {field("eik", "ЕИК")}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Област *</Label>
                <Select value={formData.oblast ?? ""} onValueChange={(v) => setFormData({ ...formData, oblast: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{OBLASTS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {field("grad", "Град", true)}
            </div>

            {field("adres", "Адрес")}

            <div className="grid grid-cols-2 gap-3">
              {field("lat", "Ширина (lat)", true, "number")}
              {field("lng", "Дължина (lng)", true, "number")}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Клас *</Label>
                <Select value={formData.klas ?? ""} onValueChange={(v) => setFormData({ ...formData, klas: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{KLAS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {field("pravnaForma", "Правна форма", true)}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Икономическа дейност *</Label>
                <Select value={formData.ikonomicheskaDeynost ?? ""} onValueChange={(v) => setFormData({ ...formData, ikonomicheskaDeynost: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{DEYNOSTI.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Социална кауза *</Label>
                <Select value={formData.socialnaKauza ?? ""} onValueChange={(v) => setFormData({ ...formData, socialnaKauza: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{KAUZI.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {field("celevnaGrupa", "Целева група", true)}

            <div className="space-y-1.5">
              <Label className="text-xs">Кратко описание *</Label>
              <Textarea
                value={formData.kratkoOpisanie ?? ""}
                onChange={(e) => setFormData({ ...formData, kratkoOpisanie: e.target.value })}
                rows={3} className="text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Мисия</Label>
              <Textarea value={formData.misiya ?? ""} onChange={(e) => setFormData({ ...formData, misiya: e.target.value })} rows={2} className="text-sm resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Продукти (разделени с ";")</Label>
                <Textarea value={formData.producti ?? ""} onChange={(e) => setFormData({ ...formData, producti: e.target.value })} rows={3} className="text-sm resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Услуги (разделени с ";")</Label>
                <Textarea value={formData.uslugi ?? ""} onChange={(e) => setFormData({ ...formData, uslugi: e.target.value })} rows={3} className="text-sm resize-none" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {field("telefon", "Телефон")}
              {field("email", "Имейл")}
              {field("website", "Уебсайт")}
            </div>
            {field("facebook", "Facebook URL")}

            <div className="grid grid-cols-3 gap-3">
              {field("broyZaeti", "Брой заети", false, "number")}
              {field("broyUyazvimiLica", "Уязвими лица", false, "number")}
              {field("godinaZastoyvane", "Год. на създаване", false, "number")}
            </div>

            {field("socialnaInovaciya", "Социална иновация")}
            
            <div className="space-y-1.5">
              <Label className="text-xs">История на успеха</Label>
              <Textarea value={formData.istoriyaNaUspeha ?? ""} onChange={(e) => setFormData({ ...formData, istoriyaNaUspeha: e.target.value })} rows={2} className="text-sm resize-none" />
            </div>

            {/* Images section */}
            <div className="space-y-3 border rounded-xl p-4 bg-muted/30">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Images className="w-4 h-4 text-primary" />
                Снимки
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
                  className="h-8 text-sm flex-1"
                />
                <Button type="button" size="sm" variant="outline" onClick={addImage} className="h-8 px-3" title="Добави URL">
                  <Plus className="w-4 h-4" />
                </Button>
                <label className="cursor-pointer" title="Качи файл от компютъра">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadFile(file);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 pointer-events-none"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <span className="text-xs">{uploadProgress}%</span>
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </Button>
                </label>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((url, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border bg-background aspect-square">
                      <img
                        src={url}
                        alt={`снимка ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {images.length === 0 && (
                <p className="text-xs text-muted-foreground">Добавете URL или качете файл от компютъра</p>
              )}
            </div>
          </form>
        </div>
        <DialogFooter className="pt-4 border-t mt-2 shrink-0">
          <Button variant="outline" onClick={onClose}>Отказ</Button>
          <Button type="submit" form="edit-form" disabled={updateEnterprise.isPending}>
            {updateEnterprise.isPending ? "Запазване..." : "Запази промените"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EnterprisesAdmin() {
  const queryClient = useQueryClient();
  const { data: enterprises, isLoading } = useListEnterprises();
  const deleteEnterprise = useDeleteEnterprise();
  const createEnterprise = useCreateEnterprise();
  const { toast } = useToast();
  const [editTarget, setEditTarget] = useState<Enterprise | null>(null);

  const [formData, setFormData] = useState<Partial<EnterpriseInput>>({
    naimenovanie: "", oblast: "", grad: "", klas: "", pravnaForma: "",
    ikonomicheskaDeynost: "", celevnaGrupa: "", socialnaKauza: "", kratkoOpisanie: "",
    lat: 43.21, lng: 27.92
  });

  const handleDelete = async (id: number) => {
    if (confirm("Сигурни ли сте, че искате да изтриете това предприятие?")) {
      try {
        await deleteEnterprise.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: getListEnterprisesQueryKey() });
        toast({ title: "Успешно изтрито предприятие" });
      } catch {
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
    } catch {
      toast({ title: "Грешка при създаване", variant: "destructive" });
    }
  };

  return (
    <>
      {editTarget && (
        <EditEnterpriseDialog enterprise={editTarget} onClose={() => setEditTarget(null)} />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Съществуващи предприятия ({enterprises?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Зареждане...</div>
            ) : enterprises?.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">Няма предприятия.</div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {enterprises?.map((ent) => (
                  <div key={ent.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{ent.naimenovanie}</div>
                      <div className="text-xs text-muted-foreground">{ent.grad}, {ent.oblast}</div>
                    </div>
                    <div className="flex gap-1.5 ml-2 shrink-0">
                      <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setEditTarget(ent as Enterprise)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="destructive" size="sm" className="h-7 px-2" onClick={() => handleDelete(ent.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
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
                  <Input required value={formData.naimenovanie} onChange={(e) => setFormData({ ...formData, naimenovanie: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Област</Label>
                  <Select value={formData.oblast} onValueChange={(v) => setFormData({ ...formData, oblast: v })}>
                    <SelectTrigger><SelectValue placeholder="Избери" /></SelectTrigger>
                    <SelectContent>{OBLASTS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Град</Label>
                  <Input required value={formData.grad} onChange={(e) => setFormData({ ...formData, grad: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Клас</Label>
                  <Select value={formData.klas} onValueChange={(v) => setFormData({ ...formData, klas: v })}>
                    <SelectTrigger><SelectValue placeholder="Избери" /></SelectTrigger>
                    <SelectContent>{KLAS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Правна форма</Label>
                  <Input required value={formData.pravnaForma} onChange={(e) => setFormData({ ...formData, pravnaForma: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Икономическа дейност</Label>
                  <Select value={formData.ikonomicheskaDeynost} onValueChange={(v) => setFormData({ ...formData, ikonomicheskaDeynost: v })}>
                    <SelectTrigger><SelectValue placeholder="Избери" /></SelectTrigger>
                    <SelectContent>{DEYNOSTI.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Целева група</Label>
                  <Input required value={formData.celevnaGrupa} onChange={(e) => setFormData({ ...formData, celevnaGrupa: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Социална кауза</Label>
                  <Select value={formData.socialnaKauza} onValueChange={(v) => setFormData({ ...formData, socialnaKauza: v })}>
                    <SelectTrigger><SelectValue placeholder="Избери" /></SelectTrigger>
                    <SelectContent>{KAUZI.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Кратко описание</Label>
                <Textarea required value={formData.kratkoOpisanie} onChange={(e) => setFormData({ ...formData, kratkoOpisanie: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">Създай</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function EventsAdmin() {
  const queryClient = useQueryClient();
  const { data: events, isLoading } = useListEvents();
  const createEvent = useCreateEvent();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<EventInput>>({
    zaglavia: "", data: new Date().toISOString().slice(0, 16), vid: "", opisanie: "", myasto: ""
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEvent.mutateAsync({ data: formData as EventInput });
      queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
      toast({ title: "Успешно създадено събитие" });
      setFormData({ zaglavia: "", data: new Date().toISOString().slice(0, 16), vid: "", opisanie: "", myasto: "" });
    } catch {
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
              <Input required value={formData.zaglavia} onChange={(e) => setFormData({ ...formData, zaglavia: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Дата и час</Label>
                <Input type="datetime-local" required value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Вид събитие</Label>
                <Input required value={formData.vid} onChange={(e) => setFormData({ ...formData, vid: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Място</Label>
              <Input value={formData.myasto} onChange={(e) => setFormData({ ...formData, myasto: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea required value={formData.opisanie} onChange={(e) => setFormData({ ...formData, opisanie: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Създай</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
