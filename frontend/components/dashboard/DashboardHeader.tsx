"use client";

import { Coins } from "lucide-react";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCoins } from "@/lib/utils";

type DashboardHeaderProps = {
  coinBalance?: number;
  isLoading?: boolean;
};

export function DashboardHeader({ coinBalance, isLoading }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold">Rishav</p>
        <h1 className="font-display text-4xl text-ink sm:text-5xl">Your money, clearly.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
          A calm view of spending, payments, and the coins you earn along the way.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ThemeToggle />
        <div className="inline-flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-2 shadow-soft">
          <Coins className="h-5 w-5 text-gold" aria-hidden />
          {isLoading ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            <p className="text-sm font-semibold text-ink">
              <span className="sr-only">Reward coin balance: </span>
              {formatCoins(coinBalance ?? 0)} coins
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
