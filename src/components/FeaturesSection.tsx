
const steps = [
  {
    number: '01',
    title: 'Create the Drop',
    description: 'Print verified apparel, embed NFC chips, and link each item to a Digital Product Passport on-chain.',
  },
  {
    number: '02',
    title: 'Sell with Solana Pay',
    description: 'Accept USDC at checkout for standard or NFC items. Enable payouts, royalties, and merch storefronts.',
  },
  {
    number: '03',
    title: 'Unlock Access',
    description: 'Tap to verify, collect rewards, and access ticketed events or drops with on-chain ownership proof.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 border-t border-border/50">
      <div className="container max-w-7xl px-4 mx-auto">
        <div className="text-center space-y-4 mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-muted-foreground">
            How it works
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Verified Merch, Built for Community
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From NFC verification to event tickets and resale royalties.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="border border-border/60 bg-card/70 rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-primary">{step.number}</p>
              <h3 className="text-2xl font-bold mt-4 mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
