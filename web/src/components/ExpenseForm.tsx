'use client';

import { ExpenseFormCategoryPicker } from '@/components/ExpenseFormCategoryPicker';
import { expenseCreateSchema } from '@/schemas/expense';
import type { Category } from '@/types/category';
import type { Expense } from '@/types/expense';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import type { z } from 'zod';

type FormInput = z.input<typeof expenseCreateSchema>;
type FormOutput = z.output<typeof expenseCreateSchema>;

type CreateProps = {
  mode: 'create';
  initial?: undefined;
  disabled: boolean;
  categories: Category[];
  isLoadingCategories: boolean;
  onCreateCategory: (name: string) => Promise<number>;
  onSubmitCreate: (data: {
    description: string;
    amount: string;
    categoryId: number;
  }) => Promise<void>;
};

type EditProps = {
  mode: 'edit';
  initial: Expense;
  disabled: boolean;
  categories: Category[];
  isLoadingCategories: boolean;
  onCreateCategory: (name: string) => Promise<number>;
  onSubmitEdit: (
    id: number,
    data: Partial<{
      description: string;
      amount: string;
      categoryId: number;
    }>
  ) => Promise<void>;
  onCancelEdit?: () => void;
};

export type ExpenseFormProps = CreateProps | EditProps;

/**
 * @description Create or edit expense using react-hook-form + zod.
 */
export function ExpenseForm(props: ExpenseFormProps) {
  const [createCategoryPickerKey, setCreateCategoryPickerKey] = useState(0);

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(expenseCreateSchema),
    defaultValues: { description: '', amount: '', categoryId: '' },
  });

  useEffect(() => {
    if (props.mode !== 'edit') return;
    form.reset({
      description: props.initial.description,
      amount: props.initial.amount,
      categoryId: String(props.initial.category.id),
    });
  }, [props.mode, props.mode === 'edit' ? props.initial.id : null, form]);

  const { categories, isLoadingCategories, onCreateCategory } = props;

  if (props.mode === 'create') {
    const { disabled, onSubmitCreate } = props;
    return (
      <form
        data-testid="expense-form-create"
        className="mb-8 space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
        onSubmit={form.handleSubmit(async (data) => {
          await onSubmitCreate(data);
          form.reset();
          setCreateCategoryPickerKey((k) => k + 1);
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
          <ExpenseFormCategoryPicker
            form={form}
            categories={categories}
            isLoadingCategories={isLoadingCategories}
            disabled={disabled}
            onCreateCategory={onCreateCategory}
            resetKey={createCategoryPickerKey}
          />
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
          categoryId: data.categoryId,
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
        <ExpenseFormCategoryPicker
          form={form}
          categories={categories}
          isLoadingCategories={isLoadingCategories}
          disabled={disabled}
          onCreateCategory={onCreateCategory}
          resetKey={`edit-${initial.id}`}
        />
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
