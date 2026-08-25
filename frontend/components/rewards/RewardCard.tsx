"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Reward } from "@/lib/types";
import { formatCoins } from "@/lib/utils";

type RewardCardProps = {
  reward: Reward;
  onRedeem: (reward: Reward) => void;
};

export function RewardCard({ reward, onRedeem }: RewardCardProps) {
  return (
    <Card as="article" className="flex h-full flex-col">
      <Badge>{reward.reward_type}</Badge>
      <h3 className="mt-3 font-display text-2xl text-ink">{reward.name}</h3>
      <p className="mt-2 flex-1 text-sm text-muted">{reward.description}</p>
      <p className="mt-4 text-sm font-semibold text-ink">{formatCoins(reward.coin_cost)} coins</p>
      <Button className="mt-4 w-full" onClick={() => onRedeem(reward)}>
        Redeem
      </Button>
    </Card>
  );
}
