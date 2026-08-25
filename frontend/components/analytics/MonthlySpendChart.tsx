"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMonthlySpending } from "@/hooks/useAnalytics";
import { useChartColors } from "@/hooks/useChartColors";
import { formatINR, formatMonthLabel } from "@/lib/utils";

type MonthlySpendChartProps = {
  onSelectMonth: (month: string) => void;
};

export function MonthlySpendChart({ onSelectMonth }: MonthlySpendChartProps) {
  const chartColors = useChartColors();
  const { data, isLoading, isError, refetch } = useMonthlySpending();
  const items = (data?.items ?? []).map((item) => ({
    ...item,
    amount: Number(item.amount),
    label: formatMonthLabel(item.month),
  }));

  return (
    <Card>
      <div className="mb-4">
        <h2 className="font-display text-2xl text-ink">Monthly spending</h2>
        <p className="text-sm text-muted">Successful payments, grouped by month in India time.</p>
      </div>
      {isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : isError ? (
        <ErrorState title="Couldn't load monthly spending." description="The analytics query failed." onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="No monthly trend yet." description="Successful payments will appear here." />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={items}>
              <CartesianGrid stroke={chartColors.line} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: chartColors.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value))
                }
                tick={{ fill: chartColors.muted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                formatter={(value) => formatINR(Number(value ?? 0))}
                contentStyle={{
                  borderRadius: 16,
                  borderColor: chartColors.line,
                  backgroundColor: chartColors.surface,
                  color: chartColors.ink,
                }}
              />
              <Bar
                dataKey="amount"
                fill={chartColors.success}
                radius={[8, 8, 0, 0]}
                cursor="pointer"
                onClick={(data) => {
                  const month = (data as { month?: string }).month;
                  if (month) onSelectMonth(month);
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
