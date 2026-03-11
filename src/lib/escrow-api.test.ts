import { afterEach, describe, expect, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Mock SOLANA_CONFIG so we can control API_BASE_URL at the module level.
// vi.hoisted() runs before module imports (even before vi.mock factories),
// making the returned object safely usable inside the vi.mock factory.
// ---------------------------------------------------------------------------
const mockConfig = vi.hoisted(() => ({
  ESCROW: { API_BASE_URL: '' },
}))

vi.mock('../config/solana', () => ({
  SOLANA_CONFIG: mockConfig,
}))

import {
  adminRefundEscrowOrderRemote,
  autoReleaseEscrowOrderRemote,
  confirmEscrowOrderReceiptRemote,
  createEscrowOrderRemote,
  markEscrowOrderFundedRemote,
  openEscrowDisputeRemote,
} from './escrow-api'

afterEach(() => {
  mockConfig.ESCROW.API_BASE_URL = ''
  vi.restoreAllMocks()
})

const mockOrder = {
  id: 'ord-1',
  buyerWallet: 'wallet-a',
  merchantWallet: 'wallet-m',
  escrowVaultWallet: 'wallet-v',
  amountUsdc: 10,
  status: 'created' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  releaseAt: '2026-01-04T00:00:00Z',
  disputeWindowEndsAt: '2026-01-08T00:00:00Z',
  products: [{ id: 'p-1', name: 'Tee', quantity: 1, unitPriceUsdc: 10 }],
}

// ---------------------------------------------------------------------------
// No API base URL configured (default) — every call must short-circuit to null
// ---------------------------------------------------------------------------
describe('escrow-api (no API base URL configured)', () => {
  it('createEscrowOrderRemote returns null', async () => {
    const result = await createEscrowOrderRemote({
      buyerWallet: 'wallet-a',
      amountUsdc: 10,
      products: [{ id: 'p-1', name: 'Tee', quantity: 1, unitPriceUsdc: 10 }],
    })
    expect(result).toBeNull()
  })

  it('markEscrowOrderFundedRemote returns null', async () => {
    expect(await markEscrowOrderFundedRemote({ orderId: 'ord-1', signature: 'sig-abc' })).toBeNull()
  })

  it('confirmEscrowOrderReceiptRemote returns null', async () => {
    expect(await confirmEscrowOrderReceiptRemote({ orderId: 'ord-1' })).toBeNull()
  })

  it('openEscrowDisputeRemote returns null', async () => {
    expect(await openEscrowDisputeRemote({ orderId: 'ord-1', reason: 'Item not received' })).toBeNull()
  })

  it('autoReleaseEscrowOrderRemote returns null', async () => {
    expect(await autoReleaseEscrowOrderRemote({ orderId: 'ord-1' })).toBeNull()
  })

  it('adminRefundEscrowOrderRemote returns null', async () => {
    expect(await adminRefundEscrowOrderRemote({ orderId: 'ord-1' })).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// API base URL is configured — test fetch behaviour paths
// ---------------------------------------------------------------------------
describe('escrow-api (with API base URL configured)', () => {
  it('createEscrowOrderRemote calls the correct endpoint and returns the order', async () => {
    mockConfig.ESCROW.API_BASE_URL = 'https://api.example.com'

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockOrder), { status: 200 }),
    )

    const result = await createEscrowOrderRemote({
      buyerWallet: 'wallet-a',
      amountUsdc: 10,
      products: mockOrder.products,
    })

    expect(fetchSpy).toHaveBeenCalledOnce()
    expect(String(fetchSpy.mock.calls[0][0])).toBe('https://api.example.com/escrow/orders')
    expect(result).toEqual(mockOrder)
  })

  it('markEscrowOrderFundedRemote calls the fund endpoint', async () => {
    mockConfig.ESCROW.API_BASE_URL = 'https://api.example.com'

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ...mockOrder, status: 'funded' }), { status: 200 }),
    )

    const result = await markEscrowOrderFundedRemote({ orderId: 'ord-1', signature: 'sig-xyz' })

    expect(fetchSpy).toHaveBeenCalledOnce()
    expect(String(fetchSpy.mock.calls[0][0])).toContain('/escrow/orders/ord-1/fund')
    expect(result).not.toBeNull()
  })

  it('returns null on non-ok HTTP response (e.g. 500)', async () => {
    mockConfig.ESCROW.API_BASE_URL = 'https://api.example.com'

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Internal Server Error', { status: 500 }),
    )

    const result = await confirmEscrowOrderReceiptRemote({ orderId: 'ord-1' })

    expect(result).toBeNull()
  })

  it('returns null when fetch throws a network error', async () => {
    mockConfig.ESCROW.API_BASE_URL = 'https://api.example.com'

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network failure'))

    const result = await openEscrowDisputeRemote({ orderId: 'ord-1', reason: 'Missing item' })

    expect(result).toBeNull()
  })
})
