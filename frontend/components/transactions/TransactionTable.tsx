"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Transaction } from "@/lib/types";
import { TransactionCard, TransactionRow } from "./TransactionRow";

type SortKey = "timestamp" | "amount";

type TransactionTableProps = {
  items?: Transaction[];
  isLoading: boolean;
  isError: boolean;
  sortBy: SortKey;
  sortOrder: "asc" | "desc";
  onSort: (key: SortKey) => void;
  onOpen: (id: string) => void;
  onRetry: () => void;
  onReset: () => void;
};

const columns: Array<{ key?: SortKey; label: string; align?: "right" }> = [
  { key: "timestamp", label: "Date" },
  { label: "Merchant" },
  { label: "Category" },
  { key: "amount", label: "Amount", align: "right" },
  { label: "Status" },
  { label: "Payment method" },
];

function SortIcon({ active, order }: { active: boolean; order: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5" />;
  return order === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
}

export function TransactionTable({
  items,
  isLoading,
  isError,
  sortBy,
  sortOrder,
  onSort,
  onOpen,
  onRetry,
  onReset,
}: TransactionTableProps) {
  if (isError) {
    return (
      <ErrorState
        title="We couldn't load your transactions."
        description="Check that the API is running, then try again."
        onRetry={onRetry}
      />
    );
  }

  if (!isLoading && (!items || items.length === 0)) {
    return (
      <EmptyState
        title="No transactions found."
        description="Try changing your filters."
        actionLabel="Reset filters"
        onAction={onReset}
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-auto md:block">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-surface">
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              {columns.map((column) => (
                <th
                  key={column.label}
                  className={column.align === "right" ? "px-4 py-3 text-right" : "px-4 py-3"}
                  aria-sort={
                    column.key && sortBy === column.key
                      ? sortOrder === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  {column.key ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md font-semibold hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      onClick={() => onSort(column.key as SortKey)}
                    >
                      {column.label}
                      <SortIcon active={sortBy === column.key} order={sortOrder} />
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    {columns.map((column) => (
                      <td key={column.label} className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : items?.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} onOpen={onOpen} />
                ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-24 w-full" />)
          : items?.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} onOpen={onOpen} />
            ))}
      </div>
    </>
  );
}
