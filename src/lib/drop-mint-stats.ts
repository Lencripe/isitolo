import type { StoredCartItem } from './cart'

const DROP_MINT_STATS_STORAGE_KEY = 'istolo:dropMintStats:v1'
const DROP_MINT_STATS_UPDATED_EVENT = 'istolo:dropMintStatsUpdated'
const MAX_SIGNATURE_HISTORY = 500

interface DropMintStatsState {
  mintedByItemId: Record<string, number>
  processedSignatures: string[]
}

function normalizeState(input: Partial<DropMintStatsState> | null | undefined): DropMintStatsState {
  return {
    mintedByItemId: input?.mintedByItemId && typeof input.mintedByItemId === 'object'
      ? input.mintedByItemId
      : {},
    processedSignatures: Array.isArray(input?.processedSignatures)
      ? input!.processedSignatures.filter((value): value is string => typeof value === 'string')
      : [],
  }
}

export function loadDropMintStats(): DropMintStatsState {
  if (typeof window === 'undefined') {
    return { mintedByItemId: {}, processedSignatures: [] }
  }

  const raw = window.localStorage.getItem(DROP_MINT_STATS_STORAGE_KEY)
  if (!raw) {
    return { mintedByItemId: {}, processedSignatures: [] }
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DropMintStatsState>
    return normalizeState(parsed)
  } catch {
    return { mintedByItemId: {}, processedSignatures: [] }
  }
}

function persistDropMintStats(state: DropMintStatsState): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(DROP_MINT_STATS_STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event(DROP_MINT_STATS_UPDATED_EVENT))
}

export function getDropMintStatsEventName(): string {
  return DROP_MINT_STATS_UPDATED_EVENT
}

export function getMintedCountForItem(itemId: string): number {
  const state = loadDropMintStats()
  const value = state.mintedByItemId[itemId]
  if (!Number.isFinite(value) || value <= 0) {
    return 0
  }

  return Math.floor(value)
}

export function getRemainingSupply(itemId: string, maxSupply: number): number {
  const minted = getMintedCountForItem(itemId)
  return Math.max(maxSupply - minted, 0)
}

export function applyDropMintStatsForPurchase(paymentSignature: string, cartItems: StoredCartItem[]): void {
  if (!paymentSignature || cartItems.length === 0) {
    return
  }

  const state = loadDropMintStats()
  if (state.processedSignatures.includes(paymentSignature)) {
    return
  }

  const nextMintedByItemId = { ...state.mintedByItemId }

  for (const entry of cartItems) {
    const sourceItemId = entry.product.sourceItemId
    if (!sourceItemId) {
      continue
    }

    const quantity = Number(entry.quantity)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      continue
    }

    const current = nextMintedByItemId[sourceItemId] || 0
    nextMintedByItemId[sourceItemId] = current + Math.floor(quantity)
  }

  const signatures = [...state.processedSignatures, paymentSignature]
  const boundedSignatures = signatures.length > MAX_SIGNATURE_HISTORY
    ? signatures.slice(signatures.length - MAX_SIGNATURE_HISTORY)
    : signatures

  persistDropMintStats({
    mintedByItemId: nextMintedByItemId,
    processedSignatures: boundedSignatures,
  })
}
