import type { Order } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { CheckCircle, Clock, Printer, Truck, Package } from 'lucide-react'
import { formatUsd } from '@/lib/payment-utils'

interface OrderStatusBadgeProps {
  status: Order['status']
}

function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig = {
    pending: { color: 'bg-yellow-500/15 text-yellow-200', label: 'Pending Payment' },
    processing: { color: 'bg-blue-500/15 text-blue-200', label: 'Processing' },
    confirmed: { color: 'bg-emerald-500/15 text-emerald-200', label: 'Confirmed' },
    printing: { color: 'bg-primary/15 text-primary', label: 'Printing' },
    shipped: { color: 'bg-indigo-500/15 text-indigo-200', label: 'Shipped' },
    delivered: { color: 'bg-emerald-500/15 text-emerald-200', label: 'Delivered' },
    cancelled: { color: 'bg-rose-500/15 text-rose-200', label: 'Cancelled' },
  }

  const config = statusConfig[status]

  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>{config.label}</span>
}

interface OrderTimelineProps {
  status: Order['status']
}

function OrderTimeline({ status }: OrderTimelineProps) {
  const steps: Array<{
    key: Order['status']
    label: string
    icon: React.ReactNode
  }> = [
    { key: 'pending', label: 'Payment Pending', icon: <Clock className="w-5 h-5" /> },
    { key: 'processing', label: 'Processing', icon: <Clock className="w-5 h-5" /> },
    { key: 'confirmed', label: 'Order Confirmed', icon: <CheckCircle className="w-5 h-5" /> },
    { key: 'printing', label: 'Printing', icon: <Printer className="w-5 h-5" /> },
    { key: 'shipped', label: 'Shipped', icon: <Truck className="w-5 h-5" /> },
    { key: 'delivered', label: 'Delivered', icon: <Package className="w-5 h-5" /> },
  ]

  const statusOrder = ['pending', 'processing', 'confirmed', 'printing', 'shipped', 'delivered']
  const currentIndex = statusOrder.indexOf(status)

  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const isCompleted = currentIndex >= index
        const isCurrent = currentIndex === index

        return (
          <div key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.icon}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-1 flex-1 mt-2 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} style={{ minHeight: '60px' }} />
              )}
            </div>
            <div className="py-2">
              <p className={`font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </p>
              {isCurrent && <p className="text-sm text-primary">In progress</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface OrderDetailsProps {
  order: Order
}

export function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Order {order.id}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTimeline status={order.status} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between pb-4 border-b border-border last:border-0">
                <div>
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">{formatUsd(item.itemPrice)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          {order.shippingAddress && (
            <>
              <p className="font-semibold">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="text-muted-foreground">{order.shippingAddress.email}</p>
              <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatUsd(order.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee</span>
              <span>{formatUsd((order.totalPrice * 5) / 100)}</span>
            </div>
            <div className="border-t border-primary/10 pt-2 mt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <div className="text-right">
                <div>{formatUsd(order.totalPrice * 1.05)}</div>
                {order.totalSOL && <div className="text-sm text-primary">{order.totalSOL.toFixed(4)} SOL</div>}
              </div>
            </div>
          </div>
          {order.paymentSignature && (
            <div className="mt-4 p-3 bg-background rounded border border-border">
              <p className="text-xs text-muted-foreground">Transaction ID</p>
              <p className="text-xs font-mono text-primary break-all">{order.paymentSignature}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
