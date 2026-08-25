"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ApiError } from "@/lib/api";
import type { Reward } from "@/lib/types";
import { formatCoins } from "@/lib/utils";

type RedeemModalProps = {
  reward: Reward | null;
  balance: number;
  isPending: boolean;
  error: unknown;
  successMessage: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function RedeemModal({
  reward,
  balance,
  isPending,
  error,
  successMessage,
  onClose,
  onConfirm,
}: RedeemModalProps) {
  const remaining = reward ? balance - reward.coin_cost : balance;
  const apiError = error instanceof ApiError ? error : null;

  return (
    <Modal
      open={Boolean(reward)}
      title={successMessage ? "Reward redeemed" : apiError ? "Unable to redeem reward." : "Redeem reward?"}
      onClose={onClose}
      footer={
        successMessage || apiError ? (
          <Button onClick={onClose}>Close</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={onConfirm} loading={isPending}>
              Confirm redemption
            </Button>
          </>
        )
      }
    >
      {reward ? (
        <div className="grid gap-3 text-sm">
          {successMessage ? (
            <p className="text-success">{successMessage}</p>
          ) : apiError ? (
            <p className="text-danger">
              {apiError.payload.error === "INSUFFICIENT_BALANCE"
                ? `You need ${formatCoins(apiError.payload.required ?? reward.coin_cost)} coins, but only have ${formatCoins(apiError.payload.available ?? balance)} coins.`
                : apiError.message}
            </p>
          ) : (
            <>
              <p className="text-lg font-medium text-ink">{reward.name}</p>
              <p className="text-muted">{reward.description}</p>
              <p>
                Cost: <strong>{formatCoins(reward.coin_cost)} coins</strong>
              </p>
              <p>
                Your balance: <strong>{formatCoins(balance)} coins</strong>
              </p>
              <p>
                After redemption:{" "}
                <strong>{remaining >= 0 ? `${formatCoins(remaining)} coins` : "Not enough coins"}</strong>
              </p>
            </>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
