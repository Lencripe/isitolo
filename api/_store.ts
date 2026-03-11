/**
 * Module-level in-memory store shared across Vercel serverless function invocations
 * within the same container instance.
 *
 * NOTE: This is a development/testing scaffold only.
 * Replace with a persistent database (e.g. Postgres, Upstash Redis) before production use.
 * Data will be lost on cold-starts and does not persist across multiple Vercel instances.
 */

export type EscrowOrderStatus =
  | 'created'
  | 'funded_in_escrow'
  | 'shipped'
  | 'delivered'
  | 'released'
  | 'disputed'
  | 'refunded'

export interface EscrowOrderProduct {
  id: string
  name: string
  quantity: number
  unitPriceUsdc: number
}

export interface EscrowOrder {
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

export const orders = new Map<string, EscrowOrder>()
