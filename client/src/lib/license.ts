const SECRET = "LW$2026#SAGRA!";
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function buildLicenseCode(eventName: string): string {
  const input = eventName.toUpperCase().replace(/\s+/g, "") + SECRET;

  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  let result = "";
  let h = hash >>> 0;
  for (let i = 0; i < 8; i++) {
    result += CHARS[h % CHARS.length];
    h = Math.floor(h / CHARS.length);
  }

  return result.slice(0, 4) + "-" + result.slice(4);
}
