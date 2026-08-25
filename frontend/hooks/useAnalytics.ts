"use client";

import { useQuery } from "@tanstack/react-query";

import { getCategorySpending, getMonthlySpending, getSummary } from "@/lib/api";

export function useCategorySpending() {
  return useQuery({
    queryKey: ["analytics", "category"],
    queryFn: getCategorySpending,
  });
}

export function useMonthlySpending() {
  return useQuery({
    queryKey: ["analytics", "monthly"],
    queryFn: getMonthlySpending,
  });
}

export function useSummary() {
  return useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: getSummary,
  });
}
