
const steps = [
  {
    number: '01',
    title: 'Buy with USDC',
    description: 'Connect your wallet and purchase exclusive fashion items using USDC on Solana. Fast, secure, and transparent.',
  },
  {
    number: '02',
    title: 'Tap to Verify',
    description: 'Receive your physical item. Locate the hidden NFC chip and tap your phone to verify authenticity on-chain.',
  },
  {
    number: '03',
    title: 'Own On-Chain',
    description: 'Mint your Digital Product Passport (NFT). Access exclusive content, events, and resale protection.',
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
            Own Your Style On-Chain
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three steps from checkout to verified ownership.
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
