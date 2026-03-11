import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { orders } from '../../../_store.js'

const fundOrderSchema = z.object({
  signature: z.string().min(16),
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

  const parsed = fundOrderSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const next = {
    ...order,
    status: 'funded_in_escrow' as const,
    paymentSignature: parsed.data.signature,
    updatedAt: new Date().toISOString(),
  }

  orders.set(next.id, next)
  return res.json(next)
}
