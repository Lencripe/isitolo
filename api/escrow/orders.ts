import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { orders, type EscrowOrder } from '../_store.js'

const merchantWallet = process.env.ESCROW_MERCHANT_WALLET || ''
const escrowVaultWallet = process.env.ESCROW_VAULT_WALLET || ''
const releaseTimeoutHours = Number(process.env.ESCROW_RELEASE_TIMEOUT_HOURS || 72)
const disputeWindowHours = Number(process.env.ESCROW_DISPUTE_WINDOW_HOURS || 168)

if (!merchantWallet) {
  console.warn('⚠️  ESCROW_MERCHANT_WALLET is not set. Orders will have an empty merchant wallet address.')
}
if (!escrowVaultWallet) {
  console.warn('⚠️  ESCROW_VAULT_WALLET is not set. Orders will have an empty vault wallet address.')
}

const createOrderSchema = z.object({
  buyerWallet: z.string().min(32),
  amountUsdc: z.number().positive(),
  products: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPriceUsdc: z.number().nonnegative(),
      })
    )
    .min(1),
})

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parsed = createOrderSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const now = new Date()
  const releaseAt = new Date(now.getTime() + releaseTimeoutHours * 60 * 60 * 1000)
  const disputeWindowEndsAt = new Date(now.getTime() + disputeWindowHours * 60 * 60 * 1000)

  const order: EscrowOrder = {
    id: `escrow_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    buyerWallet: parsed.data.buyerWallet,
    merchantWallet,
    escrowVaultWallet,
    amountUsdc: Math.round(parsed.data.amountUsdc * 100) / 100,
    status: 'created',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    releaseAt: releaseAt.toISOString(),
    disputeWindowEndsAt: disputeWindowEndsAt.toISOString(),
    products: parsed.data.products,
  }

  orders.set(order.id, order)
  return res.status(201).json(order)
}
