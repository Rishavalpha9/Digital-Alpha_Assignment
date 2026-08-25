import { Badge } from "@/components/ui/Badge";
import type { Transaction } from "@/lib/types";
import { categoryLabel, formatDate, formatINR } from "@/lib/utils";

type TransactionRowProps = {
  transaction: Transaction;
  onOpen: (id: string) => void;
};

function statusTone(status: Transaction["status"]) {
  if (status === "SUCCESS") return "success" as const;
  if (status === "FAILED") return "danger" as const;
  return "warning" as const;
}

export function TransactionRow({ transaction, onOpen }: TransactionRowProps) {
  return (
    <tr
      tabIndex={0}
      onClick={() => onOpen(transaction.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(transaction.id);
        }
      }}
      className="cursor-pointer border-b border-line/80 transition hover:bg-paper focus-visible:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
    >
      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted">{formatDate(transaction.timestamp)}</td>
      <td className="px-4 py-3 text-sm font-medium text-ink">{transaction.merchant}</td>
      <td className="px-4 py-3 text-sm text-muted">{categoryLabel(transaction.category)}</td>
      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-ink">
        {formatINR(transaction.amount)}
      </td>
      <td className="px-4 py-3">
        <Badge tone={statusTone(transaction.status)}>{transaction.status}</Badge>
      </td>
      <td className="px-4 py-3 text-sm text-muted">{transaction.payment_method}</td>
    </tr>
  );
}

export function TransactionCard({ transaction, onOpen }: TransactionRowProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(transaction.id)}
      className="w-full rounded-2xl border border-line bg-paper p-4 text-left shadow-soft transition hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink">{transaction.merchant}</p>
          <p className="text-xs text-muted">
            {formatDate(transaction.timestamp)} · {categoryLabel(transaction.category)}
          </p>
        </div>
        <p className="font-semibold text-ink">{formatINR(transaction.amount)}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Badge tone={statusTone(transaction.status)}>{transaction.status}</Badge>
        <span className="text-xs text-muted">{transaction.payment_method}</span>
      </div>
    </button>
  );
}
