import { useState } from "react";
import { signIn, signUp, resetPasswordForEmail } from "../lib/auth";
import { loginSchema, signUpSchema, zodErrorsToRecord } from "./validation";
import { Card } from "./components";

type View = "login" | "signup" | "forgot";

export function Login() {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const resetState = () => {
    setError(null);
    setMessage(null);
    setFieldErrors({});
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setFieldErrors(zodErrorsToRecord(result.error));
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      window.location.hash = "#/demo";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();

    const result = signUpSchema.safeParse({ email, password, confirmPassword });
    if (!result.success) {
      setFieldErrors(zodErrorsToRecord(result.error));
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password);
      setMessage("Conta criada! Verifique seu email para confirmar.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();

    const result = loginSchema.pick({ email: true }).safeParse({ email });
    if (!result.success) {
      setFieldErrors(zodErrorsToRecord(result.error));
      return;
    }

    setLoading(true);
    try {
      await resetPasswordForEmail(email.trim());
      setMessage("Se o email existir, enviaremos um link de recuperação.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao solicitar recuperação");
    } finally {
      setLoading(false);
    }
  };

  const renderFieldError = (field: string) =>
    fieldErrors[field] ? (
      <p className="mt-1 text-xs text-red-600">{fieldErrors[field]}</p>
    ) : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold text-coffee">ChicPets</h1>
          <p className="mt-1 text-sm text-mocha">Painel de gestão</p>
        </div>

        {view === "forgot" ? (
          <form onSubmit={handleForgot} className="mt-6 space-y-4">
            <p className="text-sm text-mocha">Digite seu email para receber um link de recuperação.</p>
            <div>
              <label className="block text-sm font-medium text-coffee" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-cream-dark bg-white px-3 py-2 text-sm text-coffee focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose"
                placeholder="seu@email.com"
              />
              {renderFieldError("email")}
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-rose px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark disabled:opacity-50"
            >
              {loading ? "Aguarde..." : "Enviar link"}
            </button>

            <button
              type="button"
              onClick={() => { setView("login"); resetState(); }}
              className="w-full text-sm font-semibold text-rose hover:text-rose-dark"
            >
              Voltar ao login
            </button>
          </form>
        ) : (
          <form onSubmit={view === "login" ? handleLogin : handleSignUp} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-coffee" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-cream-dark bg-white px-3 py-2 text-sm text-coffee focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose"
                placeholder="seu@email.com"
              />
              {renderFieldError("email")}
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 w-full rounded-lg border border-cream-dark bg-white px-3 py-2 text-sm text-coffee focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose"
                placeholder="••••••••"
              />
              {renderFieldError("password")}
            </div>

            {view === "signup" && (
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
                  placeholder="••••••••"
                />
                {renderFieldError("confirmPassword")}
              </div>
            )}

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-rose px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark disabled:opacity-50"
            >
              {loading ? "Aguarde..." : view === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        )}

        {view !== "forgot" && (
          <div className="mt-4 space-y-2 text-center text-sm">
            {view === "login" && (
              <button
                type="button"
                onClick={() => { setView("forgot"); resetState(); }}
                className="font-semibold text-rose hover:text-rose-dark"
              >
                Esqueci minha senha
              </button>
            )}
            <p className="text-mocha">
              {view === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
              <button
                type="button"
                onClick={() => { setView(view === "login" ? "signup" : "login"); resetState(); }}
                className="font-semibold text-rose hover:text-rose-dark"
              >
                {view === "login" ? "Criar conta" : "Entrar"}
              </button>
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-mocha/60">
          <a href="#/" className="hover:text-rose">← Voltar ao site</a>
        </p>
      </Card>
    </div>
  );
}
