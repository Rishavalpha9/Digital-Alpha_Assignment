"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useRewards } from "@/hooks/useRewards";
import type { Reward } from "@/lib/types";
import { RewardCard } from "./RewardCard";

type RewardsGridProps = {
  onRedeem: (reward: Reward) => void;
};

export function RewardsGrid({ onRedeem }: RewardsGridProps) {
  const { data, isLoading, isError, refetch } = useRewards();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-56 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load rewards."
        description="The rewards catalogue is unavailable right now."
        onRetry={() => refetch()}
      />
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No rewards available." description="Check back once the catalogue is published." />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((reward) => (
        <RewardCard key={reward.id} reward={reward} onRedeem={onRedeem} />
      ))}
    </div>
  );
}
