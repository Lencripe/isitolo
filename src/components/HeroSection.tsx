
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/50">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1742473716872-ff82599f90db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
          alt="Hero background"
          className="h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>

      <div className="relative container max-w-7xl px-4 mx-auto py-24 md:py-32">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-end">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-muted-foreground">
              Infrastructure for verified merch
            </p>
            <h1 className="text-6xl md:text-7xl font-bold leading-none font-display">
              MAKE. VERIFY. SELL. <span className="text-primary">ON-CHAIN.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              We power NFC-enabled apparel, digital product passports, and Solana Pay checkout for African creators and global brands.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/shop">
                <Button size="lg" className="gap-2 uppercase tracking-[0.25em] text-xs">
                  Explore Store <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="uppercase tracking-[0.25em] text-xs">
                Launch Your Merch
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/80 overflow-hidden">
            <div className="relative h-64">
              <img
                src="https://images.unsplash.com/photo-1649962843028-54905316eb21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
                alt="Dammed Saint"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Featured brand</p>
                <h2 className="text-3xl font-bold mt-2">Nkosi</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                NFC-verified collections with on-chain proof, community perks, and event access built in.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs uppercase tracking-[0.2em] border border-border/60 px-3 py-1 rounded-full">Digital Product Passport</span>
                <span className="text-xs uppercase tracking-[0.2em] border border-border/60 px-3 py-1 rounded-full">Solana Pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
