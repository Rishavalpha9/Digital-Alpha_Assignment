"use client";

import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTransaction } from "@/hooks/useTransactions";
import { categoryLabel, formatCoins, formatDateTime, formatINR } from "@/lib/utils";

type TransactionDetailsProps = {
  transactionId: string | null;
  onClose: () => void;
};

function statusTone(status: string) {
  if (status === "SUCCESS") return "success" as const;
  if (status === "FAILED") return "danger" as const;
  return "warning" as const;
}

export function TransactionDetails({ transactionId, onClose }: TransactionDetailsProps) {
  const { data, isLoading, isError, refetch } = useTransaction(transactionId);

  return (
    <Modal open={Boolean(transactionId)} title="Transaction details" onClose={onClose}>
      {isLoading ? (
        <div className="grid gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      ) : isError || !data ? (
        <ErrorState
          title="Couldn't load this payment."
          description="The details request failed."
          onRetry={() => refetch()}
        />
      ) : (
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Transaction ID" value={data.id} />
          <Detail label="Merchant" value={data.merchant} />
          <Detail label="Timestamp" value={formatDateTime(data.timestamp)} />
          <Detail label="Category" value={categoryLabel(data.category)} />
          <Detail label="Amount" value={formatINR(data.amount)} />
          <Detail label="Currency" value={data.currency} />
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Status</dt>
            <dd className="mt-1">
              <Badge tone={statusTone(data.status)}>{data.status}</Badge>
            </dd>
          </div>
          <Detail label="Payment method" value={data.payment_method} />
          <Detail label="Reward coins earned" value={formatCoins(data.reward_coins)} />
        </dl>
      )}
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
