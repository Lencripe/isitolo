import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import { SOLANA_CONFIG } from '../config/solana'

export type CreatorCollectionCategory = 'clothing' | 'printable_artworks'

export interface CreatorCollectionItem {
  id: string
  title: string
  sku: string
  basePriceUsdc: number
  maxSupply: number
}

export interface CreatorCollection {
  id: string
  name: string
  category: CreatorCollectionCategory
  description: string
  coverImageUrl: string
  royaltyBps: number
  createdAt: string
  items: CreatorCollectionItem[]
  authority?: string
}

export const CREATOR_COLLECTIONS_STORAGE_KEY = 'istolo:creatorCollections'

const CREATE_COLLECTION_DISCRIMINATOR = Buffer.from('9cfb5c36e9021052', 'hex')
const DELETE_COLLECTION_DISCRIMINATOR = Buffer.from('a87bf6008950f213', 'hex')
const COLLECTION_ACCOUNT_DISCRIMINATOR = Buffer.from('ac0d4a3beb1aa54b', 'hex')

interface CollectionSignerProvider {
  publicKey?: PublicKey | { toString: () => string }
  isConnected?: boolean
  connect?: () => Promise<unknown>
  signTransaction: (transaction: Transaction) => Promise<Transaction>
}

interface DecodedCollectionAccount {
  authority: string
  category: CreatorCollectionCategory
  collectionId: string
  metadataJson: string
  createdAt: number
}

function encodeString(value: string): Buffer {
  const bytes = Buffer.from(value, 'utf8')
  const length = Buffer.alloc(4)
  length.writeUInt32LE(bytes.length, 0)
  return Buffer.concat([length, bytes])
}

function decodeString(buffer: Buffer, offset: number): { value: string; nextOffset: number } {
  if (offset + 4 > buffer.length) {
    throw new Error('Invalid account data while decoding string length')
  }

  const length = buffer.readUInt32LE(offset)
  const start = offset + 4
  const end = start + length
  if (end > buffer.length) {
    throw new Error('Invalid account data while decoding string content')
  }

  return {
    value: buffer.slice(start, end).toString('utf8'),
    nextOffset: end,
  }
}

function resolveProgramId(): PublicKey | null {
  if (!SOLANA_CONFIG.COLLECTIONS.ENABLED) {
    return null
  }

  const configuredProgramId = SOLANA_CONFIG.COLLECTIONS.PROGRAM_ID.trim()
  if (!configuredProgramId) {
    return null
  }

  try {
    return new PublicKey(configuredProgramId)
  } catch {
    return null
  }
}

function categoryToCode(category: CreatorCollectionCategory): number {
  return category === 'clothing' ? 0 : 1
}

function codeToCategory(code: number): CreatorCollectionCategory {
  return code === 0 ? 'clothing' : 'printable_artworks'
}

function decodeCollectionAccount(data: Buffer): DecodedCollectionAccount | null {
  if (data.length < 8 + 32 + 1 + 1 + 8 + 8 + 4 + 4) {
    return null
  }

  if (!data.subarray(0, 8).equals(COLLECTION_ACCOUNT_DISCRIMINATOR)) {
    return null
  }

  let offset = 8
  const authority = new PublicKey(data.subarray(offset, offset + 32)).toBase58()
  offset += 32

  offset += 1 // bump
  const categoryCode = data.readUInt8(offset)
  offset += 1

  const createdAt = Number(data.readBigInt64LE(offset))
  offset += 8

  offset += 8 // updated_at

  const idDecoded = decodeString(data, offset)
  offset = idDecoded.nextOffset

  const metadataDecoded = decodeString(data, offset)

  return {
    authority,
    category: codeToCategory(categoryCode),
    collectionId: idDecoded.value,
    metadataJson: metadataDecoded.value,
    createdAt,
  }
}

function parseCollectionFromMetadata(decoded: DecodedCollectionAccount): CreatorCollection {
  const parsed = JSON.parse(decoded.metadataJson) as Partial<CreatorCollection>

  return {
    id: typeof parsed.id === 'string' && parsed.id ? parsed.id : decoded.collectionId,
    name: typeof parsed.name === 'string' ? parsed.name : 'Untitled Collection',
    category: parsed.category === 'printable_artworks' ? 'printable_artworks' : decoded.category,
    description: typeof parsed.description === 'string' ? parsed.description : '',
    coverImageUrl: typeof parsed.coverImageUrl === 'string' ? parsed.coverImageUrl : '',
    royaltyBps: typeof parsed.royaltyBps === 'number' ? parsed.royaltyBps : 500,
    createdAt:
      typeof parsed.createdAt === 'string' && parsed.createdAt
        ? parsed.createdAt
        : new Date(decoded.createdAt * 1000).toISOString(),
    items: Array.isArray(parsed.items) ? parsed.items : [],
    authority: decoded.authority,
  }
}

