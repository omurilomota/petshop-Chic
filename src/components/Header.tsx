import { useEffect, useRef, useState } from "react";
import { waLink } from "../config";
import { PawIcon, WhatsAppIcon } from "./icons";

const links = [
  { label: "Início", href: "#inicio" },
  { label: "Serviços", href: "#servicos" },
  { label: "Galeria", href: "#galeria" },
  { label: "Sobre", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

function Logo() {
  // py-1 + -my-1: mantém o visual e leva o alvo de toque do logo a 44px.
  return (
    <a href="#inicio" className="-my-1 flex items-center gap-2 py-1">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose text-cream">
        <PawIcon className="h-5 w-5" />
      </span>
      <span className="font-serif text-2xl font-bold text-coffee">
        Chic<span className="text-rose">Pets</span>
      </span>
    </a>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    // Esc fecha o menu — esperado no teclado e em leitores de tela.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    // Girar o celular para paisagem (ou redimensionar) pode cair no layout
    // desktop: sem isso o menu sumiria da tela com o scroll ainda travado.
    const desktop = window.matchMedia("(min-width: 768px)");
    const onBreakpointChange = () => {
      if (desktop.matches) setOpen(false);
    };

    // Trava a rolagem do fundo enquanto o menu está aberto.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpointChange);
    menuRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpointChange);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled || open ? "bg-cream shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex lg:gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-coffee-light hover:text-rose">
              {l.label}
            </a>
          ))}
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark"
          >
            Agendar
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-xl text-coffee active:bg-blush-soft md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="menu-mobile"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <>
          {/* Backdrop: escurece o site e fecha o menu no toque fora. */}
          <div
            onClick={close}
            className="fixed inset-x-0 bottom-0 top-18 bg-coffee/30 md:hidden"
            aria-hidden="true"
          />

          {/* Mesmo em telas baixas (paisagem) o menu rola em vez de cortar itens. */}
          <nav
            id="menu-mobile"
            ref={menuRef}
            tabIndex={-1}
            className="relative max-h-[calc(100dvh_-_4.5rem)] overflow-y-auto border-t border-cream-dark bg-cream px-5 pb-[calc(1rem_+_env(safe-area-inset-bottom))] pt-4 outline-none md:hidden"
          >
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className="flex min-h-12 items-center rounded-xl px-3 text-base font-medium text-coffee-light active:bg-blush-soft"
                >
                  {l.label}
                </a>
              ))}
            </div>
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="mt-4 flex min-h-13 items-center justify-center gap-2 rounded-full bg-rose px-5 font-semibold text-white active:bg-rose-dark"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Agendar pelo WhatsApp
            </a>
          </nav>
        </>
      )}
    </header>
  );
}
