import { useState } from "react";
import { useDemo } from "./SupabaseDemoContext";
import { getClientStats, type ClientStats } from "./metrics";
import { getPlan } from "./mockData";
import {
  clientWaLink,
  firstName,
  formatBRL,
  formatDateShort,
  formatNumber,
} from "./format";
import { Avatar, Card, DemoIcon, EmptyState, KpiCard, PageHeader, Pill } from "./components";
import { cn } from "../utils/cn";

type Filter = "all" | "active" | "inactive" | "club";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "active", label: "Ativos" },
  { id: "inactive", label: "Sem voltar" },
  { id: "club", label: "No clube" },
];

function messageFor(stat: ClientStats): string {
  const tutor = firstName(stat.client.name);
  const pet = stat.client.pets[0]?.name ?? "seu pet";
  const lastVisit = stat.lastVisitDays;
  const variant = (lastVisit ?? stat.visits) % 3;

  if (stat.subscription) {
    const plan = getPlan(stat.subscription.planId);
    return variant === 0
      ? `Oi ${tutor}! Seu plano ${plan.name} está ativo. Quer deixar o banho do ${pet} agendado esta semana?`
      : `Oi ${tutor}! Tudo bem? O ${pet} já usou os banhos do plano ${plan.name} este mês? Se quiser, reservo o próximo. 🐾`;
  }
  if (lastVisit !== null && lastVisit > 60) {
    return [
      `Oi ${tutor}! Aqui é da ChicPets 🐾 Faz ${lastVisit} dias que o ${pet} não aparece. Separei alguns horários esta semana; quer que eu reserve um?`,
      `Oi ${tutor}! Tudo bem? O ${pet} já está na época do banho e faz um tempinho que vocês não vêm. Tenho horário na quinta e na sexta. Quer que eu guarde um?`,
      `Oi ${tutor}! Sentimos falta do ${pet} por aqui 🐾 Se quiser, já deixo um banho reservado esta semana. É só me dizer o melhor dia.`,
    ][variant];
  }
  if (stat.visits === 0) {
    return variant === 0
      ? `Oi ${tutor}! Aqui é da ChicPets. Vi que o ${pet} ainda não conhece a gente. Quer agendar o primeiro banho? Temos horários esta semana. 🐾`
      : `Oi ${tutor}! Tudo bem? O ${pet} já tem horário para o primeiro banho? A ChicPets fica na Rua Bela Horizonte e tem vaga esta semana.`;
  }
  return [
    `Oi ${tutor}! Tudo bem? O ${pet} já está na época do banho? Temos horários esta semana na ChicPets. Se quiser, eu já reservo. 🐾`,
    `Oi ${tutor}! Passando para lembrar do banho do ${pet}. Quer que eu reserve um horário?`,
    `Oi ${tutor}! O ${pet} está precisando de um trato? Temos horários na quinta e na sexta. 🐾`,
  ][variant];
}

function ClientRow({
  stat,
  contacted,
  onContact,
}: {
  stat: ClientStats;
  contacted: boolean;
  onContact: () => void;
}) {
  const { client, subscription, lastVisit, lastVisitDays, totalSpent, visits, isNew } = stat;
  const plan = subscription ? getPlan(subscription.planId) : null;
  const inactive = lastVisitDays !== null && lastVisitDays > 60;
  const active = lastVisitDays !== null && lastVisitDays <= 60;
  const lastVisitLabel =
    lastVisit && lastVisitDays !== null
      ? lastVisitDays === 0
        ? "hoje"
        : `${formatDateShort(lastVisit)} · ${lastVisitDays}d`
      : "Sem visita";
  const pets = client.pets.map((pet) => pet.name).join(", ");

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={client.name} className="h-11 w-11" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-coffee">{client.name}</p>
              {isNew ? (
                <Pill tone="blue">Novo</Pill>
              ) : inactive ? (
                <Pill tone="amber">Sem voltar</Pill>
              ) : active ? (
                <Pill tone="emerald">Ativo</Pill>
              ) : (
                <Pill tone="neutral">Sem visita</Pill>
              )}
              {plan && <Pill tone="rose">{plan.name}</Pill>}
            </div>
            <p className="mt-0.5 text-xs text-mocha">{client.phone}</p>
            <p className="mt-1 truncate text-xs text-coffee-light">
              {pets || "Nenhum pet cadastrado"}
              {client.pets[0]?.breed ? ` · ${client.pets[0].breed}` : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:flex sm:items-center sm:gap-5">
          <div className="sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-mocha">Última visita</p>
            <p className="mt-0.5 text-sm font-semibold text-coffee">{lastVisitLabel}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-mocha">Total gasto</p>
            <p className="mt-0.5 text-sm font-semibold text-coffee">{formatBRL(totalSpent)}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-mocha">Visitas</p>
            <p className="mt-0.5 text-sm font-semibold text-coffee">{formatNumber(visits)}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-cream-dark/70 pt-3">
        <a
          href={clientWaLink(client.phone, messageFor(stat))}
          target="_blank"
          rel="noreferrer"
          onClick={onContact}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
            inactive
              ? "bg-amber-500 text-white hover:bg-amber-600"
              : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
          )}
        >
          <DemoIcon name="chat" className="h-3.5 w-3.5" />
          {inactive ? "Chamar de volta" : subscription ? "Falar com o cliente" : "Chamar no WhatsApp"}
        </a>
        {contacted && <Pill tone="emerald">Contatado hoje</Pill>}
        {lastVisitDays !== null && lastVisitDays > 30 && !inactive && (
          <span className="text-[11px] text-amber-700">Já está na hora de chamar de novo</span>
        )}
        <span className="ml-auto text-[11px] text-mocha">Cliente desde {formatDateShort(client.createdAt)}</span>
      </div>
    </Card>
  );
}

