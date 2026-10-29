import { BUSINESS, CREDITS } from "../config";
import { PawStrip } from "./PawDecor";

export function Footer() {
  // pb extra no mobile: espaço para a barra de ações fixa não cobrir o conteúdo.
  return (
    <footer className="border-t border-cream-dark pt-6 pb-28 md:pb-8">
      <PawStrip className="mx-auto max-w-6xl px-5" />

      <div className="mx-auto mt-6 flex max-w-6xl flex-col items-center justify-between gap-2 px-5 text-sm text-mocha sm:flex-row">
        <span className="font-serif text-lg font-bold text-coffee">
          Chic<span className="text-rose">Pets</span>
        </span>
        <span>{BUSINESS.city} · {BUSINESS.instagram}</span>
        <span>© {new Date().getFullYear()} {BUSINESS.name}</span>
      </div>

      {/* Crédito discreto: baixo contraste de propósito, some no meio do rodapé. */}
      <p className="mt-5 text-center text-[11px] tracking-wide text-mocha/50">
        Desenvolvido por{" "}
        {CREDITS.url ? (
          <a
            href={CREDITS.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block py-1 underline decoration-dotted underline-offset-2 hover:text-rose"
          >
            {CREDITS.name}
          </a>
        ) : (
          CREDITS.name
        )}
      </p>

      <p className="mt-1 text-center text-[11px] tracking-wide text-mocha/60">
        <a href="#/agendar" className="inline-block py-1 font-semibold text-rose hover:text-rose-dark">
          Agendar online
        </a>
      </p>
    </footer>
  );
}
