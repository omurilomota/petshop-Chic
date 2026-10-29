import { useState } from "react";
import { useDemo } from "./SupabaseDemoContext";
import { getClubCandidates, getSubscriptionStats, type ClubCandidate } from "./metrics";
import { PLANS, getPlan } from "./mockData";
import type { PlanId } from "./types";
import { clientWaLink, firstName, formatBRL, formatDateShort, formatNumber, formatPercent } from "./format";
import {
  Avatar,
  Card,
  DemoIcon,
  EmptyState,
  KpiCard,
  PageHeader,
  Pill,
  SectionHeading,
} from "./components";
import { cn } from "../utils/cn";

function planSavings(planId: PlanId): number {
  const plan = getPlan(planId);
  return plan.baths * 60 + plan.grooms * 80 - plan.price;
}

function CandidateRow({
  candidate,
  onAdd,
}: {
  candidate: ClubCandidate;
  onAdd: (clientId: string, planId: PlanId) => void;
}) {
  const [planId, setPlanId] = useState<PlanId>("banho-em-dia");
  const { client, visits, lastVisit } = candidate;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-cream-dark bg-cream/40 p-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar name={client.name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-coffee">{client.name}</p>
          <p className="text-[11px] text-mocha">
            {visits} visitas nos últimos 120 dias
            {lastVisit ? ` · última em ${formatDateShort(lastVisit)}` : ""}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={planId}
          onChange={(event) => setPlanId(event.target.value as PlanId)}
          className="rounded-full border border-cream-dark bg-white px-3 py-2 text-xs font-medium text-coffee focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20"
          aria-label={`Plano para ${client.name}`}
        >
          {PLANS.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} · {formatBRL(plan.price)}/mês
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onAdd(client.id, planId)}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-coffee px-3 py-2 text-xs font-semibold text-cream hover:bg-coffee-light"
        >
          <DemoIcon name="plus" className="h-3.5 w-3.5" />
          Adicionar ao clube
        </button>
      </div>
    </div>
  );
}

