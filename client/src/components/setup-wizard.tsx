import { useState } from "react";
import { ChevronRight, ChevronLeft, Plus, Trash2, Check, Moon, Sparkles, ShieldCheck, Utensils, Euro, CreditCard, Download, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { exportBackup } from "@/lib/backup";
import type { AppSettings } from "@shared/schema";
import { CONFIG } from "@shared/config";
import { buildLicenseCode } from "@/lib/license";

const LS_SETUP = "luna_wolfie_setup_complete";
const LS_PRO = "luna_wolfie_is_pro";
const LS_EVENT = "luna_wolfie_licensed_event";

const DEFAULT_CATEGORIES = CONFIG.dishCategories;

type PaymentMode = "cash" | "pos" | "both";

type WizardDish = { name: string; price: string; category: string };

export function isSetupComplete(): boolean {
  return localStorage.getItem(LS_SETUP) === "true";
}

// ── Progress bar ─────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>Step {step} di {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Step label dots ──────────────────────────────────────────
function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i + 1 === step ? "w-6 bg-primary" : i + 1 < step ? "w-2 bg-primary/40" : "w-2 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

// ── Toggle switch ────────────────────────────────────────────
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
    >
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className={`relative w-10 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-gray-200"}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} />
      </div>
    </button>
  );
}

// ── Payment pill selector ────────────────────────────────────
function PaymentPill({ value, current, label, icon: Icon, onClick }: { value: PaymentMode; current: PaymentMode; label: string; icon: any; onClick: () => void }) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-sm font-medium ${
        active ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500 hover:border-gray-300"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {active && <Check className="w-3 h-3" />}
    </button>
  );
}

// ── Main wizard ──────────────────────────────────────────────
export default function SetupWizard() {
  const TOTAL = 4;
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState(false);
  const [downloadingBackup, setDownloadingBackup] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [eventName, setEventName] = useState("");
  const [location, setLocation] = useState("");

  // Step 2
  const [coverPrice, setCoverPrice] = useState("0.00");
  const [takeaway, setTakeaway] = useState(false);
  const [payment, setPayment] = useState<PaymentMode>("both");

  // Step 3
  const [dishes, setDishes] = useState<WizardDish[]>([
    { name: "", price: "", category: "primi" },
  ]);

  // Step 4
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [licenseCode, setLicenseCode] = useState("");
  const [licenseError, setLicenseError] = useState("");
  const [licenseOk, setLicenseOk] = useState(false);

  // ── Dish helpers ────────────────────────────────────────────
  const addDish = () => setDishes(d => [...d, { name: "", price: "", category: "primi" }]);
  const removeDish = (i: number) => setDishes(d => d.filter((_, idx) => idx !== i));
  const updateDish = (i: number, field: keyof WizardDish, val: string) =>
    setDishes(d => d.map((dish, idx) => idx === i ? { ...dish, [field]: val } : dish));

  // ── License check ───────────────────────────────────────────
  const checkLicense = () => {
    if (licenseCode.trim() === buildLicenseCode(eventName)) {
      setLicenseOk(true);
      setLicenseError("");
    } else {
      setLicenseOk(false);
      setLicenseError("Codice non valido. Riprova.");
    }
  };

  // ── Navigation ──────────────────────────────────────────────
  const canAdvance = () => {
    if (step === 1) return eventName.trim().length > 0;
    return true;
  };

  const next = () => {
    if (!canAdvance()) { setError("Inserisci il nome dell'evento per continuare."); return; }
    setError("");
    setStep(s => Math.min(s + 1, TOTAL));
  };
  const back = () => { setError(""); setStep(s => Math.max(s - 1, 1)); };

  // ── Final save ──────────────────────────────────────────────
  const finish = async () => {
    if (!eventName.trim()) { setError("Il nome dell'evento è obbligatorio."); return; }
    setSaving(true);
    setError("");
    try {
      // Build settings from wizard answers
      const extraPayment = payment === "both" ? "" : "";
      const cashLabel = payment === "pos" ? "" : "Contanti";
      const posLabel = payment === "cash" ? "" : "POS";

      const settings: AppSettings = {
        ...CONFIG,
        eventName: eventName.trim(),
        eventFullName: location.trim() ? `${eventName.trim()} — ${location.trim()}` : eventName.trim(),
        appTitle: `Gestione Ordini — ${eventName.trim()}`,
        cashLabel: cashLabel || "Contanti",
        posLabel: posLabel || "POS",
        extraPaymentLabel: extraPayment,
        coverPrice: parseFloat(coverPrice) || 0,
        takeawayEnabled: takeaway,
        dishCategories: { ...CONFIG.dishCategories },
      };

      await apiRequest("PUT", "/api/settings", settings);

      // Create initial dishes
      const validDishes = dishes.filter(d => d.name.trim() && d.price.trim());
      for (const dish of validDishes) {
        await apiRequest("POST", "/api/dishes", {
          name: dish.name.trim(),
          price: parseFloat(dish.price).toFixed(2),
          category: dish.category,
        });
      }

      // Handle license
      if (plan === "pro" && licenseOk) {
        localStorage.setItem(LS_PRO, "true");
        localStorage.setItem(LS_EVENT, eventName.trim());
      } else {
        localStorage.setItem(LS_PRO, "false");
        localStorage.removeItem(LS_EVENT);
      }

      // Mark setup complete
      localStorage.setItem(LS_SETUP, "true");
      setFinished(true);
      setSaving(false);
    } catch (e) {
      setError("Errore durante il salvataggio. Riprova.");
      setSaving(false);
    }
  };

  // ── Shared layout ────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">

        {/* ── DONE SCREEN ─────────────────────────────────────── */}
        {finished && (
          <>
            <div className="bg-green-500 px-6 pt-6 pb-4 text-white">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 opacity-80" />
                <span className="text-sm font-medium opacity-80 tracking-wide">Luna Wolfie Digital Systems</span>
              </div>
            </div>
            <div className="flex-1 p-8 flex flex-col items-center text-center gap-5">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <PartyPopper className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Configurazione completata!</h2>
                <p className="text-sm text-gray-500 mt-1">
                  <strong className="text-gray-700">{eventName}</strong> è pronta per partire.
                </p>
              </div>
              <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 text-left space-y-2">
                <p className="text-sm font-semibold text-blue-800 flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  Scarica il backup prima di iniziare
                </p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Ti consigliamo di salvare subito un file di backup. Potrai usarlo per ripristinare la configurazione su altri tablet o in caso di problemi.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 mt-1"
                  disabled={downloadingBackup}
                  data-testid="wizard-download-backup"
                  onClick={async () => {
                    setDownloadingBackup(true);
                    try { await exportBackup(eventName); } finally { setDownloadingBackup(false); }
                  }}
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  {downloadingBackup ? "Download..." : "Scarica configurazione_luna_wolfie.json"}
                </Button>
              </div>
            </div>
            <div className="px-6 pb-5 pt-3 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300 select-none">Powered by Luna Wolfie</span>
                <Button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="wizard-enter-dashboard"
                  onClick={() => window.location.reload()}
                >
                  Entra nella Dashboard 🚀
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Header brand (only while steps are active) */}
        {!finished && <div className="bg-primary px-6 pt-6 pb-4 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium opacity-80 tracking-wide">Luna Wolfie Digital Systems</span>
          </div>
          <ProgressBar step={step} total={TOTAL} />
        </div>}

        {/* Step content — hidden after finish */}
        {!finished && <div className="flex-1 p-6 overflow-y-auto">

          {/* ── STEP 1: Benvenuto ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Benvenuto! 👋</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Configuriamo il tuo sistema di cassa in {TOTAL} rapidi passaggi.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="eventName" className="text-sm font-medium text-gray-700">
                    Nome Evento / Sagra <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="eventName"
                    value={eventName}
                    onChange={e => { setEventName(e.target.value); setError(""); }}
                    placeholder="Nome evento o sagra"
                    className="mt-1"
                    data-testid="wizard-input-eventName"
                    autoFocus
                  />
                  {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>
                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Località <span className="text-gray-400 font-normal">(opzionale)</span>
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Località"
                    className="mt-1"
                    data-testid="wizard-input-location"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Il nome della sagra comparirà sull'intestazione di ogni scontrino stampato e nei report giornalieri.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2: Configurazione Economica ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Configurazione Economica</h2>
                <p className="text-sm text-gray-500 mt-1">Imposta le opzioni di cassa per il tuo evento.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Euro className="w-3.5 h-3.5" />
                    Costo Coperto <span className="text-gray-400 font-normal">(0.00 = disabilitato)</span>
                  </Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.50"
                      value={coverPrice}
                      onChange={e => setCoverPrice(e.target.value)}
                      className="pl-7"
                      data-testid="wizard-input-coverPrice"
                    />
                  </div>
                </div>

                <Toggle
                  checked={takeaway}
                  onChange={setTakeaway}
                  label="Abilita Gestione Asporto"
                />

                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-2">
                    <CreditCard className="w-3.5 h-3.5" />
                    Metodi di Pagamento Accettati
                  </Label>
                  <div className="flex gap-2">
                    <PaymentPill value="cash" current={payment} label="Solo Contanti" icon={Euro} onClick={() => setPayment("cash")} />
                    <PaymentPill value="pos" current={payment} label="Solo POS" icon={CreditCard} onClick={() => setPayment("pos")} />
                    <PaymentPill value="both" current={payment} label="Entrambi" icon={Check} onClick={() => setPayment("both")} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Menu Rapido ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Creazione Menù Rapido</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Aggiungi i primi piatti bestseller per iniziare subito. Potrai completare il menù dalla Dashboard.
                </p>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {dishes.map((dish, i) => (
                  <div key={i} className="flex gap-2 items-start bg-gray-50 rounded-xl p-3">
                    <div className="flex-1 space-y-1.5">
                      <Input
                        value={dish.name}
                        onChange={e => updateDish(i, "name", e.target.value)}
                        placeholder={`Nome piatto ${i + 1}`}
                        className="bg-white text-sm"
                        data-testid={`wizard-dish-name-${i}`}
                      />
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">€</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.50"
                            value={dish.price}
                            onChange={e => updateDish(i, "price", e.target.value)}
                            placeholder="0.00"
                            className="pl-6 bg-white text-sm"
                            data-testid={`wizard-dish-price-${i}`}
                          />
                        </div>
                        <select
                          value={dish.category}
                          onChange={e => updateDish(i, "category", e.target.value)}
                          className="text-sm border border-gray-200 rounded-md px-2 bg-white text-gray-700 flex-1"
                          data-testid={`wizard-dish-category-${i}`}
                        >
                          {Object.entries(DEFAULT_CATEGORIES).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {dishes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDish(i)}
                        className="mt-1 text-gray-400 hover:text-red-500 transition-colors p-1"
                        data-testid={`wizard-remove-dish-${i}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDish}
                className="w-full border-dashed"
                data-testid="wizard-add-dish"
              >
                <Plus className="w-4 h-4 mr-1" />
                Aggiungi piatto
              </Button>

              <p className="text-xs text-gray-400 text-center">
                Puoi lasciare i campi vuoti e aggiungere il menù completo dalla Dashboard dopo il setup.
              </p>
            </div>
          )}

          {/* ── STEP 4: Licenza ── */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Scegli la tua versione</h2>
                <p className="text-sm text-gray-500 mt-1">Puoi sempre upgraddare in seguito dalle Impostazioni.</p>
              </div>

              {/* Free option */}
              <button
                type="button"
                onClick={() => { setPlan("free"); setLicenseOk(false); setLicenseError(""); }}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                  plan === "free" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                }`}
                data-testid="wizard-plan-free"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-800 flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Versione Standard (Gratuita)
                  </span>
                  {plan === "free" && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Accesso completo a ordini e menù. Include la firma{" "}
                  <span className="font-medium text-gray-600">🌕 Realizzato da Luna Wolfie</span>{" "}
                  sugli scontrini e il banner nel footer.
                </p>
              </button>

              {/* PRO option */}
              <button
                type="button"
                onClick={() => setPlan("pro")}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                  plan === "pro" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                }`}
                data-testid="wizard-plan-pro"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    Versione PRO (Licenza)
                  </span>
                  {plan === "pro" && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Rimuove il brand dagli scontrini, sblocca l'export Excel/Word e la personalizzazione completa dei colori.
                </p>
              </button>

              {plan === "pro" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Codice Attivazione</Label>
                  <div className="flex gap-2">
                    <Input
                      value={licenseCode}
                      onChange={e => { setLicenseCode(e.target.value); setLicenseError(""); setLicenseOk(false); }}
                      placeholder="Codice di attivazione"
                      className="font-mono text-sm flex-1"
                      onKeyDown={e => e.key === "Enter" && checkLicense()}
                      data-testid="wizard-input-licenseCode"
                    />
                    <Button type="button" onClick={checkLicense} variant="outline" className="shrink-0">
                      Verifica
                    </Button>
                  </div>
                  {licenseOk && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Codice valido — licenza PRO attivata!
                    </p>
                  )}
                  {licenseError && (
                    <p className="text-xs text-red-500">{licenseError}</p>
                  )}
                </div>
              )}

              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          )}
        </div>}

        {/* Footer nav — hidden after finish */}
        {!finished && <div className="px-6 pb-5 pt-3 border-t border-gray-50">
          <StepDots step={step} total={TOTAL} />
          <div className="flex items-center justify-between mt-4">
            <div>
              {step > 1 ? (
                <Button type="button" variant="ghost" size="sm" onClick={back} className="text-gray-500" data-testid="wizard-back">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Indietro
                </Button>
              ) : <div />}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-300 select-none">Powered by Luna Wolfie</span>
              {step < TOTAL ? (
                <Button
                  type="button"
                  onClick={next}
                  className="bg-primary hover:bg-blue-700 text-white"
                  data-testid="wizard-next"
                >
                  Avanti
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={finish}
                  disabled={saving}
                  className="bg-primary hover:bg-blue-700 text-white"
                  data-testid="wizard-finish"
                >
                  {saving ? "Salvataggio..." : "Inizia a Lavorare 🚀"}
                </Button>
              )}
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
