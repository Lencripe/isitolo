export type EscrowOrderStatus =
  | 'created'
  | 'funded_in_escrow'
  | 'shipped'
  | 'delivered'
  | 'released'
  | 'disputed'
  | 'refunded'

export interface EscrowOrderProduct {
  id: string
  name: string
  quantity: number
  unitPriceUsdc: number
}

export interface EscrowOrder {
  id: string
  buyerWallet: string
  merchantWallet: string
  escrowVaultWallet: string
  amountUsdc: number
  paymentSignature?: string
  status: EscrowOrderStatus
  disputeReason?: string
  createdAt: string
  updatedAt: string
  releaseAt: string
  disputeWindowEndsAt: string
  products: EscrowOrderProduct[]
}
