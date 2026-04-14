import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save, Plus, Trash2, Settings2, Printer, Tag, Globe,
  CreditCard, MessageSquare, Palette, Monitor, ShieldCheck, ShieldOff, KeyRound,
  Download, Upload, AlertTriangle, CheckCircle2, HardDrive
} from "lucide-react";
import { exportBackup, importBackup } from "@/lib/backup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useLicense } from "@/hooks/use-license";
import type { AppSettings } from "@shared/schema";

const PAPER_SIZES = ["58mm", "80mm", "72mm"];

const LOCALES = [
  { value: "it-IT", label: "Italiano (it-IT)" },
  { value: "en-GB", label: "English UK (en-GB)" },
  { value: "en-US", label: "English US (en-US)" },
  { value: "de-DE", label: "Deutsch (de-DE)" },
  { value: "fr-FR", label: "Français (fr-FR)" },
  { value: "es-ES", label: "Español (es-ES)" },
];

function ColorSwatch({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="w-7 h-7 rounded-md border border-gray-200 shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs text-gray-500 font-mono">{color}</span>
    </div>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const current = useAppSettings();
  const { isPro, activateLicense, revokeLicense } = useLicense();

  const [form, setForm] = useState<AppSettings>({ ...current });
  const [newCatKey, setNewCatKey] = useState("");
  const [newCatLabel, setNewCatLabel] = useState("");
  const [licenseCode, setLicenseCode] = useState("");
  const [backupExporting, setBackupExporting] = useState(false);
  const [backupImporting, setBackupImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm({ ...current });
  }, [current.eventName]);

  const saveMutation = useMutation({
    mutationFn: async (settings: AppSettings) => {
      const res = await apiRequest("PUT", "/api/settings", settings);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/settings"], data);
      toast({ title: "Impostazioni salvate", description: "Le modifiche sono attive su tutte le casse." });
    },
    onError: () => {
      toast({ title: "Errore", description: "Impossibile salvare le impostazioni.", variant: "destructive" });
    },
  });

  const set = (field: keyof AppSettings, value: string | number) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const setBool = (field: keyof AppSettings, value: boolean) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const updateCategoryLabel = (key: string, label: string) => {
    setForm(f => ({ ...f, dishCategories: { ...f.dishCategories, [key]: label } }));
  };

  const removeCategory = (key: string) => {
    setForm(f => {
      const cats = { ...f.dishCategories };
      delete cats[key];
      return { ...f, dishCategories: cats };
    });
  };

  const addCategory = () => {
    const key = newCatKey.trim().toLowerCase().replace(/\s+/g, "_");
    const label = newCatLabel.trim();
    if (!key || !label) {
      toast({ title: "Dati mancanti", description: "Inserisci chiave e nome categoria.", variant: "destructive" });
      return;
    }
    if (form.dishCategories[key]) {
      toast({ title: "Chiave già esistente", description: `La chiave "${key}" è già in uso.`, variant: "destructive" });
      return;
    }
    setForm(f => ({ ...f, dishCategories: { ...f.dishCategories, [key]: label } }));
    setNewCatKey("");
    setNewCatLabel("");
  };

  const handleActivateLicense = async () => {
    const ok = await activateLicense(licenseCode);
    if (ok) {
      toast({ title: "✅ Licenza PRO attivata", description: "Tutte le funzioni PRO sono ora disponibili." });
      setLicenseCode("");
    } else {
      toast({ title: "Codice non valido", description: "Il codice inserito non corrisponde al nome della sagra.", variant: "destructive" });
    }
  };

  const handleRevoke = () => {
    revokeLicense();
    toast({ title: "Licenza disattivata", description: "L'app è tornata alla versione Free." });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* ── Licenza ───────────────────────────────────────────── */}
      <Card className={`rounded-xl shadow-sm border ${isPro ? "border-green-200 bg-green-50" : "bg-white"}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-800">
            <span className="flex items-center">
              <KeyRound className={`mr-2 ${isPro ? "text-green-600" : "text-gray-400"}`} />
              Licenza
            </span>
            {isPro
              ? <Badge className="bg-green-600 text-white"><ShieldCheck className="w-3 h-3 mr-1" />PRO</Badge>
              : <Badge variant="secondary"><ShieldOff className="w-3 h-3 mr-1" />Free</Badge>
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPro ? (
            <div className="space-y-3">
              <p className="text-sm text-green-700 font-medium">
                Versione PRO attiva — tutte le funzioni sono sbloccate.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRevoke}
                className="text-red-600 border-red-200 hover:bg-red-50"
                data-testid="button-revokeLicense"
              >
                Disattiva licenza PRO
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Inserisci il codice di attivazione per sbloccare la versione PRO e rimuovere il branding Luna Wolfie.
              </p>
              <div className="flex gap-2">
                <Input
                  value={licenseCode}
                  onChange={e => setLicenseCode(e.target.value)}
                  placeholder="Codice di attivazione"
                  className="flex-1 font-mono text-sm"
                  onKeyDown={e => e.key === "Enter" && handleActivateLicense()}
                  data-testid="input-licenseCode"
                />
                <Button
                  onClick={handleActivateLicense}
                  className="bg-primary hover:bg-blue-700 text-white shrink-0"
                  data-testid="button-activateLicense"
                >
                  Attiva
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Informazioni Evento ───────────────────────────────── */}
      <Card className="bg-white rounded-xl shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Settings2 className="mr-2 text-primary" />
            Informazioni Evento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="eventName">Nome breve <span className="text-gray-400 font-normal">(intestazione scontrini e report)</span></Label>
            <Input
              id="eventName"
              data-testid="input-eventName"
              value={form.eventName}
              onChange={e => set("eventName", e.target.value)}
              placeholder="Nome breve evento"
              className="mt-1"
            />
            {isPro && form.eventName !== current.eventName && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Cambiare il nome della sagra invaliderà la licenza PRO al salvataggio.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="eventFullName">Nome completo <span className="text-gray-400 font-normal">(sottotitolo scontrino cliente)</span></Label>
            <Input
              id="eventFullName"
              data-testid="input-eventFullName"
              value={form.eventFullName}
              onChange={e => set("eventFullName", e.target.value)}
              placeholder="Nome completo evento"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="appTitle">Titolo dell'app <span className="text-gray-400 font-normal">(intestazione principale)</span></Label>
            <Input
              id="appTitle"
              data-testid="input-appTitle"
              value={form.appTitle}
              onChange={e => set("appTitle", e.target.value)}
              placeholder="Titolo app"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Casse e Interfaccia ───────────────────────────────── */}
      <Card className="bg-white rounded-xl shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Monitor className="mr-2 text-primary" />
            Casse e Interfaccia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Numero di casse attive <span className="text-gray-400 font-normal">(1 – 4)</span></Label>
            <Select value={String(form.numberOfRegisters)} onValueChange={v => set("numberOfRegisters", Number(v))}>
              <SelectTrigger className="mt-1 w-32" data-testid="select-numberOfRegisters">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map(n => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tableLabel">Etichetta tavolo</Label>
              <Input id="tableLabel" data-testid="input-tableLabel" value={form.tableLabel} onChange={e => set("tableLabel", e.target.value)} placeholder="Tavolo" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="customerLabel">Etichetta cliente</Label>
              <Input id="customerLabel" data-testid="input-customerLabel" value={form.customerLabel} onChange={e => set("customerLabel", e.target.value)} placeholder="Cliente" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="coversLabel">Etichetta coperti</Label>
              <Input id="coversLabel" data-testid="input-coversLabel" value={form.coversLabel} onChange={e => set("coversLabel", e.target.value)} placeholder="Coperti" className="mt-1" />
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Campi visibili nel form ordine</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="showTableNumber" className="cursor-pointer">Numero tavolo</Label>
                <Switch
                  id="showTableNumber"
                  data-testid="switch-showTableNumber"
                  checked={form.showTableNumber}
                  onCheckedChange={v => setBool("showTableNumber", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showCustomerName" className="cursor-pointer">Nome cliente</Label>
                <Switch
                  id="showCustomerName"
                  data-testid="switch-showCustomerName"
                  checked={form.showCustomerName}
                  onCheckedChange={v => setBool("showCustomerName", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showCovers" className="cursor-pointer">Numero coperti</Label>
                <Switch
                  id="showCovers"
                  data-testid="switch-showCovers"
                  checked={form.showCovers}
                  onCheckedChange={v => setBool("showCovers", v)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Metodi di Pagamento ───────────────────────────────── */}
      <Card className="bg-white rounded-xl shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <CreditCard className="mr-2 text-primary" />
            Metodi di Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cashLabel">Contanti</Label>
              <Input id="cashLabel" data-testid="input-cashLabel" value={form.cashLabel} onChange={e => set("cashLabel", e.target.value)} placeholder="Contanti" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="posLabel">POS / Carta</Label>
              <Input id="posLabel" data-testid="input-posLabel" value={form.posLabel} onChange={e => set("posLabel", e.target.value)} placeholder="POS" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="extraPaymentLabel">Terzo metodo <span className="text-gray-400 font-normal">(vuoto = off)</span></Label>
              <Input id="extraPaymentLabel" data-testid="input-extraPaymentLabel" value={form.extraPaymentLabel} onChange={e => set("extraPaymentLabel", e.target.value)} placeholder="Terzo metodo di pagamento" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Messaggi Scontrino ────────────────────────────────── */}
      <Card className="bg-white rounded-xl shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <MessageSquare className="mr-2 text-primary" />
            Messaggi Scontrino
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="kitchenReceiptMessage">Messaggio scontrino cucina</Label>
            <Textarea id="kitchenReceiptMessage" data-testid="input-kitchenReceiptMessage" value={form.kitchenReceiptMessage} onChange={e => set("kitchenReceiptMessage", e.target.value)} placeholder="Buon lavoro! 🍽️" className="mt-1 resize-none" rows={2} />
          </div>
          <div>
            <Label htmlFor="customerReceiptMessage">Messaggio scontrino cliente</Label>
            <Textarea id="customerReceiptMessage" data-testid="input-customerReceiptMessage" value={form.customerReceiptMessage} onChange={e => set("customerReceiptMessage", e.target.value)} placeholder="Grazie per la vostra visita! 🎉" className="mt-1 resize-none" rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* ── Colori Tema ───────────────────────────────────────── */}
      <Card className="bg-white rounded-xl shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Palette className="mr-2 text-primary" />
            Colori Tema
            {!isPro && (
              <Badge variant="secondary" className="ml-2 text-xs">PRO</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isPro && (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
              🔒 La personalizzazione completa dei colori è disponibile nella versione PRO.
            </p>
          )}
          <div className={`grid grid-cols-3 gap-4 ${!isPro ? "opacity-50 pointer-events-none select-none" : ""}`}>
            <div>
              <Label htmlFor="primaryColor">Colore principale</Label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={form.primaryColor} onChange={e => set("primaryColor", e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-gray-200 p-0.5 bg-white" data-testid="input-primaryColor-picker" />
                <Input id="primaryColor" data-testid="input-primaryColor" value={form.primaryColor} onChange={e => set("primaryColor", e.target.value)} placeholder="#2094f3" className="font-mono text-sm" maxLength={7} />
              </div>
              <ColorSwatch color={form.primaryColor} />
            </div>
            <div>
              <Label htmlFor="secondaryColor">Colore secondario</Label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={form.secondaryColor} onChange={e => set("secondaryColor", e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-gray-200 p-0.5 bg-white" data-testid="input-secondaryColor-picker" />
                <Input id="secondaryColor" data-testid="input-secondaryColor" value={form.secondaryColor} onChange={e => set("secondaryColor", e.target.value)} placeholder="#43a047" className="font-mono text-sm" maxLength={7} />
              </div>
              <ColorSwatch color={form.secondaryColor} />
            </div>
            <div>
              <Label htmlFor="accentColor">Colore accento</Label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={form.accentColor} onChange={e => set("accentColor", e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-gray-200 p-0.5 bg-white" data-testid="input-accentColor-picker" />
                <Input id="accentColor" data-testid="input-accentColor" value={form.accentColor} onChange={e => set("accentColor", e.target.value)} placeholder="#f57c00" className="font-mono text-sm" maxLength={7} />
              </div>
              <ColorSwatch color={form.accentColor} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Formato e Stampa ──────────────────────────────────── */}
      <Card className="bg-white rounded-xl shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Printer className="mr-2 text-primary" />
            Formato e Stampa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency">Simbolo valuta</Label>
              <Input id="currency" data-testid="input-currencySymbol" value={form.currencySymbol} onChange={e => set("currencySymbol", e.target.value)} placeholder="€" className="mt-1 max-w-[80px]" maxLength={4} />
            </div>
            <div>
              <Label>Carta stampante termica</Label>
              <Select value={form.printerPaperSize} onValueChange={v => set("printerPaperSize", v)}>
                <SelectTrigger className="mt-1" data-testid="select-printerPaperSize"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAPER_SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Formato data e ora (locale)</Label>
            <Select value={form.locale} onValueChange={v => set("locale", v)}>
              <SelectTrigger className="mt-1" data-testid="select-locale"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LOCALES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── Categorie Menù ────────────────────────────────────── */}
      <Card className="bg-white rounded-xl shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Tag className="mr-2 text-primary" />
            Categorie Menù
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">
            Attenzione: se elimini una categoria già assegnata ai piatti, quei piatti perderanno la categoria.
          </p>
          {Object.entries(form.dishCategories).map(([key, label]) => (
            <div key={key} className="flex items-center gap-3">
              <div className="w-32 shrink-0">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{key}</code>
              </div>
              <Input value={label} onChange={e => updateCategoryLabel(key, e.target.value)} className="flex-1" data-testid={`input-category-${key}`} />
              <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0" onClick={() => removeCategory(key)} data-testid={`button-removeCategory-${key}`}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="border-t pt-3 mt-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Aggiungi categoria</p>
            <div className="flex items-center gap-3">
              <Input value={newCatKey} onChange={e => setNewCatKey(e.target.value)} placeholder="chiave" className="w-36 text-sm" data-testid="input-newCatKey" />
              <Input value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)} placeholder="Nome visualizzato" className="flex-1 text-sm" onKeyDown={e => e.key === "Enter" && addCategory()} data-testid="input-newCatLabel" />
              <Button type="button" variant="outline" size="sm" onClick={addCategory} className="shrink-0" data-testid="button-addCategory">
                <Plus className="w-4 h-4 mr-1" />
                Aggiungi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Backup e Ripristino ───────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base font-semibold text-gray-800">
            <HardDrive className="mr-2 text-primary w-4 h-4" />
            Backup e Ripristino
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Export */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Esporta Configurazione</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Salva un file JSON con tutte le impostazioni (nome sagra, menù, prezzi, stato licenza).
              Utile per ripristinare il sistema o configurare più casse con gli stessi dati.
            </p>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 border-primary text-primary hover:bg-primary/5"
              disabled={backupExporting}
              data-testid="button-exportBackup"
              onClick={async () => {
                setBackupExporting(true);
                try {
                  await exportBackup(form.eventName || "sagra");
                  toast({ title: "Backup scaricato", description: "Il file è stato salvato con successo." });
                } catch {
                  toast({ title: "Errore export", description: "Impossibile generare il backup.", variant: "destructive" });
                } finally {
                  setBackupExporting(false);
                }
              }}
            >
              <Download className="w-4 h-4" />
              {backupExporting ? "Generazione..." : "Scarica Backup Configurazione"}
            </Button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Import */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Ripristina da Backup</p>
            {/* Warning */}
            <div className="flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Attenzione:</strong> l'importazione di un file di backup sovrascriverà tutti i dati attuali (impostazioni e menù). L'operazione è irreversibile.
              </p>
            </div>

            {importStatus === "success" && (
              <div className="flex gap-2 items-center bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-xs text-green-700">Configurazione ripristinata con successo! Ricarica in corso...</p>
              </div>
            )}
            {importStatus === "error" && (
              <p className="text-xs text-red-500">{importError}</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              data-testid="input-importBackup"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setBackupImporting(true);
                setImportStatus("idle");
                setImportError("");
                try {
                  setImportStatus("success");
                  await importBackup(file);
                } catch (err: unknown) {
                  setImportStatus("error");
                  setImportError(err instanceof Error ? err.message : "Errore sconosciuto durante l'importazione.");
                  setBackupImporting(false);
                }
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              disabled={backupImporting}
              data-testid="button-importBackup"
              onClick={() => {
                setImportStatus("idle");
                setImportError("");
                fileInputRef.current?.click();
              }}
            >
              <Upload className="w-4 h-4" />
              {backupImporting ? "Importazione in corso..." : "Ripristina da Backup"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Salva ─────────────────────────────────────────────── */}
      <div className="flex justify-end pb-6">
        <Button
          className="bg-primary hover:bg-blue-700 text-white px-8"
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending}
          data-testid="button-saveSettings"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? "Salvataggio..." : "Salva Impostazioni"}
        </Button>
      </div>
    </div>
  );
}
