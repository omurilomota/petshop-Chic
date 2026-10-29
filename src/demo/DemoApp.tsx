import { useDemo } from "./SupabaseDemoContext";
import { Brand, DemoIcon, type DemoIconName } from "./components";
import { Dashboard } from "./Dashboard";
import { Agenda } from "./Agenda";
import { Clients } from "./Clients";
import { Club } from "./Club";
import { Calculator } from "./Calculator";
import { Proposal } from "./Proposal";
import { cn } from "../utils/cn";

const NAV: { page: string; href: string; label: string; icon: DemoIconName }[] = [
  { page: "", href: "#/demo", label: "Visão geral", icon: "home" },
  { page: "agenda", href: "#/demo/agenda", label: "Agenda", icon: "calendar" },
  { page: "clientes", href: "#/demo/clientes", label: "Clientes", icon: "users" },
  { page: "clube", href: "#/demo/clube", label: "Clube", icon: "star" },
  { page: "calculadora", href: "#/demo/calculadora", label: "Calculadora", icon: "calculator" },
  { page: "proposta", href: "#/demo/proposta", label: "Proposta", icon: "file" },
];

export function DemoApp({ route }: { route: string }) {
  const { reset } = useDemo();
  const path = route.split("?")[0].replace(/\/+$/, "");
  const page = path.replace("#/demo", "").replace(/^\//, "");

  const handleReset = () => {
    if (window.confirm("Reiniciar os dados da demonstração? Os agendamentos e mensalidades criados serão apagados.")) {
      reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPage = () => {
    switch (page) {
      case "agenda":
        return <Agenda />;
      case "clientes":
        return <Clients />;
      case "clube":
        return <Club />;
      case "calculadora":
        return <Calculator />;
      case "proposta":
        return <Proposal />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="border-b border-cream-dark/70 bg-white/75 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Brand subtitle="Painel" href="#/demo" />
            <span className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-800 sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              Modo demonstração
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-800 sm:hidden">
              Dados fictícios
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-full border border-cream-dark bg-white px-3 py-1.5 text-xs font-semibold text-coffee hover:border-rose/40 hover:text-rose"
            >
              <DemoIcon name="refresh" className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reiniciar demo</span>
              <span className="sm:hidden">Reiniciar</span>
            </button>
            <a
              href="#/"
              className="inline-flex items-center gap-1.5 rounded-full bg-coffee px-3.5 py-1.5 text-xs font-semibold text-cream hover:bg-coffee-light"
            >
              <DemoIcon name="external" className="h-3.5 w-3.5" />
              Voltar ao site
            </a>
          </div>
        </div>

        <nav className="border-t border-cream-dark/60 bg-white/60">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-1 px-4 py-2 sm:px-6 lg:px-8">
            {NAV.map((item) => {
              const active = page === item.page || (page === "" && item.page === "");
              return (
                <a
                  key={item.page}
                  href={item.href}
                  className={cn(
                    "flex flex-none items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition",
                    active
                      ? "bg-coffee text-cream shadow-sm"
                      : "text-coffee hover:bg-blush-soft hover:text-rose",
                  )}
                >
                  <DemoIcon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-8 print:max-w-none print:p-0">
        {renderPage()}
      </main>

      <footer className="border-t border-cream-dark/70 bg-white/60 print:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-[11px] text-mocha sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            <strong className="text-coffee">Dados fictícios para demonstração.</strong> Nenhum dado real da ChicPets é
            usado.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="font-semibold text-coffee hover:text-rose"
            >
              Reiniciar dados
            </button>
            <span className="text-cream-dark">·</span>
            <a href="#/" className="font-semibold text-coffee hover:text-rose">
              Voltar ao site
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
