import { describe, expect, it } from 'vitest';
import { FulfillmentStatus } from '@prisma/client';
import { calculateOrderTotals, canTransitionFulfillment } from './domain.js';

describe('order totals', () => {
  it('calculates integer IDR totals on the server', () => expect(calculateOrderTotals([{price:100_000n,quantity:2},{price:25_000n,quantity:1}])).toEqual({subtotal:225_000n,shippingFee:25_000n,discountAmount:0n,totalAmount:250_000n}));
  it('rejects invalid quantities', () => expect(() => calculateOrderTotals([{price:10n,quantity:0}])).toThrow('INVALID_ORDER_LINE'));
});
describe('fulfillment transitions', () => {
  it('allows the valid paid-order sequence', () => {
    expect(canTransitionFulfillment(FulfillmentStatus.PENDING,FulfillmentStatus.PROCESSING)).toBe(true);
    expect(canTransitionFulfillment(FulfillmentStatus.PROCESSING,FulfillmentStatus.SHIPPED)).toBe(true);
    expect(canTransitionFulfillment(FulfillmentStatus.SHIPPED,FulfillmentStatus.DELIVERED)).toBe(true);
  });
  it('blocks skipping states and delivered mutations', () => {
    expect(canTransitionFulfillment(FulfillmentStatus.PENDING,FulfillmentStatus.SHIPPED)).toBe(false);
    expect(canTransitionFulfillment(FulfillmentStatus.DELIVERED,FulfillmentStatus.CANCELED)).toBe(false);
  });
});
