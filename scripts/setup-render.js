#!/usr/bin/env node
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toDbName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function generateLicenseCode(eventName) {
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

function generate(eventName) {
  const slug = toSlug(eventName);
  const dbSlug = slug + "-db";
  const dbName = toDbName(eventName);
  const appName = slug + "-pos";
  const licenseCode = generateLicenseCode(eventName);

  const yaml = `services:
  - type: web
    name: ${appName}
    env: node
    plan: free
    buildCommand: npm install --include=dev && npm run build && npm run db:push
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: ${dbSlug}
          property: connectionString

databases:
  - name: ${dbSlug}
    plan: free
    databaseName: ${dbName}
    user: restaurant_user
`;

  writeFileSync(join(rootDir, "render.yaml"), yaml);

  console.log(`\n✅ render.yaml aggiornato per: "${eventName}"`);
  console.log(`   App:            ${appName}`);
  console.log(`   Database:       ${dbSlug} (${dbName})`);
  console.log(`\n🔑 Codice PRO:    ${licenseCode}`);
  console.log(`   → Invialo al cliente dopo il pagamento.\n`);
  console.log(`Prossimo passo: git add render.yaml && git commit -m "Setup ${eventName}" && git push\n`);
}

const eventName = process.argv[2];

if (eventName) {
  generate(eventName);
} else {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  console.log("=== Configurazione Render - Luna Wolfie ===");
  rl.question("Inserisci il nome dell'evento (es. Sagra del Mare 2026): ", (answer) => {
    rl.close();
    if (!answer.trim()) {
      console.error("Errore: il nome dell'evento non può essere vuoto.");
      process.exit(1);
    }
    generate(answer.trim());
  });
}
