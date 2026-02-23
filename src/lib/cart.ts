const CART_STORAGE_KEY = 'istolo:cart'

export interface StoredCartProduct {
  id: string
  name: string
  price: number
  description?: string
  image?: string
  sourceCollectionId?: string
  sourceCollectionName?: string
  sourceItemId?: string
}

export interface StoredCartItem {
  product: StoredCartProduct
  quantity: number
}

export function loadCart(): StoredCartItem[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(CART_STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    return JSON.parse(raw) as StoredCartItem[]
  } catch {
    return []
  }
}

export function saveCart(items: StoredCartItem[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export function clearCart(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(CART_STORAGE_KEY)
}
