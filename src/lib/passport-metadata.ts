import type {
  PassportDppMetadata,
  PassportIssueInput,
  ProductPassportCertificate,
} from '../types/passport'
import { SOLANA_CONFIG } from '../config/solana'

async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto API not available in this environment')
  }

  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

function normalizeSku(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildPassportDppMetadata(input: PassportIssueInput): PassportDppMetadata {
  const primaryProduct = input.products[0]
  const sku = normalizeSku(primaryProduct?.id || 'UNKNOWN-PRODUCT')
  const batchId = `BATCH-${new Date().toISOString().slice(0, 10)}-${sku}`

  return {
    schemaVersion: '1.0.0',
    productId: primaryProduct?.id || 'unknown',
    productName: primaryProduct?.name || 'Unknown Product',
    sku,
    batchId,
    manufacturerName: SOLANA_CONFIG.PASSPORT.MANUFACTURER_NAME,
    countryOfOrigin: SOLANA_CONFIG.PASSPORT.COUNTRY_OF_ORIGIN,
    materials: SOLANA_CONFIG.PASSPORT.DEFAULT_MATERIALS,
    certifications: SOLANA_CONFIG.PASSPORT.DEFAULT_CERTIFICATIONS,
    repairabilityScore: SOLANA_CONFIG.PASSPORT.DEFAULT_REPAIRABILITY_SCORE,
    recycledContentPercent: SOLANA_CONFIG.PASSPORT.DEFAULT_RECYCLED_CONTENT_PERCENT,
    productionDate: new Date().toISOString(),
    paymentSignature: input.paymentSignature,
    issuedAt: new Date().toISOString(),
  }
}

export async function buildPassportMetadataBundle(input: PassportIssueInput): Promise<{
  metadataJson: string
  metadataHash: string
  metadataUri: string
  dpp: PassportDppMetadata
}> {
  const dpp = buildPassportDppMetadata(input)
  const certificateId = buildCertificateId(input.ownerAddress, input.paymentSignature)

  const metadataPayload = {
    name: `${dpp.productName} Digital Product Passport`,
    symbol: SOLANA_CONFIG.PASSPORT.NFT_SYMBOL,
    description: 'Digital product passport with traceability and sustainability metadata.',
    image: SOLANA_CONFIG.PASSPORT.DEFAULT_IMAGE,
    external_url: SOLANA_CONFIG.PASSPORT.PUBLIC_APP_URL,
    attributes: [
      { trait_type: 'schemaVersion', value: dpp.schemaVersion },
      { trait_type: 'productId', value: dpp.productId },
      { trait_type: 'sku', value: dpp.sku },
      { trait_type: 'batchId', value: dpp.batchId },
      { trait_type: 'manufacturerName', value: dpp.manufacturerName },
      { trait_type: 'countryOfOrigin', value: dpp.countryOfOrigin },
      { trait_type: 'repairabilityScore', value: dpp.repairabilityScore },
      { trait_type: 'recycledContentPercent', value: dpp.recycledContentPercent },
      { trait_type: 'paymentSignature', value: dpp.paymentSignature },
    ],
    properties: {
      category: 'image',
      files: [{ uri: SOLANA_CONFIG.PASSPORT.DEFAULT_IMAGE, type: 'image/png' }],
      dpp,
    },
  }

  const metadataJson = JSON.stringify(metadataPayload)
  const metadataHash = await sha256Hex(metadataJson)
  const baseUri = SOLANA_CONFIG.PASSPORT.METADATA_BASE_URI.replace(/\/+$/, '')
  const metadataUri = `${baseUri}/${certificateId}.json?h=${metadataHash.slice(0, 16)}`

  return { metadataJson, metadataHash, metadataUri, dpp }
}

export function buildCertificateId(ownerAddress: string, paymentSignature: string): string {
  const ownerPart = ownerAddress.slice(0, 6)
  const paymentPart = paymentSignature.slice(0, 10)
  const timestamp = Date.now().toString(36)
  return `CERT-${ownerPart}-${paymentPart}-${timestamp}`
}

export function buildPassportExplorerUrl(certificate: ProductPassportCertificate): string | null {
  if (!certificate.mintAddress) {
    return null
  }

  return `https://explorer.solana.com/address/${certificate.mintAddress}?cluster=${certificate.network}`
}
