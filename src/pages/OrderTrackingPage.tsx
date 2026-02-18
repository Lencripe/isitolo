import { useParams } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { OrderDetails } from '@/components/OrderDetails'
import { useOrder } from '@/context/OrderContext'
import { AlertCircle } from 'lucide-react'

export function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { getOrderById } = useOrder()

  if (!orderId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container max-w-7xl px-4 mx-auto py-16">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            <h1 className="text-2xl font-bold">Order Not Found</h1>
            <p className="text-muted-foreground">Please check the order ID and try again</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const order = getOrderById(orderId)

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container max-w-7xl px-4 mx-auto py-16">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            <h1 className="text-2xl font-bold">Order Not Found</h1>
            <p className="text-muted-foreground">The order ID "{orderId}" does not exist</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-2xl px-4 mx-auto py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Order Tracking</h1>
          <p className="text-muted-foreground mt-2">Track your print order status</p>
        </div>

        <OrderDetails order={order} />
      </main>
      <Footer />
    </div>
  )
}
