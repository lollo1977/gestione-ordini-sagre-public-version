import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CONFIG } from "@shared/config";
import type { AppSettings } from "@shared/schema";

const defaultSettings: AppSettings = {
  eventName: CONFIG.eventName,
  eventFullName: CONFIG.eventFullName,
  appTitle: CONFIG.appTitle,
  currencySymbol: CONFIG.currencySymbol,
  printerPaperSize: CONFIG.printerPaperSize,
  locale: CONFIG.locale,
  primaryColor: CONFIG.primaryColor,
  secondaryColor: CONFIG.secondaryColor,
  accentColor: CONFIG.accentColor,
  tableLabel: CONFIG.tableLabel,
  customerLabel: CONFIG.customerLabel,
  coversLabel: CONFIG.coversLabel,
  cashLabel: CONFIG.cashLabel,
  posLabel: CONFIG.posLabel,
  extraPaymentLabel: CONFIG.extraPaymentLabel,
  kitchenReceiptMessage: CONFIG.kitchenReceiptMessage,
  customerReceiptMessage: CONFIG.customerReceiptMessage,
  numberOfRegisters: CONFIG.numberOfRegisters,
  registerNames: { ...CONFIG.registerNames },
  coverPrice: CONFIG.coverPrice,
  takeawayEnabled: CONFIG.takeawayEnabled,
  showTableNumber: CONFIG.showTableNumber,
  showCustomerName: CONFIG.showCustomerName,
  showCovers: CONFIG.showCovers,
  dishCategories: { ...CONFIG.dishCategories },
};

export function useAppSettings(): AppSettings {
  const queryClient = useQueryClient();

  const { data } = useQuery<AppSettings>({
    queryKey: ["/api/settings"],
    staleTime: Infinity,
  });

  useEffect(() => {
    const handler = (event: Event) => {
      const e = event as CustomEvent<AppSettings>;
      queryClient.setQueryData(["/api/settings"], e.detail);
    };
    window.addEventListener("settings-updated", handler);
    return () => window.removeEventListener("settings-updated", handler);
  }, [queryClient]);

  return data ?? defaultSettings;
}
