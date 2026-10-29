import type { ReactNode } from "react";
import { useDemo } from "./SupabaseDemoContext";
import { getDashboardData } from "./metrics";
import { DEFAULT_ROI, computeRoi, targetFrequencyFor } from "./roi";
import { formatBRL, formatDateFull, formatPercent, startOfDay, toDateKey } from "./format";
import { DemoIcon } from "./components";
import { PawIcon } from "../components/icons";
import { BUSINESS, CREDITS, NUMBER_OWNER_SITE } from "../config";
import { cn } from "../utils/cn";

function Section({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <section className="mt-5 break-inside-avoid">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blush-soft text-[11px] font-bold text-rose">
          {number}
        </span>
        <h2 className="font-serif text-lg font-bold text-coffee">{title}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function Proposal() {
  const { clients, appointments, subscriptions } = useDemo();
  const data = getDashboardData(clients, appointments, subscriptions);
  const today = startOfDay(new Date());

  const currentNoShow = Math.max(5, Math.round(data.noShowRate || 20));
  const currentFrequency = Math.max(20, Math.round(data.avgReturnDays || 45));
  const roiInputs = {
    ...DEFAULT_ROI,
    appointmentsPerMonth: Math.max(100, data.completedCount + data.scheduledCount),
    // A taxa de faltas é calculada sobre quem já passou (concluídos + faltas).
    noShowBase: data.completedCount + data.noShowCount,
    ticket: Math.max(40, Math.round(data.avgTicket || 75)),
    noShowCurrent: currentNoShow,
    // 11% → 8%: a mesma redução de 30% prometida no teste.
    noShowTarget: Math.max(5, Math.round(currentNoShow * 0.7)),
    activeClients: Math.max(50, data.activeClients),
    currentFrequency,
    targetFrequency: targetFrequencyFor(currentFrequency),
    inactiveClients: Math.max(20, data.inactiveClients),
    // Mesma premissa usada no card de oportunidade do painel (12% da base
    // sem voltar), para a proposta não prometer mais do que a própria demo mostra.
    reactivationRate: 12,
  };
  const roi = computeRoi(roiInputs);
  const noShowBase = roiInputs.noShowBase ?? roiInputs.appointmentsPerMonth;

  // Cenário "pé no chão": metade da meta de faltas, menos reativação e uma
  // melhora menor no intervalo entre banhos.
  const conservativeInputs = {
    ...roiInputs,
    noShowTarget: Math.max(5, Math.round(currentNoShow * 0.85)),
    reactivationRate: 8,
    targetFrequency: Math.min(90, targetFrequencyFor(currentFrequency) + 3),
  };
  const conservativeRoi = computeRoi(conservativeInputs);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between print:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-rose">Proposta</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-coffee sm:text-4xl">Proposta de teste · 30 dias</h1>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-coffee px-5 py-2.5 text-sm font-semibold text-cream hover:bg-coffee-light"
        >
          <DemoIcon name="file" className="h-4 w-4" />
          Imprimir / salvar PDF
        </button>
      </div>

      <article className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm sm:p-9 print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        <header className="flex flex-col gap-4 border-b border-cream-dark pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose text-white">
              <PawIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="font-serif text-2xl font-bold text-coffee">ChicPets</p>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-rose">
                Teste de 30 dias · proposta
              </p>
            </div>
          </div>
          <div className="text-[11px] leading-relaxed text-mocha sm:text-right">
            <p>Junqueirópolis, {formatDateFull(toDateKey(today))}</p>
            <p className="mt-1">Para: equipe ChicPets</p>
            <p>De: {CREDITS.name}</p>
          </div>
        </header>


        <Section number="1" title="O que os números da demo mostram">
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-cream p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-mocha">Faltas</p>
              <p className="mt-1 font-serif text-2xl font-bold text-coffee">{formatPercent(data.noShowRate)}</p>
              <p className="text-[10px] text-mocha">{data.noShowCount} horários perdidos no mês</p>
            </div>
            <div className="rounded-xl bg-cream p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-mocha">Sem voltar</p>
              <p className="mt-1 font-serif text-2xl font-bold text-coffee">{data.inactiveClients}</p>
              <p className="text-[10px] text-mocha">há mais de 2 meses</p>
            </div>
            <div className="rounded-xl bg-cream p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-mocha">Valor médio</p>
              <p className="mt-1 font-serif text-2xl font-bold text-coffee">{formatBRL(data.avgTicket)}</p>
              <p className="text-[10px] text-mocha">por atendimento</p>
            </div>
          </div>
        </Section>

        <Section number="2" title="A solução">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {[
              {
                title: "Agendamento online 24h",
                text: "O cliente vê os horários livres e confirma sozinho, sem esperar resposta no WhatsApp.",
              },
              {
                title: "Agenda única",
                text: "Banho, tosa, consulta e taxi no mesmo lugar. Nada de caderno ou conversa perdida.",
              },
              {
                title: "Lembrete e confirmação",
                text: "Mensagem antes do horário para reduzir faltas e liberar a agenda mais rápido.",
              },
              {
                title: "Clube de banho mensal",
                text: "Planos mensais de banho que viram mensalidades e aumentam a frequência.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2 rounded-xl border border-cream-dark p-3">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <DemoIcon name="check" className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-coffee">{item.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-mocha">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section number="3" title="O que muda na prática">
          <div className="overflow-hidden rounded-xl border border-cream-dark">
            <div className="grid grid-cols-2 bg-cream text-[10px] font-semibold uppercase tracking-wide text-mocha">
              <div className="p-2.5">Hoje</div>
              <div className="p-2.5">Com a ChicPets</div>
            </div>
            {[
              ["Cliente chama no WhatsApp e espera resposta.", "Cliente vê horários e agenda sozinho."],
              ["Falta descoberta no dia, com horário vazio.", "Confirmação no dia anterior e lista de espera."],
              ["Cliente some por dois ou três meses.", "Alerta de cliente sem voltar com mensagem pronta."],
              ["Dinheiro imprevisível, mês a mês.", "Clube com mensalidades que entram todo mês."],
            ].map(([before, after], index) => (
              <div
                key={before}
                className={cn("grid grid-cols-2 text-[11px] sm:text-xs", index % 2 === 1 && "bg-cream/40")}
              >
                <div className="border-t border-cream-dark/60 p-2.5 text-mocha">{before}</div>
                <div className="border-t border-l border-cream-dark/60 p-2.5 font-medium text-coffee">{after}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section number="4" title="Quanto isso pode valer">
          <div className="rounded-2xl bg-coffee p-4 text-cream sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-blush">Potencial no mês</p>
                <p className="mt-1 font-serif text-3xl font-bold">
                  {formatBRL(roi.totalMonthly)}
                  <span className="font-sans text-sm font-normal text-cream/70">/mês</span>
                </p>
                <p className="text-[11px] text-cream/70">{formatBRL(roi.totalAnnual)} em 12 meses</p>
              </div>
              <div className="rounded-xl bg-white/10 px-4 py-2.5 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-cream/60">Se paga em</p>
                <p className="font-serif text-2xl font-bold">{roi.paybackAppointments}</p>
                <p className="text-[10px] text-cream/70">atendimentos</p>
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-white/10 px-3 py-2">
                <p className="text-[9px] uppercase tracking-wide text-cream/60">Pé no chão</p>
                <p className="mt-0.5 text-sm font-semibold">{formatBRL(conservativeRoi.totalMonthly)}/mês</p>
              </div>
              <div className="rounded-lg bg-white/10 px-3 py-2">
                <p className="text-[9px] uppercase tracking-wide text-cream/60">Provável</p>
                <p className="mt-0.5 text-sm font-semibold">{formatBRL(roi.totalMonthly)}/mês</p>
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                { label: "Menos faltas", value: roi.noShowGain },
                { label: "Clientes de volta", value: roi.reactivationGain },
                { label: "Voltar mais vezes", value: roi.frequencyGain },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-white/10 px-3 py-2">
                  <p className="text-[9px] uppercase tracking-wide text-cream/60">{item.label}</p>
                  <p className="mt-0.5 text-sm font-semibold">{formatBRL(item.value)}/mês</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-mocha">
            Contas que usei: {roiInputs.appointmentsPerMonth} atendimentos/mês ({noShowBase} já passaram), valor médio
            de {formatBRL(roiInputs.ticket)}, faltas de {roiInputs.noShowCurrent}% para {roiInputs.noShowTarget}%,{" "}
            {roiInputs.reactivationRate}% dos {roiInputs.inactiveClients} clientes sem voltar retornam e o intervalo
            entre banhos cai de {roiInputs.currentFrequency} para {roiInputs.targetFrequency} dias. Valores potenciais,
            não garantidos.
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-mocha">
            No cenário provável, o retorno é de cerca de {roi.roi.toFixed(1)}x a mensalidade. O multiplicador é alto
            porque a mensalidade é baixa; o número que importa é o potencial mensal.
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-mocha">
            Se acontecer só um terço disso, ainda sobram cerca de {formatBRL(Math.round(roi.totalMonthly / 3))}/mês.
          </p>
        </Section>

        <Section number="5" title="O teste de 30 dias">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-xl border border-cream-dark p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-rose">Custo do teste</p>
              <p className="mt-1 font-serif text-2xl font-bold text-coffee">R$ 0</p>
              <ul className="mt-2 space-y-1 text-[11px] text-coffee-light">
                <li>• Configuração inicial inclusa</li>
                <li>• Treinamento de 30 minutos</li>
                <li>• Acompanhamento semanal</li>
                <li>• Ajustes durante o período</li>
              </ul>
            </div>
            <div className="rounded-xl border border-cream-dark p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-rose">O que vamos medir</p>
              <ul className="mt-2 space-y-1 text-[11px] text-coffee-light">
                <li>• Reduzir as faltas em 30% (de {roiInputs.noShowCurrent}% para {roiInputs.noShowTarget}%)</li>
                <li>• Trazer de volta pelo menos 8 clientes</li>
                <li>• Fechar 8 clientes no clube</li>
                <li>• Economizar 2h por semana no WhatsApp</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section number="6" title="Se fizer sentido continuar">
          <div className="flex flex-col gap-3 rounded-xl bg-blush-soft p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-rose">Depois do teste</p>
              <p className="mt-1 font-serif text-2xl font-bold text-coffee">
                R$ 197
                <span className="font-sans text-sm font-normal text-mocha">/mês</span>
              </p>
              <p className="text-[11px] text-mocha">
                Pode sair quando quiser. A configuração inicial de R$ 500 não é cobrada no teste.
              </p>
            </div>
            <p className="max-w-xs text-[11px] leading-relaxed text-coffee-light">
              Menos que três banhos por mês. Se isso não acontecer, não faz sentido continuar.
            </p>
          </div>
        </Section>

        <div className="mt-6 flex flex-col gap-3 border-t border-cream-dark pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-lg font-bold text-coffee">Próximo passo</p>
            <p className="mt-0.5 text-[11px] text-coffee-light">
              Vamos marcar 20 minutos para eu mostrar a demo e combinarmos a data de início.
            </p>
            <p className="mt-1 text-[11px] text-coffee-light">
              WhatsApp: <strong className="text-coffee">{NUMBER_OWNER_SITE.phoneDisplay}</strong>
            </p>
          </div>
          <a
            href={NUMBER_OWNER_SITE.whatsappLink(
              "Olá, Murilo! Vi a proposta da ChicPets e queria marcar os 20 minutos.",
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark"
          >
            <DemoIcon name="chat" className="h-4 w-4" />
            Chamar no WhatsApp
          </a>
        </div>

        <footer className="mt-5 border-t border-cream-dark pt-3 text-[9px] leading-relaxed text-mocha">
          <p>Dados fictícios para demonstração. Nenhum dado real da ChicPets foi usado.</p>
          <p className="mt-1">
            ChicPets · {BUSINESS.address} · {BUSINESS.phoneDisplay} · {BUSINESS.instagram}
          </p>
        </footer>
      </article>
    </div>
  );
}