async function loadCreatorCollectionsOnchain(): Promise<CreatorCollection[]> {
  const programId = resolveProgramId()
  if (!programId) {
    return []
  }

  const connection = new Connection(SOLANA_CONFIG.RPC_ENDPOINT, 'confirmed')
  const accounts = await connection.getProgramAccounts(programId)

  const parsed = accounts
    .map((account) => decodeCollectionAccount(account.account.data))
    .filter((value): value is DecodedCollectionAccount => Boolean(value))
    .map((decoded) => parseCollectionFromMetadata(decoded))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))

  return parsed
}

export async function fetchCreatorCollections(): Promise<CreatorCollection[]> {
  try {
    const onchain = await loadCreatorCollectionsOnchain()
    if (onchain.length > 0) {
      saveCreatorCollections(onchain)
      return onchain
    }

    return loadCreatorCollections()
  } catch (error) {
    if (SOLANA_CONFIG.COLLECTIONS.FALLBACK_TO_LOCAL) {
      console.warn('Falling back to local collections storage:', error)
      return loadCreatorCollections()
    }
    throw error
  }
}

export async function createCreatorCollectionOnchain(input: {
  collection: CreatorCollection
  ownerAddress: string
  signerProvider: CollectionSignerProvider
}): Promise<{ signature: string }> {
  const programId = resolveProgramId()
  if (!programId) {
    throw new Error('On-chain collections are not configured. Set VITE_COLLECTIONS_PROGRAM_ID in your environment.')
  }

  if (!input.signerProvider.signTransaction) {
    throw new Error('Wallet signer provider is required to save collections on-chain.')
  }

  if (!input.signerProvider.isConnected && input.signerProvider.connect) {
    await input.signerProvider.connect()
  }

  const ownerPublicKey = new PublicKey(input.ownerAddress)
  const [collectionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('collection'), ownerPublicKey.toBuffer(), Buffer.from(input.collection.id, 'utf8')],
    programId
  )

  const metadataJson = JSON.stringify(input.collection)
  if (Buffer.byteLength(metadataJson, 'utf8') > 4096) {
    throw new Error('Collection metadata is too large for on-chain storage. Reduce description/image URL length or number of items.')
  }

  const instructionData = Buffer.concat([
    CREATE_COLLECTION_DISCRIMINATOR,
    encodeString(input.collection.id),
    Buffer.from([categoryToCode(input.collection.category)]),
    encodeString(metadataJson),
  ])

  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: ownerPublicKey, isSigner: true, isWritable: true },
      { pubkey: collectionPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: instructionData,
  })

  const connection = new Connection(SOLANA_CONFIG.RPC_ENDPOINT, 'confirmed')
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')

  const transaction = new Transaction()
  transaction.add(instruction)
  transaction.feePayer = ownerPublicKey
  transaction.recentBlockhash = blockhash

  const signedTransaction = await input.signerProvider.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  })

  const confirmation = await connection.confirmTransaction(
    {
      signature,
      blockhash,
      lastValidBlockHeight,
    },
    'confirmed'
  )

  if (confirmation.value.err) {
    throw new Error(`On-chain collection save failed: ${JSON.stringify(confirmation.value.err)}`)
  }

  return { signature }
}

export async function deleteCreatorCollectionOnchain(input: {
  collectionId: string
  ownerAddress: string
  signerProvider: CollectionSignerProvider
}): Promise<{ signature: string }> {
  const programId = resolveProgramId()
  if (!programId) {
    throw new Error('On-chain collections are not configured. Set VITE_COLLECTIONS_PROGRAM_ID in your environment.')
  }

  if (!input.signerProvider.signTransaction) {
    throw new Error('Wallet signer provider is required to remove collections on-chain.')
  }

  if (!input.signerProvider.isConnected && input.signerProvider.connect) {
    await input.signerProvider.connect()
  }

  const ownerPublicKey = new PublicKey(input.ownerAddress)
  const [collectionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('collection'), ownerPublicKey.toBuffer(), Buffer.from(input.collectionId, 'utf8')],
    programId
  )

  const instructionData = Buffer.concat([
    DELETE_COLLECTION_DISCRIMINATOR,
    encodeString(input.collectionId),
  ])

  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: ownerPublicKey, isSigner: true, isWritable: true },
      { pubkey: collectionPda, isSigner: false, isWritable: true },
    ],
    data: instructionData,
  })

  const connection = new Connection(SOLANA_CONFIG.RPC_ENDPOINT, 'confirmed')
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')

  const transaction = new Transaction()
  transaction.add(instruction)
  transaction.feePayer = ownerPublicKey
  transaction.recentBlockhash = blockhash

  const signedTransaction = await input.signerProvider.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  })

  const confirmation = await connection.confirmTransaction(
    {
      signature,
      blockhash,
      lastValidBlockHeight,
    },
    'confirmed'
  )

  if (confirmation.value.err) {
    throw new Error(`On-chain collection removal failed: ${JSON.stringify(confirmation.value.err)}`)
  }

  return { signature }
}

export function loadCreatorCollections(): CreatorCollection[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(CREATOR_COLLECTIONS_STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    return JSON.parse(raw) as CreatorCollection[]
  } catch {
    return []
  }
}

export function saveCreatorCollections(collections: CreatorCollection[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(CREATOR_COLLECTIONS_STORAGE_KEY, JSON.stringify(collections))
}
