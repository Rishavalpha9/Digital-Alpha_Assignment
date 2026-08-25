import { Coins, Receipt, Sparkles, Wallet } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCoins, formatINR } from "@/lib/utils";
import type { Summary } from "@/lib/types";

type SummaryCardsProps = {
  summary?: Summary;
  coinBalance?: number;
  isLoading: boolean;
};

const items = [
  { key: "spend", label: "Successful spend", icon: Wallet },
  { key: "txns", label: "Transactions", icon: Receipt },
  { key: "coins", label: "Reward coins", icon: Coins },
  { key: "top", label: "Top category", icon: Sparkles },
] as const;

export function SummaryCards({ summary, coinBalance, isLoading }: SummaryCardsProps) {
  const values = {
    spend: summary ? formatINR(summary.total_successful_spend) : "—",
    txns: summary ? formatCoins(summary.total_transactions) : "—",
    coins: formatCoins(coinBalance ?? 0),
    top: summary?.top_category ?? "—",
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.key} className="flex items-start gap-4">
            <div className="rounded-2xl bg-paper p-3 text-gold">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted">{item.label}</p>
              {isLoading ? (
                <Skeleton className="mt-2 h-7 w-28" />
              ) : (
                <p className="mt-1 truncate font-display text-2xl text-ink">{values[item.key]}</p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
