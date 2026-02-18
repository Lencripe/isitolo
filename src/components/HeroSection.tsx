
import { Button } from './Button'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="container max-w-7xl px-4 mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-primary font-semibold text-sm">Welcome to Istolo</p>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                Print Your Art <span className="text-primary">On Demand</span>
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-lg">
              Create stunning metal and paper prints of your artwork. Built on Solana blockchain for secure, transparent payments. Your creative vision, our production excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="gap-2">
                Start Creating <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg">
                View Gallery
              </Button>
            </div>
          </div>
          
          <div className="relative h-96 md:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent rounded-2xl" />
            <img 
              src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=600&fit=crop"
              alt="Sample artwork"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-20 pt-20 border-t border-border">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by creators worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold">10K+</p>
              <p className="text-sm text-muted-foreground">Creators</p>
            </div>
            <div>
              <p className="text-3xl font-bold">50K+</p>
              <p className="text-sm text-muted-foreground">Prints Sold</p>
            </div>
            <div>
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm text-muted-foreground">Solana Powered</p>
            </div>
            <div>
              <p className="text-3xl font-bold">&lt;1min</p>
              <p className="text-sm text-muted-foreground">Payment Time</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
