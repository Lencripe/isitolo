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

  PASSPORT: {
    NETWORK: 'devnet' as const,
    MINT_STRATEGY: 'auto' as 'auto' | 'direct' | 'candy_machine',
    NFT_SYMBOL: 'ISTOLO-DPP',
    ENABLE_ONCHAIN_MINT: true,
    PUBLIC_APP_URL: 'https://istolo.app',
    METADATA_BASE_URI: 'https://istolo.app/passports',
    CANDY_MACHINE: {
      ENABLED: false,
      ID: '',
      MINT_ENDPOINT: '',
      LABEL: 'batch-drop',
    },
    DEFAULT_IMAGE: 'https://placehold.co/1024x1024/png?text=Istolo+Passport',
    MANUFACTURER_NAME: 'Istolo Printing',
    COUNTRY_OF_ORIGIN: 'EU',
    DEFAULT_MATERIALS: ['Aluminum', 'Paper Fiber', 'Water-based Ink'],
    DEFAULT_CERTIFICATIONS: ['REACH', 'RoHS', 'ISO 14001'],
    DEFAULT_REPAIRABILITY_SCORE: 8,
    DEFAULT_RECYCLED_CONTENT_PERCENT: 35,
  },
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
