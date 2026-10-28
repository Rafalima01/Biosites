// Mensagens pré-preenchidas do WhatsApp (usadas no build e no navegador).
import { formatShort, formatFull } from './dates.js';
import { brl } from './pricing.js';

export const bookingMessage = (house, { checkIn, checkOut, guests, quote }) =>
  [
    'Olá! Vim pelo site e quero reservar:',
    `🏠 ${house.name}`,
    `📅 Entrada ${formatShort(checkIn)} · Saída ${formatShort(checkOut)} (${quote.nights} ${quote.nights === 1 ? 'noite' : 'noites'})`,
    `👥 ${guests} ${guests === 1 ? 'hóspede' : 'hóspedes'}`,
    `💰 Valor estimado: ${brl(quote.total)}`,
    'Pode confirmar a disponibilidade?',
  ].join('\n');

export const packageMessage = (pkg, house) =>
  `Olá! Vim pelo site e tenho interesse no pacote ${pkg.tag} "${pkg.title}" na ${house.name} (${formatFull(pkg.from)} a ${formatFull(pkg.to)}). Ainda está disponível?`;

export const houseMessage = (house) => `Olá! Vim pelo site e quero saber mais sobre a ${house.name}.`;
