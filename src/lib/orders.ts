import type { OrderStatus } from "@/lib/types";

/**
 * Order fulfillment ordering used both by buyers (track page) and to derive an
 * order's overall status from its line items.
 */
export const PROGRESS: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

/**
 * Statuses a seller is allowed to set on their own line items. Payment
 * (`PAID`) stays admin-only; the rest reflect the seller's fulfillment work.
 */
export const SELLER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

/**
 * Given the per-line statuses, derive the order-level status. Because an order
 * can span several sellers, the order is "as advanced as its most advanced
 * shipped line" — but never regresses past a full/terminal state.
 *
 * `CANCELLED` / `REFUNDED` are excluded from the progress max, so one
 * cancelled line doesn't downgrade a delivered order.
 */
export function recomputeOrderStatus(statuses: (OrderStatus | string)[]): OrderStatus {
  const valid = statuses
    .map((s) => PROGRESS.indexOf(s as OrderStatus))
    .filter((i) => i >= 0);
  if (valid.length === 0) return (statuses[0] as OrderStatus) || "PENDING";
  return PROGRESS[Math.max(...valid)];
}

/** True when `status` is SHIPPED or DELIVERED (i.e. has moved out of the warehouse). */
export function isFulfilled(status: OrderStatus): boolean {
  return status === "SHIPPED" || status === "DELIVERED";
}