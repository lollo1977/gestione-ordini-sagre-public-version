import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const LS_PRO = "luna_wolfie_is_pro";
const LS_EVENT = "luna_wolfie_licensed_event";

function buildCode(eventName: string): string {
  const SECRET = "LW$2026#SAGRA!";
  const input = eventName.toUpperCase().replace(/\s+/g, "") + SECRET;

  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let result = "";
  let h = hash >>> 0;
  for (let i = 0; i < 8; i++) {
    result += CHARS[h % CHARS.length];
    h = Math.floor(h / CHARS.length);
  }

  return result.slice(0, 4) + "-" + result.slice(4);
}

type LicenseCtx = {
  isPro: boolean;
  activateLicense: (code: string) => boolean;
  revokeLicense: () => void;
};

const LicenseContext = createContext<LicenseCtx>({
  isPro: false,
  activateLicense: () => false,
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

  // Revoke license automatically when eventName changes
  useEffect(() => {
    const storedEvent = localStorage.getItem(LS_EVENT) ?? "";
    if (isPro && storedEvent !== eventName) {
      setIsPro(false);
      localStorage.setItem(LS_PRO, "false");
      localStorage.removeItem(LS_EVENT);
    }
  }, [eventName, isPro]);

  const activateLicense = (code: string): boolean => {
    if (code.trim() === buildCode(eventName)) {
      setIsPro(true);
      localStorage.setItem(LS_PRO, "true");
      localStorage.setItem(LS_EVENT, eventName);
      return true;
    }
    return false;
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
