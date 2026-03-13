import type { VercelRequest, VercelResponse } from '@vercel/node'
import { orders } from '../../../_store.js'

/**
 * Auto-releases an escrowed order identified by `orderId` when its release time has elapsed.
 *
 * Validates that the request is POST, looks up the order, and responds with appropriate HTTP statuses:
 * 404 if the order is not found; 409 if the release time has not elapsed or the order is disputed;
 * returns the existing order if it's already `released` or `refunded`. When eligible, updates the order's
 * status to `released`, sets `updatedAt` to the current time, persists the change, and returns the updated order.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { orderId } = req.query as { orderId: string }
  const order = orders.get(orderId)
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }

  if (order.status === 'released' || order.status === 'refunded') {
    return res.json(order)
  }

  if (Date.now() < Date.parse(order.releaseAt)) {
    return res.status(409).json({ error: 'Release timeout has not elapsed yet' })
  }

  if (order.status === 'disputed') {
    return res.status(409).json({ error: 'Order is disputed and requires admin action' })
  }

  const next = {
    ...order,
    status: 'released' as const,
    updatedAt: new Date().toISOString(),
  }

  orders.set(next.id, next)
  return res.json(next)
}
