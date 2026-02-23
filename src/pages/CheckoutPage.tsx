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
import { loadCreatorCollections, type CreatorCollection } from '../lib/creator-collections'
import { loadCart, saveCart, type StoredCartItem } from '../lib/cart'
import {
  applyRewardsForPurchase,
  calculateRedeemablePoints,
  calculateRewardsDiscount,
  getRewardsBalance,
} from '../lib/rewards'

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
  const [creatorCollections, setCreatorCollections] = useState<CreatorCollection[]>([])
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('')
  const [rewardsBalance, setRewardsBalance] = useState(0)
  const [redeemRewards, setRedeemRewards] = useState(false)

  const navigationCart = location.state?.cart as StoredCartItem[] | undefined
  const initialCart = navigationCart && navigationCart.length > 0 ? navigationCart : loadCart()
  const [cartItems, setCartItems] = useState<StoredCartItem[]>(initialCart)
  const cartCollectionId = cartItems.find((item) => item.product.sourceCollectionId)?.product.sourceCollectionId

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }

  const handleRemoveItem = (productId: string) => {
    setCartItems((items) => items.filter((item) => item.product.id !== productId))
  }

  // Check wallet USDC balance when wallet connects
  useEffect(() => {
    if (wallet && status === 'connected') {
      checkBalance()
      const rewards = getRewardsBalance(wallet.account.address.toString())
      setRewardsBalance(rewards.points)
    }
  }, [wallet, status])

  useEffect(() => {
    const collections = loadCreatorCollections()
    setCreatorCollections(collections)
    if (collections.length > 0) {
      const preferred = cartCollectionId
        ? collections.find((collection) => collection.id === cartCollectionId)
        : undefined
      setSelectedCollectionId(preferred?.id || collections[0].id)
    }
  }, [cartCollectionId])

  useEffect(() => {
    saveCart(cartItems)
  }, [cartItems])

  const checkBalance = async () => {
    if (!wallet) return
    setCheckingBalance(true)
    try {
      const { balance } = await checkUSDCBalance(
        wallet.account.address.toString(),
        getPayableTotal()
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
      const payableTotal = getPayableTotal()
      const transaction = await createUSDCTransferTransaction(
        wallet.account.address.toString(),
        payableTotal
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

      const selectedCollection = creatorCollections.find((collection) => collection.id === selectedCollectionId)

      if (SOLANA_CONFIG.PASSPORT.MINT_STRATEGY !== 'direct' && creatorCollections.length > 0 && !selectedCollection) {
        throw new Error('Please select a creator collection for drop minting.')
      }

      const baseTotal = getTotalPrice()
      const pointsToRedeem = redeemRewards && SOLANA_CONFIG.REWARDS.ENABLED
        ? calculateRedeemablePoints(baseTotal, rewardsBalance)
        : 0
      const rewardsSnapshot = SOLANA_CONFIG.REWARDS.ENABLED
        ? applyRewardsForPurchase(wallet.account.address.toString(), baseTotal, pointsToRedeem)
        : undefined
      if (rewardsSnapshot) {
        setRewardsBalance(rewardsSnapshot.balanceAfter)
      }

      const certificate = await issueProductPassport({
        ownerAddress: wallet.account.address.toString(),
        paymentSignature: signature,
        totalUsdc: payableTotal,
        products: cartItems.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          unitPriceUsdc: item.product.price,
        })),
        rewards: rewardsSnapshot,
        creatorCollection: selectedCollection
          ? {
              id: selectedCollection.id,
              name: selectedCollection.name,
              category: selectedCollection.category,
              royaltyBps: selectedCollection.royaltyBps,
              itemIds: selectedCollection.items.map((item) => item.id),
            }
          : undefined,
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate('/shop')}>Go to Shop</Button>
        </Card>
      </div>
    )
  }

  const getRedeemablePoints = () => calculateRedeemablePoints(getTotalPrice(), rewardsBalance)
  const getRewardsDiscount = () =>
    redeemRewards && SOLANA_CONFIG.REWARDS.ENABLED
      ? calculateRewardsDiscount(getRedeemablePoints())
      : 0
  const getPayableTotal = () => Math.max(0, getTotalPrice() - getRewardsDiscount())

  const hasEnoughBalance = walletBalance !== null && walletBalance >= getPayableTotal()
  const canPay = status === 'connected' && wallet && !loading && !txSignature

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between items-center py-3 border-b border-border"
                >
                  <div>
                    <span className="font-semibold">{item.product.name}</span>
                    <span className="text-muted-foreground ml-2">
                      x{item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">
                      {item.product.price * item.quantity} USDC
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="text-xs text-rose-300 hover:text-rose-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {SOLANA_CONFIG.REWARDS.ENABLED ? (
                <div className="mt-4 rounded-lg border border-border/60 bg-muted/40 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rewards balance:</span>
                    <span className="font-semibold">{rewardsBalance} pts</span>
                  </div>
                  <div className="mt-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Redeem points</p>
                      <p className="text-xs text-muted-foreground">
                        Use up to {getRedeemablePoints()} pts for this order.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRedeemRewards((value) => !value)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        redeemRewards ? 'border-emerald-400 text-emerald-300' : 'border-border text-muted-foreground'
                      }`}
                    >
                      {redeemRewards ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold">{getTotalPrice()} USDC</span>
                </div>
                {redeemRewards && SOLANA_CONFIG.REWARDS.ENABLED ? (
                  <div className="flex justify-between text-emerald-300">
                    <span>Rewards discount:</span>
                    <span>-{getRewardsDiscount().toFixed(2)} USDC</span>
                  </div>
                ) : null}
                <div className="flex justify-between items-center pt-2 text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-primary">
                    {getPayableTotal().toFixed(2)} USDC
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Payment</h2>

              {status !== 'connected' || !wallet ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Please connect your wallet to continue
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Make sure you have {getPayableTotal().toFixed(2)} USDC available on Devnet
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      Connected Wallet:
                    </p>
                    <p className="font-mono text-sm bg-muted/70 border border-border/60 p-2 rounded break-all">
                      {wallet.account.address.toString()}
                    </p>
                  </div>

                  {/* Balance Information */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-muted-foreground">
                        USDC Balance:
                      </p>
                      {checkingBalance ? (
                        <span className="text-sm text-muted-foreground">Checking...</span>
                      ) : walletBalance !== null ? (
                        <span className={`text-sm font-bold ${hasEnoughBalance ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {walletBalance.toFixed(2)} USDC
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                    {walletBalance !== null && !hasEnoughBalance && (
                      <p className="text-xs text-rose-400">
                        Insufficient balance. Need {getPayableTotal().toFixed(2)} USDC but have {walletBalance.toFixed(2)} USDC.
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                      <p className="text-sm text-rose-200">{error}</p>
                    </div>
                  )}

                  {txSignature && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <p className="text-sm text-emerald-200 mb-2">
                        ✅ Payment successful!
                      </p>
                      <a
                        href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-emerald-300 underline break-all"
                      >
                        {txSignature}
                      </a>
                    </div>
                  )}

                  <div className="mb-6 p-4 bg-muted/60 border border-border/60 rounded-lg">
                    <p className="text-sm text-foreground mb-2">
                      💡 <strong>Devnet USDC Payment</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Get Devnet USDC from{' '}
                      <a
                        href="https://spl-token-faucet.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold text-primary"
                      >
                        SPL Token Faucet
                      </a>
                      {' '}(select Devnet, USDC token)
                    </p>
                  </div>

                  {SOLANA_CONFIG.PASSPORT.MINT_STRATEGY !== 'direct' ? (
                    <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                      <p className="text-sm text-primary-foreground mb-2">
                        🎨 <strong>Drop Collection</strong>
                      </p>
                      {creatorCollections.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No creator collections found. Create one in Creator Studio to attach drop data to Candy Machine mint requests.
                        </p>
                      ) : (
                        <div>
                          {cartCollectionId ? (
                            <p className="text-xs text-muted-foreground mb-2">
                              Drop collection detected from cart and preselected for minting.
                            </p>
                          ) : null}
                          <label className="block text-xs text-muted-foreground mb-1">
                            Select creator collection
                          </label>
                          <select
                            value={selectedCollectionId}
                            onChange={(event) => setSelectedCollectionId(event.target.value)}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                          >
                            {creatorCollections.map((collection) => (
                              <option key={collection.id} value={collection.id}>
                                {collection.name} ({collection.category === 'clothing' ? 'Clothing' : 'Printable Artworks'})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ) : null}

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
                        : `Pay ${getPayableTotal().toFixed(2)} USDC`}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

                  {passportCertificate ? (
                    <p className="mt-3 text-xs text-emerald-300">
                      Passport issued: {passportCertificate.certificateId}
                    </p>
                  ) : null}
    </div>
  )
}
