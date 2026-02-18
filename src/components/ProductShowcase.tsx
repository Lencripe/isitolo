import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '@/types'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { useOrder } from '@/context/OrderContext'
import { ShoppingCart, Check } from 'lucide-react'

interface ProductShowcaseProps {
  products?: Product[]
}

export function ProductShowcase({ products = [] }: ProductShowcaseProps) {
  const navigate = useNavigate()
  const { addToCart } = useOrder()
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, Record<string, string>>>({})
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set())

  const handleOptionChange = (productId: string, optionId: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [optionId]: value,
      },
    }))
  }

  const handleAddToCart = (product: Product) => {
    const options = selectedOptions[product.id] || {}

    // Validate all required options are selected
    const missingOptions = product.options.filter((opt) => !options[opt.id])
    if (missingOptions.length > 0) {
      alert(`Please select: ${missingOptions.map((o) => o.name).join(', ')}`)
      return
    }

    addToCart(product.id, 1, options)

    // Show confirmation
    setAddedToCart((prev) => new Set(prev).add(product.id))
    setTimeout(() => {
      setAddedToCart((prev) => {
        const next = new Set(prev)
        next.delete(product.id)
        return next
      })
    }, 2000)
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedProduct(product.id)}
          >
            <div className="relative h-48 overflow-hidden bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            <CardHeader className="flex-1">
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {selectedProduct === product.id ? (
                <div className="space-y-3">
                  {product.options.map((option) => (
                    <div key={option.id}>
                      <label className="block text-xs font-semibold mb-1">{option.name}</label>
                      <select
                        value={selectedOptions[product.id]?.[option.id] || ''}
                        onChange={(e) => handleOptionChange(product.id, option.id, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select {option.name}</option>
                        {option.values.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-lg font-bold text-primary">From ${product.basePrice}</p>

                {selectedProduct === product.id ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToCart(product)
                    }}
                    className="w-full"
                    variant={addedToCart.has(product.id) ? 'default' : 'default'}
                  >
                    {addedToCart.has(product.id) ? (
                      <>
                        <Check className="w-4 h-4 mr-1" /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-1" /> Add to Cart
                      </>
                    )}
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" onClick={(e) => e.stopPropagation()}>
                    Customize
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          onClick={() => navigate('/checkout')}
          size="lg"
          className="gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Go to Checkout
        </Button>
      </div>
    </div>
  )
}
