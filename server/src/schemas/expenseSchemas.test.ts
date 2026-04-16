import { describe, expect, it } from 'vitest';
import {
  amountFieldSchema,
  createBodySchema,
  listQuerySchema,
  patchBodySchema,
} from './expenseSchemas.js';

describe('listQuerySchema', () => {
  it('applies defaults when query is empty', () => {
    const r = listQuerySchema.parse({});
    expect(r).toEqual({ limit: 20, offset: 0 });
  });

  it('coerces string limits from query objects', () => {
    const r = listQuerySchema.parse({ limit: '5', offset: '10' });
    expect(r).toEqual({ limit: 5, offset: 10 });
  });
});

describe('amountFieldSchema', () => {
  it('accepts two-decimal string and normalizes', () => {
    const r = amountFieldSchema.parse('10.50');
    expect(r).toBe('10.50');
  });

  it('rejects more than two decimal places', () => {
    expect(() => amountFieldSchema.parse('10.001')).toThrow();
  });

  it('rejects non-positive values', () => {
    expect(() => amountFieldSchema.parse(0)).toThrow();
  });
});

describe('createBodySchema', () => {
  it('accepts valid create payload', () => {
    const r = createBodySchema.parse({
      description: 'x',
      amount: '1.00',
      categoryId: 1,
    });
    expect(r.amount).toBe('1.00');
    expect(r.categoryId).toBe(1);
  });
});

describe('patchBodySchema', () => {
  it('rejects empty object', () => {
    expect(() => patchBodySchema.parse({})).toThrow();
  });

  it('accepts partial description', () => {
    const r = patchBodySchema.parse({ description: 'New' });
    expect(r.description).toBe('New');
  });
});
