import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ProductShowcase } from '@/components/ProductShowcase'
import { PRODUCTS } from '@/lib/constants'
import { Button } from '@/components/Button'
import { useNavigate } from 'react-router-dom'

export function ShopPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-7xl px-4 mx-auto py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Shop Our Products</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Choose from premium print options and customize your order. All prices displayed are in USD and will be
            converted to SOL at checkout.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <Button variant="outline">All Products</Button>
            <Button variant="outline">Metal Prints</Button>
            <Button variant="outline">Paper Prints</Button>
            <Button variant="outline">Canvas</Button>
            <Button variant="outline">Merchandise</Button>
          </div>
        </div>

        <ProductShowcase products={PRODUCTS} />

        <div className="mt-20 p-8 bg-primary/5 border border-primary/20 rounded-lg text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground">
            Add items to your cart and proceed to checkout. We accept payments in Solana!
          </p>
          <Button onClick={() => navigate('/checkout')} size="lg">
            View Cart & Checkout
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
