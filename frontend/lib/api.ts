import type {
  ApiErrorPayload,
  Balance,
  CategorySpend,
  MonthlySpend,
  PaginatedTransactions,
  RedeemResult,
  Redemption,
  Reward,
  Summary,
  Transaction,
  TransactionQuery,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message ?? "Something went wrong.");
    this.status = status;
    this.payload = payload;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload & T;
    if (!response.ok) {
      throw new ApiError(response.status, payload);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(408, {
        error: "TIMEOUT",
        message: "The request timed out. Please try again.",
      });
    }
    throw new ApiError(503, {
      error: "NETWORK_ERROR",
      message: "We couldn't reach the server. Please try again.",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function toQuery(params: TransactionQuery) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
}

export function getTransactions(params: TransactionQuery) {
  return request<PaginatedTransactions>(`/transactions${toQuery(params)}`);
}

export function getTransaction(id: string) {
  return request<Transaction>(`/transactions/${encodeURIComponent(id)}`);
}

export function getCategories() {
  return request<{ items: string[] }>("/transactions/categories");
}

export function getCategorySpending() {
  return request<{ items: CategorySpend[] }>("/analytics/category-spending");
}

export function getMonthlySpending() {
  return request<{ items: MonthlySpend[] }>("/analytics/monthly-spending");
}

export function getSummary() {
  return request<Summary>("/analytics/summary");
}

export function getRewards() {
  return request<Reward[]>("/rewards");
}

export function getRewardBalance() {
  return request<Balance>("/rewards/balance");
}

export function getRedemptions() {
  return request<{ items: Redemption[] }>("/rewards/redemptions");
}

export function redeemReward(rewardId: number) {
  return request<RedeemResult>("/rewards/redeem", {
    method: "POST",
    body: JSON.stringify({ reward_id: rewardId }),
  });
}
