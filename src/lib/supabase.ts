import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { flowType: "pkce" },
  });
} else {
  console.warn("VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configurados. App funcionará offline com mock data.");
}

export const supabase = client;
export const isSupabaseConfigured = !!client;
