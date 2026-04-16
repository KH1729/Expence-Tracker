import { describe, expect, it } from 'vitest';
import { mapExpenseRow } from './expenseMapper.js';

describe('mapExpenseRow', () => {
  it('maps DECIMAL string amount and bigint id to API shape', () => {
    const created = new Date('2026-04-16T12:00:00.000Z');
    const updated = new Date('2026-04-16T12:30:00.000Z');
    const row = {
      id: BigInt(1),
      description: 'Coffee',
      amount: '4.50',
      category_id: BigInt(3),
      category_name: 'Food',
      created_at: created,
      updated_at: updated,
    };

    const api = mapExpenseRow(row);
    expect(api).toEqual({
      id: 1,
      description: 'Coffee',
      amount: '4.50',
      category: { id: 3, name: 'Food' },
      createdAt: created.toISOString(),
      updatedAt: updated.toISOString(),
    });
  });
});
