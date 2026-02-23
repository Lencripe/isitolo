
import { Link } from 'react-router-dom'
import { Button } from './Button'

const products = [
  {
    id: 1,
    name: 'Void Walker Hoodie',
    brand: 'Dammed Saint',
    price: '$180',
    image: 'https://images.unsplash.com/photo-1649962843028-54905316eb21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    tags: ['NFT', 'NFC'],
  },
  {
    id: 2,
    name: 'Origin Oversized Tee',
    brand: 'Dammed Saint',
    price: '$85',
    image: 'https://images.unsplash.com/photo-1562135291-7728cc647783?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    tags: ['NFT'],
  },
  {
    id: 3,
    name: 'Shadow Cap',
    brand: 'Dammed Saint',
    price: '$60',
    image: 'https://images.unsplash.com/photo-1742473716872-ff82599f90db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    tags: ['NFC'],
  },
  {
    id: 4,
    name: 'Kente Bomber',
    brand: 'Afrofuture',
    price: '$240',
    image: 'https://images.unsplash.com/photo-1660695828374-4ff51ac9df5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    tags: ['NFT', 'NFC'],
  },
]

export function ProductsSection() {
  return (
    <section id="products" className="py-20 md:py-28 border-t border-border/50">
      <div className="container max-w-7xl px-4 mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-muted-foreground">Latest drops</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Drops, merch, and verified NFC gear.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              From community tees to premium drops, every item can carry an on-chain passport.
            </p>
          </div>
          <Link to="/shop">
            <Button variant="outline" size="lg" className="uppercase tracking-[0.25em] text-xs">
              View All
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 flex flex-col">
              <div className="relative h-56 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>
              <div className="p-5 flex-1 flex flex-col gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{product.brand}</p>
                  <h3 className="text-2xl font-bold mt-2">{product.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="text-[10px] uppercase tracking-[0.25em] border border-border/60 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary">{product.price}</span>
                  <Link to="/shop">
                    <Button size="sm" className="uppercase tracking-[0.2em] text-[10px]">
                      View Product
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
