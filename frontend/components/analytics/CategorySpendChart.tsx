"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCategorySpending } from "@/hooks/useAnalytics";
import { useChartColors } from "@/hooks/useChartColors";
import { formatINR } from "@/lib/utils";

const LIGHT_COLORS = ["#0F6E56", "#B8860B", "#1C1915", "#C45C26", "#5B6C5D", "#7A4E2D", "#3F5E8A", "#8B3A3A"];
const DARK_COLORS = ["#4FBA93", "#E0B13A", "#F4EFE6", "#E08A4F", "#8FA396", "#C48A5A", "#7A9BC4", "#E07A7A"];

type CategorySpendChartProps = {
  selectedCategory?: string;
  onSelectCategory: (category: string) => void;
};

export function CategorySpendChart({ selectedCategory, onSelectCategory }: CategorySpendChartProps) {
  const chartColors = useChartColors();
  const colors = chartColors.isDark ? DARK_COLORS : LIGHT_COLORS;
  const { data, isLoading, isError, refetch } = useCategorySpending();
  const items = (data?.items ?? []).map((item) => ({
    ...item,
    amount: Number(item.amount),
  }));
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <div className="mb-4">
        <h2 className="font-display text-2xl text-ink">Spending by category</h2>
        <p className="text-sm text-muted">Click a slice to filter the transaction table.</p>
      </div>
      {isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : isError ? (
        <ErrorState title="Couldn't load category spending." description="The analytics query failed." onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="No spending yet." description="Successful payments will appear here." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_14rem]">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={items}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={2}
                  onClick={(_, index) => onSelectCategory(items[index].category)}
                >
                  {items.map((item, index) => (
                    <Cell
                      key={item.category}
                      cursor="pointer"
                      fill={colors[index % colors.length]}
                      stroke={selectedCategory === item.category ? chartColors.ink : chartColors.surface}
                      strokeWidth={selectedCategory === item.category ? 3 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatINR(Number(value ?? 0))}
                  contentStyle={{
                    borderRadius: 16,
                    borderColor: chartColors.line,
                    backgroundColor: chartColors.surface,
                    color: chartColors.ink,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="grid content-start gap-2 text-sm">
            {items.slice(0, 6).map((item, index) => {
              const percent = total ? Math.round((item.amount / total) * 100) : 0;
              return (
                <li key={item.category}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1 text-left hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    onClick={() => onSelectCategory(item.category)}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colors[index % colors.length] }} />
                      <span className="truncate">{item.category}</span>
                    </span>
                    <span className="shrink-0 text-muted">{percent}%</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}
