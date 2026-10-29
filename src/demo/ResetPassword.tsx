import { useEffect, useState } from "react";
import { updatePassword, exchangeCodeForSession } from "../lib/auth";
import { resetPasswordSchema, zodErrorsToRecord } from "./validation";
import { Card } from "./components";

export function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      exchangeCodeForSession(code)
        .then(() => setReady(true))
        .catch(() => setError("Link inválido ou expirado. Solicite um novo."))
        .finally(() => setChecking(false));
    } else {
      // Implicit flow: check if session exists from hash
      import("../lib/supabase").then(({ supabase }) => {
        if (supabase) {
          supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
              setReady(true);
            } else {
              setError("Link inválido ou expirado. Solicite um novo.");
            }
            setChecking(false);
          });
        } else {
          setError("Supabase não configurado.");
          setChecking(false);
        }
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const errors = zodErrorsToRecord(result.error);
      setError(errors.password || errors.confirmPassword || "Dados inválidos");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setMessage("Senha atualizada com sucesso! Redirecionando...");
      setTimeout(() => {
        window.location.hash = "#/login";
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar senha");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-mocha">Verificando link...</p>
      </div>
    );
  }

  if (error && !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <Card className="w-full max-w-md p-6 text-center">
          <h1 className="font-serif text-2xl font-bold text-coffee">Link inválido</h1>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <a href="#/login" className="mt-4 inline-block text-sm font-semibold text-rose hover:text-rose-dark">
            Voltar ao login
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <h1 className="font-serif text-2xl font-bold text-coffee text-center">Nova senha</h1>
        <p className="mt-1 text-sm text-mocha text-center">Digite sua nova senha</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-coffee" htmlFor="password">
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-cream-dark bg-white px-3 py-2 text-sm text-coffee focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-coffee" htmlFor="confirmPassword">
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-cream-dark bg-white px-3 py-2 text-sm text-coffee focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          {message && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-rose px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark disabled:opacity-50"
          >
            {loading ? "Aguarde..." : "Atualizar senha"}
          </button>
        </form>
      </Card>
    </div>
  );
}
