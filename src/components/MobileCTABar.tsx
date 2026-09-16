import { mapsRouteLink, telLink, waLink } from "../config";
import { ICON_PATHS, LineIcon, WhatsAppIcon } from "./icons";

/**
 * Barra de ações fixa no rodapé da tela — só no mobile.
 *
 * No celular as ações principais ficam fora da área de rolagem, sempre ao
 * alcance do polegar: agendar no WhatsApp, ligar por telefone e abrir a rota.
 * Substitui o botão flutuante do WhatsApp, que no desktop continua aparecendo.
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
          href={waLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center gap-0.5 rounded-xl bg-rose py-2 text-[11px] font-semibold leading-tight text-white active:bg-rose-dark"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Agendar
        </a>
        <a
          href={telLink}
          className="flex flex-1 flex-col items-center gap-0.5 rounded-xl border border-cream-dark bg-white py-2 text-[11px] font-semibold leading-tight text-coffee active:bg-blush-soft"
        >
          <LineIcon d={ICON_PATHS.phone} className="h-5 w-5 text-rose" />
          Ligar
        </a>
        <a
          href={mapsRouteLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center gap-0.5 rounded-xl border border-cream-dark bg-white py-2 text-[11px] font-semibold leading-tight text-coffee active:bg-blush-soft"
        >
          <LineIcon d={ICON_PATHS.route} className="h-5 w-5 text-rose" />
          Rota
        </a>
      </div>
    </nav>
  );
}