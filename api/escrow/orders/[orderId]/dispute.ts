import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { orders } from '../../../_store.js'

const disputeSchema = z.object({
  reason: z.string().min(6).max(500),
})

/**
 * Handle POST requests to mark an order as disputed and return the updated order.
 *
 * Validates the request method and body (dispute reason must be 6–500 characters), verifies the target order exists, rejects disputes for orders in status `released` or `refunded`, updates the order's status to `disputed` with the provided reason and a new `updatedAt` timestamp, persists the change, and responds with the updated order object.
 *
 * Responds with error JSON and the following HTTP statuses on failure:
 * - 405 when the HTTP method is not POST
 * - 404 when the order cannot be found
 * - 400 when the request body fails validation
 * - 409 when the order's status prevents disputing
 *
 * @returns The updated order object as JSON when the dispute is applied
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
