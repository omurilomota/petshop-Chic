import { BUSINESS, CREDITS } from "../config";

export function Footer() {
  return (
    <footer className="border-t border-cream-dark py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 text-sm text-mocha sm:flex-row">
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
            className="underline decoration-dotted underline-offset-2 hover:text-rose"
          >
            {CREDITS.name}
          </a>
        ) : (
          CREDITS.name
        )}
      </p>
    </footer>
  );
}
