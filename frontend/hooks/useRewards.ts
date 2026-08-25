"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getRedemptions, getRewardBalance, getRewards, redeemReward } from "@/lib/api";

export function useRewards() {
  return useQuery({
    queryKey: ["rewards"],
    queryFn: getRewards,
  });
}

export function useRewardBalance() {
  return useQuery({
    queryKey: ["rewards", "balance"],
    queryFn: getRewardBalance,
  });
}

export function useRedemptions() {
  return useQuery({
    queryKey: ["rewards", "redemptions"],
    queryFn: getRedemptions,
  });
}

export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: redeemReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
  });
}
