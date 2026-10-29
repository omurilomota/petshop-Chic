import { useState } from "react";
import { useDemo } from "./SupabaseDemoContext";
import { getDashboardData } from "./metrics";
import { DEFAULT_ROI, computeRoi, targetFrequencyFor, type RoiInputs } from "./roi";
import { formatBRL, formatPercent } from "./format";
import { Card, DemoIcon, PageHeader, SectionHeading } from "./components";
import { cn } from "../utils/cn";

type Scenario = "conservative" | "base" | "optimistic" | "custom";

function RangeField({
  label,
  value,
  min,
  max,
  step,
  format,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  hint?: string;
  onChange: (value: number) => void;
}) {
  const progress = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-coffee">{label}</label>
        <span className="font-serif text-lg font-bold text-coffee">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="range-input mt-2 w-full"
        style={{
          background: `linear-gradient(to right, var(--color-rose) ${progress}%, var(--color-cream-dark) ${progress}%)`,
        }}
      />
      {hint && <p className="mt-1 text-[11px] leading-relaxed text-mocha">{hint}</p>}
    </div>
  );
}

export function Calculator() {
  const { clients, appointments, subscriptions } = useDemo();
  const data = getDashboardData(clients, appointments, subscriptions);
  const avgTicket = Math.max(40, Math.round(data.avgTicket || 75));
  const currentNoShow = Math.max(5, Math.round(data.noShowRate || 20));
  const frequency = Math.max(20, Math.round(data.avgReturnDays || 45));

  const demoInputs: RoiInputs = {
    appointmentsPerMonth: Math.max(100, data.completedCount + data.scheduledCount),
    // A taxa de faltas é calculada sobre quem já passou (concluídos + faltas).
    // Usar o total de agendamentos aqui inflava o ganho.
    noShowBase: data.completedCount + data.noShowCount,
    ticket: avgTicket,
    noShowCurrent: currentNoShow,
    // 11% → 8%: a mesma redução de 30% prometida no teste.
    noShowTarget: Math.max(5, Math.round(currentNoShow * 0.7)),
    activeClients: Math.max(50, data.activeClients),
    currentFrequency: frequency,
    targetFrequency: targetFrequencyFor(frequency),
    inactiveClients: Math.max(20, data.inactiveClients),
    reactivationRate: 12,
    monthlyFee: DEFAULT_ROI.monthlyFee,
  };

  // Os cenários partem dos números da demo; assim os botões não jogam o dono
  // de volta para uma operação genérica de 20% de faltas.
  const conservativeInputs: RoiInputs = {
    ...demoInputs,
    noShowTarget: Math.max(5, Math.round(currentNoShow * 0.85)),
    reactivationRate: 8,
    targetFrequency: Math.min(90, targetFrequencyFor(frequency) + 3),
  };
  const optimisticInputs: RoiInputs = {
    ...demoInputs,
    noShowTarget: Math.max(2, Math.round(currentNoShow * 0.5)),
    reactivationRate: 18,
    targetFrequency: Math.max(15, targetFrequencyFor(frequency) - 3),
  };

  const [inputs, setInputs] = useState<RoiInputs>(demoInputs);
  const [scenario, setScenario] = useState<Scenario>("base");
  const result = computeRoi(inputs);

  const update = (key: keyof RoiInputs, value: number) => {
    setInputs((current) => ({
      ...current,
      [key]: value,
      // Ao mudar o volume, a base de faltas acompanha para a conta não ficar
      // presa no número de uma simulação anterior.
      ...(key === "appointmentsPerMonth" ? { noShowBase: value } : {}),
    }));
    setScenario("custom");
  };

  const applyScenario = (next: Scenario) => {
    setScenario(next);
    if (next === "conservative") setInputs(conservativeInputs);
    if (next === "base") setInputs(demoInputs);
    if (next === "optimistic") setInputs(optimisticInputs);
  };

  const useDemoData = () => {
    setInputs(demoInputs);
    setScenario("base");
  };

  const noShowBase = inputs.noShowBase ?? inputs.appointmentsPerMonth;
  const returningClients = Math.round(inputs.inactiveClients * (inputs.reactivationRate / 100));
  const maxGain = Math.max(result.noShowGain, result.reactivationGain, result.frequencyGain, 1);
  const breakdown = [
    {
      label: "Menos faltas",
      value: result.noShowGain,
      description: `${inputs.noShowCurrent}% → ${inputs.noShowTarget}%`,
      color: "bg-rose",
    },
    {
      label: "Trazer clientes de volta",
      value: result.reactivationGain,
      description: `${inputs.reactivationRate}% dos ${inputs.inactiveClients} sem voltar`,
      color: "bg-amber-500",
    },
    {
      label: "Voltar mais vezes",
      value: result.frequencyGain,
      description: `${inputs.currentFrequency} → ${inputs.targetFrequency} dias`,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Calculadora"
        title="Quanto isso pode valer?"
        description="Ajuste as contas da ChicPets e veja quanto pode voltar. São números potenciais, não uma promessa — o teste de 30 dias mede o que acontece de verdade."
        action={
          <a
            href="#/demo/proposta"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-coffee px-5 py-2.5 text-sm font-semibold text-cream hover:bg-coffee-light"
          >
            <DemoIcon name="file" className="h-4 w-4" />
            Ver proposta
          </a>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-rose">Simulação</span>
        {[
          { id: "conservative" as const, label: "Pé no chão" },
          { id: "base" as const, label: "Provável" },
          { id: "optimistic" as const, label: "Se tudo der certo" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => applyScenario(item.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              scenario === item.id
                ? "bg-coffee text-cream"
                : "border border-cream-dark bg-white text-coffee hover:border-rose/40 hover:text-rose",
            )}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={useDemoData}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-rose/30 bg-blush-soft px-3.5 py-1.5 text-xs font-semibold text-rose hover:bg-blush-soft/70"
        >
          <DemoIcon name="refresh" className="h-3.5 w-3.5" />
          Usar números da demo
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-5">
          <div>
            <SectionHeading title="Atendimentos e valor médio" description="A operação como ela é hoje." />
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <RangeField
                label="Atendimentos por mês"
                value={inputs.appointmentsPerMonth}
                min={50}
                max={600}
                step={10}
                format={(value) => `${value}`}
                hint="Banhos, tosas e consultas marcados em um mês."
                onChange={(value) => update("appointmentsPerMonth", value)}
              />
              <RangeField
                label="Valor médio por atendimento"
                value={inputs.ticket}
                min={30}
                max={200}
                step={5}
                format={formatBRL}
                hint="Quanto entra, em média, por serviço."
                onChange={(value) => update("ticket", value)}
              />
            </div>
          </div>

          <div className="border-t border-cream-dark/70 pt-5">
            <SectionHeading
              title="Faltas e clientes sem voltar"
              description="O dinheiro que já existe, mas está parado."
            />
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <RangeField
                label="Faltas hoje"
                value={inputs.noShowCurrent}
                min={5}
                max={35}
                step={1}
                format={formatPercent}
                hint="Percentual de horários marcados que terminam sem atendimento."
                onChange={(value) => update("noShowCurrent", value)}
              />
              <RangeField
                label="Meta de faltas"
                value={inputs.noShowTarget}
                min={2}
                max={30}
                step={1}
                format={formatPercent}
                hint="O que os lembretes devem reduzir com confirmação."
                onChange={(value) => update("noShowTarget", value)}
              />
              {inputs.noShowTarget >= inputs.noShowCurrent && (
                <p className="text-[11px] font-medium text-amber-700 sm:col-span-2">
                  A meta precisa ser menor que as faltas de hoje para gerar ganho.
                </p>
              )}
              <RangeField
                label="Clientes sem voltar"
                value={inputs.inactiveClients}
                min={10}
                max={500}
                step={10}
                format={(value) => `${value}`}
                hint="Sem voltar há mais de 2 meses."
                onChange={(value) => update("inactiveClients", value)}
              />
              <RangeField
                label="Quantos voltam"
                value={inputs.reactivationRate}
                min={2}
                max={30}
                step={1}
                format={formatPercent}
                hint="Percentual que volta uma vez no mês."
                onChange={(value) => update("reactivationRate", value)}
              />
            </div>
          </div>

          <div className="border-t border-cream-dark/70 pt-5">
            <SectionHeading
              title="Intervalo entre banhos e mensalidade"
              description="O efeito de fazer o cliente voltar mais vezes."
            />
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <RangeField
                label="Clientes que voltaram"
                value={inputs.activeClients}
                min={20}
                max={600}
                step={10}
                format={(value) => `${value}`}
                hint="Com pelo menos uma visita nos últimos 2 meses."
                onChange={(value) => update("activeClients", value)}
              />
              <RangeField
                label="Volta a cada"
                value={inputs.currentFrequency}
                min={20}
                max={90}
                step={1}
                format={(value) => `${value} dias`}
                hint="Intervalo médio entre banhos."
                onChange={(value) => update("currentFrequency", value)}
              />
              <RangeField
                label="Queremos que volte a cada"
                value={inputs.targetFrequency}
                min={15}
                max={90}
                step={1}
                format={(value) => `${value} dias`}
                onChange={(value) => update("targetFrequency", value)}
              />
              <RangeField
                label="Mensalidade depois do teste"
                value={inputs.monthlyFee}
                min={97}
                max={497}
                step={10}
                format={formatBRL}
                hint="Valor que a ChicPets pagaria depois do teste."
                onChange={(value) => update("monthlyFee", value)}
              />
              {inputs.targetFrequency >= inputs.currentFrequency && (
                <p className="text-[11px] font-medium text-amber-700 sm:col-span-2">
                  O intervalo desejado precisa ser menor que o atual para gerar ganho.
                </p>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="overflow-hidden border-0 p-0">
            <div className="bg-coffee p-5 text-cream sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-blush">Quanto pode render</p>
              <p className="mt-2 font-serif text-4xl font-bold sm:text-5xl">{formatBRL(result.totalMonthly)}</p>
              <p className="mt-1 text-sm text-cream/70">
                por mês · <strong className="text-cream">{formatBRL(result.totalAnnual)}</strong> por ano
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-cream/60">Se paga em</p>
                  <p className="mt-1 font-serif text-2xl font-bold">{result.paybackAppointments}</p>
                  <p className="text-[10px] text-cream/60">atendimentos (~{result.paybackDays} dias)</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-cream/60">Clientes de volta</p>
                  <p className="mt-1 font-serif text-2xl font-bold">{returningClients}</p>
                  <p className="text-[10px] text-cream/60">no primeiro mês</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-rose">De onde vem esse dinheiro</p>
              <div className="mt-4 space-y-4">
                {breakdown.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-coffee">{item.label}</p>
                        <p className="text-[11px] text-mocha">{item.description}</p>
                      </div>
                      <span className="text-sm font-semibold text-coffee">{formatBRL(item.value)}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream-dark">
                      <div
                        className={cn("h-full rounded-full", item.color)}
                        style={{ width: `${Math.max(3, (item.value / maxGain) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl bg-cream p-3 text-[11px] leading-relaxed text-coffee-light">
                <strong className="text-coffee">Contas que usei:</strong> {inputs.appointmentsPerMonth} atendimentos/mês
                ({noShowBase} já passaram), valor médio de {formatBRL(inputs.ticket)}, faltas de{" "}
                {inputs.noShowCurrent}% para {inputs.noShowTarget}%, {inputs.reactivationRate}% dos{" "}
                {inputs.inactiveClients} clientes sem voltar retornam e o intervalo entre banhos cai de{" "}
                {inputs.currentFrequency} para {inputs.targetFrequency} dias.
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-mocha">
                No cenário atual, o retorno é de cerca de {result.roi.toFixed(1)}x a mensalidade. O multiplicador é
                alto porque a mensalidade é baixa; o número que importa é o ganho mensal.
              </p>

              <a
                href="#/demo/proposta"
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-rose px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark"
              >
                Levar para a proposta
                <DemoIcon name="arrow" className="h-4 w-4" />
              </a>
            </div>
          </Card>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
            <strong>Importante:</strong> os valores são uma estimativa de potencial, não uma garantia. O teste de 30
            dias existe justamente para medir o ganho real com os dados da ChicPets.
          </div>
        </div>
      </div>
    </div>
  );
}
