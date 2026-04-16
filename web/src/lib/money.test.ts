import { describe, expect, it } from 'vitest';
import { formatCents, parseAmountToCents, sumCents } from './money';

describe('parseAmountToCents', () => {
  it('parses two-decimal amounts', () => {
    expect(parseAmountToCents('10.50')).toBe(1050n);
    expect(parseAmountToCents('0.01')).toBe(1n);
  });

  it('parses whole units', () => {
    expect(parseAmountToCents('99')).toBe(9900n);
  });

  it('rejects invalid strings', () => {
    expect(() => parseAmountToCents('10.555')).toThrow();
    expect(() => parseAmountToCents('-1')).toThrow();
  });
});

describe('sumCents', () => {
  it('sums multiple amount strings', () => {
    expect(sumCents(['1.00', '2.50', '0.01'])).toBe(351n);
  });
});

describe('formatCents', () => {
  it('formats bigint cents', () => {
    expect(formatCents(351n)).toBe('3.51');
    expect(formatCents(100000n)).toBe('1000.00');
  });
});
