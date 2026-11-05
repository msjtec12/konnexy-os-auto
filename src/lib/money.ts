/**
 * Aritmética Monetária Segura em Centavos
 * Evita aberrações de ponto flutuante IEEE 754 (ex: 0.1 + 0.2 = 0.30000000000000004)
 */

export function toCents(amount: number): number {
  return Math.round((amount || 0) * 100);
}

export function fromCents(cents: number): number {
  return (cents || 0) / 100;
}

export function addMoney(a: number, b: number): number {
  return fromCents(toCents(a) + toCents(b));
}

export function subtractMoney(a: number, b: number): number {
  return fromCents(toCents(a) - toCents(b));
}

export function multiplyMoney(amount: number, quantity: number): number {
  return fromCents(Math.round(toCents(amount) * quantity));
}
