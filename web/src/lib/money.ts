const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

/**
 * @description Parses a positive decimal amount string into integer cents.
 * @param amount - Two-decimal string from API or validated form (e.g. "10.50").
 * @returns Cents as bigint.
 */
export function parseAmountToCents(amount: string): bigint {
  const trimmed = amount.trim();
  if (!AMOUNT_PATTERN.test(trimmed)) {
    throw new Error(`Invalid amount format: ${amount}`);
  }
  const [whole, frac = ''] = trimmed.split('.');
  const paddedFrac = (frac + '00').slice(0, 2);
  const centsPart = BigInt(paddedFrac);
  return BigInt(whole) * 100n + centsPart;
}

/**
 * @description Sums expense amount strings in cents (no floating point).
 * @param amounts - `Expense.amount` strings.
 * @returns Total cents.
 */
export function sumCents(amounts: readonly string[]): bigint {
  return amounts.reduce((acc, a) => acc + parseAmountToCents(a), 0n);
}

/**
 * @description Formats cents as a decimal string with two fractional digits.
 * @param cents - Integer cents.
 * @returns String like "1234.56".
 */
export function formatCents(cents: bigint): string {
  const negative = cents < 0n;
  const abs = negative ? -cents : cents;
  const whole = abs / 100n;
  const frac = abs % 100n;
  const fracStr = frac.toString().padStart(2, '0');
  const base = `${whole.toString()}.${fracStr}`;
  return negative ? `-${base}` : base;
}
