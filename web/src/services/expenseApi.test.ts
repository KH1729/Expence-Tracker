import { resetExpenseMocks } from '@/mocks/handlers';
import { expenseApi } from '@/services/expenseApi';
import { describe, expect, it } from 'vitest';

describe('expenseApi.remove', () => {
  it('returns void on 204', async () => {
    resetExpenseMocks([
      {
        id: 1,
        description: 'Coffee',
        amount: '3.50',
        category: 'Food',
        createdAt: '2026-01-01T12:00:00.000Z',
        updatedAt: '2026-01-01T12:00:00.000Z',
      },
    ]);
    await expect(expenseApi.remove(1)).resolves.toBeUndefined();
  });
});
