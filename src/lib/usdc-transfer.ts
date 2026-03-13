/**
 * USDC Payment Transfer Utilities
 * 
 * Handles the actual USDC token transfers on Solana Devnet
 */

import {
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token'
import { SOLANA_CONFIG, validateMerchantWallet } from '../config/solana'

/**
 * Create a USDC transfer transaction
 * 
 * @param payerAddress - The wallet address sending USDC
 * @param amount - Amount in USDC (will be converted to smallest unit using decimals)
 * @returns Transaction object ready to be signed
 */
export async function createUSDCTransferTransaction(
  payerAddress: string,
  amount: number,
  recipientWalletAddress: string = SOLANA_CONFIG.MERCHANT_WALLET
): Promise<Transaction | null> {
  // Validate merchant wallet is configured
  if (!validateMerchantWallet()) {
    throw new Error(`Merchant wallet not configured. Update src/config/solana.ts  ${SOLANA_CONFIG.MERCHANT_WALLET}`)
  }

  try {
    const connection = new Connection(SOLANA_CONFIG.RPC_ENDPOINT, 'confirmed')
    
    const payerPublicKey = new PublicKey(payerAddress)
    const merchantPublicKey = new PublicKey(recipientWalletAddress)
    const usdcMintPublicKey = new PublicKey(SOLANA_CONFIG.USDC_MINT)

    // Get the sender's USDC Associated Token Account (ATA)
    const senderATA = await getAssociatedTokenAddress(
      usdcMintPublicKey,
      payerPublicKey,
      false, // allowOwnerOffCurve
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    // Get the merchant's USDC Associated Token Account (ATA)
    const merchantATA = await getAssociatedTokenAddress(
      usdcMintPublicKey,
      merchantPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    // Check if merchant's ATA exists
    const merchantATAInfo = await connection.getAccountInfo(merchantATA)
    
    // Create the transaction
    const transaction = new Transaction()

    // If merchant's ATA doesn't exist, create it
    // (This instruction is paid by the payer)
    if (!merchantATAInfo) {
      const createATAInstruction = createAssociatedTokenAccountInstruction(
        payerPublicKey, // payer of the creation fee
        merchantATA,    // token account to create
        merchantPublicKey, // owner of the token account
        usdcMintPublicKey, // USDC token mint
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
      transaction.add(createATAInstruction)
    }

    // Convert amount to smallest unit (USDC has 6 decimals)
    // e.g., 100 USDC = 100 * 10^6 = 100,000,000
    const amountInSmallestUnit = Math.floor(amount * Math.pow(10, SOLANA_CONFIG.USDC_DECIMALS))

    // Create the transfer instruction
    const transferInstruction = createTransferInstruction(
      senderATA,           // from token account
      merchantATA,         // to token account
      payerPublicKey,      // owner of from account (signer)
      amountInSmallestUnit // amount in smallest unit
    )
    transaction.add(transferInstruction)

    // Get recent blockhash for transaction
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = payerPublicKey

    return transaction
  } catch (error) {
    console.error('Error creating USDC transfer transaction:', error)
    throw error
  }
}

/**
 * Send a signed USDC transfer transaction to the network
 * 
 * @param connection - Solana connection
 * @param signedTransaction - Transaction signed by the user's wallet
 * @returns Transaction signature if successful
 */
export async function sendUSDCTransferTransaction(
  connection: Connection,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signedTransaction: any
): Promise<string> {
  try {
    // Convert to Uint8Array if needed (works in browser)
    let txBytes: Uint8Array
    
    if (signedTransaction instanceof Uint8Array) {
      txBytes = signedTransaction
    } else if (signedTransaction.serialize && typeof signedTransaction.serialize === 'function') {
      // web3.js Transaction object
      const serialized = signedTransaction.serialize()
      txBytes = serialized instanceof Uint8Array ? serialized : new Uint8Array(serialized)
    } else if (typeof signedTransaction === 'object' && signedTransaction.messageBytes) {
      // framework-kit transaction object
      txBytes = signedTransaction.messageBytes
    } else {
      throw new Error('Invalid transaction format for sending')
    }

    // Send the raw transaction
    const signature = await connection.sendRawTransaction(txBytes, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    })

    console.log(`📤 Transaction sent: ${signature}`)

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash: (await connection.getLatestBlockhash()).blockhash,
      lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
    })

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`)
    }

    console.log(`✅ Transaction confirmed: ${signature}`)
    return signature
  } catch (error) {
    console.error('Error sending USDC transfer transaction:', error)
    throw error
  }
}

/**
 * Check if a wallet has enough USDC balance
 * 
 * @param walletAddress - Wallet address to check
 * @param requiredAmount - Required USDC amount
 * @returns Balance info and whether wallet has enough
 */
export async function checkUSDCBalance(
  walletAddress: string,
  requiredAmount: number
): Promise<{ balance: number; hasEnough: boolean }> {
  try {
    const connection = new Connection(SOLANA_CONFIG.RPC_ENDPOINT, 'confirmed')
    
    const walletPublicKey = new PublicKey(walletAddress)
    const usdcMintPublicKey = new PublicKey(SOLANA_CONFIG.USDC_MINT)

    const tokenAccount = await getAssociatedTokenAddress(
      usdcMintPublicKey,
      walletPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const accountInfo = await connection.getTokenAccountBalance(tokenAccount)
    const balance = accountInfo.value.uiAmount || 0

    return {
      balance,
      hasEnough: balance >= requiredAmount,
    }
  } catch (error) {
    console.error('Error checking USDC balance:', error)
    // If account doesn't exist, return 0 balance
    return { balance: 0, hasEnough: false }
  }
}
