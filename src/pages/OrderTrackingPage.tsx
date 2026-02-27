import { useEffect, useReducer } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { ProductPassportCard } from '../components/ProductPassportCard'
import type { ProductPassportCertificate } from '../types/passport'
import { getPersistedCertificate } from '../lib/passport-mint'
import { clearCart as clearStoredCart } from '../lib/cart'
import {
  autoReleaseExpiredEscrowOrder,
  confirmEscrowOrderReceipt,
  getEscrowOrderById,
  getEscrowOrderBySignature,
  openEscrowDispute,
} from '../lib/escrow'


export function OrderTrackingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const signature = location.state?.signature as string
  const total = location.state?.total as number
  const escrowOrderId = location.state?.escrowOrderId as string | undefined
  const stateCertificate = location.state?.passportCertificate as ProductPassportCertificate | undefined
  const persistedCertificate = getPersistedCertificate()
  const passportCertificate = stateCertificate ?? persistedCertificate
  const [, triggerRefresh] = useReducer((value: number) => value + 1, 0)

  useEffect(() => {
    if (!signature) {
      return
    }

    clearStoredCart()
  }, [signature])



  const escrowOrder = (() => {
    const byId = escrowOrderId ? getEscrowOrderById(escrowOrderId) : null
    if (byId) {
      return byId
    }
    if (signature) {
      return getEscrowOrderBySignature(signature)
    }
    return null
  })()

  const refreshEscrowOrder = () => triggerRefresh()

  const handleConfirmReceipt = () => {
    if (!escrowOrder) return
    confirmEscrowOrderReceipt(escrowOrder.id)
    refreshEscrowOrder()
  }

  const handleOpenDispute = () => {
    if (!escrowOrder) return
    const reason = window.prompt('Please describe the issue with your order:')
    if (!reason) return
    openEscrowDispute(escrowOrder.id, reason)
    refreshEscrowOrder()
  }

  const handleTimeoutReleaseCheck = () => {
    if (!escrowOrder) return
    autoReleaseExpiredEscrowOrder(escrowOrder.id)
    refreshEscrowOrder()
  }

  if (!signature) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No order found</h2>
          <Button onClick={() => navigate('/shop')}>Go to Shop</Button>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="text-6xl mb-4"
              initial={{ scale: 0.8, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              🎉
            </motion.div>
            <motion.h1
              className="text-4xl font-bold mb-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
            >
              Order Confirmed!
            </motion.h1>
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.14 }}
            >
              Your payment has been processed successfully
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Payment Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-bold">{total} USDC</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Network:</span>
                    <span className="font-semibold">Solana Devnet</span>
                  </div>
                  <div className="py-2">
                    <span className="text-muted-foreground block mb-2">
                      Transaction ID:
                    </span>
                    {signature.startsWith('demo_') ? (
                      <span className="font-mono text-sm text-primary break-all">
                        {signature} (Demo Mode)
                      </span>
                    ) : (
                      <a
                        href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-primary break-all hover:underline"
                      >
                        {signature}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <p className="text-sm text-emerald-200">
                  ✅ Your USDC payment is confirmed and currently held in escrow until release conditions are met.
                </p>
              </div>

              <AnimatePresence>
                {escrowOrder ? (
                  <motion.div
                    className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28 }}
                  >
                    <p className="text-sm font-semibold mb-2">Escrow Status</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Order ID: <span className="font-mono text-foreground break-all">{escrowOrder.id}</span></p>
                      <p>Status: <span className="font-semibold text-foreground">{escrowOrder.status.replace(/_/g, ' ')}</span></p>
                      <p>Release timeout: {new Date(escrowOrder.releaseAt).toLocaleString()}</p>
                      <p>Dispute window ends: {new Date(escrowOrder.disputeWindowEndsAt).toLocaleString()}</p>
                      {escrowOrder.disputeReason ? <p>Dispute reason: {escrowOrder.disputeReason}</p> : null}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        onClick={handleConfirmReceipt}
                        size="sm"
                        disabled={escrowOrder.status === 'released' || escrowOrder.status === 'refunded'}
                      >
                        Confirm Received
                      </Button>
                      <Button
                        onClick={handleOpenDispute}
                        variant="outline"
                        size="sm"
                        disabled={escrowOrder.status === 'released' || escrowOrder.status === 'refunded'}
                      >
                        Open Dispute
                      </Button>
                      <Button
                        onClick={handleTimeoutReleaseCheck}
                        variant="secondary"
                        size="sm"
                        disabled={escrowOrder.status === 'released' || escrowOrder.status === 'refunded'}
                      >
                        Check Timeout Release
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <motion.div
                className="flex gap-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.18 }}
              >
                <Button onClick={() => navigate('/shop')} className="flex-1">
                  Continue Shopping
                </Button>
                <Button
                  onClick={() => window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank')}
                  variant="outline"
                  className="flex-1"
                >
                  View on Explorer
                </Button>
              </motion.div>
            </div>
          </Card>
          </motion.div>

          <AnimatePresence>
            {passportCertificate ? (
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.12 }}
              >
                <ProductPassportCard certificate={passportCertificate} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
