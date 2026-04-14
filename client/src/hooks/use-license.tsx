import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { validateLicenseCode } from "@/lib/license";

const LS_PRO = "luna_wolfie_is_pro";
const LS_EVENT = "luna_wolfie_licensed_event";

type LicenseCtx = {
  isPro: boolean;
  activateLicense: (code: string) => Promise<boolean>;
  revokeLicense: () => void;
};

const LicenseContext = createContext<LicenseCtx>({
  isPro: false,
  activateLicense: async () => false,
  revokeLicense: () => {},
});

export function LicenseProvider({
  children,
  eventName,
}: {
  children: ReactNode;
  eventName: string;
}) {
  const [isPro, setIsPro] = useState<boolean>(() => {
    const stored = localStorage.getItem(LS_PRO) === "true";
    const storedEvent = localStorage.getItem(LS_EVENT) ?? "";
    return stored && storedEvent === eventName;
  });

  useEffect(() => {
    const storedEvent = localStorage.getItem(LS_EVENT) ?? "";
    if (isPro && storedEvent !== eventName) {
      setIsPro(false);
      localStorage.setItem(LS_PRO, "false");
      localStorage.removeItem(LS_EVENT);
    }
  }, [eventName, isPro]);

  const activateLicense = async (code: string): Promise<boolean> => {
    const valid = await validateLicenseCode(eventName, code);
    if (valid) {
      setIsPro(true);
      localStorage.setItem(LS_PRO, "true");
      localStorage.setItem(LS_EVENT, eventName);
    }
    return valid;
  };

  const revokeLicense = () => {
    setIsPro(false);
    localStorage.setItem(LS_PRO, "false");
    localStorage.removeItem(LS_EVENT);
  };

  return (
    <LicenseContext.Provider value={{ isPro, activateLicense, revokeLicense }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  return useContext(LicenseContext);
}
