import { SOLANA_CONFIG } from '../config/solana'
import type { EscrowOrder, EscrowOrderProduct } from '../types/escrow'

interface EscrowMutationPayload {
  orderId: string
  signature?: string
  reason?: string
}

function getEscrowApiBaseUrl() {
  return SOLANA_CONFIG.ESCROW.API_BASE_URL
}

function canUseEscrowApi() {
  return Boolean(getEscrowApiBaseUrl())
}

async function requestEscrowApi<T>(path: string, init?: RequestInit): Promise<T | null> {
  const baseUrl = getEscrowApiBaseUrl()
  if (!baseUrl) {
    return null
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...init,
    })

    if (!response.ok) {
      const text = await response.text()
      console.warn(`Escrow API request failed (${response.status}):`, text)
      return null
    }

    if (response.status === 204) {
      return null
    }

    return (await response.json()) as T
  } catch (error) {
    console.warn('Escrow API unavailable, falling back to local escrow state:', error)
    return null
  }
}

export async function createEscrowOrderRemote(input: {
  buyerWallet: string
  amountUsdc: number
  products: EscrowOrderProduct[]
}): Promise<EscrowOrder | null> {
  if (!canUseEscrowApi()) {
    return null
  }

  return requestEscrowApi<EscrowOrder>('/escrow/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function markEscrowOrderFundedRemote(payload: EscrowMutationPayload): Promise<EscrowOrder | null> {
  if (!canUseEscrowApi()) {
    return null
  }

  return requestEscrowApi<EscrowOrder>(`/escrow/orders/${payload.orderId}/fund`, {
    method: 'POST',
    body: JSON.stringify({ signature: payload.signature }),
  })
}

export async function confirmEscrowOrderReceiptRemote(payload: EscrowMutationPayload): Promise<EscrowOrder | null> {
  if (!canUseEscrowApi()) {
    return null
  }

  return requestEscrowApi<EscrowOrder>(`/escrow/orders/${payload.orderId}/confirm-receipt`, {
    method: 'POST',
  })
}

export async function openEscrowDisputeRemote(payload: EscrowMutationPayload): Promise<EscrowOrder | null> {
  if (!canUseEscrowApi()) {
    return null
  }

  return requestEscrowApi<EscrowOrder>(`/escrow/orders/${payload.orderId}/dispute`, {
    method: 'POST',
    body: JSON.stringify({ reason: payload.reason }),
  })
}

export async function autoReleaseEscrowOrderRemote(payload: EscrowMutationPayload): Promise<EscrowOrder | null> {
  if (!canUseEscrowApi()) {
    return null
  }

  return requestEscrowApi<EscrowOrder>(`/escrow/orders/${payload.orderId}/auto-release`, {
    method: 'POST',
  })
}

export async function adminRefundEscrowOrderRemote(payload: EscrowMutationPayload): Promise<EscrowOrder | null> {
  if (!canUseEscrowApi()) {
    return null
  }

  return requestEscrowApi<EscrowOrder>(`/escrow/orders/${payload.orderId}/admin-refund`, {
    method: 'POST',
  })
}
