import { supabase } from "./supabase";
import type { Session } from "@supabase/supabase-js";

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error("Supabase não configurado");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string) {
  if (!supabase) throw new Error("Supabase não configurado");
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

export async function resetPasswordForEmail(email: string) {
  if (!supabase) throw new Error("Supabase não configurado");
  const redirectTo = `${window.location.origin}${window.location.pathname}#/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  if (!supabase) throw new Error("Supabase não configurado");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function exchangeCodeForSession(code: string) {
  if (!supabase) throw new Error("Supabase não configurado");
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
  return data;
}
