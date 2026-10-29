// Pix "copia e cola" (BR Code estático) gerado no próprio site, já com o valor.
// Padrão EMV do Banco Central: campos ID + tamanho + valor, fechados por CRC16.

const field = (id, value) => `${id}${String(value.length).padStart(2, '0')}${value}`;

/** Sem acentos e símbolos, em maiúsculas (exigência do padrão para nome e cidade). */
const clean = (text, max) =>
  String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase()
    .slice(0, max)
    .trim();

/** CRC16-CCITT (polinômio 0x1021, início 0xFFFF). */
export function crc16(text) {
  let crc = 0xffff;
  for (let i = 0; i < text.length; i++) {
    crc ^= text.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** `key`: chave Pix (celular no formato +55DDDNÚMERO). `amount` em reais. */
export function pixPayload({ key, name, city, amount, txid = '***' }) {
  const payload =
    field('00', '01') +
    field('26', field('00', 'br.gov.bcb.pix') + field('01', key)) +
    field('52', '0000') +
    field('53', '986') +
    (amount ? field('54', Number(amount).toFixed(2)) : '') +
    field('58', 'BR') +
    field('59', clean(name, 25)) +
    field('60', clean(city, 15)) +
    field('62', field('05', txid)) +
    '6304';
  return payload + crc16(payload);
}
