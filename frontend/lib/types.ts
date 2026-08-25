export type TransactionStatus = "SUCCESS" | "FAILED" | "PENDING";

export type Transaction = {
  id: string;
  timestamp: string;
  merchant: string;
  category: string | null;
  amount: number | string;
  currency: string;
  status: TransactionStatus;
  payment_method: string;
  reward_coins: number;
};

export type PaginatedTransactions = {
  items: Transaction[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type TransactionQuery = {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
  status?: TransactionStatus | "";
  min_amount?: string;
  max_amount?: string;
  from_date?: string;
  to_date?: string;
  sort_by?: "timestamp" | "amount";
  sort_order?: "asc" | "desc";
};

export type CategorySpend = {
  category: string;
  amount: number | string;
};

export type MonthlySpend = {
  month: string;
  amount: number | string;
};

export type Summary = {
  total_successful_spend: number | string;
  total_transactions: number;
  successful_transactions: number;
  top_category: string | null;
  top_category_amount: number | string | null;
};

export type Reward = {
  id: number;
  name: string;
  description: string;
  coin_cost: number;
  reward_type: string;
  active: boolean;
};

export type Balance = {
  coin_balance: number;
};

export type RedeemResult = {
  success: boolean;
  message: string;
  redemption_id: number;
  coins_spent: number;
  remaining_balance: number;
};

export type Redemption = {
  id: number;
  reward_id: number;
  reward_name: string;
  coins_spent: number;
  status: string;
  created_at: string;
};

export type ApiErrorPayload = {
  error?: string;
  message?: string;
  required?: number;
  available?: number;
  details?: Record<string, unknown>;
};
