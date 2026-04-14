export function buildLicenseCode(eventName: string): string {
  return eventName.replace(/\s+/g, "") + "LUNA2026";
}
