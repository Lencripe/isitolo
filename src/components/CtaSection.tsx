
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { ArrowRight } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="py-20 md:py-28 border-t border-border/50" id="about">
      <div className="container max-w-6xl px-4 mx-auto">
        <div className="border border-border/60 rounded-3xl p-8 md:p-16 bg-card/70">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-muted-foreground">For creators</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Launch Your Brand on Istolo
              </h2>
              <p className="text-lg text-muted-foreground">
                We provide the infrastructure for African designers to go global. Smart contracts, NFC chips, and a marketplace ready for your vision.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link to="/creator/collections">
                  <Button size="lg" className="gap-2 uppercase tracking-[0.25em] text-xs">
                    Apply as Creator <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="uppercase tracking-[0.25em] text-xs">
                  Read Documentation
                </Button>
              </div>
            </div>
            <div className="border border-border/60 rounded-2xl p-6 bg-background/60">
              <h3 className="text-2xl font-bold mb-3">Istolo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The first African Web3 fashion marketplace. Verify authenticity, own your style, and trade on-chain.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="uppercase tracking-[0.3em] text-xs">Marketplace</p>
                <div className="flex gap-4">
                  <Link to="/shop" className="hover:text-foreground transition">All Products</Link>
                  <Link to="/shop" className="hover:text-foreground transition">New Drops</Link>
                  <Link to="/creator/collections" className="hover:text-foreground transition">Creators</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
