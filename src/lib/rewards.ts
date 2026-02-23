import { SOLANA_CONFIG } from '../config/solana'

const REWARDS_STORAGE_KEY = 'istolo:rewards:ledger'

export interface RewardsBalance {
  walletAddress: string
  points: number
  updatedAt: string
}

export interface RewardsEarnResult {
  pointsEarned: number
  pointsRedeemed: number
  balanceAfter: number
}

interface RewardsLedger {
  [walletAddress: string]: RewardsBalance
}

function loadLedger(): RewardsLedger {
  if (typeof window === 'undefined') {
    return {}
  }

  const raw = window.localStorage.getItem(REWARDS_STORAGE_KEY)
  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw) as RewardsLedger
  } catch {
    return {}
  }
}

function saveLedger(ledger: RewardsLedger): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(ledger))
}

export function getRewardsBalance(walletAddress: string): RewardsBalance {
  const ledger = loadLedger()
  const existing = ledger[walletAddress]
  if (existing) {
    return existing
  }

  return {
    walletAddress,
    points: 0,
    updatedAt: new Date().toISOString(),
  }
}

export function calculateRewardsDiscount(points: number): number {
  const valuePerPoint = SOLANA_CONFIG.REWARDS.REDEEM_USDC_PER_POINT
  return Math.max(0, points * valuePerPoint)
}

export function calculateRedeemablePoints(totalUsdc: number, balance: number): number {
  const valuePerPoint = SOLANA_CONFIG.REWARDS.REDEEM_USDC_PER_POINT
  if (valuePerPoint <= 0) {
    return 0
  }

  const maxPointsForOrder = Math.floor(totalUsdc / valuePerPoint)
  return Math.max(0, Math.min(balance, maxPointsForOrder))
}

export function applyRewardsForPurchase(
  walletAddress: string,
  totalUsdc: number,
  pointsToRedeem: number
): RewardsEarnResult {
  const ledger = loadLedger()
  const balance = ledger[walletAddress]?.points ?? 0
  const pointsEarned = Math.floor(totalUsdc * SOLANA_CONFIG.REWARDS.POINTS_PER_USDC)
  const pointsRedeemed = Math.max(0, Math.min(pointsToRedeem, balance))
  const balanceAfter = balance - pointsRedeemed + pointsEarned

  ledger[walletAddress] = {
    walletAddress,
    points: balanceAfter,
    updatedAt: new Date().toISOString(),
  }

  saveLedger(ledger)

  return {
    pointsEarned,
    pointsRedeemed,
    balanceAfter,
  }
}
