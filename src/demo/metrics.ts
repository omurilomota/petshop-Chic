import type { Appointment, AppointmentSource, Client, ServiceId, Subscription } from "./types";
import {
  MONTHS_SHORT,
  addDays,
  daysBetween,
  formatMonthYear,
  parseDateKey,
  startOfDay,
  toDateKey,
} from "./format";
import {
  CAPACITY,
  OPEN_MINUTES,
  SLOT_MINUTES,
  countOverlaps,
  getOpenMinutes,
  getPlan,
  getService,
} from "./mockData";

export interface ClientStats {
  client: Client;
  lastVisit: string | null;
  totalSpent: number;
  visits: number;
  lastVisitDays: number | null;
  subscription: Subscription | null;
  isNew: boolean;
}

export interface ClubCandidate {
  client: Client;
  visits: number;
  lastVisit: string | null;
}

export interface SubscriptionStats {
  active: Subscription[];
  paused: Subscription[];
  canceled: Subscription[];
  mrr: number;
  members: number;
  churnRate: number;
  avgPlan: number;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  value: number;
  hint: string;
  href: string;
  tone: "rose" | "amber" | "emerald" | "blue";
}

export interface RevenuePoint {
  key: string;
  label: string;
  value: number;
}

export interface SourcePoint {
  source: AppointmentSource;
  label: string;
  value: number;
  percent: number;
}

export interface TopService {
  id: ServiceId;
  name: string;
  count: number;
  revenue: number;
}

