import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { orders } from '../../../_store.js'

const disputeSchema = z.object({
  reason: z.string().min(6).max(500),
})

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { orderId } = req.query as { orderId: string }
  const order = orders.get(orderId)
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }

  const parsed = disputeSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  if (order.status === 'released' || order.status === 'refunded') {
    return res.status(409).json({ error: `Cannot dispute order in status ${order.status}` })
  }

  const next = {
    ...order,
    status: 'disputed' as const,
    disputeReason: parsed.data.reason,
    updatedAt: new Date().toISOString(),
  }

  orders.set(next.id, next)
  return res.json(next)
}
