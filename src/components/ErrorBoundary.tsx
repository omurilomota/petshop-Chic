import * as Sentry from "@sentry/react";
import type { ReactNode } from "react";

export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-cream px-4">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold text-coffee">Algo deu errado</h1>
            <p className="mt-2 text-sm text-mocha">O erro foi registrado. Tente recarregar a página.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-rose px-4 py-2 text-sm font-semibold text-white hover:bg-rose-dark"
            >
              Recarregar
            </button>
          </div>
        </div>
      }
      showDialog={false}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
