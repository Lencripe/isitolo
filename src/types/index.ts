import { PublicKey } from '@solana/web3.js'

export interface Product {
  id: string
  name: string
  description: string
  image: string
  basePrice: number // in USD, will be converted to SOL
  category: 'metal' | 'paper' | 'canvas' | 'merchandise'
  options: ProductOption[]
}

export interface ProductOption {
  id: string
  name: string
  values: string[]
  priceModifier?: number // additional price in USD
}

export interface CartItem {
  productId: string
  product: Product
  quantity: number
  selectedOptions: Record<string, string>
  itemPrice: number // total price in USD for this item
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  totalPrice: number // in USD
  totalSOL?: number // converted SOL amount
  status: 'pending' | 'processing' | 'confirmed' | 'printing' | 'shipped' | 'delivered' | 'cancelled'
  paymentSignature?: string
  shippingAddress?: ShippingAddress
  createdAt: Date
  updatedAt: Date
}

export interface ShippingAddress {
  fullName: string
  email: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

export interface PaymentDetails {
  orderId: string
  amount: number // in USD
  amountSOL: number
  timestamp: number
  merchantPublicKey: PublicKey
  reference: PublicKey
}

export interface SPLTokenConfig {
  mint: PublicKey
  symbol: string
  decimals: number
  name: string
}

export type SolanaNetwork = 'devnet' | 'testnet' | 'mainnet-beta'

export type {
  PassportStatus,
  PassportMintStrategy,
  PassportIssuanceMethod,
  PassportProductSnapshot,
  PassportDppMetadata,
  ProductPassportCertificate,
  PassportIssueInput,
} from './passport'
