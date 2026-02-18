import type { Product } from '@/types'

export const PRODUCTS: Product[] = [
  {
    id: 'metal-print-1',
    name: 'Metal Prints',
    description: 'Vibrant photo prints on premium aluminum',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8e12a7c6?w=400&h=400&fit=crop',
    basePrice: 29,
    category: 'metal',
    options: [
      {
        id: 'size',
        name: 'Size',
        values: ['8x10', '12x16', '16x24', '24x36'],
        priceModifier: 0,
      },
      {
        id: 'finish',
        name: 'Finish',
        values: ['Silver', 'Gold', 'Rose Gold'],
        priceModifier: 5,
      },
    ],
  },
  {
    id: 'paper-print-1',
    name: 'Paper Prints',
    description: 'Premium art prints on museum-quality paper',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop',
    basePrice: 15,
    category: 'paper',
    options: [
      {
        id: 'size',
        name: 'Size',
        values: ['5x7', '8x10', '11x14', '16x20'],
        priceModifier: 0,
      },
      {
        id: 'finish',
        name: 'Finish',
        values: ['Matte', 'Glossy', 'Fine Art'],
        priceModifier: 3,
      },
    ],
  },
  {
    id: 'canvas-print-1',
    name: 'Canvas Prints',
    description: 'Professional gallery-wrapped canvas',
    image: 'https://images.unsplash.com/photo-1551886287-f40a50c58a5d?w=400&h=400&fit=crop',
    basePrice: 45,
    category: 'canvas',
    options: [
      {
        id: 'size',
        name: 'Size',
        values: ['8x10', '12x16', '16x24', '20x30'],
        priceModifier: 0,
      },
      {
        id: 'frame',
        name: 'Frame Style',
        values: ['Gallery Wrap', 'Floating Frame', 'Wood Frame'],
        priceModifier: 10,
      },
    ],
  },
  {
    id: 'merchandise-tshirt',
    name: 'T-Shirt',
    description: 'Premium cotton t-shirt with custom print',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    basePrice: 8,
    category: 'merchandise',
    options: [
      {
        id: 'size',
        name: 'Size',
        values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        priceModifier: 0,
      },
      {
        id: 'color',
        name: 'Color',
        values: ['White', 'Black', 'Navy', 'Gray'],
        priceModifier: 2,
      },
    ],
  },
]

export const SOLANA_PRICE_USD = 200 // Example: 1 SOL = $200 USD
export const PLATFORM_FEE_PERCENT = 5 // 5% platform fee
export const MIN_ORDER_VALUE = 1 // Minimum $1 USD order

export const SOLANA_NETWORKS = {
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
}

// SPL Tokens for payment support
export const SUPPORTED_SPL_TOKENS = [
  {
    mint: 'EPjFWdd5Au17hunznKKt', // USDC on mainnet (example)
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin',
  },
  {
    mint: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // USDT (example)
    symbol: 'USDT',
    decimals: 6,
    name: 'Tether USDt',
  },
]
