/**
 * Solana Configuration
 * 
 * This file contains all Solana-related configuration including network settings,
 * token addresses, and merchant wallet information.
 */

// Network Configuration
const PUBLIC_APP_URL = (import.meta.env.VITE_PUBLIC_APP_URL || 'https://istolo.store').replace(/\/$/, '')
const DPP_STORAGE_MODE = (import.meta.env.VITE_DPP_STORAGE_MODE || 'mock') as
  | 'arweave'
  | 'onchain'
  | 'hybrid'
  | 'mock'

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

  ESCROW: {
    ENABLED: true,
    API_BASE_URL: (import.meta.env.VITE_ESCROW_API_BASE_URL || '').replace(/\/$/, ''),
    VAULT_WALLET: import.meta.env.VITE_ESCROW_VAULT_WALLET || 'FciDCLGLaCDaFfYyf3jwH4hRbkNQsF1HrroNUVuR2EEH',
    ADMIN_AUTHORITY_WALLET: import.meta.env.VITE_ESCROW_ADMIN_WALLET || 'FciDCLGLaCDaFfYyf3jwH4hRbkNQsF1HrroNUVuR2EEH',
    RELEASE_TIMEOUT_HOURS: Number(import.meta.env.VITE_ESCROW_RELEASE_TIMEOUT_HOURS || 72),
    DISPUTE_WINDOW_HOURS: Number(import.meta.env.VITE_ESCROW_DISPUTE_WINDOW_HOURS || 168),
  },

  REWARDS: {
    ENABLED: true,
    POINTS_PER_USDC: 10,
    REDEEM_USDC_PER_POINT: 0.01,
  },

  COLLECTIONS: {
    ENABLED: import.meta.env.VITE_COLLECTIONS_ONCHAIN_ENABLED !== 'false',
    PROGRAM_ID: import.meta.env.VITE_COLLECTIONS_PROGRAM_ID || '',
    FALLBACK_TO_LOCAL: import.meta.env.VITE_COLLECTIONS_FALLBACK_TO_LOCAL !== 'false',
  },

  PASSPORT: {
    NETWORK: 'devnet' as const,
    MINT_STRATEGY: 'auto' as 'auto' | 'direct' | 'candy_machine',
    NFT_SYMBOL: 'ISTOLO-DPP',
    ENABLE_ONCHAIN_MINT: true,
    PUBLIC_APP_URL,
    METADATA_BASE_URI: `${PUBLIC_APP_URL}/passports`,
    DPP_STORAGE: {
      MODE: DPP_STORAGE_MODE,
      STRICT_MODE: import.meta.env.VITE_DPP_STORAGE_STRICT === 'true',
      ARWEAVE_UPLOAD_ENDPOINT: import.meta.env.VITE_ARWEAVE_UPLOAD_ENDPOINT || '',
      ONCHAIN_POINTER_WALLET: import.meta.env.VITE_DPP_POINTER_WALLET || '',
      ONCHAIN_POINTER_ENDPOINT: import.meta.env.VITE_DPP_POINTER_ENDPOINT || '',
    },
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
