
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { motion } from 'framer-motion'
import { HOME_PRODUCTS } from '../lib/home-products'

export function ProductsSection() {
  return (
    <section id="products" className="py-20 md:py-28 border-t border-border/50">
      <div className="container max-w-7xl px-4 mx-auto">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
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
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOME_PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 flex flex-col"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.07, ease: 'easeOut' }}
              whileHover={{ y: -8 }}
            >
              <div className="relative h-56 overflow-hidden">
                <motion.img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.35 }}
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
                  <Link to={`/products/${product.slug}`}>
                    <Button size="sm" className="uppercase tracking-[0.2em] text-[10px]">
                      View Product
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
