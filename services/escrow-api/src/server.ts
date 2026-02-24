import cors from 'cors'
import express from 'express'
import { z } from 'zod'

type EscrowOrderStatus =
  | 'created'
  | 'funded_in_escrow'
  | 'shipped'
  | 'delivered'
  | 'released'
  | 'disputed'
  | 'refunded'

interface EscrowOrderProduct {
  id: string
  name: string
  quantity: number
  unitPriceUsdc: number
}

interface EscrowOrder {
  id: string
  buyerWallet: string
  merchantWallet: string
  escrowVaultWallet: string
  amountUsdc: number
  paymentSignature?: string
  status: EscrowOrderStatus
  disputeReason?: string
  createdAt: string
  updatedAt: string
  releaseAt: string
  disputeWindowEndsAt: string
  products: EscrowOrderProduct[]
}

const app = express()
const port = Number(process.env.PORT || 8787)
const merchantWallet = process.env.ESCROW_MERCHANT_WALLET || ''
const escrowVaultWallet = process.env.ESCROW_VAULT_WALLET || ''
const releaseTimeoutHours = Number(process.env.ESCROW_RELEASE_TIMEOUT_HOURS || 72)
const disputeWindowHours = Number(process.env.ESCROW_DISPUTE_WINDOW_HOURS || 168)

const orders = new Map<string, EscrowOrder>()

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

const fundOrderSchema = z.object({
  signature: z.string().min(16),
})

const disputeSchema = z.object({
  reason: z.string().min(6).max(500),
})

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/escrow/orders', (req, res) => {
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
    amountUsdc: Number(parsed.data.amountUsdc.toFixed(2)),
    status: 'created',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    releaseAt: releaseAt.toISOString(),
    disputeWindowEndsAt: disputeWindowEndsAt.toISOString(),
    products: parsed.data.products,
  }

  orders.set(order.id, order)
  return res.status(201).json(order)
})

app.get('/escrow/orders/:orderId', (req, res) => {
  const order = orders.get(req.params.orderId)
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }

  return res.json(order)
})

app.post('/escrow/orders/:orderId/fund', (req, res) => {
  const order = orders.get(req.params.orderId)
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }

  const parsed = fundOrderSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const next: EscrowOrder = {
    ...order,
    status: 'funded_in_escrow',
    paymentSignature: parsed.data.signature,
    updatedAt: new Date().toISOString(),
  }

  orders.set(next.id, next)
  return res.json(next)
})

app.post('/escrow/orders/:orderId/confirm-receipt', (req, res) => {
  const order = orders.get(req.params.orderId)
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }

  if (order.status === 'released' || order.status === 'refunded') {
    return res.status(409).json({ error: `Cannot confirm receipt for status ${order.status}` })
  }

  const next: EscrowOrder = {
    ...order,
    status: 'released',
    updatedAt: new Date().toISOString(),
  }

  orders.set(next.id, next)
  return res.json(next)
})

app.post('/escrow/orders/:orderId/dispute', (req, res) => {
  const order = orders.get(req.params.orderId)
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

  const next: EscrowOrder = {
    ...order,
    status: 'disputed',
    disputeReason: parsed.data.reason,
    updatedAt: new Date().toISOString(),
  }

  orders.set(next.id, next)
  return res.json(next)
})

app.post('/escrow/orders/:orderId/auto-release', (req, res) => {
  const order = orders.get(req.params.orderId)
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

  const next: EscrowOrder = {
    ...order,
    status: 'released',
    updatedAt: new Date().toISOString(),
  }

  orders.set(next.id, next)
  return res.json(next)
})

app.post('/escrow/orders/:orderId/admin-refund', (req, res) => {
  const order = orders.get(req.params.orderId)
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }

  if (order.status === 'released') {
    return res.status(409).json({ error: 'Released orders cannot be refunded' })
  }

  const next: EscrowOrder = {
    ...order,
    status: 'refunded',
    updatedAt: new Date().toISOString(),
  }

  orders.set(next.id, next)
  return res.json(next)
})

app.listen(port, () => {
  console.log(`Escrow API listening on http://localhost:${port}`)
})
