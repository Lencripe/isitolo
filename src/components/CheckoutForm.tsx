import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useOrder } from '@/context/OrderContext'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { formatUsd } from '@/lib/payment-utils'
import type { ShippingAddress } from '@/types'
import { AlertCircle } from 'lucide-react'

interface CheckoutFormProps {
  onPaymentSuccess?: (orderId: string) => void
  onPaymentError?: (error: string) => void
}

/**
 * Checkout form that collects shipping information, displays an order summary, and processes a simulated Solana payment flow.
 *
 * @param onPaymentSuccess - Optional callback invoked with the created order id when payment is confirmed.
 * @param onPaymentError - Optional callback invoked with an error message when validation or payment processing fails.
 * @returns The checkout form JSX element.
 */
export function CheckoutForm({ onPaymentSuccess, onPaymentError }: CheckoutFormProps) {
  const { publicKey } = useWallet()
  const { cart, createOrder, updateOrderStatus, getCartTotal, getCartTotalSOL } = useOrder()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = (): boolean => {
    if (!publicKey) {
      onPaymentError?.('Please connect your Solana wallet')
      return false
    }

    if (cart.length === 0) {
      onPaymentError?.('Your cart is empty')
      return false
    }

    if (!formData.fullName || !formData.email || !formData.street || !formData.city || !formData.zipCode) {
      onPaymentError?.('Please fill in all required fields')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      onPaymentError?.('Please enter a valid email address')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsProcessing(true)

    try {
      // Create order with the wallet address as userId
      const order = createOrder(formData, publicKey!.toBase58())

      // Here you would integrate with actual Solana Pay
      // For now, we'll simulate the payment
      console.log('Order created:', order)
      console.log('Amount to pay:', getCartTotalSOL(), 'SOL')

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In production, verify payment here
      const paymentSignature = `tx_${Date.now()}_mock`
      updateOrderStatus(order.id, 'confirmed', paymentSignature)

      onPaymentSuccess?.(order.id)
    } catch (error) {
      console.error('Payment error:', error)
      onPaymentError?.(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Street Address *</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">State/Province</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">ZIP Code *</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country *</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatUsd(getCartTotal())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee (5%)</span>
              <span>{formatUsd((getCartTotal() * 5) / 100)}</span>
            </div>
            <div className="border-t border-primary/10 pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <div className="text-right">
                <div>{formatUsd(getCartTotal() * 1.05)}</div>
                <div className="text-sm text-primary">{getCartTotalSOL().toFixed(4)} SOL</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!publicKey && (
        <div className="flex items-center gap-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <p className="text-sm text-amber-600">Please connect your Solana wallet to proceed with payment</p>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isProcessing || !publicKey || cart.length === 0}>
        {isProcessing ? 'Processing Payment...' : `Pay ${getCartTotalSOL().toFixed(4)} SOL`}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        By clicking Pay, you agree to our Terms of Service and understand the payment will be processed on the Solana
        blockchain.
      </p>
    </form>
  )
}
