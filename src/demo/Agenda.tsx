import { useState } from "react";
import { useDemo } from "./SupabaseDemoContext";
import { getService, getOpenMinutes } from "./mockData";
import type { Appointment, AppointmentStatus } from "./types";
import {
  addDays,
  capitalize,
  clientWaLink,
  firstName,
  formatBRL,
  formatDateLong,
  formatDateShort,
  parseDateKey,
  startOfDay,
  toDateKey,
} from "./format";
import { Avatar, Card, DemoIcon, EmptyState, PageHeader, Pill, StatusBadge } from "./components";
import { cn } from "../utils/cn";

function defaultAgendaDate(): string {
  let date = startOfDay(new Date());
  while (getOpenMinutes(date) === 0) date = addDays(date, 1);
  return toDateKey(date);
}

function initialAgendaDate(): string {
  const match = window.location.hash.match(/[?&]data=(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  return defaultAgendaDate();
}

function nextOpenDate(key: string): string {
  let date = addDays(parseDateKey(key), 1);
  while (getOpenMinutes(date) === 0) date = addDays(date, 1);
  return toDateKey(date);
}

function confirmationMessage(
  clientName: string,
  petName: string,
  serviceName: string,
  date: string,
  start: string,
): string {
  return `Oi ${firstName(clientName)}! Tudo bem? Passando para confirmar o ${serviceName} do ${petName} na ChicPets em ${formatDateShort(date)} às ${start}. Até logo! 🐾`;
}

function messageForStatus(
  status: AppointmentStatus,
  clientName: string,
  petName: string,
  serviceName: string,
  date: string,
  start: string,
): string {
  if (status === "completed") {
    return `Oi ${firstName(clientName)}! O ${petName} ficou lindo depois do ${serviceName} de ${formatDateShort(date)}. Obrigado pela confiança! 🐾`;
  }
  if (status === "canceled" || status === "no_show") {
    return `Oi ${firstName(clientName)}! Sentimos falta do ${petName} no ${serviceName} de ${formatDateShort(date)}. Quer remarcar? Tenho horários esta semana. 🐾`;
  }
  return confirmationMessage(clientName, petName, serviceName, date, start);
}

export function Agenda() {
  const { clients, appointments, updateAppointmentStatus, markContacted } = useDemo();
  const [selectedDate, setSelectedDate] = useState(initialAgendaDate);
  const [monthOffset, setMonthOffset] = useState(0);

  const today = startOfDay(new Date());
  const todayKey = toDateKey(today);
  const viewMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthStart = startOfDay(viewMonth);
  const monthLabel = viewMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const firstWeekday = monthStart.getDay();
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, index) => startOfDay(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), index + 1)));
  const leadingBlanks = firstWeekday;

  const clientById = new Map(clients.map((client) => [client.id, client]));
  const petById = new Map(clients.flatMap((client) => client.pets.map((pet) => [pet.id, pet] as const)));

  const countByDate = new Map<string, number>();
  for (const appointment of appointments) {
    if (appointment.status === "canceled") continue;
    countByDate.set(appointment.date, (countByDate.get(appointment.date) ?? 0) + 1);
  }

  const dayAppointments = appointments
    .filter((appointment) => appointment.date === selectedDate)
    .sort((a, b) => a.start.localeCompare(b.start));
  const isOpen = getOpenMinutes(parseDateKey(selectedDate)) > 0;
  const activeAppointments = dayAppointments.filter(
    (appointment) => appointment.status !== "canceled" && appointment.status !== "no_show",
  );
  const dayRevenue = activeAppointments.reduce((total, appointment) => total + appointment.price, 0);
  const confirmedCount = dayAppointments.filter(
    (appointment) => appointment.status === "scheduled" || appointment.status === "confirmed",
  ).length;
  const completedCount = dayAppointments.filter((appointment) => appointment.status === "completed").length;

  const goMonth = (delta: number) => {
    setMonthOffset((prev) => prev + delta);
  };

  const resetToToday = () => {
    setMonthOffset(0);
    setSelectedDate(defaultAgendaDate());
  };

  const changeStatus = (appointment: Appointment, status: AppointmentStatus) => {
    updateAppointmentStatus(appointment.id, status);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Agenda"
        title="Agenda mensal"
        description="Clique em um dia para ver os atendimentos. As alterações refletem no painel na hora."
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

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-rose">
              {monthLabel}
            </p>
            <p className="mt-0.5 text-sm text-mocha">
              {monthDays.length} dias
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              aria-label="Mês anterior"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-dark text-coffee hover:border-rose/40 hover:text-rose"
            >
              <DemoIcon name="chevron-left" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={resetToToday}
              className="rounded-full border border-cream-dark px-3 py-1.5 text-xs font-semibold text-coffee hover:border-rose/40 hover:text-rose"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => goMonth(1)}
              aria-label="Próximo mês"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-dark text-coffee hover:border-rose/40 hover:text-rose"
            >
              <DemoIcon name="chevron-right" className="h-4 w-4" />
            </button>
          </div>
        </div>

                <div className="mt-4">
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-mocha">
            {["Dom","Seg","Ter","Qua","Qui","Sex","Sab"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <div key={`b-${i}`} />
            ))}
            {monthDays.map((day) => {
              const key = toDateKey(day);
              const selected = key === selectedDate;
              const closed = getOpenMinutes(day) === 0;
              const count = countByDate.get(key) ?? 0;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  className={cn(
                    "flex flex-col items-center rounded-xl border py-3 text-center transition",
                    selected ? "border-rose bg-rose text-white shadow-sm" : "border-cream-dark bg-white text-coffee hover:border-rose/40",
                  )}
                >
                  <span className={cn("font-serif text-base font-bold", selected ? "text-white" : "text-coffee")}>{day.getDate()}</span>
                  <span className={cn("mt-1 text-[11px] font-semibold", selected ? "text-white/85" : count > 0 ? "text-rose" : "text-mocha/60")}>
                    {closed ? "fech." : count > 0 ? `${count}` : "·"}
                  </span>
                  {key === todayKey && !selected && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose" />}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-rose">
                {selectedDate === todayKey ? "Hoje" : "Dia selecionado"}
              </p>
              <h2 className="mt-1 font-serif text-2xl font-bold text-coffee">{capitalize(formatDateLong(selectedDate))}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill tone="blue">{dayAppointments.length} agendamentos</Pill>
              <Pill tone="emerald">{completedCount} concluídos</Pill>
              <Pill tone="neutral">{formatBRL(dayRevenue)} previstos</Pill>
            </div>
          </div>

          {!isOpen && (
            <EmptyState
              icon="calendar"
              title="Fechado aos domingos"
              description="A ChicPets abre de segunda a sábado. Escolha o próximo dia útil para ver a agenda."
              action={
                <button
                  type="button"
                  onClick={() => setSelectedDate(nextOpenDate(selectedDate))}
                  className="rounded-full bg-rose px-4 py-2 text-sm font-semibold text-white hover:bg-rose-dark"
                >
                  Ver próximo dia útil
                </button>
              }
            />
          )}

          {isOpen && dayAppointments.length === 0 && (
            <EmptyState
              icon="calendar"
              title="Nenhum agendamento neste dia"
              description="O dia está livre. Envie o link de agendamento para os clientes ou ofereça os horários para a lista de espera."
              action={
                <a
                  href="#/agendar"
                  className="inline-flex items-center gap-2 rounded-full bg-rose px-4 py-2 text-sm font-semibold text-white hover:bg-rose-dark"
                >
                  <DemoIcon name="plus" className="h-4 w-4" />
                  Abrir agendamento online
                </a>
              }
            />
          )}

          {isOpen &&
            dayAppointments.map((appointment) => {
              const client = clientById.get(appointment.clientId);
              const pet = petById.get(appointment.petId);
              const service = getService(appointment.serviceId);
              const canChange = appointment.status === "scheduled" || appointment.status === "confirmed";
              return (
                <Card key={appointment.id} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                    <div className="flex items-center gap-3 sm:w-24 sm:flex-col sm:items-start sm:gap-1">
                      <span className="font-serif text-xl font-bold text-coffee">{appointment.start}</span>
                      <span className="text-xs text-mocha">{appointment.durationMin} min</span>
                    </div>

                    <div className="hidden h-12 w-px bg-cream-dark sm:block" />

                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <Avatar name={client?.name ?? "Cliente"} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-coffee">{client?.name ?? "Cliente"}</p>
                          <StatusBadge status={appointment.status} />
                        </div>
                        <p className="mt-0.5 text-sm text-mocha">
                          {pet?.name ?? "Pet"} · {pet?.breed ?? "SRD"}
                        </p>
                        <p className="mt-1 text-sm text-coffee-light">
                          {service.name} · <strong className="text-coffee">{formatBRL(appointment.price)}</strong>
                        </p>
                        {appointment.needsTaxi && (
                          <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            Taxi dog (busca e entrega)
                          </span>
                        )}
                        {appointment.notes && (
                          <p className="mt-1 rounded-lg bg-cream px-2 py-1 text-[11px] text-coffee-light">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-stretch gap-2 sm:items-end">
                      {client && (
                        <a
                          href={clientWaLink(
                            client.phone,
                            messageForStatus(
                              appointment.status,
                              client.name,
                              pet?.name ?? "seu pet",
                              service.name,
                              appointment.date,
                              appointment.start,
                            ),
                          )}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => markContacted(client.id)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          <DemoIcon name="chat" className="h-3.5 w-3.5" />
                          {appointment.status === "completed"
                            ? "Agradecer no WhatsApp"
                            : appointment.status === "canceled" || appointment.status === "no_show"
                              ? "Chamar no WhatsApp"
                              : "Confirmar no WhatsApp"}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-cream-dark/70 pt-3">
                    {canChange ? (
                      <>
                        <button
                          type="button"
                          onClick={() => changeStatus(appointment, "completed")}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          <DemoIcon name="check" className="h-3.5 w-3.5" />
                          Concluir
                        </button>
                        <button
                          type="button"
                          onClick={() => changeStatus(appointment, "no_show")}
                          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          Faltou
                        </button>
                        <button
                          type="button"
                          onClick={() => changeStatus(appointment, "canceled")}
                          className="rounded-full px-3 py-1.5 text-xs font-semibold text-mocha hover:bg-cream hover:text-coffee"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => changeStatus(appointment, "confirmed")}
                        className="rounded-full border border-cream-dark px-3 py-1.5 text-xs font-semibold text-coffee hover:border-rose/40 hover:text-rose"
                      >
                        Reabrir
                      </button>
                    )}
                    <span className="ml-auto text-[11px] text-mocha">
                      {appointment.status === "completed"
                        ? "Atendimento concluído"
                        : appointment.status === "no_show"
                          ? "Falta registrada"
                          : appointment.status === "canceled"
                            ? "Cancelado"
                            : "Aguardando confirmação"}
                    </span>
                  </div>
                </Card>
              );
            })}
        </div>

        <div className="space-y-4">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-widest text-rose">Resumo do dia</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-cream p-3">
                <p className="text-[11px] uppercase tracking-wide text-mocha">Agendados</p>
                <p className="mt-1 font-serif text-2xl font-bold text-coffee">{dayAppointments.length}</p>
              </div>
              <div className="rounded-xl bg-cream p-3">
                <p className="text-[11px] uppercase tracking-wide text-mocha">Concluídos</p>
                <p className="mt-1 font-serif text-2xl font-bold text-coffee">{completedCount}</p>
              </div>
              <div className="rounded-xl bg-cream p-3">
                <p className="text-[11px] uppercase tracking-wide text-mocha">A confirmar</p>
                <p className="mt-1 font-serif text-2xl font-bold text-coffee">{confirmedCount}</p>
              </div>
              <div className="rounded-xl bg-cream p-3">
                <p className="text-[11px] uppercase tracking-wide text-mocha">Previsto</p>
                <p className="mt-1 font-serif text-2xl font-bold text-coffee">{formatBRL(dayRevenue)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-widest text-rose">Link para o cliente</p>
            <p className="mt-2 text-sm leading-relaxed text-coffee-light">
              O cliente agenda sozinho e o horário já cai aqui. Use o botão abaixo para testar o fluxo completo.
            </p>
            <a
              href="#/agendar"
              className="mt-4 flex items-center justify-center gap-2 rounded-full border border-rose/30 bg-blush-soft px-4 py-2.5 text-sm font-semibold text-rose hover:bg-blush-soft/70"
            >
              <DemoIcon name="external" className="h-4 w-4" />
              Abrir agendamento online
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
