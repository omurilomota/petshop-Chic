import { BUSINESS } from "../config";

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
    </footer>
  );
}
