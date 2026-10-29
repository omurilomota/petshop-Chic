import { useMemo } from "react";
import { useDemo } from "../SupabaseDemoContext";
import { daysBetween, parseDateKey, startOfDay } from "../format";

interface ChurnRisk {
  clientId: string;
  clientName: string;
  daysSinceLastVisit: number;
  risk: "low" | "medium" | "high";
  suggestedAction: string;
}

interface RetentionStats {
  totalClients: number;
  activeClients: number;
  atRiskClients: number;
  churnRate: number;
  avgDaysBetweenVisits: number;
}

export function useRetention() {
  const { clients, appointments, subscriptions } = useDemo();

  const stats = useMemo<RetentionStats>(() => {
    const today = startOfDay(new Date());

    const lastVisit = new Map<string, string>();
    for (const apt of appointments) {
      if (apt.status === "canceled" || apt.status === "no_show") continue;
      const current = lastVisit.get(apt.clientId);
      if (!current || apt.date > current) {
        lastVisit.set(apt.clientId, apt.date);
      }
    }

    const activeClients = new Set<string>();
    for (const sub of subscriptions) {
      if (sub.status === "active") activeClients.add(sub.clientId);
    }

    const clientsWithVisits = clients.filter((c) => lastVisit.has(c.id));
    const atRisk = clientsWithVisits.filter((c) => {
      const last = lastVisit.get(c.id)!;
      const days = daysBetween(parseDateKey(last), today);
      return days > 45 && !activeClients.has(c.id);
    });

    let totalGaps = 0;
    let gapCount = 0;
    for (const c of clientsWithVisits) {
      const visits = appointments
        .filter((a) => a.clientId === c.id && a.status === "completed")
        .map((a) => a.date)
        .sort();
      for (let i = 1; i < visits.length; i++) {
        totalGaps += daysBetween(parseDateKey(visits[i - 1]), parseDateKey(visits[i]));
        gapCount++;
      }
    }

    return {
      totalClients: clients.length,
      activeClients: activeClients.size,
      atRiskClients: atRisk.length,
      churnRate: clients.length ? (atRisk.length / clients.length) * 100 : 0,
      avgDaysBetweenVisits: gapCount > 0 ? totalGaps / gapCount : 0,
    };
  }, [clients, appointments, subscriptions]);

  const churnRisk = useMemo<ChurnRisk[]>(() => {
    const today = startOfDay(new Date());

    const lastVisit = new Map<string, string>();
    for (const apt of appointments) {
      if (apt.status === "canceled" || apt.status === "no_show") continue;
      const current = lastVisit.get(apt.clientId);
      if (!current || apt.date > current) {
        lastVisit.set(apt.clientId, apt.date);
      }
    }

    const activeSubs = new Set(
      subscriptions.filter((s) => s.status === "active").map((s) => s.clientId),
    );

    return clients
      .map((client) => {
        const last = lastVisit.get(client.id);
        if (!last) {
          return {
            clientId: client.id,
            clientName: client.name,
            daysSinceLastVisit: 999,
            risk: "high" as const,
            suggestedAction: "Primeiro contato — cliente inativo há muito tempo",
          };
        }

        const days = daysBetween(parseDateKey(last), today);
        let risk: "low" | "medium" | "high";
        let action: string;

        if (days <= 30) {
          risk = "low";
          action = "Manter contato de rotina";
        } else if (days <= 60) {
          risk = "medium";
          action = "Enviar promoção ou lembrete";
        } else {
          risk = "high";
          action = "Campanha de reativação urgente";
        }

        if (activeSubs.has(client.id)) {
          risk = "low";
          action = "Cliente ativo com assinatura";
        }

        return {
          clientId: client.id,
          clientName: client.name,
          daysSinceLastVisit: days,
          risk,
          suggestedAction: action,
        };
      })
      .sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit)
      .slice(0, 20);
  }, [clients, appointments, subscriptions]);

  return { stats, churnRisk };
}
