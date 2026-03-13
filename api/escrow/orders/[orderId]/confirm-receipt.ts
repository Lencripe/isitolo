import type { VercelRequest, VercelResponse } from '@vercel/node'
import { orders } from '../../../_store.js'

/**
 * Handles confirmation of receipt for an order by transitioning its status to `released`.
 *
 * Responds with 405 if the request method is not POST, 404 if the orderId does not exist,
 * and 409 if the order's status is already `released` or `refunded`.
 *
 * @returns The updated order object with its `status` set to `released` and `updatedAt` set to the current ISO timestamp
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
    return res.status(409).json({ error: `Cannot confirm receipt for status ${order.status}` })
  }

  const next = {
    ...order,
    status: 'released' as const,
    updatedAt: new Date().toISOString(),
  }

  orders.set(next.id, next)
  return res.json(next)
}
