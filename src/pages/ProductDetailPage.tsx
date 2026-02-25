import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { HOME_PRODUCTS } from '../lib/home-products'
import { Button } from '../components/Button'
import { Card } from '../components/Card'

export function ProductDetailPage() {
  const { slug } = useParams()
  const product = useMemo(() => HOME_PRODUCTS.find((item) => item.slug === slug), [slug])
  const [selectedImage, setSelectedImage] = useState(0)

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container max-w-5xl px-4 py-12 mx-auto">
          <Card>
            <div className="p-8 text-center space-y-4">
              <h1 className="text-3xl font-bold">Product not found</h1>
              <p className="text-muted-foreground">The product you selected is not available right now.</p>
              <Link to="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-6xl px-4 py-10 mx-auto space-y-8">
        <div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <div className="p-4 space-y-4">
              <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                <img
                  src={product.gallery[selectedImage]}
                  alt={`${product.name} preview ${selectedImage + 1}`}
                  className="w-full h-[460px] object-contain"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {product.gallery.map((image, index) => (
                  <button
                    key={`${product.id}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`overflow-hidden rounded-lg border ${selectedImage === index ? 'border-primary' : 'border-border/60'}`}
                  >
                    <img src={image} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-36 object-contain bg-muted/20" />
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-8 space-y-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{product.brand}</p>
              <h1 className="text-4xl font-bold">{product.name}</h1>
              <p className="text-3xl font-semibold text-primary">{product.price}</p>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="text-[10px] uppercase tracking-[0.25em] border border-border/60 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="pt-3">
                <Link to="/shop">
                  <Button size="lg" className="w-full uppercase tracking-[0.2em] text-xs">Buy in Shop</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
