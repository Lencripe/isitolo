
import { Button } from './Button'
import { ArrowRight } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="py-20 md:py-28 border-t border-border">
      <div className="container max-w-4xl px-4 mx-auto">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-border rounded-2xl p-8 md:p-16 text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Ready to Start Printing?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of creators using Istolo to sell custom prints powered by Solana blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="gap-2">
              Sign Up Free <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg">
              View Pricing
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            No credit card required. Connect your Solana wallet to get started.
          </p>
        </div>
      </div>
    </section>
  )
}
