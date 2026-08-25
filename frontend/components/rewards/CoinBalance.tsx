import { Coins } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCoins } from "@/lib/utils";

type CoinBalanceProps = {
  balance?: number;
  isLoading?: boolean;
};

export function CoinBalance({ balance, isLoading }: CoinBalanceProps) {
  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Your reward coins</p>
          <div className="mt-3 flex items-center gap-3">
            <Coins className="h-8 w-8 text-gold" aria-hidden />
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <p className="font-display text-4xl text-ink">{formatCoins(balance ?? 0)}</p>
            )}
          </div>
        </div>
        <p className="max-w-md text-sm text-muted sm:text-right">
          Earn more with every successful payment. 1 coin for every ₹100 spent, capped per transaction.
        </p>
      </div>
    </Card>
  );
}
