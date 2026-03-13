import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { CartItem, Order, ShippingAddress } from '@/types'
import { PRODUCTS, SOLANA_PRICE_USD, PLATFORM_FEE_PERCENT } from '@/lib/constants'

interface OrderContextType {
  cart: CartItem[]
  orders: Order[]
  addToCart: (productId: string, quantity: number, selectedOptions: Record<string, string>) => void
  removeFromCart: (productId: string) => void
  updateCartItemQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartTotalSOL: () => number
  createOrder: (shippingAddress: ShippingAddress) => Order
  updateOrderStatus: (orderId: string, status: Order['status']) => void
  getOrderById: (orderId: string) => Order | undefined
  getAllOrders: () => Order[]
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  const calculateItemPrice = useCallback(
    (productId: string, selectedOptions: Record<string, string>): number => {
      const product = PRODUCTS.find((p) => p.id === productId)
      if (!product) return 0

      let price = product.basePrice
      product.options.forEach((option) => {
        const selectedValue = selectedOptions[option.id]
        if (selectedValue && option.priceModifier) {
          price += option.priceModifier
        }
      })

      return price
    },
    []
  )

  const addToCart = useCallback(
    (productId: string, quantity: number, selectedOptions: Record<string, string>) => {
      setCart((prevCart) => {
        const product = PRODUCTS.find((p) => p.id === productId)
        if (!product) return prevCart

        const existingItem = prevCart.find((item) => item.productId === productId)
        const itemPrice = calculateItemPrice(productId, selectedOptions)

        if (existingItem) {
          return prevCart.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  selectedOptions,
                  itemPrice: itemPrice * (item.quantity + quantity),
                }
              : item
          )
        }

        return [
          ...prevCart,
          {
            productId,
            product,
            quantity,
            selectedOptions,
            itemPrice: itemPrice * quantity,
          },
        ]
      })
    },
    [calculateItemPrice]
  )

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId))
  }, [])

  const updateCartItemQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.productId === productId) {
          const itemPrice = calculateItemPrice(productId, item.selectedOptions)
          return {
            ...item,
            quantity,
            itemPrice: itemPrice * quantity,
          }
        }
        return item
      })
    )
  }, [removeFromCart, calculateItemPrice])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const getCartTotal = useCallback((): number => {
    return cart.reduce((total, item) => total + item.itemPrice, 0)
  }, [cart])

  const getCartTotalSOL = useCallback((): number => {
    const usdTotal = getCartTotal()
    const totalWithFee = usdTotal * (1 + PLATFORM_FEE_PERCENT / 100)
    return totalWithFee / SOLANA_PRICE_USD
  }, [getCartTotal])

  const createOrder = useCallback(
    (shippingAddress: ShippingAddress): Order => {
      const order: Order = {
        id: `order_${Date.now()}`,
        userId: '', // Will be set to wallet address
        items: [...cart],
        totalPrice: getCartTotal(),
        totalSOL: getCartTotalSOL(),
        status: 'pending',
        shippingAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setOrders((prevOrders) => [...prevOrders, order])
      clearCart()
      return order
    },
    [cart, getCartTotal, getCartTotalSOL, clearCart]
  )

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              updatedAt: new Date(),
            }
          : order
      )
    )
  }, [])

  const getOrderById = useCallback(
    (orderId: string): Order | undefined => {
      return orders.find((order) => order.id === orderId)
    },
    [orders]
  )

  const getAllOrders = useCallback((): Order[] => {
    return orders
  }, [orders])

  const value: OrderContextType = {
    cart,
    orders,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    getCartTotalSOL,
    createOrder,
    updateOrderStatus,
    getOrderById,
    getAllOrders,
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOrder() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}
