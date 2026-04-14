#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
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

function generate(eventName) {
  const slug = toSlug(eventName);
  const dbSlug = slug + "-db";
  const dbName = toDbName(eventName);
  const appName = slug + "-pos";

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
  console.log(`\nrender.yaml aggiornato per: "${eventName}"`);
  console.log(`  App:      ${appName}`);
  console.log(`  Database: ${dbSlug} (${dbName})`);
  console.log(`\nOra fai il push su GitHub e usa il Blueprint su Render.`);
}

const eventName = process.argv[2];

if (eventName) {
  generate(eventName);
} else {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  console.log("=== Configurazione Render ===");
  rl.question("Inserisci il nome dell'evento (es. Sagra del Mare 2026): ", (answer) => {
    rl.close();
    if (!answer.trim()) {
      console.error("Errore: il nome dell'evento non può essere vuoto.");
      process.exit(1);
    }
    generate(answer.trim());
  });
}
