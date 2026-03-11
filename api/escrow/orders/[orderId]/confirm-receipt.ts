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