export function Clients() {
  const { clients, appointments, subscriptions, contacted, markContacted } = useDemo();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);

  const stats = getClientStats(clients, appointments, subscriptions);
  const activeCount = stats.filter((stat) => stat.lastVisitDays !== null && stat.lastVisitDays <= 60).length;
  const inactiveCount = stats.filter((stat) => stat.lastVisitDays !== null && stat.lastVisitDays > 60).length;
  const clubCount = stats.filter((stat) => stat.subscription !== null).length;

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = stats
    .filter((stat) => {
      if (normalizedSearch) {
        const haystack = `${stat.client.name} ${stat.client.phone} ${stat.client.pets
          .map((pet) => `${pet.name} ${pet.breed}`)
          .join(" ")}`.toLowerCase();
        if (!haystack.includes(normalizedSearch)) return false;
      }
      if (filter === "active") return stat.lastVisitDays !== null && stat.lastVisitDays <= 60;
      if (filter === "inactive") return stat.lastVisitDays !== null && stat.lastVisitDays > 60;
      if (filter === "club") return stat.subscription !== null;
      return true;
    })
    .sort((a, b) => {
      if (filter === "club") return a.client.name.localeCompare(b.client.name);
      if (filter === "active") return (a.lastVisitDays ?? 0) - (b.lastVisitDays ?? 0);
      if (filter === "inactive") return (b.lastVisitDays ?? 0) - (a.lastVisitDays ?? 0);

      // "Todos": primeiro quem tem visita, do mais recente para o mais antigo.
      // Quem nunca veio fica no fim — não é uma boa primeira impressão abrir a
      // base com cinco cadastros sem nenhum atendimento.
      if (a.lastVisitDays === null && b.lastVisitDays !== null) return 1;
      if (a.lastVisitDays !== null && b.lastVisitDays === null) return -1;
      if (a.lastVisitDays !== null && b.lastVisitDays !== null && a.lastVisitDays !== b.lastVisitDays) {
        return a.lastVisitDays - b.lastVisitDays;
      }
      return b.totalSpent - a.totalSpent;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const changeFilter = (next: Filter) => {
    setFilter(next);
    setPage(1);
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Clientes"
        title="Quem já confia na ChicPets"
        description="A base inteira em um lugar só. Busque, veja quem sumiu e abra a conversa no WhatsApp com um clique."
        action={
          <a
            href="#/agendar"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark"
          >
            <DemoIcon name="plus" className="h-4 w-4" />
            Novo agendamento
          </a>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard label="Total de clientes" value={formatNumber(clients.length)} hint="Base cadastrada" />
        <KpiCard label="Ativos" value={formatNumber(activeCount)} hint="Visitaram nos últimos 2 meses" />
        <KpiCard label="Sem voltar" value={formatNumber(inactiveCount)} hint="Há mais de 2 meses" />
        <KpiCard label="No clube" value={formatNumber(clubCount)} hint="Pagando todo mês" />
      </div>

      {filter !== "inactive" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <DemoIcon name="spark" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  {inactiveCount} clientes estão há mais de 2 meses sem voltar.
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
                  Uma mensagem com o nome do pet custa 30 segundos e reabre a conversa. Filtre por “Sem voltar” e
                  chame no WhatsApp.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => changeFilter("inactive")}
              className="flex-none rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600"
            >
              Ver sem voltar
            </button>
          </div>
        </div>
      )}

      <Card className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <DemoIcon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mocha"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => changeSearch(event.target.value)}
              placeholder="Buscar por tutor, telefone ou pet..."
              className="w-full rounded-full border border-cream-dark bg-cream/50 py-2.5 pl-9 pr-4 text-sm text-coffee placeholder:text-mocha/70 focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((item) => {
              const count =
                item.id === "all"
                  ? stats.length
                  : item.id === "active"
                    ? activeCount
                    : item.id === "inactive"
                      ? inactiveCount
                      : clubCount;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => changeFilter(item.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    filter === item.id
                      ? "bg-coffee text-cream"
                      : "border border-cream-dark bg-white text-coffee hover:border-rose/40 hover:text-rose",
                  )}
                >
                  {item.label}
                  <span className={cn("ml-1.5", filter === item.id ? "text-cream/60" : "text-mocha/60")}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-rose">Base de clientes</p>
        <p className="text-xs text-mocha">
          {filtered.length} encontrados · página {safePage} de {totalPages}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="Ninguém encontrado com esse filtro"
          description="Tente outro nome, telefone ou pet. Você também pode limpar a busca e ver a base inteira."
          action={
            <button
              type="button"
              onClick={() => {
                changeSearch("");
                changeFilter("all");
              }}
              className="rounded-full bg-rose px-4 py-2 text-sm font-semibold text-white hover:bg-rose-dark"
            >
              Limpar filtros
            </button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {visible.map((stat) => (
            <ClientRow
              key={stat.client.id}
              stat={stat}
              contacted={contacted.has(stat.client.id)}
              onContact={() => markContacted(stat.client.id)}
            />
          ))}
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="rounded-full border border-cream-dark bg-white px-4 py-2 text-sm font-semibold text-coffee hover:border-rose/40 hover:text-rose disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-mocha">
            Página {safePage} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="rounded-full border border-cream-dark bg-white px-4 py-2 text-sm font-semibold text-coffee hover:border-rose/40 hover:text-rose disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
