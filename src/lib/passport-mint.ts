import { SOLANA_CONFIG } from '../config/solana'
import type {
  PassportIssueInput,
  PassportMintStrategy,
  ProductPassportCertificate,
} from '../types/passport'
import {
  buildCertificateId,
  buildPassportMetadataBundle,
} from './passport-metadata'
import { persistDppStorage } from './dpp-storage'
import { buildVerificationMessage, encodeBase64 } from './verification'
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import {
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
} from '@metaplex-foundation/mpl-token-metadata'

const CERTIFICATE_STORAGE_KEY = 'istolo:lastProductPassport'

function buildDeterministicMintAddress(ownerAddress: string, paymentSignature: string): string {
  const seed = `${ownerAddress}:${paymentSignature}`
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let output = ''

  for (let index = 0; index < 44; index += 1) {
    const char = seed.charCodeAt(index % seed.length)
    output += alphabet[char % alphabet.length]
  }

  return output
}

interface SignerProvider {
  publicKey?: PublicKey | { toString: () => string }
  isConnected?: boolean
  connect?: () => Promise<unknown>
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  signMessage?: (message: Uint8Array) => Promise<Uint8Array | ArrayBuffer>
}

interface MintExecutionResult {
  mintAddress: string
  mintSignature: string
  issuanceMethod: 'direct' | 'candy_machine'
}

function persistCertificate(certificate: ProductPassportCertificate): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(CERTIFICATE_STORAGE_KEY, JSON.stringify(certificate))
}

export function getPersistedCertificate(): ProductPassportCertificate | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(CERTIFICATE_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as ProductPassportCertificate
  } catch {
    return null
  }
}

function getResolvedMintStrategy(): PassportMintStrategy {
  const strategy = SOLANA_CONFIG.PASSPORT.MINT_STRATEGY
  if (strategy !== 'auto') {
    return strategy
  }

  const candyMachine = SOLANA_CONFIG.PASSPORT.CANDY_MACHINE
  if (candyMachine.ENABLED && candyMachine.ID && candyMachine.MINT_ENDPOINT) {
    return 'candy_machine'
  }

  return 'direct'
}

async function issueWithDirectMint(
  input: PassportIssueInput,
  signerProvider: SignerProvider,
  metadataUri: string,
  dpp: ProductPassportCertificate['dpp']
): Promise<MintExecutionResult> {
  if (!signerProvider.signTransaction) {
    throw new Error('Wallet signer provider is required for direct mint strategy')
  }

  if (!signerProvider.isConnected && signerProvider.connect) {
    await signerProvider.connect()
  }

  const connection = new Connection(SOLANA_CONFIG.RPC_ENDPOINT, 'confirmed')
  const ownerPublicKey = new PublicKey(input.ownerAddress)
  const mintKeypair = Keypair.generate()

  const associatedTokenAddress = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    ownerPublicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )

  const [metadataPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  )

  const lamportsForMint = await connection.getMinimumBalanceForRentExemption(MINT_SIZE)
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')

  const onchainName = `${dpp.productName} Passport`.slice(0, 32)
  const onchainSymbol = SOLANA_CONFIG.PASSPORT.NFT_SYMBOL.slice(0, 10)
  const onchainUri = metadataUri.slice(0, 200)

  const mintTransaction = new Transaction()
  mintTransaction.add(
    SystemProgram.createAccount({
      fromPubkey: ownerPublicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports: lamportsForMint,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      0,
      ownerPublicKey,
      ownerPublicKey,
      TOKEN_PROGRAM_ID
    ),
    createAssociatedTokenAccountInstruction(
      ownerPublicKey,
      associatedTokenAddress,
      ownerPublicKey,
      mintKeypair.publicKey,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    ),
    createMintToInstruction(
      mintKeypair.publicKey,
      associatedTokenAddress,
      ownerPublicKey,
      1,
      [],
      TOKEN_PROGRAM_ID
    ),
    createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPda,
        mint: mintKeypair.publicKey,
        mintAuthority: ownerPublicKey,
        payer: ownerPublicKey,
        updateAuthority: ownerPublicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: onchainName,
            symbol: onchainSymbol,
            uri: onchainUri,
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
          },
          isMutable: true,
          collectionDetails: null,
        },
      }
    )
  )

  mintTransaction.feePayer = ownerPublicKey
  mintTransaction.recentBlockhash = blockhash
  mintTransaction.partialSign(mintKeypair)

  const signedTransaction = await signerProvider.signTransaction(mintTransaction)
  const txSignature = await connection.sendRawTransaction(signedTransaction.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  })

  const confirmation = await connection.confirmTransaction(
    {
      signature: txSignature,
      blockhash,
      lastValidBlockHeight,
    },
    'confirmed'
  )

  if (confirmation.value.err) {
    throw new Error(`Passport mint failed: ${JSON.stringify(confirmation.value.err)}`)
  }

  return {
    mintAddress: mintKeypair.publicKey.toBase58(),
    mintSignature: txSignature,
    issuanceMethod: 'direct',
  }
}

