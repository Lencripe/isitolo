import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import {
  loadCreatorCollections,
  type CreatorCollection,
  type CreatorCollectionItem,
} from '../lib/creator-collections'
import { loadCart, saveCart, type StoredCartItem } from '../lib/cart'

interface Product {
  id: string
  name: string
  description: string
  price: number // Price in USDC
  image: string
  sourceCollectionId?: string
  sourceCollectionName?: string
  sourceItemId?: string
}

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium T-Shirt',
    description: 'High-quality cotton t-shirt with custom design',
    price: 25,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
  },
  {
    id: '2',
    name: 'Hoodie',
    description: 'Comfortable hoodie perfect for any weather',
    price: 45,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
  },
  {
    id: '3',
    name: 'Cap',
    description: 'Stylish cap with embroidered logo',
    price: 15,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
  },
  {
    id: '4',
    name: 'Backpack',
    description: 'Durable backpack with multiple compartments',
    price: 60,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
  },
]

export function ShopPage() {
  const [cart, setCart] = useState<StoredCartItem[]>(() => loadCart())
  const [creatorCollections, setCreatorCollections] = useState<CreatorCollection[]>([])

  useEffect(() => {
    setCreatorCollections(loadCreatorCollections())
  }, [])

  useEffect(() => {
    saveCart(cart)
  }, [cart])

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const addDropItemToCart = (collection: CreatorCollection, item: CreatorCollectionItem) => {
    const dropProduct: Product = {
      id: `drop-${collection.id}-${item.id}`,
      name: `${item.title} (${collection.name})`,
      description: collection.description,
      price: item.basePriceUsdc,
      image: collection.coverImageUrl || 'https://placehold.co/600x400/png?text=Drop+Item',
      sourceCollectionId: collection.id,
      sourceCollectionName: collection.name,
      sourceItemId: item.id,
    }

    addToCart(dropProduct)
  }

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Shop</h1>
            <p className="text-muted-foreground">
              Pay with USDC on Solana Devnet
            </p>
          </div>
          
          {cart.length > 0 && (
            <Link to="/checkout" state={{ cart }}>
              <Button size="lg">
                Checkout ({getTotalItems()} items - {getTotalPrice()} USDC)
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">
                    {product.price} USDC
                  </span>
                  <Button onClick={() => addToCart(product)} size="sm">
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="mt-8">
            <Card>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Cart</h2>
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between items-center py-2 border-b border-border"
                  >
                    <div>
                      <span className="font-semibold">{item.product.name}</span>
                      <span className="text-muted-foreground ml-2">
                        x{item.quantity}
                      </span>
                    </div>
                    <span className="font-bold">
                      {item.product.price * item.quantity} USDC
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 text-xl font-bold">
                  <span>Total:</span>
                  <span>{getTotalPrice()} USDC</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Creator Drops</h2>
            <Link to="/creator/collections">
              <Button variant="outline" size="sm">Create Drop</Button>
            </Link>
          </div>

          {creatorCollections.length === 0 ? (
            <Card>
              <div className="p-6 text-sm text-muted-foreground">
                No creator drops available yet. Create a collection in Creator Studio to sell clothing or printable artwork drops.
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {creatorCollections.map((collection) => (
                <Card key={collection.id}>
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{collection.name}</h3>
                        <p className="text-sm text-muted-foreground">{collection.description}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-primary/15 text-primary">
                        {collection.category === 'clothing' ? 'Clothing Drop' : 'Printable Artwork Drop'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {collection.items.map((item) => (
                        <Card key={item.id} className="bg-muted/40">
                          <div className="p-4">
                            <h4 className="font-semibold mb-1">{item.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{item.sku}</p>
                            <p className="text-xs text-muted-foreground mb-3">Max supply: {item.maxSupply}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary">
                                {item.basePriceUsdc} USDC
                              </span>
                              <Button size="sm" onClick={() => addDropItemToCart(collection, item)}>
                                Buy Drop
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
