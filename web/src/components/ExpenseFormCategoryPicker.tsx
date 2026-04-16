'use client';

import { expenseCreateSchema } from '@/schemas/expense';
import { ApiError } from '@/services/expenseApi';
import type { Category } from '@/types/category';
import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

type FormInput = z.input<typeof expenseCreateSchema>;
type FormOutput = z.output<typeof expenseCreateSchema>;

/** @description Sentinel `<select>` value that opens the “new category” fields (not a real category id). */
export const ADD_NEW_CATEGORY_OPTION_VALUE = '__add_new__';

interface ExpenseFormCategoryPickerProps {
  form: UseFormReturn<FormInput, unknown, FormOutput>;
  categories: Category[];
  isLoadingCategories: boolean;
  disabled: boolean;
  onCreateCategory: (name: string) => Promise<number>;
  /** @description Change after reset (e.g. create submitted) or per edit row to clear add-category UI. */
  resetKey: number | string;
}

/**
 * @description Category dropdown with “+ Add new category…” revealing name + button only when chosen.
 */
export function ExpenseFormCategoryPicker({
  form,
  categories,
  isLoadingCategories,
  disabled,
  onCreateCategory,
  resetKey,
}: ExpenseFormCategoryPickerProps) {
  const [showAddFields, setShowAddFields] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);

  const categoryId = form.watch('categoryId');

  useEffect(() => {
    setShowAddFields(false);
    setNewCategoryName('');
    setAddCategoryError(null);
  }, [resetKey]);

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (name === '') return;
    setAddingCategory(true);
    setAddCategoryError(null);
    try {
      const id = await onCreateCategory(name);
      setNewCategoryName('');
      setShowAddFields(false);
      form.setValue('categoryId', String(id), { shouldValidate: true });
    } catch (e) {
      if (e instanceof ApiError && e.code === 'DUPLICATE_CATEGORY') {
        setAddCategoryError(
          'That name is already in the list. Choose it from the dropdown.'
        );
      } else if (e instanceof ApiError) {
        setAddCategoryError(e.message);
      } else {
        setAddCategoryError('Could not add category');
      }
    } finally {
      setAddingCategory(false);
    }
  };

  const selectValue =
    showAddFields && categoryId === ''
      ? ADD_NEW_CATEGORY_OPTION_VALUE
      : categoryId === ''
        ? ''
        : String(categoryId);

  return (
    <div className="block text-sm">
      <span className="mb-1 block font-medium">Category</span>
      <select
        className="w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
        disabled={disabled || isLoadingCategories}
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value;
          setAddCategoryError(null);
          if (v === ADD_NEW_CATEGORY_OPTION_VALUE) {
            setShowAddFields(true);
            form.setValue('categoryId', '', { shouldValidate: true });
          } else {
            setShowAddFields(false);
            form.setValue('categoryId', v, { shouldValidate: true });
          }
        }}
        aria-invalid={!!form.formState.errors.categoryId}
      >
        <option value="">Select category…</option>
        {categories.map((c) => (
          <option key={c.id} value={String(c.id)}>
            {c.name}
          </option>
        ))}
        <option value={ADD_NEW_CATEGORY_OPTION_VALUE}>
          + Add new category…
        </option>
      </select>
      {form.formState.errors.categoryId ? (
        <span className="text-red-600" role="alert">
          {String(form.formState.errors.categoryId.message)}
        </span>
      ) : null}
      {addCategoryError ? (
        <span className="mt-1 block text-sm text-red-600" role="alert">
          {addCategoryError}
        </span>
      ) : null}
      {showAddFields ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            type="text"
            className="min-w-0 flex-1 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => {
              setNewCategoryName(e.target.value);
            }}
            disabled={disabled || addingCategory}
            aria-label="New category name"
          />
          <button
            type="button"
            className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600"
            disabled={disabled || addingCategory}
            onClick={() => {
              void handleAddCategory();
            }}
          >
            {addingCategory ? 'Adding…' : 'Add category'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
