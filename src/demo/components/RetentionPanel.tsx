import { useRetention } from "../hooks/useRetention";
import { Card } from "../components";
import { cn } from "../../utils/cn";

const RISK_COLORS: Record<string, string> = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

export function RetentionPanel() {
  const { stats, churnRisk } = useRetention();

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-rose">
          Retenção de Clientes
        </h3>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-cream p-3">
            <p className="text-[11px] uppercase tracking-wide text-mocha">Total</p>
            <p className="mt-1 font-serif text-xl font-bold text-coffee">{stats.totalClients}</p>
          </div>
          <div className="rounded-xl bg-cream p-3">
            <p className="text-[11px] uppercase tracking-wide text-mocha">Ativos</p>
            <p className="mt-1 font-serif text-xl font-bold text-emerald-600">{stats.activeClients}</p>
          </div>
          <div className="rounded-xl bg-cream p-3">
            <p className="text-[11px] uppercase tracking-wide text-mocha">Em risco</p>
            <p className="mt-1 font-serif text-xl font-bold text-amber-600">{stats.atRiskClients}</p>
          </div>
          <div className="rounded-xl bg-cream p-3">
            <p className="text-[11px] uppercase tracking-wide text-mocha">Clientes inativos</p>
            <p className="mt-1 font-serif text-xl font-bold text-coffee">{stats.churnRate.toFixed(1)}%</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-cream">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${(stats.activeClients / (stats.totalClients || 1)) * 100}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-mocha">
            {stats.activeClients} de {stats.totalClients} clientes ativos (
            {((stats.activeClients / (stats.totalClients || 1)) * 100).toFixed(0)}%)
          </p>
        </div>
      </Card>

      <Card className="p-5">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-rose">
          Clientes em Risco (top 10)
        </h4>
        <div className="mt-3 space-y-2">
          {churnRisk.map((client) => (
            <div
              key={client.clientId}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2",
                RISK_COLORS[client.risk],
              )}
            >
              <div>
                <p className="text-sm font-semibold">{client.clientName}</p>
                <p className="text-[11px] opacity-80">
                  {client.daysSinceLastVisit === 999
                    ? "Nunca atendido"
                    : `Há ${client.daysSinceLastVisit} dias`}
                </p>
              </div>
              <span className="text-[10px] font-semibold uppercase">
                {client.risk === "high" ? "Alto" : client.risk === "medium" ? "Médio" : "Baixo"}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
