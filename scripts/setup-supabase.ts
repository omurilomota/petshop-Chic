/**
 * Guia de setup do Supabase para o projeto ChicPets.
 *
 * Passo 1: Acesse o painel do Supabase → SQL Editor
 * Passo 2: Cole o conteúdo de sql/001-schema.sql e execute
 * Passo 3: Cole o conteúdo de sql/002-seed-data.sql e execute (opcional, dados de exemplo)
 * Passo 4: Execute scripts/test-supabase.ts para verificar
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");

function parseEnv(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

const env = parseEnv(envContent);

async function main() {
  console.log("=== Setup Supabase - ChicPets ===\n");
  console.log("Projeto:", env.VITE_SUPABASE_URL);
  console.log("Status: " + (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY ? "Credenciais OK" : "FALTANDO CREDENCIAIS"));
  console.log("\nPasso 1: Abra o painel do Supabase → SQL Editor");
  console.log("Passo 2: Cole o conteúdo de sql/001-schema.sql e execute");
  console.log("Passo 3: (Opcional) Cole o conteúdo de sql/002-seed-data.sql e execute");
  console.log("Passo 4: Execute: npx tsx scripts/test-supabase.ts\n");

  // Verificar se as tabelas já existem
  const res = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/services?select=*&limit=1`, {
    headers: {
      "apikey": env.VITE_SUPABASE_ANON_KEY,
    },
  });

  if (res.ok) {
    const data = await res.json();
    console.log("Tabelas criadas! Services:", data.length, "registro(s)");
  } else {
    const text = await res.text();
    console.log("Tabelas ainda não criadas:", text.slice(0, 100));
  }
}

main().catch((err) => console.error("Erro:", err.message));