async function issueWithCandyMachine(
  input: PassportIssueInput,
  metadataUri: string,
  metadataHash: string,
  dpp: ProductPassportCertificate['dpp']
): Promise<MintExecutionResult> {
  const candyMachine = SOLANA_CONFIG.PASSPORT.CANDY_MACHINE

  if (!candyMachine.ENABLED || !candyMachine.ID || !candyMachine.MINT_ENDPOINT) {
    throw new Error(
      'Candy Machine strategy selected but not configured. Set PASSPORT.CANDY_MACHINE.ENABLED, ID and MINT_ENDPOINT in src/config/solana.ts'
    )
  }

  const response = await fetch(candyMachine.MINT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      candyMachineId: candyMachine.ID,
      dropLabel: candyMachine.LABEL,
      ownerAddress: input.ownerAddress,
      paymentSignature: input.paymentSignature,
      metadataUri,
      metadataHash,
      dpp,
      creatorCollection: input.creatorCollection ?? null,
      products: input.products,
      totalUsdc: input.totalUsdc,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Candy Machine mint request failed: ${response.status} ${errorBody}`)
  }

  const result = (await response.json()) as {
    mintAddress?: string
    mintSignature?: string
    signature?: string
    txSignature?: string
  }

  const mintAddress = result.mintAddress
  const mintSignature = result.mintSignature || result.signature || result.txSignature

  if (!mintAddress || !mintSignature) {
    throw new Error('Candy Machine mint response is missing mintAddress or mintSignature')
  }

  return {
    mintAddress,
    mintSignature,
    issuanceMethod: 'candy_machine',
  }
}

export async function issueProductPassport(
  input: PassportIssueInput,
  signerProvider?: SignerProvider | null
): Promise<ProductPassportCertificate> {
  const certificateId = buildCertificateId(input.ownerAddress, input.paymentSignature)
  const { metadataJson, metadataHash, metadataUri, dpp } = await buildPassportMetadataBundle(input)
  const storage = await persistDppStorage({
    certificateId,
    ownerAddress: input.ownerAddress,
    metadataJson,
    metadataHash,
    defaultMetadataUri: metadataUri,
  })

  let mintAddress: string | undefined
  let mintSignature: string | undefined
  let issuanceMethod: ProductPassportCertificate['issuanceMethod'] = 'offchain'

  const issuerPublicKey = signerProvider?.publicKey?.toString() || input.ownerAddress
  let issuerSignature: string | undefined
  if (signerProvider?.signMessage) {
    const message = buildVerificationMessage(certificateId, storage.metadataHash)
    const messageBytes = new TextEncoder().encode(message)
    const signed = await signerProvider.signMessage(messageBytes)
    const signatureBytes = signed instanceof Uint8Array ? signed : new Uint8Array(signed)
    issuerSignature = encodeBase64(signatureBytes)
  }

  if (SOLANA_CONFIG.PASSPORT.ENABLE_ONCHAIN_MINT) {
    if (!signerProvider || !signerProvider.signTransaction) {
      throw new Error('Wallet signer provider is required for on-chain passport minting')
    }

    const strategy = getResolvedMintStrategy()
    if (strategy === 'candy_machine') {
      try {
        const candyResult = await issueWithCandyMachine(
          input,
          storage.metadataUri,
          storage.metadataHash,
          dpp
        )
        mintAddress = candyResult.mintAddress
        mintSignature = candyResult.mintSignature
        issuanceMethod = candyResult.issuanceMethod
      } catch (error) {
        if (SOLANA_CONFIG.PASSPORT.MINT_STRATEGY === 'candy_machine') {
          throw error
        }

        const directResult = await issueWithDirectMint(input, signerProvider, storage.metadataUri, dpp)
        mintAddress = directResult.mintAddress
        mintSignature = directResult.mintSignature
        issuanceMethod = directResult.issuanceMethod
      }
    } else {
      const directResult = await issueWithDirectMint(input, signerProvider, storage.metadataUri, dpp)
      mintAddress = directResult.mintAddress
      mintSignature = directResult.mintSignature
      issuanceMethod = directResult.issuanceMethod
    }
  } else {
    mintAddress = buildDeterministicMintAddress(input.ownerAddress, input.paymentSignature)
    mintSignature = `mint_${input.paymentSignature.slice(0, 18)}`
    issuanceMethod = 'offchain'
  }

  const certificate: ProductPassportCertificate = {
    certificateId,
    status: 'issued',
    ownerAddress: input.ownerAddress,
    metadataUri: storage.metadataUri,
    metadataHash: storage.metadataHash,
    mintAddress,
    mintSignature,
    paymentSignature: input.paymentSignature,
    network: SOLANA_CONFIG.PASSPORT.NETWORK,
    issuedAt: new Date().toISOString(),
    issuanceMethod,
    dppStorage: storage,
    dpp,
    verification: {
      issuerPublicKey,
      issuerSignature,
    },
    rewards: input.rewards,
  }

  persistCertificate(certificate)
  return certificate
}
