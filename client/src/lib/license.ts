export async function validateLicenseCode(eventName: string, code: string): Promise<boolean> {
  try {
    const res = await fetch("/api/license/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, code }),
    });
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}