export function Club() {
  const { clients, appointments, subscriptions, addSubscription, markContacted } = useDemo();
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const [showAllSubscribers, setShowAllSubscribers] = useState(false);

  const stats = getSubscriptionStats(subscriptions);
  const candidates = getClubCandidates(clients, appointments, subscriptions);
  const clientById = new Map(clients.map((client) => [client.id, client]));
  const activeSubscriptions = [...stats.active].sort((a, b) => a.nextBilling.localeCompare(b.nextBilling));
  const visibleSubscriptions = showAllSubscribers ? activeSubscriptions : activeSubscriptions.slice(0, 6);

  const scrollToCandidates = () => {
    document.getElementById("candidatos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAdd = (clientId: string, planId: PlanId) => {
    const client = clientById.get(clientId);
    addSubscription(clientId, planId);
    setAddedMessage(
      `${client?.name ?? "Cliente"} entrou no clube com o plano ${getPlan(planId).name}. As mensalidades já foram atualizadas.`,
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Clube ChicPets"
        title="Receita que entra todo mês"
        description="O clube transforma banho avulso em mensalidade. O cliente economiza, a ChicPets sabe quanto vai faturar antes do mês começar."
        action={
          <button
            type="button"
            onClick={scrollToCandidates}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark"
          >
            <DemoIcon name="users" className="h-4 w-4" />
            Ver quem pode entrar
          </button>
        }
      />

      {addedMessage && (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <div className="flex items-start gap-2">
            <DemoIcon name="check" className="mt-0.5 h-4 w-4 flex-none" />
            <span>{addedMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setAddedMessage(null)}
            aria-label="Fechar aviso"
            className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-emerald-700 hover:bg-emerald-100"
          >
            <DemoIcon name="x" className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard label="Mensalidades do clube" value={formatBRL(stats.mrr)} hint={`${stats.members} clientes no clube`} />
        <KpiCard label="Em 12 meses" value={formatBRL(stats.mrr * 12)} hint="Se os clientes continuarem" />
        <KpiCard label="Mensalidade média" value={formatBRL(stats.avgPlan)} hint="Por cliente do clube" />
        <KpiCard
          label="Cancelamentos"
          value={formatPercent(stats.churnRate)}
          hint={`${stats.paused.length + stats.canceled.length} clientes pausaram ou cancelaram`}
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-coffee p-5 text-cream shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blush">Dinheiro que entra todo mês</p>
            <p className="mt-1 font-serif text-3xl font-bold sm:text-4xl">
              {formatBRL(stats.mrr)}
              <span className="text-base font-sans font-normal text-cream/70">/mês</span>
            </p>
            <p className="mt-1 max-w-xl text-sm text-cream/80">
              Isso é <strong>{formatBRL(stats.mrr * 12)}</strong> em 12 meses se os clientes continuarem. O clube deixa
              o mês menos dependente de banho avulso.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-cream/60">Meta</p>
            <p className="font-serif text-2xl font-bold">50</p>
            <p className="text-[11px] text-cream/70">clientes</p>
          </div>
        </div>
      </div>

      <div>
        <SectionHeading
          title="Planos do clube"
          description="Preço fechado, banhos incluídos e prioridade na agenda."
        />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const featured = plan.id === "banho-em-dia";
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col",
                  featured && "border-rose/30",
                )}
              >
                {featured && (
                  <span className="absolute -top-3 left-5 rounded-full bg-rose px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Mais popular
                  </span>
                )}
                <p className="text-xs font-semibold uppercase tracking-widest text-rose">{plan.name}</p>
                <p className="mt-2 font-serif text-3xl font-bold text-coffee">
                  {formatBRL(plan.price)}
                  <span className="font-sans text-sm font-normal text-mocha">/mês</span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-mocha">{plan.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-coffee-light">
                  {plan.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <DemoIcon name="check" className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-4">
                  <p className="rounded-xl bg-cream p-2 text-center text-xs text-coffee-light">
                    Avulso: <strong className="text-coffee">{formatBRL(plan.baths * 60 + plan.grooms * 80)}</strong> ·
                    economia de <strong className="text-emerald-700">{formatBRL(planSavings(plan.id))}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={scrollToCandidates}
                    className={cn(
                      "mt-3 w-full rounded-full px-4 py-2.5 text-sm font-semibold",
                      featured
                        ? "bg-rose text-white hover:bg-rose-dark"
                        : "border border-cream-dark bg-white text-coffee hover:border-rose/40 hover:text-rose",
                    )}
                  >
                    Oferecer para um cliente
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <SectionHeading
            title="Clientes no clube"
            description={`${stats.members} clientes pagando todo mês`}
            action={<span className="text-xs font-semibold text-mocha">{formatBRL(stats.mrr)}/mês</span>}
          />
          <div className="mt-4 divide-y divide-cream-dark/70">
            {visibleSubscriptions.map((subscription) => {
              const client = clientById.get(subscription.clientId);
              if (!client) return null;
              const plan = getPlan(subscription.planId);
              const pet = client.pets[0]?.name ?? "seu pet";
              return (
                <div key={subscription.id} className="flex items-center gap-3 py-3">
                  <Avatar name={client.name} className="h-9 w-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-coffee">{client.name}</p>
                    <p className="text-[11px] text-mocha">
                      {plan.name} · próxima cobrança {formatDateShort(subscription.nextBilling)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-coffee">{formatBRL(plan.price)}</span>
                  <a
                    href={clientWaLink(
                      client.phone,
                      `Oi ${firstName(client.name)}! Tudo bem? Seu plano ${plan.name} está ativo. Quer já deixar o banho do ${pet} agendado esta semana? 🐾`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => markContacted(client.id)}
                    aria-label={`Falar com ${client.name} no WhatsApp`}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  >
                    <DemoIcon name="chat" className="h-3.5 w-3.5" />
                  </a>
                </div>
              );
            })}
            {activeSubscriptions.length === 0 && (
              <EmptyState
                icon="star"
                title="Nenhum cliente no clube ainda"
                description="Adicione um cliente da lista para começar a construir as mensalidades do clube."
              />
            )}
          </div>
          {activeSubscriptions.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllSubscribers((current) => !current)}
              className="mt-3 w-full rounded-full border border-cream-dark bg-white px-4 py-2 text-xs font-semibold text-coffee hover:border-rose/40 hover:text-rose"
            >
              {showAllSubscribers ? "Mostrar menos" : `Ver todos os ${activeSubscriptions.length} clientes`}
            </button>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <SectionHeading title="Como funciona" description="Fácil para o cliente, dinheiro que se repete para a loja." />
          <div className="mt-4 space-y-4">
            {[
              {
                icon: "refresh" as const,
                title: "Cliente assina",
                text: "Paga todo mês no cartão ou Pix e garante os banhos do período.",
              },
              {
                icon: "calendar" as const,
                title: "Prioridade na agenda",
                text: "O cliente do clube tem horário reservado e não fica esperando vaga.",
              },
              {
                icon: "money" as const,
                title: "Dinheiro que se repete",
                text: "Você sabe quanto entra antes do mês começar e fica menos dependente de dias fracos.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-blush-soft text-rose">
                  <DemoIcon name={item.icon} className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-coffee">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-mocha">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-cream p-3 text-xs leading-relaxed text-coffee-light">
            Cada cliente do clube vale em média <strong className="text-coffee">{formatBRL(stats.avgPlan)}</strong> por
            mês. Com 50 clientes, as mensalidades passam de{" "}
            <strong className="text-coffee">{formatBRL(stats.avgPlan * 50)}</strong>.
          </div>
        </Card>
      </div>

      <Card id="candidatos">
        <SectionHeading
          title="Quem tem perfil para o clube"
          description="Clientes com 3 ou mais visitas nos últimos 4 meses que ainda não têm plano."
          action={<Pill tone="rose">{candidates.length} clientes</Pill>}
        />
        <p className="mt-2 text-xs leading-relaxed text-mocha">
          Escolha o plano e clique em adicionar. O cliente entra na lista e as mensalidades do clube sobem na hora — é
          a mesma conta que o painel usa.
        </p>
        <div className="mt-4 space-y-2">
          {candidates.slice(0, 12).map((candidate) => (
            <CandidateRow key={candidate.client.id} candidate={candidate} onAdd={handleAdd} />
          ))}
          {candidates.length === 0 && (
            <EmptyState
              icon="users"
              title="Todos os clientes frequentes já estão no clube"
              description="Boa notícia: a base já está convertida. Agora o foco é manter os clientes do clube ativos e buscar novos clientes."
            />
          )}
        </div>
        {candidates.length > 12 && (
          <p className="mt-3 text-center text-[11px] text-mocha">
            Mostrando 12 de {formatNumber(candidates.length)} clientes.
          </p>
        )}
      </Card>
    </div>
  );
}
