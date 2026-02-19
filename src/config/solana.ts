/**
 * Solana Configuration
 * 
 * This file contains all Solana-related configuration including network settings,
 * token addresses, and merchant wallet information.
 */

// Network Configuration
export const SOLANA_CONFIG = {
  // Devnet RPC endpoint
  RPC_ENDPOINT: 'https://api.devnet.solana.com',
  
  // Devnet USDC Mint Address (SPL Token)
  // Token details: https://explorer.solana.com/address/4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU?cluster=devnet
  USDC_MINT: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  
  /**
   * MERCHANT WALLET - Place your wallet address here
   * 
   * This is where customer USDC payments will be sent.
   * 
   * To get your wallet address:
   * 1. Open your wallet extension (Phantom, Backpack, etc.)
   * 2. Look for your public address/wallet address
   * 3. Make sure you're on Devnet network
   * 4. Copy and paste it below, replacing the placeholder
   * 
   * Example format: 'Hs1X... (43-44 characters)'
   * 
   * WARNING: This is a public address, but keep this file secure.
   * Never commit this file to git if it contains sensitive info.
   */
  MERCHANT_WALLET: 'FciDCLGLaCDaFfYyf3jwH4hRbkNQsF1HrroNUVuR2EEH',
  
  // Token decimals (USDC uses 6 decimals)
  USDC_DECIMALS: 6,
}

// Validation helper
export function validateMerchantWallet(): boolean {
  const wallet = SOLANA_CONFIG.MERCHANT_WALLET
  
  if (!wallet || wallet.includes('PLACE_YOUR')) {
    console.error(`❌ Merchant wallet not configured. Update MERCHANT_WALLET in src/config/solana.ts`)
    return false
  }
  
  // Basic Solana address validation (base58, 32-44 characters)
  // Base58 excludes: 0, O, I, l (to avoid confusion)
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
    console.error('❌ Invalid merchant wallet address format')
    return false
  }
  
  return true
}
