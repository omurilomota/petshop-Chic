import { useEffect, useState } from "react";
import { waLink } from "../config";
import { PawIcon } from "./icons";

const links = [
  { label: "Início", href: "#inicio" },
  { label: "Serviços", href: "#servicos" },
  { label: "Galeria", href: "#galeria" },
  { label: "Sobre", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

function Logo() {
  return (
    <a href="#inicio" className="flex items-center gap-2">
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors ${
        scrolled || open ? "bg-cream shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
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
          className="p-2 text-coffee md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-cream-dark px-5 py-4 md:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={close} className="rounded-lg px-3 py-2.5 font-medium text-coffee-light hover:bg-blush-soft">
              {l.label}
            </a>
          ))}
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="mt-2 rounded-full bg-rose px-5 py-3 text-center font-semibold text-white"
          >
            Agendar pelo WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}
