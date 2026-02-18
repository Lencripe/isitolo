import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CartSummary } from '@/components/CartSummary'
import { CheckoutForm } from '@/components/CheckoutForm'
import { useOrder } from '@/context/OrderContext'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/Button'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { cart } = useOrder()
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [successOrderId, setSuccessOrderId] = useState('')

  const handlePaymentSuccess = (orderId: string) => {
    setPaymentStatus('success')
    setSuccessOrderId(orderId)
  }

  const handlePaymentError = (error: string) => {
    setPaymentStatus('error')
    setErrorMessage(error)
  }

  if (cart.length === 0 && paymentStatus === 'idle') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container max-w-7xl px-4 mx-auto py-16">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
            <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
            <p className="text-muted-foreground">Add some items to continue shopping</p>
            <Button onClick={() => navigate('/')}>Continue Shopping</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container max-w-7xl px-4 mx-auto py-16">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Payment Successful!</h1>
              <p className="text-muted-foreground">
                Your order has been confirmed. We'll start printing your artwork right away.
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono text-lg break-all">{successOrderId}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              You'll receive an email confirmation shortly with tracking information.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => navigate(`/order/${successOrderId}`)}
                className="w-full"
              >
                Track Your Order
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-7xl px-4 mx-auto py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Checkout</h1>
          <p className="text-muted-foreground mt-2">Complete your order and pay with Solana</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <CheckoutForm
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>

          <div>
            <CartSummary />
          </div>
        </div>

        {paymentStatus === 'error' && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Payment Error</p>
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
