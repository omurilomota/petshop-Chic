export interface RoiInputs {
  appointmentsPerMonth: number;
  /**
   * Base usada só na conta de faltas. A taxa de faltas é calculada sobre os
   * atendimentos que já passaram (concluídos + faltas); usar o total de
   * agendamentos aqui inflava o ganho. Quando não informado, cai no volume
   * mensal para os cenários manuais da calculadora.
   */
  noShowBase?: number;
  ticket: number;
  noShowCurrent: number;
  noShowTarget: number;
  activeClients: number;
  currentFrequency: number;
  targetFrequency: number;
  inactiveClients: number;
  reactivationRate: number;
  monthlyFee: number;
}

export interface RoiResult {
  noShowGain: number;
  reactivationGain: number;
  frequencyGain: number;
  totalMonthly: number;
  totalAnnual: number;
  paybackAppointments: number;
  paybackDays: number;
  roi: number;
}

export const DEFAULT_ROI: RoiInputs = {
  appointmentsPerMonth: 250,
  ticket: 75,
  // Base: 20% de faltas caindo para 14% (30% de redução relativa), a mesma
  // meta usada no teste de 30 dias.
  noShowCurrent: 20,
  noShowTarget: 14,
  activeClients: 200,
  currentFrequency: 45,
  targetFrequency: 35,
  inactiveClients: 150,
  reactivationRate: 10,
  monthlyFee: 197,
};

/**
 * Alvo conservador de frequência para o cenário preenchido com os dados da
 * demo: 15% menos dias entre visitas (mínimo de 3 dias), com piso de 10 dias.
 * Evita prometer uma mudança de comportamento grande demais em cima da base.
 */
export function targetFrequencyFor(currentFrequency: number): number {
  const reduction = Math.max(3, Math.round(currentFrequency * 0.15));
  return Math.max(10, currentFrequency - reduction);
}

export function computeRoi(inputs: RoiInputs): RoiResult {
  const noShowBase = inputs.noShowBase ?? inputs.appointmentsPerMonth;
  const noShowGain =
    noShowBase * (Math.max(0, inputs.noShowCurrent - inputs.noShowTarget) / 100) * inputs.ticket;
  const reactivationGain = inputs.inactiveClients * (inputs.reactivationRate / 100) * inputs.ticket;
  const frequencyGain =
    inputs.targetFrequency > 0 && inputs.currentFrequency > 0
      ? Math.max(
          0,
          inputs.activeClients *
            (365 / inputs.targetFrequency - 365 / inputs.currentFrequency) *
            (inputs.ticket / 12),
        )
      : 0;
  const totalMonthly = noShowGain + reactivationGain + frequencyGain;
  const totalAnnual = totalMonthly * 12;
  const paybackAppointments = inputs.ticket > 0 ? Math.ceil(inputs.monthlyFee / inputs.ticket) : 0;
  const paybackDays = totalMonthly > 0 ? Math.ceil(inputs.monthlyFee / (totalMonthly / 30)) : 0;
  const roi = inputs.monthlyFee > 0 ? totalMonthly / inputs.monthlyFee : 0;

  return {
    noShowGain,
    reactivationGain,
    frequencyGain,
    totalMonthly,
    totalAnnual,
    paybackAppointments,
    paybackDays,
    roi,
  };
}
