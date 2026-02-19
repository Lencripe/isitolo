import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useWalletConnection } from '@solana/react-hooks'
import { Connection } from '@solana/web3.js'
import {
  createUSDCTransferTransaction,
  sendUSDCTransferTransaction,
  checkUSDCBalance,
} from '../lib/usdc-transfer'
import { issueProductPassport } from '../lib/passport-mint'
import { SOLANA_CONFIG } from '../config/solana'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import type { ProductPassportCertificate } from '../types/passport'

interface CartItem {
  product: {
    id: string
    name: string
    price: number
  }
  quantity: number
}

export function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { wallet, status } = useWalletConnection()
  const [loading, setLoading] = useState(false)
  const [txSignature, setTxSignature] = useState<string>('')
  const [passportCertificate, setPassportCertificate] = useState<ProductPassportCertificate | null>(null)
  const [error, setError] = useState<string>('')
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [checkingBalance, setCheckingBalance] = useState(false)

  const cart = (location.state?.cart as CartItem[]) || []

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }

  // Check wallet USDC balance when wallet connects
  useEffect(() => {
    if (wallet && status === 'connected') {
      checkBalance()
    }
  }, [wallet, status])

  const checkBalance = async () => {
    if (!wallet) return
    setCheckingBalance(true)
    try {
      const { balance } = await checkUSDCBalance(
        wallet.account.address.toString(),
        getTotalPrice()
      )
      setWalletBalance(balance)
    } catch (err) {
      console.error('Error checking balance:', err)
    } finally {
      setCheckingBalance(false)
    }
  }

  const handlePayment = async () => {
    if (!wallet || !wallet.signTransaction) {
      setError('Wallet does not support transaction signing')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Check if merchant wallet is configured
      if (!SOLANA_CONFIG.MERCHANT_WALLET || SOLANA_CONFIG.MERCHANT_WALLET.includes('PLACE_YOUR')) {
        throw new Error(
          'Merchant wallet not configured. Update MERCHANT_WALLET in src/config/solana.ts'
        )
      }

      // Create the USDC transfer transaction
      const transaction = await createUSDCTransferTransaction(
        wallet.account.address.toString(),
        getTotalPrice()
      )

      if (!transaction) {
        throw new Error('Failed to create transaction')
      }

      console.log('📝 Transaction created, waiting for wallet signature...')

      // Match the provider to the wallet that's actually connected
      // Check the v1.0 wallet address against available providers
      const v1Address = wallet.account.address.toString()
      let provider: any = null
      
      // Check all available wallet providers and match by public key
      const availableProviders = [
        { name: 'Backpack', provider: (window as any).backpack },
        { name: 'Phantom', provider: (window as any).solana },
        { name: 'Solflare', provider: (window as any).solflare },
        { name: 'Coinbase', provider: (window as any).coinbaseSolana },
      ]
      
      for (const { name, provider: p } of availableProviders) {
        if (p && p.publicKey) {
          const providerAddress = p.publicKey.toString()
          if (providerAddress === v1Address) {
            console.log(`✅ Matched provider: ${name}`)
            provider = p
            break
          }
        }
      }
      
      // If no match found, try to find any provider that supports signing
      if (!provider) {
        console.log('⚠️ No exact provider match, trying available providers...')
        for (const { name, provider: p } of availableProviders) {
          if (p && p.signTransaction) {
            console.log(`🔍 Attempting to use ${name}...`)
            provider = p
            break
          }
        }
      }
      
      if (!provider || !provider.signTransaction) {
        throw new Error('Wallet does not support transaction signing. Please use a different wallet.')
      }

      // Ensure the wallet provider is connected and authorized
      if (!provider.isConnected) {
        console.log('🔌 Requesting wallet provider connection...')
        try {
          await provider.connect()
        } catch (connectErr: any) {
          throw new Error(`Failed to connect to wallet: ${connectErr.message}`)
        }
      }

      // Verify the connected wallet matches our v1.0 wallet
      const providerPubkey = provider.publicKey?.toString()
      
      if (providerPubkey !== v1Address) {
        console.warn(`⚠️ Wallet mismatch: provider=${providerPubkey}, v1=${v1Address}`)
        // Try to reconnect
        await provider.connect()
      }

      // Sign the transaction using the matched wallet provider
      console.log('✍️ Requesting transaction signature from wallet...')
      const signedTransaction = await provider.signTransaction(transaction)

      console.log('✅ Transaction signed, sending to network...')

      // Send the signed transaction
      const connection = new Connection(SOLANA_CONFIG.RPC_ENDPOINT, 'confirmed')
      const signature = await sendUSDCTransferTransaction(
        connection,
        signedTransaction
      )

      setTxSignature(signature)
      console.log('✅ Payment successful:', signature)

      const certificate = await issueProductPassport({
        ownerAddress: wallet.account.address.toString(),
        paymentSignature: signature,
        totalUsdc: getTotalPrice(),
        products: cart.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          unitPriceUsdc: item.product.price,
        })),
      }, provider)

      setPassportCertificate(certificate)
      console.log('🪪 Product passport issued:', certificate.certificateId)

      // Navigate to success page after 2 seconds
      setTimeout(() => {
        navigate('/order-tracking', {
          state: { signature, total: getTotalPrice(), passportCertificate: certificate },
        })
      }, 2000)
    } catch (err: any) {
      console.error('❌ Payment error:', err)
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate('/shop')}>Go to Shop</Button>
        </Card>
      </div>
    )
  }

  const hasEnoughBalance = walletBalance !== null && walletBalance >= getTotalPrice()
  const canPay = status === 'connected' && wallet && !loading && !txSignature

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between items-center py-3 border-b dark:border-gray-700"
                >
                  <div>
                    <span className="font-semibold">{item.product.name}</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      x{item.quantity}
                    </span>
                  </div>
                  <span className="font-bold">
                    {item.product.price * item.quantity} USDC
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 text-xl font-bold">
                <span>Total:</span>
                <span className="text-purple-600 dark:text-purple-400">
                  {getTotalPrice()} USDC
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Payment</h2>

              {status !== 'connected' || !wallet ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Please connect your wallet to continue
                  </p>
                  <p className="text-sm text-gray-500">
                    Make sure you have {getTotalPrice()} USDC available on Devnet
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Connected Wallet:
                    </p>
                    <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                      {wallet.account.address.toString()}
                    </p>
                  </div>

                  {/* Balance Information */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        USDC Balance:
                      </p>
                      {checkingBalance ? (
                        <span className="text-sm text-gray-500">Checking...</span>
                      ) : walletBalance !== null ? (
                        <span className={`text-sm font-bold ${hasEnoughBalance ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {walletBalance.toFixed(2)} USDC
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </div>
                    {walletBalance !== null && !hasEnoughBalance && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Insufficient balance. Need {getTotalPrice()} USDC but have {walletBalance.toFixed(2)} USDC.
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                  )}

                  {txSignature && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                        ✅ Payment successful!
                      </p>
                      <a
                        href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-green-600 dark:text-green-400 underline break-all"
                      >
                        {txSignature}
                      </a>
                    </div>
                  )}

                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                      💡 <strong>Devnet USDC Payment</strong>
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Get Devnet USDC from{' '}
                      <a
                        href="https://spl-token-faucet.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold"
                      >
                        SPL Token Faucet
                      </a>
                      {' '}(select Devnet, USDC token)
                    </p>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={loading || !!txSignature || !canPay || (walletBalance !== null && !hasEnoughBalance)}
                    className="w-full"
                    size="lg"
                  >
                    {loading
                      ? 'Processing...'
                      : walletBalance !== null && !hasEnoughBalance
                        ? 'Insufficient Balance'
                        : `Pay ${getTotalPrice()} USDC`}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

                  {passportCertificate ? (
                    <p className="mt-3 text-xs text-green-700 dark:text-green-300">
                      Passport issued: {passportCertificate.certificateId}
                    </p>
                  ) : null}
    </div>
  )
}
