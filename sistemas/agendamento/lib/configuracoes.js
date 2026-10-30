// Configurações do studio (coluna `settings` da tabela studios), lidas pelo painel.
// O banco usa as mesmas chaves: depositPercent 0 = agendamento pelo site entra confirmado, sem sinal.

export const PADRAO_SINAL = 30; // % usado quando o studio nunca configurou
export const PADRAO_PRAZO = 120; // minutos que o horário fica segurado esperando o Pix

export const OPCOES_SINAL = [10, 20, 30, 40, 50, 100];
export const OPCOES_PRAZO = [
  { min: 30, nome: '30 minutos' },
  { min: 60, nome: '1 hora' },
  { min: 120, nome: '2 horas' },
  { min: 240, nome: '4 horas' },
  { min: 720, nome: '12 horas' },
  { min: 1440, nome: '24 horas' },
];

/** Regras de sinal do studio: { exige, pct, prazo }. */
export function sinalDoStudio(studio) {
  const s = studio?.settings || {};
  const pct = Number(s.depositPercent ?? PADRAO_SINAL);
  return { exige: pct > 0, pct, prazo: Number(s.holdMinutes ?? PADRAO_PRAZO) };
}