export interface DashboardData {
  monthKey: string;
  monthLabel: string;
  revenue: number;
  previousRevenue: number;
  revenueChange: number;
  completedCount: number;
  scheduledCount: number;
  noShowCount: number;
  canceledCount: number;
  avgTicket: number;
  occupancy: number;
  noShowRate: number;
  activeClients: number;
  inactiveClients: number;
  newClients: number;
  returningClients: number;
  mrr: number;
  clubMembers: number;
  revenueByMonth: RevenuePoint[];
  revenueBySource: SourcePoint[];
  topServices: TopService[];
  agendaDayKey: string;
  agendaLabel: string;
  agendaAppointments: Appointment[];
  opportunities: Opportunity[];
  opportunityTotal: number;
  emptySlotsNext7: number;
  clubCandidates: number;
  avgReturnDays: number;
  monthTarget: number;
  monthProgress: number;
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export function getClientStats(
  clients: Client[],
  appointments: Appointment[],
  subscriptions: Subscription[],
): ClientStats[] {
  const today = startOfDay(new Date());
  const byClient = new Map<
    string,
    { lastVisit: string | null; totalSpent: number; visits: number; firstVisit: string | null }
  >();

  for (const appointment of appointments) {
    if (appointment.status !== "completed") continue;
    const current = byClient.get(appointment.clientId) ?? {
      lastVisit: null,
      totalSpent: 0,
      visits: 0,
      firstVisit: null,
    };
    current.totalSpent += appointment.price;
    current.visits += 1;
    if (!current.lastVisit || appointment.date > current.lastVisit) current.lastVisit = appointment.date;
    if (!current.firstVisit || appointment.date < current.firstVisit) current.firstVisit = appointment.date;
    byClient.set(appointment.clientId, current);
  }

  const activeSubscriptions = new Map<string, Subscription>();
  for (const subscription of subscriptions) {
    if (subscription.status === "active") activeSubscriptions.set(subscription.clientId, subscription);
  }

  return clients.map((client) => {
    const stats = byClient.get(client.id) ?? {
      lastVisit: null,
      totalSpent: 0,
      visits: 0,
      firstVisit: null,
    };
    return {
      client,
      lastVisit: stats.lastVisit,
      totalSpent: stats.totalSpent,
      visits: stats.visits,
      lastVisitDays: stats.lastVisit ? daysBetween(parseDateKey(stats.lastVisit), today) : null,
      subscription: activeSubscriptions.get(client.id) ?? null,
      isNew: stats.firstVisit ? daysBetween(parseDateKey(stats.firstVisit), today) <= 60 : false,
    };
  });
}

export function getClubCandidates(
  clients: Client[],
  appointments: Appointment[],
  subscriptions: Subscription[],
): ClubCandidate[] {
  const activeSubscriptions = new Set(
    subscriptions.filter((subscription) => subscription.status === "active").map((subscription) => subscription.clientId),
  );
  const cutoff = toDateKey(addDays(startOfDay(new Date()), -120));
  const counts = new Map<string, { visits: number; lastVisit: string | null }>();

  for (const appointment of appointments) {
    if (appointment.status !== "completed" || appointment.date < cutoff) continue;
    const current = counts.get(appointment.clientId) ?? { visits: 0, lastVisit: null };
    current.visits += 1;
    if (!current.lastVisit || appointment.date > current.lastVisit) current.lastVisit = appointment.date;
    counts.set(appointment.clientId, current);
  }

  return clients
    .filter((client) => !activeSubscriptions.has(client.id) && (counts.get(client.id)?.visits ?? 0) >= 3)
    .map((client) => ({
      client,
      visits: counts.get(client.id)?.visits ?? 0,
      lastVisit: counts.get(client.id)?.lastVisit ?? null,
    }))
    .sort((a, b) => b.visits - a.visits);
}

export function getSubscriptionStats(subscriptions: Subscription[]): SubscriptionStats {
  const active = subscriptions.filter((subscription) => subscription.status === "active");
  const paused = subscriptions.filter((subscription) => subscription.status === "paused");
  const canceled = subscriptions.filter((subscription) => subscription.status === "canceled");
  const mrr = sum(active.map((subscription) => getPlan(subscription.planId).price));

  return {
    active,
    paused,
    canceled,
    mrr,
    members: active.length,
    churnRate: subscriptions.length ? ((paused.length + canceled.length) / subscriptions.length) * 100 : 0,
    avgPlan: active.length ? mrr / active.length : 0,
  };
}

function countEmptySlots(appointments: Appointment[]): number {
  const today = startOfDay(new Date());
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const service = getService("banho");
  let count = 0;

  for (let day = 0; day < 7; day++) {
    const date = addDays(today, day);
    if (getOpenMinutes(date) === 0) continue;
    const dateKey = toDateKey(date);
    const close = date.getDay() === 6 ? 14 * 60 : 18 * 60;
    for (let start = OPEN_MINUTES; start + service.durationMin <= close; start += SLOT_MINUTES) {
      if (day === 0 && start < nowMinutes + 30) continue;
      if (countOverlaps(appointments, dateKey, start, start + service.durationMin) < CAPACITY) count++;
    }
  }

  return count;
}

function averageReturnDays(appointments: Appointment[]): number {
  const byClient = new Map<string, string[]>();
  for (const appointment of appointments) {
    if (appointment.status !== "completed") continue;
    const dates = byClient.get(appointment.clientId) ?? [];
    dates.push(appointment.date);
    byClient.set(appointment.clientId, dates);
  }

  const gaps: number[] = [];
  for (const dates of byClient.values()) {
    const sorted = [...new Set(dates)].sort();
    for (let index = 1; index < sorted.length; index++) {
      const gap = daysBetween(parseDateKey(sorted[index - 1]), parseDateKey(sorted[index]));
      if (gap > 7 && gap < 180) gaps.push(gap);
    }
  }

  return gaps.length ? sum(gaps) / gaps.length : 0;
}

export function getDashboardData(
  clients: Client[],
  appointments: Appointment[],
  subscriptions: Subscription[],
): DashboardData {
  const today = startOfDay(new Date());
  const todayKey = toDateKey(today);
  const monthKey = todayKey.slice(0, 7);
  const previousMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const previousMonthKey = toDateKey(previousMonthDate).slice(0, 7);

  const monthAppointments = appointments.filter((appointment) => appointment.date.startsWith(monthKey));
  const completed = monthAppointments.filter((appointment) => appointment.status === "completed");
  const noShows = monthAppointments.filter((appointment) => appointment.status === "no_show");
  const canceled = monthAppointments.filter((appointment) => appointment.status === "canceled");
  const scheduled = monthAppointments.filter(
    (appointment) => appointment.status === "scheduled" || appointment.status === "confirmed",
  );

  const revenue = sum(completed.map((appointment) => appointment.price));
  // Compara o mesmo período do mês anterior (1 a 20 de outubro vs. 1 a 20 de
  // setembro), e não o mês fechado — senão todo dia 20 pareceria uma queda.
  const daysInPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  const previousMonthDayLimit = `${previousMonthKey}-${String(
    Math.min(today.getDate(), daysInPreviousMonth),
  ).padStart(2, "0")}`;
  const previousRevenue = sum(
    appointments
      .filter(
        (appointment) =>
          appointment.status === "completed" &&
          appointment.date.startsWith(previousMonthKey) &&
          appointment.date <= previousMonthDayLimit,
      )
      .map((appointment) => appointment.price),
  );
  const revenueChange = previousRevenue ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;
  const avgTicket = completed.length ? revenue / completed.length : 0;
  const noShowRate =
    completed.length + noShows.length ? (noShows.length / (completed.length + noShows.length)) * 100 : 0;

  let availableMinutes = 0;
  const dayCursor = new Date(today.getFullYear(), today.getMonth(), 1);
  while (dayCursor <= today) {
    availableMinutes += getOpenMinutes(dayCursor) * CAPACITY;
    dayCursor.setDate(dayCursor.getDate() + 1);
  }
  const occupiedMinutes = sum([...completed, ...noShows].map((appointment) => appointment.durationMin));
  const occupancy = availableMinutes ? Math.min(100, (occupiedMinutes / availableMinutes) * 100) : 0;

  const clientStats = getClientStats(clients, appointments, subscriptions);
  const activeClients = clientStats.filter((stats) => stats.lastVisitDays !== null && stats.lastVisitDays <= 60).length;
  const inactiveClients = clientStats.filter((stats) => stats.lastVisitDays !== null && stats.lastVisitDays > 60).length;

  const firstVisitByClient = new Map<string, string>();
  for (const appointment of appointments) {
    if (appointment.status === "canceled") continue;
    const current = firstVisitByClient.get(appointment.clientId);
    if (!current || appointment.date < current) firstVisitByClient.set(appointment.clientId, appointment.date);
  }
  const newClients = clients.filter((client) => firstVisitByClient.get(client.id)?.startsWith(monthKey)).length;
  const completedThisMonth = new Set(completed.map((appointment) => appointment.clientId));
  const returningClients = clients.filter((client) => {
    const first = firstVisitByClient.get(client.id);
    return completedThisMonth.has(client.id) && first !== undefined && first < `${monthKey}-01`;
  }).length;

  const subscriptionStats = getSubscriptionStats(subscriptions);
  const mrr = subscriptionStats.mrr;
  const clubMembers = subscriptionStats.members;

  const revenueByMonth: RevenuePoint[] = [];
  for (let index = 5; index >= 0; index--) {
    const date = new Date(today.getFullYear(), today.getMonth() - index, 1);
    const key = toDateKey(date).slice(0, 7);
    const value = sum(
      appointments
        .filter((appointment) => appointment.status === "completed" && appointment.date.startsWith(key))
        .map((appointment) => appointment.price),
    );
    revenueByMonth.push({ key, label: MONTHS_SHORT[date.getMonth()], value });
  }

  const sourceLabels: Record<AppointmentSource, string> = {
    site: "Site",
    whatsapp: "WhatsApp",
    manual: "Balcão",
    referral: "Indicação",
  };
  const sourceValues = new Map<AppointmentSource, number>();
  for (const appointment of completed) {
    sourceValues.set(appointment.source, (sourceValues.get(appointment.source) ?? 0) + appointment.price);
  }
  const revenueBySource: SourcePoint[] = (Object.keys(sourceLabels) as AppointmentSource[])
    .map((source) => ({
      source,
      label: sourceLabels[source],
      value: sourceValues.get(source) ?? 0,
      percent: revenue ? ((sourceValues.get(source) ?? 0) / revenue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const serviceCounts = new Map<ServiceId, { count: number; revenue: number }>();
  for (const appointment of completed) {
    const current = serviceCounts.get(appointment.serviceId) ?? { count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += appointment.price;
    serviceCounts.set(appointment.serviceId, current);
  }
  const topServices: TopService[] = [...serviceCounts.entries()]
    .map(([id, value]) => ({ id, name: getService(id).name, count: value.count, revenue: value.revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const agendaDate = today.getDay() === 0 ? addDays(today, 1) : today;
  const agendaDayKey = toDateKey(agendaDate);
  const agendaAppointments = appointments.filter((appointment) => appointment.date === agendaDayKey);
  const agendaLabel = today.getDay() === 0 ? "Próximo dia útil" : "Hoje";

  const emptySlotsNext7 = countEmptySlots(appointments);
  const clubCandidates = getClubCandidates(clients, appointments, subscriptions).length;
  const avgReturnDays = averageReturnDays(appointments);

  const emptySlotsOpportunity = Math.round(emptySlotsNext7 * avgTicket * 0.3);
  const inactiveOpportunity = Math.round(inactiveClients * 0.12 * avgTicket);
  // Mesma meta de 30% usada na calculadora e na proposta (11% → 8%).
  // Antes o painel assumia recuperar 50% das faltas e mostrava um número
  // maior do que a proposta; agora as duas telas contam a mesma história.
  const noShowCurrentRate = Math.max(5, Math.round(noShowRate));
  const noShowTargetRate = Math.max(5, Math.round(noShowCurrentRate * 0.7));
  const noShowOpportunity = Math.round(
    (completed.length + noShows.length) *
      ((noShowCurrentRate - noShowTargetRate) / 100) *
      Math.round(avgTicket),
  );
  const clubOpportunity = Math.round(clubCandidates * 0.2 * getPlan("banho-em-dia").price);

  const opportunities: Opportunity[] = [
    {
      id: "empty-slots",
      title: "Horários livres nos próximos 7 dias",
      description: "Ofereça para a lista de espera e para quem já é cliente.",
      value: emptySlotsOpportunity,
      hint: `${emptySlotsNext7} horários livres`,
      href: "#/demo/agenda",
      tone: "blue",
    },
    {
      id: "inactive-clients",
      title: "Clientes sem voltar há mais de 2 meses",
      description: "Uma mensagem pode trazer parte deles de volta.",
      value: inactiveOpportunity,
      hint: `${inactiveClients} clientes`,
      href: "#/demo/clientes",
      tone: "amber",
    },
    {
      id: "no-show",
      title: "Faltas que dá para evitar",
      description: "Lembrete e confirmação podem reduzir as faltas em 30%.",
      value: noShowOpportunity,
      hint: `${noShows.length} faltas no mês`,
      href: "#/demo/agenda",
      tone: "rose",
    },
    {
      id: "club",
      title: "Clientes que podem entrar no clube",
      description: "Quem vem sempre e ainda não tem um plano mensal.",
      value: clubOpportunity,
      hint: `${clubCandidates} clientes`,
      href: "#/demo/clube",
      tone: "emerald",
    },
  ];
  const opportunityTotal = sum(opportunities.map((opportunity) => opportunity.value));
  const monthTarget = Math.max(20_000, Math.ceil(revenue / 0.85 / 1000) * 1000);

  return {
    monthKey,
    monthLabel: formatMonthYear(monthKey),
    revenue,
    previousRevenue,
    revenueChange,
    completedCount: completed.length,
    scheduledCount: scheduled.length,
    noShowCount: noShows.length,
    canceledCount: canceled.length,
    avgTicket,
    occupancy,
    noShowRate,
    activeClients,
    inactiveClients,
    newClients,
    returningClients,
    mrr,
    clubMembers,
    revenueByMonth,
    revenueBySource,
    topServices,
    agendaDayKey,
    agendaLabel,
    agendaAppointments,
    opportunities,
    opportunityTotal,
    emptySlotsNext7,
    clubCandidates,
    avgReturnDays,
    monthTarget,
    monthProgress: Math.min(100, (revenue / monthTarget) * 100),
  };
}
