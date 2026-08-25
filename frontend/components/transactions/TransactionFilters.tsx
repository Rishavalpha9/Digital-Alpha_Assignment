"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { STATUS_OPTIONS, UNCATEGORIZED } from "@/lib/constants";
import type { TransactionQuery } from "@/lib/types";
import { TransactionSearch } from "./TransactionSearch";

export type FilterState = {
  search: string;
  category: string;
  status: string;
  min_amount: string;
  max_amount: string;
  from_date: string;
  to_date: string;
};

type TransactionFiltersProps = {
  filters: FilterState;
  categories: string[];
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
};

export function TransactionFilters({ filters, categories, onChange, onReset }: TransactionFiltersProps) {
  const categoryOptions = [
    { value: "", label: "All categories" },
    { value: UNCATEGORIZED, label: UNCATEGORIZED },
    ...categories.map((category) => ({ value: category, label: category })),
  ];

  return (
    <div className="grid gap-4">
      <TransactionSearch value={filters.search} onChange={(search) => onChange({ search })} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Select
          label="Category"
          value={filters.category}
          options={categoryOptions}
          onChange={(event) => onChange({ category: event.target.value })}
        />
        <Input
          label="From date"
          type="date"
          value={filters.from_date}
          onChange={(event) => onChange({ from_date: event.target.value })}
        />
        <Input
          label="To date"
          type="date"
          value={filters.to_date}
          onChange={(event) => onChange({ to_date: event.target.value })}
        />
        <Input
          label="Min amount"
          type="number"
          inputMode="decimal"
          min="0"
          placeholder="0"
          value={filters.min_amount}
          onChange={(event) => onChange({ min_amount: event.target.value })}
        />
        <Input
          label="Max amount"
          type="number"
          inputMode="decimal"
          min="0"
          placeholder="10000"
          value={filters.max_amount}
          onChange={(event) => onChange({ max_amount: event.target.value })}
        />
        <Select
          label="Status"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(event) => onChange({ status: event.target.value })}
        />
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="secondary" onClick={onReset}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}

export function toTransactionQuery(
  filters: FilterState,
  extras: Pick<TransactionQuery, "page" | "page_size" | "sort_by" | "sort_order">,
): TransactionQuery {
  return {
    ...extras,
    search: filters.search || undefined,
    category: filters.category || undefined,
    status: (filters.status as TransactionQuery["status"]) || undefined,
    min_amount: filters.min_amount || undefined,
    max_amount: filters.max_amount || undefined,
    from_date: filters.from_date || undefined,
    to_date: filters.to_date || undefined,
  };
}
