"use client";

import { useMemo, useState } from "react";

import { CategorySpendChart } from "@/components/analytics/CategorySpendChart";
import { MonthlySpendChart } from "@/components/analytics/MonthlySpendChart";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { CoinBalance } from "@/components/rewards/CoinBalance";
import { RedeemModal } from "@/components/rewards/RedeemModal";
import { RedemptionHistory } from "@/components/rewards/RedemptionHistory";
import { RewardsGrid } from "@/components/rewards/RewardsGrid";
import { Pagination } from "@/components/transactions/Pagination";
import { TransactionDetails } from "@/components/transactions/TransactionDetails";
import { TransactionFilters, toTransactionQuery, type FilterState } from "@/components/transactions/TransactionFilters";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { Card } from "@/components/ui/Card";
import { useSummary } from "@/hooks/useAnalytics";
import { useDebounce } from "@/hooks/useDebounce";
import { useRedeemReward, useRewardBalance } from "@/hooks/useRewards";
import { useCategories, useTransactions } from "@/hooks/useTransactions";
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import type { Reward } from "@/lib/types";
import { monthDateRange } from "@/lib/utils";

const EMPTY_FILTERS: FilterState = {
  search: "",
  category: "",
  status: "",
  min_amount: "",
  max_amount: "",
  from_date: "",
  to_date: "",
};

export function DashboardLayout() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<"timestamp" | "amount">("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const debouncedSearch = useDebounce(filters.search, SEARCH_DEBOUNCE_MS);
  const query = useMemo(
    () =>
      toTransactionQuery(
        { ...filters, search: debouncedSearch },
        { page, page_size: pageSize, sort_by: sortBy, sort_order: sortOrder },
      ),
    [filters, debouncedSearch, page, pageSize, sortBy, sortOrder],
  );

  const transactions = useTransactions(query);
  const categories = useCategories();
  const summary = useSummary();
  const balance = useRewardBalance();
  const redeem = useRedeemReward();

  const updateFilters = (patch: Partial<FilterState>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
    setSortBy("timestamp");
    setSortOrder("desc");
  };

  const onSort = (key: "timestamp" | "amount") => {
    if (sortBy === key) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder(key === "amount" ? "desc" : "desc");
    }
    setPage(1);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader coinBalance={balance.data?.coin_balance} isLoading={balance.isLoading} />
      <SummaryCards
        summary={summary.data}
        coinBalance={balance.data?.coin_balance}
        isLoading={summary.isLoading || balance.isLoading}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <CategorySpendChart
          selectedCategory={filters.category}
          onSelectCategory={(category) => updateFilters({ category })}
        />
        <MonthlySpendChart
          onSelectMonth={(month) => updateFilters(monthDateRange(month))}
        />
      </div>
      <Card>
        <div className="mb-5">
          <h2 className="font-display text-2xl text-ink">Transactions</h2>
          <p className="text-sm text-muted">Search, filter, and inspect payments without loading the full ledger.</p>
        </div>
        <TransactionFilters
          filters={filters}
          categories={categories.data?.items ?? []}
          onChange={updateFilters}
          onReset={resetFilters}
        />
        <div className="mt-5">
          <TransactionTable
            items={transactions.data?.items}
            isLoading={transactions.isLoading}
            isError={transactions.isError}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={onSort}
            onOpen={setSelectedId}
            onRetry={() => transactions.refetch()}
            onReset={resetFilters}
          />
        </div>
        <div className="mt-5">
          <Pagination
            page={page}
            totalPages={transactions.data?.total_pages ?? 0}
            total={transactions.data?.total ?? 0}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      </Card>
      <section className="grid gap-4">
        <CoinBalance balance={balance.data?.coin_balance} isLoading={balance.isLoading} />
        <h2 className="font-display text-3xl text-ink">Rewards</h2>
        <RewardsGrid
          onRedeem={(reward) => {
            setSelectedReward(reward);
            setSuccessMessage(null);
            redeem.reset();
          }}
        />
        <RedemptionHistory />
      </section>
      <TransactionDetails transactionId={selectedId} onClose={() => setSelectedId(null)} />
      <RedeemModal
        reward={selectedReward}
        balance={balance.data?.coin_balance ?? 0}
        isPending={redeem.isPending}
        error={redeem.error}
        successMessage={successMessage}
        onClose={() => {
          setSelectedReward(null);
          setSuccessMessage(null);
          redeem.reset();
        }}
        onConfirm={() => {
          if (!selectedReward) return;
          redeem.mutate(selectedReward.id, {
            onSuccess: (result) => {
              setSuccessMessage(result.message);
            },
          });
        }}
      />
    </div>
  );
}
