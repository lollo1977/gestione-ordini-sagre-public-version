import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  LineChart, Line,
} from "recharts";
import {
  CalendarDays, PlusCircle, Pencil, Trash2, TrendingUp, Users, Euro,
  ShoppingBag, ArrowLeftRight, ChevronRight, Save, X, AlertTriangle,
  Banknote, CreditCard, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAppSettings } from "@/hooks/use-app-settings";
import type { SagraEvent, EventStats, ComparisonData, InsertSagraEvent } from "@shared/schema";

type AnalyticsTab = "sessioni" | "report" | "confronto";

const PALETTE = ["#2563eb", "#16a34a", "#dc2626", "#d97706", "#7c3aed", "#0891b2"];

function formatHour(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ── Sessioni Tab ──────────────────────────────────────────────────────────────

interface EventFormData {
  name: string;
  date: string;
  notes: string;
}

const emptyForm = (): EventFormData => ({ name: "", date: new Date().toISOString().slice(0, 10), notes: "" });

function SessioniTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<EventFormData>(emptyForm());

  const { data: events = [], isLoading } = useQuery<SagraEvent[]>({
    queryKey: ["/api/sagra-events"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertSagraEvent) => apiRequest("POST", "/api/sagra-events", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/sagra-events"] });
      toast({ title: "Sessione creata" });
      setShowCreate(false);
      setForm(emptyForm());
    },
    onError: () => toast({ title: "Errore", description: "Creazione fallita", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertSagraEvent> }) =>
      apiRequest("PUT", `/api/sagra-events/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/sagra-events"] });
      toast({ title: "Sessione aggiornata" });
      setEditingId(null);
    },
    onError: () => toast({ title: "Errore", description: "Aggiornamento fallito", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/sagra-events/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/sagra-events"] });
      toast({ title: "Sessione eliminata" });
    },
    onError: () => toast({ title: "Errore", description: "Eliminazione fallita", variant: "destructive" }),
  });

  const startEdit = (ev: SagraEvent) => {
    setEditingId(ev.id);
    setForm({ name: ev.name, date: ev.date, notes: ev.notes ?? "" });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateMutation.mutate({ id: editingId, data: form });
  };

  const handleCreate = () => {
    if (!form.name || !form.date) {
      toast({ title: "Compila nome e data", variant: "destructive" });
      return;
    }
    createMutation.mutate(form);
  };

  const InlineForm = (
    <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Nome serata</Label>
          <Input
            data-testid="input-session-name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="es. Sabato 14 Giugno"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Data</Label>
          <Input
            data-testid="input-session-date"
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Note (opzionale)</Label>
        <Textarea
          data-testid="input-session-notes"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Meteo, note organizzative…"
          rows={2}
          className="mt-1 text-sm resize-none"
        />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={editingId ? saveEdit : handleCreate}
          disabled={createMutation.isPending || updateMutation.isPending}
          data-testid="button-session-save"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          {editingId ? "Salva modifiche" : "Crea sessione"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => { setShowCreate(false); setEditingId(null); setForm(emptyForm()); }}
          data-testid="button-session-cancel"
        >
          <X className="w-3.5 h-3.5 mr-1.5" />
          Annulla
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Registra ogni serata della sagra. I dati degli ordini vengono abbinati automaticamente in base alla data.
        </p>
        {!showCreate && !editingId && (
          <Button size="sm" onClick={() => { setShowCreate(true); setForm(emptyForm()); }} data-testid="button-new-session">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Nuova sessione
          </Button>
        )}
      </div>

      {showCreate && !editingId && InlineForm}

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-8">Caricamento…</p>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-400 space-y-2">
          <CalendarDays className="w-10 h-10 mx-auto opacity-40" />
          <p className="text-sm">Nessuna sessione ancora. Crea la prima!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map(ev => (
            <div key={ev.id} className="border rounded-xl bg-white p-4">
              {editingId === ev.id ? (
                InlineForm
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800" data-testid={`text-session-name-${ev.id}`}>{ev.name}</span>
                      <Badge variant="secondary" className="text-xs">{formatDate(ev.date)}</Badge>
                    </div>
                    {ev.notes && (
                      <p className="text-xs text-gray-500 mt-1">{ev.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(ev)}
                      data-testid={`button-edit-session-${ev.id}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" data-testid={`button-delete-session-${ev.id}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Elimina "{ev.name}"?</AlertDialogTitle>
                          <AlertDialogDescription>
                            <span className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              Gli ordini esistenti non verranno cancellati, solo la scheda della sessione.
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deleteMutation.mutate(ev.id)}
                          >
                            Elimina
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Report Tab ────────────────────────────────────────────────────────────────

function ReportTab() {
  const settings = useAppSettings();
  const sym = settings.currencySymbol;
  const [selectedId, setSelectedId] = useState<string>("");

  const { data: events = [] } = useQuery<SagraEvent[]>({ queryKey: ["/api/sagra-events"] });

  const { data: stats, isLoading: loadingStats } = useQuery<EventStats>({
    queryKey: ["/api/analytics/event", selectedId],
    enabled: !!selectedId,
    refetchInterval: 15000,
    staleTime: 0,
  });

  const hourlyWithGaps = stats ? buildHourlyFull(stats.hourlyStats) : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-72" data-testid="select-report-event">
            <SelectValue placeholder="Seleziona una serata…" />
          </SelectTrigger>
          <SelectContent>
            {events.map(ev => (
              <SelectItem key={ev.id} value={ev.id} data-testid={`option-event-${ev.id}`}>
                {ev.name} — {formatDate(ev.date)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {events.length === 0 && (
          <span className="text-sm text-gray-400">Crea prima una sessione nel tab "Sessioni"</span>
        )}
      </div>

      {!selectedId && (
        <div className="text-center py-16 text-gray-400 space-y-2">
          <TrendingUp className="w-12 h-12 mx-auto opacity-30" />
          <p className="text-sm">Seleziona una serata per vedere le statistiche</p>
        </div>
      )}

      {loadingStats && selectedId && (
        <p className="text-center text-gray-400 py-8">Caricamento statistiche…</p>
      )}

      {stats && !loadingStats && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryCard icon={<Euro className="w-5 h-5 text-green-600" />} label="Incasso totale" value={`${sym}${stats.totalRevenue.toFixed(2)}`} color="green" testId="text-event-revenue" />
            <SummaryCard icon={<ShoppingBag className="w-5 h-5 text-blue-600" />} label="Ordini" value={String(stats.totalOrders)} color="blue" testId="text-event-orders" />
            <SummaryCard icon={<Users className="w-5 h-5 text-purple-600" />} label="Coperti" value={String(stats.totalCovers)} color="purple" testId="text-event-covers" />
            <SummaryCard icon={<TrendingUp className="w-5 h-5 text-amber-600" />} label="Scontrino medio" value={`${sym}${stats.averageOrderValue.toFixed(2)}`} color="amber" testId="text-event-avg" />
          </div>

          {/* Hourly chart */}
          {hourlyWithGaps.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Andamento Orario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={hourlyWithGaps} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hourLabel" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="orders" orientation="left" tick={{ fontSize: 11 }} label={{ value: "Ordini", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
                    <YAxis yAxisId="revenue" orientation="right" tick={{ fontSize: 11 }} tickFormatter={v => `${sym}${v.toFixed(0)}`} />
                    <Tooltip
                      formatter={(val: number, name: string) =>
                        name === "Ordini" ? [val, "Ordini"] : [`${sym}${Number(val).toFixed(2)}`, "Incasso"]
                      }
                      labelFormatter={l => `Ore ${l}`}
                    />
                    <Legend />
                    <Bar yAxisId="orders" dataKey="orders" name="Ordini" fill="#2563eb" radius={[3, 3, 0, 0]} />
                    <Bar yAxisId="revenue" dataKey="revenue" name="Incasso" fill="#16a34a" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Payment methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-green-600" />
                  Metodi di Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <PaymentRow icon={<Banknote className="w-3.5 h-3.5" />} label={settings.cashLabel || "Contanti"} amount={stats.paymentStats.cash.amount} pct={stats.paymentStats.cash.percentage} sym={sym} color="green" />
                <PaymentRow icon={<CreditCard className="w-3.5 h-3.5" />} label={settings.posLabel || "POS"} amount={stats.paymentStats.pos.amount} pct={stats.paymentStats.pos.percentage} sym={sym} color="blue" />
              </CardContent>
            </Card>

            {/* Top dishes mini summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  Top 5 Piatti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {stats.dishSales.slice(0, 5).map((s, i) => (
                  <div key={s.dish.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ backgroundColor: PALETTE[i % PALETTE.length], color: "#fff" }}>{i + 1}</span>
                      <span className="truncate text-gray-700">{s.dish.name}</span>
                    </span>
                    <span className="text-gray-500 shrink-0 ml-2">×{s.quantity}</span>
                  </div>
                ))}
                {stats.dishSales.length === 0 && <p className="text-gray-400 text-sm">Nessun dato</p>}
              </CardContent>
            </Card>
          </div>

          {/* Full dish sales table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Vendite per Piatto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-gray-500 text-xs uppercase">
                      <th className="text-left py-2 px-2">Piatto</th>
                      <th className="text-right py-2 px-2">Categoria</th>
                      <th className="text-right py-2 px-2">Qtà</th>
                      <th className="text-right py-2 px-2">Ricavo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.dishSales.map(s => (
                      <tr key={s.dish.id} className="border-b last:border-0 hover:bg-gray-50" data-testid={`row-dish-${s.dish.id}`}>
                        <td className="py-2 px-2 font-medium">{s.dish.name}</td>
                        <td className="py-2 px-2 text-right text-gray-500">{s.dish.category}</td>
                        <td className="py-2 px-2 text-right font-semibold">{s.quantity}</td>
                        <td className="py-2 px-2 text-right text-green-700 font-semibold">{sym}{s.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                    {stats.dishSales.length === 0 && (
                      <tr><td colSpan={4} className="py-8 text-center text-gray-400">Nessuna vendita per questa data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ── Confronto Tab ─────────────────────────────────────────────────────────────

function ConfrontoTab() {
  const settings = useAppSettings();
  const sym = settings.currencySymbol;
  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");

  const { data: events = [] } = useQuery<SagraEvent[]>({ queryKey: ["/api/sagra-events"] });

  const canCompare = !!idA && !!idB && idA !== idB;
  const url = canCompare ? `/api/analytics/compare?a=${idA}&b=${idB}` : "";

  const { data: cmp, isLoading } = useQuery<ComparisonData>({
    queryKey: [url],
    enabled: canCompare,
    refetchInterval: 15000,
    staleTime: 0,
  });

  // Build all dish names across both events
  const allDishIds = cmp ? Array.from(new Set([
    ...cmp.eventA.dishSales.map(s => s.dish.id),
    ...cmp.eventB.dishSales.map(s => s.dish.id),
  ])) : [];

  const hourlyMerged = cmp ? buildHourlyMerged(cmp.eventA.hourlyStats, cmp.eventB.hourlyStats) : [];

  return (
    <div className="space-y-5">
      {/* Event selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">Serata A</Label>
          <Select value={idA} onValueChange={setIdA}>
            <SelectTrigger data-testid="select-compare-a">
              <SelectValue placeholder="Seleziona serata A…" />
            </SelectTrigger>
            <SelectContent>
              {events.map(ev => (
                <SelectItem key={ev.id} value={ev.id} disabled={ev.id === idB}>
                  {ev.name} — {formatDate(ev.date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">Serata B</Label>
          <Select value={idB} onValueChange={setIdB}>
            <SelectTrigger data-testid="select-compare-b">
              <SelectValue placeholder="Seleziona serata B…" />
            </SelectTrigger>
            <SelectContent>
              {events.map(ev => (
                <SelectItem key={ev.id} value={ev.id} disabled={ev.id === idA}>
                  {ev.name} — {formatDate(ev.date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {idA === idB && idA && (
        <p className="text-sm text-amber-600">Seleziona due serate diverse per confrontarle.</p>
      )}

      {!canCompare && (
        <div className="text-center py-16 text-gray-400 space-y-2">
          <ArrowLeftRight className="w-12 h-12 mx-auto opacity-30" />
          <p className="text-sm">Seleziona due serate per vedere il confronto</p>
        </div>
      )}

      {isLoading && canCompare && (
        <p className="text-center text-gray-400 py-8">Caricamento confronto…</p>
      )}

      {cmp && !isLoading && (
        <>
          {/* Summary comparison */}
          <div className="grid grid-cols-2 gap-3">
            <CompareHeader ev={cmp.eventA} color="blue" />
            <CompareHeader ev={cmp.eventB} color="green" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CompareMetric label="Incasso" a={`${sym}${cmp.eventA.totalRevenue.toFixed(2)}`} b={`${sym}${cmp.eventB.totalRevenue.toFixed(2)}`} diff={cmp.eventB.totalRevenue - cmp.eventA.totalRevenue} sym={sym} isRevenue />
            <CompareMetric label="Ordini" a={String(cmp.eventA.totalOrders)} b={String(cmp.eventB.totalOrders)} diff={cmp.eventB.totalOrders - cmp.eventA.totalOrders} sym="" />
            <CompareMetric label="Coperti" a={String(cmp.eventA.totalCovers)} b={String(cmp.eventB.totalCovers)} diff={cmp.eventB.totalCovers - cmp.eventA.totalCovers} sym="" />
            <CompareMetric label="Scontrino medio" a={`${sym}${cmp.eventA.averageOrderValue.toFixed(2)}`} b={`${sym}${cmp.eventB.averageOrderValue.toFixed(2)}`} diff={cmp.eventB.averageOrderValue - cmp.eventA.averageOrderValue} sym={sym} isRevenue />
          </div>

          {/* Hourly comparison chart */}
          {hourlyMerged.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Confronto Orario — Ordini
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={hourlyMerged} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hourLabel" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip labelFormatter={l => `Ore ${l}`} />
                    <Legend />
                    <Line type="monotone" dataKey="ordersA" name={cmp.eventA.event.name} stroke="#2563eb" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="ordersB" name={cmp.eventB.event.name} stroke="#16a34a" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Dish comparison table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Vendite per Piatto — Confronto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-gray-500">
                      <th className="text-left py-2 px-2">Piatto</th>
                      <th className="text-right py-2 px-2 text-blue-600">{cmp.eventA.event.name}</th>
                      <th className="text-right py-2 px-2 text-green-600">{cmp.eventB.event.name}</th>
                      <th className="text-right py-2 px-2">Differenza</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDishIds.map(dishId => {
                      const sA = cmp.eventA.dishSales.find(s => s.dish.id === dishId);
                      const sB = cmp.eventB.dishSales.find(s => s.dish.id === dishId);
                      const dish = sA?.dish ?? sB?.dish!;
                      const qA = sA?.quantity ?? 0;
                      const qB = sB?.quantity ?? 0;
                      const diff = qB - qA;
                      return (
                        <tr key={dishId} className="border-b last:border-0 hover:bg-gray-50" data-testid={`row-compare-${dishId}`}>
                          <td className="py-2 px-2 font-medium">{dish.name}</td>
                          <td className="py-2 px-2 text-right text-blue-700 font-semibold">{qA}</td>
                          <td className="py-2 px-2 text-right text-green-700 font-semibold">{qB}</td>
                          <td className={`py-2 px-2 text-right font-semibold ${diff > 0 ? "text-green-600" : diff < 0 ? "text-red-500" : "text-gray-400"}`}>
                            {diff > 0 ? `+${diff}` : diff === 0 ? "=" : diff}
                          </td>
                        </tr>
                      );
                    })}
                    {allDishIds.length === 0 && (
                      <tr><td colSpan={4} className="py-8 text-center text-gray-400">Nessun dato da confrontare</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ── Helper sub-components ─────────────────────────────────────────────────────

function SummaryCard({ icon, label, value, color, testId }: { icon: React.ReactNode; label: string; value: string; color: string; testId: string }) {
  const bg: Record<string, string> = { green: "bg-green-50", blue: "bg-blue-50", purple: "bg-purple-50", amber: "bg-amber-50" };
  return (
    <Card className={`${bg[color] ?? "bg-gray-50"}`}>
      <CardContent className="p-4 flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-800" data-testid={testId}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentRow({ icon, label, amount, pct, sym, color }: { icon: React.ReactNode; label: string; amount: number; pct: number; sym: string; color: string }) {
  const cls: Record<string, string> = { green: "text-green-700", blue: "text-blue-700" };
  return (
    <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg text-sm">
      <span className="flex items-center gap-1.5 font-medium text-gray-700">{icon}{label}</span>
      <span className={`font-bold ${cls[color] ?? ""}`}>{sym}{amount.toFixed(2)} <span className="text-gray-400 font-normal">({pct.toFixed(0)}%)</span></span>
    </div>
  );
}

function CompareHeader({ ev, color }: { ev: EventStats; color: "blue" | "green" }) {
  const cls = color === "blue" ? "border-blue-300 bg-blue-50" : "border-green-300 bg-green-50";
  const tcls = color === "blue" ? "text-blue-700" : "text-green-700";
  return (
    <div className={`border-2 rounded-xl p-3 ${cls}`}>
      <p className={`font-bold text-sm ${tcls}`}>{ev.event.name}</p>
      <p className="text-xs text-gray-500">{formatDate(ev.event.date)}</p>
    </div>
  );
}

function CompareMetric({ label, a, b, diff, sym, isRevenue }: { label: string; a: string; b: string; diff: number; sym: string; isRevenue?: boolean }) {
  const diffFmt = isRevenue
    ? `${diff >= 0 ? "+" : ""}${sym}${diff.toFixed(2)}`
    : `${diff >= 0 ? "+" : ""}${Math.round(diff)}`;
  const diffCls = diff > 0 ? "text-green-600" : diff < 0 ? "text-red-500" : "text-gray-400";

  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-blue-700 font-bold">{a}</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-green-700 font-bold">{b}</span>
          <span className={`text-xs font-semibold ml-auto ${diffCls}`}>{diffFmt}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Helper functions ──────────────────────────────────────────────────────────

function buildHourlyFull(hourlyStats: { hour: number; orders: number; revenue: number }[]) {
  if (hourlyStats.length === 0) return [];
  const minH = Math.min(...hourlyStats.map(h => h.hour));
  const maxH = Math.max(...hourlyStats.map(h => h.hour));
  const map = new Map(hourlyStats.map(h => [h.hour, h]));
  const result = [];
  for (let h = minH; h <= maxH; h++) {
    result.push({ hourLabel: formatHour(h), ...(map.get(h) ?? { hour: h, orders: 0, revenue: 0 }) });
  }
  return result;
}

function buildHourlyMerged(
  hA: { hour: number; orders: number; revenue: number }[],
  hB: { hour: number; orders: number; revenue: number }[],
) {
  const allHours = Array.from(new Set([...hA.map(h => h.hour), ...hB.map(h => h.hour)])).sort((a, b) => a - b);
  if (allHours.length === 0) return [];
  const mapA = new Map(hA.map(h => [h.hour, h]));
  const mapB = new Map(hB.map(h => [h.hour, h]));
  const minH = allHours[0];
  const maxH = allHours[allHours.length - 1];
  const result = [];
  for (let h = minH; h <= maxH; h++) {
    result.push({
      hourLabel: formatHour(h),
      ordersA: mapA.get(h)?.orders ?? 0,
      ordersB: mapB.get(h)?.orders ?? 0,
    });
  }
  return result;
}

// ── Main Analytics Component ──────────────────────────────────────────────────

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("sessioni");

  const tabs: { id: AnalyticsTab; label: string; icon: React.ReactNode }[] = [
    { id: "sessioni", label: "Sessioni", icon: <CalendarDays className="w-4 h-4" /> },
    { id: "report", label: "Report Serata", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "confronto", label: "Confronto", icon: <ArrowLeftRight className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Tab nav */}
      <div className="flex gap-1 border-b">
        {tabs.map(t => (
          <button
            key={t.id}
            data-testid={`tab-analytics-${t.id}`}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "sessioni" && <SessioniTab />}
      {activeTab === "report" && <ReportTab />}
      {activeTab === "confronto" && <ConfrontoTab />}
    </div>
  );
}
