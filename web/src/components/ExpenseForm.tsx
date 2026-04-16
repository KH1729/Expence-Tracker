'use client';

import { expenseCreateSchema } from '@/schemas/expense';
import type { Expense } from '@/types/expense';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { z } from 'zod';

type CreateProps = {
  mode: 'create';
  initial?: undefined;
  disabled?: boolean;
  onSubmitCreate: (data: {
    description: string;
    amount: string;
    category: string;
  }) => Promise<void>;
};

type EditProps = {
  mode: 'edit';
  initial: Expense;
  disabled?: boolean;
  onSubmitEdit: (
    id: number,
    data: Partial<{
      description: string;
      amount: string;
      category: string;
    }>
  ) => Promise<void>;
  onCancelEdit?: () => void;
};

export type ExpenseFormProps = CreateProps | EditProps;

/**
 * @description Create or edit expense using react-hook-form + zod.
 */
export function ExpenseForm(props: ExpenseFormProps) {
  const form = useForm<z.infer<typeof expenseCreateSchema>>({
    resolver: zodResolver(expenseCreateSchema),
    defaultValues: { description: '', amount: '', category: '' },
  });

  useEffect(() => {
    if (props.mode !== 'edit') return;
    form.reset({
      description: props.initial.description,
      amount: props.initial.amount,
      category: props.initial.category,
    });
  }, [props.mode, props.mode === 'edit' ? props.initial.id : null, form]);

  if (props.mode === 'create') {
    const { disabled, onSubmitCreate } = props;
    return (
      <form
        data-testid="expense-form-create"
        className="mb-8 space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
        onSubmit={form.handleSubmit(async (data) => {
          await onSubmitCreate(data);
          form.reset();
        })}
        noValidate
      >
        <h2 className="text-lg font-semibold">Add expense</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Description</span>
            <input
              className="w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
              {...form.register('description')}
              disabled={disabled}
            />
            {form.formState.errors.description ? (
              <span className="text-red-600" role="alert">
                {form.formState.errors.description.message}
              </span>
            ) : null}
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Amount</span>
            <input
              className="w-full rounded border border-zinc-300 px-2 py-1 font-mono dark:border-zinc-600 dark:bg-zinc-900"
              {...form.register('amount')}
              inputMode="decimal"
              disabled={disabled}
            />
            {form.formState.errors.amount ? (
              <span className="text-red-600" role="alert">
                {form.formState.errors.amount.message}
              </span>
            ) : null}
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Category</span>
            <input
              className="w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
              {...form.register('category')}
              disabled={disabled}
            />
            {form.formState.errors.category ? (
              <span className="text-red-600" role="alert">
                {form.formState.errors.category.message}
              </span>
            ) : null}
          </label>
        </div>
        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          disabled={disabled}
        >
          Save
        </button>
      </form>
    );
  }

  const { initial, disabled, onSubmitEdit, onCancelEdit } = props;

  return (
    <form
      className="mb-8 space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
      onSubmit={form.handleSubmit(async (data) => {
        await onSubmitEdit(initial.id, {
          description: data.description,
          amount: data.amount,
          category: data.category,
        });
        onCancelEdit?.();
      })}
      noValidate
    >
      <h2 className="text-lg font-semibold">Edit expense</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Description</span>
          <input
            className="w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
            {...form.register('description')}
            disabled={disabled}
          />
          {form.formState.errors.description ? (
            <span className="text-red-600" role="alert">
              {form.formState.errors.description.message}
            </span>
          ) : null}
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Amount</span>
          <input
            className="w-full rounded border border-zinc-300 px-2 py-1 font-mono dark:border-zinc-600 dark:bg-zinc-900"
            {...form.register('amount')}
            inputMode="decimal"
            disabled={disabled}
          />
          {form.formState.errors.amount ? (
            <span className="text-red-600" role="alert">
              {form.formState.errors.amount.message}
            </span>
          ) : null}
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Category</span>
          <input
            className="w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
            {...form.register('category')}
            disabled={disabled}
          />
          {form.formState.errors.category ? (
            <span className="text-red-600" role="alert">
              {form.formState.errors.category.message}
            </span>
          ) : null}
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          disabled={disabled}
        >
          Update
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-4 py-2 dark:border-zinc-600"
          onClick={() => {
            onCancelEdit?.();
          }}
          disabled={disabled}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
