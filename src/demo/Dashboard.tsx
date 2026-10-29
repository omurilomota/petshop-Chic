import { useDemo } from "./SupabaseDemoContext";
import { getDashboardData } from "./metrics";
import { getService } from "./mockData";
import { formatBRL, formatDateLong, formatNumber, formatPercent } from "./format";
import { RetentionPanel } from "./components/RetentionPanel";
import {
  Card,
  DemoIcon,
  EmptyState,
  KpiCard,
  PageHeader,
  ProgressBar,
  SectionHeading,
  StatusBadge,
} from "./components";

export function Dashboard() {
  const { clients, appointments, subscriptions } = useDemo();
  const data = getDashboardData(clients, appointments, subscriptions);

  const clientById = new Map(clients.map((client) => [client.id, client]));
  const petById = new Map(clients.flatMap((client) => client.pets.map((pet) => [pet.id, pet] as const)));
  const maxRevenue = Math.max(...data.revenueByMonth.map((point) => point.value), 1);
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedRevenue = Math.round((data.revenue / Math.max(1, now.getDate())) * daysInMonth);

  const agendaAppointments = [...data.agendaAppointments].sort((a, b) => a.start.localeCompare(b.start));
  const activeAgenda = agendaAppointments.filter(
    (appointment) => appointment.status !== "canceled" && appointment.status !== "no_show",
  );
  const agendaRevenue = activeAgenda.reduce((total, appointment) => total + appointment.price, 0);
  const nextAppointment = activeAgenda.find(
    (appointment) => appointment.status === "scheduled" || appointment.status === "confirmed",
  );
  const nextPet = nextAppointment ? petById.get(nextAppointment.petId) : undefined;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow={data.monthLabel}
        title="Visão geral"
        description="O que está acontecendo na ChicPets e onde está o dinheiro."
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

      <div className="flex flex-col gap-3 rounded-2xl border border-cream-dark bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-blush-soft text-rose">
            <DemoIcon name="calendar" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-rose">{data.agendaLabel}</p>
            <p className="mt-0.5 text-sm font-semibold text-coffee">{formatDateLong(data.agendaDayKey)}</p>
            <p className="mt-1 text-xs text-mocha">
              {activeAgenda.length} atendimentos · {formatBRL(agendaRevenue)} previstos
              {nextAppointment && nextPet ? ` · próximo às ${nextAppointment.start} com ${nextPet.name}` : ""}
            </p>
          </div>
        </div>
        <a
          href="#/demo/agenda"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-cream-dark px-4 py-2 text-xs font-semibold text-coffee hover:border-rose/40 hover:text-rose"
        >
          Abrir agenda
          <DemoIcon name="arrow" className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard
          label="Faturamento do mês"
          value={formatBRL(data.revenue)}
          hint={`No ritmo atual: ${formatBRL(projectedRevenue)}`}
        />
        <KpiCard
          label="Atendimentos"
          value={formatNumber(data.completedCount)}
          hint={`${data.scheduledCount} ainda agendados`}
        />
        <KpiCard
          label="Faltas"
          value={formatPercent(data.noShowRate)}
          hint={`${data.noShowCount} horários perdidos no mês`}
        />
        <KpiCard
          label="Clientes que voltaram"
          value={formatNumber(data.activeClients)}
          hint={`${data.inactiveClients} sem voltar há mais de 2 meses`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2">
        <KpiCard
          label="Previsto para o mês"
          value={formatBRL(projectedRevenue)}
          hint="Ritmo atual de agendamentos"
          tone="emerald"
        />
        <KpiCard
          label="Expectativa de lucro"
          value={formatBRL(Math.round(projectedRevenue * 0.65))}
          hint="Margem estimada de 65% sobre o previsto"
          tone="blue"
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-coffee p-5 text-cream shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blush">Dinheiro na mesa</p>
            <p className="mt-1 font-serif text-3xl font-bold sm:text-4xl">{formatBRL(data.opportunityTotal)}</p>
          </div>
          <a
            href="#/demo/calculadora"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-coffee hover:bg-white"
          >
            Fazer a conta
            <DemoIcon name="arrow" className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeading title="O que dá para recuperar" description="Ações com dinheiro parado neste mês." />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.opportunities.map((opportunity) => (
              <a
                key={opportunity.id}
                href={opportunity.href}
                className="group rounded-xl border border-cream-dark p-4 transition hover:border-rose/40 hover:bg-blush-soft/25"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug text-coffee">{opportunity.title}</p>
                  <span className="font-serif text-lg font-bold text-coffee">{formatBRL(opportunity.value)}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-mocha">{opportunity.description}</p>
                <p className="mt-2 text-[11px] font-semibold text-rose">
                  {opportunity.hint} <span aria-hidden="true">→</span>
                </p>
              </a>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeading
            title={`Agenda de ${data.agendaLabel.toLowerCase()}`}
            description={formatDateLong(data.agendaDayKey)}
            action={
              <a href="#/demo/agenda" className="text-xs font-semibold text-rose hover:text-rose-dark">
                Ver tudo
              </a>
            }
          />
          <div className="mt-4 space-y-2.5">
            {agendaAppointments.slice(0, 5).map((appointment) => {
              const client = clientById.get(appointment.clientId);
              const pet = petById.get(appointment.petId);
              const service = getService(appointment.serviceId);
              return (
                <div key={appointment.id} className="flex items-center gap-5 rounded-xl bg-cream/70 p-2.5">
                  <span className="w-14 flex-none text-xs font-bold text-coffee">{appointment.start}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-coffee">
                      {client?.name ?? "Cliente"} · {pet?.name ?? "Pet"}
                    </p>
                    <p className="truncate text-[11px] text-mocha">{service.name}</p>
                  </div>
                  <StatusBadge status={appointment.status} />
                </div>
              );
            })}
            {agendaAppointments.length === 0 && (
              <EmptyState
                title="Nenhum agendamento"
                description="O dia está livre. Que tal oferecer os horários para a lista de espera?"
                action={
                  <a href="#/demo/agenda" className="text-sm font-semibold text-rose">
                    Abrir agenda
                  </a>
                }
              />
            )}
          </div>
        </Card>
      </div>

      <details className="group rounded-2xl border border-cream-dark bg-white p-5 shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
          <div>
            <h2 className="font-serif text-lg font-bold text-coffee">Ver mais números</h2>
            <p className="mt-0.5 text-xs text-mocha">
              Faturamento dos últimos 6 meses, origem, meta, clube e serviços.
            </p>
          </div>
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-cream-dark text-coffee transition group-open:rotate-90">
            <DemoIcon name="chevron-right" className="h-4 w-4" />
          </span>
        </summary>

        <div className="mt-5 space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="shadow-none lg:col-span-2">
              <SectionHeading
                title="Faturamento dos últimos 6 meses"
                description="Serviços concluídos, sem produtos. O último mês está em andamento."
                action={
                  <span className="hidden rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold text-mocha sm:inline-flex">
                    Mês atual em andamento
                  </span>
                }
              />
              <div className="mt-6 flex h-48 items-end gap-2 sm:gap-4">
                {data.revenueByMonth.map((point) => (
                  <div key={point.key} className="flex flex-1 flex-col items-center gap-2">
                    <span className="hidden text-[10px] font-semibold text-mocha sm:block">
                      {formatBRL(point.value)}
                    </span>
                    <div className="flex h-36 w-full items-end">
                      <div
                        className="w-full rounded-t-lg bg-rose transition-all"
                        style={{ height: `${Math.max(4, (point.value / maxRevenue) * 100)}%` }}
                        title={`${point.label}: ${formatBRL(point.value)}`}
                      />
                    </div>
                    <span className="text-[11px] font-medium uppercase text-mocha">{point.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="shadow-none">
              <SectionHeading title="Como o cliente marcou" description="De onde vem a receita do mês." />
              <div className="mt-5 space-y-4">
                {data.revenueBySource.map((source) => (
                  <div key={source.source}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-medium text-coffee">{source.label}</span>
                      <span className="text-mocha">
                        {formatBRL(source.value)} · {formatPercent(source.percent)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream-dark">
                      <div className="h-full rounded-full bg-rose" style={{ width: `${source.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-none">
              <SectionHeading title="Meta do mês" description={data.monthLabel} />
              <p className="mt-4 font-serif text-2xl font-bold text-coffee">
                {formatBRL(data.revenue)}{" "}
                <span className="font-sans text-sm font-normal text-mocha">de {formatBRL(data.monthTarget)}</span>
              </p>
              <ProgressBar value={data.monthProgress} className="mt-3" />
              <p className="mt-2 text-xs text-mocha">
                {formatPercent(data.monthProgress)} da meta. Faltam{" "}
                {formatBRL(Math.max(0, data.monthTarget - data.revenue))}.
              </p>
            </Card>

            <Card className="shadow-none">
              <SectionHeading
                title="Clube ChicPets"
                description="Mensalidades que entram todo mês."
                action={
                  <a href="#/demo/clube" className="text-xs font-semibold text-rose hover:text-rose-dark">
                    Ver clube
                  </a>
                }
              />
              <p className="mt-4 font-serif text-2xl font-bold text-coffee">
                {formatBRL(data.mrr)}
                <span className="font-sans text-sm font-normal text-mocha">/mês</span>
              </p>
              <p className="mt-1 text-xs text-mocha">
                {data.clubMembers} clientes no clube · {data.clubCandidates} podem entrar
              </p>
              <ProgressBar value={(data.clubMembers / 50) * 100} className="mt-3" />
              <p className="mt-2 text-xs text-mocha">Meta: 50 clientes</p>
            </Card>

            <Card className="shadow-none">
              <SectionHeading title="Serviços que mais faturaram" description="No mês atual." />
              <div className="mt-4 space-y-3">
                {data.topServices.slice(0, 4).map((service) => (
                  <div key={service.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-coffee">{service.name}</p>
                      <p className="text-[11px] text-mocha">{service.count} atendimentos</p>
                    </div>
                    <span className="text-sm font-semibold text-coffee">{formatBRL(service.revenue)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </details>

      <RetentionPanel />
    </div>
  );
}
