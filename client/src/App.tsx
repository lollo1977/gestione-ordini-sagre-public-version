/**
 * (c) 2024-2030 Lorenzo Formento (Luna Wolfie)
 * Progetto: Gestione Ordini Sagra
 * Licenza Proprietaria v2.1 - Tutti i diritti riservati.
 * Consultare il file LICENSE nella root del progetto per i termini completi.
 */
import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAppSettings } from "@/hooks/use-app-settings";
import { LicenseProvider } from "@/hooks/use-license";
import SetupWizard, { isSetupComplete } from "@/components/setup-wizard";
import RegisterSelector from "@/components/register-selector";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

function Router() {
  const [registerId, setRegisterId] = useState<number | null>(() => {
    const saved = localStorage.getItem('registerId');
    return saved ? parseInt(saved) : null;
  });

  const settings = useAppSettings();

  const { isConnected } = useWebSocket(registerId || undefined);

  const handleRegisterSelect = (id: number) => {
    setRegisterId(id);
    localStorage.setItem('registerId', id.toString());
  };

  const resetRegister = () => {
    setRegisterId(null);
    localStorage.removeItem('registerId');
  };

  if (!registerId) {
    return (
      <RegisterSelector
        numberOfRegisters={settings.numberOfRegisters}
        registerNames={settings.registerNames ?? {}}
        onRegisterSelect={handleRegisterSelect}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-white px-4 py-2 flex justify-between items-center text-sm font-semibold">
        <span>🏪 {settings.registerNames?.[String(registerId)] || `CASSA ${registerId}`}</span>
        <div className="flex items-center gap-3">
          <span
            data-testid="status-websocket"
            className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
              isConnected ? "bg-green-500/30 text-green-100" : "bg-red-500/30 text-red-200"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-300 animate-pulse" : "bg-red-400"}`} />
            {isConnected ? "Sincronizzato" : "Offline"}
          </span>
          <button
            onClick={resetRegister}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs transition-colors"
          >
            Cambia Cassa
          </button>
        </div>
      </div>

      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function AppWithLicense() {
  const settings = useAppSettings();
  const setupDone = isSetupComplete();

  if (!setupDone) {
    return <SetupWizard />;
  }

  return (
    <LicenseProvider eventName={settings.eventName}>
      <Router />
    </LicenseProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppWithLicense />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
