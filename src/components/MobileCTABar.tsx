import { waLink } from "../config";
import { WhatsAppIcon } from "./icons";

/**
 * Barra de ações fixa no rodapé da tela — só no mobile.
 *
 * As duas ações principais ficam sempre ao alcance do polegar: agendar online
 * e falar no WhatsApp. Ligar e ver a rota continuam na seção de contato.
 * O padding inferior respeita a safe area (barra de gestos do iPhone).
 */
export function MobileCTABar() {
  return (
    <nav
      aria-label="Ações rápidas"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-cream-dark bg-cream/95 px-4 pb-[calc(0.625rem_+_env(safe-area-inset-bottom))] pt-2.5 backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch gap-2">
        <a
          href="#/agendar"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose px-4 py-3 text-sm font-semibold text-white active:bg-rose-dark"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M8 2v4M16 2v4M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
          </svg>
          Agendar
        </a>
        <a
          href={waLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 active:bg-emerald-100"
        >
          <WhatsAppIcon className="h-5 w-5" />
          WhatsApp
        </a>
      </div>
    </nav>
  );
}
