import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import {
  fetchCreatorCollections,
  type CreatorCollection,
  type CreatorCollectionItem,
} from '../lib/creator-collections'
import { SHOP_PRODUCTS } from '../lib/shop-products'
import { loadCart, saveCart, type StoredCartItem } from '../lib/cart'
import {
  getDropMintStatsEventName,
  getMintedCountForItem,
  getRemainingSupply,
} from '../lib/drop-mint-stats'

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

const PRODUCTS: Product[] = SHOP_PRODUCTS

export function ShopPage() {
  const [cart, setCart] = useState<StoredCartItem[]>(() => loadCart())
  const [creatorCollections, setCreatorCollections] = useState<CreatorCollection[]>([])
  const [mintStatsVersion, setMintStatsVersion] = useState(0)

  useEffect(() => {
    saveCart(cart)
  }, [cart])

  useEffect(() => {
    let cancelled = false

    const hydrateCreatorCollections = async () => {
      const collections = await fetchCreatorCollections()
      if (!cancelled) {
        setCreatorCollections(collections)
      }
    }

    void hydrateCreatorCollections()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const eventName = getDropMintStatsEventName()
    const handleMintStatsUpdate = () => {
      setMintStatsVersion((value) => value + 1)
    }

    window.addEventListener(eventName, handleMintStatsUpdate)
    window.addEventListener('storage', handleMintStatsUpdate)
    return () => {
      window.removeEventListener(eventName, handleMintStatsUpdate)
      window.removeEventListener('storage', handleMintStatsUpdate)
    }
  }, [])

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
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">Shop</h1>
            <p className="text-muted-foreground">
              Pay with USDC on Solana Devnet
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground uppercase tracking-[0.2em]">
              {getTotalItems()} Items
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-primary/15 text-primary uppercase tracking-[0.2em]">
              {getTotalPrice()} USDC
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_360px] gap-8 items-start">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            {PRODUCTS.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 + index * 0.05 }}
                whileHover={{ y: -6 }}
              >
                <Card className="overflow-hidden h-full">
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.25 }}
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
              </motion.div>
            ))}
          </motion.div>

          <div className="lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              {cart.length > 0 ? (
                <motion.div
                  key="cart-full"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.28 }}
                >
                  <Card>
                    <div className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Cart</h2>
                      <div className="space-y-2 mb-4">
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
                      </div>
                      <div className="flex justify-between items-center pt-2 text-xl font-bold mb-4">
                        <span>Total:</span>
                        <span>{getTotalPrice()} USDC</span>
                      </div>
                      <Link to="/checkout" state={{ cart }} className="block">
                        <Button size="lg" className="w-full">
                          Checkout ({getTotalItems()} items)
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="cart-empty"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.28 }}
                >
                  <Card>
                    <div className="p-6 text-sm text-muted-foreground">
                      Your cart is empty. Add an item to preview checkout totals.
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-10" key={`mint-stats-${mintStatsVersion}`}>
          <motion.div
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold">Creator Drops</h2>
            <Link to="/creator/collections">
              <Button variant="outline" size="sm">Create Drop</Button>
            </Link>
          </motion.div>

          {creatorCollections.length === 0 ? (
            <Card>
              <div className="p-6 text-sm text-muted-foreground">
                No creator drops available yet. Create a collection in Creator Studio to sell clothing or printable artwork drops.
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {creatorCollections.map((collection, collectionIndex) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, delay: collectionIndex * 0.06 }}
                >
                  <Card>
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
                      {collection.items.map((item, itemIndex) => (
                        (() => {
                          const minted = getMintedCountForItem(item.id)
                          const remaining = getRemainingSupply(item.id, item.maxSupply)
                          const isSoldOut = remaining === 0

                          return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 14 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{ duration: 0.28, delay: itemIndex * 0.04 }}
                          whileHover={{ y: -4 }}
                        >
                          <Card className="bg-muted/40">
                          <div className="p-4">
                            <h4 className="font-semibold mb-1">{item.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{item.sku}</p>
                            <p className="text-xs text-muted-foreground mb-1">Minted: {minted} / {item.maxSupply}</p>
                            <p className="text-xs text-muted-foreground mb-3">Left: {remaining}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary">
                                {item.basePriceUsdc} USDC
                              </span>
                              <Button size="sm" onClick={() => addDropItemToCart(collection, item)} disabled={isSoldOut}>
                                {isSoldOut ? 'Sold Out' : 'Buy Drop'}
                              </Button>
                            </div>
                          </div>
                          </Card>
                        </motion.div>
                          )
                        })()
                      ))}
                    </div>
                  </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
