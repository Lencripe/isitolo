import { Trash2, Plus, Minus } from 'lucide-react'
import { useOrder } from '@/context/OrderContext'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { formatUsd } from '@/lib/payment-utils'

export function CartSummary() {
  const { cart, removeFromCart, updateCartItemQuantity, getCartTotal, getCartTotalSOL } = useOrder()

  if (cart.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Your cart is empty</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cart.map(item => (
          <div key={item.productId} className="flex items-start justify-between pb-4 border-b border-border">
            <div className="flex-1">
              <p className="font-semibold">{item.product.name}</p>
              <p className="text-sm text-muted-foreground">
                {Object.entries(item.selectedOptions).map(([_key, value]) => `${value}`).join(', ')}
              </p>
              <p className="text-sm font-medium mt-1">{formatUsd(item.itemPrice)}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFromCart(item.productId)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="space-y-2 pt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatUsd(getCartTotal())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform Fee (5%)</span>
            <span>{formatUsd((getCartTotal() * 5) / 100)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
            <span>Total</span>
            <span>{formatUsd(getCartTotal() * 1.05)}</span>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Pay with Solana:</p>
            <p className="text-xl font-bold text-primary">{getCartTotalSOL().toFixed(4)} SOL</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
