import { SOLANA_CONFIG } from '../config/solana'
import type { EscrowOrder, EscrowOrderProduct } from '../types/escrow'
import {
  adminRefundEscrowOrderRemote,
  autoReleaseEscrowOrderRemote,
  confirmEscrowOrderReceiptRemote,
  createEscrowOrderRemote,
  markEscrowOrderFundedRemote,
  openEscrowDisputeRemote,
} from './escrow-api'

const ESCROW_STORAGE_KEY = 'istolo:escrow_orders'

function loadEscrowOrders(): EscrowOrder[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const serialized = window.localStorage.getItem(ESCROW_STORAGE_KEY)
    if (!serialized) {
      return []
    }

    const parsed = JSON.parse(serialized) as EscrowOrder[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to load escrow orders from storage:', error)
    return []
  }
}

function persistEscrowOrders(orders: EscrowOrder[]) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(ESCROW_STORAGE_KEY, JSON.stringify(orders))
  } catch (error) {
    console.error('Failed to persist escrow orders to storage:', error)
  }
}

function updateEscrowOrder(
  orderId: string,
  updater: (current: EscrowOrder) => EscrowOrder
): EscrowOrder | null {
  const orders = loadEscrowOrders()
  const orderIndex = orders.findIndex((order) => order.id === orderId)

  if (orderIndex === -1) {
    return null
  }

  const nextOrder = updater(orders[orderIndex])
  orders[orderIndex] = {
    ...nextOrder,
    updatedAt: new Date().toISOString(),
  }
  persistEscrowOrders(orders)
  return orders[orderIndex]
}

export function createEscrowOrder(input: {
  buyerWallet: string
  amountUsdc: number
  products: EscrowOrderProduct[]
}): EscrowOrder {
  const now = new Date()
  const releaseAt = new Date(now.getTime() + SOLANA_CONFIG.ESCROW.RELEASE_TIMEOUT_HOURS * 60 * 60 * 1000)
  const disputeWindowEndsAt = new Date(now.getTime() + SOLANA_CONFIG.ESCROW.DISPUTE_WINDOW_HOURS * 60 * 60 * 1000)

  const order: EscrowOrder = {
    id: `escrow_${now.getTime()}_${Math.random().toString(36).slice(2, 10)}`,
    buyerWallet: input.buyerWallet,
    merchantWallet: SOLANA_CONFIG.MERCHANT_WALLET,
    escrowVaultWallet: SOLANA_CONFIG.ESCROW.VAULT_WALLET,
    amountUsdc: Number(input.amountUsdc.toFixed(2)),
    status: 'created',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    releaseAt: releaseAt.toISOString(),
    disputeWindowEndsAt: disputeWindowEndsAt.toISOString(),
    products: input.products,
  }

  const orders = loadEscrowOrders()
  orders.unshift(order)
  persistEscrowOrders(orders)
  void createEscrowOrderRemote(input)
  return order
}

export function markEscrowOrderFunded(orderId: string, paymentSignature: string): EscrowOrder | null {
  const nextOrder = updateEscrowOrder(orderId, (current) => ({
    ...current,
    paymentSignature,
    status: 'funded_in_escrow',
  }))
  if (nextOrder) {
    void markEscrowOrderFundedRemote({ orderId, signature: paymentSignature })
  }
  return nextOrder
}

export function markEscrowOrderShipped(orderId: string): EscrowOrder | null {
  return updateEscrowOrder(orderId, (current) => ({
    ...current,
    status: current.status === 'funded_in_escrow' ? 'shipped' : current.status,
  }))
}

export function markEscrowOrderDelivered(orderId: string): EscrowOrder | null {
  return updateEscrowOrder(orderId, (current) => ({
    ...current,
    status: current.status === 'shipped' ? 'delivered' : current.status,
  }))
}

export function confirmEscrowOrderReceipt(orderId: string): EscrowOrder | null {
  const nextOrder = updateEscrowOrder(orderId, (current) => ({
    ...current,
    status: current.status === 'delivered' || current.status === 'funded_in_escrow' || current.status === 'shipped'
      ? 'released'
      : current.status,
  }))
  if (nextOrder) {
    void confirmEscrowOrderReceiptRemote({ orderId })
  }
  return nextOrder
}

export function openEscrowDispute(orderId: string, reason: string): EscrowOrder | null {
  const nextOrder = updateEscrowOrder(orderId, (current) => ({
    ...current,
    status: current.status === 'released' || current.status === 'refunded' ? current.status : 'disputed',
    disputeReason: reason,
  }))
  if (nextOrder) {
    void openEscrowDisputeRemote({ orderId, reason })
  }
  return nextOrder
}

export function adminRefundEscrowOrder(orderId: string): EscrowOrder | null {
  const nextOrder = updateEscrowOrder(orderId, (current) => ({
    ...current,
    status: current.status === 'released' ? current.status : 'refunded',
  }))
  if (nextOrder) {
    void adminRefundEscrowOrderRemote({ orderId })
  }
  return nextOrder
}

export function autoReleaseExpiredEscrowOrder(orderId: string): EscrowOrder | null {
  const nextOrder = updateEscrowOrder(orderId, (current) => {
    const releaseTimeMs = Date.parse(current.releaseAt)
    const isExpired = Number.isFinite(releaseTimeMs) && Date.now() >= releaseTimeMs

    if (!isExpired) {
      return current
    }

    if (current.status === 'funded_in_escrow' || current.status === 'shipped' || current.status === 'delivered') {
      return {
        ...current,
        status: 'released',
      }
    }

    return current
  })
  if (nextOrder) {
    void autoReleaseEscrowOrderRemote({ orderId })
  }
  return nextOrder
}

export function getEscrowOrderById(orderId: string): EscrowOrder | null {
  const orders = loadEscrowOrders()
  return orders.find((order) => order.id === orderId) || null
}

export function getEscrowOrderBySignature(signature: string): EscrowOrder | null {
  const orders = loadEscrowOrders()
  return orders.find((order) => order.paymentSignature === signature) || null
}
