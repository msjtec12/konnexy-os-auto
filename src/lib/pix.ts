// Standard Brazilian Central Bank PIX EMV Payload Generator

function crc16CCITT(str: string): string {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function emvField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export interface PixPayloadParams {
  pixKey: string;
  merchantName: string;
  merchantCity?: string;
  amount?: number;
  txid?: string;
  referenceId?: string;
}

export function generatePixPayload({
  pixKey,
  merchantName,
  merchantCity = 'BRASIL',
  amount,
  txid,
  referenceId,
}: PixPayloadParams): string {
  const finalTxId = (txid || referenceId || '***').trim();

  // Normalize parameters according to Pix BR Code specifications
  const cleanKey = pixKey.trim();
  const cleanMerchant = merchantName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .slice(0, 25)
    .toUpperCase();
  const cleanCity = merchantCity
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .slice(0, 15)
    .toUpperCase();

  // Payload Format Indicator (00)
  let payload = emvField('00', '01');

  // Merchant Account Information (26)
  const gui = emvField('00', 'BR.GOV.BCB.PIX');
  const key = emvField('01', cleanKey);
  payload += emvField('26', `${gui}${key}`);

  // Merchant Category Code (52)
  payload += emvField('52', '0000');

  // Transaction Currency (53) - BRL is 986
  payload += emvField('53', '986');

  // Transaction Amount (54) if defined
  if (amount && amount > 0) {
    payload += emvField('54', amount.toFixed(2));
  }

  // Country Code (58)
  payload += emvField('58', 'BR');

  // Merchant Name (59)
  payload += emvField('59', cleanMerchant || 'OFICINA');

  // Merchant City (60)
  payload += emvField('60', cleanCity || 'CIDADE');

  // Additional Data Field Template (62) - Reference Label / TxID
  const cleanTxId = finalTxId.slice(0, 25) || '***';
  payload += emvField('62', emvField('05', cleanTxId));

  // CRC16 Checksum (63)
  payload += '6304';
  const checksum = crc16CCITT(payload);

  return `${payload}${checksum}`;
}
