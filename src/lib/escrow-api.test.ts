import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { EscrowOrder } from '../types/escrow'

const mockConfig = {
  ESCROW: {
    API_BASE_URL: '',
    ENABLED: true,
    VAULT_WALLET: 'vault-wallet',
    ADMIN_AUTHORITY_WALLET: 'admin-wallet',
    RELEASE_TIMEOUT_HOURS: 72,
    DISPUTE_WINDOW_HOURS: 168,
  },
}

vi.mock('../config/solana', () => ({
  SOLANA_CONFIG: mockConfig,
}))

const mockOrder: EscrowOrder = {
  id: 'ord-1',
  buyerWallet: 'buyer-wallet',
  merchantWallet: 'merchant-wallet',
  escrowVaultWallet: 'vault-wallet',
  amountUsdc: 100,
  status: 'funded_in_escrow',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  releaseAt: '2024-01-04T00:00:00.000Z',
  disputeWindowEndsAt: '2024-01-08T00:00:00.000Z',
  products: [],
}

describe('escrow-api', () => {
  beforeEach(() => {
    mockConfig.ESCROW.API_BASE_URL = ''
    vi.restoreAllMocks()
  })

  describe('returns null when API base URL is not configured', () => {
    it('autoReleaseEscrowOrderRemote returns null', async () => {
      const { autoReleaseEscrowOrderRemote } = await import('./escrow-api')
      const result = await autoReleaseEscrowOrderRemote({ orderId: 'ord-1' })
      expect(result).toBeNull()
    })

    it('adminRefundEscrowOrderRemote returns null', async () => {
      const { adminRefundEscrowOrderRemote } = await import('./escrow-api')
      const result = await adminRefundEscrowOrderRemote({ orderId: 'ord-1' })
      expect(result).toBeNull()
    })
  })

  describe('with API base URL configured', () => {
    beforeEach(() => {
      mockConfig.ESCROW.API_BASE_URL = 'http://localhost:3001'
    })

    it('autoReleaseEscrowOrderRemote calls the correct endpoint and returns the updated order', async () => {
      const releasedOrder = { ...mockOrder, status: 'released' as const }
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(releasedOrder), { status: 200, headers: { 'Content-Type': 'application/json' } }),
      )

      const { autoReleaseEscrowOrderRemote } = await import('./escrow-api')
      const result = await autoReleaseEscrowOrderRemote({ orderId: 'ord-1' })

      expect(fetchSpy).toHaveBeenCalledOnce()
      const calledUrl = fetchSpy.mock.calls[0][0] as string
      expect(calledUrl).toContain('/escrow/orders/ord-1/auto-release')
      expect(result).not.toBeNull()
      expect(result).toEqual(releasedOrder)
    })

    it('adminRefundEscrowOrderRemote calls the correct endpoint and returns the updated order', async () => {
      const refundedOrder = { ...mockOrder, status: 'refunded' as const }
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(refundedOrder), { status: 200, headers: { 'Content-Type': 'application/json' } }),
      )

      const { adminRefundEscrowOrderRemote } = await import('./escrow-api')
      const result = await adminRefundEscrowOrderRemote({ orderId: 'ord-1' })

      expect(fetchSpy).toHaveBeenCalledOnce()
      const calledUrl = fetchSpy.mock.calls[0][0] as string
      expect(calledUrl).toContain('/escrow/orders/ord-1/admin-refund')
      expect(result).not.toBeNull()
      expect(result).toEqual(refundedOrder)
    })
  })
})
