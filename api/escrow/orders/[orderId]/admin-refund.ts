import type { VercelRequest, VercelResponse } from '@vercel/node'
import { orders } from '../../../_store.js'

/**
 * Processes an admin refund for the order specified by `orderId` in the request query.
 *
 * Validates that the request method is POST, returns 405 if not. Responds 404 if the order is not found and 409 if the order's status is `released`. On success updates the order's status to `refunded`, sets `updatedAt` to the current ISO timestamp, persists the update, and returns the updated order.
 *
 * @returns The updated order object with status `"refunded"` and a new `updatedAt` timestamp on success; otherwise a JSON error object with the corresponding HTTP status.
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

  if (order.status === 'released') {
    return res.status(409).json({ error: 'Released orders cannot be refunded' })
  }

  const next = {
    ...order,
    status: 'refunded' as const,
    updatedAt: new Date().toISOString(),
  }

  orders.set(next.id, next)
  return res.json(next)
}
