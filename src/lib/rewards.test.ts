import { describe, expect, it } from 'vitest'

import {
  applyRewardsForPurchase,
  calculateRedeemablePoints,
  calculateRewardsDiscount,
  getRewardsBalance,
} from './rewards'

describe('rewards helpers', () => {
  it('starts unknown wallets with a zero balance', () => {
    const result = getRewardsBalance('wallet-a')

    expect(result.walletAddress).toBe('wallet-a')
    expect(result.points).toBe(0)
    expect(result.updatedAt).toBeTruthy()
  })

  it('calculates discount based on configured point value', () => {
    expect(calculateRewardsDiscount(100)).toBe(1)
    expect(calculateRewardsDiscount(0)).toBe(0)
  })

  it('limits redeemable points to order value and wallet balance', () => {
    expect(calculateRedeemablePoints(5, 800)).toBe(500)
    expect(calculateRedeemablePoints(5, 20)).toBe(20)
    expect(calculateRedeemablePoints(0, 200)).toBe(0)
  })

  it('earns and redeems points with proper clamping', () => {
    const first = applyRewardsForPurchase('wallet-b', 12.3, 999)

    expect(first.pointsEarned).toBe(123)
    expect(first.pointsRedeemed).toBe(0)
    expect(first.balanceAfter).toBe(123)

    const second = applyRewardsForPurchase('wallet-b', 1, 1000)

    expect(second.pointsEarned).toBe(10)
    expect(second.pointsRedeemed).toBe(123)
    expect(second.balanceAfter).toBe(10)
  })
})
