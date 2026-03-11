import { PublicKey } from '@solana/web3.js'
import { describe, expect, it } from 'vitest'

import {
  calculatePlatformFee,
  calculateTotalWithFees,
  createSolanaPayUrl,
  formatSol,
  formatUsd,
  isValidPublicKey,
  solToUsd,
  usdToSol,
} from './payment-utils'

describe('payment utils', () => {
  it('converts USD and SOL using the provided price', () => {
    expect(usdToSol(100, 200)).toBe(0.5)
    expect(solToUsd(0.5, 200)).toBe(100)
  })

  it('builds a Solana Pay URL with expected fields', () => {
    const recipient = new PublicKey('FciDCLGLaCDaFfYyf3jwH4hRbkNQsF1HrroNUVuR2EEH')
    const reference = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')

    const url = createSolanaPayUrl(recipient, 0.75, reference, 'Istolo Checkout', 'Order #123')

    expect(url.startsWith(`solana:${recipient.toBase58()}?`)).toBe(true)

    const query = url.split('?')[1]
    const params = new URLSearchParams(query)

    expect(params.get('amount')).toBe('0.75')
    expect(params.get('reference')).toBe(reference.toBase58())
    expect(params.get('label')).toBe('Istolo Checkout')
    expect(params.get('message')).toBe('Order #123')
  })

  it('calculates platform fee and total with fees', () => {
    expect(calculatePlatformFee(100, 5)).toBe(5)
    expect(calculateTotalWithFees(100, 5)).toBe(105)
  })

  it('validates public keys', () => {
    expect(isValidPublicKey('FciDCLGLaCDaFfYyf3jwH4hRbkNQsF1HrroNUVuR2EEH')).toBe(true)
    expect(isValidPublicKey('not-a-solana-key')).toBe(false)
  })

  it('formats display values for SOL and USD', () => {
    expect(formatSol(1.234567, 4)).toBe('1.2346')
    expect(formatUsd(12.5, 2)).toBe('$12.50')
  })
})
