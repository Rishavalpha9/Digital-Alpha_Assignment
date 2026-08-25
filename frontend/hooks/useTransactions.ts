"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getCategories, getTransaction, getTransactions } from "@/lib/api";
import type { TransactionQuery } from "@/lib/types";

export function useTransactions(params: TransactionQuery) {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () => getTransactions(params),
    placeholderData: keepPreviousData,
  });
}

export function useTransaction(id: string | null) {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: () => getTransaction(id as string),
    enabled: Boolean(id),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["transaction-categories"],
    queryFn: getCategories,
  });
}
