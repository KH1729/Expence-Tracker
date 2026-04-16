import type { Expense } from '@/types/expense';
import { resetExpenseMocks } from '@/mocks/handlers';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { ExpenseDashboard } from './ExpenseDashboard';

const SAMPLE: Expense = {
  id: 1,
  description: 'Coffee',
  amount: '3.50',
  category: { id: 1, name: 'Food' },
  createdAt: '2026-01-01T12:00:00.000Z',
  updatedAt: '2026-01-01T12:00:00.000Z',
};

describe('ExpenseDashboard', () => {
  it('shows empty state when there are no expenses', async () => {
    render(<ExpenseDashboard />, { reactStrictMode: false });
    await waitFor(() => {
      expect(screen.getByText(/no expenses yet/i)).toBeInTheDocument();
    });
  });

  it('shows validation errors when create form is submitted empty', async () => {
    const user = userEvent.setup();
    render(<ExpenseDashboard />, { reactStrictMode: false });
    const forms = await screen.findAllByTestId('expense-form-create');
    const form = forms[0];
    expect(form).toBeDefined();
    await user.click(within(form).getByRole('button', { name: /^save$/i }));
    expect(await screen.findByText(/description is required/i)).toBeInTheDocument();
  });

  describe('with one expense row', () => {
    beforeEach(() => {
      resetExpenseMocks([SAMPLE]);
    });

    it(
      'removes the row after delete is confirmed',
      async () => {
        const user = userEvent.setup();
        render(<ExpenseDashboard />, { reactStrictMode: false });
        await waitFor(() => {
          expect(screen.getByText('Coffee')).toBeInTheDocument();
        });

        await user.click(screen.getAllByRole('button', { name: /^delete$/i })[0]);

        const dialog = await screen.findByRole('dialog');
        await user.click(within(dialog).getByRole('button', { name: /^delete$/i }));

        await waitFor(
          () => {
            expect(screen.queryByText('Coffee')).not.toBeInTheDocument();
            const counts = screen.getAllByTestId('row-count');
            expect(counts.every((el) => el.textContent === '0')).toBe(true);
          },
          { timeout: 10000 }
        );
      },
      15000
    );
  });
});
