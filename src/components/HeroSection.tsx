
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/50">
      <div className="absolute inset-0">
        <motion.img
          src="https://images.unsplash.com/photo-1742473716872-ff82599f90db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
          alt="Hero background"
          className="h-full w-full object-cover opacity-35"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.35 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>

      <div className="relative container max-w-7xl px-4 mx-auto py-24 md:py-32">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-end">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.p
              className="text-xs font-semibold uppercase tracking-[0.45em] text-muted-foreground"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              Infrastructure for verified merch
            </motion.p>
            <motion.h1
              className="text-6xl md:text-7xl font-bold leading-none font-display"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
            >
              MAKE. VERIFY. SELL. <span className="text-primary">ON-CHAIN.</span>
            </motion.h1>
            <motion.p
              className="text-lg text-muted-foreground max-w-xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
            >
              We power NFC-enabled apparel, digital product passports, and Solana Pay checkout for African creators and global brands.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
            >
              <Link to="/shop">
                <Button size="lg" className="gap-2 uppercase tracking-[0.25em] text-xs">
                  Explore Store <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="uppercase tracking-[0.25em] text-xs">
                Launch Your Merch
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-border/60 bg-card/80 overflow-hidden"
            initial={{ opacity: 0, x: 30, y: 12 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            whileHover={{ y: -6, scale: 1.01 }}
          >
            <div className="relative h-64">
              <img
                src="/featured-dammed-saint.jpg"
                alt="Dammed Saint"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Featured brand</p>
                <h2 className="text-3xl font-bold mt-2">Dammed Saint</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                NFC-verified collections with on-chain proof, community perks, and event access built in.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs uppercase tracking-[0.2em] border border-border/60 px-3 py-1 rounded-full">Digital Product Passport</span>
                <span className="text-xs uppercase tracking-[0.2em] border border-border/60 px-3 py-1 rounded-full">Solana Pay</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
