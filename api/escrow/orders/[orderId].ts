import type { VercelRequest, VercelResponse } from '@vercel/node'
import { orders } from '../../_store.js'

/**
 * Handle GET requests for a single escrow order identified by `orderId`, returning the order as JSON or an appropriate HTTP error.
 *
 * Responds with 405 if the HTTP method is not GET, 404 if no order exists for the provided `orderId`, and 200 with the order object when found.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { orderId } = req.query as { orderId: string }
  const order = orders.get(orderId)
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }

  return res.json(order)
}
