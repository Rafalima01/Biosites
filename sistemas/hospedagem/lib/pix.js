// Pix "copia e cola" (BR Code estático do Banco Central) com valor e identificador.
const field = (id, value) => `${id}${String(value.length).padStart(2, '0')}${value}`;

const clean = (s, max) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .slice(0, max)
    .toUpperCase();

function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Gera o código Pix. Retorna '' se faltar chave ou nome do recebedor. */
export function pixPayload({ key, name, city, amount, txid }) {
  if (!key || !name) return '';
  const account = field('00', 'br.gov.bcb.pix') + field('01', String(key).trim());
  const payload =
    field('00', '01') +
    field('26', account) +
    field('52', '0000') +
    field('53', '986') +
    (amount ? field('54', Number(amount).toFixed(2)) : '') +
    field('58', 'BR') +
    field('59', clean(name, 25) || 'RECEBEDOR') +
    field('60', clean(city, 15) || 'BRASIL') +
    field('62', field('05', clean(txid, 25).replace(/ /g, '') || '***')) +
    '6304';
  return payload + crc16(payload);
}
