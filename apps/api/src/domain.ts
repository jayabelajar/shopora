import { FulfillmentStatus } from '@prisma/client';

export function calculateOrderTotals(lines: { price: bigint; quantity: number }[], shippingFee = 25_000n) {
  if (lines.some(line => line.price < 0n || !Number.isInteger(line.quantity) || line.quantity < 1)) throw new Error('INVALID_ORDER_LINE');
  const subtotal = lines.reduce((sum, line) => sum + line.price * BigInt(line.quantity), 0n);
  return { subtotal, shippingFee, discountAmount: 0n, totalAmount: subtotal + shippingFee };
}

export function canTransitionFulfillment(from: FulfillmentStatus, to: FulfillmentStatus) {
  const allowed: Record<FulfillmentStatus, FulfillmentStatus[]> = {
    PENDING: [FulfillmentStatus.PROCESSING, FulfillmentStatus.CANCELED],
    PROCESSING: [FulfillmentStatus.SHIPPED], SHIPPED: [FulfillmentStatus.DELIVERED], DELIVERED: [], CANCELED: []
  };
  return allowed[from].includes(to);
}
