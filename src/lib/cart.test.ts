import { describe, expect, it } from 'vitest'

import { clearCart, loadCart, saveCart, type StoredCartItem } from './cart'

describe('cart storage helpers', () => {
  it('returns an empty cart when nothing is stored', () => {
    expect(loadCart()).toEqual([])
  })

  it('round-trips stored cart items', () => {
    const items: StoredCartItem[] = [
      {
        product: {
          id: 'p-1',
          name: 'Istolo Tee',
          price: 22.5,
        },
        quantity: 2,
      },
    ]

    saveCart(items)

    expect(loadCart()).toEqual(items)
  })

  it('clears persisted cart items', () => {
    const items: StoredCartItem[] = [
      {
        product: {
          id: 'p-2',
          name: 'Passport NFC Tag',
          price: 9,
        },
        quantity: 1,
      },
    ]

    saveCart(items)
    clearCart()

    expect(loadCart()).toEqual([])
  })

  it('returns an empty cart if storage payload is malformed JSON', () => {
    window.localStorage.setItem('istolo:cart', '{bad-json')

    expect(loadCart()).toEqual([])
  })
})
