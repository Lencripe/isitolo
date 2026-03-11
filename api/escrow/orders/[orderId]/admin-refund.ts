import type { VercelRequest, VercelResponse } from '@vercel/node'
import { orders } from '../../../_store.js'

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
