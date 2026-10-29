import type { ReactNode } from "react";
import type { AppointmentStatus } from "./types";
import { cn } from "../utils/cn";
import { initials } from "./format";
import { LineIcon, PawIcon } from "../components/icons";

export type DemoIconName =
  | "home"
  | "calendar"
  | "users"
  | "heart"
  | "calculator"
  | "file"
  | "arrow"
  | "check"
  | "spark"
  | "plus"
  | "refresh"
  | "external"
  | "money"
  | "trend"
  | "target"
  | "clock"
  | "chat"
  | "star"
  | "chevron-left"
  | "chevron-right"
  | "menu"
  | "x"
  | "search";

const ICON_PATHS: Record<DemoIconName, string> = {
  home: "M3 11l9-8 9 8M5 10v10h14V10",
  calendar:
    "M8 2v4M16 2v4M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  users:
    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  heart:
    "M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z",
  calculator:
    "M9 7h6M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15h.01M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z",
  file: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13h8M8 17h8",
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M20 6L9 17l-5-5",
  spark: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z",
  plus: "M12 5v14M5 12h14",
  refresh:
    "M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0114.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0020.5 15",
  external: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
  money: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  trend: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  target:
    "M12 22a10 10 0 100-20 10 10 0 000 20zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z",
  clock: "M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z",
  chat: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z",
  star: "M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z",
  "chevron-left": "M15 18l-6-6 6-6",
  "chevron-right": "M9 18l6-6-6-6",
  menu: "M4 7h16M4 12h16M4 17h16",
  x: "M6 6l12 12M6 18L18 6",
  search: "M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z",
};

export function DemoIcon({ name, className = "h-5 w-5" }: { name: DemoIconName; className?: string }) {
  return <LineIcon d={ICON_PATHS[name]} className={className} />;
}

export function Brand({ subtitle = "Painel", href = "#/" }: { subtitle?: string; href?: string }) {
  return (
    <a href={href} className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose text-cream">
        <PawIcon className="h-5 w-5" />
      </span>
      <span className="font-serif text-xl font-bold text-coffee">
        Chic<span className="text-rose">Pets</span>
      </span>
      {subtitle && (
        <span className="hidden rounded-full bg-blush-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose sm:inline-block">
          {subtitle}
        </span>
      )}
    </a>
  );
}

type Tone = "rose" | "blue" | "amber" | "emerald" | "neutral";

const TONES: Record<Tone, string> = {
  rose: "bg-blush-soft text-rose",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  neutral: "bg-cream-dark text-coffee-light",
};

export function Card({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div id={id} className={cn("rounded-2xl border border-cream-dark bg-white p-5 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = "rose",
  trend,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: DemoIconName;
  tone?: Tone;
  trend?: number;
}) {
  return (
    <div className="rounded-2xl border border-cream-dark bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-mocha">{label}</p>
        {icon && (
          <span className={cn("flex h-9 w-9 flex-none items-center justify-center rounded-xl", TONES[tone])}>
            <DemoIcon name={icon} className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-3 font-serif text-2xl font-bold leading-none text-coffee sm:text-3xl">{value}</p>
      {hint && <p className="mt-2 text-xs leading-relaxed text-mocha">{hint}</p>}
      {trend !== undefined && (
        <p className={cn("mt-1 text-xs font-semibold", trend >= 0 ? "text-emerald-600" : "text-red-600")}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}% vs. mês anterior
        </p>
      )}
    </div>
  );
}

const STATUS: Record<AppointmentStatus, { label: string; className: string; dot: string }> = {
  scheduled: { label: "Agendado", className: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  confirmed: { label: "Confirmado", className: "border-blue-200 bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  completed: {
    label: "Concluído",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  no_show: { label: "Faltou", className: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500" },
  canceled: { label: "Cancelado", className: "border-stone-200 bg-stone-100 text-stone-600", dot: "bg-stone-400" },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const config = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        config.className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-rose">{eyebrow}</p>}
        <h1 className="mt-1 font-serif text-3xl font-bold text-coffee sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-coffee-light">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="font-serif text-lg font-bold text-coffee">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-mocha">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-cream-dark", className)}>
      <div
        className="h-full rounded-full bg-rose transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex h-10 w-10 flex-none items-center justify-center rounded-full bg-blush-soft text-xs font-bold text-rose",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export function EmptyState({
  icon = "calendar",
  title,
  description,
  action,
}: {
  icon?: DemoIconName;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-cream-dark bg-white/60 px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blush-soft text-rose">
        <DemoIcon name={icon} className="h-6 w-6" />
      </span>
      <p className="mt-3 font-semibold text-coffee">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-mocha">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
