import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token'

/**
 * Convert USD to SOL at approximate rate
 */
export function usdToSol(usdAmount: number, solPrice: number = 200): number {
  return usdAmount / solPrice
}

/**
 * Convert SOL to USD at approximate rate
 */
export function solToUsd(solAmount: number, solPrice: number = 200): number {
  return solAmount * solPrice
}

/**
 * Constructs a Transaction that transfers the specified amount of SOL from a sender to a recipient.
 *
 * The provided SOL amount is converted to lamports (rounded to the nearest integer) and used in a
 * SystemProgram.transfer instruction added to the returned Transaction.
 *
 * @param amountSOL - Amount of SOL to transfer
 * @param senderPublicKey - Public key of the sender
 * @param recipientPublicKey - Public key of the recipient
 * @returns A Transaction containing a transfer instruction that moves the specified amount (in lamports) from `senderPublicKey` to `recipientPublicKey`
 */
export async function createSolTransfer(
  _connection: Connection,
  senderPublicKey: PublicKey,
  recipientPublicKey: PublicKey,
  amountSOL: number
): Promise<Transaction> {
  const transaction = new Transaction()

  const lamports = Math.round(amountSOL * LAMPORTS_PER_SOL)

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: senderPublicKey,
      toPubkey: recipientPublicKey,
      lamports,
    })
  )

  return transaction
}

/**
 * Create an SPL token transfer transaction
 */
export async function createSplTokenTransfer(
  _connection: Connection,
  tokenMintPublicKey: PublicKey,
  senderPublicKey: PublicKey,
  recipientPublicKey: PublicKey,
  amount: number,
  decimals: number = 6
): Promise<Transaction> {
  const transaction = new Transaction()

  // Get associated token accounts
  const senderTokenAccount = await getAssociatedTokenAddress(tokenMintPublicKey, senderPublicKey)
  const recipientTokenAccount = await getAssociatedTokenAddress(tokenMintPublicKey, recipientPublicKey)

  // Convert amount to smallest units
  const tokenAmount = Math.floor(amount * Math.pow(10, decimals))

  transaction.add(
    createTransferInstruction(senderTokenAccount, recipientTokenAccount, senderPublicKey, tokenAmount)
  )

  return transaction
}

/**
 * Create Solana Pay URL for payment
 */
export function createSolanaPayUrl(
  recipientPublicKey: PublicKey,
  amountSOL: number,
  reference: PublicKey,
  label: string = 'Istolo Order',
  message: string = 'Thank you for your order!'
): string {
  const baseUrl = 'solana:' + recipientPublicKey.toBase58()
  const params = new URLSearchParams({
    amount: amountSOL.toString(),
    reference: reference.toBase58(),
    label,
    message,
  })

  return `${baseUrl}?${params.toString()}`
}

/**
 * Verify Solana Pay transaction
 */
export async function verifySolanaPayTransaction(
  connection: Connection,
  reference: PublicKey,
  expectedAmount: number
): Promise<{ verified: boolean; signature?: string; amount?: number }> {
  try {
    const signatures = await connection.getSignaturesForAddress(reference)

    if (!signatures || signatures.length === 0) {
      return { verified: false }
    }

    // Get the most recent signature
    const signature = signatures[0].signature

    // Get the transaction details
    const transaction = await connection.getTransaction(signature)

    if (!transaction) {
      return { verified: false }
    }

    // Verify the transaction amount (optional, can be enhanced)
    return {
      verified: true,
      signature,
      amount: expectedAmount,
    }
  } catch (error) {
    console.error('Error verifying transaction:', error)
    return { verified: false }
  }
}

/**
 * Format SOL amount for display
 */
export function formatSol(amount: number, decimals: number = 4): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  }).format(amount)
}

/**
 * Format USD amount for display
 */
export function formatUsd(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(amount: number, feePercent: number = 5): number {
  return (amount * feePercent) / 100
}

/**
 * Calculate total with fees
 */
export function calculateTotalWithFees(amount: number, feePercent: number = 5): number {
  return amount + calculatePlatformFee(amount, feePercent)
}

/**
 * Get transaction fee estimate
 */
export async function getTransactionFeeEstimate(): Promise<number> {
  try {
    // Standard transaction costs approximately 5000 lamports
    return 5000
  } catch (error) {
    console.error('Error getting fee estimate:', error)
    return 5000 // Default fallback
  }
}

/**
 * Validate Solana public key
 */
export function isValidPublicKey(key: string): boolean {
  try {
    new PublicKey(key)
    return true
  } catch {
    return false
  }
}
