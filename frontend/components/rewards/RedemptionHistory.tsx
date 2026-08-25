"use client";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useRedemptions } from "@/hooks/useRewards";
import { formatCoins, formatDateTime } from "@/lib/utils";

export function RedemptionHistory() {
  const { data, isLoading, isError, refetch } = useRedemptions();
  const items = data?.items ?? [];

  return (
    <Card>
      <h2 className="font-display text-2xl text-ink">Redemption history</h2>
      <p className="mb-4 text-sm text-muted">Confirmed rewards stay on this ledger.</p>
      {isLoading ? (
        <div className="grid gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isError ? (
        <ErrorState title="Couldn't load history." description="Redemption history is unavailable." onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="No redemptions yet." description="Redeem a reward to see it here." />
      ) : (
        <ul className="grid gap-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 border-b border-line pb-3 last:border-0">
              <div>
                <p className="font-medium text-ink">{item.reward_name}</p>
                <p className="text-xs text-muted">{formatDateTime(item.created_at)}</p>
              </div>
              <p className="text-sm font-semibold text-ink">-{formatCoins(item.coins_spent)}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
