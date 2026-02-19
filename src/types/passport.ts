export type PassportStatus = 'issued' | 'pending' | 'failed'
export type PassportMintStrategy = 'direct' | 'candy_machine' | 'auto'
export type PassportIssuanceMethod = 'direct' | 'candy_machine' | 'offchain'

export interface PassportProductSnapshot {
  id: string
  name: string
  quantity: number
  unitPriceUsdc: number
}

export interface PassportDppMetadata {
  schemaVersion: '1.0.0'
  productId: string
  productName: string
  sku: string
  batchId: string
  manufacturerName: string
  countryOfOrigin: string
  materials: string[]
  certifications: string[]
  repairabilityScore: number
  recycledContentPercent: number
  productionDate: string
  paymentSignature: string
  issuedAt: string
}

export interface ProductPassportCertificate {
  certificateId: string
  status: PassportStatus
  ownerAddress: string
  metadataUri: string
  metadataHash: string
  mintAddress?: string
  mintSignature?: string
  paymentSignature: string
  network: 'devnet' | 'testnet' | 'mainnet-beta'
  issuedAt: string
  issuanceMethod: PassportIssuanceMethod
  dpp: PassportDppMetadata
}

export interface PassportIssueInput {
  ownerAddress: string
  paymentSignature: string
  products: PassportProductSnapshot[]
  totalUsdc: number
  creatorCollection?: {
    id: string
    name: string
    category: 'clothing' | 'printable_artworks'
    royaltyBps: number
    itemIds: string[]
  }
}
