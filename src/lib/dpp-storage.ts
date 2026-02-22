import { SOLANA_CONFIG } from '../config/solana'
import type {
  DppStorageInfo,
  DppStorageMode,
  ProductPassportCertificate,
} from '../types/passport'

interface DppStorageInput {
  certificateId: string
  ownerAddress: string
  metadataJson: string
  metadataHash: string
  defaultMetadataUri: string
}

interface ArweaveUploadResult {
  metadataUri: string
  txId?: string
}

function resolveStorageMode(): DppStorageMode {
  return SOLANA_CONFIG.PASSPORT.DPP_STORAGE.MODE
}

function buildFallbackStorageInfo(
  mode: DppStorageMode,
  metadataUri: string,
  metadataHash: string,
  usedFallback = false
): DppStorageInfo {
  return {
    mode,
    metadataUri,
    metadataHash,
    usedFallback,
  }
}

async function uploadToArweave(input: DppStorageInput): Promise<ArweaveUploadResult | null> {
  const endpoint = SOLANA_CONFIG.PASSPORT.DPP_STORAGE.ARWEAVE_UPLOAD_ENDPOINT
  if (!endpoint) {
    return null
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      certificateId: input.certificateId,
      ownerAddress: input.ownerAddress,
      metadataHash: input.metadataHash,
      metadataJson: input.metadataJson,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Arweave upload failed: ${response.status} ${errorBody}`)
  }

  const result = (await response.json()) as {
    metadataUri?: string
    uri?: string
    arweaveTxId?: string
    txId?: string
  }

  const metadataUri = result.metadataUri || result.uri
  if (!metadataUri) {
    throw new Error('Arweave upload response missing metadataUri')
  }

  return {
    metadataUri,
    txId: result.arweaveTxId || result.txId,
  }
}

async function writeOnchainPointer(
  certificateId: string,
  ownerAddress: string,
  metadataUri: string,
  metadataHash: string
): Promise<string | undefined> {
  const endpoint = SOLANA_CONFIG.PASSPORT.DPP_STORAGE.ONCHAIN_POINTER_ENDPOINT
  if (!endpoint) {
    return undefined
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      certificateId,
      ownerAddress,
      metadataUri,
      metadataHash,
      pointerWallet: SOLANA_CONFIG.PASSPORT.DPP_STORAGE.ONCHAIN_POINTER_WALLET || undefined,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`On-chain pointer write failed: ${response.status} ${errorBody}`)
  }

  const result = (await response.json()) as {
    signature?: string
    txSignature?: string
    pointerTx?: string
  }

  return result.pointerTx || result.signature || result.txSignature
}

export async function persistDppStorage(input: DppStorageInput): Promise<DppStorageInfo> {
  const mode = resolveStorageMode()
  const strict = SOLANA_CONFIG.PASSPORT.DPP_STORAGE.STRICT_MODE

  if (mode === 'mock') {
    return buildFallbackStorageInfo('mock', input.defaultMetadataUri, input.metadataHash)
  }

  let metadataUri = input.defaultMetadataUri
  let arweaveTxId: string | undefined
  let usedFallback = false

  if (mode === 'arweave' || mode === 'hybrid') {
    try {
      const uploaded = await uploadToArweave(input)
      if (uploaded?.metadataUri) {
        metadataUri = uploaded.metadataUri
        arweaveTxId = uploaded.txId
      } else if (strict) {
        throw new Error('Arweave storage mode is enabled but no upload endpoint is configured')
      } else {
        usedFallback = true
      }
    } catch (error) {
      if (strict) {
        throw error
      }
      usedFallback = true
    }
  }

  let onchainPointerTx: string | undefined
  if (mode === 'onchain' || mode === 'hybrid') {
    try {
      onchainPointerTx = await writeOnchainPointer(
        input.certificateId,
        input.ownerAddress,
        metadataUri,
        input.metadataHash
      )
    } catch (error) {
      if (strict) {
        throw error
      }
      usedFallback = true
    }
  }

  return {
    mode,
    metadataUri,
    metadataHash: input.metadataHash,
    arweaveTxId,
    onchainPointerTx,
    usedFallback: usedFallback ? true : undefined,
  }
}

export function applyStorageToCertificate(
  certificate: Omit<ProductPassportCertificate, 'dppStorage'>,
  storage: DppStorageInfo
): ProductPassportCertificate {
  return {
    ...certificate,
    metadataUri: storage.metadataUri,
    metadataHash: storage.metadataHash,
    dppStorage: storage,
  }
}
