import { createClient } from "@supabase/supabase-js";
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
const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Faltam VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY no .env.local");
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function main() {
  console.log("Conectando a:", url);

  // Testar services
  const { data: services, error: svcErr } = await supabase
    .from("services")
    .select("*")
    .limit(5);

  if (svcErr) {
    console.error("Erro ao buscar services:", svcErr.message);
    console.log("Verifique se as tabelas foram criadas (sql/001-schema.sql)");
  } else {
    console.log("Services encontrados:", services?.length ?? 0);
    console.log(services);
  }

  // Testar clients
  const { data: clients, error: cliErr } = await supabase
    .from("clients")
    .select("*")
    .limit(5);

  if (cliErr) {
    console.error("Erro ao buscar clients:", cliErr.message);
  } else {
    console.log("Clients encontrados:", clients?.length ?? 0);
  }

  // Testar appointments
  const { data: appointments, error: aptErr } = await supabase
    .from("appointments")
    .select("*")
    .limit(5);

  if (aptErr) {
    console.error("Erro ao buscar appointments:", aptErr.message);
  } else {
    console.log("Appointments encontrados:", appointments?.length ?? 0);
  }

  // Testar subscriptions
  const { data: subs, error: subErr } = await supabase
    .from("subscriptions")
    .select("*")
    .limit(5);

  if (subErr) {
    console.error("Erro ao buscar subscriptions:", subErr.message);
  } else {
    console.log("Subscriptions encontradas:", subs?.length ?? 0);
  }

  console.log("\nConexão OK!");
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});